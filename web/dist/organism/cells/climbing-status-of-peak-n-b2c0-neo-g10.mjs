// climbing-status-of-peak-n-b2c0-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"climbing-status-of-peak-n-b2c0-neo-g10","class":"climbing-status-of-peak-n-b2c0","generation":10,"lane":"neo","grownFrom":["what is the climbing status of Singu Chuli","tell me the climbing status of the peak name Futi Himal","give the climbing status for Tengi Ragi Tau","give the climbing status for Rolmi","tell me the climbing status of the peak name Lingtren","tell me the climbing status of the peak name Langju","what is the climbing status of Pethangtse East","tell me the climbing status of the peak name Gimmigela Chuli East","tell me the climbing status of the peak name Takphu Himal","what is the climbing status of Tankya I","what is the climbing status of Saribung","what is the climbing status of Tharpu Chuli","tell me the climbing status of the peak name Jannu East","what is the climbing status of Myagdi Matha","give the climbing status for Kasi Dalpha","what is the climbing status of Tengkangpoche","give the climbing status for Yanme Kang","what is the climbing status of Yangra Kangri South","tell me the climbing status of the peak name Kyashar","give the climbing status for Dhampus"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-peaks-016579","columns":["peak name","peak id","peak alternative name","climbing status"],"n":468,"cols":[{"f":"0Ama Dablam|2phu Gyabjen|1pi West|0Gimmigela Chuli East|0Shartse II|0Kirat Chuli|0Aichyn|1mphu I|6Middle|1nnapurna I|b East|cMiddle|bI|cI|bV|aSouth|1pi Main|1rniko Chuli|0Bamongo|2runtse|2udha|1eding Go|1hairab Takura|2emdang Ri|2rikuti|8 Shail|2ulu Lhasa|1obaye|2ktoh|1urke Kang|0Chago|3ko|3mar Kang|7North|4lang|3ngla|5tse|5wathang|2ekigo|3o Himal|2hiv Himal|3opa Bamare|3uboche|4kung Ri|9Tse|2o Oyu|4Polu|3buje|3latse|2ukyima Go|3lu Central|6West|3ren Himal Central|dEast|dWest|0Danga|3phe Shail|1hampus|3ulagiri I|cI|dI|cV|bV|cI|2echyan Khang|1ingjung North|9Ri|1olma Khang|2me Kang|3o|2rje Lhakpa|1ragmorpa Ri|3ngnag Ri|1udh Kundali|1zanye|6 II|3sampatse|0Everest|0Fang|1irnkopf West|1uti Himal|0Gama Peak|2nchenpo|3dharva Chuli|3esh I|8I|9I|8V|7V|8I|3gapurna|2ugiri|3rishankar|c South|2ve Ding|1henge Liru|2ustang North|9South|2yuthumba Main|1immigela Chuli|1lacier Dome|1ojung|1urja Himal|3karpo Ri|1yachung Kang|3jikang|3lzen Peak|0Herzog Peak|1imalchuli East|bNorth|bWest|3jung|3lung East|8Himal|2unchuli|1ongde|4ku|1ungchhi|3ku|0Imjatse|0Jabou Ri|2gdula|2nak Chuli|3nu|2semba Goth|1ethi Bahurani|1injang|1obo Rinjang|2msom Himal|2ngsang|0Kabru Dome|6Main|6North|6South|2gmara I|2li Himal|2nde Hiunchuli|f North II|3g Guru|5Kuru|5Nagchugo|4bachen|4chenjunga|d Central|eSouth|6ung Nup|aShar|4tega|5okal|3jeralwa|4iroba South|3ta Gaton|4i Himal|2ptang|2rsang Kang|3yolung|1hamjung|3tang|4ung Khang|2ongma Tse|1ojichuwa Chuli|2tang|1umlung|2sum Kanguru|1wangde|1yashar|3zo Ri|2ungka Ri 1|0Lachama Chuli|2mjung Himal|2ngdak|5ung|4ju|4moche Ri|4po|4shisa Ri|4tang Lirung|9Ri|2rkya Peak|2shar I|1eonpo Gang|b East|1ha Shamma|2otse|6 Middle|7Shar|1ingtren|3khu Chuli Nup|dShar|1obuje East|7West|1ugula|2nag II|6West|3chhung Kamo East|3gsampa|0Makalu|6 II|2lanphulan|2napathi|9 NW|4slu|7 North|3sail|2rdi Himal|2tathumba|1era Peak|3ra|1ojca|1ukut Himal|2stang Himal|8Peak|0Nagoru|2lakankar North|bSouth|2mpa|2ngamari I|bI|4pai Gosum I|2rphu|2ulekh|2ya Kanga|1emjung|2pal Peak|1gojumba Kang I|fI|1ilgiri Central|8East|8North|8South|2rekha|1orbu Kang|1umbur|3ri|2p La Kang|3che Kang|5u|3tse|6 East I|7West II|0Ohmi Kangri|1mbigaichen|0Paldor|3ung|2nalotapa|3bari|3dra|3gbuk North|8Ri|3kar Himal|2rchamo|2sang Lhamu Chuli|2war Central|1eak 29|541|2mthang Karpo Ri|2ri|2thangtse|a East|1harilapcha|2u Kang Go|3ngi Himal|3rbi Chhyachu|1imu|2sang|1ointed Peak|2kalde|3harkang|2ta Himal North|1umori|2rkhung|2tha Hiunchuli|1yramid Peak|0Raksha Urai|2mdung|3tang|7 Chang|2ni Peak|2thong|3na Chuli|2ungsiyar|1ipimo Shar|1oc Noir|2kapi|2lmi|3waling Kang|0Saipal|6 East Humla|2ldim West|2mdo|2no Bhrikuti|5Kailash|2ribung|1erku Dolma|1halbachum|3rphu I|9I|9V|2ershon Northwest|3y Shikhar|1imnang Himal|2ngu Chuli|2sne Himal|2ta Chuchura|1phinx|1yaokang|0Takargo|7 East|3phu Himal|7North|2lung|2ple Shikhar|2rke Kang Shar|2shi Kang|2wa|3oche|1engi Ragi Tau|e East|4kangpoche|5oma|1hamserku|3rke Kang|4pu Chuli|2orong Peak|2ulagi|1il Kang|3icho|1obsar|2ngu|1riangle Peak|3pura Hiunchuli|1sartse|3urabong Peak|2isima|2o Karpo Kang|1ukuche|0Urkema|3inmang|0Yakawa Kang|2lung Kang|2nme Kang|2upa|0Agole East|1motsang|1nidesh Chuli|1rdang|1sajya Tuppa|0Bijora Hiunchuli|0Chabuk|3mar|3ndi Himal|4gdi|3w Peak|2hochenphu Himal|2umbu|0Dhaulagari|1ogari|1rohmo|1wijen Himal|0Ek Rate Danda|0Firnkopf|0Ganesh VII|3gapurna West|1hhanyala Hies|2yun Himal I|1oldum Peak|2rakh Himal|7Khang|1uras|1yala|0Hongku Chuli|1ulang Go|0Jannu East|2rkya|1unction Peak|1yachhung|0Kaipuchonam|2nde Hiunchuli North I|3gbachen East|4chenjunga North|4tsune|3jiroba North|3ti Himal East|2rko|2si Dalpha|1hangri Shar|8West|3yang|2umbutse|3ng|1imshung|1ogi Khang North|2jichuwa South|2nabon|2rlang Pari Tippa|1yabura|2ungka Ri 2|0Lachama North|2mpo|2ngchung Khang|4tang Yubra|2sa|3har II|1hayul Peak|2onak|1unag Ri|3gchhung|0Machhapuchhare|2nsail South|2riyang|8 West|2yonthang Kang|1era South|1ingbo Ri|1yagdi Matha|0Nampa II|8I|6South|2ngpai Gosum II|1epal Gap Peak|1gojumba Kang III|0Ombak Himal|2itso Go|0Pabuk Kang|2ma Himal|2npoche 1|92|2shuwo|2trasi Himal|1eak 4|2mthang Ri|2ri Himal|1hole|2u Kang|8 North|3ngi|1unchen Himal|2rbung Himal|0Rhimbu|1oma|0Saldim|2nctuary Peak|2t Peak|2ula|1harphu III|8V|9I|4tse|2ershon|1now Peak|1obithongie|1urma-Sarovar North|1waksa Kang|2elokhan|0Takla Kang|2nkya I|1hoche Go|1ilje|1so Karpo|1utse|0Yala Chuli|3ung Kang West|2ngra Kangri South|5i|3sa Tsenji|2rwa|1okopahar|1ubra","sep":"|"},{"f":"0AMAD|2PG|1PIW|0GIME|0SHA2|0KIRA|0ACHN|1MPH|3M|1NN1|3E|3M|32|33|34|3S|1PIM|1RNK|0BAMO|2RU|2UD|1EDG|1TAK|1HEM|2RI|3S|2UL|1OBA|2KT|1URK|0CHAG|3K|2KA|2MN|2AM|3N|1TSE|1HWT|2EK|3O|2IV|1BAM|1HUB|2RI|2UK|2OY|3P|3B|3L|2UG|3L|3W|3R|2RE|3W|0DANG|3S|1HAM|31|32|33|34|35|36|2EC|1ING|3S|1OLM|2MK|3O|2RJ|1RAG|3N|1UDH|1ZAN|32|3S|0EVER|0FANG|1IRW|1UTI|0GAMA|2NC|3D|31|32|33|34|35|36|3G|2UG|3R|3S|1DNG|1HEN|2UN|3S|2YM|1IMM|1LAC|1OJN|1URJ|3K|1YAC|3J|2LZ|0HERZ|1IME|3N|3W|3J|1MLE|1IML|2UP|1ONG|3K|1CHI|1UNK|0IMJA|0JABR|2GD|2NK|3U|2SG|1ETH|1ING|1OBO|2MS|2NG|0KABD|3R|3N|3S|2G1|2LI|2ND|32|1GUR|1AKU|1NAG|1ANB|3G|3C|3S|1CHN|3S|1TEG|2OK|1JER|2RS|1AGA|2NT|2PT|2RS|3Y|1HAM|3T|1TUN|1HON|1OJI|2TA|1UML|2SU|1WAN|1YAS|3Z|2R1|0LCHA|1AMJ|1DAK|2NG|1NJU|1MOC|1NPO|1SIS|1ANG|3R|2RK|2SH|1EON|3E|1HAS|2OT|3M|1SHR|1ING|2K2|31|1OBE|3W|1UGU|2N2|3W|1NKE|1SAM|0MAKA|32|2LA|2NP|1PNW|1ANA|3N|1NSL|1ARD|2TA|1ERA|3R|1OJC|1UKT|2ST|2PK|0NGOR|1ALA|3S|2MP|2NG|32|2G1|1PHU|1AUL|2YA|1EMJ|2PA|1GOJ|32|1ILC|3E|3N|3S|1REK|1ORB|1UMB|3R|2PL|3K|1CHU|1UPT|3E|3W|0OHMI|1MBG|0PALD|1LNG|1ANT|3B|3D|3N|3G|1KAR|1ARC|2SA|2WR|1K29|241|1EMK|2RI|2TH|1THE|1HAR|2UG|2NH|2UR|1IMU|2SA|1OIN|2KA|3R|2TA|1UMO|2RK|2TH|1YRM|0RAKS|2MD|3T|3C|2NI|2TH|3C|2UN|1IPI|1OCN|2KA|2LM|3K|0SAIP|3E|2LW|2MD|2NB|3K|2RI|1RKU|1HAL|1PH1|32|34|1HNW|2EY|1IMN|2NG|2SN|2TA|1PHN|1YKG|0TKRG|3E|1AKP|3N|1LNG|1APL|2RS|2SH|2WA|3O|1ENR|3E|1KPO|1ENG|1HAM|2RK|2AR|2OR|2UL|1ILK|3I|1OBS|2NG|1RIA|3P|1SAR|2UR|2IS|2OK|1UKU|0URMA|2KM|0YAKA|2LU|2NK|2UP|0AGLE|1MOT|1NID|1RDN|1SAJ|0BIJO|0CHAB|2MR|2ND|3G|2AW|1PHU|1HUM|0DGAR|1OGA|1ROM|1WIJ|0EKRA|0FIRN|0GAN7|3W|1HAN|2YN|1OLD|2RH|3K|1URA|1YLA|0HNKU|1UGO|0JANE|2RK|1UNC|1YAC|0KAIP|2N1|1BNE|1ANN|1TSU|1JRN|1NTE|1ARK|2SI|1GRI|3W|1HAY|2UM|2NG|1IMS|1OGI|2JS|1BON|1ORL|1YAB|2R2|0LCHN|1AMP|1NGK|1ANY|2SA|32|1HAY|1NAK|1UNR|3G|0MACH|1NSS|1ARI|3W|2YT|1ERS|1ING|1YAG|0NAM2|33|3S|2G2|1GAP|2O3|0OMBK|2IT|0PBUK|1AMA|2N1|32|2SH|2TR|1K04|1EMR|2RH|1HOL|2UK|3N|2NG|1UCH|2RB|0RHIM|1OMA|0SALD|2NC|2TO|2UL|1PH3|35|36|1HAR|2ER|1NOW|1OBI|1URM|1WAK|2EL|0TAKL|2NK|1HOC|1ILJ|1SKP|1UTS|0YARA|2LW|1NGS|1ANG|3S|2RW|1OKO|1UBR","sep":"|"},{"s":"Amai Dablang|NA|NA|Twins|Junction Peak|Tent Peak|Aychin, Ashvin|NA|Amphu North|NA|NA|NA|NA|NA|NA|Annapurna Dakshin, Moditse|NA|Araniko Chuli|NA|NA|NA|Bedding Go|Madiya|Morimoto|Damodar Himal|NA|NA|NA|Bokta|Burke Khang|NA|NA|Chharka, Kangtega|Peak 23|NA|Changla Himal|Everest North Peak|NA|NA|NA|Chhib Himal|Chomo Pamari|NA|NA|Chhukung Chuli|NA|NA|Chobutse, Tsoboje|Tsolatse, Jobo Lhaptshan|Chugimago|Chulu East|NA|NA|NA|NA|NA|Danfe Shail|Thapa Peak, Marpha Peak|NA|NA|Nalu, Naula|NA|NA|NA|NA|Kangkuru, Rima Mancho|Dingjung Ri South|Tseringma|NA|Jongsang SE Peak|NA|Thakmarpo Ri, Panaya Tippa|Thaknak Ri|Dui Tal Chuli, Two Lakes Peak|Dzanaye|NA|NA|Sagarmatha, Chomolungma, Qomolungma|Varaha Shikhar, Varaha Chuli, Finger|NA|NA|NA|Fluted Peak, Ganchempo|Gandharbha, Gabelhorn Peak|Yangra Kangri|NA|Salasungo, Kang Lombo, Lopsang Karbo|Pabil|NA|NA|NA|NA|Jomo Tseringma|Gauri|NA|Ghenye Lirung, Langtang II|NA|Gurja West, Paschim Himal|Gutumpa, Pasang Peak|Twins|Tarke Kang, Tarke Khang|Mugu Chuli|NA|NA|NA|Gyaji Khang|Gyaltsen Peak|Khangsar Khang West|Himalchuli Main|NA|NA|Nemjung Goth|NA|NA|Patal Hiunchuli|Hangde, Hongde Himal|Hongku Chuli Nup, Honku, Sura Peak|Hunchhi, Chakung, Gyubanare Kang, Gyuba Tshomotse|NA|Island Peak|NA|NA|Janak, Outlier|Khumbhakarna|Dzasampa Kang|Jettiborani, Jutibofurani|Genjang, Gajang, Jijang|Jobo Ribjang|Jomsang Himal|Jonsong, Jhinsang|NA|Kabru Central|NA|NA|NA|Chota Ri, Baruntse North|NA|NA|Naurgaon|NA|Khang Nagchugo|Kambachen|NA|NA|NA|Khangchung Nup, Kangcho Nup, Cholo|Khangchung, Kangcho Shar, UIAA Peak|Kantega, Khangtega, Kang Taiga|Khang Tokal|Kanchen Ruwa|NA|Kangfu Gaton|Ronglai Kangri, Kaqur Kangri, Kubi Grangri|NA|Kharsang|NA|Khumjung, Khamjungar|NA|NA|Mehra Peak|NA|Kokthang, Kothang Kang|Kang Kuru?|Kusum Kang, Lamu|NA|Peak 43, Tangnag Tseng|Kyajo Ri|Kyungya Ri 1|Kubi Kangri, Kubi Dongdong|NA|NA|Ripumutse|Lajo Dada|NA|Longpo|Langsisa Ri|Langtang|NA|Granite Peak, Naike Peak|Loshar I|Dorje Pahad, Big White Peak|Gyalgen Peak|Lhasharma, Pinnacle Peak|NA|Lhotse Intermediate|Lhotse II|NA|Bigphera-Go Nup, Pigpferago Nup, Linkhu Chuli II|Bigphera-Go Shar, Pigpferago Shar, Linkhu Chuli I|Lobuche East|Lobuche West|NA|NA|NA|NA|Lung Sampa, Lumsumna|NA|Kangchungtse|Melanphulan, Hinku Ri|NA|NA|Kutang I, Peak 30|Manaslu II|Manshail|NA|Matatumpa, Ghyuthumba East|\"False\" Mera Peak|NA|Mojka|Mukot Himal, Langru|NA|NA|NA|NA|NA|Chisel Peak|NA|NA|Nagpai Gosum I, Cho Aui|NA|NA|Kangja Chuli, Ghanja La Chuli|NA|NA|Ngozumba Kang, Ngozumba Ri, Tenzing Peak|NA|NA|NA|NA|NA|NA|Norbu Khang|NA|NA|Nupla Khang|Friendship Peak, Nupche Himal|Sharphu IV|NA|NA|Nuptse Nup II|NA|Puma Dablam|Bharange|Palung Ri|Paniyo Tapa, Paniyo Tippa|NA|NA|Jobo LeCoultre|NA|NA|Parchermo, Parchemuche, Pachermo|Jasemba|Chaar Baatsa|Ngadi Chuli, Dakura, Dr Harka Gurung Chuli|\"True\" Mera Peak|Dome Blanc, Kan Karmo|NA|NA|NA|NA|Phu Khang Go, Athahra Saya Khola Himal|NA|Phurbi Ghyachu|Pamalka|Jong Ri|NA|NA|Pokhar Khang|Peak Hawley|NA|Purkhang, Purkung|Dhaulagiri VII|Pathibhara Chuli, Pathibhara Khas|Raksha Urai III|Ramdong Go|NA|Wedge Peak, Chang Himal|Lidanda Peak, Himalchuli Northeast|NA|NA|NA|Khang Karpo, Kang Karpo|Khangsar Kang, Khang Sar Khang|Kapchuli|NA|Rolwaling Khang|NA|NA|Peak 5, Saldim Ri, Yaphu Ri|NA|NA|NA|Selibung|NA|Salbachum, Phrul Rangtshan Ri|Tanga I|Tanga II|Nupchu|NA|Junction Peak|P2, Simnang Himal East|Fluted Peak|Hiunchuli Patan|NA|Pathibhara Phurba, Pathibhara East|NA|Dragker-go|Thakar Go East, Dragker-go East|NA|NA|NA|Cross Peak|Tare Kang|Tashi Khang|NA|Taboche|Agole, Angole|NA|Thyangmoche|Tang Kongma|Tramserku|Tharke Khang|Tent Peak|Thorung Peak|Mansiri Himal|NA|Tilitso|Tabsar|NA|NA|Tripura Thumba, Hanging Glacier Peak|NA|Chara Ban Peak, White Peak|Chijima, MDM Peak|Tso Karpo Khang|NA|Baden Powell Scout Peak, Urgyenma|Buddha|NA|Yalungkar|Yanme Khang|NA|Angole East|Amatson|White Wave Peak|NA|NA|NA|Tsajirip|Shringi Himal|NA|NA|Chaw East|NA|NA|Dhaulasiri|NA|Domo, Longridge Peak|NA|NA|Firnkopf East|NA|Lachenal Peak, Asapurna|NA|NA|Pangri Goldumba|NA|NA|NA|NA|Hunku Chuli, Pyramid Peak|NA|Khumbhakarna East|NA|NA|NA|NA|NA|Kambachen East|NA|Kangchunne, Kanchauni Lekh|NA|NA|NA|NA|NA|NA|NA|NA|NA|Kinshung, Tsangbu Ri|Kogi Kang North|NA|Kambon|Korlang Pari Tippa North|Ghabur, Temachungi|Kyungya Ri 2|NA|Langpo Kangri, Ganesh VI|Langpo Chung|Yubra Himal|NA|Loshar II|NA|Rifil Peak|Lunag I, Rongshar Ri I, Ondrej Peak|NA|NA|Manshail South|NA|NA|Mayun Thang Khang|NA|NA|NA|NA|Nampa Chuli|NA|Nagpai Gosum II, Chamar|Nepal Gyap Peak|Hillary Peak|NA|Omi Tso Go|Kangata|NA|Pang Phunch 1, Kutang Himal|Pang Phunch 2|Pashubo|Kande Hiunchuli North|Shershon Ri|NA|NA|NA|Phu Khang|Phu Khang North|NA|Puchen Himal|Putrung|NA|NA|NA|NA|Sato Peak|NA|Marson|Tanga III|NA|Peak 38, Shanti Shikhar|Peak 3|NA|NA|NA|NA|NA|Takla Khang|NA|NA|NA|NA|Peak 6, Nephu|Yara Chuli|NA|Yangra South, Ganesh I South|Jugal|Dragpoche, Dhagpache|NA|Nampa VIII|NA","sep":"|"},{"d":"Climbed|Unclimbed","r":"0*2,1*1,0*9f,1*3i","sep":"|"}]}]);
const COLONY = [
{"id":"n-72e157b1","guard":[["not",["hasAny",["determined","id","idaho","lore","peakid","sucountry","valor","zhou"]]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-eb8933f8","guard":[["hasAny",["climbing","element","item number","nth","position"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-4de8f9d6","guard":[["not",["hasAny",["determined","id","idaho","lore","peakid","sucountry","valor","zhou"]]]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-765dcba5","guard":[["hasAny",["climbing","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-ac04912f","guard":[["not",["hasAny",["determined","id","idaho","lore","peakid","sucountry","valor","zhou"]]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-c3e8d659","guard":[["hasAny",["camel case","camelcase","climbing","element","item number","lower camel case","nth","position"]]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-e59dee1e","guard":[["hasAny",["all caps","capital letters","capitals","climbing","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-ec8b51be","guard":[["not",["hasAny",["determined","id","idaho","lore","peakid","sucountry","valor","zhou"]]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-2f5d62f9","guard":[["has","climbing"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Singu Chuli":"The climbing status of Singu Chuli is Climbed.","tell me the climbing status of the peak name Futi Himal":"The climbing status of Futi Himal is Climbed.","give the climbing status for Tengi Ragi Tau":"The climbing status of Tengi Ragi Tau is Climbed.","give the climbing status for Rolmi":"The climbing status of Rolmi is Climbed.","tell me the climbing status of the peak name Lingtren":"The climbing status of Lingtren is Climbed.","tell me the climbing status of the peak name Langju":"The climbing status of Langju is Climbed.","what is the climbing status of Pethangtse East":"The climbing status of Pethangtse East is Climbed.","tell me the climbing status of the peak name Gimmigela Chuli East":"The climbing status of Gimmigela Chuli East is Climbed.","tell me the climbing status of the peak name Takphu Himal":"The climbing status of Takphu Himal is Climbed.","what is the climbing status of Tankya I":"The climbing status of Tankya I is Unclimbed.","what is the climbing status of Saribung":"The climbing status of Saribung is Climbed.","what is the climbing status of Tharpu Chuli":"The climbing status of Tharpu Chuli is Climbed.","tell me the climbing status of the peak name Jannu East":"The climbing status of Jannu East is Unclimbed.","what is the climbing status of Myagdi Matha":"The climbing status of Myagdi Matha is Unclimbed.","give the climbing status for Kasi Dalpha":"The climbing status of Kasi Dalpha is Unclimbed.","what is the climbing status of Tengkangpoche":"The climbing status of Tengkangpoche is Climbed.","give the climbing status for Yanme Kang":"The climbing status of Yanme Kang is Climbed.","what is the climbing status of Yangra Kangri South":"The climbing status of Yangra Kangri South is Unclimbed.","tell me the climbing status of the peak name Kyashar":"The climbing status of Kyashar is Climbed.","give the climbing status for Dhampus":"The climbing status of Dhampus is Climbed.","what is the climbing status of Kaptang":"The climbing status of Kaptang is Climbed.","what is the climbing status of Pumori":"The climbing status of Pumori is Climbed.","what is the climbing status of Purbung Himal":"The climbing status of Purbung Himal is Unclimbed.","give the climbing status for Cheo Himal":"The climbing status of Cheo Himal is Climbed.","tell me the climbing status of the peak name Leonpo Gang East":"The climbing status of Leonpo Gang East is Climbed.","tell me the climbing status of the peak name Changtse":"The climbing status of Changtse is Climbed.","what is the climbing status of Lunag II":"The climbing status of Lunag II is Climbed.","tell me the climbing status of the peak name Lhotse Shar":"The climbing status of Lhotse Shar is Climbed.","tell me the climbing status of the peak name Cho Oyu":"The climbing status of Cho Oyu is Climbed.","give the climbing status for Mardi Himal":"The climbing status of Mardi Himal is Climbed.","tell me the climbing status of the peak name Lungchhung":"The climbing status of Lungchhung is Unclimbed.","give the climbing status for Takargo East":"The climbing status of Takargo East is Climbed.","tell me the climbing status of the peak name Kabru South":"The climbing status of Kabru South is Climbed.","give the climbing status for Lobuje West":"The climbing status of Lobuje West is Climbed.","give the climbing status for Sharphu IV":"The climbing status of Sharphu IV is Climbed.","tell me the climbing status of the peak name Pointed Peak":"The climbing status of Pointed Peak is Climbed.","give the climbing status for Kojichuwa South":"The climbing status of Kojichuwa South is Unclimbed.","what is the climbing status of Dhaulagiri IV":"The climbing status of Dhaulagiri IV is Climbed.","give the climbing status for Pawar Central":"The climbing status of Pawar Central is Climbed.","what is the climbing status of Tengkoma":"The climbing status of Tengkoma is Climbed.","give the climbing status for Ratna Chuli":"The climbing status of Ratna Chuli is Climbed.","give the climbing status for Chamar North":"The climbing status of Chamar North is Climbed.","give the climbing status for Khatung Khang":"The climbing status of Khatung Khang is Climbed.","tell me the climbing status of the peak name Karko":"The climbing status of Karko is Unclimbed.","tell me the climbing status of the peak name Urkinmang":"The climbing status of Urkinmang is Climbed.","tell me the climbing status of the peak name Glacier Dome":"The climbing status of Glacier Dome is Climbed.","tell me the climbing status of the peak name Lasa":"The climbing status of Lasa is Unclimbed.","tell me the climbing status of the peak name Ngojumba Kang I":"The climbing status of Ngojumba Kang I is Climbed.","tell me the climbing status of the peak name Hungchhi":"The climbing status of Hungchhi is Climbed.","what is the climbing status of Sano Kailash":"The climbing status of Sano Kailash is Climbed.","give the climbing status for Agole East":"The climbing status of Agole East is Unclimbed.","give the climbing status for Kangchenjunga South":"The climbing status of Kangchenjunga South is Climbed.","tell me the climbing status of the peak name Churen Himal West":"The climbing status of Churen Himal West is Climbed.","give the climbing status for Domo":"The climbing status of Domo is Climbed.","what is the climbing status of Ganchenpo":"The climbing status of Ganchenpo is Climbed.","what is the climbing status of Sita Chuchura":"The climbing status of Sita Chuchura is Climbed.","tell me the climbing status of the peak name Ripimo Shar":"The climbing status of Ripimo Shar is Climbed.","give the climbing status for Imjatse":"The climbing status of Imjatse is Climbed.","what is the climbing status of Phu Kang":"The climbing status of Phu Kang is Unclimbed.","tell me the climbing status of the peak name Drohmo":"The climbing status of Drohmo is Unclimbed.","what is the climbing status of Mansail":"The climbing status of Mansail is Climbed.","tell me the climbing status of the peak name Phungi":"The climbing status of Phungi is Unclimbed.","give the climbing status for Ghyuthumba Main":"The climbing status of Ghyuthumba Main is Climbed.","give the climbing status for Nilgiri North":"The climbing status of Nilgiri North is Climbed.","what is the climbing status of Burke Kang":"The climbing status of Burke Kang is Climbed.","give the climbing status for Ramdung":"The climbing status of Ramdung is Climbed.","what is the climbing status of Kali Himal":"The climbing status of Kali Himal is Climbed.","tell me the climbing status of the peak name Sisne Himal":"The climbing status of Sisne Himal is Climbed.","give the climbing status for Yakawa Kang":"The climbing status of Yakawa Kang is Climbed.","give the climbing status for Mayonthang Kang":"The climbing status of Mayonthang Kang is Unclimbed.","tell me the climbing status of the peak name Lachama North":"The climbing status of Lachama North is Unclimbed.","tell me the climbing status of the peak name Thorong Peak":"The climbing status of Thorong Peak is Climbed.","what is the climbing status of Pandra":"The climbing status of Pandra is Climbed.","what is the climbing status of Changdi":"The climbing status of Changdi is Unclimbed.","what is the climbing status of Larkya Peak":"The climbing status of Larkya Peak is Climbed.","give the climbing status for Lhonak":"The climbing status of Lhonak is Unclimbed.","tell me the climbing status of the peak name Gyajikang":"The climbing status of Gyajikang is Climbed.","give the climbing status for Dorje Lhakpa":"The climbing status of Dorje Lhakpa is Climbed.","what is the climbing status of Beding Go":"The climbing status of Beding Go is Climbed.","give the climbing status for Nirekha":"The climbing status of Nirekha is Climbed.","give the climbing status for Makalu":"The climbing status of Makalu is Climbed.","what is the climbing status of Gave Ding":"The climbing status of Gave Ding is Climbed.","what is the climbing status of Rani Peak":"The climbing status of Rani Peak is Climbed.","what is the climbing status of Kanjiroba North":"The climbing status of Kanjiroba North is Unclimbed.","what is the climbing status of Kande Hiunchuli North II":"The climbing status of Kande Hiunchuli North II is Climbed.","tell me the climbing status of the peak name Langchung Khang":"The climbing status of Langchung Khang is Unclimbed.","what is the climbing status of Panbari":"The climbing status of Panbari is Climbed.","what is the climbing status of Surma-Sarovar North":"The climbing status of Surma-Sarovar North is Unclimbed.","give the climbing status for Rokapi":"The climbing status of Rokapi is Climbed.","give the climbing status for Dogari":"The climbing status of Dogari is Unclimbed.","what is the climbing status of Chhochenphu Himal":"The climbing status of Chhochenphu Himal is Unclimbed.","what is the climbing status of Nupchu":"The climbing status of Nupchu is Climbed.","give the climbing status for Gojung":"The climbing status of Gojung is Climbed.","tell me the climbing status of the peak name Sharphu V":"The climbing status of Sharphu V is Unclimbed.","tell me the climbing status of the peak name Tarke Kang Shar":"The climbing status of Tarke Kang Shar is Climbed.","give the climbing status for Dhaulagiri VI":"The climbing status of Dhaulagiri VI is Climbed.","tell me the climbing status of the peak name Sat Peak":"The climbing status of Sat Peak is Unclimbed.","what is the climbing status of Triangle Peak":"The climbing status of Triangle Peak is Climbed.","tell me the climbing status of the peak name Langtang Ri":"The climbing status of Langtang Ri is Climbed.","give the climbing status for Yubra":"The climbing status of Yubra is Unclimbed."}}},
{"id":"n-a6f2ed30","guard":[["has","climbing"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"status"}]]],"mem":{"table":{"of Singu Chuli":"The climbing status of Singu Chuli is Climbed.","of the peak name Futi Himal":"The climbing status of Futi Himal is Climbed.","for Tengi Ragi Tau":"The climbing status of Tengi Ragi Tau is Climbed.","for Rolmi":"The climbing status of Rolmi is Climbed.","of the peak name Lingtren":"The climbing status of Lingtren is Climbed.","of the peak name Langju":"The climbing status of Langju is Climbed.","of Pethangtse East":"The climbing status of Pethangtse East is Climbed.","of the peak name Gimmigela Chuli East":"The climbing status of Gimmigela Chuli East is Climbed.","of the peak name Takphu Himal":"The climbing status of Takphu Himal is Climbed.","of Tankya I":"The climbing status of Tankya I is Unclimbed.","of Saribung":"The climbing status of Saribung is Climbed.","of Tharpu Chuli":"The climbing status of Tharpu Chuli is Climbed.","of the peak name Jannu East":"The climbing status of Jannu East is Unclimbed.","of Myagdi Matha":"The climbing status of Myagdi Matha is Unclimbed.","for Kasi Dalpha":"The climbing status of Kasi Dalpha is Unclimbed.","of Tengkangpoche":"The climbing status of Tengkangpoche is Climbed.","for Yanme Kang":"The climbing status of Yanme Kang is Climbed.","of Yangra Kangri South":"The climbing status of Yangra Kangri South is Unclimbed.","of the peak name Kyashar":"The climbing status of Kyashar is Climbed.","for Dhampus":"The climbing status of Dhampus is Climbed.","of Kaptang":"The climbing status of Kaptang is Climbed.","of Pumori":"The climbing status of Pumori is Climbed.","of Purbung Himal":"The climbing status of Purbung Himal is Unclimbed.","for Cheo Himal":"The climbing status of Cheo Himal is Climbed.","of the peak name Leonpo Gang East":"The climbing status of Leonpo Gang East is Climbed.","of the peak name Changtse":"The climbing status of Changtse is Climbed.","of Lunag II":"The climbing status of Lunag II is Climbed.","of the peak name Lhotse Shar":"The climbing status of Lhotse Shar is Climbed.","of the peak name Cho Oyu":"The climbing status of Cho Oyu is Climbed.","for Mardi Himal":"The climbing status of Mardi Himal is Climbed.","of the peak name Lungchhung":"The climbing status of Lungchhung is Unclimbed.","for Takargo East":"The climbing status of Takargo East is Climbed.","of the peak name Kabru South":"The climbing status of Kabru South is Climbed.","for Lobuje West":"The climbing status of Lobuje West is Climbed.","for Sharphu IV":"The climbing status of Sharphu IV is Climbed.","of the peak name Pointed Peak":"The climbing status of Pointed Peak is Climbed.","for Kojichuwa South":"The climbing status of Kojichuwa South is Unclimbed.","of Dhaulagiri IV":"The climbing status of Dhaulagiri IV is Climbed.","for Pawar Central":"The climbing status of Pawar Central is Climbed.","of Tengkoma":"The climbing status of Tengkoma is Climbed.","for Ratna Chuli":"The climbing status of Ratna Chuli is Climbed.","for Chamar North":"The climbing status of Chamar North is Climbed.","for Khatung Khang":"The climbing status of Khatung Khang is Climbed.","of the peak name Karko":"The climbing status of Karko is Unclimbed.","of the peak name Urkinmang":"The climbing status of Urkinmang is Climbed.","of the peak name Glacier Dome":"The climbing status of Glacier Dome is Climbed.","of the peak name Lasa":"The climbing status of Lasa is Unclimbed.","of the peak name Ngojumba Kang I":"The climbing status of Ngojumba Kang I is Climbed.","of the peak name Hungchhi":"The climbing status of Hungchhi is Climbed.","of Sano Kailash":"The climbing status of Sano Kailash is Climbed.","for Agole East":"The climbing status of Agole East is Unclimbed.","for Kangchenjunga South":"The climbing status of Kangchenjunga South is Climbed.","of the peak name Churen Himal West":"The climbing status of Churen Himal West is Climbed.","for Domo":"The climbing status of Domo is Climbed.","of Ganchenpo":"The climbing status of Ganchenpo is Climbed.","of Sita Chuchura":"The climbing status of Sita Chuchura is Climbed.","of the peak name Ripimo Shar":"The climbing status of Ripimo Shar is Climbed.","for Imjatse":"The climbing status of Imjatse is Climbed.","of Phu Kang":"The climbing status of Phu Kang is Unclimbed.","of the peak name Drohmo":"The climbing status of Drohmo is Unclimbed.","of Mansail":"The climbing status of Mansail is Climbed.","of the peak name Phungi":"The climbing status of Phungi is Unclimbed.","for Ghyuthumba Main":"The climbing status of Ghyuthumba Main is Climbed.","for Nilgiri North":"The climbing status of Nilgiri North is Climbed.","of Burke Kang":"The climbing status of Burke Kang is Climbed.","for Ramdung":"The climbing status of Ramdung is Climbed.","of Kali Himal":"The climbing status of Kali Himal is Climbed.","of the peak name Sisne Himal":"The climbing status of Sisne Himal is Climbed.","for Yakawa Kang":"The climbing status of Yakawa Kang is Climbed.","for Mayonthang Kang":"The climbing status of Mayonthang Kang is Unclimbed.","of the peak name Lachama North":"The climbing status of Lachama North is Unclimbed.","of the peak name Thorong Peak":"The climbing status of Thorong Peak is Climbed.","of Pandra":"The climbing status of Pandra is Climbed.","of Changdi":"The climbing status of Changdi is Unclimbed.","of Larkya Peak":"The climbing status of Larkya Peak is Climbed.","for Lhonak":"The climbing status of Lhonak is Unclimbed.","of the peak name Gyajikang":"The climbing status of Gyajikang is Climbed.","for Dorje Lhakpa":"The climbing status of Dorje Lhakpa is Climbed.","of Beding Go":"The climbing status of Beding Go is Climbed.","for Nirekha":"The climbing status of Nirekha is Climbed.","for Makalu":"The climbing status of Makalu is Climbed.","of Gave Ding":"The climbing status of Gave Ding is Climbed.","of Rani Peak":"The climbing status of Rani Peak is Climbed.","of Kanjiroba North":"The climbing status of Kanjiroba North is Unclimbed.","of Kande Hiunchuli North II":"The climbing status of Kande Hiunchuli North II is Climbed.","of the peak name Langchung Khang":"The climbing status of Langchung Khang is Unclimbed.","of Panbari":"The climbing status of Panbari is Climbed.","of Surma-Sarovar North":"The climbing status of Surma-Sarovar North is Unclimbed.","for Rokapi":"The climbing status of Rokapi is Climbed.","for Dogari":"The climbing status of Dogari is Unclimbed.","of Chhochenphu Himal":"The climbing status of Chhochenphu Himal is Unclimbed.","of Nupchu":"The climbing status of Nupchu is Climbed.","for Gojung":"The climbing status of Gojung is Climbed.","of the peak name Sharphu V":"The climbing status of Sharphu V is Unclimbed.","of the peak name Tarke Kang Shar":"The climbing status of Tarke Kang Shar is Climbed.","for Dhaulagiri VI":"The climbing status of Dhaulagiri VI is Climbed.","of the peak name Sat Peak":"The climbing status of Sat Peak is Unclimbed.","of Triangle Peak":"The climbing status of Triangle Peak is Climbed.","of the peak name Langtang Ri":"The climbing status of Langtang Ri is Climbed.","for Yubra":"The climbing status of Yubra is Unclimbed."}}},
{"id":"n-f7152961","guard":[["has","climbing"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"climbing"}]]],"mem":{"table":{"status of Singu Chuli":"The climbing status of Singu Chuli is Climbed.","status of the peak name Futi Himal":"The climbing status of Futi Himal is Climbed.","status for Tengi Ragi Tau":"The climbing status of Tengi Ragi Tau is Climbed.","status for Rolmi":"The climbing status of Rolmi is Climbed.","status of the peak name Lingtren":"The climbing status of Lingtren is Climbed.","status of the peak name Langju":"The climbing status of Langju is Climbed.","status of Pethangtse East":"The climbing status of Pethangtse East is Climbed.","status of the peak name Gimmigela Chuli East":"The climbing status of Gimmigela Chuli East is Climbed.","status of the peak name Takphu Himal":"The climbing status of Takphu Himal is Climbed.","status of Tankya I":"The climbing status of Tankya I is Unclimbed.","status of Saribung":"The climbing status of Saribung is Climbed.","status of Tharpu Chuli":"The climbing status of Tharpu Chuli is Climbed.","status of the peak name Jannu East":"The climbing status of Jannu East is Unclimbed.","status of Myagdi Matha":"The climbing status of Myagdi Matha is Unclimbed.","status for Kasi Dalpha":"The climbing status of Kasi Dalpha is Unclimbed.","status of Tengkangpoche":"The climbing status of Tengkangpoche is Climbed.","status for Yanme Kang":"The climbing status of Yanme Kang is Climbed.","status of Yangra Kangri South":"The climbing status of Yangra Kangri South is Unclimbed.","status of the peak name Kyashar":"The climbing status of Kyashar is Climbed.","status for Dhampus":"The climbing status of Dhampus is Climbed.","status of Kaptang":"The climbing status of Kaptang is Climbed.","status of Pumori":"The climbing status of Pumori is Climbed.","status of Purbung Himal":"The climbing status of Purbung Himal is Unclimbed.","status for Cheo Himal":"The climbing status of Cheo Himal is Climbed.","status of the peak name Leonpo Gang East":"The climbing status of Leonpo Gang East is Climbed.","status of the peak name Changtse":"The climbing status of Changtse is Climbed.","status of Lunag II":"The climbing status of Lunag II is Climbed.","status of the peak name Lhotse Shar":"The climbing status of Lhotse Shar is Climbed.","status of the peak name Cho Oyu":"The climbing status of Cho Oyu is Climbed.","status for Mardi Himal":"The climbing status of Mardi Himal is Climbed.","status of the peak name Lungchhung":"The climbing status of Lungchhung is Unclimbed.","status for Takargo East":"The climbing status of Takargo East is Climbed.","status of the peak name Kabru South":"The climbing status of Kabru South is Climbed.","status for Lobuje West":"The climbing status of Lobuje West is Climbed.","status for Sharphu IV":"The climbing status of Sharphu IV is Climbed.","status of the peak name Pointed Peak":"The climbing status of Pointed Peak is Climbed.","status for Kojichuwa South":"The climbing status of Kojichuwa South is Unclimbed.","status of Dhaulagiri IV":"The climbing status of Dhaulagiri IV is Climbed.","status for Pawar Central":"The climbing status of Pawar Central is Climbed.","status of Tengkoma":"The climbing status of Tengkoma is Climbed.","status for Ratna Chuli":"The climbing status of Ratna Chuli is Climbed.","status for Chamar North":"The climbing status of Chamar North is Climbed.","status for Khatung Khang":"The climbing status of Khatung Khang is Climbed.","status of the peak name Karko":"The climbing status of Karko is Unclimbed.","status of the peak name Urkinmang":"The climbing status of Urkinmang is Climbed.","status of the peak name Glacier Dome":"The climbing status of Glacier Dome is Climbed.","status of the peak name Lasa":"The climbing status of Lasa is Unclimbed.","status of the peak name Ngojumba Kang I":"The climbing status of Ngojumba Kang I is Climbed.","status of the peak name Hungchhi":"The climbing status of Hungchhi is Climbed.","status of Sano Kailash":"The climbing status of Sano Kailash is Climbed.","status for Agole East":"The climbing status of Agole East is Unclimbed.","status for Kangchenjunga South":"The climbing status of Kangchenjunga South is Climbed.","status of the peak name Churen Himal West":"The climbing status of Churen Himal West is Climbed.","status for Domo":"The climbing status of Domo is Climbed.","status of Ganchenpo":"The climbing status of Ganchenpo is Climbed.","status of Sita Chuchura":"The climbing status of Sita Chuchura is Climbed.","status of the peak name Ripimo Shar":"The climbing status of Ripimo Shar is Climbed.","status for Imjatse":"The climbing status of Imjatse is Climbed.","status of Phu Kang":"The climbing status of Phu Kang is Unclimbed.","status of the peak name Drohmo":"The climbing status of Drohmo is Unclimbed.","status of Mansail":"The climbing status of Mansail is Climbed.","status of the peak name Phungi":"The climbing status of Phungi is Unclimbed.","status for Ghyuthumba Main":"The climbing status of Ghyuthumba Main is Climbed.","status for Nilgiri North":"The climbing status of Nilgiri North is Climbed.","status of Burke Kang":"The climbing status of Burke Kang is Climbed.","status for Ramdung":"The climbing status of Ramdung is Climbed.","status of Kali Himal":"The climbing status of Kali Himal is Climbed.","status of the peak name Sisne Himal":"The climbing status of Sisne Himal is Climbed.","status for Yakawa Kang":"The climbing status of Yakawa Kang is Climbed.","status for Mayonthang Kang":"The climbing status of Mayonthang Kang is Unclimbed.","status of the peak name Lachama North":"The climbing status of Lachama North is Unclimbed.","status of the peak name Thorong Peak":"The climbing status of Thorong Peak is Climbed.","status of Pandra":"The climbing status of Pandra is Climbed.","status of Changdi":"The climbing status of Changdi is Unclimbed.","status of Larkya Peak":"The climbing status of Larkya Peak is Climbed.","status for Lhonak":"The climbing status of Lhonak is Unclimbed.","status of the peak name Gyajikang":"The climbing status of Gyajikang is Climbed.","status for Dorje Lhakpa":"The climbing status of Dorje Lhakpa is Climbed.","status of Beding Go":"The climbing status of Beding Go is Climbed.","status for Nirekha":"The climbing status of Nirekha is Climbed.","status for Makalu":"The climbing status of Makalu is Climbed.","status of Gave Ding":"The climbing status of Gave Ding is Climbed.","status of Rani Peak":"The climbing status of Rani Peak is Climbed.","status of Kanjiroba North":"The climbing status of Kanjiroba North is Unclimbed.","status of Kande Hiunchuli North II":"The climbing status of Kande Hiunchuli North II is Climbed.","status of the peak name Langchung Khang":"The climbing status of Langchung Khang is Unclimbed.","status of Panbari":"The climbing status of Panbari is Climbed.","status of Surma-Sarovar North":"The climbing status of Surma-Sarovar North is Unclimbed.","status for Rokapi":"The climbing status of Rokapi is Climbed.","status for Dogari":"The climbing status of Dogari is Unclimbed.","status of Chhochenphu Himal":"The climbing status of Chhochenphu Himal is Unclimbed.","status of Nupchu":"The climbing status of Nupchu is Climbed.","status for Gojung":"The climbing status of Gojung is Climbed.","status of the peak name Sharphu V":"The climbing status of Sharphu V is Unclimbed.","status of the peak name Tarke Kang Shar":"The climbing status of Tarke Kang Shar is Climbed.","status for Dhaulagiri VI":"The climbing status of Dhaulagiri VI is Climbed.","status of the peak name Sat Peak":"The climbing status of Sat Peak is Unclimbed.","status of Triangle Peak":"The climbing status of Triangle Peak is Climbed.","status of the peak name Langtang Ri":"The climbing status of Langtang Ri is Climbed.","status for Yubra":"The climbing status of Yubra is Unclimbed."}}},
{"id":"n-8d60342f","guard":[["hasAny",["agole","beding","burke","central","chamar","changdi","changtse","cheo","cho","chuchura","dalpha","dhampus","ding","dogari","dome","domo","dorje","drohmo","element","futi","gang","gojung","hungchhi","imjatse","item number","jannu","kabru","kailash","kali","kangri","kaptang","karko","khatung","kyashar","lachama","langju","langtang","larkya","lasa","lhonak","lingtren","longest","longest one","longest word","lunag","makalu","mansail","mardi","matha","ngojumba","nilgiri","nirekha","nth","nupchu","panbari","pandra","phu","phungi","pointed","position","pumori","purbung","ragi","ramdung","rani","ratna","rokapi","rolmi","saribung","sat","shar","sharphu","singu","sisne","takargo","takphu","tankya","tengkoma","tharpu","thorong","triangle","west","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," status of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-0c46a35b","guard":[["hasAny",["beding","burke","changdi","chhochenphu","chuchura","ding","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","mansail","matha","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","singu","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The climbing ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-c886d12b","guard":[["hasAny",["beding","burke","changdi","chhochenphu","chuchura","ding","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","mansail","matha","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","singu","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," status of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-16d411ca","guard":[["hasAny",["beding","burke","changdi","chhochenphu","chuchura","ding","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","mansail","matha","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","singu","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-e523a68d","guard":[["hasAny",["beding","burke","changdi","chhochenphu","chuchura","ding","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","mansail","matha","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","singu","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-51f212b0","guard":[["hasAny",["beding","burke","changdi","chhochenphu","chuchura","ding","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","mansail","matha","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","singu","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-d03ad33c","guard":[["hasAny",["beding","burke","changdi","chhochenphu","chuchura","ding","element","ganchenpo","ii","invert case","item number","kailash","kali","kangri","kanjiroba","kaptang","mansail","matha","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","singu","surmasarovar","swap case","tankya","tengkangpoche","tengkoma","tharpu","toggle case"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-da9aa68f","guard":[["hasAny",["all caps","beding","burke","capital letters","capitals","changdi","chhochenphu","chuchura","ding","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","mansail","matha","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","singu","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu","upper case","uppercase"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-db6148c2","guard":[["hasAny",["beding","burke","camel case","camelcase","changdi","chhochenphu","chuchura","ding","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","lower camel case","mansail","matha","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","singu","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-19d11827","guard":[["hasAny",["beding","burke","changdi","chhochenphu","chuchura","ding","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","lower case","lowercase","mansail","matha","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","singu","small letters","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-456f4b2c","guard":[["hasAny",["beding","burke","changdi","chhochenphu","chuchura","ding","element","ganchenpo","ii","invert case","item number","kailash","kali","kangri","kanjiroba","kaptang","mansail","matha","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","singu","surmasarovar","swap case","tankya","tengkangpoche","tengkoma","tharpu","toggle case"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-57984015","guard":[["hasAny",["all caps","beding","burke","capital letters","capitals","changdi","chhochenphu","chuchura","ding","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","mansail","matha","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","singu","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu","upper case","uppercase"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-6f58ea18","guard":[["hasAny",["beding","burke","capitalise","capitalize","capitalize each word","changdi","chhochenphu","chuchura","ding","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","mansail","matha","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","singu","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu","title case"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-82695f3e","guard":[["hasAny",["beding","burke","changdi","chhochenphu","chuchura","ding","each word","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","mansail","matha","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","singu","split into words","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu","words"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]]],"mem":null},
{"id":"n-9b1e3444","guard":[["hasAny",["beding","burke","changdi","chhochenphu","chuchura","ding","each word","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","mansail","matha","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","singu","split into words","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu","words"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]]],"mem":null},
{"id":"n-a5d6e994","guard":[["hasAny",["beding","burke","changdi","chhochenphu","chuchura","ding","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","mansail","matha","normalise","normalize","nth","nupchu","of","panbari","pandra","peak","pethangtse","phu","position","pumori","purbung","saribung","simplify the text","singu","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-5483ec24","guard":[["has","climbing"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"Singu Chuli":"The climbing status of Singu Chuli is Climbed.","the peak name Futi Himal":"The climbing status of Futi Himal is Climbed.","the peak name Lingtren":"The climbing status of Lingtren is Climbed.","the peak name Langju":"The climbing status of Langju is Climbed.","Pethangtse East":"The climbing status of Pethangtse East is Climbed.","the peak name Gimmigela Chuli East":"The climbing status of Gimmigela Chuli East is Climbed.","the peak name Takphu Himal":"The climbing status of Takphu Himal is Climbed.","Tankya I":"The climbing status of Tankya I is Unclimbed.","Saribung":"The climbing status of Saribung is Climbed.","Tharpu Chuli":"The climbing status of Tharpu Chuli is Climbed.","the peak name Jannu East":"The climbing status of Jannu East is Unclimbed.","Myagdi Matha":"The climbing status of Myagdi Matha is Unclimbed.","Tengkangpoche":"The climbing status of Tengkangpoche is Climbed.","Yangra Kangri South":"The climbing status of Yangra Kangri South is Unclimbed.","the peak name Kyashar":"The climbing status of Kyashar is Climbed.","Kaptang":"The climbing status of Kaptang is Climbed.","Pumori":"The climbing status of Pumori is Climbed.","Purbung Himal":"The climbing status of Purbung Himal is Unclimbed.","the peak name Leonpo Gang East":"The climbing status of Leonpo Gang East is Climbed.","the peak name Changtse":"The climbing status of Changtse is Climbed.","Lunag II":"The climbing status of Lunag II is Climbed.","the peak name Lhotse Shar":"The climbing status of Lhotse Shar is Climbed.","the peak name Cho Oyu":"The climbing status of Cho Oyu is Climbed.","the peak name Lungchhung":"The climbing status of Lungchhung is Unclimbed.","the peak name Kabru South":"The climbing status of Kabru South is Climbed.","the peak name Pointed Peak":"The climbing status of Pointed Peak is Climbed.","Dhaulagiri IV":"The climbing status of Dhaulagiri IV is Climbed.","Tengkoma":"The climbing status of Tengkoma is Climbed.","the peak name Karko":"The climbing status of Karko is Unclimbed.","the peak name Urkinmang":"The climbing status of Urkinmang is Climbed.","the peak name Glacier Dome":"The climbing status of Glacier Dome is Climbed.","the peak name Lasa":"The climbing status of Lasa is Unclimbed.","the peak name Ngojumba Kang I":"The climbing status of Ngojumba Kang I is Climbed.","the peak name Hungchhi":"The climbing status of Hungchhi is Climbed.","Sano Kailash":"The climbing status of Sano Kailash is Climbed.","the peak name Churen Himal West":"The climbing status of Churen Himal West is Climbed.","Ganchenpo":"The climbing status of Ganchenpo is Climbed.","Sita Chuchura":"The climbing status of Sita Chuchura is Climbed.","the peak name Ripimo Shar":"The climbing status of Ripimo Shar is Climbed.","Phu Kang":"The climbing status of Phu Kang is Unclimbed.","the peak name Drohmo":"The climbing status of Drohmo is Unclimbed.","Mansail":"The climbing status of Mansail is Climbed.","the peak name Phungi":"The climbing status of Phungi is Unclimbed.","Burke Kang":"The climbing status of Burke Kang is Climbed.","Kali Himal":"The climbing status of Kali Himal is Climbed.","the peak name Sisne Himal":"The climbing status of Sisne Himal is Climbed.","the peak name Lachama North":"The climbing status of Lachama North is Unclimbed.","the peak name Thorong Peak":"The climbing status of Thorong Peak is Climbed.","Pandra":"The climbing status of Pandra is Climbed.","Changdi":"The climbing status of Changdi is Unclimbed.","Larkya Peak":"The climbing status of Larkya Peak is Climbed.","the peak name Gyajikang":"The climbing status of Gyajikang is Climbed.","Beding Go":"The climbing status of Beding Go is Climbed.","Gave Ding":"The climbing status of Gave Ding is Climbed.","Rani Peak":"The climbing status of Rani Peak is Climbed.","Kanjiroba North":"The climbing status of Kanjiroba North is Unclimbed.","Kande Hiunchuli North II":"The climbing status of Kande Hiunchuli North II is Climbed.","the peak name Langchung Khang":"The climbing status of Langchung Khang is Unclimbed.","Panbari":"The climbing status of Panbari is Climbed.","Surma-Sarovar North":"The climbing status of Surma-Sarovar North is Unclimbed.","Chhochenphu Himal":"The climbing status of Chhochenphu Himal is Unclimbed.","Nupchu":"The climbing status of Nupchu is Climbed.","the peak name Sharphu V":"The climbing status of Sharphu V is Unclimbed.","the peak name Tarke Kang Shar":"The climbing status of Tarke Kang Shar is Climbed.","the peak name Sat Peak":"The climbing status of Sat Peak is Unclimbed.","Triangle Peak":"The climbing status of Triangle Peak is Climbed.","the peak name Langtang Ri":"The climbing status of Langtang Ri is Climbed."}}},
{"id":"n-990760e6","guard":[["hasAny",["beding","burke","changdi","changtse","chhochenphu","cho","chuchura","churen","ding","dome","drohmo","element","futi","ganchenpo","gang","gimmigela","gyajikang","hungchhi","ii","item number","jannu","kabru","kailash","kali","kangri","kanjiroba","kaptang","karko","kyashar","lachama","langchung","langju","langtang","larkya","lasa","lingtren","lungchhung","mansail","matha","normalise","normalize","nth","nupchu","panbari","pandra","pethangtse","phu","phungi","pointed","position","pumori","purbung","rani","saribung","sat","shar","simplify the text","singu","sisne","surmasarovar","takphu","tengkangpoche","tengkoma","tharpu","thorong","triangle","urkinmang","v"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-a90bc020","guard":[["hasAny",["beding","burke","changdi","changtse","cho","chuchura","churen","ding","dome","drohmo","element","futi","gang","hungchhi","item number","jannu","kabru","kailash","kali","kangri","kaptang","karko","kyashar","lachama","langju","langtang","larkya","lasa","lingtren","longest","longest one","longest word","lunag","mansail","matha","ngojumba","nth","nupchu","panbari","pandra","phu","phungi","pointed","position","pumori","purbung","rani","saribung","sat","shar","singu","sisne","takphu","tankya","tengkoma","tharpu","thorong","triangle","v"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-9fde20ab","guard":[["hasAny",["beding","burke","chuchura","ding","element","ganchenpo","ii","item number","kailash","kali","kaptang","mansail","nth","nupchu","of","panbari","pandra","peak","pethangtse","position","pumori","saribung","singu","tengkangpoche","tengkoma","tharpu"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"},{"lit":"Climbed"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-5e1e93f3","guard":[["hasAny",["beding","burke","changtse","cho","chuchura","churen","ding","dome","element","futi","ganchenpo","gang","gimmigela","gyajikang","hungchhi","ii","item number","kabru","kailash","kali","kaptang","kyashar","langju","langtang","larkya","lingtren","mansail","ngojumba","nth","nupchu","panbari","pandra","pethangtse","pointed","position","pumori","rani","saribung","shar","singu","sisne","takphu","tengkangpoche","tengkoma","tharpu","thorong","triangle","urkinmang"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Climbed."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]]],"mem":null},
{"id":"n-f4b042d1","guard":[["hasAny",["beding","burke","changdi","chhochenphu","chuchura","dhaulagiri","ding","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","larkya","mansail","matha","nth","nupchu","panbari","pandra","pethangtse","phu","position","pumori","purbung","rani","saribung","singu","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu","triangle"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-7e775094","guard":[["hasAny",["beding","burke","changdi","chhochenphu","chuchura","dhaulagiri","ding","element","ganchenpo","ii","item number","kailash","kali","kangri","kanjiroba","kaptang","larkya","lower case","lowercase","mansail","matha","nth","nupchu","panbari","pandra","pethangtse","phu","position","pumori","purbung","rani","saribung","singu","small letters","surmasarovar","tankya","tengkangpoche","tengkoma","tharpu","triangle"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-160f84df","guard":[["has","climbing"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the climbing status of Singu Chuli":"The climbing status of Singu Chuli is Climbed.","the climbing status of Pethangtse East":"The climbing status of Pethangtse East is Climbed.","the climbing status of Tankya I":"The climbing status of Tankya I is Unclimbed.","the climbing status of Saribung":"The climbing status of Saribung is Climbed.","the climbing status of Tharpu Chuli":"The climbing status of Tharpu Chuli is Climbed.","the climbing status of Myagdi Matha":"The climbing status of Myagdi Matha is Unclimbed.","the climbing status of Tengkangpoche":"The climbing status of Tengkangpoche is Climbed.","the climbing status of Yangra Kangri South":"The climbing status of Yangra Kangri South is Unclimbed.","the climbing status of Kaptang":"The climbing status of Kaptang is Climbed.","the climbing status of Pumori":"The climbing status of Pumori is Climbed.","the climbing status of Purbung Himal":"The climbing status of Purbung Himal is Unclimbed.","the climbing status of Lunag II":"The climbing status of Lunag II is Climbed.","the climbing status of Dhaulagiri IV":"The climbing status of Dhaulagiri IV is Climbed.","the climbing status of Tengkoma":"The climbing status of Tengkoma is Climbed.","the climbing status of Sano Kailash":"The climbing status of Sano Kailash is Climbed.","the climbing status of Ganchenpo":"The climbing status of Ganchenpo is Climbed.","the climbing status of Sita Chuchura":"The climbing status of Sita Chuchura is Climbed.","the climbing status of Phu Kang":"The climbing status of Phu Kang is Unclimbed.","the climbing status of Mansail":"The climbing status of Mansail is Climbed.","the climbing status of Burke Kang":"The climbing status of Burke Kang is Climbed.","the climbing status of Kali Himal":"The climbing status of Kali Himal is Climbed.","the climbing status of Pandra":"The climbing status of Pandra is Climbed.","the climbing status of Changdi":"The climbing status of Changdi is Unclimbed.","the climbing status of Larkya Peak":"The climbing status of Larkya Peak is Climbed.","the climbing status of Beding Go":"The climbing status of Beding Go is Climbed.","the climbing status of Gave Ding":"The climbing status of Gave Ding is Climbed.","the climbing status of Rani Peak":"The climbing status of Rani Peak is Climbed.","the climbing status of Kanjiroba North":"The climbing status of Kanjiroba North is Unclimbed.","the climbing status of Kande Hiunchuli North II":"The climbing status of Kande Hiunchuli North II is Climbed.","the climbing status of Panbari":"The climbing status of Panbari is Climbed.","the climbing status of Surma-Sarovar North":"The climbing status of Surma-Sarovar North is Unclimbed.","the climbing status of Chhochenphu Himal":"The climbing status of Chhochenphu Himal is Unclimbed.","the climbing status of Nupchu":"The climbing status of Nupchu is Climbed.","the climbing status of Triangle Peak":"The climbing status of Triangle Peak is Climbed."}}},
{"id":"n-ec8054ca","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," status of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-fdba7d38","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The climbing ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-551803b1","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-d66f3d32","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-0edf3026","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-26bf2fe4","guard":[["hasAny",["agole","camel case","camelcase","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","lower camel case","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-535e081f","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","invert case","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","swap case","takargo","toggle case","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-55ecedd6","guard":[["hasAny",["agole","central","chamar","cheo","class name","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","pascal case","pascalcase","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","upper camel case","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-c8a09c71","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","invert case","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","swap case","takargo","toggle case","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-ec5a57c4","guard":[["hasAny",["agole","all caps","capital letters","capitals","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","upper case","uppercase","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-05f71085","guard":[["hasAny",["agole","all caps","capital letters","capitals","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","upper case","uppercase","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-32904278","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","each word","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","split into words","takargo","vi","words","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]]],"mem":null},
{"id":"n-5981d65a","guard":[["hasAny",["agole","capitalise","capitalize","capitalize each word","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","title case","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-cb4c0465","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","lower case","lowercase","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","small letters","takargo","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-cba7d6be","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","invert case","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","swap case","takargo","toggle case","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-ea3366ec","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","each word","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","split into words","takargo","vi","words","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]]],"mem":null},
{"id":"n-ea61f424","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","each word","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","split into words","takargo","vi","words","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-f82a0725","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","each word","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","split into words","takargo","vi","words","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-7556b146","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","normalise","normalize","nth","position","ragi","ramdung","ratna","rokapi","rolmi","simplify the text","takargo","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-f98cd4e4","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","for","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","kojichuwa","lhonak","lobuje","makalu","mardi","mayonthang","nilgiri","nirekha","normalise","normalize","nth","position","ragi","ramdung","ratna","rokapi","rolmi","simplify the text","takargo","vi","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-7c32ceae","guard":[["has","climbing"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"Tengi Ragi Tau":"The climbing status of Tengi Ragi Tau is Climbed.","Rolmi":"The climbing status of Rolmi is Climbed.","Kasi Dalpha":"The climbing status of Kasi Dalpha is Unclimbed.","Yanme Kang":"The climbing status of Yanme Kang is Climbed.","Dhampus":"The climbing status of Dhampus is Climbed.","Cheo Himal":"The climbing status of Cheo Himal is Climbed.","Mardi Himal":"The climbing status of Mardi Himal is Climbed.","Takargo East":"The climbing status of Takargo East is Climbed.","Lobuje West":"The climbing status of Lobuje West is Climbed.","Sharphu IV":"The climbing status of Sharphu IV is Climbed.","Kojichuwa South":"The climbing status of Kojichuwa South is Unclimbed.","Pawar Central":"The climbing status of Pawar Central is Climbed.","Ratna Chuli":"The climbing status of Ratna Chuli is Climbed.","Chamar North":"The climbing status of Chamar North is Climbed.","Khatung Khang":"The climbing status of Khatung Khang is Climbed.","Agole East":"The climbing status of Agole East is Unclimbed.","Kangchenjunga South":"The climbing status of Kangchenjunga South is Climbed.","Domo":"The climbing status of Domo is Climbed.","Imjatse":"The climbing status of Imjatse is Climbed.","Ghyuthumba Main":"The climbing status of Ghyuthumba Main is Climbed.","Nilgiri North":"The climbing status of Nilgiri North is Climbed.","Ramdung":"The climbing status of Ramdung is Climbed.","Yakawa Kang":"The climbing status of Yakawa Kang is Climbed.","Mayonthang Kang":"The climbing status of Mayonthang Kang is Unclimbed.","Lhonak":"The climbing status of Lhonak is Unclimbed.","Dorje Lhakpa":"The climbing status of Dorje Lhakpa is Climbed.","Nirekha":"The climbing status of Nirekha is Climbed.","Makalu":"The climbing status of Makalu is Climbed.","Rokapi":"The climbing status of Rokapi is Climbed.","Dogari":"The climbing status of Dogari is Unclimbed.","Gojung":"The climbing status of Gojung is Climbed.","Dhaulagiri VI":"The climbing status of Dhaulagiri VI is Climbed.","Yubra":"The climbing status of Yubra is Unclimbed."}}},
{"id":"n-22235f8a","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","gojung","imjatse","item number","khatung","lhonak","lobuje","longest","longest one","longest word","makalu","mardi","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-d352515a","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","gojung","imjatse","item number","khatung","lhonak","lobuje","longest","longest one","longest word","makalu","mardi","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-05d25e9a","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","gojung","imjatse","invert case","item number","khatung","lhonak","lobuje","longest","longest one","longest word","makalu","mardi","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","swap case","takargo","toggle case","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-7275230b","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","gojung","imjatse","item number","khatung","lhonak","lobuje","longest","longest one","longest word","makalu","mardi","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-83d51df2","guard":[["hasAny",["agole","camel case","camelcase","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","gojung","imjatse","item number","khatung","lhonak","lobuje","longest","longest one","longest word","lower camel case","makalu","mardi","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-abb07a2b","guard":[["hasAny",["agole","all caps","capital letters","capitals","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","gojung","imjatse","item number","khatung","lhonak","lobuje","longest","longest one","longest word","makalu","mardi","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","upper case","uppercase","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-001bdf1b","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","each word","element","gojung","imjatse","item number","khatung","lhonak","lobuje","longest","longest one","longest word","makalu","mardi","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","split into words","takargo","words","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]]],"mem":null},
{"id":"n-35f59a59","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","gojung","imjatse","item number","khatung","lhonak","lobuje","longest","longest one","longest word","lower case","lowercase","makalu","mardi","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","small letters","takargo","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-81a1f6ea","guard":[["hasAny",["agole","all caps","capital letters","capitals","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","gojung","imjatse","item number","khatung","lhonak","lobuje","longest","longest one","longest word","makalu","mardi","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","upper case","uppercase","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-8b70a4ee","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","each word","element","gojung","imjatse","item number","khatung","lhonak","lobuje","longest","longest one","longest word","makalu","mardi","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","split into words","takargo","words","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]]],"mem":null},
{"id":"n-a5fb3e96","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","gojung","imjatse","invert case","item number","khatung","lhonak","lobuje","longest","longest one","longest word","makalu","mardi","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","swap case","takargo","toggle case","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-ff7ebfe7","guard":[["hasAny",["agole","capitalise","capitalize","capitalize each word","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","gojung","imjatse","item number","khatung","lhonak","lobuje","longest","longest one","longest word","makalu","mardi","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","title case","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-16ac2925","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","gojung","imjatse","item number","khatung","lhonak","lobuje","longest","longest one","longest word","makalu","mardi","nilgiri","nirekha","normalise","normalize","nth","position","ragi","ramdung","ratna","rokapi","rolmi","simplify the text","takargo","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-c6d50743","guard":[["hasAny",["agole","central","chamar","cheo","dalpha","dhampus","dogari","domo","dorje","element","gojung","imjatse","item number","khatung","lhonak","lobuje","longest","longest one","longest word","makalu","mardi","nilgiri","nirekha","normalise","normalize","nth","position","ragi","ramdung","ratna","rokapi","rolmi","simplify the text","takargo","yakawa","yanme","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-4925bc4c","guard":[["hasAny",["central","chamar","cheo","dhampus","domo","dorje","element","ghyuthumba","gojung","imjatse","item number","kangchenjunga","khatung","lobuje","makalu","mardi","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","vi","yakawa","yanme"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Climbed."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]]],"mem":null},
{"id":"n-23c26240","guard":[["hasAny",["central","chamar","cheo","dhampus","domo","dorje","element","gojung","imjatse","item number","khatung","lobuje","longest","longest one","longest word","makalu","mardi","nilgiri","nirekha","nth","position","ragi","ramdung","ratna","rokapi","rolmi","takargo","yakawa","yanme"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Climbed."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]]],"mem":null},
{"id":"n-d2823337","guard":[["hasAny",["changdi","dhampus","dogari","element","ganchenpo","gojung","imjatse","item number","kaptang","lhonak","makalu","mansail","nirekha","nth","nupchu","panbari","pandra","position","pumori","ramdung","rokapi","saribung","shortest","shortest one","shortest word","tankya","tengkangpoche","tengkoma"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The climbing ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-2c63cf05","guard":[["hasAny",["changdi","chhochenphu","drohmo","element","item number","jannu","kangri","kanjiroba","karko","lachama","langchung","lasa","lungchhung","matha","nth","phu","phungi","position","purbung","sat","surmasarovar","tankya","v"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Unclimbed."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]]],"mem":null},
{"id":"n-126fc61c","guard":[["not",["hasAny",["determined","id","peakid","sucountry","zhou"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}]]],"mem":null},
{"id":"n-fc4d22b7","guard":[["hasAny",["climbing","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}]]],"mem":null},
{"id":"n-d2554dca","guard":[["hasAny",["changdi","dhampus","dogari","element","gojung","imjatse","item number","kaptang","lhonak","longest","longest one","longest word","makalu","mansail","nirekha","nth","nupchu","panbari","pandra","position","pumori","ramdung","rokapi","saribung","shortest","shortest one","shortest word","tankya","tengkoma"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-324581d9","guard":[["hasAny",["burke","chuchura","delete","ding","domo","east","himal","item number","ngojumba","nth","position","rani","remove","shar","strip out","yakawa","yanme"]],["has","climbing"]],"pyramid":["render.str",["transform.remove",{"lit":"climbed"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}]]],"mem":null},
{"id":"n-5cd74146","guard":[["hasAny",["burke","chuchura","delete","ding","domo","east","himal","item number","ngojumba","nth","position","rani","remove","shar","strip out","yakawa","yanme"]],["has","climbing"]],"pyramid":["render.str",["transform.remove",{"lit":"Climbed"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}]]],"mem":null},
{"id":"n-8189e8b3","guard":[["hasAny",["burke","chuchura","dalpha","ding","domo","east","himal","item number","lasa","ngojumba","nth","position","rani","tarke","yakawa","yanme"]],["has","climbing"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-8aa7c918","guard":[["hasAny",["burke","chuchura","dalpha","ding","domo","east","himal","invert case","item number","lasa","ngojumba","nth","position","rani","swap case","tarke","toggle case","yakawa","yanme"]],["has","climbing"]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-a1f4e925","guard":[["hasAny",["burke","camel case","camelcase","chuchura","dalpha","ding","domo","east","himal","item number","lasa","lower camel case","ngojumba","nth","position","rani","tarke","yakawa","yanme"]],["has","climbing"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-a61be172","guard":[["hasAny",["all caps","burke","capital letters","capitals","chuchura","dalpha","ding","domo","east","himal","item number","lasa","ngojumba","nth","position","rani","tarke","upper case","uppercase","yakawa","yanme"]],["has","climbing"]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-9d10c86c","guard":[["hasAny",["burke","chuchura","dalpha","ding","domo","east","himal","item number","lasa","ngojumba","nth","position","rani","yakawa","yanme"]],["has","climbing"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":-1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-40262514","guard":[["hasAny",["all caps","burke","capital letters","capitals","chuchura","dalpha","ding","domo","east","himal","item number","lasa","ngojumba","nth","position","rani","upper case","uppercase","yakawa","yanme"]],["has","climbing"]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":-1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-7bb6bfa6","guard":[["hasAny",["burke","chuchura","dalpha","ding","domo","east","himal","invert case","item number","lasa","ngojumba","nth","position","rani","swap case","toggle case","yakawa","yanme"]],["has","climbing"]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":-1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-f151be87","guard":[["hasAny",["burke","camel case","camelcase","chuchura","dalpha","ding","domo","east","himal","item number","lasa","lower camel case","ngojumba","nth","position","rani","yakawa","yanme"]],["has","climbing"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":-1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-23ca141b","guard":[["hasAny",["changdi","element","ganchenpo","item number","kaptang","mansail","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","tankya","tengkangpoche","tengkoma"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-4701414c","guard":[["hasAny",["changdi","element","ganchenpo","item number","kaptang","mansail","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","tankya","tengkangpoche","tengkoma"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-e4212baa","guard":[["hasAny",["changdi","element","ganchenpo","item number","kaptang","mansail","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","tankya","tengkangpoche","tengkoma"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-398b74ce","guard":[["hasAny",["changdi","element","ganchenpo","item number","kaptang","mansail","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","tankya","tengkangpoche","tengkoma"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-9cfbd9a6","guard":[["hasAny",["camel case","camelcase","changdi","element","ganchenpo","item number","kaptang","lower camel case","mansail","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","tankya","tengkangpoche","tengkoma"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-ec450680","guard":[["hasAny",["changdi","element","ganchenpo","invert case","item number","kaptang","mansail","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","swap case","tankya","tengkangpoche","tengkoma","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-fe5beeba","guard":[["hasAny",["all caps","capital letters","capitals","changdi","element","ganchenpo","item number","kaptang","mansail","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","tankya","tengkangpoche","tengkoma","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-5ff3ba8c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","changdi","element","ganchenpo","item number","kaptang","mansail","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","tankya","tengkangpoche","tengkoma","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-6750f767","guard":[["hasAny",["all caps","capital letters","capitals","changdi","element","ganchenpo","item number","kaptang","mansail","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","tankya","tengkangpoche","tengkoma","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-8019c5f2","guard":[["hasAny",["changdi","each word","element","ganchenpo","item number","kaptang","mansail","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","split into words","tankya","tengkangpoche","tengkoma","words"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]]],"mem":null},
{"id":"n-ae2a0459","guard":[["hasAny",["changdi","element","ganchenpo","invert case","item number","kaptang","mansail","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","swap case","tankya","tengkangpoche","tengkoma","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-c45be7df","guard":[["hasAny",["changdi","element","ganchenpo","item number","kaptang","lower case","lowercase","mansail","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","small letters","tankya","tengkangpoche","tengkoma"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-eb7b92f1","guard":[["hasAny",["changdi","each word","element","ganchenpo","item number","kaptang","mansail","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","split into words","tankya","tengkangpoche","tengkoma","words"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]]],"mem":null},
{"id":"n-c794aabc","guard":[["hasAny",["changdi","element","ganchenpo","item number","kaptang","mansail","normalise","normalize","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","simplify the text","tankya","tengkangpoche","tengkoma"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-84eec295","guard":[["hasAny",["changdi","element","ganchenpo","item number","kaptang","mansail","normalise","normalize","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","simplify the text","tengkangpoche","tengkoma"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-65bbe4c2","guard":[["hasAny",["element","ganchenpo","item number","kaptang","mansail","nth","nupchu","panbari","pandra","position","pumori","saribung","shortest","shortest one","shortest word","tengkangpoche","tengkoma"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Climbed."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]]],"mem":null},
{"id":"n-89b0a989","guard":[["hasAny",["burke","chuchura","ding","east","element","futi","item number","kali","lasa","ngojumba","nth","position","rani","tarke"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-9ba0ca9b","guard":[["hasAny",["burke","camel case","camelcase","chuchura","ding","east","element","futi","item number","kali","lasa","lower camel case","ngojumba","nth","position","rani","tarke"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-aba8312b","guard":[["hasAny",["burke","chuchura","ding","east","element","futi","invert case","item number","kali","lasa","ngojumba","nth","position","rani","swap case","tarke","toggle case"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-92984620","guard":[["hasAny",["climbing","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}],["sense.roman"]]],"mem":null},
{"id":"n-5b8f591f","guard":[["hasAny",["climbing","element","item number","nth","palindrome","position","reads the same backwards","same forwards and backwards"]]],"pyramid":["render.yesNo",["compare.isPalindrome",["sense.roman"]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],{"lit":"Climbed"}],"mem":null},
{"id":"n-0c3ad78e","guard":[["hasAny",["an even number","character count","climbing","element","even","how many characters","is even","item number","length","nth","number of characters","position"]]],"pyramid":["render.yesNo",["compare.isEven",["aggregate.chars",["sense.roman"]]],{"lit":"Climbed"},["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-28a553cf","guard":[["hasAny",["agole","dalpha","dogari","element","item number","kojichuwa","lhonak","mayonthang","nth","position","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Unclimbed."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]]],"mem":null},
{"id":"n-0e09183a","guard":[["hasAny",["delete","dhaulagiri","ii","iv","kang","remove","strip out"]],["has","climbing"]],"pyramid":["render.str",["transform.remove",{"lit":"Climbed"},["sense.roman"]]],"mem":null},
{"id":"n-831fb861","guard":[["hasAny",["delete","dhaulagiri","ii","iv","kang","remove","strip out"]],["has","climbing"]],"pyramid":["render.str",["transform.remove",{"lit":"climbed"},["sense.roman"]]],"mem":null},
{"id":"n-166a517c","guard":[["hasAny",["agole","dalpha","dogari","element","item number","lhonak","longest","longest one","longest word","nth","position","yubra"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Unclimbed."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]]],"mem":null},
{"id":"n-6221d51d","guard":[["hasAny",["climbing","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}]]],"mem":null},
{"id":"n-13b5ba4f","guard":[["hasAny",["element","ganchenpo","gyajikang","item number","longest","longest one","longest word","lungchhung","nth","position","tengkangpoche","urkinmang"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-7ccc10bd","guard":[["hasAny",["cheo","dalpha","domo","element","item number","longest","longest one","longest word","nth","position","yakawa","yanme"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-0fd98009","guard":[["hasAny",["camel case","camelcase","cheo","dalpha","domo","element","item number","longest","longest one","longest word","lower camel case","nth","position","yakawa","yanme"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-fba14662","guard":[["hasAny",["cheo","dalpha","domo","element","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case","yakawa","yanme"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-269b406e","guard":[["hasAny",["an even number","climbing","element","even","how many words","is even","item number","longest","longest one","longest word","nth","number of words","position","word count"]]],"pyramid":["render.yesNo",["compare.isEven",["aggregate.words",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}]]],["render.template",{"lit":["The ",{"slot":0}," status of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],{"lit":"Climbed"}],"mem":null},
{"id":"n-24797009","guard":[["hasAny",["a leap year","climbing","element","how many letters","is a leap year","item number","leap year","letter count","nth","number of letters","position"]]],"pyramid":["render.yesNo",["compare.isLeap",["aggregate.letters",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}]]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],{"lit":"Climbed"}],"mem":null},
{"id":"n-7450fbc3","guard":[["hasAny",["an even number","climbing","element","even","how many letters","is even","item number","letter count","nth","number of letters","position"]]],"pyramid":["render.yesNo",["compare.isEven",["aggregate.letters",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}]]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],{"lit":"Climbed"}],"mem":null},
{"id":"n-79cab52d","guard":[["hasAny",["a leap year","climbing","consonant count","element","how many consonants","is a leap year","item number","leap year","nth","number of consonants","position"]]],"pyramid":["render.yesNo",["compare.isLeap",["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}]]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],{"lit":"Climbed"}],"mem":null},
{"id":"n-9bdb604f","guard":[["hasAny",["an even number","character count","climbing","element","even","how many characters","is even","item number","length","nth","number of characters","position"]]],"pyramid":["render.yesNo",["compare.isEven",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}]]],{"lit":"Climbed"},["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-4cdda4e1","guard":[["hasAny",["appears in","climbing","contains","element","includes","item number","nth","position"]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}]],{"lit":"Climbed"},["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-22070652","guard":[["hasAny",["dalpha","delete","item number","lasa","mayonthang","nth","phu","position","remove","strip out"]],["has","climbing"]],"pyramid":["render.str",["transform.remove",{"lit":"Unclimbed"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}]]],"mem":null},
{"id":"n-55809c1c","guard":[["hasAny",["dalpha","delete","item number","lasa","mayonthang","nth","phu","position","remove","strip out"]],["has","climbing"]],"pyramid":["render.str",["transform.remove",{"lit":"unclimbed"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}]]],"mem":null},
{"id":"n-91462a33","guard":[["hasAny",["delete","hiunchuli","item number","iv","langtang","nth","nupchu","position","remove","strip out","without"]],["has","climbing"]],"pyramid":["render.str",["transform.remove",{"lit":"climbed"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}]]],"mem":null},
{"id":"n-9fb15b51","guard":[["hasAny",["delete","hiunchuli","item number","iv","langtang","nth","nupchu","position","remove","strip out","without"]],["has","climbing"]],"pyramid":["render.str",["transform.remove",{"lit":"Climbed"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}]]],"mem":null},
{"id":"n-b6308256","guard":[["hasAny",["element","item number","iv","langtang","nth","nupchu","position"]],["has","climbing"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-0eb875d1","guard":[["hasAny",["camel case","camelcase","element","item number","iv","langtang","lower camel case","nth","nupchu","position"]],["has","climbing"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-7bf30551","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","iv","langtang","nth","nupchu","position","upper case","uppercase"]],["has","climbing"]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-a821f534","guard":[["hasAny",["element","invert case","item number","iv","langtang","nth","nupchu","position","swap case","toggle case"]],["has","climbing"]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-142c9042","guard":[["hasAny",["changdi","element","item number","nth","position","shortest","shortest one","shortest word","tankya"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Unclimbed."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]]],"mem":null},
{"id":"n-6fa8889f","guard":[["hasAny",["element","ganchenpo","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","tengkangpoche"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-e7de7b8e","guard":[["hasAny",["element","item number","langtang","nth","nupchu","position"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-08130c15","guard":[["hasAny",["element","invert case","item number","langtang","nth","nupchu","position","swap case","toggle case"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-76fb9bec","guard":[["hasAny",["camel case","camelcase","element","item number","langtang","lower camel case","nth","nupchu","position"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-18879f50","guard":[["hasAny",["delete","remove","strip out","tankya","v"]],["has","climbing"]],"pyramid":["render.str",["transform.remove",{"lit":"Unclimbed"},["sense.roman"]]],"mem":null},
{"id":"n-c19dbd48","guard":[["hasAny",["delete","remove","strip out","tankya","v"]],["has","climbing"]],"pyramid":["render.str",["transform.remove",{"lit":"unclimbed"},["sense.roman"]]],"mem":null},
{"id":"n-0eedf190","guard":[["hasAny",["climbing","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"climbed"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":2}]]],"mem":null},
{"id":"n-15c5a6f3","guard":[["hasAny",["delete","item number","kangri","nth","position","remove","strip out","without"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"Unclimbed"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}]]],"mem":null},
{"id":"n-776d61b1","guard":[["hasAny",["delete","item number","kangri","nth","position","remove","strip out","without"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"unclimbed"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}]]],"mem":null},
{"id":"n-355a0b7a","guard":[["hasAny",["climbing","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"},{"lit":"climbing status"}],["sense.roman"]]],"mem":null},
{"id":"n-beeb2802","guard":[["hasAny",["delete","element","item number","iv","nth","position","remove","strip out","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"},{"lit":"climbing status"}],["sense.roman"]]],"mem":null},
{"id":"n-038d37db","guard":[["hasAny",["element","item number","mansail","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Mansail is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-06178143","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","ramdung"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Ramdung is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-151644c9","guard":[["hasAny",["element","item number","khatung","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Khatung Khang is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-19401412","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tengkoma"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tengkoma is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-1abd38ff","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","yubra"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Yubra is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-1c8b5da0","guard":[["hasAny",["element","item number","kaptang","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kaptang is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-1e02aa02","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","rokapi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Rokapi is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-1fcd0bbe","guard":[["hasAny",["central","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Pawar Central is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-21eed69e","guard":[["hasAny",["domo","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Domo is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-2238de0a","guard":[["hasAny",["element","item number","nth","position","saribung","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Saribung is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-2b910f30","guard":[["hasAny",["element","item number","longest","longest one","longest word","nirekha","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Nirekha is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-308ab89d","guard":[["hasAny",["element","item number","nth","position","vi"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Dhaulagiri VI is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-32702032","guard":[["hasAny",["dalpha","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kasi Dalpha is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-394c9c81","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","ragi"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tengi Ragi Tau is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-3b3dde3e","guard":[["hasAny",["chamar","element","item number","longest","longest one","longest word","nth","position"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Chamar North is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-3c530112","guard":[["hasAny",["element","ganchenpo","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Ganchenpo is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-3c7997f0","guard":[["hasAny",["dorje","element","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Dorje Lhakpa is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-3dc8fcd9","guard":[["hasAny",["element","item number","mayonthang","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Mayonthang Kang is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-4b5fed1c","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","yakawa"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Yakawa Kang is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-5380013e","guard":[["hasAny",["climbing","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak id"}],{"lit":2}]]],"mem":null},
{"id":"n-697da828","guard":[["hasAny",["element","gojung","item number","longest","longest one","longest word","nth","position"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Gojung is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-754f1df8","guard":[["hasAny",["element","item number","nth","panbari","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Panbari is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-778da090","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tengkangpoche"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tengkangpoche is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-7e3b4ac1","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","takargo"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Takargo East is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-83552ddd","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","ratna"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Ratna Chuli is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-8bbb1417","guard":[["hasAny",["dhampus","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Dhampus is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-992dbe90","guard":[["hasAny",["dogari","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Dogari is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-999493d9","guard":[["hasAny",["agole","element","item number","longest","longest one","longest word","nth","position"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Agole East is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-99e9915e","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tankya"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tankya I is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-a68712dd","guard":[["hasAny",["element","ghyuthumba","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Ghyuthumba Main is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-aa822df7","guard":[["hasAny",["element","item number","nth","pandra","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Pandra is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-b8d7dfae","guard":[["hasAny",["element","item number","kangchenjunga","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kangchenjunga South is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-c3f732c8","guard":[["hasAny",["element","item number","kojichuwa","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kojichuwa South is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-c595beea","guard":[["hasAny",["element","item number","longest","longest one","longest word","makalu","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Makalu is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-c5978859","guard":[["hasAny",["cheo","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Cheo Himal is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-c98403b8","guard":[["hasAny",["element","item number","nth","position","pumori","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Pumori is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-ccc6010a","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","yanme"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Yanme Kang is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-d0b896d6","guard":[["hasAny",["element","item number","longest","longest one","longest word","mardi","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Mardi Himal is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-d0fb55a2","guard":[["hasAny",["element","item number","lobuje","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Lobuje West is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-d4c0aac5","guard":[["hasAny",["changdi","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Changdi is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-d869334f","guard":[["hasAny",["element","item number","longest","longest one","longest word","nilgiri","nth","position"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Nilgiri North is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-e6671120","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","rolmi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Rolmi is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-ebfdb573","guard":[["hasAny",["element","item number","lhonak","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Lhonak is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-f6d4181a","guard":[["hasAny",["element","imjatse","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Imjatse is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-f9dbefc0","guard":[["hasAny",["element","item number","nth","nupchu","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Nupchu is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-05c906db","guard":[["hasAny",["beding","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Beding Go is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-08d16371","guard":[["hasAny",["element","item number","langtang","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Langtang Ri is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-10caa0ce","guard":[["hasAny",["element","gang","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Leonpo Gang East is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-13146bb2","guard":[["hasAny",["element","item number","nth","position","takphu"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Takphu Himal is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-197e086a","guard":[["hasAny",["element","item number","ngojumba","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Ngojumba Kang I is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-21230839","guard":[["hasAny",["element","item number","langchung","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Langchung Khang is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-27756613","guard":[["hasAny",["element","item number","kyashar","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kyashar is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-27b35be5","guard":[["hasAny",["element","item number","lungchhung","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Lungchhung is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-288b73fa","guard":[["hasAny",["element","hungchhi","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Hungchhi is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-2a9ca758","guard":[["hasAny",["burke","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Burke Kang is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-2f8ac156","guard":[["hasAny",["element","item number","kangri","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Yangra Kangri South is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-36133b98","guard":[["hasAny",["element","item number","nth","position","purbung"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Purbung Himal is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-37de5458","guard":[["hasAny",["element","item number","kabru","nth","position"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kabru South is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-3a36c3f1","guard":[["hasAny",["element","item number","nth","position","surmasarovar"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Surma-Sarovar North is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-4b627048","guard":[["hasAny",["element","item number","langju","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Langju is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-518b86a8","guard":[["hasAny",["element","item number","nth","position","triangle"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Triangle Peak is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-5430d656","guard":[["hasAny",["element","item number","matha","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Myagdi Matha is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-570af1a8","guard":[["hasAny",["element","item number","lachama","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Lachama North is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-5952aa19","guard":[["hasAny",["chuchura","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Sita Chuchura is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-5972501d","guard":[["hasAny",["element","item number","nth","position","ripimo"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Ripimo Shar is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-63649243","guard":[["hasAny",["chhochenphu","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Chhochenphu Himal is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-648afd4d","guard":[["hasAny",["element","item number","lunag","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Lunag II is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-672b01f0","guard":[["hasAny",["drohmo","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Drohmo is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-6f7c3be9","guard":[["hasAny",["element","item number","nth","position","sat"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Sat Peak is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-70e7391e","guard":[["hasAny",["element","item number","nth","phu","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Phu Kang is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-724370e0","guard":[["hasAny",["element","item number","lhotse","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Lhotse Shar is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-767a57b8","guard":[["hasAny",["element","item number","nth","position","urkinmang"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Urkinmang is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-780a0995","guard":[["hasAny",["element","item number","nth","pethangtse","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Pethangtse East is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-7aaa70fa","guard":[["hasAny",["changtse","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Changtse is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-8be4a946","guard":[["hasAny",["element","gyajikang","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Gyajikang is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-920ffb14","guard":[["hasAny",["element","item number","nth","pointed","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Pointed Peak is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-965045d6","guard":[["hasAny",["element","item number","nth","position","sisne"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Sisne Himal is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-97f1838e","guard":[["hasAny",["element","item number","larkya","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Larkya Peak is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-9fc2e2c6","guard":[["hasAny",["element","item number","lingtren","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Lingtren is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-a81c4900","guard":[["hasAny",["element","item number","nth","position","v"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Sharphu V is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-b7c11dba","guard":[["hasAny",["ding","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Gave Ding is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-bada782a","guard":[["hasAny",["element","hiunchuli","item number","nth","position"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kande Hiunchuli North II is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-bb4c54f8","guard":[["hasAny",["element","item number","karko","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Karko is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-c30e1c88","guard":[["hasAny",["element","item number","kanjiroba","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kanjiroba North is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-c5189a4d","guard":[["hasAny",["element","item number","nth","position","thorong"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Thorong Peak is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-c65b00d0","guard":[["hasAny",["element","item number","kailash","nth","position"]],["has","climbing"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Sano Kailash is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-c939885c","guard":[["hasAny",["element","item number","nth","position","tarke"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tarke Kang Shar is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-c960ab51","guard":[["hasAny",["cho","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Cho Oyu is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-d0632287","guard":[["hasAny",["element","item number","kali","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kali Himal is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-d09f3752","guard":[["hasAny",["element","gimmigela","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Gimmigela Chuli East is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-d9fdfa76","guard":[["hasAny",["churen","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Churen Himal West is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-dca2e0f7","guard":[["hasAny",["element","item number","jannu","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Jannu East is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-e5ca42f3","guard":[["hasAny",["element","item number","lasa","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Lasa is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-ee2fba18","guard":[["hasAny",["element","futi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Futi Himal is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-f0a983bc","guard":[["hasAny",["element","item number","nth","position","singu"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Singu Chuli is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-fc0075d0","guard":[["hasAny",["element","item number","nth","position","rani"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Rani Peak is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-fc8607f7","guard":[["hasAny",["element","item number","nth","position","tharpu"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tharpu Chuli is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-fe76b70c","guard":[["hasAny",["dome","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Glacier Dome is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-ff150a1d","guard":[["hasAny",["element","item number","nth","phungi","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Phungi is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-31b64224","guard":[["hasAny",["element","item number","nth","nupchu","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-a1d011fb","guard":[["hasAny",["element","item number","iv","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"},{"lit":"climbing status"}]],"mem":null},
{"id":"n-34392e40","guard":[["hasAny",["camel case","camelcase","element","item number","iv","longest","longest one","longest word","lower camel case","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-a5ef265f","guard":[["hasAny",["element","invert case","item number","nth","nupchu","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-bd7cee72","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","nth","nupchu","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-df6b8853","guard":[["hasAny",["element","invert case","item number","iv","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"}],{"lit":1}],{"lit":"fr-tidytuesday-peaks-016579"},{"lit":"peak alternative name"},{"lit":"climbing status"}]]],"mem":null},
{"id":"n-00bd9586","guard":[["hasAny",["climbing","matha","myagdi","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Myagdi Matha":"The climbing status of Myagdi Matha is Unclimbed."}}},
{"id":"n-01179f41","guard":[["hasAny",["changtse","climbing","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Changtse":"The climbing status of Changtse is Climbed."}}},
{"id":"n-02d84978","guard":[["hasAny",["climbing","himal","purbung","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Purbung Himal":"The climbing status of Purbung Himal is Unclimbed."}}},
{"id":"n-04f18d4d","guard":[["hasAny",["climbing","domo","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Domo":"The climbing status of Domo is Climbed."}}},
{"id":"n-06118c79","guard":[["hasAny",["climbing","peak","rani","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Rani Peak":"The climbing status of Rani Peak is Climbed."}}},
{"id":"n-0b2dddb6","guard":[["hasAny",["climbing","panbari","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Panbari":"The climbing status of Panbari is Climbed."}}},
{"id":"n-0c28b42e","guard":[["hasAny",["climbing","himal","name","peak","status","takphu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Takphu Himal":"The climbing status of Takphu Himal is Climbed."}}},
{"id":"n-10810fb2","guard":[["hasAny",["climbing","kabru","name","peak","south","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Kabru South":"The climbing status of Kabru South is Climbed."}}},
{"id":"n-1471ef33","guard":[["hasAny",["climbing","dome","glacier","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Glacier Dome":"The climbing status of Glacier Dome is Climbed."}}},
{"id":"n-15860b21","guard":[["hasAny",["burke","climbing","kang","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Burke Kang":"The climbing status of Burke Kang is Climbed."}}},
{"id":"n-158c347c","guard":[["hasAny",["climbing","ragi","status","tau","tengi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Tengi Ragi Tau":"The climbing status of Tengi Ragi Tau is Climbed."}}},
{"id":"n-1c3a00e2","guard":[["hasAny",["chamar","climbing","north","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Chamar North":"The climbing status of Chamar North is Climbed."}}},
{"id":"n-1d2d8443","guard":[["hasAny",["cho","climbing","name","oyu","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Cho Oyu":"The climbing status of Cho Oyu is Climbed."}}},
{"id":"n-1ddaf0ef","guard":[["hasAny",["climbing","ding","gave","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Gave Ding":"The climbing status of Gave Ding is Climbed."}}},
{"id":"n-1e054ab3","guard":[["hasAny",["climbing","ganchenpo","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Ganchenpo":"The climbing status of Ganchenpo is Climbed."}}},
{"id":"n-1eb7a573","guard":[["hasAny",["climbing","status","yubra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Yubra":"The climbing status of Yubra is Unclimbed."}}},
{"id":"n-1ff9f315","guard":[["hasAny",["climbing","hungchhi","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Hungchhi":"The climbing status of Hungchhi is Climbed."}}},
{"id":"n-24b4f00c","guard":[["hasAny",["climbing","name","peak","sat","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Sat Peak":"The climbing status of Sat Peak is Unclimbed."}}},
{"id":"n-27ff50df","guard":[["hasAny",["climbing","lhonak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Lhonak":"The climbing status of Lhonak is Unclimbed."}}},
{"id":"n-2aaec1af","guard":[["hasAny",["climbing","kaptang","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Kaptang":"The climbing status of Kaptang is Climbed."}}},
{"id":"n-2af871b8","guard":[["hasAny",["climbing","kang","name","ngojumba","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Ngojumba Kang I":"The climbing status of Ngojumba Kang I is Climbed."}}},
{"id":"n-2dfdd9e2","guard":[["hasAny",["climbing","ii","lunag","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Lunag II":"The climbing status of Lunag II is Climbed."}}},
{"id":"n-35491fc2","guard":[["hasAny",["climbing","makalu","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Makalu":"The climbing status of Makalu is Climbed."}}},
{"id":"n-3708fadc","guard":[["hasAny",["climbing","status","tengkangpoche"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Tengkangpoche":"The climbing status of Tengkangpoche is Climbed."}}},
{"id":"n-3b71cb27","guard":[["hasAny",["climbing","nirekha","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Nirekha":"The climbing status of Nirekha is Climbed."}}},
{"id":"n-3bce8283","guard":[["hasAny",["climbing","status","tengkoma"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Tengkoma":"The climbing status of Tengkoma is Climbed."}}},
{"id":"n-3bebf9c4","guard":[["hasAny",["climbing","dogari","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Dogari":"The climbing status of Dogari is Unclimbed."}}},
{"id":"n-3c00da7e","guard":[["hasAny",["beding","climbing","go","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Beding Go":"The climbing status of Beding Go is Climbed."}}},
{"id":"n-43cf8cba","guard":[["hasAny",["climbing","himal","name","peak","sisne","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Sisne Himal":"The climbing status of Sisne Himal is Climbed."}}},
{"id":"n-464b6a98","guard":[["hasAny",["climbing","name","peak","phungi","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Phungi":"The climbing status of Phungi is Unclimbed."}}},
{"id":"n-46981043","guard":[["hasAny",["climbing","lungchhung","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Lungchhung":"The climbing status of Lungchhung is Unclimbed."}}},
{"id":"n-4f24a301","guard":[["hasAny",["climbing","peak","status","triangle"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Triangle Peak":"The climbing status of Triangle Peak is Climbed."}}},
{"id":"n-529a112a","guard":[["hasAny",["climbing","khang","langchung","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Langchung Khang":"The climbing status of Langchung Khang is Unclimbed."}}},
{"id":"n-5458e189","guard":[["hasAny",["climbing","mansail","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Mansail":"The climbing status of Mansail is Climbed."}}},
{"id":"n-557f5a1f","guard":[["hasAny",["climbing","kyashar","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Kyashar":"The climbing status of Kyashar is Climbed."}}},
{"id":"n-5ecea39d","guard":[["hasAny",["climbing","name","peak","status","urkinmang"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Urkinmang":"The climbing status of Urkinmang is Climbed."}}},
{"id":"n-615b2e78","guard":[["hasAny",["central","climbing","pawar","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Pawar Central":"The climbing status of Pawar Central is Climbed."}}},
{"id":"n-64ae403e","guard":[["hasAny",["climbing","east","status","takargo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Takargo East":"The climbing status of Takargo East is Climbed."}}},
{"id":"n-6700e919","guard":[["hasAny",["climbing","ramdung","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Ramdung":"The climbing status of Ramdung is Climbed."}}},
{"id":"n-7230d413","guard":[["hasAny",["climbing","futi","himal","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Futi Himal":"The climbing status of Futi Himal is Climbed."}}},
{"id":"n-73ba9e92","guard":[["hasAny",["climbing","kang","phu","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Phu Kang":"The climbing status of Phu Kang is Unclimbed."}}},
{"id":"n-74a3da4a","guard":[["hasAny",["climbing","name","peak","pointed","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Pointed Peak":"The climbing status of Pointed Peak is Climbed."}}},
{"id":"n-75411d53","guard":[["hasAny",["climbing","langtang","name","peak","ri","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Langtang Ri":"The climbing status of Langtang Ri is Climbed."}}},
{"id":"n-77d56b7f","guard":[["hasAny",["climbing","kang","mayonthang","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Mayonthang Kang":"The climbing status of Mayonthang Kang is Unclimbed."}}},
{"id":"n-7af2264c","guard":[["hasAny",["climbing","larkya","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Larkya Peak":"The climbing status of Larkya Peak is Climbed."}}},
{"id":"n-7b1827c0","guard":[["hasAny",["climbing","hiunchuli","ii","kande","north","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Kande Hiunchuli North II":"The climbing status of Kande Hiunchuli North II is Climbed."}}},
{"id":"n-7c237096","guard":[["hasAny",["climbing","khang","khatung","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Khatung Khang":"The climbing status of Khatung Khang is Climbed."}}},
{"id":"n-7d742451","guard":[["hasAny",["climbing","kojichuwa","south","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Kojichuwa South":"The climbing status of Kojichuwa South is Unclimbed."}}},
{"id":"n-80586c60","guard":[["hasAny",["climbing","dalpha","kasi","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Kasi Dalpha":"The climbing status of Kasi Dalpha is Unclimbed."}}},
{"id":"n-85dc3a23","guard":[["hasAny",["chuli","climbing","status","tharpu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Tharpu Chuli":"The climbing status of Tharpu Chuli is Climbed."}}},
{"id":"n-85e1fc1c","guard":[["hasAny",["climbing","kangchenjunga","south","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Kangchenjunga South":"The climbing status of Kangchenjunga South is Climbed."}}},
{"id":"n-89bfbbf5","guard":[["hasAny",["agole","climbing","east","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Agole East":"The climbing status of Agole East is Unclimbed."}}},
{"id":"n-905b7b81","guard":[["hasAny",["cheo","climbing","himal","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Cheo Himal":"The climbing status of Cheo Himal is Climbed."}}},
{"id":"n-998bcc00","guard":[["hasAny",["climbing","kang","status","yanme"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Yanme Kang":"The climbing status of Yanme Kang is Climbed."}}},
{"id":"n-99c07bf4","guard":[["hasAny",["climbing","dhaulagiri","status","vi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Dhaulagiri VI":"The climbing status of Dhaulagiri VI is Climbed."}}},
{"id":"n-9a7e4a45","guard":[["hasAny",["climbing","nilgiri","north","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Nilgiri North":"The climbing status of Nilgiri North is Climbed."}}},
{"id":"n-9c247fa1","guard":[["hasAny",["climbing","name","peak","status","thorong"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Thorong Peak":"The climbing status of Thorong Peak is Climbed."}}},
{"id":"n-9dd3acc7","guard":[["hasAny",["climbing","himal","kali","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Kali Himal":"The climbing status of Kali Himal is Climbed."}}},
{"id":"n-a03c2b1d","guard":[["hasAny",["climbing","drohmo","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Drohmo":"The climbing status of Drohmo is Unclimbed."}}},
{"id":"n-a07c4506","guard":[["hasAny",["climbing","lhotse","name","peak","shar","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Lhotse Shar":"The climbing status of Lhotse Shar is Climbed."}}},
{"id":"n-a3400c6c","guard":[["hasAny",["climbing","kang","name","peak","shar","status","tarke"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Tarke Kang Shar":"The climbing status of Tarke Kang Shar is Climbed."}}},
{"id":"n-a9df78d3","guard":[["hasAny",["climbing","kanjiroba","north","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Kanjiroba North":"The climbing status of Kanjiroba North is Unclimbed."}}},
{"id":"n-ab2aa377","guard":[["hasAny",["climbing","pumori","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Pumori":"The climbing status of Pumori is Climbed."}}},
{"id":"n-aba88af8","guard":[["hasAny",["climbing","dorje","lhakpa","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Dorje Lhakpa":"The climbing status of Dorje Lhakpa is Climbed."}}},
{"id":"n-acb944b0","guard":[["hasAny",["climbing","east","pethangtse","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Pethangtse East":"The climbing status of Pethangtse East is Climbed."}}},
{"id":"n-b03dace6","guard":[["hasAny",["climbing","kailash","sano","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Sano Kailash":"The climbing status of Sano Kailash is Climbed."}}},
{"id":"n-b29e13b8","guard":[["hasAny",["climbing","north","status","surmasarovar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Surma-Sarovar North":"The climbing status of Surma-Sarovar North is Unclimbed."}}},
{"id":"n-b366dd54","guard":[["hasAny",["climbing","gyajikang","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Gyajikang":"The climbing status of Gyajikang is Climbed."}}},
{"id":"n-b4074068","guard":[["hasAny",["climbing","karko","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Karko":"The climbing status of Karko is Unclimbed."}}},
{"id":"n-b5dd065a","guard":[["hasAny",["climbing","kang","status","yakawa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Yakawa Kang":"The climbing status of Yakawa Kang is Climbed."}}},
{"id":"n-b6d978ad","guard":[["hasAny",["chuli","climbing","singu","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Singu Chuli":"The climbing status of Singu Chuli is Climbed."}}},
{"id":"n-b78fa1b1","guard":[["hasAny",["climbing","rokapi","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Rokapi":"The climbing status of Rokapi is Climbed."}}},
{"id":"n-b9c96ed1","guard":[["hasAny",["climbing","kangri","south","status","yangra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Yangra Kangri South":"The climbing status of Yangra Kangri South is Unclimbed."}}},
{"id":"n-bbbb76c4","guard":[["hasAny",["chhochenphu","climbing","himal","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Chhochenphu Himal":"The climbing status of Chhochenphu Himal is Unclimbed."}}},
{"id":"n-bbf16742","guard":[["hasAny",["climbing","rolmi","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Rolmi":"The climbing status of Rolmi is Climbed."}}},
{"id":"n-bd2d4b4b","guard":[["hasAny",["climbing","himal","mardi","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Mardi Himal":"The climbing status of Mardi Himal is Climbed."}}},
{"id":"n-c07f38bb","guard":[["hasAny",["climbing","name","peak","ripimo","shar","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Ripimo Shar":"The climbing status of Ripimo Shar is Climbed."}}},
{"id":"n-c34d708f","guard":[["hasAny",["climbing","imjatse","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Imjatse":"The climbing status of Imjatse is Climbed."}}},
{"id":"n-c8153276","guard":[["hasAny",["chuli","climbing","east","gimmigela","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Gimmigela Chuli East":"The climbing status of Gimmigela Chuli East is Climbed."}}},
{"id":"n-ca4bd977","guard":[["hasAny",["climbing","pandra","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Pandra":"The climbing status of Pandra is Climbed."}}},
{"id":"n-ce2b935f","guard":[["hasAny",["climbing","langju","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Langju":"The climbing status of Langju is Climbed."}}},
{"id":"n-ce335942","guard":[["hasAny",["climbing","nupchu","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Nupchu":"The climbing status of Nupchu is Climbed."}}},
{"id":"n-cf39516f","guard":[["hasAny",["changdi","climbing","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Changdi":"The climbing status of Changdi is Unclimbed."}}},
{"id":"n-cf6de560","guard":[["hasAny",["climbing","east","jannu","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Jannu East":"The climbing status of Jannu East is Unclimbed."}}},
{"id":"n-d035194c","guard":[["hasAny",["climbing","ghyuthumba","main","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Ghyuthumba Main":"The climbing status of Ghyuthumba Main is Climbed."}}},
{"id":"n-d07ef01a","guard":[["hasAny",["chuli","climbing","ratna","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Ratna Chuli":"The climbing status of Ratna Chuli is Climbed."}}},
{"id":"n-d35c822e","guard":[["hasAny",["climbing","lasa","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Lasa":"The climbing status of Lasa is Unclimbed."}}},
{"id":"n-d7cac6e2","guard":[["hasAny",["climbing","saribung","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Saribung":"The climbing status of Saribung is Climbed."}}},
{"id":"n-dcd4dcfc","guard":[["hasAny",["climbing","gojung","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Gojung":"The climbing status of Gojung is Climbed."}}},
{"id":"n-df7c1fd9","guard":[["hasAny",["climbing","status","tankya"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Tankya I":"The climbing status of Tankya I is Unclimbed."}}},
{"id":"n-e18b4ccc","guard":[["hasAny",["climbing","lingtren","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Lingtren":"The climbing status of Lingtren is Climbed."}}},
{"id":"n-e86fce37","guard":[["hasAny",["climbing","lachama","name","north","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Lachama North":"The climbing status of Lachama North is Unclimbed."}}},
{"id":"n-eff3eee4","guard":[["hasAny",["chuchura","climbing","sita","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Sita Chuchura":"The climbing status of Sita Chuchura is Climbed."}}},
{"id":"n-f28a0bc7","guard":[["hasAny",["climbing","dhampus","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Dhampus":"The climbing status of Dhampus is Climbed."}}},
{"id":"n-f314fad6","guard":[["hasAny",["climbing","dhaulagiri","iv","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the climbing status of Dhaulagiri IV":"The climbing status of Dhaulagiri IV is Climbed."}}},
{"id":"n-f4fecb03","guard":[["hasAny",["climbing","east","gang","leonpo","name","peak","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Leonpo Gang East":"The climbing status of Leonpo Gang East is Climbed."}}},
{"id":"n-f6b54375","guard":[["hasAny",["climbing","lobuje","status","west"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Lobuje West":"The climbing status of Lobuje West is Climbed."}}},
{"id":"n-f8d2c39e","guard":[["hasAny",["climbing","iv","sharphu","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the climbing status for Sharphu IV":"The climbing status of Sharphu IV is Climbed."}}},
{"id":"n-fa5282db","guard":[["hasAny",["churen","climbing","himal","name","peak","status","west"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Churen Himal West":"The climbing status of Churen Himal West is Climbed."}}},
{"id":"n-faf11582","guard":[["hasAny",["climbing","name","peak","sharphu","status","v"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Sharphu V":"The climbing status of Sharphu V is Unclimbed."}}},
{"id":"n-783bf90d","guard":[["has","climbing"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Singu Chuli":"The climbing status of Singu Chuli is Climbed.","tell me the climbing status of the peak name Futi Himal":"The climbing status of Futi Himal is Climbed.","give the climbing status for Tengi Ragi Tau":"The climbing status of Tengi Ragi Tau is Climbed.","give the climbing status for Rolmi":"The climbing status of Rolmi is Climbed.","tell me the climbing status of the peak name Lingtren":"The climbing status of Lingtren is Climbed.","tell me the climbing status of the peak name Langju":"The climbing status of Langju is Climbed.","what is the climbing status of Pethangtse East":"The climbing status of Pethangtse East is Climbed.","tell me the climbing status of the peak name Gimmigela Chuli East":"The climbing status of Gimmigela Chuli East is Climbed.","tell me the climbing status of the peak name Takphu Himal":"The climbing status of Takphu Himal is Climbed.","what is the climbing status of Tankya I":"The climbing status of Tankya I is Unclimbed.","what is the climbing status of Saribung":"The climbing status of Saribung is Climbed.","what is the climbing status of Tharpu Chuli":"The climbing status of Tharpu Chuli is Climbed.","tell me the climbing status of the peak name Jannu East":"The climbing status of Jannu East is Unclimbed.","what is the climbing status of Myagdi Matha":"The climbing status of Myagdi Matha is Unclimbed.","give the climbing status for Kasi Dalpha":"The climbing status of Kasi Dalpha is Unclimbed.","what is the climbing status of Tengkangpoche":"The climbing status of Tengkangpoche is Climbed.","give the climbing status for Yanme Kang":"The climbing status of Yanme Kang is Climbed.","what is the climbing status of Yangra Kangri South":"The climbing status of Yangra Kangri South is Unclimbed.","tell me the climbing status of the peak name Kyashar":"The climbing status of Kyashar is Climbed.","give the climbing status for Dhampus":"The climbing status of Dhampus is Climbed.","what is the climbing status of Kaptang":"The climbing status of Kaptang is Climbed.","what is the climbing status of Pumori":"The climbing status of Pumori is Climbed.","what is the climbing status of Purbung Himal":"The climbing status of Purbung Himal is Unclimbed.","give the climbing status for Cheo Himal":"The climbing status of Cheo Himal is Climbed.","tell me the climbing status of the peak name Leonpo Gang East":"The climbing status of Leonpo Gang East is Climbed.","tell me the climbing status of the peak name Changtse":"The climbing status of Changtse is Climbed.","what is the climbing status of Lunag II":"The climbing status of Lunag II is Climbed.","tell me the climbing status of the peak name Lhotse Shar":"The climbing status of Lhotse Shar is Climbed.","tell me the climbing status of the peak name Cho Oyu":"The climbing status of Cho Oyu is Climbed.","give the climbing status for Mardi Himal":"The climbing status of Mardi Himal is Climbed.","tell me the climbing status of the peak name Lungchhung":"The climbing status of Lungchhung is Unclimbed.","give the climbing status for Takargo East":"The climbing status of Takargo East is Climbed.","tell me the climbing status of the peak name Kabru South":"The climbing status of Kabru South is Climbed.","give the climbing status for Lobuje West":"The climbing status of Lobuje West is Climbed.","give the climbing status for Sharphu IV":"The climbing status of Sharphu IV is Climbed.","tell me the climbing status of the peak name Pointed Peak":"The climbing status of Pointed Peak is Climbed.","give the climbing status for Kojichuwa South":"The climbing status of Kojichuwa South is Unclimbed.","what is the climbing status of Dhaulagiri IV":"The climbing status of Dhaulagiri IV is Climbed.","give the climbing status for Pawar Central":"The climbing status of Pawar Central is Climbed.","what is the climbing status of Tengkoma":"The climbing status of Tengkoma is Climbed.","give the climbing status for Ratna Chuli":"The climbing status of Ratna Chuli is Climbed.","give the climbing status for Chamar North":"The climbing status of Chamar North is Climbed.","give the climbing status for Khatung Khang":"The climbing status of Khatung Khang is Climbed.","tell me the climbing status of the peak name Karko":"The climbing status of Karko is Unclimbed.","tell me the climbing status of the peak name Urkinmang":"The climbing status of Urkinmang is Climbed.","tell me the climbing status of the peak name Glacier Dome":"The climbing status of Glacier Dome is Climbed.","tell me the climbing status of the peak name Lasa":"The climbing status of Lasa is Unclimbed.","tell me the climbing status of the peak name Ngojumba Kang I":"The climbing status of Ngojumba Kang I is Climbed.","tell me the climbing status of the peak name Hungchhi":"The climbing status of Hungchhi is Climbed.","what is the climbing status of Sano Kailash":"The climbing status of Sano Kailash is Climbed.","give the climbing status for Agole East":"The climbing status of Agole East is Unclimbed.","give the climbing status for Kangchenjunga South":"The climbing status of Kangchenjunga South is Climbed.","tell me the climbing status of the peak name Churen Himal West":"The climbing status of Churen Himal West is Climbed.","give the climbing status for Domo":"The climbing status of Domo is Climbed.","what is the climbing status of Ganchenpo":"The climbing status of Ganchenpo is Climbed.","what is the climbing status of Sita Chuchura":"The climbing status of Sita Chuchura is Climbed.","tell me the climbing status of the peak name Ripimo Shar":"The climbing status of Ripimo Shar is Climbed.","give the climbing status for Imjatse":"The climbing status of Imjatse is Climbed.","what is the climbing status of Phu Kang":"The climbing status of Phu Kang is Unclimbed.","tell me the climbing status of the peak name Drohmo":"The climbing status of Drohmo is Unclimbed.","what is the climbing status of Mansail":"The climbing status of Mansail is Climbed.","tell me the climbing status of the peak name Phungi":"The climbing status of Phungi is Unclimbed.","give the climbing status for Ghyuthumba Main":"The climbing status of Ghyuthumba Main is Climbed.","give the climbing status for Nilgiri North":"The climbing status of Nilgiri North is Climbed.","what is the climbing status of Burke Kang":"The climbing status of Burke Kang is Climbed.","give the climbing status for Ramdung":"The climbing status of Ramdung is Climbed.","what is the climbing status of Kali Himal":"The climbing status of Kali Himal is Climbed.","tell me the climbing status of the peak name Sisne Himal":"The climbing status of Sisne Himal is Climbed.","give the climbing status for Yakawa Kang":"The climbing status of Yakawa Kang is Climbed.","give the climbing status for Mayonthang Kang":"The climbing status of Mayonthang Kang is Unclimbed.","tell me the climbing status of the peak name Lachama North":"The climbing status of Lachama North is Unclimbed.","tell me the climbing status of the peak name Thorong Peak":"The climbing status of Thorong Peak is Climbed.","what is the climbing status of Pandra":"The climbing status of Pandra is Climbed.","what is the climbing status of Changdi":"The climbing status of Changdi is Unclimbed.","what is the climbing status of Larkya Peak":"The climbing status of Larkya Peak is Climbed.","give the climbing status for Lhonak":"The climbing status of Lhonak is Unclimbed.","tell me the climbing status of the peak name Gyajikang":"The climbing status of Gyajikang is Climbed.","give the climbing status for Dorje Lhakpa":"The climbing status of Dorje Lhakpa is Climbed.","what is the climbing status of Beding Go":"The climbing status of Beding Go is Climbed.","give the climbing status for Nirekha":"The climbing status of Nirekha is Climbed.","give the climbing status for Makalu":"The climbing status of Makalu is Climbed.","what is the climbing status of Gave Ding":"The climbing status of Gave Ding is Climbed.","what is the climbing status of Rani Peak":"The climbing status of Rani Peak is Climbed.","what is the climbing status of Kanjiroba North":"The climbing status of Kanjiroba North is Unclimbed.","what is the climbing status of Kande Hiunchuli North II":"The climbing status of Kande Hiunchuli North II is Climbed.","tell me the climbing status of the peak name Langchung Khang":"The climbing status of Langchung Khang is Unclimbed.","what is the climbing status of Panbari":"The climbing status of Panbari is Climbed.","what is the climbing status of Surma-Sarovar North":"The climbing status of Surma-Sarovar North is Unclimbed.","give the climbing status for Rokapi":"The climbing status of Rokapi is Climbed.","give the climbing status for Dogari":"The climbing status of Dogari is Unclimbed.","what is the climbing status of Chhochenphu Himal":"The climbing status of Chhochenphu Himal is Unclimbed.","what is the climbing status of Nupchu":"The climbing status of Nupchu is Climbed.","give the climbing status for Gojung":"The climbing status of Gojung is Climbed.","tell me the climbing status of the peak name Sharphu V":"The climbing status of Sharphu V is Unclimbed.","tell me the climbing status of the peak name Tarke Kang Shar":"The climbing status of Tarke Kang Shar is Climbed.","give the climbing status for Dhaulagiri VI":"The climbing status of Dhaulagiri VI is Climbed.","tell me the climbing status of the peak name Sat Peak":"The climbing status of Sat Peak is Unclimbed.","what is the climbing status of Triangle Peak":"The climbing status of Triangle Peak is Climbed.","tell me the climbing status of the peak name Langtang Ri":"The climbing status of Langtang Ri is Climbed.","give the climbing status for Yubra":"The climbing status of Yubra is Unclimbed."}}},
{"id":"n-03f9f961","guard":[["has","nupchu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Nupchu":"The climbing status of Nupchu is Climbed."}}},
{"id":"n-076973a3","guard":[["has","phungi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Phungi":"The climbing status of Phungi is Unclimbed."}}},
{"id":"n-08edd770","guard":[["has","ramdung"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Ramdung":"The climbing status of Ramdung is Climbed."}}},
{"id":"n-0c89822f","guard":[["has","takargo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Takargo East":"The climbing status of Takargo East is Climbed."}}},
{"id":"n-16704f68","guard":[["has","kanjiroba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Kanjiroba North":"The climbing status of Kanjiroba North is Unclimbed."}}},
{"id":"n-16714409","guard":[["has","phu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Phu Kang":"The climbing status of Phu Kang is Unclimbed."}}},
{"id":"n-18f3d629","guard":[["has","pethangtse"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Pethangtse East":"The climbing status of Pethangtse East is Climbed."}}},
{"id":"n-1b77b0c6","guard":[["hasAny",["climbing","matha","myagdi","status"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Myagdi Matha":"The climbing status of Myagdi Matha is Unclimbed."}}},
{"id":"n-1d5e1fa2","guard":[["hasAny",["beding","climbing","go","status"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Beding Go":"The climbing status of Beding Go is Climbed."}}},
{"id":"n-1dfa4f0e","guard":[["has","mansail"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Mansail":"The climbing status of Mansail is Climbed."}}},
{"id":"n-23c829f0","guard":[["has","karko"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Karko":"The climbing status of Karko is Unclimbed."}}},
{"id":"n-24fff140","guard":[["hasAny",["churen","west"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Churen Himal West":"The climbing status of Churen Himal West is Climbed."}}},
{"id":"n-2520f8bc","guard":[["has","rolmi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Rolmi":"The climbing status of Rolmi is Climbed."}}},
{"id":"n-267e212f","guard":[["has","triangle"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Triangle Peak":"The climbing status of Triangle Peak is Climbed."}}},
{"id":"n-28ce75bb","guard":[["has","dogari"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Dogari":"The climbing status of Dogari is Unclimbed."}}},
{"id":"n-28fa1f9d","guard":[["has","chhochenphu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Chhochenphu Himal":"The climbing status of Chhochenphu Himal is Unclimbed."}}},
{"id":"n-2b2357f2","guard":[["has","sharphu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Sharphu IV":"The climbing status of Sharphu IV is Climbed."}}},
{"id":"n-2b2ae774","guard":[["has","sat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Sat Peak":"The climbing status of Sat Peak is Unclimbed."}}},
{"id":"n-2dfc1e01","guard":[["has","agole"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Agole East":"The climbing status of Agole East is Unclimbed."}}},
{"id":"n-31c895ed","guard":[["has","takphu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Takphu Himal":"The climbing status of Takphu Himal is Climbed."}}},
{"id":"n-32a43972","guard":[["has","kaptang"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Kaptang":"The climbing status of Kaptang is Climbed."}}},
{"id":"n-34a69066","guard":[["has","sisne"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Sisne Himal":"The climbing status of Sisne Himal is Climbed."}}},
{"id":"n-39907e9b","guard":[["has","lingtren"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Lingtren":"The climbing status of Lingtren is Climbed."}}},
{"id":"n-3e339f2b","guard":[["hasAny",["climbing","kailash","sano","status"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Sano Kailash":"The climbing status of Sano Kailash is Climbed."}}},
{"id":"n-40eda63e","guard":[["has","urkinmang"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Urkinmang":"The climbing status of Urkinmang is Climbed."}}},
{"id":"n-450ec932","guard":[["has","ripimo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Ripimo Shar":"The climbing status of Ripimo Shar is Climbed."}}},
{"id":"n-46a16340","guard":[["has","thorong"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Thorong Peak":"The climbing status of Thorong Peak is Climbed."}}},
{"id":"n-482f7a6d","guard":[["hasAny",["climbing","ding","gave","status"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Gave Ding":"The climbing status of Gave Ding is Climbed."}}},
{"id":"n-487431e7","guard":[["hasAny",["climbing","dalpha","kasi","status"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Kasi Dalpha":"The climbing status of Kasi Dalpha is Unclimbed."}}},
{"id":"n-496407e8","guard":[["hasAny",["gang","leonpo"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Leonpo Gang East":"The climbing status of Leonpo Gang East is Climbed."}}},
{"id":"n-53b7701a","guard":[["hasAny",["khang","langchung"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Langchung Khang":"The climbing status of Langchung Khang is Unclimbed."}}},
{"id":"n-5701aed2","guard":[["has","drohmo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Drohmo":"The climbing status of Drohmo is Unclimbed."}}},
{"id":"n-599982c3","guard":[["has","larkya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Larkya Peak":"The climbing status of Larkya Peak is Climbed."}}},
{"id":"n-5aeda8c5","guard":[["has","rokapi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Rokapi":"The climbing status of Rokapi is Climbed."}}},
{"id":"n-65a95530","guard":[["hasAny",["cho","oyu"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Cho Oyu":"The climbing status of Cho Oyu is Climbed."}}},
{"id":"n-691a8a15","guard":[["has","nilgiri"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Nilgiri North":"The climbing status of Nilgiri North is Climbed."}}},
{"id":"n-6a7fb276","guard":[["hasAny",["kabru","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Kabru South":"The climbing status of Kabru South is Climbed."}}},
{"id":"n-6aa650a8","guard":[["has","tarke"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Tarke Kang Shar":"The climbing status of Tarke Kang Shar is Climbed."}}},
{"id":"n-6c457a3c","guard":[["hasAny",["central","climbing","pawar","status"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Pawar Central":"The climbing status of Pawar Central is Climbed."}}},
{"id":"n-6cf6579c","guard":[["has","tengkoma"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Tengkoma":"The climbing status of Tengkoma is Climbed."}}},
{"id":"n-6eb2249f","guard":[["has","dhampus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Dhampus":"The climbing status of Dhampus is Climbed."}}},
{"id":"n-70705bbe","guard":[["has","pointed"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Pointed Peak":"The climbing status of Pointed Peak is Climbed."}}},
{"id":"n-70a8e06d","guard":[["has","lasa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Lasa":"The climbing status of Lasa is Unclimbed."}}},
{"id":"n-725dfd3a","guard":[["has","nirekha"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Nirekha":"The climbing status of Nirekha is Climbed."}}},
{"id":"n-73ce6108","guard":[["has","imjatse"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Imjatse":"The climbing status of Imjatse is Climbed."}}},
{"id":"n-7422be8f","guard":[["has","tankya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Tankya I":"The climbing status of Tankya I is Unclimbed."}}},
{"id":"n-778c2efd","guard":[["has","domo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Domo":"The climbing status of Domo is Climbed."}}},
{"id":"n-7a1b9d12","guard":[["hasAny",["climbing","ragi","status","tau","tengi"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Tengi Ragi Tau":"The climbing status of Tengi Ragi Tau is Climbed."}}},
{"id":"n-7c0e6fe5","guard":[["has","futi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Futi Himal":"The climbing status of Futi Himal is Climbed."}}},
{"id":"n-7cf08135","guard":[["has","rani"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Rani Peak":"The climbing status of Rani Peak is Climbed."}}},
{"id":"n-7fcc93eb","guard":[["hasAny",["climbing","ii","lunag","status"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Lunag II":"The climbing status of Lunag II is Climbed."}}},
{"id":"n-81f04090","guard":[["has","jannu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Jannu East":"The climbing status of Jannu East is Unclimbed."}}},
{"id":"n-83ed5abe","guard":[["has","pumori"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Pumori":"The climbing status of Pumori is Climbed."}}},
{"id":"n-862e74b9","guard":[["has","kali"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Kali Himal":"The climbing status of Kali Himal is Climbed."}}},
{"id":"n-89a4bd65","guard":[["has","kangchenjunga"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Kangchenjunga South":"The climbing status of Kangchenjunga South is Climbed."}}},
{"id":"n-8add3004","guard":[["has","tharpu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Tharpu Chuli":"The climbing status of Tharpu Chuli is Climbed."}}},
{"id":"n-931b5a7e","guard":[["has","singu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Singu Chuli":"The climbing status of Singu Chuli is Climbed."}}},
{"id":"n-936cd19a","guard":[["has","surmasarovar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Surma-Sarovar North":"The climbing status of Surma-Sarovar North is Unclimbed."}}},
{"id":"n-9843f5fc","guard":[["has","langju"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Langju":"The climbing status of Langju is Climbed."}}},
{"id":"n-9d29687a","guard":[["hasAny",["climbing","hiunchuli","ii","kande","north","status"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Kande Hiunchuli North II":"The climbing status of Kande Hiunchuli North II is Climbed."}}},
{"id":"n-9e1b824e","guard":[["has","mardi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Mardi Himal":"The climbing status of Mardi Himal is Climbed."}}},
{"id":"n-a1cf86f1","guard":[["has","kojichuwa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Kojichuwa South":"The climbing status of Kojichuwa South is Unclimbed."}}},
{"id":"n-a535f043","guard":[["has","yakawa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Yakawa Kang":"The climbing status of Yakawa Kang is Climbed."}}},
{"id":"n-a663e9d4","guard":[["has","panbari"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Panbari":"The climbing status of Panbari is Climbed."}}},
{"id":"n-a7beb335","guard":[["has","burke"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Burke Kang":"The climbing status of Burke Kang is Climbed."}}},
{"id":"n-a8ae9483","guard":[["has","lungchhung"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Lungchhung":"The climbing status of Lungchhung is Unclimbed."}}},
{"id":"n-b47b690c","guard":[["hasAny",["lachama","north"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Lachama North":"The climbing status of Lachama North is Unclimbed."}}},
{"id":"n-b52ab971","guard":[["has","tengkangpoche"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Tengkangpoche":"The climbing status of Tengkangpoche is Climbed."}}},
{"id":"n-b92791b7","guard":[["has","yubra"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Yubra":"The climbing status of Yubra is Unclimbed."}}},
{"id":"n-b962ffa8","guard":[["has","changtse"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Changtse":"The climbing status of Changtse is Climbed."}}},
{"id":"n-ba610212","guard":[["hasAny",["climbing","khang","khatung","status"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Khatung Khang":"The climbing status of Khatung Khang is Climbed."}}},
{"id":"n-c19a62f0","guard":[["has","mayonthang"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Mayonthang Kang":"The climbing status of Mayonthang Kang is Unclimbed."}}},
{"id":"n-c45c8c7c","guard":[["hasAny",["kangri","yangra"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Yangra Kangri South":"The climbing status of Yangra Kangri South is Unclimbed."}}},
{"id":"n-c93dace3","guard":[["has","yanme"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Yanme Kang":"The climbing status of Yanme Kang is Climbed."}}},
{"id":"n-c9a71049","guard":[["has","ratna"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Ratna Chuli":"The climbing status of Ratna Chuli is Climbed."}}},
{"id":"n-cad390ab","guard":[["hasAny",["climbing","lobuje","status","west"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Lobuje West":"The climbing status of Lobuje West is Climbed."}}},
{"id":"n-cb43523a","guard":[["has","makalu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Makalu":"The climbing status of Makalu is Climbed."}}},
{"id":"n-cc0030b9","guard":[["has","ganchenpo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Ganchenpo":"The climbing status of Ganchenpo is Climbed."}}},
{"id":"n-d2332f33","guard":[["has","kyashar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Kyashar":"The climbing status of Kyashar is Climbed."}}},
{"id":"n-d282c21c","guard":[["has","gojung"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Gojung":"The climbing status of Gojung is Climbed."}}},
{"id":"n-d368781e","guard":[["has","changdi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Changdi":"The climbing status of Changdi is Unclimbed."}}},
{"id":"n-d6f1f824","guard":[["has","purbung"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Purbung Himal":"The climbing status of Purbung Himal is Unclimbed."}}},
{"id":"n-d9d2efb8","guard":[["hasAny",["climbing","dorje","lhakpa","status"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Dorje Lhakpa":"The climbing status of Dorje Lhakpa is Climbed."}}},
{"id":"n-db4b6486","guard":[["hasAny",["dome","glacier"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Glacier Dome":"The climbing status of Glacier Dome is Climbed."}}},
{"id":"n-db6a2cc6","guard":[["hasAny",["chuli","gimmigela"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Gimmigela Chuli East":"The climbing status of Gimmigela Chuli East is Climbed."}}},
{"id":"n-e207d040","guard":[["has","vi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Dhaulagiri VI":"The climbing status of Dhaulagiri VI is Climbed."}}},
{"id":"n-e3816b5b","guard":[["has","gyajikang"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Gyajikang":"The climbing status of Gyajikang is Climbed."}}},
{"id":"n-e49ccc86","guard":[["hasAny",["sharphu","v"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Sharphu V":"The climbing status of Sharphu V is Unclimbed."}}},
{"id":"n-e5d09a1d","guard":[["has","lhonak"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Lhonak":"The climbing status of Lhonak is Unclimbed."}}},
{"id":"n-e5e3010e","guard":[["has","saribung"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Saribung":"The climbing status of Saribung is Climbed."}}},
{"id":"n-e8c14ff7","guard":[["hasAny",["langtang","ri"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Langtang Ri":"The climbing status of Langtang Ri is Climbed."}}},
{"id":"n-e93cedb5","guard":[["hasAny",["climbing","ghyuthumba","main","status"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Ghyuthumba Main":"The climbing status of Ghyuthumba Main is Climbed."}}},
{"id":"n-eb738d2c","guard":[["hasAny",["chuchura","climbing","sita","status"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Sita Chuchura":"The climbing status of Sita Chuchura is Climbed."}}},
{"id":"n-ebb8f035","guard":[["has","cheo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Cheo Himal":"The climbing status of Cheo Himal is Climbed."}}},
{"id":"n-ebcfa664","guard":[["has","chamar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the climbing status for Chamar North":"The climbing status of Chamar North is Climbed."}}},
{"id":"n-f1b13705","guard":[["has","ngojumba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Ngojumba Kang I":"The climbing status of Ngojumba Kang I is Climbed."}}},
{"id":"n-f2e004f3","guard":[["has","pandra"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the climbing status of Pandra":"The climbing status of Pandra is Climbed."}}},
{"id":"n-fd1a6a50","guard":[["has","lhotse"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Lhotse Shar":"The climbing status of Lhotse Shar is Climbed."}}},
{"id":"n-fe8b5e42","guard":[["has","hungchhi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the climbing status of the peak name Hungchhi":"The climbing status of Hungchhi is Climbed."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the climbing status of Singu Chuli","expect":{"contains":["Climbed"],"notRefusal":true}},{"q":"tell me the climbing status of the peak name Futi Himal","expect":{"contains":["Climbed"],"notRefusal":true}},{"q":"give the climbing status for Tengi Ragi Tau","expect":{"contains":["Climbed"],"notRefusal":true}},{"q":"give the climbing status for Rolmi","expect":{"contains":["Climbed"],"notRefusal":true}},{"q":"tell me the climbing status of the peak name Lingtren","expect":{"contains":["Climbed"],"notRefusal":true}},{"q":"tell me the climbing status of the peak name Langju","expect":{"contains":["Climbed"],"notRefusal":true}},{"q":"what is the climbing status of Pethangtse East","expect":{"contains":["Climbed"],"notRefusal":true}},{"q":"tell me the climbing status of the peak name Gimmigela Chuli East","expect":{"contains":["Climbed"],"notRefusal":true}},{"q":"tell me the climbing status of the peak name Takphu Himal","expect":{"contains":["Climbed"],"notRefusal":true}},{"q":"what is the climbing status of Tankya I","expect":{"contains":["Unclimbed"],"notRefusal":true}},{"q":"what is the climbing status of Saribung","expect":{"contains":["Climbed"],"notRefusal":true}},{"q":"what is the climbing status of Tharpu Chuli","expect":{"contains":["Climbed"],"notRefusal":true}},{"q":"tell me the climbing status of the peak name Jannu East","expect":{"contains":["Unclimbed"],"notRefusal":true}},{"q":"what is the climbing status of Myagdi Matha","expect":{"contains":["Unclimbed"],"notRefusal":true}},{"q":"give the climbing status for Kasi Dalpha","expect":{"contains":["Unclimbed"],"notRefusal":true}},{"q":"what is the climbing status of Tengkangpoche","expect":{"contains":["Climbed"],"notRefusal":true}},{"q":"give the climbing status for Yanme Kang","expect":{"contains":["Climbed"],"notRefusal":true}},{"q":"what is the climbing status of Yangra Kangri South","expect":{"contains":["Unclimbed"],"notRefusal":true}},{"q":"tell me the climbing status of the peak name Kyashar","expect":{"contains":["Climbed"],"notRefusal":true}},{"q":"give the climbing status for Dhampus","expect":{"contains":["Climbed"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
