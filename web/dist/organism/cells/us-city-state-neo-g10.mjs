// us-city-state-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"us-city-state-neo-g10","class":"us-city-state","generation":10,"lane":"neo","grownFrom":["name the state where Melbourne lies","in what state is the city Arden-Arcade","name the state where Castro Valley lies","which US state is Carmel in","which US state is Farmington Hills in","in what state is the city Antioch","name the state where Tyler lies","in what state is the city Hendersonville","which US state is Carson in","which US state is Denver in","in what state is the city St. Joseph","which US state is Milford in","which US state is Boynton Beach in","name the state where Dearborn lies","in what state is the city Oakland Park","which US state is Hammond in","name the state where Schaumburg lies","which US state is Lawton in","in what state is the city Springdale","in what state is the city Pensacola"],"version":1});

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
knowLoad([{"id":"corpora-us-cities","columns":["US city","state"],"n":1000,"cols":[{"f":"0New York|0Los Angeles|0Chicago|0Houston|0Philadelphia|2oenix|0Jacksonville|0Indianapolis|0Columbus|1harlotte|0Detroit|0Seattle|0Denver|0Boston|0Memphis|0Baltimore|0Portland|0Oklahoma City|0Las Vegas|1ouisville/Jefferson County|0Milwaukee|0Albuquerque|0Kansas City|0Atlanta|0Virginia Beach|0Omaha|0Minneapolis|0Cleveland|0Wichita|0Arlington|0New Orleans|0Aurora|0San Juan|0Honolulu|0Newark|0Lincoln|0Madison|0Glendale|0Boise City|0Richmond|0Des Moines|0Birmingham|0Rochester|0Fayetteville|0Little Rock|0Salt Lake City|0Providence|0Jackson|0Sioux Falls|1pringfield|1alem|0Lancaster|0Peoria|1asadena|0Alexandria|0Lakewood|0Bridgeport|1ellevue|0Columbia|1harleston|0Roseville|0Midland|0Concord|0Lafayette|0Beaumont|0Fargo|0Wilmington|1estminster|0Fairfield|0Manchester|0Billings|0Everett|0Norwalk|0Albany|0Roswell|0Lawrence|0San Marcos|0Greenville|0Bloomington|0Troy|0Medford|0Auburn|0Decatur|0Union City|0Apple Valley|0St. Cloud|0Mansfield|0Cheyenne|0Brentwood|1artlett|0Smyrna|0Dublin|0Wheaton|0Burlington|0Levittown|0Plainfield|0Charleston|0Middletown|0Danville|0Abilene|1kron|1lafaya|3meda|2bany|6|2exandria|2hambra|2iso Viejo|2len|5town|2oha|2pharetta|2tadena|4monte Springs|3oona|1marillo|2es|1naheim|2chorage|2derson|2keny|2n Arbor|3andale|2telope|3ioch|1pex|2opka|2ple Valley|5ton|1rcadia|2den-Arcade|2ecibo|2lington|9|9 Heights|2vada|1shburn|3eville|2pen Hill|1tascocita|2hens-Clarke County|2tleboro|1uburn|2gusta-Richmond County|2rora|2stin|1vondale|1zusa|0Bakersfield|2ldwin Park|2rnstable Town|3tlett|2ton Rouge|3tle Creek|2yamon|3onne|3town|1eaumont|3vercreek|6ton|2dford|2l Air South|3l Gardens|4eville|6ue|4flower|4ingham|2nd|3tonville|2rkeley|3wyn|2thesda|4lehem|1iloxi|2nghamton|2smarck|1lacksburg|3ine|2oomington|b|2ue Springs|1oca Raton|2lingbrook|2nita Springs|2ssier City|2thell|2ulder|3ntiful|2wie|3ling Green|2ynton Beach|2zeman|1radenton|3ndon|2entwood|2istol|2ockton|3ken Arrow|3okhaven|5line|6yn Park|4mfield|3wnsville|2yan|1uckeye|2ena Park|2ffalo|7 Grove|2rbank|3ien|3ke|3leson|4ington|3nsville|0Caguas|2ldwell|2marillo|3bridge|3den|2nton|2pe Coral|2rlsbad|3mel|4ichael|3olina|3rollton|3son|6 City|3y|2sa Grande|4s Adobes|3per|3tle Rock|4ro Valley|2talina Foothills|3hedral City|3onsville|1edar Hill|6Park|6Rapids|2ntennial|4reville|2res|3ritos|1hampaign|3ndler|3pel Hill|3rlottesville|3ttanooga|2eektowaga|3sapeake|4terfield|2ico|5pee|3no|5 Hills|2ula Vista|1icero|2ncinnati|2trus Heights|1larksville|2earwater|3veland|9 Heights|2ifton|2ovis|1oachella|2conut Creek|2eur d'Alene|2llege Station|4ierville|3orado Springs|3ton|3umbia|8|6us|8|2mmerce City|3pton|2ncord|7|3roe|3way|2on Rapids|2ral Gables|6Springs|3ona|3pus Christi|3vallis|2sta Mesa|2uncil Bluffs|4try Club|2vina|1ranston|1upertino|2tler Bay|2yahoga Falls|1ypress|0Dale City|3las|3y City|2nbury|3ville|2venport|3ie|4s|2yton|6a Beach|1eKalb|2Soto|2arborn|8 Heights|2catur|2erfield Beach|2lano|3ray Beach|3tona|2nton|2s Plaines|1iamond Bar|1oral|2than|2wners Grove|5y|1raper|1ublin|3uque|2luth|2ndalk|3woody|2rham|0Eagan|2st Hartford|6onolulu|5Lansing|6os Angeles|5Orange|5Providence|4vale|2u Claire|1den Prairie|2ina|4burg|2mond|1l Cajon|4entro|3Dorado Hills|3Monte|3Paso|2gin|2izabeth|2k Grove|3hart|2licott City|2mhurst|2yria|1ncinitas|2id|2terprise|1rie|1scondido|1uclid|2gene|2less|1vanston|5ville|2erett|0Fairfield|2ll River|2rmington|a Hills|2yetteville|1ederal Way|1indlay|2shers|1lagstaff|2int|2orence-Graham|4in|5ssant|3wer Mound|1olsom|2nd du Lac|3tana|2rt Collins|5Lauderdale|5Myers|5Pierce|5Smith|5Wayne|6orth|2untain Valley|8ebleau|1ramingham|3nklin|2ederick|3eport|3mont|3sno|2isco|1ullerton|0Gainesville|3thersburg|2lveston|2rden Grove|6a|3land|3y|2stonia|1eorgetown|2rmantown|1ilbert|3roy|1len Burnie|4dale|5ora|4view|1oodyear|1rand Forks|6Island|6Junction|6Prairie|6Rapids|3pevine|2eat Falls|3eley|4n Bay|5sboro|5ville|5wood|3sham|1uaynabo|2lfport|0Hacienda Heights|3kensack|2ltom City|2milton|3mond|3pton|2nford|2rlingen|3risburg|6onburg|3tford|2ttiesburg|2verhill|2wthorne|2yward|1emet|3pstead|2nderson|9ville|2speria|1ialeah|2cksville|2gh Point|4land|8s Ranch|2llsboro|3o|1oboken|2ffman Estates|2llywood|2mestead|2over|1untersville|4ington|a Beach|bPark|4sville|2tchinson|0Idaho Falls|1ndependence|3io|2glewood|1owa City|1rondequoit|2vine|5g|0Jackson|7ville|2nesville|1efferson City|9ville|2rsey City|1ohns Creek|5on City|2liet|2nesboro|2plin|1upiter|2rupa Valley|0Kalamazoo|2nnapolis|3sas City|1earny|2ller|2ndale Lakes|6l|3ner|5wick|3osha|3t|4wood|2ttering|1illeen|2ngsport|2rkland|2ssimmee|1noxville|1okomo|0La Crosse|3Habra|3Mesa|4irada|2cey|2fayette|2guna Niguel|2ke Charles|5Elsinore|5Forest|5Havasu City|5Ridge|4land|4ville|4wood|8|8|8|2ncaster|3sing|2redo|3go|2s Cruces|2uderhill|2wrence|8|3ton|2yton|1eague City|2e's Summit|3sburg|2hi|4gh Acres|2nexa|2vittown|2wisville|2xington-Fayette|1incoln|3den|2ttleton|2vermore|3onia|1odi|2gan|2mbard|3poc|2ng Beach|4mont|4view|2rain|2veland|2well|1ubbock|1ynchburg|3n|3wood|0Macon-Bibb County|2dera|3ison|2lden|2nhattan|3sfield|3teca|2ple Grove|2rgate|3icopa|4etta|3ysville|2yaguez|1cAllen|2Kinney|2Lean|1edford|2lbourne|2nifee|3tor|2rced|3iden|5ian|2sa|3quite|2tairie|3huen Town|1iami|5 Beach|6Gardens|2ddletown|3land|3west City|2lford|3lcreek|3pitas|2nnetonka|3ot|2ramar|2shawaka|3sion|7 Viejo|4oula|6ri City|1obile|2desto|2line|2nroe|3tebello|5rey Park|4gomery|2ore|2reno Valley|3gan Hill|2unt Pleasant|7rospect|6Vernon|5ain View|1uncie|2rfreesboro|3ray|4ieta|0Nampa|2pa|3erville|2shua|4ville-Davidson|2tional City|1ew Bedford|5raunfels|6itain|6unswick|4Haven|4Rochelle|3ark|6|3port Beach|8News|3ton|1iagara Falls|1oblesville|2rfolk|3mal|5n|3th Bethesda|6Charleston|6Highlands|6Las Vegas|8uderdale|7ittle Rock|6Miami|b Beach|6Port|6Richland Hills|3walk|2vato|3i|0O'Fallon|1ak Lawn|4Park|3land|7 Park|1cala|2eanside|1dessa|1gden|1lathe|2ympia|1ntario|1range|2em|2land Park|6o|2o Valley|1shkosh|1verland Park|1wensboro|1xnard|0Palatine|3m Bay|6each Gardens|5Coast|5Desert|5Harbor|5Springs|4dale|3o Alto|2radise|4mount|3ker|3ma|2sadena|3co|3saic|2terson|2wtucket|1eabody|3rl City|5and|2mbroke Pines|2nsacola|2oria|2rris|3th Amboy|2taluma|1flugerville|1harr|1ico Rivera|2ne Bluff|5Hills|4llas Park|2ttsburg|9h|5field|1lacentia|3infield|3no|4tation|2easanton|2ymouth|1ocatello|2inciana|2mona|3pano Beach|2nce|3tiac|2rt Arthur|5Charlotte|5Orange|5St. Lucie|4age|4erville|4land|4smouth|2tomac|2way|1rovo|1ueblo|0Quincy|0Racine|2leigh|2ncho Cordova|8ucamonga|7Palos Verdes|7Santa Margarita|2pid City|1eading|2dding|3lands|3mond|3ondo Beach|3wood City|2no|3ton|2ston|2vere|1ialto|2chardson|4land|4mond|2o Rancho|2verside|5ton|5view|1oanoke|2chester|9 Hills|3k Hill|4ford|4lin|4ville|4wall|4y Mount|2gers|2hnert Park|2semead|4ville|3well|2und Rock|2wland Heights|4ett|2yal Oak|0Sacramento|2ginaw|2lem|3ina|6s|2mmamish|2n Angelo|6tonio|4Bernardino|5runo|5uenaventura (Ventura)|4Clemente|4Diego|4Francisco|4Jacinto|5ose|4Leandro|5uis Obispo|4Marcos|6teo|4Rafael|6mon|4Tan Valley|3dy|5 Springs|3ford|3ta Ana|6Barbara|6Clara|aita|7ruz|6Fe|6Maria|7onica|6Rosa|4ee|2rasota|2vannah|2yreville|1chaumburg|3enectady|2ottsdale|2ranton|1evern|1hawnee|2eboygan|2oreline|2reveport|1ierra Vista|2lver Spring|2mi Valley|2oux City|1kokie|1myrna|1omerville|2uth Bend|6Gate|6Hill|6Jordan|6San Francisco|6Valley|6Whittier|5aven|5field|1parks|2okane|7 Valley|2ring|6 Hill|7Valley|6dale|6field|b|b|b|1t. Charles|5lair Shores|6oud|4George|4Joseph|4Louis|9 Park|4Paul|5eters|aburg|2amford|3te College|2erling Heights|2illwater|2ockton|2ratford|3ongsville|1uffolk|2gar Land|2mmerville|2nnyvale|3rise|7 Manor|2rprise|1yracuse|0Tacoma|2llahassee|2marac|3iami|3pa|2unton|2ylor|6sville|1emecula|3pe|4le|2rre Haute|2xas City|1he Hammocks|4Villages|4Woodlands|2ornton|3usand Oaks|1igard|2nley Park|2tusville|1oledo|2ms River|2nawanda|2peka|2rrance|2wn 'n' Country|3son|1racy|2enton|2oy|2ujillo Alto|1uckahoe|3son|2lare|3sa|2rlock|2scaloosa|3tin|1win Falls|1yler|0Union City|3versity|1pland|1rbana|5dale|1tica|0Vacaville|2ldosta|3lejo|2ncouver|1ictoria|6ville|2neland|2salia|3ta|0Waco|2ipahu|2ldorf|3nut Creek|3tham|2rner Robins|3ren|3wick|2shington|2terbury|5loo|3sonville|2ukegan|5sha|3watosa|1ellington|2sley Chapel|3t Allis|5Babylon|5Covina|5Des Moines|5Hartford|7ven|5Jordan|5Lafayette|5New York|5Palm Beach|5Sacramento|6eneca|5Valley City|4field|4land|4minster|4on|2ymouth Town|1heaton|2ite Plains|4tier|1ichita Falls|2lmington|3son|2nston-Salem|1oodbury|4land|2rcester|1ylie|2oming|0Yakima|1onkers|2rba Linda|3k|2ungstown|1uba City|2caipa|2ma","sep":"|"},{"d":"New York|California|Illinois|Texas|Pennsylvania|Arizona|Florida|Indiana|Ohio|North Carolina|Michigan|Washington|Colorado|Massachusetts|Tennessee|Maryland|Oregon|Oklahoma|Nevada|Kentucky|Wisconsin|New Mexico|Missouri|Georgia|Virginia|Nebraska|Minnesota|Kansas|Louisiana|Puerto Rico|Hawaii|New Jersey|Idaho|Iowa|Alabama|Arkansas|Utah|Rhode Island|Mississippi|South Dakota|Connecticut|South Carolina|North Dakota|New Hampshire|Montana|Wyoming|West Virginia|Alaska|Vermont|Maine|District of Columbia|Delaware","i":"0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,8,r,3,s,c,t,u,v,p,k,5,w,o,x,y,0,9,z,10,11,12,13,m,g,1,5,3,o,c,14,b,15,15,1,3,1,s,3,16,9,c,1,17,18,b,1,0,n,r,1,9,q,a,g,b,2,1,1,q,3,19,0,e,n,1,2,9,4,v,1a,8,1,3,8,6,1,n,g,s,1,1,3,4,g,n,1,6,4,3,x,1,1b,7,x,a,o,1,1,9,6,q,k,1,1,t,d,o,2,c,o,9,f,3,n,d,y,n,2,3,5,1,1,1,d,2,s,a,t,v,3,1,8,g,3,f,1,2,p,1,b,g,z,1,2,f,4,12,0,16,o,q,2,7,m,6,2,6,s,b,c,10,f,j,6,18,6,6,1,14,d,h,n,d,q,c,3,3,5,1,0,2,1,b,o,3,1c,q,t,w,1,d,v,8,6,1,7,1,t,3,1,i,9,5,5,19,c,1,5,1,f,3,3,x,c,o,1,1,2,5,9,o,e,0,o,m,1,d,1,1,1,2,8,1,e,6,e,8,v,1,1,6,w,3,e,c,1,f,m,n,7,c,1,17,9,3,z,q,6,6,1,3,g,1,x,6,1,11,1,6,8,1,o,3,1,14,o,x,6,1,8,6,2,3,a,a,y,6,1,6,6,3,2,1,6,y,2,1,10,8,x,q,f,n,9,q,14,u,a,1,v,11,1,k,q,q,3,h,1,1,1,1,3,2,v,1,7,f,2,8,1,h,i,4,1,8,g,3,2,7,d,8,d,l,a,z,b,8,7,5,a,1,1,m,3,1,k,1,c,6,6,6,z,7,3,1,6,d,e,f,0,1,1,3,1,6,f,3,1,1,3,7,9,3,f,5,1,f,1,1,2,5,16,p,c,3,a,3,18,c,k,9,15,7,g,t,12,1,v,3,8,7,o,1,3,4,o,14,12,d,1,1,1,0,i,e,1,6,0,9,1,c,g,u,v,2,6,6,y,9,1a,1,1,y,r,w,m,1,1,x,0,1,3,e,9,k,m,7,v,n,e,2,z,m,6,1,a,9,r,v,3,6,6,s,b,k,b,a,8,3,e,b,6,e,7,k,1,1,1,b,7,1,s,1,1,5,o,6,q,1,v,8,b,4,a,3,6,l,6,7,d,h,10,3,m,o,10,6,r,0,3,j,1,v,c,1,a,1,10,2,1,1,c,3,8,c,d,3,o,d,1,n,1,y,d,r,8,1,q,6,5,n,b,t,3,3,o,d,6,1,8,1,14,w,5,3,s,d,6,6,6,14,a,h,14,10,1,q,16,6,7,3,1,18,3,y,1,2,s,1,1,y,h,1,1,15,2,0,1,7,e,10,1,w,1,2,17,e,1,d,3,14,v,14,0,1,8,1,o,d,0,7,o,2,h,f,15,1,i,6,z,6,6,6,3,14,1,a,m,2,2,1,6,6,1,3,10,r,b,1,1,10,2,6,5,k,r,j,1,2,6,6,6,1,6,1,1,1,i,1,c,8,1,b,v,v,11,d,u,3,6,6,2,1,v,1,3,3,1,z,6,6,1,4,d,1,2,3,6,1,q,w,6,1,6,t,a,3,6,6,6,a,1,1d,o,f,1,10,c,d,k,9,1,1,1,1,13,4,1,1,b,1,1,i,b,o,d,1,3,b,1,l,1,10,6,o,q,a,15,2,1,f,3,9,z,1,1,a,l,3,1,3,a,1,a,d,r,1,b,3,3,1,1,1,1,1,1,1,1,1,1,3,1,1,1,5,10,n,6,1,1,1,1,1,l,1,1,1,1,6,n,v,2,0,5,4,f,r,k,b,s,5,f,1,x,2,e,d,7,1,b,10,1,l,1,12,a,i,b,b,3,6,i,z,2,d,8,g,m,a,6,10,m,m,q,q,m,6,14,4,a,h,1,14,8,o,3,15,1,6,i,5,0,b,6,6,6,6,d,a,10,1,5,3,7,3,6,6,3,c,1,g,2,6,8,v,0,r,1,6,f,1,v,0,t,o,5,1,h,1,y,1,w,3,v,6,1,2,x,0,1,n,1,b,3,1,v,1,1,3,u,f,1,d,n,a,11,1e,14,x,1,2,k,k,6,6,k,0,1,x,14,14,10,7,v,6,1,0,10,d,a,1,6,d,f,0,1,3,1f,9,9,q,1,d,3,a,b,0,1,4,8,1,1,5","sep":"|"}]}]);
const COLONY = [
{"id":"n-e0818ba6","guard":[["has","state"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Melbourne lies":"Melbourne is in Florida.","in what state is the city Arden-Arcade":"Arden-Arcade is in California.","name the state where Castro Valley lies":"Castro Valley is in California.","which US state is Carmel in":"Carmel is in Indiana.","which US state is Farmington Hills in":"Farmington Hills is in Michigan.","in what state is the city Antioch":"Antioch is in California.","name the state where Tyler lies":"Tyler is in Texas.","in what state is the city Hendersonville":"Hendersonville is in Tennessee.","which US state is Carson in":"Carson is in California.","which US state is Denver in":"Denver is in Colorado.","in what state is the city St. Joseph":"St. Joseph is in Missouri.","which US state is Milford in":"Milford is in Connecticut.","which US state is Boynton Beach in":"Boynton Beach is in Florida.","name the state where Dearborn lies":"Dearborn is in Michigan.","in what state is the city Oakland Park":"Oakland Park is in Florida.","which US state is Hammond in":"Hammond is in Indiana.","name the state where Schaumburg lies":"Schaumburg is in Illinois.","which US state is Lawton in":"Lawton is in Oklahoma.","in what state is the city Springdale":"Springdale is in Arkansas.","in what state is the city Pensacola":"Pensacola is in Florida.","which US state is Ceres in":"Ceres is in California.","name the state where Casper lies":"Casper is in Wyoming.","name the state where Anaheim lies":"Anaheim is in California.","which US state is Gardena in":"Gardena is in California.","which US state is West Babylon in":"West Babylon is in New York.","in what state is the city Meriden":"Meriden is in Connecticut.","in what state is the city Kalamazoo":"Kalamazoo is in Michigan.","name the state where Passaic lies":"Passaic is in New Jersey.","in what state is the city Santa Monica":"Santa Monica is in California.","name the state where Wichita Falls lies":"Wichita Falls is in Texas.","in what state is the city Wauwatosa":"Wauwatosa is in Wisconsin.","which US state is Parker in":"Parker is in Colorado.","in what state is the city West Des Moines":"West Des Moines is in Iowa.","in what state is the city North Las Vegas":"North Las Vegas is in Nevada.","which US state is Rosemead in":"Rosemead is in California.","which US state is Valdosta in":"Valdosta is in Georgia.","name the state where Anchorage lies":"Anchorage is in Alaska.","in what state is the city Rio Rancho":"Rio Rancho is in New Mexico.","which US state is Yuba City in":"Yuba City is in California.","which US state is St. Peters in":"St. Peters is in Missouri.","in what state is the city Lowell":"Lowell is in Massachusetts.","name the state where Nashua lies":"Nashua is in New Hampshire.","which US state is Spring Hill in":"Spring Hill is in Florida.","in what state is the city Country Club":"Country Club is in Florida.","which US state is Burnsville in":"Burnsville is in Minnesota.","which US state is Buckeye in":"Buckeye is in Arizona.","name the state where Chattanooga lies":"Chattanooga is in Tennessee.","name the state where Birmingham lies":"Birmingham is in Alabama.","in what state is the city Sierra Vista":"Sierra Vista is in Arizona.","in what state is the city Huntington Park":"Huntington Park is in California.","name the state where Lynwood lies":"Lynwood is in California.","which US state is Dayton in":"Dayton is in Ohio.","name the state where Florin lies":"Florin is in California.","which US state is Bethesda in":"Bethesda is in Maryland.","in what state is the city Walnut Creek":"Walnut Creek is in California.","which US state is Janesville in":"Janesville is in Wisconsin.","in what state is the city Enterprise":"Enterprise is in Nevada.","which US state is Muncie in":"Muncie is in Indiana.","name the state where Palm Coast lies":"Palm Coast is in Florida.","name the state where Euclid lies":"Euclid is in Ohio.","in what state is the city Asheville":"Asheville is in North Carolina.","in what state is the city Hicksville":"Hicksville is in New York.","which US state is Hoffman Estates in":"Hoffman Estates is in Illinois.","name the state where Missouri City lies":"Missouri City is in Texas.","name the state where East Hartford lies":"East Hartford is in Connecticut.","in what state is the city Fall River":"Fall River is in Massachusetts.","which US state is Tonawanda in":"Tonawanda is in New York.","name the state where Corona lies":"Corona is in California.","which US state is East Lansing in":"East Lansing is in Michigan.","name the state where Waukesha lies":"Waukesha is in Wisconsin.","name the state where Somerville lies":"Somerville is in Massachusetts.","name the state where Rogers lies":"Rogers is in Arkansas.","name the state where Atlanta lies":"Atlanta is in Georgia.","name the state where Victoria lies":"Victoria is in Texas.","which US state is San Luis Obispo in":"San Luis Obispo is in California.","which US state is Redlands in":"Redlands is in California.","name the state where Macon-Bibb County lies":"Macon-Bibb County is in Georgia.","in what state is the city Kennewick":"Kennewick is in Washington.","which US state is Royal Oak in":"Royal Oak is in Michigan.","which US state is Vineland in":"Vineland is in New Jersey.","in what state is the city Arcadia":"Arcadia is in California.","in what state is the city Montgomery":"Montgomery is in Alabama.","in what state is the city Berkeley":"Berkeley is in California.","in what state is the city Midwest City":"Midwest City is in Oklahoma.","in what state is the city Raleigh":"Raleigh is in North Carolina.","name the state where Aloha lies":"Aloha is in Oregon.","name the state where Charlotte lies":"Charlotte is in North Carolina.","name the state where Jeffersonville lies":"Jeffersonville is in Indiana.","which US state is Port St. Lucie in":"Port St. Lucie is in Florida.","in what state is the city Blacksburg":"Blacksburg is in Virginia.","in what state is the city Frisco":"Frisco is in Texas.","in what state is the city Rochester Hills":"Rochester Hills is in Michigan.","which US state is Tallahassee in":"Tallahassee is in Florida.","name the state where Seattle lies":"Seattle is in Washington.","in what state is the city Paramount":"Paramount is in California.","which US state is Meridian in":"Meridian is in Idaho.","name the state where Waukegan lies":"Waukegan is in Illinois.","name the state where Greensboro lies":"Greensboro is in North Carolina.","name the state where Elkhart lies":"Elkhart is in Indiana."}}},
{"id":"n-84577003","guard":[["has","state"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"state"}]]],"mem":{"table":{"where Melbourne lies":"Melbourne is in Florida.","is the city Arden-Arcade":"Arden-Arcade is in California.","where Castro Valley lies":"Castro Valley is in California.","is Carmel in":"Carmel is in Indiana.","is Farmington Hills in":"Farmington Hills is in Michigan.","is the city Antioch":"Antioch is in California.","where Tyler lies":"Tyler is in Texas.","is the city Hendersonville":"Hendersonville is in Tennessee.","is Carson in":"Carson is in California.","is Denver in":"Denver is in Colorado.","is the city St. Joseph":"St. Joseph is in Missouri.","is Milford in":"Milford is in Connecticut.","is Boynton Beach in":"Boynton Beach is in Florida.","where Dearborn lies":"Dearborn is in Michigan.","is the city Oakland Park":"Oakland Park is in Florida.","is Hammond in":"Hammond is in Indiana.","where Schaumburg lies":"Schaumburg is in Illinois.","is Lawton in":"Lawton is in Oklahoma.","is the city Springdale":"Springdale is in Arkansas.","is the city Pensacola":"Pensacola is in Florida.","is Ceres in":"Ceres is in California.","where Casper lies":"Casper is in Wyoming.","where Anaheim lies":"Anaheim is in California.","is Gardena in":"Gardena is in California.","is West Babylon in":"West Babylon is in New York.","is the city Meriden":"Meriden is in Connecticut.","is the city Kalamazoo":"Kalamazoo is in Michigan.","where Passaic lies":"Passaic is in New Jersey.","is the city Santa Monica":"Santa Monica is in California.","where Wichita Falls lies":"Wichita Falls is in Texas.","is the city Wauwatosa":"Wauwatosa is in Wisconsin.","is Parker in":"Parker is in Colorado.","is the city West Des Moines":"West Des Moines is in Iowa.","is the city North Las Vegas":"North Las Vegas is in Nevada.","is Rosemead in":"Rosemead is in California.","is Valdosta in":"Valdosta is in Georgia.","where Anchorage lies":"Anchorage is in Alaska.","is the city Rio Rancho":"Rio Rancho is in New Mexico.","is Yuba City in":"Yuba City is in California.","is St. Peters in":"St. Peters is in Missouri.","is the city Lowell":"Lowell is in Massachusetts.","where Nashua lies":"Nashua is in New Hampshire.","is Spring Hill in":"Spring Hill is in Florida.","is the city Country Club":"Country Club is in Florida.","is Burnsville in":"Burnsville is in Minnesota.","is Buckeye in":"Buckeye is in Arizona.","where Chattanooga lies":"Chattanooga is in Tennessee.","where Birmingham lies":"Birmingham is in Alabama.","is the city Sierra Vista":"Sierra Vista is in Arizona.","is the city Huntington Park":"Huntington Park is in California.","where Lynwood lies":"Lynwood is in California.","is Dayton in":"Dayton is in Ohio.","where Florin lies":"Florin is in California.","is Bethesda in":"Bethesda is in Maryland.","is the city Walnut Creek":"Walnut Creek is in California.","is Janesville in":"Janesville is in Wisconsin.","is the city Enterprise":"Enterprise is in Nevada.","is Muncie in":"Muncie is in Indiana.","where Palm Coast lies":"Palm Coast is in Florida.","where Euclid lies":"Euclid is in Ohio.","is the city Asheville":"Asheville is in North Carolina.","is the city Hicksville":"Hicksville is in New York.","is Hoffman Estates in":"Hoffman Estates is in Illinois.","where Missouri City lies":"Missouri City is in Texas.","where East Hartford lies":"East Hartford is in Connecticut.","is the city Fall River":"Fall River is in Massachusetts.","is Tonawanda in":"Tonawanda is in New York.","where Corona lies":"Corona is in California.","is East Lansing in":"East Lansing is in Michigan.","where Waukesha lies":"Waukesha is in Wisconsin.","where Somerville lies":"Somerville is in Massachusetts.","where Rogers lies":"Rogers is in Arkansas.","where Atlanta lies":"Atlanta is in Georgia.","where Victoria lies":"Victoria is in Texas.","is San Luis Obispo in":"San Luis Obispo is in California.","is Redlands in":"Redlands is in California.","where Macon-Bibb County lies":"Macon-Bibb County is in Georgia.","is the city Kennewick":"Kennewick is in Washington.","is Royal Oak in":"Royal Oak is in Michigan.","is Vineland in":"Vineland is in New Jersey.","is the city Arcadia":"Arcadia is in California.","is the city Montgomery":"Montgomery is in Alabama.","is the city Berkeley":"Berkeley is in California.","is the city Midwest City":"Midwest City is in Oklahoma.","is the city Raleigh":"Raleigh is in North Carolina.","where Aloha lies":"Aloha is in Oregon.","where Charlotte lies":"Charlotte is in North Carolina.","where Jeffersonville lies":"Jeffersonville is in Indiana.","is Port St. Lucie in":"Port St. Lucie is in Florida.","is the city Blacksburg":"Blacksburg is in Virginia.","is the city Frisco":"Frisco is in Texas.","is the city Rochester Hills":"Rochester Hills is in Michigan.","is Tallahassee in":"Tallahassee is in Florida.","where Seattle lies":"Seattle is in Washington.","is the city Paramount":"Paramount is in California.","is Meridian in":"Meridian is in Idaho.","where Waukegan lies":"Waukegan is in Illinois.","where Greensboro lies":"Greensboro is in North Carolina.","where Elkhart lies":"Elkhart is in Indiana."}}},
{"id":"n-70217c14","guard":[["not",["hasAny",["add","adventist","agency","airlines","airport","album","alcorn","alias","alrosa","americadenver","amridge","angels","antonio","appalachian","armstrong","artist","augustana","author","ave","az","bean","bowling","bradenton","brandman","breed","briar","bridgeport","buffalo","ca","cameron","capital","category","central","chadron","chandler","character","chesapeake","cheyenne","chowan","christopher","church","cigarette","circuit","citadel","clark","climbing","code","college","combined","comcchesney","community","compare","consecutive","culverstockton","cupertino","date","daugherty","dc","deity","denton","depaul","description","design","director","domain","electrocution","elon","emporia","ep","episode","exposition","files","first","flora","foothills","fox","fresno","frostburg","fruit","gain","gary","gender","global","governed","graceland","grayclearwater","greater","grey","hamburger","has","heredas","hex","hofstra","iata","id","international","intl","iso2","iso3","jersey","john","jose","josé","juan","keene","kennesaw","kirkland","language","larger","last","lesser","lewisclark","lindenwood","location","lompoc","long","longwood","makes","manchester","manufacturer","mary","marys","mateo","mayville","mcneese","mcphs","meadows","metropolitan","midcontinent","milwaukee","minot","mishawaka","mobile","mobilephoneoff","moreno","municipal","music","napa","nationality","nber","network","newport","nickname","norfolk","northwest","nursing","of","oglethorpe","opendate","orange","oro","palos","paradise","peabody","pico","point","polk","pomona","pompano","population","private","province","pubcapt","publication","quincy","rank","reading","reagan","red","redmond","redwood","ref","region","regional","regis","retrievers","rochelle","rockhurst","rockville","rosa","rutgers","río","sacred","saint","salle","salt","schreiner","season","sector","series","session","shorter","shortname","slug","smaller","song","sort","southern","soyo","speaker","speedway","sponsorship","stetson","stevenson","strcity","streetaddr","strstate","subcategory","sucountry","sum","superior","surface","symbol","tampa","taylors","tesuque","ticker","time","title","track","trend","trumbull","type","university","universitymain","v","villa","visualized","volcanic","volcano","wasteland","weber","week","whose","worlds","x","year","york","zone"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":"Illinois"}]],"mem":null},
{"id":"n-0e251c1d","guard":[["hasAny",["arcadia","ardenarcade","berkeley","bethesda","buckeye","burnsville","carmel","carson","ceres","creek","dayton","denver","east","enterprise","estates","fall","frisco","gardena","hammond","hendersonville","hicksville","hill","hills","item number","janesville","kalamazoo","las","lawton","lies","lowell","meriden","meridian","midwest","milford","monica","muncie","nth","oak","paramount","parker","pensacola","position","rancho","rosemead","separate by","sierra","split","split by","tallahassee","tonawanda","valdosta","vineland","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-8960bbe2","guard":[["hasAny",["arcadia","ardenarcade","berkeley","bethesda","buckeye","burnsville","carmel","carson","ceres","creek","dayton","denver","east","enterprise","estates","fall","frisco","gardena","hammond","hendersonville","hicksville","hill","hills","item number","janesville","kalamazoo","las","lawton","lies","lowell","meriden","meridian","midwest","milford","monica","muncie","nth","oak","paramount","parker","pensacola","position","rancho","rosemead","separate by","sierra","split","split by","tallahassee","tonawanda","valdosta","vineland","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-9e37911f","guard":[["hasAny",["arcadia","ardenarcade","berkeley","bethesda","buckeye","burnsville","carmel","carson","ceres","creek","dayton","denver","east","enterprise","estates","fall","frisco","gardena","hammond","hendersonville","hicksville","hill","hills","item number","janesville","kalamazoo","las","lawton","lies","lowell","meriden","meridian","midwest","milford","monica","muncie","nth","oak","paramount","parker","pensacola","position","rancho","rosemead","separate by","sierra","split","split by","tallahassee","tonawanda","valdosta","vineland","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-be396b5c","guard":[["hasAny",["arcadia","ardenarcade","berkeley","bethesda","buckeye","burnsville","carmel","carson","ceres","creek","dayton","delete","denver","east","enterprise","estates","fall","frisco","gardena","hammond","hendersonville","hicksville","hill","hills","item number","janesville","kalamazoo","las","lawton","lies","lowell","meriden","meridian","midwest","milford","monica","muncie","nth","oak","paramount","parker","pensacola","position","rancho","remove","rosemead","sierra","strip out","tallahassee","tonawanda","valdosta","vineland","without","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-10067e1a","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","babylon","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","charlotte","chattanooga","coast","corona","creek","dearborn","denver","east","elkhart","enterprise","estates","fall","florin","frisco","gardena","greensboro","hammond","hendersonville","hicksville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","leading zeros","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nashua","nth","oak","pad","pad with","padded to","paramount","parker","passaic","pensacola","position","raleigh","rancho","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tonawanda","tyler","valdosta","victoria","vineland","waukegan","waukesha","wauwatosa","yuba","zero pad"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-22be1773","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","babylon","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","charlotte","chattanooga","coast","corona","creek","dearborn","denver","east","elkhart","enterprise","estates","fall","florin","frisco","gardena","greensboro","hammond","hendersonville","hicksville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","leading zeros","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nashua","nth","oak","pad","pad with","padded to","paramount","parker","passaic","pensacola","position","raleigh","rancho","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tonawanda","tyler","valdosta","victoria","vineland","waukegan","waukesha","wauwatosa","yuba","zero pad"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":5},["sense.lastWord"]]],"mem":null},
{"id":"n-8edeb3bc","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","babylon","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","charlotte","chattanooga","coast","corona","creek","dearborn","denver","east","elkhart","enterprise","estates","fall","florin","frisco","gardena","greensboro","hammond","hendersonville","hicksville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","leading zeros","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nashua","nth","oak","pad","pad with","padded to","paramount","parker","passaic","pensacola","position","raleigh","rancho","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tonawanda","tyler","valdosta","victoria","vineland","waukegan","waukesha","wauwatosa","yuba","zero pad"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":5},["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-45d1aaa1","guard":[["hasAny",["arcadia","babylon","berkeley","bethesda","blacksburg","buckeye","burnsville","carmel","carson","ceres","dayton","delete","denver","enterprise","estates","frisco","gardena","hammond","hendersonville","hicksville","item number","janesville","kalamazoo","kennewick","lawton","lies","lowell","lucie","meriden","meridian","milford","muncie","nth","oak","paramount","parker","pensacola","peters","position","raleigh","redlands","remove","rosemead","strip out","tallahassee","tonawanda","valdosta","wauwatosa","without","yuba"]],["has","state"],["words<=",8],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["transform.remove",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-0e214010","guard":[["hasAny",["arcadia","babylon","berkeley","bethesda","blacksburg","buckeye","burnsville","carmel","carson","ceres","dayton","denver","enterprise","estates","frisco","gardena","hammond","hendersonville","hicksville","item number","janesville","kalamazoo","kennewick","lawton","lies","lowell","lucie","meriden","meridian","milford","muncie","nth","oak","paramount","parker","pensacola","peters","position","raleigh","redlands","rosemead","separate by","split","split by","tallahassee","tonawanda","valdosta","wauwatosa","yuba"]],["has","state"],["words<=",8],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-bcd9dda9","guard":[["hasAny",["arcadia","babylon","berkeley","bethesda","blacksburg","buckeye","burnsville","carmel","carson","ceres","dayton","denver","enterprise","estates","frisco","gardena","hammond","hendersonville","hicksville","item number","janesville","kalamazoo","kennewick","lawton","lies","lowell","lucie","meriden","meridian","milford","muncie","nth","oak","paramount","parker","pensacola","peters","position","raleigh","redlands","rosemead","separate by","split","split by","tallahassee","tonawanda","valdosta","wauwatosa","yuba"]],["has","state"],["words<=",8],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-f05f2e26","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","babylon","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","charlotte","chattanooga","coast","corona","creek","dearborn","denver","east","elkhart","estates","fall","florin","gardena","greensboro","hammond","hendersonville","hicksville","hill","hills","huntington","item number","janesville","jeffersonville","joseph","kalamazoo","kennewick","las","lawton","leading zeros","lowell","lynwood","meriden","midwest","milford","monica","muncie","nashua","nth","oak","pad","pad with","padded to","paramount","parker","passaic","pensacola","peters","position","raleigh","rancho","rogers","rosemead","schaumburg","somerville","tallahassee","tonawanda","valdosta","vineland","waukegan","waukesha","wauwatosa","yuba","zero pad"]],["has","state"],["words<=",9],["words>=",6],["not",["colon"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-ffd81ab4","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","babylon","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","charlotte","chattanooga","coast","corona","creek","dearborn","denver","east","elkhart","estates","fall","florin","gardena","greensboro","hammond","hendersonville","hicksville","hill","hills","huntington","item number","janesville","jeffersonville","joseph","kalamazoo","kennewick","lawton","leading zeros","lowell","lynwood","meriden","midwest","milford","monica","muncie","nashua","nth","oak","pad","pad with","padded to","paramount","parker","passaic","pensacola","peters","position","raleigh","rancho","redlands","rogers","rosemead","schaumburg","somerville","tallahassee","tonawanda","valdosta","vineland","waukegan","waukesha","wauwatosa","yuba","zero pad"]],["has","state"],["words<=",8],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-bdf42955","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","babylon","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","charlotte","chattanooga","coast","corona","creek","dearborn","denver","east","elkhart","estates","fall","florin","gardena","greensboro","hammond","hendersonville","hicksville","hill","hills","huntington","item number","janesville","jeffersonville","joseph","kalamazoo","kennewick","lawton","leading zeros","lowell","lynwood","meriden","midwest","milford","monica","muncie","nashua","nth","oak","pad","pad with","padded to","paramount","parker","passaic","pensacola","peters","position","raleigh","rancho","redlands","rogers","rosemead","schaumburg","somerville","tallahassee","tonawanda","valdosta","vineland","waukegan","waukesha","wauwatosa","yuba","zero pad"]],["has","state"],["words<=",8],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-d4587a6b","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hicksville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","normalise","normalize","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","simplify the text","somerville","tallahassee","tonawanda","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":3}]],"mem":null},
{"id":"n-02054264","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","characters from","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","florin","frisco","gardena","hammond","hendersonville","hicksville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","letters from to","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","passaic","pensacola","position","rancho","rogers","rosemead","schaumburg","sierra","slice of the text","substring","tallahassee","tonawanda","tyler","valdosta","victoria","vineland","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-00cce05e","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","class name","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pascal case","pascalcase","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tyler","upper camel case","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-3b2026ce","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","snake case","snakecase","somerville","tallahassee","tyler","underscores","valdosta","variable name","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-7de20696","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","camel case","camelcase","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lower camel case","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-937ccef3","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dashes","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","hyphens","item number","janesville","jeffersonville","kalamazoo","kebab case","kebabcase","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-b13092a2","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-bc089564","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","reverse the words","reverse word order","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words backwards","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-cfe5e104","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-e98bef83","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-0034fae0","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","class name","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","invert case","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pascal case","pascalcase","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","swap case","tallahassee","toggle case","tyler","upper camel case","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.pascal",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-014a10ad","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","camel case","camelcase","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lower camel case","lower case","lowercase","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","small letters","somerville","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-0565dcca","guard":[["hasAny",["all caps","aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","camel case","camelcase","capital letters","capitals","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lower camel case","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tyler","upper case","uppercase","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.upper",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-083f6436","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","camel case","camelcase","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","invert case","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lower camel case","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","swap case","tallahassee","toggle case","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-0e4e41eb","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","invert case","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","reverse the words","reverse word order","rogers","rosemead","schaumburg","sierra","somerville","swap case","tallahassee","toggle case","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words backwards","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-13e15e1d","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","invert case","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","swap case","tallahassee","toggle case","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.list",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-19574ffc","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","capitalise","capitalize","capitalize each word","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","snake case","snakecase","somerville","tallahassee","title case","tyler","underscores","valdosta","variable name","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-2d0dec14","guard":[["hasAny",["all caps","aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","capital letters","capitals","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","upper case","uppercase","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.and",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-38f6023c","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dashes","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","hyphens","item number","janesville","jeffersonville","kalamazoo","kebab case","kebabcase","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.and",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-42108eea","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","reverse the words","reverse word order","rogers","rosemead","schaumburg","sierra","snake case","snakecase","somerville","tallahassee","tyler","underscores","valdosta","variable name","victoria","waukegan","waukesha","wauwatosa","words backwards","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.snake",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-45b2915e","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","capitalise","capitalize","capitalize each word","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dashes","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","hyphens","item number","janesville","jeffersonville","kalamazoo","kebab case","kebabcase","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","title case","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.title",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-4c409dc0","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dashes","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","hyphens","item number","janesville","jeffersonville","kalamazoo","kebab case","kebabcase","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.list",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-53b729db","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","backwards","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","reverse","reverse order","reversed","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-5b01fe5a","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dashes","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","hyphens","invert case","item number","janesville","jeffersonville","kalamazoo","kebab case","kebabcase","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","swap case","tallahassee","toggle case","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.swapCase",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-5eb734a5","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","invert case","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","swap case","tallahassee","toggle case","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-5f6fa4dd","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","invert case","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","swap case","tallahassee","toggle case","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.and",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-600cc06c","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lower case","lowercase","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","reverse the words","reverse word order","rogers","rosemead","schaumburg","sierra","small letters","somerville","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words backwards","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-68a55646","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","camel case","camelcase","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","invert case","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lower camel case","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","swap case","tallahassee","toggle case","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.swapCase",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-75cdf620","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","backwards","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","reverse","reverse order","reversed","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-7ef5e368","guard":[["hasAny",["all caps","aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","capital letters","capitals","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","upper case","uppercase","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.lines",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-91fe7469","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","class name","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pascal case","pascalcase","pensacola","position","reverse the words","reverse word order","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tyler","upper camel case","valdosta","victoria","waukegan","waukesha","wauwatosa","words backwards","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.pascal",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-929bca93","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","shortest","shortest one","shortest word","sierra","somerville","split into words","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-96353e04","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","camel case","camelcase","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lower camel case","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","reverse the words","reverse word order","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words backwards","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-9f5d836c","guard":[["hasAny",["a to z","aloha","alphabetical","alphabetize","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-9f69c8cc","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","class name","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","invert case","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pascal case","pascalcase","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","swap case","tallahassee","toggle case","tyler","upper camel case","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-aa648896","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","backwards","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","reverse","reverse order","reversed","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-aa65f98a","guard":[["hasAny",["a to z","aloha","alphabetical","alphabetize","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-bee41f20","guard":[["hasAny",["a to z","aloha","alphabetical","alphabetize","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-c2632ef2","guard":[["hasAny",["all caps","aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","capital letters","capitals","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","reverse the words","reverse word order","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tyler","upper case","uppercase","valdosta","victoria","waukegan","waukesha","wauwatosa","words backwards","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-d0288cfa","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dashes","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","hyphens","item number","janesville","jeffersonville","kalamazoo","kebab case","kebabcase","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.lines",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-d4a352f8","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","longest","longest one","longest word","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-ed5532cf","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","camel case","camelcase","capitalise","capitalize","capitalize each word","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lower camel case","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","title case","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.title",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-f18471aa","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dashes","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","hyphens","item number","janesville","jeffersonville","kalamazoo","kebab case","kebabcase","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","reverse the words","reverse word order","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words backwards","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-f2440a0a","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","invert case","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","snake case","snakecase","somerville","swap case","tallahassee","toggle case","tyler","underscores","valdosta","variable name","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-fe43cb33","guard":[["hasAny",["all caps","aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","capital letters","capitals","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","each word","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","split into words","tallahassee","tyler","upper case","uppercase","valdosta","victoria","waukegan","waukesha","wauwatosa","words","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.list",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-08b7462d","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","camel case","camelcase","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lower camel case","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-d976bafc","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dashes","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","hyphens","item number","janesville","jeffersonville","kalamazoo","kebab case","kebabcase","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-da68a802","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","rogers","rosemead","schaumburg","sierra","snake case","snakecase","somerville","tallahassee","tyler","underscores","valdosta","variable name","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-daa6221a","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pensacola","position","reverse the words","reverse word order","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tyler","valdosta","victoria","waukegan","waukesha","wauwatosa","words backwards","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-f7a8eeba","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","chattanooga","class name","coast","corona","creek","dayton","dearborn","denver","east","elkhart","enterprise","estates","euclid","fall","florin","frisco","gardena","hammond","hendersonville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","las","lawton","lowell","lynwood","meriden","meridian","midwest","milford","missouri","monica","muncie","nth","oak","paramount","parker","pascal case","pascalcase","pensacola","position","rogers","rosemead","schaumburg","sierra","somerville","tallahassee","tyler","upper camel case","valdosta","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-ee44ff8c","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","characters from","chattanooga","coast","corona","creek","dayton","dearborn","denver","elkhart","enterprise","estates","euclid","florin","frisco","gardena","hammond","hendersonville","hicksville","hill","hills","item number","janesville","jeffersonville","kalamazoo","kennewick","lansing","las","lawton","letters from to","lynwood","meridian","midwest","missouri","monica","muncie","nth","oak","paramount","parker","passaic","pensacola","position","rancho","rogers","rosemead","schaumburg","sierra","slice of the text","substring","tallahassee","tonawanda","tyler","valdosta","victoria","vineland","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",9],["not",["colon"]],["words>=",6]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-a0283069","guard":[["hasAny",["aloha","anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","charlotte","chattanooga","corona","dayton","dearborn","denver","east","elkhart","enterprise","euclid","fall","farmington","florin","frisco","gardena","greensboro","hammond","hendersonville","hicksville","item number","janesville","jeffersonville","kalamazoo","kennewick","lawton","lowell","lynwood","meriden","meridian","milford","muncie","nashua","normalise","normalize","nth","paramount","parker","passaic","pensacola","position","raleigh","redlands","rogers","rosemead","schaumburg","sierra","simplify the text","somerville","tallahassee","tonawanda","tyler","valdosta","victoria","vineland","waukegan","waukesha","wauwatosa"]],["has","state"],["words<=",8],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-6747da64","guard":[["hasAny",["delete","item number","nth","position","remove","state","strip out","without"]],["has","in"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-1514b1c1","guard":[["hasAny",["aloha","anaheim","anchorage","antioch","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","charlotte","chattanooga","corona","dashes","dayton","dearborn","denver","elkhart","enterprise","euclid","florin","frisco","gardena","greensboro","hammond","hendersonville","hicksville","hyphens","item number","janesville","jeffersonville","kalamazoo","kebab case","kebabcase","kennewick","lawton","lowell","lynwood","meriden","meridian","milford","montgomery","muncie","nashua","nth","paramount","parker","passaic","pensacola","position","raleigh","redlands","rogers","rosemead","schaumburg","seattle","somerville","tallahassee","tonawanda","tyler","valdosta","victoria","vineland","waukegan","waukesha","wauwatosa"]],["has","state"],["words<=",7],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["transform.kebab",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-41fac2bc","guard":[["hasAny",["aloha","anaheim","anchorage","antioch","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","ceres","charlotte","chattanooga","corona","dayton","dearborn","denver","elkhart","enterprise","euclid","florin","frisco","gardena","greensboro","hammond","hendersonville","hicksville","item number","janesville","jeffersonville","kalamazoo","kennewick","lawton","lowell","lynwood","meriden","meridian","milford","montgomery","muncie","nashua","nth","paramount","parker","passaic","pensacola","position","raleigh","redlands","reverse the words","reverse word order","rogers","rosemead","schaumburg","seattle","somerville","tallahassee","tonawanda","tyler","valdosta","victoria","vineland","waukegan","waukesha","wauwatosa","words backwards"]],["has","state"],["words<=",7],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-6a5c103b","guard":[["has","state"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the city Arden-Arcade":"Arden-Arcade is in California.","Carmel in":"Carmel is in Indiana.","Farmington Hills in":"Farmington Hills is in Michigan.","the city Antioch":"Antioch is in California.","the city Hendersonville":"Hendersonville is in Tennessee.","Carson in":"Carson is in California.","Denver in":"Denver is in Colorado.","the city St. Joseph":"St. Joseph is in Missouri.","Milford in":"Milford is in Connecticut.","Boynton Beach in":"Boynton Beach is in Florida.","the city Oakland Park":"Oakland Park is in Florida.","Hammond in":"Hammond is in Indiana.","Lawton in":"Lawton is in Oklahoma.","the city Springdale":"Springdale is in Arkansas.","the city Pensacola":"Pensacola is in Florida.","Ceres in":"Ceres is in California.","Gardena in":"Gardena is in California.","West Babylon in":"West Babylon is in New York.","the city Meriden":"Meriden is in Connecticut.","the city Kalamazoo":"Kalamazoo is in Michigan.","the city Santa Monica":"Santa Monica is in California.","the city Wauwatosa":"Wauwatosa is in Wisconsin.","Parker in":"Parker is in Colorado.","the city West Des Moines":"West Des Moines is in Iowa.","the city North Las Vegas":"North Las Vegas is in Nevada.","Rosemead in":"Rosemead is in California.","Valdosta in":"Valdosta is in Georgia.","the city Rio Rancho":"Rio Rancho is in New Mexico.","Yuba City in":"Yuba City is in California.","St. Peters in":"St. Peters is in Missouri.","the city Lowell":"Lowell is in Massachusetts.","Spring Hill in":"Spring Hill is in Florida.","the city Country Club":"Country Club is in Florida.","Burnsville in":"Burnsville is in Minnesota.","Buckeye in":"Buckeye is in Arizona.","the city Sierra Vista":"Sierra Vista is in Arizona.","the city Huntington Park":"Huntington Park is in California.","Dayton in":"Dayton is in Ohio.","Bethesda in":"Bethesda is in Maryland.","the city Walnut Creek":"Walnut Creek is in California.","Janesville in":"Janesville is in Wisconsin.","the city Enterprise":"Enterprise is in Nevada.","Muncie in":"Muncie is in Indiana.","the city Asheville":"Asheville is in North Carolina.","the city Hicksville":"Hicksville is in New York.","Hoffman Estates in":"Hoffman Estates is in Illinois.","the city Fall River":"Fall River is in Massachusetts.","Tonawanda in":"Tonawanda is in New York.","East Lansing in":"East Lansing is in Michigan.","San Luis Obispo in":"San Luis Obispo is in California.","Redlands in":"Redlands is in California.","the city Kennewick":"Kennewick is in Washington.","Royal Oak in":"Royal Oak is in Michigan.","Vineland in":"Vineland is in New Jersey.","the city Arcadia":"Arcadia is in California.","the city Montgomery":"Montgomery is in Alabama.","the city Berkeley":"Berkeley is in California.","the city Midwest City":"Midwest City is in Oklahoma.","the city Raleigh":"Raleigh is in North Carolina.","Port St. Lucie in":"Port St. Lucie is in Florida.","the city Blacksburg":"Blacksburg is in Virginia.","the city Frisco":"Frisco is in Texas.","the city Rochester Hills":"Rochester Hills is in Michigan.","Tallahassee in":"Tallahassee is in Florida.","the city Paramount":"Paramount is in California.","Meridian in":"Meridian is in Idaho."}}},
{"id":"n-401511ef","guard":[["hasAny",["anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","charlotte","chattanooga","corona","dayton","dearborn","denver","east","elkhart","enterprise","euclid","florin","frisco","gardena","greensboro","hammond","hendersonville","hicksville","item number","janesville","jeffersonville","joseph","kalamazoo","kennewick","lawton","longest","longest one","longest word","lowell","lynwood","meriden","meridian","milford","monica","muncie","nashua","nth","paramount","parker","passaic","pensacola","peters","position","raleigh","rancho","rogers","rosemead","schaumburg","somerville","tallahassee","tonawanda","valdosta","victoria","vineland","waukegan","waukesha","wauwatosa"]],["has","state"],["words<=",9],["words>=",6],["not",["has","beach"]],["not",["colon"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-54f082cf","guard":[["hasAny",["anaheim","anchorage","arcadia","ardenarcade","atlanta","berkeley","bethesda","birmingham","blacksburg","buckeye","burnsville","carmel","carson","casper","charlotte","chattanooga","corona","dayton","dearborn","denver","east","elkhart","enterprise","euclid","florin","frisco","gardena","greensboro","hammond","hendersonville","hicksville","item number","janesville","jeffersonville","joseph","kalamazoo","kennewick","lawton","longest","longest one","longest word","lowell","lynwood","meriden","meridian","milford","monica","muncie","nashua","nth","paramount","parker","passaic","pensacola","peters","position","raleigh","rancho","rogers","rosemead","schaumburg","somerville","tallahassee","tonawanda","valdosta","victoria","vineland","waukegan","waukesha","wauwatosa"]],["has","state"],["words<=",9],["words>=",6],["not",["has","beach"]],["not",["colon"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-4b9c6d36","guard":[["hasAny",["bethesda","buckeye","carmel","carson","ceres","dayton","denver","east","gardena","hammond","hill","hills","item number","lawton","lies","meridian","milford","muncie","nth","oak","parker","position","rosemead","separate by","split","split by","tallahassee","tonawanda","valdosta","vineland"]],["has","state"],["words<=",9],["not",["has","ambrose"]],["not",["colon"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.lastWord"]]],"mem":null},
{"id":"n-a1c75687","guard":[["hasAny",["bethesda","buckeye","carmel","carson","ceres","dayton","denver","east","gardena","hammond","hill","hills","item number","lawton","lies","meridian","milford","muncie","nth","oak","parker","position","rosemead","separate by","split","split by","tallahassee","tonawanda","valdosta","vineland"]],["has","state"],["words<=",9],["not",["has","ambrose"]],["not",["colon"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.lastWord"]]],"mem":null},
{"id":"n-f3cdc890","guard":[["hasAny",["bethesda","buckeye","carmel","carson","ceres","dayton","delete","denver","east","gardena","hammond","hill","hills","item number","lawton","lies","meridian","milford","muncie","nth","oak","parker","position","remove","rosemead","strip out","tallahassee","tonawanda","valdosta","vineland","without"]],["has","state"],["words<=",9],["not",["has","ambrose"]],["not",["colon"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.lastWord"]]],"mem":null},
{"id":"n-ff7b9f0e","guard":[["hasAny",["bethesda","buckeye","carmel","carson","ceres","dayton","denver","east","gardena","hammond","hill","hills","item number","lawton","lies","meridian","milford","muncie","nth","oak","parker","position","rosemead","separate by","split","split by","tallahassee","tonawanda","valdosta","vineland"]],["has","state"],["words<=",9],["not",["has","ambrose"]],["not",["colon"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.lastWord"]]],"mem":null},
{"id":"n-361d90b6","guard":[["hasAny",["bethesda","buckeye","carmel","carson","ceres","change to","dayton","denver","east","gardena","hammond","hill","hills","item number","lawton","lies","meridian","milford","muncie","nth","oak","parker","position","replace","rosemead","substitute","swap","tallahassee","tonawanda","valdosta","vineland"]],["has","state"],["words<=",9],["not",["colon"]]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-2c18133b","guard":[["hasAny",["bethesda","buckeye","carmel","carson","ceres","change to","dayton","denver","east","gardena","hammond","hill","hills","item number","lawton","lies","meridian","milford","muncie","nth","oak","parker","position","replace","rosemead","substitute","swap","tallahassee","tonawanda","valdosta","vineland"]],["has","state"],["words<=",9],["not",["colon"]]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-e3275270","guard":[["hasAny",["aloha","anaheim","anchorage","antioch","arcadia","ardenarcade","atlanta","babylon","berkeley","birmingham","blacksburg","casper","charlotte","chattanooga","corona","dearborn","elkhart","enterprise","estates","euclid","farmington","florin","frisco","greensboro","hendersonville","hicksville","hill","item number","jeffersonville","kalamazoo","kennewick","lansing","lowell","lynwood","meriden","montgomery","nashua","nth","oak","paramount","passaic","pensacola","peters","position","raleigh","rogers","schaumburg","seattle","somerville","springdale","tyler","victoria","waukegan","waukesha","wauwatosa","yuba"]],["has","state"],["words<=",7],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-5537205f","guard":[["hasAny",["antioch","arcadia","ardenarcade","babylon","beach","berkeley","bethesda","blacksburg","buckeye","burnsville","carmel","carson","ceres","count","dayton","denver","east","element","enterprise","estates","farmington","frisco","gardena","hammond","hendersonville","hicksville","hill","how many","how many items","item number","janesville","kalamazoo","kennewick","lawton","lowell","meriden","meridian","milford","montgomery","muncie","normalise","normalize","nth","number of items","oak","paramount","parker","pensacola","peters","position","redlands","rosemead","simplify the text","springdale","tallahassee","tonawanda","valdosta","vineland","wauwatosa","yuba"]],["has","in"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-1fa3ac87","guard":[["hasAny",["delete","item number","nth","position","remove","state","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-77df2750","guard":[["hasAny",["city","delete","item number","nth","position","remove","strip out","without"]],["has","what"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-81cfccdb","guard":[["has","state"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"in"}]]],"mem":{"table":{"which US state is Carmel":"Carmel is in Indiana.","which US state is Farmington Hills":"Farmington Hills is in Michigan.","which US state is Carson":"Carson is in California.","which US state is Denver":"Denver is in Colorado.","which US state is Milford":"Milford is in Connecticut.","which US state is Boynton Beach":"Boynton Beach is in Florida.","which US state is Hammond":"Hammond is in Indiana.","which US state is Lawton":"Lawton is in Oklahoma.","which US state is Ceres":"Ceres is in California.","which US state is Gardena":"Gardena is in California.","which US state is West Babylon":"West Babylon is in New York.","which US state is Parker":"Parker is in Colorado.","which US state is Rosemead":"Rosemead is in California.","which US state is Valdosta":"Valdosta is in Georgia.","which US state is Yuba City":"Yuba City is in California.","which US state is St. Peters":"St. Peters is in Missouri.","which US state is Spring Hill":"Spring Hill is in Florida.","which US state is Burnsville":"Burnsville is in Minnesota.","which US state is Buckeye":"Buckeye is in Arizona.","which US state is Dayton":"Dayton is in Ohio.","which US state is Bethesda":"Bethesda is in Maryland.","which US state is Janesville":"Janesville is in Wisconsin.","which US state is Muncie":"Muncie is in Indiana.","which US state is Hoffman Estates":"Hoffman Estates is in Illinois.","which US state is Tonawanda":"Tonawanda is in New York.","which US state is East Lansing":"East Lansing is in Michigan.","which US state is San Luis Obispo":"San Luis Obispo is in California.","which US state is Redlands":"Redlands is in California.","which US state is Royal Oak":"Royal Oak is in Michigan.","which US state is Vineland":"Vineland is in New Jersey.","which US state is Port St. Lucie":"Port St. Lucie is in Florida.","which US state is Tallahassee":"Tallahassee is in Florida.","which US state is Meridian":"Meridian is in Idaho."}}},
{"id":"n-e5038e5e","guard":[["has","city"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"in"}]]],"mem":{"table":{"what state is the city Arden-Arcade":"Arden-Arcade is in California.","what state is the city Antioch":"Antioch is in California.","what state is the city Hendersonville":"Hendersonville is in Tennessee.","what state is the city St. Joseph":"St. Joseph is in Missouri.","what state is the city Oakland Park":"Oakland Park is in Florida.","what state is the city Springdale":"Springdale is in Arkansas.","what state is the city Pensacola":"Pensacola is in Florida.","what state is the city Meriden":"Meriden is in Connecticut.","what state is the city Kalamazoo":"Kalamazoo is in Michigan.","what state is the city Santa Monica":"Santa Monica is in California.","what state is the city Wauwatosa":"Wauwatosa is in Wisconsin.","what state is the city West Des Moines":"West Des Moines is in Iowa.","what state is the city North Las Vegas":"North Las Vegas is in Nevada.","what state is the city Rio Rancho":"Rio Rancho is in New Mexico.","what state is the city Lowell":"Lowell is in Massachusetts.","what state is the city Country Club":"Country Club is in Florida.","what state is the city Sierra Vista":"Sierra Vista is in Arizona.","what state is the city Huntington Park":"Huntington Park is in California.","what state is the city Walnut Creek":"Walnut Creek is in California.","what state is the city Enterprise":"Enterprise is in Nevada.","what state is the city Asheville":"Asheville is in North Carolina.","what state is the city Hicksville":"Hicksville is in New York.","what state is the city Fall River":"Fall River is in Massachusetts.","what state is the city Kennewick":"Kennewick is in Washington.","what state is the city Arcadia":"Arcadia is in California.","what state is the city Montgomery":"Montgomery is in Alabama.","what state is the city Berkeley":"Berkeley is in California.","what state is the city Midwest City":"Midwest City is in Oklahoma.","what state is the city Raleigh":"Raleigh is in North Carolina.","what state is the city Blacksburg":"Blacksburg is in Virginia.","what state is the city Frisco":"Frisco is in Texas.","what state is the city Rochester Hills":"Rochester Hills is in Michigan.","what state is the city Paramount":"Paramount is in California."}}},
{"id":"n-87ae3026","guard":[["hasAny",["anaheim","arcadia","ardenarcade","berkeley","carson","ceres","charlotte","corona","creek","fall","florin","gardena","greensboro","hartford","item number","kennewick","leading zeros","lowell","lynwood","meriden","milford","monica","nashua","nth","pad","pad with","padded to","paramount","passaic","pensacola","position","raleigh","rancho","redlands","rosemead","sierra","somerville","vineland","yuba","zero pad"]],["has","state"],["words<=",8],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-b860aeaa","guard":[["hasAny",["anaheim","arcadia","ardenarcade","berkeley","carson","ceres","charlotte","corona","creek","fall","florin","gardena","greensboro","hartford","huntington","item number","kennewick","leading zeros","lowell","lynwood","meriden","milford","monica","nashua","nth","pad","pad with","padded to","paramount","passaic","position","raleigh","rancho","redlands","rosemead","somerville","vineland","yuba","zero pad"]],["has","state"],["words<=",8],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-dbddf9ab","guard":[["hasAny",["anaheim","arcadia","ardenarcade","berkeley","carson","ceres","charlotte","corona","creek","fall","florin","gardena","greensboro","hartford","huntington","item number","kennewick","leading zeros","lowell","lynwood","meriden","milford","monica","nashua","nth","pad","pad with","padded to","paramount","passaic","position","raleigh","rancho","redlands","rosemead","somerville","vineland","yuba","zero pad"]],["has","state"],["words<=",8],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-45f5d6b2","guard":[["hasAny",["aloha","anchorage","characters from","coast","dayton","enterprise","euclid","frisco","hill","item number","joseph","las","letters from to","lucie","meridian","midwest","missouri","nth","oakland","pensacola","position","sierra","slice of the text","substring","tyler","victoria"]],["has","state"],["words<=",9],["not",["colon"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-1a27b528","guard":[["hasAny",["antioch","arcadia","asheville","berkeley","blacksburg","change to","enterprise","frisco","hendersonville","hicksville","item number","kalamazoo","kennewick","lowell","meriden","montgomery","nth","paramount","pensacola","position","raleigh","replace","springdale","substitute","swap","wauwatosa"]],["has","in"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-db240584","guard":[["hasAny",["antioch","arcadia","asheville","berkeley","blacksburg","change to","enterprise","frisco","hendersonville","hicksville","item number","kalamazoo","kennewick","lowell","meriden","montgomery","nth","paramount","pensacola","position","raleigh","replace","springdale","substitute","swap","wauwatosa"]],["has","in"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-1b5d10a0","guard":[["hasAny",["anaheim","arcadia","ardenarcade","berkeley","carson","ceres","corona","creek","florin","gardena","huntington","luis","lynwood","monica","paramount","redlands","rosemead","yuba"]],["has","state"],["words<=",8],["not",["has","comcchesney"]],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in California."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-778f29a0","guard":[["hasAny",["antioch","arcadia","ardenarcade","berkeley","carson","ceres","creek","delete","gardena","huntington","luis","monica","paramount","redlands","rosemead","strip out","yuba"]],["has","in"],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"California"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-85ba13ab","guard":[["hasAny",["antioch","arcadia","ardenarcade","berkeley","carson","ceres","creek","delete","gardena","huntington","luis","monica","paramount","redlands","rosemead","strip out","yuba"]],["has","in"],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"california"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-47446068","guard":[["hasAny",["antioch","arcadia","ardenarcade","berkeley","carson","ceres","gardena","how many","how many items","normalise","normalize","number of items","paramount","redlands","rosemead","simplify the text","yuba"]],["has","in"]],"pyramid":["render.str",["transform.norm",{"lit":"California"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-f0883d2d","guard":[["hasAny",["asheville","charlotte","fall","greensboro","hendersonville","item number","leading zeros","lowell","nashua","nth","pad","pad with","padded to","position","raleigh","somerville","wauwatosa","zero pad"]],["has","state"],["not",["has","of"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-f0d801ce","guard":[["hasAny",["asheville","charlotte","fall","greensboro","item number","leading zeros","lowell","nashua","nth","pad","pad with","padded to","position","raleigh","somerville","zero pad"]],["has","state"],["not",["has","of"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":12},["sense.lastWord"]]],"mem":null},
{"id":"n-5fb347e0","guard":[["hasAny",["asheville","charlotte","fall","greensboro","item number","leading zeros","lowell","nashua","nth","pad","pad with","padded to","position","raleigh","somerville","zero pad"]],["has","state"],["not",["has","of"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-9835e546","guard":[["hasAny",["antioch","arcadia","ardenarcade","berkeley","creek","delete","huntington","monica","paramount","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"california"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-ab9cd956","guard":[["hasAny",["antioch","arcadia","ardenarcade","berkeley","creek","delete","huntington","monica","paramount","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"California"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-19bf5b04","guard":[["hasAny",["characters from","dayton","euclid","frisco","item number","letters from to","meridian","missouri","nth","position","slice of the text","substring","tyler","victoria"]],["has","state"],["not",["colon"]],["not",["has","cox"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-164338e4","guard":[["hasAny",["beach","club","delete","hill","lucie","oakland","pensacola","strip out","tallahassee"]],["has","in"],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"Florida"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-374cacb6","guard":[["hasAny",["beach","club","delete","hill","lucie","oakland","pensacola","strip out","tallahassee"]],["has","in"],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"florida"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-4dffa844","guard":[["hasAny",["carson","ceres","city","delete","gardena","luis","redlands","remove","rosemead","strip out","without"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"California"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-5afa0270","guard":[["hasAny",["carson","ceres","city","delete","gardena","luis","redlands","remove","rosemead","strip out","without"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"california"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-afd9dcff","guard":[["hasAny",["carson","ceres","city","delete","gardena","luis","redlands","remove","rosemead","strip out"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"California"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-b75876cc","guard":[["hasAny",["carson","ceres","city","delete","gardena","luis","redlands","remove","rosemead","strip out"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"california"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-33af6149","guard":[["hasAny",["coast","hill","lucie","oakland","pensacola","tallahassee"]],["has","state"],["not",["has","california"]],["not",["has","daugherty"]],["not",["has","daytona"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-a2895186","guard":[["hasAny",["dearborn","hills","kalamazoo","lansing","oak"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-5502ba69","guard":[["hasAny",["dearborn","hills","item number","kalamazoo","lansing","leading zeros","nth","oak","pad","pad with","padded to","position","zero pad"]],["has","state"]],"pyramid":["render.str",["transform.padStart",{"lit":"Michigan"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-e3369ea7","guard":[["hasAny",["dearborn","hills","item number","kalamazoo","lansing","leading zeros","nth","oak","pad","pad with","padded to","position","zero pad"]],["has","state"]],"pyramid":["render.str",["transform.padStart",{"lit":"michigan"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-41f5ca7b","guard":[["hasAny",["dearborn","hills","kalamazoo","lansing","leading zeros","oak","pad with","padded to","zero pad"]],["has","state"],["not",["has","for"]],["not",["has","me"]]],"pyramid":["render.str",["transform.padStart",{"lit":"michigan"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-8497ee83","guard":[["hasAny",["characters from","club","coast","hill","letters from to","lucie","oakland","pensacola","slice of the text","substring"]],["has","state"],["not",["has","california"]],["words>=",7]],"pyramid":["render.str",["transform.substr",{"lit":"Florida"},{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-84ce5a53","guard":[["hasAny",["dearborn","hills","kalamazoo","lansing","leading zeros","oak","pad with","padded to","zero pad"]],["has","state"],["not",["has","for"]],["not",["has","me"]]],"pyramid":["render.str",["transform.padStart",{"lit":"michigan"},["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-9f6453b6","guard":[["hasAny",["characters from","club","coast","hill","letters from to","lucie","oakland","pensacola","slice of the text","substring"]],["has","state"],["not",["has","california"]],["words>=",7]],"pyramid":["render.str",["transform.substr",{"lit":"florida"},{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-aaa3708c","guard":[["hasAny",["dearborn","hills","kalamazoo","lansing","leading zeros","oak","pad with","padded to","zero pad"]],["has","state"],["not",["has","for"]],["not",["has","me"]]],"pyramid":["render.str",["transform.padStart",{"lit":"Michigan"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-d4d5ced2","guard":[["hasAny",["dearborn","hills","kalamazoo","lansing","leading zeros","oak","pad with","padded to","zero pad"]],["has","state"],["not",["has","for"]],["not",["has","me"]]],"pyramid":["render.str",["transform.padStart",{"lit":"Michigan"},["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-e747f632","guard":[["hasAny",["carmel","elkhart","hammond","jeffersonville","muncie"]],["words<=",6],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Indiana."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-5d9278ef","guard":[["hasAny",["carmel","elkhart","hammond","item number","jeffersonville","leading zeros","muncie","nth","pad","pad with","padded to","position","zero pad"]],["words<=",6],["has","state"]],"pyramid":["render.str",["transform.padStart",{"lit":"Indiana"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-bdcc1e4b","guard":[["hasAny",["carmel","elkhart","hammond","item number","jeffersonville","leading zeros","muncie","nth","pad","pad with","padded to","position","zero pad"]],["words<=",6],["has","state"]],"pyramid":["render.str",["transform.padStart",{"lit":"indiana"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-e845c977","guard":[["hasAny",["coast","hill","item number","leading zeros","melbourne","nth","pad","pad with","padded to","pensacola","position","tallahassee","zero pad"]],["has","state"],["words<=",7],["not",["has","daugherty"]],["not",["has","international"]]],"pyramid":["render.str",["transform.padStart",{"lit":"florida"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-f03dac76","guard":[["hasAny",["coast","hill","item number","leading zeros","melbourne","nth","pad","pad with","padded to","pensacola","position","tallahassee","zero pad"]],["has","state"],["words<=",7],["not",["has","daugherty"]],["not",["has","international"]]],"pyramid":["render.str",["transform.padStart",{"lit":"Florida"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-1f0db9c6","guard":[["hasAny",["carmel","elkhart","hammond","jeffersonville","leading zeros","muncie","pad with","padded to","zero pad"]],["words<=",6],["has","state"]],"pyramid":["render.str",["transform.padStart",{"lit":"Indiana"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-23d68b7e","guard":[["hasAny",["delete","east","hills","kalamazoo","oak","strip out"]],["has","state"],["has","in"]],"pyramid":["render.str",["transform.remove",{"lit":"Michigan"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-286e3ec0","guard":[["hasAny",["carmel","delete","elkhart","hammond","jeffersonville","muncie","strip out"]],["words<=",6],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"indiana"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-4f9fbe06","guard":[["hasAny",["carmel","elkhart","hammond","jeffersonville","leading zeros","muncie","pad with","padded to","zero pad"]],["words<=",6],["has","state"]],"pyramid":["render.str",["transform.padStart",{"lit":"Indiana"},["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-76300791","guard":[["hasAny",["carmel","elkhart","hammond","jeffersonville","leading zeros","muncie","pad with","padded to","zero pad"]],["words<=",6],["has","state"]],"pyramid":["render.str",["transform.padStart",{"lit":"indiana"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-dd97ae50","guard":[["hasAny",["delete","east","hills","kalamazoo","oak","strip out"]],["has","state"],["has","in"]],"pyramid":["render.str",["transform.remove",{"lit":"michigan"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-e0d0c9e1","guard":[["hasAny",["carmel","elkhart","hammond","jeffersonville","leading zeros","muncie","pad with","padded to","zero pad"]],["words<=",6],["has","state"]],"pyramid":["render.str",["transform.padStart",{"lit":"indiana"},["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-4f1cd983","guard":[["hasAny",["frisco","missouri","tyler","victoria"]],["has","state"],["not",["colon"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-5f6cc7bb","guard":[["hasAny",["asheville","charlotte","greensboro","raleigh"]],["has","state"],["not",["has","of"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North Carolina."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-26f0c2b3","guard":[["hasAny",["asheville","change to","charlotte","greensboro","item number","nth","position","raleigh","replace","substitute","swap"]],["has","state"],["not",["has","of"]]],"pyramid":["render.str",["transform.replace",{"lit":"North Carolina"},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-2a59ecd3","guard":[["hasAny",["antioch","arcadia","berkeley","change to","item number","nth","paramount","position","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"California"}]],"mem":null},
{"id":"n-65b9353c","guard":[["hasAny",["antioch","arcadia","berkeley","change to","item number","nth","paramount","position","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"california"}]],"mem":null},
{"id":"n-c322dd46","guard":[["hasAny",["antioch","arcadia","berkeley","change to","item number","nth","paramount","position","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["sense.lastWord"],{"lit":"california"}]],"mem":null},
{"id":"n-c70966c7","guard":[["hasAny",["antioch","arcadia","berkeley","change to","item number","nth","paramount","position","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["sense.lastWord"],{"lit":"California"}]],"mem":null},
{"id":"n-74e7b82c","guard":[["hasAny",["count","east","farmington","how many","how many items","kalamazoo","normalise","normalize","number of items","oak","simplify the text"]],["has","state"]],"pyramid":["render.str",["transform.norm",{"lit":"Michigan"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-8cc74a70","guard":[["hasAny",["beach","hill","how many","how many items","normalise","normalize","number of items","pensacola","simplify the text","tallahassee"]],["has","in"]],"pyramid":["render.str",["transform.norm",{"lit":"Florida"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-f90bea61","guard":[["hasAny",["east","farmington","how many","how many items","kalamazoo","normalise","normalize","number of items","oak","simplify the text"]],["has","state"]],"pyramid":["render.str",["transform.norm",{"lit":"Michigan"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-0e3b2666","guard":[["hasAny",["asheville","charlotte","greensboro","raleigh","separate by","split by"]],["has","state"],["not",["has","of"]]],"pyramid":["render.lines",["transform.split",{"lit":"North Carolina"},["sense.lastWord"]]],"mem":null},
{"id":"n-1cb9f596","guard":[["hasAny",["asheville","charlotte","delete","greensboro","raleigh","strip out"]],["has","state"],["not",["has","of"]]],"pyramid":["render.str",["transform.remove",{"lit":"North Carolina"},["sense.lastWord"]]],"mem":null},
{"id":"n-27e18bc0","guard":[["hasAny",["asheville","charlotte","greensboro","raleigh","separate by","split by"]],["has","state"],["not",["has","of"]]],"pyramid":["render.and",["transform.split",{"lit":"North Carolina"},["sense.lastWord"]]],"mem":null},
{"id":"n-db8ba1ef","guard":[["hasAny",["asheville","charlotte","greensboro","raleigh","separate by","split by"]],["has","state"],["not",["has","of"]]],"pyramid":["render.list",["transform.split",{"lit":"North Carolina"},["sense.lastWord"]]],"mem":null},
{"id":"n-07df0b8c","guard":[["hasAny",["beach","delete","hill","lucie","remove","strip out","tallahassee"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"florida"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-41e7bcd4","guard":[["hasAny",["coast","hill","leading zeros","pad with","padded to","pensacola","tallahassee","zero pad"]],["has","state"],["words<=",7]],"pyramid":["render.str",["transform.padStart",{"lit":"florida"},["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-4fdbe1e3","guard":[["hasAny",["coast","hill","leading zeros","pad with","padded to","pensacola","tallahassee","zero pad"]],["has","state"],["words<=",7]],"pyramid":["render.str",["transform.padStart",{"lit":"florida"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-8ce53092","guard":[["hasAny",["beach","delete","hill","lucie","remove","strip out","tallahassee"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"Florida"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-de48c1ff","guard":[["hasAny",["coast","hill","leading zeros","pad with","padded to","pensacola","tallahassee","zero pad"]],["has","state"],["words<=",7]],"pyramid":["render.str",["transform.padStart",{"lit":"Florida"},["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-ed084997","guard":[["hasAny",["coast","hill","leading zeros","pad with","padded to","pensacola","tallahassee","zero pad"]],["has","state"],["words<=",7]],"pyramid":["render.str",["transform.padStart",{"lit":"Florida"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-eeb135f5","guard":[["hasAny",["asheville","change to","charlotte","greensboro","raleigh","replace","substitute"]],["has","state"],["not",["has","of"]]],"pyramid":["render.str",["transform.replace",{"lit":"North Carolina"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-122add6f","guard":[["hasAny",["estates","schaumburg","waukegan"]],["not",["has","of"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Illinois."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-279c86e7","guard":[["hasAny",["hartford","meriden","milford"]],["words<=",7]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-7a09e8cd","guard":[["hasAny",["atlanta","county","valdosta"]],["has","state"],["not",["has","of"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Georgia."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-b1cce4a6","guard":[["hasAny",["babylon","hicksville","tonawanda"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-bda91b01","guard":[["hasAny",["fall","lowell","somerville"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Massachusetts."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-ce05b808","guard":[["hasAny",["janesville","waukesha","wauwatosa"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-97e1ce27","guard":[["hasAny",["atlanta","county","item number","leading zeros","nth","pad","pad with","padded to","position","valdosta","zero pad"]],["has","state"],["not",["has","of"]]],"pyramid":["render.str",["transform.padStart",{"lit":"Georgia"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-9badd3a8","guard":[["hasAny",["estates","item number","leading zeros","nth","pad","pad with","padded to","position","schaumburg","waukegan","zero pad"]],["not",["has","of"]]],"pyramid":["render.str",["transform.padStart",{"lit":"Illinois"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-33c6f5d3","guard":[["hasAny",["characters from","dayton","des","euclid","item number","letters from to","nth","position","slice of the text","substring"]],["has","state"],["not",["has","of"]],["not",["has","for"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],{"lit":1},{"lit":4}]],"mem":null},
{"id":"n-611fb189","guard":[["hasAny",["carmel","hammond","how many","how many items","muncie","normalise","normalize","number of items","simplify the text"]],["has","which"]],"pyramid":["render.str",["transform.norm",{"lit":"Indiana"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-6f58c452","guard":[["hasAny",["carmel","count","hammond","how many","how many items","muncie","normalise","normalize","number of items","simplify the text"]],["has","which"]],"pyramid":["render.str",["transform.norm",{"lit":"Indiana"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-375fe774","guard":[["hasAny",["club","oakland","pensacola"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["sense.lastWord"]],"mem":null},
{"id":"n-13c8b604","guard":[["hasAny",["babylon","hicksville","longest","longest one","longest word","tonawanda"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-269e26d7","guard":[["hasAny",["club","invert case","oakland","pensacola","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3dc77dd1","guard":[["hasAny",["dearborn","kalamazoo","lansing","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8c8c1b50","guard":[["hasAny",["janesville","longest","longest one","longest word","waukesha","wauwatosa"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-8cc2a079","guard":[["hasAny",["dearborn","kalamazoo","lansing","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-931eed21","guard":[["hasAny",["club","lower case","lowercase","oakland","pensacola","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a67e0b8d","guard":[["hasAny",["all caps","capital letters","capitals","club","oakland","pensacola","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-af0c9242","guard":[["hasAny",["babylon","hicksville","longest","longest one","longest word","tonawanda"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-e3ae47ca","guard":[["hasAny",["janesville","longest","longest one","longest word","waukesha","wauwatosa"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e9f52fd6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","club","oakland","pensacola","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-16b48671","guard":[["hasAny",["delete","east","farmington","oak","remove","strip out","without"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"Michigan"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-300f8704","guard":[["hasAny",["carmel","delete","hammond","muncie","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Indiana"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-480ef3d4","guard":[["hasAny",["estates","schaumburg","separate by","split by","waukegan"]],["not",["has","of"]]],"pyramid":["render.and",["transform.split",{"lit":"Illinois"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-4f6195b8","guard":[["hasAny",["frisco","item number","nth","position","tyler","victoria"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-52071e53","guard":[["hasAny",["club","leading zeros","oakland","pad with","padded to","pensacola","zero pad"]],["has","in"]],"pyramid":["render.str",["transform.padStart",{"lit":"florida"},{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-5b7c5eb0","guard":[["hasAny",["estates","schaumburg","separate by","split by","waukegan"]],["not",["has","of"]]],"pyramid":["render.list",["transform.split",{"lit":"Illinois"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-6845afb8","guard":[["hasAny",["carmel","delete","hammond","muncie","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"indiana"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-6d80b3f3","guard":[["hasAny",["club","each word","oakland","pensacola","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6e589f66","guard":[["hasAny",["delete","east","farmington","oak","remove","strip out"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"michigan"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-6f02554e","guard":[["hasAny",["carmel","hammond","item number","muncie","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Indiana."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-73b8d4b1","guard":[["hasAny",["delete","east","farmington","oak","remove","strip out","without"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"michigan"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-758c5c66","guard":[["hasAny",["delete","estates","schaumburg","strip out","waukegan"]],["not",["has","of"]]],"pyramid":["render.str",["transform.remove",{"lit":"Illinois"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-80b616e0","guard":[["hasAny",["estates","leading zeros","pad with","padded to","schaumburg","waukegan","zero pad"]],["not",["has","of"]]],"pyramid":["render.str",["transform.padStart",{"lit":"Illinois"},["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-921b90da","guard":[["hasAny",["estates","schaumburg","separate by","split by","waukegan"]],["not",["has","of"]]],"pyramid":["render.lines",["transform.split",{"lit":"Illinois"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-98a65a6c","guard":[["hasAny",["club","delete","oakland","pensacola","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Florida"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-9a165148","guard":[["hasAny",["club","leading zeros","oakland","pad with","padded to","pensacola","zero pad"]],["has","in"]],"pyramid":["render.str",["transform.padStart",{"lit":"Florida"},{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-c3a9ac51","guard":[["hasAny",["delete","east","farmington","oak","remove","strip out"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"Michigan"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-dab4ea12","guard":[["hasAny",["carmel","delete","hammond","muncie","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Indiana"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-e23475e8","guard":[["hasAny",["club","delete","oakland","pensacola","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"florida"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-e99daacd","guard":[["hasAny",["estates","leading zeros","pad with","padded to","schaumburg","waukegan","zero pad"]],["not",["has","of"]]],"pyramid":["render.str",["transform.padStart",{"lit":"Illinois"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-fa76cf5a","guard":[["hasAny",["carmel","delete","hammond","muncie","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"indiana"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-473c9fd6","guard":[["hasAny",["chattanooga","hendersonville"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-608595de","guard":[["hasAny",["denver","parker"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Colorado."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-7bb17f15","guard":[["hasAny",["kennewick","seattle"]],["words<=",7],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-8edd76ba","guard":[["hasAny",["joseph","peters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Missouri."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-be124120","guard":[["hasAny",["birmingham","montgomery"]],["has","state"],["not",["has","maryland"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-c3da9ceb","guard":[["hasAny",["lawton","midwest"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oklahoma."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-d00cf309","guard":[["hasAny",["enterprise","las"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Nevada."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-da8b8c60","guard":[["hasAny",["dayton","euclid"]],["words<=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ohio."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-ebdbfc64","guard":[["hasAny",["passaic","vineland"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New Jersey."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-f0a1bcf7","guard":[["hasAny",["buckeye","sierra"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arizona."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-05fce652","guard":[["hasAny",["asheville","change to","item number","nth","position","raleigh","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["sense.lastWord"],{"lit":"North Carolina"}]],"mem":null},
{"id":"n-75c2e2bf","guard":[["hasAny",["asheville","change to","item number","nth","position","raleigh","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"North Carolina"}]],"mem":null},
{"id":"n-a6b71e40","guard":[["hasAny",["change to","elkhart","item number","jeffersonville","nth","position","replace","substitute","swap"]],["has","name"]],"pyramid":["render.str",["transform.replace",{"lit":"indiana"},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-f8adf4c3","guard":[["hasAny",["change to","item number","nth","position","replace","schaumburg","substitute","swap","waukegan"]],["has","where"]],"pyramid":["render.str",["transform.replace",{"lit":"Illinois"},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}]]],"mem":null},
{"id":"n-9f417b4b","guard":[["hasAny",["alphabetize the letters","dayton","euclid","item number","letters in order","nth","position","sort the letters"]],["words<=",6]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]],"mem":null},
{"id":"n-1ba8e902","guard":[["hasAny",["alphabetize the letters","camel case","camelcase","dayton","euclid","item number","letters in order","lower camel case","nth","position","sort the letters"]],["words<=",6]],"pyramid":["render.str",["transform.camel",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-31e4b770","guard":[["hasAny",["alphabetize the letters","dayton","euclid","item number","letters in order","lower case","lowercase","nth","position","small letters","sort the letters"]],["words<=",6]],"pyramid":["render.str",["transform.lower",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-4ce522c6","guard":[["hasAny",["alphabetize the letters","dayton","euclid","invert case","item number","letters in order","nth","position","sort the letters","swap case","toggle case"]],["words<=",6]],"pyramid":["render.str",["transform.swapCase",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-5b958b11","guard":[["hasAny",["alphabetize the letters","class name","dayton","euclid","item number","letters in order","nth","pascal case","pascalcase","position","sort the letters","upper camel case"]],["words<=",6]],"pyramid":["render.str",["transform.pascal",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-916c7ae6","guard":[["hasAny",["all caps","alphabetize the letters","capital letters","capitals","dayton","euclid","item number","letters in order","nth","position","sort the letters","upper case","uppercase"]],["words<=",6]],"pyramid":["render.str",["transform.upper",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-c528cfdb","guard":[["hasAny",["alphabetize the letters","dayton","euclid","item number","letters in order","nth","position","snake case","snakecase","sort the letters","underscores","variable name"]],["words<=",6]],"pyramid":["render.str",["transform.snake",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-eb54f5e8","guard":[["hasAny",["alphabetize the letters","dashes","dayton","euclid","hyphens","item number","kebab case","kebabcase","letters in order","nth","position","sort the letters"]],["words<=",6]],"pyramid":["render.str",["transform.kebab",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-fe1dceaa","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","dayton","euclid","item number","letters in order","nth","position","sort the letters","title case"]],["words<=",6]],"pyramid":["render.str",["transform.title",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-5e04b048","guard":[["hasAny",["how many","how many items","meriden","milford","normalise","normalize","number of items","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":"Connecticut"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-163bde31","guard":[["hasAny",["kalamazoo","rochester"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["sense.lastWord"]],"mem":null},
{"id":"n-0c9e1eb5","guard":[["hasAny",["schaumburg","separate by","split by","waukegan"]],["has","where"]],"pyramid":["render.list",["transform.split",{"lit":"Illinois"},["sense.lastWord"]]],"mem":null},
{"id":"n-100f0897","guard":[["hasAny",["delete","schaumburg","strip out","waukegan"]],["has","where"]],"pyramid":["render.str",["transform.remove",{"lit":"Illinois"},["sense.lastWord"]]],"mem":null},
{"id":"n-23ec363a","guard":[["hasAny",["schaumburg","separate by","split by","waukegan"]],["has","where"]],"pyramid":["render.lines",["transform.split",{"lit":"Illinois"},["sense.lastWord"]]],"mem":null},
{"id":"n-2a48c0ec","guard":[["hasAny",["kalamazoo","lower case","lowercase","rochester","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2ce256f3","guard":[["hasAny",["frisco","longest","longest one","longest word","victoria"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5cf62d6d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kalamazoo","rochester","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6ddd512e","guard":[["hasAny",["delete","elkhart","jeffersonville","strip out"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"indiana"},["sense.lastWord"]]],"mem":null},
{"id":"n-8653e2de","guard":[["hasAny",["frisco","longest","longest one","longest word","victoria"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-926dbe19","guard":[["hasAny",["schaumburg","separate by","split by","waukegan"]],["has","where"]],"pyramid":["render.and",["transform.split",{"lit":"Illinois"},["sense.lastWord"]]],"mem":null},
{"id":"n-9c085c98","guard":[["hasAny",["invert case","kalamazoo","rochester","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9e203a1c","guard":[["hasAny",["all caps","capital letters","capitals","kalamazoo","rochester","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-22d60fbc","guard":[["hasAny",["charlotte","greensboro","separate by","split by"]],["has","where"]],"pyramid":["render.and",["transform.split",{"lit":"North Carolina"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-245ad8d5","guard":[["hasAny",["change to","replace","schaumburg","substitute","waukegan"]],["has","where"]],"pyramid":["render.str",["transform.replace",{"lit":"Illinois"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-2cde3769","guard":[["hasAny",["atlanta","leading zeros","pad with","padded to","valdosta","zero pad"]],["has","state"],["words<=",7],["not",["has","dane"]]],"pyramid":["render.str",["transform.padStart",{"lit":"Georgia"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-3e523ccb","guard":[["hasAny",["elkhart","item number","jeffersonville","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Indiana."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5044f5bb","guard":[["hasAny",["delete","fall","lowell","remove","strip out"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"Massachusetts"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-6581095b","guard":[["hasAny",["item number","nth","position","rogers","springdale"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arkansas."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-696f3dd7","guard":[["hasAny",["item number","nth","position","waukesha","wauwatosa"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-76dda602","guard":[["hasAny",["delete","hills","kalamazoo","remove","strip out"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"michigan"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-8880aac4","guard":[["hasAny",["asheville","delete","raleigh","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"North Carolina"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-8a7d2800","guard":[["hasAny",["delete","meriden","milford","remove","strip out","without"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"Connecticut"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-909bdb85","guard":[["hasAny",["each word","kalamazoo","rochester","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-972836df","guard":[["hasAny",["atlanta","leading zeros","pad with","padded to","valdosta","zero pad"]],["has","state"],["words<=",7],["not",["has","dane"]]],"pyramid":["render.str",["transform.padStart",{"lit":"Georgia"},["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-9aceb030","guard":[["hasAny",["charlotte","delete","greensboro","strip out"]],["has","where"]],"pyramid":["render.str",["transform.remove",{"lit":"North Carolina"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-9fcba3f6","guard":[["hasAny",["delete","meriden","milford","strip out"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"Connecticut"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-a2573a7a","guard":[["hasAny",["charlotte","greensboro","separate by","split by"]],["has","where"]],"pyramid":["render.lines",["transform.split",{"lit":"North Carolina"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-a67e1751","guard":[["hasAny",["item number","lawton","midwest","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oklahoma."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ab29e743","guard":[["hasAny",["delete","fall","lowell","strip out"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"Massachusetts"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-bb017b44","guard":[["hasAny",["change to","elkhart","jeffersonville","replace","substitute"]],["has","name"]],"pyramid":["render.str",["transform.replace",{"lit":"indiana"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-c01e2817","guard":[["hasAny",["delete","hills","kalamazoo","remove","strip out"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"Michigan"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-e1e4566c","guard":[["hasAny",["asheville","delete","raleigh","strip out"]],["has","in"]],"pyramid":["render.str",["transform.remove",{"lit":"North Carolina"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-e89bb6e1","guard":[["hasAny",["charlotte","greensboro","separate by","split by"]],["has","where"]],"pyramid":["render.list",["transform.split",{"lit":"North Carolina"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-22d1aac0","guard":[["hasAny",["buckeye","longest","longest one","longest word","normalise","normalize","sierra","simplify the text"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5e4a0924","guard":[["hasAny",["beach","hill","item number","longest","longest one","longest word","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6209287f","guard":[["hasAny",["lawton","longest","longest one","longest word","midwest","normalise","normalize","simplify the text"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oklahoma."]},["aggregate.longest",["sense.words"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-9be94ee0","guard":[["hasAny",["beach","hill","item number","longest","longest one","longest word","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2df0ba95","guard":[["hasAny",["beach","hill","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-da64e1ec","guard":[["hasAny",["beach","hill","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5ecb77c4","guard":[["hasAny",["city","count","element","how many","how many items","item number","normalise","normalize","nth","number of items","position","simplify the text"]],["has","where"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["aggregate.countStrs",["know.find",{"lit":"corpora-us-cities"},{"lit":"state"}]]]],"mem":null},
{"id":"n-099c1fd0","guard":[["has","des"],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Iowa."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-154dfb12","guard":[["has","anchorage"],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alaska."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-2c29d3ac","guard":[["has","casper"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wyoming."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-2f684d23","guard":[["has","bethesda"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Maryland."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-39804ef8","guard":[["has","burnsville"],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Minnesota."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-3c8ffcd3","guard":[["has","meridian"],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Idaho."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-3f9c3788","guard":[["has","blacksburg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-992fcad5","guard":[["has","nashua"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New Hampshire."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-d5afb365","guard":[["has","rancho"],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New Mexico."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-dad36474","guard":[["has","rogers"],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arkansas."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-e6d12880","guard":[["has","aloha"],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oregon."]},["render.list",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}]]],"mem":null},
{"id":"n-13fb3397","guard":[["hasAny",["change to","item number","nth","pensacola","position","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["sense.lastWord"],{"lit":"florida"}]],"mem":null},
{"id":"n-1eca95a1","guard":[["hasAny",["change to","item number","lowell","nth","position","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["sense.lastWord"],{"lit":"Massachusetts"}]],"mem":null},
{"id":"n-357feb4d","guard":[["hasAny",["change to","item number","kalamazoo","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["sense.lastWord"],{"lit":"michigan"}]],"mem":null},
{"id":"n-383c437e","guard":[["hasAny",["change to","item number","meriden","nth","position","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"Connecticut"}]],"mem":null},
{"id":"n-3aa1d5dd","guard":[["hasAny",["change to","frisco","item number","nth","position","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["sense.lastWord"],{"lit":"Texas"}]],"mem":null},
{"id":"n-4a2a3d2a","guard":[["hasAny",["change to","item number","meriden","nth","position","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["sense.lastWord"],{"lit":"Connecticut"}]],"mem":null},
{"id":"n-545010ed","guard":[["hasAny",["change to","item number","lowell","nth","position","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"Massachusetts"}]],"mem":null},
{"id":"n-7af71cdc","guard":[["hasAny",["change to","item number","kalamazoo","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"michigan"}]],"mem":null},
{"id":"n-9f30041d","guard":[["hasAny",["change to","item number","nth","pensacola","position","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["sense.lastWord"],{"lit":"Florida"}]],"mem":null},
{"id":"n-b9cc8a8e","guard":[["hasAny",["change to","item number","kalamazoo","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"Michigan"}]],"mem":null},
{"id":"n-bdcb206a","guard":[["hasAny",["change to","frisco","item number","nth","position","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"Texas"}]],"mem":null},
{"id":"n-cff25610","guard":[["hasAny",["change to","item number","kalamazoo","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],["sense.lastWord"],{"lit":"Michigan"}]],"mem":null},
{"id":"n-d9edc998","guard":[["hasAny",["change to","item number","nth","pensacola","position","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"florida"}]],"mem":null},
{"id":"n-e39f65b0","guard":[["hasAny",["change to","item number","nth","pensacola","position","replace","substitute","swap"]],["has","in"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"Florida"}]],"mem":null},
{"id":"n-004e6c49","guard":[["hasAny",["item number","meriden","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Meriden is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-010c878d","guard":[["hasAny",["item number","nth","position","tyler"]],["has","state"]],"pyramid":["render.template",{"lit":["Tyler is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-02ecb744","guard":[["hasAny",["item number","nth","position","waukesha"]]],"pyramid":["render.template",{"lit":["Waukesha is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-0720b564","guard":[["hasAny",["dayton","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Dayton is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-0813eb19","guard":[["hasAny",["birmingham","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":["Birmingham is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-09a6d087","guard":[["hasAny",["atlanta","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Atlanta is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-0b23f989","guard":[["hasAny",["chattanooga","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Chattanooga is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-0c9a3a2a","guard":[["hasAny",["burnsville","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":["Burnsville is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-0ccb17f4","guard":[["hasAny",["item number","nth","position","redlands"]],["has","which"]],"pyramid":["render.template",{"lit":["Redlands is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-0d749b32","guard":[["hasAny",["casper","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Casper is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-0e8f12cd","guard":[["hasAny",["carmel","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Carmel is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-10d7c403","guard":[["hasAny",["item number","nth","position","raleigh"]],["has","in"]],"pyramid":["render.template",{"lit":["Raleigh is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-10f98f8d","guard":[["hasAny",["greensboro","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":["Greensboro is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-11345378","guard":[["hasAny",["item number","meridian","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":["Meridian is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-1637ef8e","guard":[["hasAny",["item number","joseph","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["St. Joseph is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-1afaca46","guard":[["hasAny",["item number","nth","position","victoria"]],["has","name"]],"pyramid":["render.template",{"lit":["Victoria is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-1cb357de","guard":[["hasAny",["aloha","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":["Aloha is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-1cf44e6c","guard":[["hasAny",["anchorage","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":["Anchorage is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-1e60b3f8","guard":[["hasAny",["item number","nth","position","wauwatosa"]],["has","in"]],"pyramid":["render.template",{"lit":["Wauwatosa is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-21e249d3","guard":[["hasAny",["denver","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":["Denver is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-24d17a1c","guard":[["hasAny",["item number","nth","paramount","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Paramount is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-26275399","guard":[["hasAny",["corona","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Corona is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-27902a0c","guard":[["hasAny",["county","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Macon-Bibb County is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-27908b7f","guard":[["hasAny",["elkhart","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Elkhart is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-27e168fe","guard":[["hasAny",["coast","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Palm Coast is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-33979d31","guard":[["hasAny",["item number","lynwood","nth","position"]]],"pyramid":["render.template",{"lit":["Lynwood is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-3c57ec56","guard":[["hasAny",["item number","las","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["North Las Vegas is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-3d397fc3","guard":[["hasAny",["item number","nth","position","valdosta"]],["has","us"]],"pyramid":["render.template",{"lit":["Valdosta is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-3df6210f","guard":[["hasAny",["item number","nth","pensacola","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Pensacola is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-41b5f4e4","guard":[["hasAny",["asheville","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Asheville is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-462d061f","guard":[["hasAny",["item number","nth","position","vineland"]]],"pyramid":["render.template",{"lit":["Vineland is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-484bed4c","guard":[["hasAny",["item number","nth","position","sierra"]],["has","in"]],"pyramid":["render.template",{"lit":["Sierra Vista is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-489b3cf6","guard":[["hasAny",["beach","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":["Boynton Beach is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-4df1ce3f","guard":[["hasAny",["item number","nth","position","schaumburg"]],["has","name"]],"pyramid":["render.template",{"lit":["Schaumburg is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-4e6676e5","guard":[["hasAny",["dearborn","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Dearborn is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-50ae45ef","guard":[["hasAny",["carson","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":["Carson is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-516f60c2","guard":[["hasAny",["item number","kalamazoo","nth","position"]]],"pyramid":["render.template",{"lit":["Kalamazoo is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-51df76c6","guard":[["hasAny",["item number","luis","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":["San Luis Obispo is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-5587e9f9","guard":[["hasAny",["enterprise","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Enterprise is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-58e61112","guard":[["hasAny",["item number","nth","position","tallahassee"]],["has","which"]],"pyramid":["render.template",{"lit":["Tallahassee is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-59460da8","guard":[["hasAny",["item number","nth","position","rancho"]],["has","in"]],"pyramid":["render.template",{"lit":["Rio Rancho is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-59642c48","guard":[["hasAny",["estates","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Hoffman Estates is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-598473bd","guard":[["hasAny",["antioch","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Antioch is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-59878f45","guard":[["hasAny",["item number","lucie","nth","position"]]],"pyramid":["render.template",{"lit":["Port St. Lucie is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-5a5d29a1","guard":[["hasAny",["item number","kennewick","nth","position"]]],"pyramid":["render.template",{"lit":["Kennewick is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-64e7280a","guard":[["hasAny",["item number","nth","passaic","position"]]],"pyramid":["render.template",{"lit":["Passaic is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-6ab04c7b","guard":[["hasAny",["item number","lawton","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Lawton is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-6c6a047f","guard":[["hasAny",["item number","janesville","nth","position"]]],"pyramid":["render.template",{"lit":["Janesville is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-6eb3abdd","guard":[["hasAny",["item number","nth","oak","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Royal Oak is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-78b0a464","guard":[["hasAny",["frisco","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Frisco is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-78e73e52","guard":[["hasAny",["item number","nth","position","yuba"]],["has","us"]],"pyramid":["render.template",{"lit":["Yuba City is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-83b22b54","guard":[["hasAny",["fall","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Fall River is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-87ee30c5","guard":[["hasAny",["item number","nth","position","rochester"]],["has","in"]],"pyramid":["render.template",{"lit":["Rochester Hills is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-884a6d60","guard":[["hasAny",["item number","missouri","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Missouri City is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-8c3ad09a","guard":[["hasAny",["item number","milford","nth","position"]]],"pyramid":["render.template",{"lit":["Milford is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-926d06df","guard":[["hasAny",["creek","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Walnut Creek is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-928bfb8c","guard":[["hasAny",["huntington","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":["Huntington Park is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-930cb0b0","guard":[["hasAny",["castro","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Castro Valley is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-95c1e22e","guard":[["hasAny",["gardena","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Gardena is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-987397ae","guard":[["hasAny",["item number","nth","position","somerville"]]],"pyramid":["render.template",{"lit":["Somerville is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-98a0aacf","guard":[["hasAny",["hendersonville","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Hendersonville is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-9c3ec41b","guard":[["hasAny",["des","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["West Des Moines is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-a1069653","guard":[["hasAny",["item number","nth","position","waukegan"]],["has","where"]],"pyramid":["render.template",{"lit":["Waukegan is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-a27ee71c","guard":[["hasAny",["hicksville","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Hicksville is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-a60c3766","guard":[["hasAny",["ardenarcade","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Arden-Arcade is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-aabf78a0","guard":[["hasAny",["item number","nth","oakland","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Oakland Park is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-aaf6c64a","guard":[["hasAny",["item number","nashua","nth","position"]]],"pyramid":["render.template",{"lit":["Nashua is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-b0b2b56b","guard":[["hasAny",["item number","melbourne","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Melbourne is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-b1f7b1b8","guard":[["hasAny",["bethesda","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Bethesda is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-b233ef55","guard":[["hasAny",["item number","montgomery","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Montgomery is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-b3b385dd","guard":[["hasAny",["anaheim","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Anaheim is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-b526da3c","guard":[["hasAny",["item number","jeffersonville","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Jeffersonville is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-bead1856","guard":[["hasAny",["charlotte","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Charlotte is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-c248e8b9","guard":[["hasAny",["hartford","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["East Hartford is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-c4a80444","guard":[["hasAny",["hill","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":["Spring Hill is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-c4cc02ee","guard":[["hasAny",["item number","monica","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Santa Monica is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-c8114238","guard":[["hasAny",["buckeye","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Buckeye is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-c97b9952","guard":[["hasAny",["arcadia","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Arcadia is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-cb54421b","guard":[["hasAny",["item number","lowell","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Lowell is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-cb56d6cb","guard":[["hasAny",["item number","nth","position","tonawanda"]],["has","us"]],"pyramid":["render.template",{"lit":["Tonawanda is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-d6d67fb8","guard":[["hasAny",["item number","midwest","nth","position"]]],"pyramid":["render.template",{"lit":["Midwest City is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-d99e1e79","guard":[["hasAny",["item number","nth","position","rosemead"]]],"pyramid":["render.template",{"lit":["Rosemead is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-dd786963","guard":[["hasAny",["euclid","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Euclid is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-e35acbaf","guard":[["hasAny",["item number","nth","parker","position"]],["has","us"]],"pyramid":["render.template",{"lit":["Parker is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-e388b1c0","guard":[["hasAny",["item number","nth","peters","position"]],["has","which"]],"pyramid":["render.template",{"lit":["St. Peters is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-e3cda7a3","guard":[["hasAny",["ceres","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Ceres is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-e9f3cadf","guard":[["hasAny",["hammond","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Hammond is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-ecc96d25","guard":[["hasAny",["item number","nth","position","rogers"]],["has","state"]],"pyramid":["render.template",{"lit":["Rogers is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-ece0a36a","guard":[["hasAny",["item number","nth","position","seattle"]],["has","where"]],"pyramid":["render.template",{"lit":["Seattle is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-ed152b7b","guard":[["hasAny",["falls","item number","nth","position"]],["has","where"]],"pyramid":["render.template",{"lit":["Wichita Falls is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-eeb31969","guard":[["hasAny",["item number","nth","position","springdale"]],["has","in"]],"pyramid":["render.template",{"lit":["Springdale is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-f0b79d4b","guard":[["hasAny",["blacksburg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Blacksburg is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-f2d8df20","guard":[["hasAny",["babylon","item number","nth","position"]]],"pyramid":["render.template",{"lit":["West Babylon is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-f45f6c31","guard":[["hasAny",["florin","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":["Florin is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-f5b554a6","guard":[["hasAny",["item number","muncie","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Muncie is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-f7634f6d","guard":[["hasAny",["item number","lansing","nth","position"]]],"pyramid":["render.template",{"lit":["East Lansing is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-fdb9c7ea","guard":[["hasAny",["farmington","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Farmington Hills is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-fe9d8eab","guard":[["hasAny",["club","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Country Club is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-ff2cb49b","guard":[["hasAny",["berkeley","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Berkeley is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}]],"mem":null},
{"id":"n-1a25a344","guard":[["hasAny",["city","delete","element","item number","nth","position","remove","strip out","without"]],["has","where"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"US city"}],{"lit":1}],{"lit":"corpora-us-cities"},{"lit":"US city"},{"lit":"state"}],["transform.nthStr",["know.find",{"lit":"corpora-us-cities"},{"lit":"state"}],{"lit":1}]]],"mem":null},
{"id":"n-20e99a95","guard":[["hasAny",["frisco","how many","how many items","normalise","normalize","number of items","simplify the text"]],["has","in"]],"pyramid":["render.str",["transform.norm",{"lit":"Texas"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-79a89537","guard":[["hasAny",["estates","how many","how many items","normalise","normalize","number of items","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":"Illinois"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-9a6cf4c2","guard":[["hasAny",["how many","how many items","normalise","normalize","number of items","simplify the text","valdosta"]],["has","us"]],"pyramid":["render.str",["transform.norm",{"lit":"Georgia"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-b50e008b","guard":[["hasAny",["how many","how many items","lowell","normalise","normalize","number of items","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":"Massachusetts"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-01871aca","guard":[["has","creek"],["has","in"]],"pyramid":["render.template",{"lit":["Walnut ",{"slot":0}," is in California."]},["sense.lastWord"]],"mem":null},
{"id":"n-032f721c","guard":[["hasAny",["asheville","city","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Asheville":"Asheville is in North Carolina."}}},
{"id":"n-036b960a","guard":[["hasAny",["dayton","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Dayton in":"Dayton is in Ohio."}}},
{"id":"n-04d03691","guard":[["hasAny",["lies","name","somerville","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Somerville lies":"Somerville is in Massachusetts."}}},
{"id":"n-066bf37a","guard":[["hasAny",["lies","name","nashua","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Nashua lies":"Nashua is in New Hampshire."}}},
{"id":"n-069781d3","guard":[["hasAny",["denver","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Denver in":"Denver is in Colorado."}}},
{"id":"n-073165ae","guard":[["hasAny",["jeffersonville","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Jeffersonville lies":"Jeffersonville is in Indiana."}}},
{"id":"n-0a1ad0f0","guard":[["hasAny",["city","kalamazoo","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Kalamazoo":"Kalamazoo is in Michigan."}}},
{"id":"n-0c9b02aa","guard":[["has","sierra"],["has","state"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," is in Arizona."]},["sense.lastWord"]],"mem":null},
{"id":"n-0d983b23","guard":[["hasAny",["luis","obispo","san","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is San Luis Obispo in":"San Luis Obispo is in California."}}},
{"id":"n-10028d40","guard":[["hasAny",["city","raleigh","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Raleigh":"Raleigh is in North Carolina."}}},
{"id":"n-12c8e760","guard":[["hasAny",["lawton","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Lawton in":"Lawton is in Oklahoma."}}},
{"id":"n-1398f259","guard":[["hasAny",["estates","hoffman","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Hoffman Estates in":"Hoffman Estates is in Illinois."}}},
{"id":"n-1904f07b","guard":[["hasAny",["buckeye","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Buckeye in":"Buckeye is in Arizona."}}},
{"id":"n-19a7a87d","guard":[["has","meriden"],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["sense.lastWord"]],"mem":null},
{"id":"n-1a0385f0","guard":[["hasAny",["meridian","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Meridian in":"Meridian is in Idaho."}}},
{"id":"n-1b985319","guard":[["hasAny",["lies","name","passaic","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Passaic lies":"Passaic is in New Jersey."}}},
{"id":"n-1e2dad19","guard":[["has","kennewick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["sense.lastWord"]],"mem":null},
{"id":"n-1ef99f02","guard":[["hasAny",["city","lowell","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Lowell":"Lowell is in Massachusetts."}}},
{"id":"n-211cf8fe","guard":[["hasAny",["charlotte","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Charlotte lies":"Charlotte is in North Carolina."}}},
{"id":"n-240a3ec1","guard":[["hasAny",["lies","name","seattle","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Seattle lies":"Seattle is in Washington."}}},
{"id":"n-25a1f52e","guard":[["hasAny",["parker","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Parker in":"Parker is in Colorado."}}},
{"id":"n-26cb1d9d","guard":[["hasAny",["rosemead","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Rosemead in":"Rosemead is in California."}}},
{"id":"n-2d0f4372","guard":[["hasAny",["city","fall","river","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Fall River":"Fall River is in Massachusetts."}}},
{"id":"n-3028be4f","guard":[["hasAny",["city","montgomery","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Montgomery":"Montgomery is in Alabama."}}},
{"id":"n-318c8750","guard":[["hasAny",["state","valdosta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Valdosta in":"Valdosta is in Georgia."}}},
{"id":"n-34677027","guard":[["hasAny",["city","springdale","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Springdale":"Springdale is in Arkansas."}}},
{"id":"n-34d8e2e8","guard":[["has","wauwatosa"],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["sense.lastWord"]],"mem":null},
{"id":"n-34d95728","guard":[["hasAny",["city","sierra","state","vista"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Sierra Vista":"Sierra Vista is in Arizona."}}},
{"id":"n-35b66626","guard":[["hasAny",["casper","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Casper lies":"Casper is in Wyoming."}}},
{"id":"n-394cfdfe","guard":[["hasAny",["peters","st","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is St. Peters in":"St. Peters is in Missouri."}}},
{"id":"n-39ea02b8","guard":[["hasAny",["state","vineland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Vineland in":"Vineland is in New Jersey."}}},
{"id":"n-3aa99736","guard":[["hasAny",["florin","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Florin lies":"Florin is in California."}}},
{"id":"n-41e44d30","guard":[["hasAny",["city","las","north","state","vegas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city North Las Vegas":"North Las Vegas is in Nevada."}}},
{"id":"n-453d1f76","guard":[["hasAny",["farmington","hills","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Farmington Hills in":"Farmington Hills is in Michigan."}}},
{"id":"n-46b855f1","guard":[["hasAny",["city","creek","state","walnut"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Walnut Creek":"Walnut Creek is in California."}}},
{"id":"n-472ba3a5","guard":[["has","hendersonville"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["sense.lastWord"]],"mem":null},
{"id":"n-47da409b","guard":[["hasAny",["anaheim","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Anaheim lies":"Anaheim is in California."}}},
{"id":"n-493ed08a","guard":[["hasAny",["city","oakland","park","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Oakland Park":"Oakland Park is in Florida."}}},
{"id":"n-4e0b3723","guard":[["has","huntington"],["has","state"]],"pyramid":["render.template",{"lit":["Huntington ",{"slot":0}," is in California."]},["sense.lastWord"]],"mem":null},
{"id":"n-4f18e45d","guard":[["hasAny",["carmel","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Carmel in":"Carmel is in Indiana."}}},
{"id":"n-4f2c8d22","guard":[["hasAny",["corona","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Corona lies":"Corona is in California."}}},
{"id":"n-550ffdf6","guard":[["hasAny",["east","lansing","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is East Lansing in":"East Lansing is in Michigan."}}},
{"id":"n-5594d3ec","guard":[["hasAny",["babylon","state","west"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is West Babylon in":"West Babylon is in New York."}}},
{"id":"n-57d81443","guard":[["hasAny",["dearborn","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Dearborn lies":"Dearborn is in Michigan."}}},
{"id":"n-58c0e894","guard":[["hasAny",["city","meriden","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Meriden":"Meriden is in Connecticut."}}},
{"id":"n-5c4650d1","guard":[["hasAny",["lies","name","state","waukesha"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Waukesha lies":"Waukesha is in Wisconsin."}}},
{"id":"n-6063ed22","guard":[["hasAny",["east","hartford","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where East Hartford lies":"East Hartford is in Connecticut."}}},
{"id":"n-61202777","guard":[["hasAny",["city","club","country","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Country Club":"Country Club is in Florida."}}},
{"id":"n-61eff546","guard":[["hasAny",["elkhart","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Elkhart lies":"Elkhart is in Indiana."}}},
{"id":"n-64aeac63","guard":[["hasAny",["hill","spring","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Spring Hill in":"Spring Hill is in Florida."}}},
{"id":"n-6938509e","guard":[["hasAny",["carson","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Carson in":"Carson is in California."}}},
{"id":"n-69b107be","guard":[["hasAny",["anchorage","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Anchorage lies":"Anchorage is in Alaska."}}},
{"id":"n-6ae78c45","guard":[["hasAny",["hammond","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Hammond in":"Hammond is in Indiana."}}},
{"id":"n-6cfb82b5","guard":[["hasAny",["muncie","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Muncie in":"Muncie is in Indiana."}}},
{"id":"n-6daa42c5","guard":[["hasAny",["city","midwest","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Midwest City":"Midwest City is in Oklahoma."}}},
{"id":"n-6ef45d08","guard":[["hasAny",["burnsville","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Burnsville in":"Burnsville is in Minnesota."}}},
{"id":"n-72feeda0","guard":[["hasAny",["antioch","city","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Antioch":"Antioch is in California."}}},
{"id":"n-7adc4cd8","guard":[["hasAny",["city","hicksville","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Hicksville":"Hicksville is in New York."}}},
{"id":"n-7c840a6f","guard":[["hasAny",["city","frisco","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Frisco":"Frisco is in Texas."}}},
{"id":"n-8258b539","guard":[["hasAny",["lies","melbourne","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Melbourne lies":"Melbourne is in Florida."}}},
{"id":"n-8323330f","guard":[["hasAny",["lies","name","state","tyler"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Tyler lies":"Tyler is in Texas."}}},
{"id":"n-86ae7f6a","guard":[["hasAny",["oak","royal","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Royal Oak in":"Royal Oak is in Michigan."}}},
{"id":"n-877ee401","guard":[["hasAny",["city","lies","missouri","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Missouri City lies":"Missouri City is in Texas."}}},
{"id":"n-8991c111","guard":[["hasAny",["state","tonawanda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Tonawanda in":"Tonawanda is in New York."}}},
{"id":"n-8aa3a447","guard":[["hasAny",["bethesda","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Bethesda in":"Bethesda is in Maryland."}}},
{"id":"n-8c4f61e6","guard":[["hasAny",["lies","name","state","waukegan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Waukegan lies":"Waukegan is in Illinois."}}},
{"id":"n-8cfca75b","guard":[["hasAny",["redlands","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Redlands in":"Redlands is in California."}}},
{"id":"n-8e72e44a","guard":[["hasAny",["state","tallahassee"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Tallahassee in":"Tallahassee is in Florida."}}},
{"id":"n-9202bf39","guard":[["hasAny",["janesville","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Janesville in":"Janesville is in Wisconsin."}}},
{"id":"n-97141eff","guard":[["hasAny",["beach","boynton","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Boynton Beach in":"Boynton Beach is in Florida."}}},
{"id":"n-99c4f2a5","guard":[["hasAny",["lucie","port","st","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Port St. Lucie in":"Port St. Lucie is in Florida."}}},
{"id":"n-9e50a8cf","guard":[["hasAny",["city","des","moines","state","west"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city West Des Moines":"West Des Moines is in Iowa."}}},
{"id":"n-a018c7ca","guard":[["hasAny",["aloha","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Aloha lies":"Aloha is in Oregon."}}},
{"id":"n-a617b108","guard":[["hasAny",["castro","lies","name","state","valley"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Castro Valley lies":"Castro Valley is in California."}}},
{"id":"n-a634dd13","guard":[["hasAny",["gardena","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Gardena in":"Gardena is in California."}}},
{"id":"n-a6cd237a","guard":[["hasAny",["chattanooga","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Chattanooga lies":"Chattanooga is in Tennessee."}}},
{"id":"n-a8defeab","guard":[["hasAny",["city","joseph","st","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city St. Joseph":"St. Joseph is in Missouri."}}},
{"id":"n-a97aa43a","guard":[["hasAny",["city","rancho","rio","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Rio Rancho":"Rio Rancho is in New Mexico."}}},
{"id":"n-ad2176b8","guard":[["hasAny",["city","hendersonville","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Hendersonville":"Hendersonville is in Tennessee."}}},
{"id":"n-ae4dad8d","guard":[["hasAny",["city","monica","santa","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Santa Monica":"Santa Monica is in California."}}},
{"id":"n-ae6d59cf","guard":[["hasAny",["ardenarcade","city","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Arden-Arcade":"Arden-Arcade is in California."}}},
{"id":"n-b16ae2da","guard":[["has","blacksburg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["sense.lastWord"]],"mem":null},
{"id":"n-b4226a8f","guard":[["hasAny",["arcadia","city","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Arcadia":"Arcadia is in California."}}},
{"id":"n-b8fb56d9","guard":[["hasAny",["city","paramount","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Paramount":"Paramount is in California."}}},
{"id":"n-bc150aca","guard":[["hasAny",["atlanta","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Atlanta lies":"Atlanta is in Georgia."}}},
{"id":"n-bc311ab8","guard":[["hasAny",["ceres","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Ceres in":"Ceres is in California."}}},
{"id":"n-bf4910c2","guard":[["hasAny",["birmingham","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Birmingham lies":"Birmingham is in Alabama."}}},
{"id":"n-bf538713","guard":[["has","montgomery"],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["sense.lastWord"]],"mem":null},
{"id":"n-c34327ed","guard":[["hasAny",["lies","name","rogers","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Rogers lies":"Rogers is in Arkansas."}}},
{"id":"n-c4c4ede3","guard":[["hasAny",["lies","name","schaumburg","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Schaumburg lies":"Schaumburg is in Illinois."}}},
{"id":"n-c7985d42","guard":[["hasAny",["greensboro","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Greensboro lies":"Greensboro is in North Carolina."}}},
{"id":"n-ccfcfe87","guard":[["hasAny",["euclid","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Euclid lies":"Euclid is in Ohio."}}},
{"id":"n-cd2daa27","guard":[["hasAny",["city","pensacola","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Pensacola":"Pensacola is in Florida."}}},
{"id":"n-cda35e09","guard":[["hasAny",["milford","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Milford in":"Milford is in Connecticut."}}},
{"id":"n-cdd10fa9","guard":[["hasAny",["falls","lies","name","state","wichita"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Wichita Falls lies":"Wichita Falls is in Texas."}}},
{"id":"n-d08bbcde","guard":[["hasAny",["berkeley","city","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Berkeley":"Berkeley is in California."}}},
{"id":"n-d86e9e5d","guard":[["has","hicksville"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["sense.lastWord"]],"mem":null},
{"id":"n-dccc7612","guard":[["has","club"],["has","in"]],"pyramid":["render.template",{"lit":["Country ",{"slot":0}," is in Florida."]},["sense.lastWord"]],"mem":null},
{"id":"n-dce1dfec","guard":[["hasAny",["city","state","yuba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Yuba City in":"Yuba City is in California."}}},
{"id":"n-dd774665","guard":[["hasAny",["county","lies","maconbibb","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Macon-Bibb County lies":"Macon-Bibb County is in Georgia."}}},
{"id":"n-dfb7e1f4","guard":[["hasAny",["city","state","wauwatosa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Wauwatosa":"Wauwatosa is in Wisconsin."}}},
{"id":"n-e0405f83","guard":[["hasAny",["blacksburg","city","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Blacksburg":"Blacksburg is in Virginia."}}},
{"id":"n-e11d201d","guard":[["hasAny",["city","huntington","park","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Huntington Park":"Huntington Park is in California."}}},
{"id":"n-e33014c5","guard":[["has","ardenarcade"]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["sense.lastWord"]],"mem":null},
{"id":"n-e82192f2","guard":[["hasAny",["city","kennewick","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Kennewick":"Kennewick is in Washington."}}},
{"id":"n-ef9564cc","guard":[["hasAny",["lies","lynwood","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Lynwood lies":"Lynwood is in California."}}},
{"id":"n-f1637948","guard":[["has","frisco"],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["sense.lastWord"]],"mem":null},
{"id":"n-f1c600af","guard":[["hasAny",["city","enterprise","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Enterprise":"Enterprise is in Nevada."}}},
{"id":"n-f42aefa2","guard":[["hasAny",["city","hills","rochester","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Rochester Hills":"Rochester Hills is in Michigan."}}},
{"id":"n-f73fb3e3","guard":[["has","rochester"],["has","in"]],"pyramid":["render.template",{"lit":["Rochester ",{"slot":0}," is in Michigan."]},["sense.lastWord"]],"mem":null},
{"id":"n-fb19fb4a","guard":[["hasAny",["lies","name","state","victoria"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Victoria lies":"Victoria is in Texas."}}},
{"id":"n-fcd0a268","guard":[["hasAny",["coast","lies","name","palm","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Palm Coast lies":"Palm Coast is in Florida."}}},
{"id":"n-0e63ba71","guard":[["hasAny",["ardenarcade","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-171a6df1","guard":[["hasAny",["lower case","lowercase","montgomery","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1e160cd5","guard":[["hasAny",["blacksburg","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1e7e154e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hicksville","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1ec57b9c","guard":[["hasAny",["anchorage","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alaska."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-2833204d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","meriden","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2fc02fc0","guard":[["hasAny",["ardenarcade","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-300d8c34","guard":[["hasAny",["huntington","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," Park is in California."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-30d32c44","guard":[["hasAny",["blacksburg","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3229cc65","guard":[["hasAny",["all caps","capital letters","capitals","upper case","uppercase","wauwatosa"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3932ec16","guard":[["hasAny",["lower case","lowercase","meriden","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3bb3157b","guard":[["hasAny",["hendersonville","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-436f217b","guard":[["hasAny",["frisco","invert case","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-45adfaa6","guard":[["hasAny",["invert case","meriden","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-50408d05","guard":[["hasAny",["beach","longest","longest one","longest word"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," Beach is in Florida."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5da1fe17","guard":[["hasAny",["capitalise","capitalize","capitalize each word","montgomery","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5ec874e5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kennewick","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-739b9987","guard":[["hasAny",["lower case","lowercase","small letters","wauwatosa"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7aa49c52","guard":[["hasAny",["invert case","kennewick","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-83e7f8e2","guard":[["hasAny",["hicksville","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-92241bb6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","wauwatosa"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-922fc8ff","guard":[["hasAny",["longest","longest one","longest word","sierra"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," Vista is in Arizona."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9254684a","guard":[["hasAny",["hicksville","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-98d9a874","guard":[["hasAny",["kennewick","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a5dd937f","guard":[["hasAny",["hill","longest","longest one","longest word"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," Hill is in Florida."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a7394391","guard":[["hasAny",["frisco","lower case","lowercase","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a7686543","guard":[["hasAny",["invert case","swap case","toggle case","wauwatosa"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a8e55813","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hendersonville","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a9d3a143","guard":[["hasAny",["capitalise","capitalize","capitalize each word","frisco","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ae5d2bd5","guard":[["hasAny",["invert case","montgomery","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b3e64f28","guard":[["hasAny",["burnsville","longest","longest one","longest word"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Minnesota."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b47ca34f","guard":[["hasAny",["all caps","capital letters","capitals","meriden","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-be4858ab","guard":[["hasAny",["burnsville","longest","longest one","longest word"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Minnesota."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-c949cdee","guard":[["hasAny",["all caps","capital letters","capitals","frisco","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-cf845ec0","guard":[["hasAny",["all caps","capital letters","capitals","montgomery","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-d842da00","guard":[["hasAny",["anchorage","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alaska."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e362a8d5","guard":[["hasAny",["hendersonville","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f4d736ee","guard":[["hasAny",["blacksburg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f5d8a525","guard":[["hasAny",["ardenarcade","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-13b0825e","guard":[["hasAny",["blacksburg","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1dbbb26c","guard":[["hasAny",["anchorage","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alaska."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2a980302","guard":[["hasAny",["longest","longest one","longest word","sierra"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-2f01303a","guard":[["hasAny",["ardenarcade","each word","split into words"]]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3bb7325a","guard":[["hasAny",["characters from","letters from to","rochester","slice of the text","substring"]],["has","in"]],"pyramid":["render.str",["transform.substr",{"lit":"michigan"},{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-3f96a288","guard":[["hasAny",["delete","remove","strip out","valdosta"]]],"pyramid":["render.str",["transform.remove",{"lit":"Georgia"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-43ee87b3","guard":[["hasAny",["burnsville","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Minnesota."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-48f1cafc","guard":[["hasAny",["delete","frisco","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Texas"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-5fb05eea","guard":[["hasAny",["delete","frisco","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Texas"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-606a3e25","guard":[["hasAny",["characters from","letters from to","rochester","slice of the text","substring"]],["has","in"]],"pyramid":["render.str",["transform.substr",{"lit":"Michigan"},{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-6169b233","guard":[["hasAny",["ardenarcade","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-6b87816e","guard":[["hasAny",["item number","nth","peters","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},". Peters is in Missouri."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-71a5e337","guard":[["hasAny",["burnsville","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Minnesota."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-73dd54f4","guard":[["hasAny",["coast","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":["Palm ",{"slot":0}," is in Florida."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-743eac29","guard":[["hasAny",["longest","longest one","longest word","sierra"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-75a34ad0","guard":[["hasAny",["each word","kennewick","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-79d2c119","guard":[["hasAny",["characters from","county","letters from to","slice of the text","substring"]],["has","where"]],"pyramid":["render.str",["transform.substr",{"lit":"Georgia"},{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-8020787b","guard":[["hasAny",["delete","meriden","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Connecticut"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-8689a4b1","guard":[["hasAny",["delete","milford","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Connecticut"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-8876ade3","guard":[["hasAny",["each word","montgomery","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-90941faa","guard":[["hasAny",["delete","estates","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Illinois"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-9eb7bd90","guard":[["hasAny",["anchorage","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alaska."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a0081275","guard":[["hasAny",["coast","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," Coast is in Florida."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ada001c8","guard":[["hasAny",["item number","nth","position","tonawanda"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b5143735","guard":[["hasAny",["dearborn","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b638d5ee","guard":[["hasAny",["each word","meriden","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-be214f1e","guard":[["hasAny",["each word","hendersonville","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bf928e2a","guard":[["hasAny",["each word","split into words","wauwatosa"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c5de2b6d","guard":[["hasAny",["delete","estates","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Illinois"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-cb6c2fd8","guard":[["hasAny",["ardenarcade","each word","split into words"]]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d046976c","guard":[["hasAny",["item number","nth","position","tonawanda"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d08a5465","guard":[["hasAny",["hill","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":["Spring ",{"slot":0}," is in Florida."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-db6af230","guard":[["hasAny",["delete","strip out","valdosta"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"Georgia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-df23ce76","guard":[["hasAny",["each word","frisco","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e137cf03","guard":[["hasAny",["beach","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":["Boynton ",{"slot":0}," is in Florida."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e6aded3c","guard":[["hasAny",["each word","hicksville","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ee2815ee","guard":[["hasAny",["euclid","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ohio."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-18e4c896","guard":[["hasAny",["hill","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5041ea8b","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","sierra","small letters"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5de0be82","guard":[["hasAny",["item number","nth","position","sierra"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-68fd2f80","guard":[["hasAny",["invert case","longest","longest one","longest word","sierra","swap case","toggle case"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7d14b327","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","sierra","title case"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fe1820cb","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","sierra","upper case","uppercase"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-11e5650a","guard":[["hasAny",["item number","longest","longest one","longest word","nth","peters","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-54616fa6","guard":[["hasAny",["item number","longest","longest one","longest word","nth","peters","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6cac84cb","guard":[["hasAny",["item number","longest","longest one","longest word","nth","peters","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-9cbb0cca","guard":[["hasAny",["each word","longest","longest one","longest word","sierra","split into words"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b1da0b9c","guard":[["hasAny",["each word","longest","longest one","longest word","sierra","split into words"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dd5d8a7c","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sierra"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-06e12246","guard":[["hasAny",["coast","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4c7d87a0","guard":[["hasAny",["item number","nth","peters","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5b3b051c","guard":[["has","state"],["not",["has","of"]],["not",["has","for"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Melbourne lies":"Melbourne is in Florida.","in what state is the city Arden-Arcade":"Arden-Arcade is in California.","name the state where Castro Valley lies":"Castro Valley is in California.","which US state is Carmel in":"Carmel is in Indiana.","which US state is Farmington Hills in":"Farmington Hills is in Michigan.","in what state is the city Antioch":"Antioch is in California.","name the state where Tyler lies":"Tyler is in Texas.","in what state is the city Hendersonville":"Hendersonville is in Tennessee.","which US state is Carson in":"Carson is in California.","which US state is Denver in":"Denver is in Colorado.","in what state is the city St. Joseph":"St. Joseph is in Missouri.","which US state is Milford in":"Milford is in Connecticut.","which US state is Boynton Beach in":"Boynton Beach is in Florida.","name the state where Dearborn lies":"Dearborn is in Michigan.","in what state is the city Oakland Park":"Oakland Park is in Florida.","which US state is Hammond in":"Hammond is in Indiana.","name the state where Schaumburg lies":"Schaumburg is in Illinois.","which US state is Lawton in":"Lawton is in Oklahoma.","in what state is the city Springdale":"Springdale is in Arkansas.","in what state is the city Pensacola":"Pensacola is in Florida.","which US state is Ceres in":"Ceres is in California.","name the state where Casper lies":"Casper is in Wyoming.","name the state where Anaheim lies":"Anaheim is in California.","which US state is Gardena in":"Gardena is in California.","which US state is West Babylon in":"West Babylon is in New York.","in what state is the city Meriden":"Meriden is in Connecticut.","in what state is the city Kalamazoo":"Kalamazoo is in Michigan.","name the state where Passaic lies":"Passaic is in New Jersey.","in what state is the city Santa Monica":"Santa Monica is in California.","name the state where Wichita Falls lies":"Wichita Falls is in Texas.","in what state is the city Wauwatosa":"Wauwatosa is in Wisconsin.","which US state is Parker in":"Parker is in Colorado.","in what state is the city West Des Moines":"West Des Moines is in Iowa.","in what state is the city North Las Vegas":"North Las Vegas is in Nevada.","which US state is Rosemead in":"Rosemead is in California.","which US state is Valdosta in":"Valdosta is in Georgia.","name the state where Anchorage lies":"Anchorage is in Alaska.","in what state is the city Rio Rancho":"Rio Rancho is in New Mexico.","which US state is Yuba City in":"Yuba City is in California.","which US state is St. Peters in":"St. Peters is in Missouri.","in what state is the city Lowell":"Lowell is in Massachusetts.","name the state where Nashua lies":"Nashua is in New Hampshire.","which US state is Spring Hill in":"Spring Hill is in Florida.","in what state is the city Country Club":"Country Club is in Florida.","which US state is Burnsville in":"Burnsville is in Minnesota.","which US state is Buckeye in":"Buckeye is in Arizona.","name the state where Chattanooga lies":"Chattanooga is in Tennessee.","name the state where Birmingham lies":"Birmingham is in Alabama.","in what state is the city Sierra Vista":"Sierra Vista is in Arizona.","in what state is the city Huntington Park":"Huntington Park is in California.","name the state where Lynwood lies":"Lynwood is in California.","which US state is Dayton in":"Dayton is in Ohio.","name the state where Florin lies":"Florin is in California.","which US state is Bethesda in":"Bethesda is in Maryland.","in what state is the city Walnut Creek":"Walnut Creek is in California.","which US state is Janesville in":"Janesville is in Wisconsin.","in what state is the city Enterprise":"Enterprise is in Nevada.","which US state is Muncie in":"Muncie is in Indiana.","name the state where Palm Coast lies":"Palm Coast is in Florida.","name the state where Euclid lies":"Euclid is in Ohio.","in what state is the city Asheville":"Asheville is in North Carolina.","in what state is the city Hicksville":"Hicksville is in New York.","which US state is Hoffman Estates in":"Hoffman Estates is in Illinois.","name the state where Missouri City lies":"Missouri City is in Texas.","name the state where East Hartford lies":"East Hartford is in Connecticut.","in what state is the city Fall River":"Fall River is in Massachusetts.","which US state is Tonawanda in":"Tonawanda is in New York.","name the state where Corona lies":"Corona is in California.","which US state is East Lansing in":"East Lansing is in Michigan.","name the state where Waukesha lies":"Waukesha is in Wisconsin.","name the state where Somerville lies":"Somerville is in Massachusetts.","name the state where Rogers lies":"Rogers is in Arkansas.","name the state where Atlanta lies":"Atlanta is in Georgia.","name the state where Victoria lies":"Victoria is in Texas.","which US state is San Luis Obispo in":"San Luis Obispo is in California.","which US state is Redlands in":"Redlands is in California.","name the state where Macon-Bibb County lies":"Macon-Bibb County is in Georgia.","in what state is the city Kennewick":"Kennewick is in Washington.","which US state is Royal Oak in":"Royal Oak is in Michigan.","which US state is Vineland in":"Vineland is in New Jersey.","in what state is the city Arcadia":"Arcadia is in California.","in what state is the city Montgomery":"Montgomery is in Alabama.","in what state is the city Berkeley":"Berkeley is in California.","in what state is the city Midwest City":"Midwest City is in Oklahoma.","in what state is the city Raleigh":"Raleigh is in North Carolina.","name the state where Aloha lies":"Aloha is in Oregon.","name the state where Charlotte lies":"Charlotte is in North Carolina.","name the state where Jeffersonville lies":"Jeffersonville is in Indiana.","which US state is Port St. Lucie in":"Port St. Lucie is in Florida.","in what state is the city Blacksburg":"Blacksburg is in Virginia.","in what state is the city Frisco":"Frisco is in Texas.","in what state is the city Rochester Hills":"Rochester Hills is in Michigan.","which US state is Tallahassee in":"Tallahassee is in Florida.","name the state where Seattle lies":"Seattle is in Washington.","in what state is the city Paramount":"Paramount is in California.","which US state is Meridian in":"Meridian is in Idaho.","name the state where Waukegan lies":"Waukegan is in Illinois.","name the state where Greensboro lies":"Greensboro is in North Carolina.","name the state where Elkhart lies":"Elkhart is in Indiana."}}},
{"id":"n-06718f4d","guard":[["has","passaic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Passaic lies":"Passaic is in New Jersey."}}},
{"id":"n-09308096","guard":[["has","aloha"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Aloha lies":"Aloha is in Oregon."}}},
{"id":"n-09686c2f","guard":[["has","waukegan"],["has","where"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Waukegan lies":"Waukegan is in Illinois."}}},
{"id":"n-11e05e23","guard":[["has","dearborn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Dearborn lies":"Dearborn is in Michigan."}}},
{"id":"n-1d73a70d","guard":[["hasAny",["falls","wichita"]],["has","where"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Wichita Falls lies":"Wichita Falls is in Texas."}}},
{"id":"n-1ec6e7b0","guard":[["hasAny",["bethesda","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Bethesda in":"Bethesda is in Maryland."}}},
{"id":"n-1ff3ac9d","guard":[["hasAny",["city","des","moines","state","west"]],["has","in"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city West Des Moines":"West Des Moines is in Iowa."}}},
{"id":"n-21027644","guard":[["has","euclid"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Euclid lies":"Euclid is in Ohio."}}},
{"id":"n-2566f7c7","guard":[["hasAny",["county","maconbibb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Macon-Bibb County lies":"Macon-Bibb County is in Georgia."}}},
{"id":"n-2c3a15be","guard":[["hasAny",["redlands","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Redlands in":"Redlands is in California."}}},
{"id":"n-2e1a01f8","guard":[["has","nashua"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Nashua lies":"Nashua is in New Hampshire."}}},
{"id":"n-2e5804bf","guard":[["has","yuba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Yuba City in":"Yuba City is in California."}}},
{"id":"n-31c01859","guard":[["hasAny",["burnsville","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Burnsville in":"Burnsville is in Minnesota."}}},
{"id":"n-36b8dfd9","guard":[["hasAny",["state","vineland"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Vineland in":"Vineland is in New Jersey."}}},
{"id":"n-375854ea","guard":[["has","asheville"],["has","in"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Asheville":"Asheville is in North Carolina."}}},
{"id":"n-3b8aaafa","guard":[["has","midwest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Midwest City":"Midwest City is in Oklahoma."}}},
{"id":"n-3d9deaa7","guard":[["hasAny",["state","valdosta"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Valdosta in":"Valdosta is in Georgia."}}},
{"id":"n-4050fdd7","guard":[["hasAny",["janesville","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Janesville in":"Janesville is in Wisconsin."}}},
{"id":"n-441f880e","guard":[["hasAny",["lucie","port","st","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Port St. Lucie in":"Port St. Lucie is in Florida."}}},
{"id":"n-45876844","guard":[["has","hicksville"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Hicksville":"Hicksville is in New York."}}},
{"id":"n-4a24079c","guard":[["hasAny",["east","hartford"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where East Hartford lies":"East Hartford is in Connecticut."}}},
{"id":"n-4dd0ab69","guard":[["has","charlotte"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Charlotte lies":"Charlotte is in North Carolina."}}},
{"id":"n-4de18d71","guard":[["hasAny",["city","fall","river","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Fall River":"Fall River is in Massachusetts."}}},
{"id":"n-535211d7","guard":[["hasAny",["peters","st","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is St. Peters in":"St. Peters is in Missouri."}}},
{"id":"n-5431ef19","guard":[["hasAny",["city","hills","rochester","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Rochester Hills":"Rochester Hills is in Michigan."}}},
{"id":"n-583f1668","guard":[["has","hendersonville"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Hendersonville":"Hendersonville is in Tennessee."}}},
{"id":"n-58a49e2e","guard":[["hasAny",["state","tonawanda"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Tonawanda in":"Tonawanda is in New York."}}},
{"id":"n-5929570a","guard":[["hasAny",["lawton","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Lawton in":"Lawton is in Oklahoma."}}},
{"id":"n-5ec33de7","guard":[["has","lowell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Lowell":"Lowell is in Massachusetts."}}},
{"id":"n-5f98a9f2","guard":[["hasAny",["beach","boynton","state"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Boynton Beach in":"Boynton Beach is in Florida."}}},
{"id":"n-601b3ff2","guard":[["hasAny",["parker","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Parker in":"Parker is in Colorado."}}},
{"id":"n-61326bdc","guard":[["hasAny",["dayton","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Dayton in":"Dayton is in Ohio."}}},
{"id":"n-63323d67","guard":[["has","oakland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Oakland Park":"Oakland Park is in Florida."}}},
{"id":"n-658526cf","guard":[["has","melbourne"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Melbourne lies":"Melbourne is in Florida."}}},
{"id":"n-65ddcdb2","guard":[["hasAny",["city","sierra","state","vista"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Sierra Vista":"Sierra Vista is in Arizona."}}},
{"id":"n-67251c18","guard":[["hasAny",["luis","obispo","san","state"]],["has","us"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is San Luis Obispo in":"San Luis Obispo is in California."}}},
{"id":"n-6a94a532","guard":[["hasAny",["east","lansing","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is East Lansing in":"East Lansing is in Michigan."}}},
{"id":"n-6d968251","guard":[["hasAny",["carson","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Carson in":"Carson is in California."}}},
{"id":"n-6dcb98ba","guard":[["hasAny",["estates","hoffman","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Hoffman Estates in":"Hoffman Estates is in Illinois."}}},
{"id":"n-6e3981eb","guard":[["hasAny",["coast","palm"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Palm Coast lies":"Palm Coast is in Florida."}}},
{"id":"n-7367aca1","guard":[["hasAny",["state","tallahassee"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Tallahassee in":"Tallahassee is in Florida."}}},
{"id":"n-76148cdc","guard":[["has","florin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Florin lies":"Florin is in California."}}},
{"id":"n-78b3f8e5","guard":[["has","berkeley"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Berkeley":"Berkeley is in California."}}},
{"id":"n-78f0e758","guard":[["has","antioch"],["has","in"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Antioch":"Antioch is in California."}}},
{"id":"n-7c3e7f15","guard":[["has","meriden"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Meriden":"Meriden is in Connecticut."}}},
{"id":"n-7db00bc0","guard":[["has","pensacola"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Pensacola":"Pensacola is in Florida."}}},
{"id":"n-7f11ed03","guard":[["has","casper"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Casper lies":"Casper is in Wyoming."}}},
{"id":"n-7f35ac12","guard":[["hasAny",["denver","state"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Denver in":"Denver is in Colorado."}}},
{"id":"n-81a7bd1e","guard":[["hasAny",["castro","valley"]],["has","where"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Castro Valley lies":"Castro Valley is in California."}}},
{"id":"n-84803bef","guard":[["has","kalamazoo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Kalamazoo":"Kalamazoo is in Michigan."}}},
{"id":"n-8d4b2d53","guard":[["has","springdale"],["has","in"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Springdale":"Springdale is in Arkansas."}}},
{"id":"n-924a64bf","guard":[["hasAny",["city","joseph","st","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city St. Joseph":"St. Joseph is in Missouri."}}},
{"id":"n-93f9d512","guard":[["hasAny",["milford","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Milford in":"Milford is in Connecticut."}}},
{"id":"n-9505debb","guard":[["has","chattanooga"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Chattanooga lies":"Chattanooga is in Tennessee."}}},
{"id":"n-996fb4ac","guard":[["has","tyler"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Tyler lies":"Tyler is in Texas."}}},
{"id":"n-9990e8ed","guard":[["hasAny",["muncie","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Muncie in":"Muncie is in Indiana."}}},
{"id":"n-99a1cdab","guard":[["has","frisco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Frisco":"Frisco is in Texas."}}},
{"id":"n-9a226b78","guard":[["has","ardenarcade"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Arden-Arcade":"Arden-Arcade is in California."}}},
{"id":"n-9ac373e0","guard":[["has","victoria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Victoria lies":"Victoria is in Texas."}}},
{"id":"n-9dc54bc7","guard":[["has","greensboro"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Greensboro lies":"Greensboro is in North Carolina."}}},
{"id":"n-a01159f7","guard":[["has","paramount"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Paramount":"Paramount is in California."}}},
{"id":"n-a243858c","guard":[["hasAny",["rosemead","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Rosemead in":"Rosemead is in California."}}},
{"id":"n-a452cf0f","guard":[["hasAny",["city","las","north","state","vegas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city North Las Vegas":"North Las Vegas is in Nevada."}}},
{"id":"n-aac7d082","guard":[["has","kennewick"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Kennewick":"Kennewick is in Washington."}}},
{"id":"n-afb5ff48","guard":[["has","jeffersonville"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Jeffersonville lies":"Jeffersonville is in Indiana."}}},
{"id":"n-b0315df1","guard":[["has","somerville"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Somerville lies":"Somerville is in Massachusetts."}}},
{"id":"n-b167e668","guard":[["has","lynwood"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Lynwood lies":"Lynwood is in California."}}},
{"id":"n-b275ac34","guard":[["hasAny",["hammond","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Hammond in":"Hammond is in Indiana."}}},
{"id":"n-b4ee41dd","guard":[["has","huntington"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Huntington Park":"Huntington Park is in California."}}},
{"id":"n-b893ec93","guard":[["hasAny",["city","missouri"]],["has","where"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Missouri City lies":"Missouri City is in Texas."}}},
{"id":"n-b98afa0a","guard":[["has","raleigh"],["has","in"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Raleigh":"Raleigh is in North Carolina."}}},
{"id":"n-b9f5e1db","guard":[["hasAny",["farmington","hills","state"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Farmington Hills in":"Farmington Hills is in Michigan."}}},
{"id":"n-bb889940","guard":[["hasAny",["carmel","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Carmel in":"Carmel is in Indiana."}}},
{"id":"n-bbf386e5","guard":[["hasAny",["oak","royal","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Royal Oak in":"Royal Oak is in Michigan."}}},
{"id":"n-be862bec","guard":[["hasAny",["babylon","state","west"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is West Babylon in":"West Babylon is in New York."}}},
{"id":"n-c1a3e505","guard":[["has","corona"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Corona lies":"Corona is in California."}}},
{"id":"n-c5a82ce1","guard":[["hasAny",["ceres","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Ceres in":"Ceres is in California."}}},
{"id":"n-c632420a","guard":[["has","seattle"],["has","where"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Seattle lies":"Seattle is in Washington."}}},
{"id":"n-c79f8e5a","guard":[["has","arcadia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Arcadia":"Arcadia is in California."}}},
{"id":"n-cc08498e","guard":[["has","schaumburg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Schaumburg lies":"Schaumburg is in Illinois."}}},
{"id":"n-cd55f430","guard":[["has","rogers"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Rogers lies":"Rogers is in Arkansas."}}},
{"id":"n-d1f5c1d4","guard":[["hasAny",["city","monica","santa","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Santa Monica":"Santa Monica is in California."}}},
{"id":"n-d2abecd2","guard":[["has","elkhart"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Elkhart lies":"Elkhart is in Indiana."}}},
{"id":"n-d329efe2","guard":[["has","atlanta"],["has","where"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Atlanta lies":"Atlanta is in Georgia."}}},
{"id":"n-d6ec4720","guard":[["hasAny",["city","creek","state","walnut"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Walnut Creek":"Walnut Creek is in California."}}},
{"id":"n-d9d776ed","guard":[["hasAny",["city","rancho","rio","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Rio Rancho":"Rio Rancho is in New Mexico."}}},
{"id":"n-df7f9fb4","guard":[["has","montgomery"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Montgomery":"Montgomery is in Alabama."}}},
{"id":"n-e34781b3","guard":[["hasAny",["buckeye","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Buckeye in":"Buckeye is in Arizona."}}},
{"id":"n-e3a6a5d1","guard":[["hasAny",["gardena","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Gardena in":"Gardena is in California."}}},
{"id":"n-e4956a3e","guard":[["hasAny",["city","club","country","state"]],["has","in"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Country Club":"Country Club is in Florida."}}},
{"id":"n-e74ea1e9","guard":[["hasAny",["meridian","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Meridian in":"Meridian is in Idaho."}}},
{"id":"n-ecc7037c","guard":[["has","enterprise"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Enterprise":"Enterprise is in Nevada."}}},
{"id":"n-ee2be443","guard":[["has","anaheim"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Anaheim lies":"Anaheim is in California."}}},
{"id":"n-ef037eeb","guard":[["has","wauwatosa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Wauwatosa":"Wauwatosa is in Wisconsin."}}},
{"id":"n-ef8ddb12","guard":[["hasAny",["hill","spring","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Spring Hill in":"Spring Hill is in Florida."}}},
{"id":"n-effe0e30","guard":[["has","waukesha"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Waukesha lies":"Waukesha is in Wisconsin."}}},
{"id":"n-f7d337e9","guard":[["has","blacksburg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Blacksburg":"Blacksburg is in Virginia."}}},
{"id":"n-fbf8ee16","guard":[["has","anchorage"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Anchorage lies":"Anchorage is in Alaska."}}},
{"id":"n-fc446253","guard":[["has","birmingham"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Birmingham lies":"Birmingham is in Alabama."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the state where Melbourne lies","expect":{"contains":["Florida"],"notRefusal":true}},{"q":"in what state is the city Arden-Arcade","expect":{"contains":["California"],"notRefusal":true}},{"q":"name the state where Castro Valley lies","expect":{"contains":["California"],"notRefusal":true}},{"q":"which US state is Carmel in","expect":{"contains":["Indiana"],"notRefusal":true}},{"q":"which US state is Farmington Hills in","expect":{"contains":["Michigan"],"notRefusal":true}},{"q":"in what state is the city Antioch","expect":{"contains":["California"],"notRefusal":true}},{"q":"name the state where Tyler lies","expect":{"contains":["Texas"],"notRefusal":true}},{"q":"in what state is the city Hendersonville","expect":{"contains":["Tennessee"],"notRefusal":true}},{"q":"which US state is Carson in","expect":{"contains":["California"],"notRefusal":true}},{"q":"which US state is Denver in","expect":{"contains":["Colorado"],"notRefusal":true}},{"q":"in what state is the city St. Joseph","expect":{"contains":["Missouri"],"notRefusal":true}},{"q":"which US state is Milford in","expect":{"contains":["Connecticut"],"notRefusal":true}},{"q":"which US state is Boynton Beach in","expect":{"contains":["Florida"],"notRefusal":true}},{"q":"name the state where Dearborn lies","expect":{"contains":["Michigan"],"notRefusal":true}},{"q":"in what state is the city Oakland Park","expect":{"contains":["Florida"],"notRefusal":true}},{"q":"which US state is Hammond in","expect":{"contains":["Indiana"],"notRefusal":true}},{"q":"name the state where Schaumburg lies","expect":{"contains":["Illinois"],"notRefusal":true}},{"q":"which US state is Lawton in","expect":{"contains":["Oklahoma"],"notRefusal":true}},{"q":"in what state is the city Springdale","expect":{"contains":["Arkansas"],"notRefusal":true}},{"q":"in what state is the city Pensacola","expect":{"contains":["Florida"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
