// sp500-company-sector-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"sp500-company-sector-neo-g10","class":"sp500-company-sector","generation":10,"lane":"neo","grownFrom":["name the industry sector of Hilton Worldwide","what GICS sector does Hershey Company (The) belong to","which sector is Jabil in","name the industry sector of Motorola Solutions","which sector is Walt Disney Company (The) in","name the industry sector of FactSet","name the industry sector of News Corp (Class B)","what GICS sector does TransDigm Group belong to","name the industry sector of SBA Communications","what GICS sector does TKO Group Holdings belong to","what GICS sector does Brown & Brown belong to","which sector is Assurant in","which sector is RTX Corporation in","which sector is Newmont in","which sector is Huntington Bancshares in","what GICS sector does Principal Financial Group belong to","what GICS sector does Targa Resources belong to","which sector is Merck & Co. in","which sector is Interactive Brokers in","which sector is Leidos in"],"version":1});

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
knowLoad([{"id":"sp500","columns":["ticker","company","sector"],"n":503,"cols":[{"s":"MMM|ABT|ACN|AES|AFL|APD|ABNB|ARE|GOOGL|MO|APA|APP|CHTR|CMCSA|DIS|ECHO|FOX|FOXA|GOOG|LYV|META|NFLX|NWS|NWSA|OMC|PSKY|RDDT|T|TKO|TMUS|TTWO|VZ|WBD|AMZN|APTV|AZO|BBY|BKNG|CCL|CMG|CVNA|DASH|DECK|DHI|DPZ|DRI|EBAY|EXPE|F|GM|GPC|GRMN|HAS|HD|HLT|LEN|LOW|LULU|LVS|MAR|MCD|MGM|NCLH|NKE|NVR|ORLY|PHM|RCL|RL|ROST|SBUX|TJX|TPR|TSCO|TSLA|ULTA|WSM|WYNN|YUM|ADM|BF.B|BG|CASY|CHD|CL|CLX|COST|DG|DLTR|EL|GIS|HRL|HSY|KDP|KHC|KMB|KO|KR|KVUE|MDLZ|MKC|MNST|PEP|PG|PM|SJM|STZ|SYY|TGT|TSN|WMT|BKR|COP|CVX|DVN|EOG|EQT|EXE|FANG|HAL|KMI|MPC|OKE|OXY|PSX|SLB|TPL|TRGP|VLO|WMB|XOM|ACGL|AIG|AIZ|AJG|ALL|AMP|AON|APO|ARES|AXP|BAC|BEN|BLK|BNY|BRK.B|BRO|BX|C|CB|CBOE|CFG|CINF|CME|COF|COIN|CPAY|EG|ERIE|FDS|FIS|FISV|FITB|GL|GPN|GS|HBAN|HIG|HOOD|IBKR|ICE|IVZ|JKHY|JPM|KEY|KKR|L|MA|MCO|MET|MRSH|MS|MSCI|MTB|NDAQ|NTRS|PFG|PGR|PNC|PRU|PYPL|RF|RJF|SCHW|SPGI|STT|SYF|TFC|TROW|TRV|USB|V|WFC|WRB|WTW|XYZ|A|ABBV|ALGN|AMGN|BAX|BDX|BIIB|BMY|BSX|CAH|CI|CNC|COO|COR|CRL|CVS|DGX|DHR|DVA|DXCM|ELV|EW|GEHC|GILD|HCA|HSIC|HUM|IDXX|ILMN|INCY|IQV|ISRG|JNJ|LH|LLY|MCK|MDT|MRK|MRNA|MTD|PFE|PODD|REGN|RMD|RVTY|SOLV|STE|SYK|TECH|TMO|UHS|UNH|VEEV|VRTX|VTRS|WAT|WST|ZBH|ZTS|ADP|ALLE|AME|AOS|AXON|BA|BE|BR|CARR|CAT|CHRW|CMI|CPRT|CSX|CTAS|DAL|DD|DE|DOV|EFX|EME|EMR|ETN|EXPD|FAST|FDX|FDXF|FERG|FIX|FTV|GD|GE|GEV|GNRC|GWW|HII|HON|HONA|HUBB|HWM|IEX|IR|ITW|J|JBHT|JCI|LDOS|LHX|LII|LMT|LUV|MAS|NDSN|NOC|NSC|ODFL|OTIS|PAYX|PCAR|PH|PNR|PWR|ROK|ROL|RSG|RTX|SNA|SWK|TDG|TT|TXT|UAL|UBER|UNP|UPS|URI|VLTO|VRSK|VRT|WAB|WM|XYL|AAPL|ADBE|ADI|ADSK|AKAM|AMAT|AMD|ANET|APH|AVGO|CDNS|CDW|CIEN|COHR|CRM|CRWD|CSCO|CTSH|DDOG|DELL|FFIV|FICO|FLEX|FSLR|FTNT|GDDY|GEN|GLW|HPE|HPQ|IBM|INTC|INTU|IT|JBL|KEYS|KLAC|LITE|LRCX|MCHP|MPWR|MRVL|MSFT|MSI|MU|NOW|NTAP|NVDA|NXPI|ON|ORCL|P|PANW|PLTR|PTC|Q|QCOM|ROP|SMCI|SNDK|SNPS|STX|SWKS|TDY|TEL|TER|TRMB|TXN|TYL|VRSN|WDAY|WDC|ZBRA|ALB|AMCR|AVY|BALL|CF|CRH|CTVA|DOW|ECL|FCX|IFF|IP|LIN|LYB|MLM|MOS|NEM|NUE|PKG|PPG|SHW|STLD|SW|VMC|AMT|BXP|CBRE|CCI|CPT|CSGP|DLR|DOC|EQIX|ESS|EXR|FRT|HST|INVH|IRM|KIM|MAA|O|PLD|PSA|REG|SBAC|SPG|UDR|VICI|VMRK|VTR|WELL|WY|AEE|AEP|ATO|AWK|CEG|CMS|CNP|D|DTE|DUK|ED|EIX|ES|ETR|EVRG|EXC|FE|LNT|NEE|NI|NRG|PCG|PEG|PNW|PPL|SO|SRE|VST|WEC|XEL","sep":"|"},{"s":"3M~Abbott Laboratories~Accenture~AES Corporation~Aflac~Air Products~Airbnb~Alexandria Real Estate Equities~Alphabet Inc. (Class A)~Altria~APA Corporation~AppLovin~Charter Communications~Comcast~Walt Disney Company (The)~EchoStar~Fox Corporation (Class B)~Fox Corporation (Class A)~Alphabet Inc. (Class C)~Live Nation Entertainment~Meta Platforms~Netflix~News Corp (Class B)~News Corp (Class A)~Omnicom Group~Paramount Skydance Corporation~Reddit~AT&T~TKO Group Holdings~T-Mobile US~Take-Two Interactive~Verizon~Warner Bros. Discovery~Amazon~Aptiv~AutoZone~Best Buy~Booking Holdings~Carnival Corporation~Chipotle Mexican Grill~Carvana~DoorDash~Deckers Brands~D. R. Horton~Domino's~Darden Restaurants~eBay Inc.~Expedia Group~Ford Motor Company~General Motors~Genuine Parts Company~Garmin~Hasbro~Home Depot (The)~Hilton Worldwide~Lennar~Lowe's~Lululemon Athletica~Las Vegas Sands~Marriott International~McDonald's~MGM Resorts~Norwegian Cruise Line Holdings~Nike, Inc.~NVR, Inc.~O'Reilly Automotive~PulteGroup~Royal Caribbean Group~Ralph Lauren Corporation~Ross Stores~Starbucks~TJX Companies~Tapestry, Inc.~Tractor Supply~Tesla, Inc.~Ulta Beauty~Williams-Sonoma, Inc.~Wynn Resorts~Yum! Brands~Archer Daniels Midland~Brown–Forman~Bunge Global~Casey's~Church & Dwight~Colgate-Palmolive~Clorox~Costco~Dollar General~Dollar Tree~Estée Lauder Companies (The)~General Mills~Hormel Foods~Hershey Company (The)~Keurig Dr Pepper~Kraft Heinz~Kimberly-Clark~Coca-Cola Company (The)~Kroger~Kenvue~Mondelez International~McCormick & Company~Monster Beverage~PepsiCo~Procter & Gamble~Philip Morris International~J.M. Smucker Company (The)~Constellation Brands~Sysco~Target Corporation~Tyson Foods~Walmart~Baker Hughes~ConocoPhillips~Chevron Corporation~Devon Energy~EOG Resources~EQT Corporation~Expand Energy~Diamondback Energy~Halliburton~Kinder Morgan~Marathon Petroleum~Oneok~Occidental Petroleum~Phillips 66~Schlumberger~Texas Pacific Land Corporation~Targa Resources~Valero Energy~Williams Companies~ExxonMobil~Arch Capital Group~American International Group~Assurant~Arthur J. Gallagher & Co.~Allstate~Ameriprise Financial~Aon plc~Apollo Global Management~Ares Management~American Express~Bank of America~Franklin Resources~BlackRock~BNY Mellon~Berkshire Hathaway~Brown & Brown~Blackstone Inc.~Citigroup~Chubb Limited~Cboe Global Markets~Citizens Financial Group~Cincinnati Financial~CME Group~Capital One~Coinbase~Corpay~Everest Group~Erie Indemnity~FactSet~Fidelity National Information Services~Fiserv~Fifth Third Bancorp~Globe Life~Global Payments~Goldman Sachs~Huntington Bancshares~Hartford (The)~Robinhood Markets~Interactive Brokers~Intercontinental Exchange~Invesco~Jack Henry & Associates~JPMorgan Chase~KeyCorp~KKR & Co.~Loews Corporation~Mastercard~Moody's Corporation~MetLife~Marsh McLennan~Morgan Stanley~MSCI~M&T Bank~Nasdaq, Inc.~Northern Trust~Principal Financial Group~Progressive Corporation~PNC Financial Services~Prudential Financial~PayPal~Regions Financial Corporation~Raymond James Financial~Charles Schwab Corporation~S&P Global~State Street Corporation~Synchrony Financial~Truist Financial~T. Rowe Price~Travelers Companies (The)~U.S. Bancorp~Visa Inc.~Wells Fargo~W. R. Berkley Corporation~Willis Towers Watson~Block, Inc.~Agilent Technologies~AbbVie~Align Technology~Amgen~Baxter International~Becton Dickinson~Biogen~Bristol Myers Squibb~Boston Scientific~Cardinal Health~Cigna~Centene Corporation~Cooper Companies (The)~Cencora~Charles River Laboratories~CVS Health~Quest Diagnostics~Danaher Corporation~DaVita~Dexcom~Elevance Health~Edwards Lifesciences~GE HealthCare~Gilead Sciences~HCA Healthcare~Henry Schein~Humana~Idexx Laboratories~Illumina, Inc.~Incyte~IQVIA~Intuitive Surgical~Johnson & Johnson~Labcorp~Lilly (Eli)~McKesson Corporation~Medtronic~Merck & Co.~Moderna~Mettler Toledo~Pfizer~Insulet Corporation~Regeneron Pharmaceuticals~ResMed|~Revvity~Solventum~Steris~Stryker Corporation~Bio-Techne~Thermo Fisher Scientific~Universal Health Services~UnitedHealth Group~Veeva Systems~Vertex Pharmaceuticals~Viatris~Waters Corporation~West Pharmaceutical Services~Zimmer Biomet~Zoetis~Automatic Data Processing~Allegion~Ametek~A. O. Smith~Axon Enterprise~Boeing~Bloom Energy~Broadridge Financial Solutions~Carrier Global~Caterpillar Inc.~C.H. Robinson~Cummins~Copart~CSX Corporation~Cintas~Delta Air Lines~DuPont~Deere & Company~Dover Corporation~Equifax~Emcor~Emerson Electric~Eaton Corporation~Expeditors International~Fastenal~FedEx~FedEx Freight~Ferguson Enterprises~Comfort Systems USA~Fortive~General Dynamics~GE Aerospace~GE Vernova~Generac~W. W. Grainger~Huntington Ingalls Industries~Honeywell Technologies~Honeywell Aerospace~Hubbell Incorporated~Howmet Aerospace~IDEX Corporation~Ingersoll Rand~Illinois Tool Works~Jacobs Solutions~J.B. Hunt~Johnson Controls~Leidos~L3Harris~Lennox International~Lockheed Martin~Southwest Airlines~Masco~Nordson Corporation~Northrop Grumman~Norfolk Southern~Old Dominion~Otis Worldwide~Paychex~Paccar~Parker Hannifin~Pentair~Quanta Services~Rockwell Automation~Rollins, Inc.~Republic Services~RTX Corporation~Snap-on~Stanley Black & Decker~TransDigm Group~Trane Technologies~Textron~United Airlines Holdings~Uber~Union Pacific Corporation~United Parcel Service~United Rentals~Veralto~Verisk Analytics~Vertiv~Wabtec~Waste Management~Xylem Inc.~Apple Inc.~Adobe Inc.~Analog Devices~Autodesk~Akamai Technologies~Applied Materials~Advanced Micro Devices~Arista Networks~Amphenol~Broadcom~Cadence Design Systems~CDW Corporation~Ciena~Coherent Corp.~Salesforce~CrowdStrike~Cisco~Cognizant~Datadog~Dell Technologies~F5, Inc.~Fair Isaac~Flex Ltd.~First Solar~Fortinet~GoDaddy~Gen Digital~Corning Inc.~Hewlett Packard Enterprise~HP Inc.~IBM~Intel~Intuit~Gartner~Jabil~Keysight Technologies~KLA Corporation~Lumentum~Lam Research~Microchip Technology~Monolithic Power Systems~Marvell Technology~Microsoft~Motorola Solutions~Micron Technology~ServiceNow~NetApp~Nvidia~NXP Semiconductors~ON Semiconductor~Oracle Corporation~Everpure~Palo Alto Networks~Palantir Technologies~PTC Inc.~Qnity Electronics~Qualcomm~Roper Technologies~Supermicro~Sandisk~Synopsys~Seagate Technology~Skyworks Solutions~Teledyne Technologies~TE Connectivity~Teradyne~Trimble Inc.~Texas Instruments~Tyler Technologies~Verisign~Workday, Inc.~Western Digital~Zebra Technologies~Albemarle Corporation~Amcor~Avery Dennison~Ball Corporation~CF Industries~CRH plc~Corteva~Dow Inc.~Ecolab~Freeport-McMoRan~International Flavors & Fragrances~International Paper~Linde plc~LyondellBasell~Martin Marietta Materials~Mosaic Company (The)~Newmont~Nucor~Packaging Corporation of America~PPG Industries~Sherwin-Williams~Steel Dynamics~Smurfit Westrock~Vulcan Materials Company~American Tower~BXP, Inc.~CBRE Group~Crown Castle~Camden Property Trust~CoStar Group~Digital Realty~Healthpeak Properties~Equinix~Essex Property Trust~Extra Space Storage~Federal Realty Investment Trust~Host Hotels & Resorts~Invitation Homes~Iron Mountain~Kimco Realty~Mid-America Apartment Communities~Realty Income~Prologis~Public Storage~Regency Centers~SBA Communications~Simon Property Group~UDR, Inc.~Vici Properties~Vivmark Residential~Ventas~Welltower~Weyerhaeuser~Ameren~American Electric Power~Atmos Energy~American Water Works~Constellation Energy~CMS Energy~CenterPoint Energy~Dominion Energy~DTE Energy~Duke Energy~Consolidated Edison~Edison International~Eversource Energy~Entergy~Evergy~Exelon~FirstEnergy~Alliant Energy~NextEra Energy~NiSource~NRG Energy~PG&E Corporation~Public Service Enterprise Group~Pinnacle West Capital~PPL Corporation~Southern Company~Sempra~Vistra Corp.~WEC Energy Group~Xcel Energy","sep":"~"},{"d":"Industrials|Health Care|Information Technology|Utilities|Financials|Materials|Consumer Discretionary|Real Estate|Communication Services|Consumer Staples|Energy","r":"0*1,1*1,2*1,3*1,4*1,5*1,6*1,7*1,8*1,9*1,a*1,8*m,6*1a,9*w,a*k,4*23,1*1n,0*2a,2*21,5*o,7*t,3*u","sep":"|"}]}]);
const COLONY = [
{"id":"n-02b62b98","guard":[["hasAny",["amcor","ameren","archer","ares","belong","boeing","broadcom","camden","chubb","co","colgatepalmolive","communications","diagnostics","dominos","element","erie","gamble","garmin","hilton","invesco","item number","kimberlyclark","mastercard","moderna","motorola","netflix","newmont","norfolk","nth","position","resmed","separate by","sherwinwilliams","split","split by","teradyne","textron","tmobile","tower"]],["has","sector"],["not",["has","atmos"]],["not",["has","ball"]],["not",["has","centene"]],["not",["has","charter"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.lastWord"]]],"mem":null},
{"id":"n-3adb9d78","guard":[["hasAny",["amcor","ameren","archer","ares","belong","boeing","broadcom","camden","chubb","co","colgatepalmolive","communications","diagnostics","dominos","element","erie","gamble","garmin","hilton","invesco","item number","kimberlyclark","mastercard","moderna","motorola","netflix","newmont","norfolk","nth","position","resmed","separate by","sherwinwilliams","split","split by","teradyne","textron","tmobile","tower"]],["has","sector"],["not",["has","atmos"]],["not",["has","ball"]],["not",["has","centene"]],["not",["has","charter"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.lastWord"]]],"mem":null},
{"id":"n-c458a67f","guard":[["hasAny",["amcor","ameren","archer","ares","belong","boeing","broadcom","camden","chubb","co","colgatepalmolive","communications","delete","diagnostics","dominos","element","erie","gamble","garmin","hilton","invesco","item number","kimberlyclark","mastercard","moderna","motorola","netflix","newmont","norfolk","nth","position","remove","resmed","sherwinwilliams","strip out","teradyne","textron","tmobile","tower","without"]],["has","sector"],["not",["has","atmos"]],["not",["has","ball"]],["not",["has","centene"]],["not",["has","charter"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.lastWord"]]],"mem":null},
{"id":"n-ee8ad9a7","guard":[["hasAny",["amcor","ameren","archer","ares","belong","boeing","broadcom","camden","chubb","co","colgatepalmolive","communications","diagnostics","dominos","element","erie","gamble","garmin","hilton","invesco","item number","kimberlyclark","mastercard","moderna","motorola","netflix","newmont","norfolk","nth","position","resmed","separate by","sherwinwilliams","split","split by","teradyne","textron","tmobile","tower"]],["has","sector"],["not",["has","atmos"]],["not",["has","ball"]],["not",["has","centene"]],["not",["has","charter"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.lastWord"]]],"mem":null},
{"id":"n-fb25efe2","guard":[["hasAny",["aflac","amcor","ameren","america","applovin","archer","ares","arista","assurant","automotive","bancshares","boeing","broadcom","brokers","brown","chubb","church","cognizant","colgatepalmolive","copart","corpay","d","dominos","element","erie","express","financial","gamble","garmin","grainger","hilton","holdings","hunt","industries","invesco","item number","kimberlyclark","lyondellbasell","markets","mastercard","motorola","netflix","newmont","norfolk","normalise","normalize","nth","paccar","pge","position","ppl","resources","rtx","sherwinwilliams","simplify the text","snapon","sysco","teradyne","textron","tmobile","transdigm"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],{"lit":3}]],"mem":null},
{"id":"n-109be3db","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","camel case","camelcase","chubb","copart","corpay","element","erie","express","financial","grainger","honeywell","hunt","industries","international","invesco","item number","lower camel case","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pge","position","ppl","resources","rtx","sherwinwilliams","snapon","textron","transdigm","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]],"mem":null},
{"id":"n-41f6687d","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","chubb","copart","corpay","each word","element","erie","express","financial","grainger","honeywell","hunt","industries","international","invesco","item number","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pge","position","ppl","resources","rtx","sherwinwilliams","snapon","split into words","textron","transdigm","words","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]],"mem":null},
{"id":"n-660681df","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","chubb","copart","corpay","element","erie","express","financial","grainger","honeywell","hunt","industries","international","invesco","item number","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pge","position","ppl","resources","reverse the words","reverse word order","rtx","sherwinwilliams","snapon","textron","transdigm","words backwards","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]],"mem":null},
{"id":"n-afc8cf35","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","chubb","copart","corpay","dashes","element","erie","express","financial","grainger","honeywell","hunt","hyphens","industries","international","invesco","item number","kebab case","kebabcase","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pge","position","ppl","resources","rtx","sherwinwilliams","slug","snapon","textron","transdigm","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]],"mem":null},
{"id":"n-cccafc78","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","chubb","copart","corpay","element","erie","express","financial","grainger","honeywell","hunt","industries","international","invesco","item number","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pge","position","ppl","resources","rtx","sherwinwilliams","snake case","snakecase","snapon","textron","transdigm","underscores","variable name","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]],"mem":null},
{"id":"n-da173f99","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","chubb","copart","corpay","each word","element","erie","express","financial","grainger","honeywell","hunt","industries","international","invesco","item number","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pge","position","ppl","resources","rtx","sherwinwilliams","snapon","split into words","textron","transdigm","words","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]],"mem":null},
{"id":"n-db330297","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","chubb","class name","copart","corpay","element","erie","express","financial","grainger","honeywell","hunt","industries","international","invesco","item number","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pascal case","pascalcase","pge","position","ppl","resources","rtx","sherwinwilliams","snapon","textron","transdigm","upper camel case","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]],"mem":null},
{"id":"n-e7e9b71e","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","chubb","copart","corpay","each word","element","erie","express","financial","grainger","honeywell","hunt","industries","international","invesco","item number","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pge","position","ppl","resources","rtx","sherwinwilliams","snapon","split into words","textron","transdigm","words","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]],"mem":null},
{"id":"n-3a8ba77d","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","chubb","copart","corpay","each word","element","erie","express","financial","grainger","honeywell","hunt","industries","international","invesco","item number","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pge","position","ppl","resources","rtx","sherwinwilliams","shortest","shortest one","shortest word","snapon","split into words","textron","transdigm","words","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]]],"mem":null},
{"id":"n-42c981fc","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","camel case","camelcase","chubb","copart","corpay","element","erie","express","financial","grainger","honeywell","hunt","industries","international","invert case","invesco","item number","lower camel case","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pge","position","ppl","resources","rtx","sherwinwilliams","snapon","swap case","textron","toggle case","transdigm","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]]],"mem":null},
{"id":"n-555522eb","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","chubb","copart","corpay","dashes","element","erie","express","financial","grainger","honeywell","hunt","hyphens","industries","international","invesco","item number","kebab case","kebabcase","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pge","position","ppl","resources","reverse the words","reverse word order","rtx","sherwinwilliams","slug","snapon","textron","transdigm","words backwards","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]]],"mem":null},
{"id":"n-6138d396","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","camel case","camelcase","chubb","copart","corpay","element","erie","express","financial","grainger","honeywell","hunt","industries","international","invesco","item number","lower camel case","lower case","lowercase","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pge","position","ppl","resources","rtx","sherwinwilliams","small letters","snapon","textron","transdigm","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.str",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]]],"mem":null},
{"id":"n-6dd0dc09","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","chubb","copart","corpay","each word","element","erie","express","financial","grainger","honeywell","hunt","industries","international","invesco","item number","longest","longest one","longest word","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pge","position","ppl","resources","rtx","sherwinwilliams","snapon","split into words","textron","transdigm","words","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]]],"mem":null},
{"id":"n-71c52b0b","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","chubb","copart","corpay","element","erie","express","financial","grainger","honeywell","hunt","industries","international","invesco","item number","lower case","lowercase","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pge","position","ppl","resources","reverse the words","reverse word order","rtx","sherwinwilliams","small letters","snapon","textron","transdigm","words backwards","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]]],"mem":null},
{"id":"n-c574def4","guard":[["hasAny",["aflac","amcor","ameren","america","ares","assurant","bancshares","boeing","brokers","brown","camel case","camelcase","chubb","copart","corpay","element","erie","express","financial","grainger","honeywell","hunt","industries","international","invesco","item number","lower camel case","lyondellbasell","markets","mastercard","newmont","norfolk","nth","paccar","pge","position","ppl","resources","reverse the words","reverse word order","rtx","sherwinwilliams","snapon","textron","transdigm","words backwards","xylem"]],["has","sector"],["not",["has","atmos"]],["not",["has","broadridge"]],["not",["has","cf"]],["not",["has","edison"]]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]]]],"mem":null},
{"id":"n-02484592","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","tapestry","tmobile","tyler"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7bc962c6","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","tapestry","tmobile","tyler"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.and",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a013055c","guard":[["hasAny",["belong","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-0fd09ae6","guard":[["hasAny",["belong","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.and",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-240f90bf","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","invert case","item number","jabil","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","swap case","tapestry","tmobile","toggle case","tyler"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-24278377","guard":[["hasAny",["aflac","all caps","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","capital letters","capitals","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","tapestry","tmobile","tyler","upper case","uppercase"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-45891067","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","invert case","item number","jabil","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","swap case","tapestry","tmobile","toggle case","tyler"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-576fec98","guard":[["hasAny",["belong","class name","element","item number","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.pascal",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-5e340e42","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","tapestry","tmobile","tyler"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6ff0794d","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","tapestry","tmobile","tyler"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-7ccca228","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","lower case","lowercase","markets","newmont","nth","position","rtx","sherwinwilliams","small letters","tapestry","tmobile","tyler"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8f0fa90c","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","camel case","camelcase","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","lower camel case","markets","newmont","nth","position","rtx","sherwinwilliams","tapestry","tmobile","tyler"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.camel",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a16db7a8","guard":[["hasAny",["belong","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c52189b7","guard":[["hasAny",["belong","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-e5f21f99","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","class name","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","markets","newmont","nth","pascal case","pascalcase","position","rtx","sherwinwilliams","tapestry","tmobile","tyler","upper camel case"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.pascal",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-e8e9bfa2","guard":[["hasAny",["aflac","all caps","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","capital letters","capitals","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","tapestry","tmobile","tyler","upper case","uppercase"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.upper",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-182764eb","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","co","corpay","disney","dominos","each word","element","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","split into words","tapestry","tmobile","tyler","words"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-1a91a4df","guard":[["hasAny",["all caps","belong","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1bed3189","guard":[["hasAny",["belong","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2275ff1f","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","capitalise","capitalize","capitalize each word","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","tapestry","title case","tmobile","tyler"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-28bf2b4e","guard":[["hasAny",["aflac","all caps","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","capital letters","capitals","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","tapestry","tmobile","tyler","upper case","uppercase"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.upper",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2de05a10","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","invert case","item number","jabil","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","swap case","tapestry","tmobile","toggle case","tyler"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2e966017","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","co","corpay","disney","dominos","element","first n","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","take","tapestry","tmobile","tyler"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-2ffe60bb","guard":[["hasAny",["belong","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-574ac469","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","co","corpay","disney","dominos","element","first n","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","take","tapestry","tmobile","tyler"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-8f9de8cc","guard":[["hasAny",["belong","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-98489a05","guard":[["hasAny",["belong","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-9f3754fc","guard":[["hasAny",["belong","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-e0f56076","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","lower case","lowercase","markets","newmont","nth","position","rtx","sherwinwilliams","small letters","tapestry","tmobile","tyler"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-55270f93","guard":[["hasAny",["belong","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b5b6eea1","guard":[["hasAny",["all caps","belong","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.upper",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e1b92e17","guard":[["hasAny",["belong","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e6edac88","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","co","corpay","disney","dominos","element","fisher","flavors","gamble","health","honeywell","in","insulet","item number","jabil","leidos","markets","newmont","normalise","normalize","nth","position","rtx","sherwinwilliams","simplify the text","tapestry","tmobile","tyler"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f6de8e50","guard":[["hasAny",["belong","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9ae52ddc","guard":[["hasAny",["belong","element","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3d3bf438","guard":[["has","sector"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"in"}]]],"mem":{"table":{"which sector is Jabil":"Jabil is in the Information Technology sector.","which sector is Walt Disney Company (The)":"Walt Disney Company (The) is in the Communication Services sector.","which sector is Assurant":"Assurant is in the Financials sector.","which sector is RTX Corporation":"RTX Corporation is in the Industrials sector.","which sector is Newmont":"Newmont is in the Materials sector.","which sector is Huntington Bancshares":"Huntington Bancshares is in the Financials sector.","which sector is Merck & Co":"Merck & Co. is in the Health Care sector.","which sector is Interactive Brokers":"Interactive Brokers is in the Financials sector.","which sector is Leidos":"Leidos is in the Industrials sector.","which sector is Insulet Corporation":"Insulet Corporation is in the Health Care sector.","which sector is Sherwin-Williams":"Sherwin-Williams is in the Materials sector.","which sector is Thermo Fisher Scientific":"Thermo Fisher Scientific is in the Health Care sector.","which sector is Analog Devices":"Analog Devices is in the Information Technology sector.","which sector is Alliant Energy":"Alliant Energy is in the Utilities sector.","which sector is Tapestry, Inc":"Tapestry, Inc. is in the Consumer Discretionary sector.","which sector is American Express":"American Express is in the Financials sector.","which sector is Aflac":"Aflac is in the Financials sector.","which sector is Robinhood Markets":"Robinhood Markets is in the Financials sector.","which sector is Cardinal Health":"Cardinal Health is in the Health Care sector.","which sector is Corpay":"Corpay is in the Financials sector.","which sector is Amcor":"Amcor is in the Materials sector.","which sector is Domino's":"Domino's is in the Consumer Discretionary sector.","which sector is Monster Beverage":"Monster Beverage is in the Consumer Staples sector.","which sector is T-Mobile US":"T-Mobile US is in the Communication Services sector.","which sector is American Tower":"American Tower is in the Real Estate sector.","which sector is Universal Health Services":"Universal Health Services is in the Health Care sector.","which sector is Tyler Technologies":"Tyler Technologies is in the Information Technology sector.","which sector is International Flavors & Fragrances":"International Flavors & Fragrances is in the Materials sector.","which sector is Procter & Gamble":"Procter & Gamble is in the Consumer Staples sector.","which sector is Ameren":"Ameren is in the Utilities sector.","which sector is U.S. Bancorp":"U.S. Bancorp is in the Financials sector.","which sector is Boeing":"Boeing is in the Industrials sector.","which sector is Honeywell Technologies":"Honeywell Technologies is in the Industrials sector."}}},
{"id":"n-c45fa687","guard":[["has","sector"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"Jabil in":"Jabil is in the Information Technology sector.","Walt Disney Company (The) in":"Walt Disney Company (The) is in the Communication Services sector.","Assurant in":"Assurant is in the Financials sector.","RTX Corporation in":"RTX Corporation is in the Industrials sector.","Newmont in":"Newmont is in the Materials sector.","Huntington Bancshares in":"Huntington Bancshares is in the Financials sector.","Merck & Co. in":"Merck & Co. is in the Health Care sector.","Interactive Brokers in":"Interactive Brokers is in the Financials sector.","Leidos in":"Leidos is in the Industrials sector.","Insulet Corporation in":"Insulet Corporation is in the Health Care sector.","Sherwin-Williams in":"Sherwin-Williams is in the Materials sector.","Thermo Fisher Scientific in":"Thermo Fisher Scientific is in the Health Care sector.","Analog Devices in":"Analog Devices is in the Information Technology sector.","Alliant Energy in":"Alliant Energy is in the Utilities sector.","Tapestry, Inc. in":"Tapestry, Inc. is in the Consumer Discretionary sector.","American Express in":"American Express is in the Financials sector.","Aflac in":"Aflac is in the Financials sector.","Robinhood Markets in":"Robinhood Markets is in the Financials sector.","Cardinal Health in":"Cardinal Health is in the Health Care sector.","Corpay in":"Corpay is in the Financials sector.","Amcor in":"Amcor is in the Materials sector.","Domino's in":"Domino's is in the Consumer Discretionary sector.","Monster Beverage in":"Monster Beverage is in the Consumer Staples sector.","T-Mobile US in":"T-Mobile US is in the Communication Services sector.","American Tower in":"American Tower is in the Real Estate sector.","Universal Health Services in":"Universal Health Services is in the Health Care sector.","Tyler Technologies in":"Tyler Technologies is in the Information Technology sector.","International Flavors & Fragrances in":"International Flavors & Fragrances is in the Materials sector.","Procter & Gamble in":"Procter & Gamble is in the Consumer Staples sector.","Ameren in":"Ameren is in the Utilities sector.","U.S. Bancorp in":"U.S. Bancorp is in the Financials sector.","Boeing in":"Boeing is in the Industrials sector.","Honeywell Technologies in":"Honeywell Technologies is in the Industrials sector."}}},
{"id":"n-e339496f","guard":[["has","belong"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"to"}]]],"mem":{"table":{"what GICS sector does Hershey Company (The) belong":"Hershey Company (The) is in the Consumer Staples sector.","what GICS sector does TransDigm Group belong":"TransDigm Group is in the Industrials sector.","what GICS sector does TKO Group Holdings belong":"TKO Group Holdings is in the Communication Services sector.","what GICS sector does Brown & Brown belong":"Brown & Brown is in the Financials sector.","what GICS sector does Principal Financial Group belong":"Principal Financial Group is in the Financials sector.","what GICS sector does Targa Resources belong":"Targa Resources is in the Energy sector.","what GICS sector does International Paper belong":"International Paper is in the Materials sector.","what GICS sector does Fifth Third Bancorp belong":"Fifth Third Bancorp is in the Financials sector.","what GICS sector does State Street Corporation belong":"State Street Corporation is in the Financials sector.","what GICS sector does Paccar belong":"Paccar is in the Industrials sector.","what GICS sector does Cognizant belong":"Cognizant is in the Information Technology sector.","what GICS sector does AppLovin belong":"AppLovin is in the Communication Services sector.","what GICS sector does Arista Networks belong":"Arista Networks is in the Information Technology sector.","what GICS sector does J.B. Hunt belong":"J.B. Hunt is in the Industrials sector.","what GICS sector does Xylem Inc. belong":"Xylem Inc. is in the Industrials sector.","what GICS sector does PPG Industries belong":"PPG Industries is in the Materials sector.","what GICS sector does LyondellBasell belong":"LyondellBasell is in the Materials sector.","what GICS sector does Bank of America belong":"Bank of America is in the Financials sector.","what GICS sector does Advanced Micro Devices belong":"Advanced Micro Devices is in the Information Technology sector.","what GICS sector does Meta Platforms belong":"Meta Platforms is in the Communication Services sector.","what GICS sector does Church & Dwight belong":"Church & Dwight is in the Consumer Staples sector.","what GICS sector does Copart belong":"Copart is in the Industrials sector.","what GICS sector does Sysco belong":"Sysco is in the Consumer Staples sector.","what GICS sector does Snap-on belong":"Snap-on is in the Industrials sector.","what GICS sector does Akamai Technologies belong":"Akamai Technologies is in the Information Technology sector.","what GICS sector does ON Semiconductor belong":"ON Semiconductor is in the Information Technology sector.","what GICS sector does Cencora belong":"Cencora is in the Health Care sector.","what GICS sector does D. R. Horton belong":"D. R. Horton is in the Consumer Discretionary sector.","what GICS sector does O'Reilly Automotive belong":"O'Reilly Automotive is in the Consumer Discretionary sector.","what GICS sector does Kinder Morgan belong":"Kinder Morgan is in the Energy sector.","what GICS sector does CoStar Group belong":"CoStar Group is in the Real Estate sector.","what GICS sector does HCA Healthcare belong":"HCA Healthcare is in the Health Care sector.","what GICS sector does W. W. Grainger belong":"W. W. Grainger is in the Industrials sector."}}},
{"id":"n-a259dc3d","guard":[["hasAny",["element","industry","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cdbdd7f2","guard":[["hasAny",["element","industry","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.lower",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-03587563","guard":[["hasAny",["element","industry","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-3504b6bc","guard":[["hasAny",["element","industry","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.and",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-53c36848","guard":[["hasAny",["element","industry","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0b59c29b","guard":[["hasAny",["all caps","capital letters","capitals","element","industry","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-264ed8ed","guard":[["hasAny",["element","industry","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9f504620","guard":[["hasAny",["element","industry","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f4d4b36e","guard":[["hasAny",["element","industry","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-077a03ec","guard":[["hasAny",["all caps","capital letters","capitals","element","industry","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.upper",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-594e5050","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","industry","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-848f791a","guard":[["hasAny",["element","industry","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e92f250a","guard":[["hasAny",["element","industry","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-07e2be68","guard":[["hasAny",["element","industry","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9fd277e2","guard":[["hasAny",["element","industry","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6bc4c249","guard":[["hasAny",["advanced","akamai","applovin","arista","automotive","brown","cencora","church","cognizant","copart","d","element","fifth","grainger","group","hca","hunt","industries","item number","kinder","lyondellbasell","meta","normalise","normalize","nth","paccar","paper","position","resources","semiconductor","simplify the text","snapon","state","sysco","xylem"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8320b043","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","bancshares","beverage","boeing","brokers","co","corpay","dominos","element","fisher","flavors","gamble","health","honeywell","insulet","item number","jabil","leidos","markets","newmont","normalise","normalize","nth","position","rtx","sherwinwilliams","simplify the text","tapestry","tyler"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b218c03f","guard":[["hasAny",["advanced","akamai","america","applovin","arista","brown","cencora","church","cognizant","copart","element","fifth","grainger","group","hca","hershey","hunt","industries","item number","kinder","lyondellbasell","meta","nth","paccar","paper","position","resources","separate by","snapon","split","split by","state","sysco","xylem"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e1bc5626","guard":[["hasAny",["advanced","akamai","america","applovin","arista","brown","cencora","church","cognizant","copart","element","fifth","grainger","group","hca","hershey","hunt","industries","item number","kinder","lyondellbasell","meta","nth","paccar","paper","position","resources","separate by","snapon","split","split by","state","sysco","xylem"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1dbddc11","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","beverage","brokers","co","corpay","disney","element","fisher","flavors","gamble","honeywell","insulet","item number","jabil","leidos","newmont","nth","position","rtx","separate by","services","split","split by","tapestry","tmobile","tyler","us"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2f6472a6","guard":[["hasAny",["aflac","alliant","amcor","ameren","american","analog","assurant","beverage","brokers","co","corpay","disney","element","fisher","flavors","gamble","honeywell","insulet","item number","jabil","leidos","newmont","nth","position","rtx","separate by","services","split","split by","tapestry","tmobile","tyler","us"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-34c48f82","guard":[["hasAny",["alliant","ameren","analog","assurant","bancshares","beverage","boeing","brokers","corpay","dominos","element","express","fisher","flavors","gamble","health","honeywell","insulet","item number","leidos","markets","newmont","nth","position","sherwinwilliams","shortest","shortest one","shortest word","tmobile","us"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a23b5635","guard":[["hasAny",["alliant","ameren","analog","assurant","bancshares","beverage","boeing","brokers","corpay","dominos","element","express","fisher","flavors","gamble","health","honeywell","insulet","item number","leidos","markets","newmont","nth","position","sherwinwilliams","shortest","shortest one","shortest word","tmobile","us"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.and",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-524926b2","guard":[["hasAny",["alliant","ameren","analog","assurant","bancshares","beverage","boeing","brokers","corpay","dominos","element","express","fisher","flavors","gamble","health","honeywell","insulet","item number","leidos","lower case","lowercase","markets","newmont","nth","position","sherwinwilliams","shortest","shortest one","shortest word","small letters","tmobile","us"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c1831f4b","guard":[["hasAny",["all caps","alliant","ameren","analog","assurant","bancshares","beverage","boeing","brokers","capital letters","capitals","corpay","dominos","element","express","fisher","flavors","gamble","health","honeywell","insulet","item number","leidos","markets","newmont","nth","position","sherwinwilliams","shortest","shortest one","shortest word","tmobile","upper case","uppercase","us"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c83658f8","guard":[["hasAny",["alliant","ameren","analog","assurant","bancshares","beverage","boeing","brokers","corpay","dominos","element","express","fisher","flavors","gamble","health","honeywell","insulet","item number","leidos","markets","newmont","nth","position","sherwinwilliams","shortest","shortest one","shortest word","tmobile","us"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e2dcb882","guard":[["hasAny",["alliant","ameren","analog","assurant","bancshares","beverage","boeing","brokers","corpay","dominos","element","express","fisher","flavors","gamble","health","honeywell","insulet","invert case","item number","leidos","markets","newmont","nth","position","sherwinwilliams","shortest","shortest one","shortest word","swap case","tmobile","toggle case","us"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8c4d32d3","guard":[["hasAny",["all caps","alliant","ameren","analog","assurant","bancshares","beverage","boeing","brokers","capital letters","capitals","corpay","dominos","element","express","fisher","flavors","gamble","health","honeywell","insulet","item number","leidos","markets","newmont","nth","position","sherwinwilliams","shortest","shortest one","shortest word","tmobile","upper case","uppercase","us"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.upper",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a2915de7","guard":[["hasAny",["alliant","ameren","analog","assurant","bancshares","beverage","boeing","brokers","corpay","dominos","element","express","fisher","flavors","gamble","health","honeywell","insulet","invert case","item number","leidos","markets","newmont","nth","position","sherwinwilliams","shortest","shortest one","shortest word","swap case","tmobile","toggle case","us"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b134a491","guard":[["hasAny",["alliant","ameren","analog","assurant","bancshares","beverage","boeing","brokers","corpay","dominos","element","express","fisher","flavors","gamble","health","honeywell","insulet","item number","leidos","lower case","lowercase","markets","newmont","nth","position","sherwinwilliams","shortest","shortest one","shortest word","small letters","tmobile","us"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f9c7c8f9","guard":[["hasAny",["alliant","ameren","analog","assurant","bancshares","beverage","boeing","brokers","capitalise","capitalize","capitalize each word","corpay","dominos","element","express","fisher","flavors","gamble","health","honeywell","insulet","item number","leidos","markets","newmont","nth","position","sherwinwilliams","shortest","shortest one","shortest word","title case","tmobile","us"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9c95286a","guard":[["hasAny",["alliant","ameren","analog","assurant","bancshares","beverage","boeing","brokers","corpay","dominos","element","express","fisher","flavors","gamble","health","honeywell","insulet","item number","leidos","markets","newmont","normalise","normalize","nth","position","sherwinwilliams","shortest","shortest one","shortest word","simplify the text","tmobile","us"]],["has","in"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f626adfa","guard":[["hasAny",["alliant","ameren","analog","assurant","bancshares","beverage","boeing","brokers","corpay","dominos","element","express","fisher","flavors","gamble","health","honeywell","insulet","item number","leidos","markets","newmont","normalise","normalize","nth","position","sherwinwilliams","shortest","shortest one","shortest word","simplify the text"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4e541961","guard":[["hasAny",["alliant","ameren","analog","assurant","bancshares","beverage","boeing","brokers","corpay","dominos","each word","element","express","fisher","flavors","gamble","health","honeywell","insulet","item number","leidos","markets","newmont","nth","position","shortest","shortest one","shortest word","split into words","words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.words",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-087a18d6","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","church","co","copart","corpay","costar","d","element","hunt","item number","jabil","kinder","leidos","longest","longest one","longest word","nth","paccar","position","snapon","sysco","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.and",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ca3def82","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","church","co","copart","corpay","costar","d","element","hunt","item number","jabil","kinder","leidos","longest","longest one","longest word","nth","paccar","position","snapon","sysco","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3e2e0e0a","guard":[["hasAny",["aflac","all caps","amcor","ameren","boeing","brown","capital letters","capitals","church","co","copart","corpay","costar","d","element","hunt","item number","jabil","kinder","leidos","longest","longest one","longest word","nth","paccar","position","snapon","sysco","upper case","uppercase","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6b030797","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","church","co","copart","corpay","costar","d","element","hunt","item number","jabil","kinder","leidos","longest","longest one","longest word","lower case","lowercase","nth","paccar","position","small letters","snapon","sysco","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8c85c7bc","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","church","co","copart","corpay","costar","d","element","hunt","invert case","item number","jabil","kinder","leidos","longest","longest one","longest word","nth","paccar","position","snapon","swap case","sysco","toggle case","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f4ef45af","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","church","co","copart","corpay","costar","d","element","hunt","item number","jabil","kinder","leidos","longest","longest one","longest word","nth","paccar","position","snapon","sysco","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7fbaf609","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","church","co","copart","corpay","costar","d","element","hunt","item number","jabil","kinder","leidos","longest","longest one","longest word","lower case","lowercase","nth","paccar","position","small letters","snapon","sysco","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-97755225","guard":[["hasAny",["aflac","all caps","amcor","ameren","boeing","brown","capital letters","capitals","church","co","copart","corpay","costar","d","element","hunt","item number","jabil","kinder","leidos","longest","longest one","longest word","nth","paccar","position","snapon","sysco","upper case","uppercase","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.upper",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a51adc8b","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","capitalise","capitalize","capitalize each word","church","co","copart","corpay","costar","d","element","hunt","item number","jabil","kinder","leidos","longest","longest one","longest word","nth","paccar","position","snapon","sysco","title case","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f3c5eb72","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","church","co","copart","corpay","costar","d","element","hunt","invert case","item number","jabil","kinder","leidos","longest","longest one","longest word","nth","paccar","position","snapon","swap case","sysco","toggle case","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0da769b4","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","church","co","copart","corpay","costar","d","element","hunt","item number","jabil","kinder","leidos","longest","longest one","longest word","normalise","normalize","nth","paccar","position","simplify the text","snapon","sysco","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5a39590f","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","church","co","copart","corpay","costar","d","element","hunt","item number","jabil","kinder","leidos","longest","longest one","longest word","normalise","normalize","nth","paccar","position","simplify the text","snapon","sysco","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b5b069a8","guard":[["hasAny",["alliant","ameren","analog","assurant","beverage","brokers","corpay","element","express","fisher","flavors","gamble","honeywell","insulet","item number","leidos","newmont","nth","position","separate by","services","shortest","shortest one","shortest word","split","split by","tmobile","us"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f709f3ef","guard":[["hasAny",["alliant","ameren","analog","assurant","beverage","brokers","corpay","element","express","fisher","flavors","gamble","honeywell","insulet","item number","leidos","newmont","nth","position","separate by","services","shortest","shortest one","shortest word","split","split by","tmobile","us"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-32e88f90","guard":[["hasAny",["aflac","alliant","amcor","ameren","assurant","bancshares","boeing","brokers","camel case","camelcase","corpay","element","express","flavors","honeywell","item number","leidos","lower camel case","markets","newmont","nth","position","rtx","sherwinwilliams"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-80163ab0","guard":[["hasAny",["aflac","alliant","amcor","ameren","assurant","bancshares","boeing","brokers","corpay","dashes","element","express","flavors","honeywell","hyphens","item number","kebab case","kebabcase","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","slug"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-88c2f28e","guard":[["hasAny",["aflac","alliant","amcor","ameren","assurant","bancshares","boeing","brokers","corpay","element","express","flavors","honeywell","item number","leidos","markets","newmont","nth","position","reverse the words","reverse word order","rtx","sherwinwilliams","words backwards"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-aba6d016","guard":[["hasAny",["aflac","alliant","amcor","ameren","assurant","bancshares","boeing","brokers","class name","corpay","element","express","flavors","honeywell","item number","leidos","markets","newmont","nth","pascal case","pascalcase","position","rtx","sherwinwilliams","upper camel case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ac589c7d","guard":[["hasAny",["aflac","alliant","amcor","ameren","assurant","bancshares","boeing","brokers","corpay","element","express","flavors","honeywell","item number","leidos","markets","newmont","nth","position","rtx","sherwinwilliams","snake case","snakecase","underscores","variable name"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-56e1ad3c","guard":[["hasAny",["america","brown","camel case","camelcase","copart","element","fifth","financial","grainger","hunt","industries","item number","kinder","lower camel case","lyondellbasell","nth","paccar","paper","position","resources","snapon","state","transdigm","xylem"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7f622d10","guard":[["hasAny",["america","brown","copart","dashes","element","fifth","financial","grainger","hunt","hyphens","industries","item number","kebab case","kebabcase","kinder","lyondellbasell","nth","paccar","paper","position","resources","slug","snapon","state","transdigm","xylem"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8bd63766","guard":[["hasAny",["america","brown","copart","element","fifth","financial","grainger","hunt","industries","item number","kinder","lyondellbasell","nth","paccar","paper","position","resources","reverse the words","reverse word order","snapon","state","transdigm","words backwards","xylem"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ab476425","guard":[["hasAny",["america","brown","copart","element","fifth","financial","grainger","hunt","industries","item number","kinder","lyondellbasell","nth","paccar","paper","position","resources","snake case","snakecase","snapon","state","transdigm","underscores","variable name","xylem"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e35f74c4","guard":[["hasAny",["america","brown","class name","copart","element","fifth","financial","grainger","hunt","industries","item number","kinder","lyondellbasell","nth","paccar","paper","pascal case","pascalcase","position","resources","snapon","state","transdigm","upper camel case","xylem"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-22608b19","guard":[["hasAny",["aflac","amcor","ameren","brown","church","co","copart","corpay","costar","element","hunt","item number","jabil","kinder","leidos","longest","longest one","longest word","nth","paccar","position","separate by","snapon","split","split by","sysco","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cb86f049","guard":[["hasAny",["aflac","amcor","ameren","brown","church","co","copart","corpay","costar","element","hunt","item number","jabil","kinder","leidos","longest","longest one","longest word","nth","paccar","position","separate by","snapon","split","split by","sysco","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-229d07e6","guard":[["hasAny",["automotive","corporation","element","group","hca","hunt","industries","industry","item number","meta","nth","position","semiconductor","separate by","snapon","split","split by","tmobile"]],["has","sector"],["not",["has","me"]],["not",["has","ball"]],["not",["has","wec"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-38e833c3","guard":[["hasAny",["automotive","corporation","element","group","hca","hunt","industries","industry","item number","meta","nth","position","semiconductor","separate by","snapon","split","split by","tmobile"]],["has","sector"],["not",["has","me"]],["not",["has","ball"]],["not",["has","wec"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-80bc4607","guard":[["hasAny",["automotive","corporation","element","group","hca","hunt","industries","industry","item number","meta","nth","position","semiconductor","separate by","snapon","split","split by","tmobile"]],["has","sector"],["not",["has","me"]],["not",["has","ball"]],["not",["has","wec"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-8b1d7454","guard":[["hasAny",["automotive","corporation","delete","element","group","hca","hunt","industries","industry","item number","meta","nth","position","remove","semiconductor","snapon","strip out","tmobile","without"]],["has","sector"],["not",["has","me"]],["not",["has","ball"]],["not",["has","wec"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-1ef4cf78","guard":[["hasAny",["alliant","ameren","assurant","bancshares","boeing","brokers","corpay","element","express","flavors","honeywell","item number","leidos","markets","newmont","nth","position","sherwinwilliams","shortest","shortest one","shortest word","snake case","snakecase","underscores","variable name"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-38fb4b46","guard":[["hasAny",["alliant","ameren","assurant","bancshares","boeing","brokers","corpay","element","express","flavors","honeywell","item number","leidos","markets","newmont","nth","position","reverse the words","reverse word order","sherwinwilliams","shortest","shortest one","shortest word","words backwards"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5223bcbe","guard":[["hasAny",["alliant","ameren","assurant","bancshares","boeing","brokers","camel case","camelcase","corpay","element","express","flavors","honeywell","item number","leidos","lower camel case","markets","newmont","nth","position","sherwinwilliams","shortest","shortest one","shortest word"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8239429b","guard":[["hasAny",["alliant","ameren","assurant","bancshares","boeing","brokers","corpay","dashes","element","express","flavors","honeywell","hyphens","item number","kebab case","kebabcase","leidos","markets","newmont","nth","position","sherwinwilliams","shortest","shortest one","shortest word","slug"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c8b974f1","guard":[["hasAny",["alliant","ameren","assurant","bancshares","boeing","brokers","class name","corpay","element","express","flavors","honeywell","item number","leidos","markets","newmont","nth","pascal case","pascalcase","position","sherwinwilliams","shortest","shortest one","shortest word","upper camel case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6fa23a6d","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","class name","copart","corpay","element","hunt","item number","kinder","leidos","longest","longest one","longest word","nth","paccar","pascal case","pascalcase","position","snapon","upper camel case","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-727090c6","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","copart","corpay","element","hunt","item number","kinder","leidos","longest","longest one","longest word","nth","paccar","position","reverse the words","reverse word order","snapon","words backwards","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-adefaaf1","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","copart","corpay","element","hunt","item number","kinder","leidos","longest","longest one","longest word","nth","paccar","position","snake case","snakecase","snapon","underscores","variable name","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e9126c0b","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","copart","corpay","dashes","element","hunt","hyphens","item number","kebab case","kebabcase","kinder","leidos","longest","longest one","longest word","nth","paccar","position","slug","snapon","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fc23304c","guard":[["hasAny",["aflac","amcor","ameren","boeing","brown","camel case","camelcase","copart","corpay","element","hunt","item number","kinder","leidos","longest","longest one","longest word","lower camel case","nth","paccar","position","snapon","xylem"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ff66af06","guard":[["hasAny",["broadcom","colgatepalmolive","element","factset","garmin","invesco","iqvia","item number","kimberlyclark","mastercard","moderna","netflix","nth","position","resmed","reverse the words","reverse word order","teradyne","textron","words backwards"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2c831e66","guard":[["hasAny",["ares","camel case","camelcase","chubb","dominion","dte","element","erie","factset","invesco","item number","lower camel case","mastercard","norfolk","nth","pge","position","ppl","textron"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-60a1d24a","guard":[["hasAny",["ares","chubb","dashes","dominion","dte","element","erie","factset","hyphens","invesco","item number","kebab case","kebabcase","mastercard","norfolk","nth","pge","position","ppl","slug","textron"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7b88a3c6","guard":[["hasAny",["ares","chubb","dominion","dte","element","erie","factset","invesco","item number","mastercard","norfolk","nth","pge","position","ppl","snake case","snakecase","textron","underscores","variable name"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-849890a2","guard":[["hasAny",["ares","chubb","dominion","dte","element","erie","factset","invesco","item number","mastercard","norfolk","nth","pge","position","ppl","reverse the words","reverse word order","textron","words backwards"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8942d37a","guard":[["hasAny",["ares","chubb","class name","dominion","dte","element","erie","factset","invesco","item number","mastercard","norfolk","nth","pascal case","pascalcase","pge","position","ppl","textron","upper camel case"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4c34c19d","guard":[["hasAny",["applovin","brown","cencora","cognizant","copart","element","item number","lyondellbasell","nth","paccar","position","semiconductor","snapon","sysco"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-85eb184a","guard":[["hasAny",["ares","ebay","erie","hca","hunt","industries","item number","nth","ppl","rtx","tmobile"]],["has","sector"],["words>=",6],["not",["has","cf"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]],"mem":null},
{"id":"n-504aa87d","guard":[["hasAny",["ares","ebay","erie","hca","hunt","industries","invert case","item number","nth","ppl","rtx","swap case","tmobile","toggle case"]],["has","sector"],["words>=",6],["not",["has","cf"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]],"mem":null},
{"id":"n-5d48f04d","guard":[["hasAny",["ares","capital letters","capitals","ebay","erie","hca","hunt","industries","item number","nth","ppl","rtx","tmobile","upper case","uppercase"]],["has","sector"],["words>=",6],["not",["has","cf"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]],"mem":null},
{"id":"n-d1e80fc0","guard":[["hasAny",["ares","ebay","erie","hca","hunt","industries","item number","lower case","lowercase","nth","ppl","rtx","small letters","tmobile"]],["has","sector"],["words>=",6],["not",["has","cf"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]],"mem":null},
{"id":"n-e909e861","guard":[["hasAny",["belong","element","item number","join","joined with","nth","position","separated by"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.join",["know.find",{"lit":"sp500"},{"lit":"company"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-285e8e88","guard":[["hasAny",["copart","delete","grainger","hunt","norfolk","paccar","snapon","strip out","textron","transdigm","xylem"]],["has","sector"]],"pyramid":["render.str",["transform.remove",{"lit":"industrials"},["sense.lastWord"]]],"mem":null},
{"id":"n-59a9719e","guard":[["hasAny",["ares","ebay","erie","hunt","industries","item number","normalise","normalize","nth","ppl","rtx","simplify the text","tmobile"]],["has","sector"],["words>=",6],["not",["has","cf"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}],{"lit":3}]],"mem":null},
{"id":"n-29521f6f","guard":[["hasAny",["ameren","assurant","boeing","corpay","dashes","dominos","element","hyphens","item number","kebab case","kebabcase","leidos","newmont","nth","position","sherwinwilliams","shortest","shortest one","shortest word","slug"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.kebab",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f97c0413","guard":[["hasAny",["ameren","assurant","boeing","corpay","dominos","element","item number","leidos","newmont","nth","position","reverse the words","reverse word order","sherwinwilliams","shortest","shortest one","shortest word","words backwards"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-70ea34d2","guard":[["hasAny",["boeing","copart","hunt","leidos","longest","longest one","longest word","paccar","snapon","xylem"]],["not",["has","name"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Industrials ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-edb48f34","guard":[["hasAny",["copart","element","grainger","hunt","item number","nth","paccar","position","snapon","transdigm","xylem"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Industrials ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-16873434","guard":[["hasAny",["america","ares","brown","chubb","delete","erie","invesco","mastercard","strip out"]],["has","sector"],["not",["has","act"]]],"pyramid":["render.str",["transform.remove",{"lit":"Financials"},["sense.lastWord"]]],"mem":null},
{"id":"n-1c58ea1b","guard":[["hasAny",["america","ares","brown","chubb","erie","invesco","mastercard","separate by","split by"]],["has","sector"],["not",["has","act"]]],"pyramid":["render.list",["transform.split",{"lit":"financials"},["sense.lastWord"]]],"mem":null},
{"id":"n-21ab1337","guard":[["hasAny",["america","ares","brown","chubb","erie","invesco","mastercard","separate by","split by"]],["has","sector"],["not",["has","act"]]],"pyramid":["render.and",["transform.split",{"lit":"Financials"},["sense.lastWord"]]],"mem":null},
{"id":"n-69bca675","guard":[["hasAny",["america","ares","brown","chubb","erie","invesco","mastercard","separate by","split by"]],["has","sector"],["not",["has","act"]]],"pyramid":["render.lines",["transform.split",{"lit":"Financials"},["sense.lastWord"]]],"mem":null},
{"id":"n-a6c0b305","guard":[["hasAny",["america","ares","brown","chubb","erie","invesco","mastercard","separate by","split by"]],["has","sector"],["not",["has","act"]]],"pyramid":["render.list",["transform.split",{"lit":"Financials"},["sense.lastWord"]]],"mem":null},
{"id":"n-bf39696d","guard":[["hasAny",["america","ares","brown","chubb","erie","invesco","mastercard","separate by","split by"]],["has","sector"],["not",["has","act"]]],"pyramid":["render.lines",["transform.split",{"lit":"financials"},["sense.lastWord"]]],"mem":null},
{"id":"n-c64fc3ef","guard":[["hasAny",["america","ares","brown","chubb","delete","erie","invesco","mastercard","strip out"]],["has","sector"],["not",["has","act"]]],"pyramid":["render.str",["transform.remove",{"lit":"financials"},["sense.lastWord"]]],"mem":null},
{"id":"n-cfa05e32","guard":[["hasAny",["america","ares","brown","chubb","erie","invesco","mastercard","separate by","split by"]],["has","sector"],["not",["has","act"]]],"pyramid":["render.and",["transform.split",{"lit":"financials"},["sense.lastWord"]]],"mem":null},
{"id":"n-bb6b26a0","guard":[["hasAny",["assurant","bancshares","brokers","corpay","express","markets","shortest","shortest one","shortest word"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Financials ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9146d15a","guard":[["hasAny",["ares","chubb","element","erie","factset","invesco","item number","mastercard","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Financials ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ab78a8fe","guard":[["hasAny",["broadcom","corning","element","item number","microchip","motorola","nth","palantir","position","teradyne"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Information Technology ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1f6ac896","guard":[["hasAny",["ares","each word","erie","hunt","industries","item number","nth","ppl","rtx","split into words"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]],"mem":null},
{"id":"n-3b81c70c","guard":[["hasAny",["ares","camel case","camelcase","erie","hunt","industries","item number","lower camel case","nth","ppl","rtx"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]],"mem":null},
{"id":"n-5813185f","guard":[["hasAny",["ares","class name","erie","hunt","industries","item number","nth","pascal case","pascalcase","ppl","rtx","upper camel case"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]],"mem":null},
{"id":"n-8697d304","guard":[["hasAny",["ares","erie","hunt","industries","item number","nth","ppl","rtx","snake case","snakecase","underscores","variable name"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]],"mem":null},
{"id":"n-9a4858d1","guard":[["hasAny",["ares","erie","hunt","industries","item number","nth","ppl","reverse the words","reverse word order","rtx","words backwards"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]],"mem":null},
{"id":"n-d718ff51","guard":[["hasAny",["ares","each word","erie","hunt","industries","item number","nth","ppl","rtx","split into words"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]],"mem":null},
{"id":"n-d889bdd8","guard":[["hasAny",["ares","each word","erie","hunt","industries","item number","nth","ppl","rtx","split into words"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]],"mem":null},
{"id":"n-ecc5ea8e","guard":[["hasAny",["ares","dashes","erie","hunt","hyphens","industries","item number","kebab case","kebabcase","nth","ppl","rtx"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]],"mem":null},
{"id":"n-0a0610c5","guard":[["hasAny",["ares","camel case","camelcase","erie","hunt","industries","item number","lower camel case","nth","ppl","reverse the words","reverse word order","rtx","words backwards"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]]],"mem":null},
{"id":"n-169509cb","guard":[["hasAny",["ares","dashes","erie","hunt","hyphens","industries","item number","kebab case","kebabcase","nth","ppl","reverse the words","reverse word order","rtx","words backwards"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]]],"mem":null},
{"id":"n-3b29f6bc","guard":[["hasAny",["ares","each word","erie","hunt","industries","item number","longest","longest one","longest word","nth","ppl","rtx","split into words"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]]],"mem":null},
{"id":"n-7028bb18","guard":[["hasAny",["ares","camel case","camelcase","erie","hunt","industries","invert case","item number","lower camel case","nth","ppl","rtx","swap case","toggle case"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]]],"mem":null},
{"id":"n-7f49ae17","guard":[["hasAny",["ares","erie","hunt","industries","item number","lower case","lowercase","nth","ppl","reverse the words","reverse word order","rtx","small letters","words backwards"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]]],"mem":null},
{"id":"n-99c89b1f","guard":[["hasAny",["ares","each word","erie","hunt","industries","item number","nth","ppl","rtx","shortest","shortest one","shortest word","split into words"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]]],"mem":null},
{"id":"n-b29bdaa2","guard":[["hasAny",["ares","camel case","camelcase","erie","hunt","industries","item number","lower camel case","lower case","lowercase","nth","ppl","rtx","small letters"]],["has","sector"],["not",["has","cf"]],["words>=",6]],"pyramid":["render.str",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]]]],"mem":null},
{"id":"n-e8a750bb","guard":[["hasAny",["brown","co","copart","element","item number","longest","longest one","longest word","nth","paccar","position","snapon","sysco"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e35ad583","guard":[["hasAny",["element","group","hca","hunt","industries","item number","meta","nth","position","semiconductor"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2bc53fae","guard":[["hasAny",["element","group","hca","hunt","industries","item number","lower case","lowercase","meta","nth","position","semiconductor","small letters"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2c55965e","guard":[["hasAny",["all caps","capital letters","capitals","element","group","hca","hunt","industries","item number","meta","nth","position","semiconductor","upper case","uppercase"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-932bedb1","guard":[["hasAny",["element","group","hca","hunt","industries","invert case","item number","meta","nth","position","semiconductor","swap case","toggle case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-898f4e16","guard":[["hasAny",["element","industry","item number","join","joined with","nth","position","separated by"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.join",["know.find",{"lit":"sp500"},{"lit":"company"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-41c25da8","guard":[["hasAny",["arista","broadcom","cognizant","motorola","palantir","separate by","split by","teradyne"]],["has","sector"]],"pyramid":["render.list",["transform.split",{"lit":"Information Technology"},["sense.lastWord"]]],"mem":null},
{"id":"n-d2f90109","guard":[["hasAny",["arista","broadcom","cognizant","delete","motorola","palantir","strip out","teradyne"]],["has","sector"]],"pyramid":["render.str",["transform.remove",{"lit":"Information Technology"},["sense.lastWord"]]],"mem":null},
{"id":"n-d3a93ab9","guard":[["hasAny",["america","brown","element","fifth","financial","item number","nth","position","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Financials ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f0c3f854","guard":[["hasAny",["advanced","akamai","arista","cognizant","element","item number","nth","position","semiconductor"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Information Technology ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-466dac96","guard":[["hasAny",["ares","dte","ebay","element","erie","item number","nth","position","ppl"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-24ce1de2","guard":[["hasAny",["ares","dte","ebay","element","erie","item number","lower case","lowercase","nth","position","ppl","small letters"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6184b417","guard":[["hasAny",["ares","dte","ebay","element","erie","invert case","item number","nth","position","ppl","swap case","toggle case"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f98658a2","guard":[["hasAny",["all caps","ares","capital letters","capitals","dte","ebay","element","erie","item number","nth","position","ppl","upper case","uppercase"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8bbef8e3","guard":[["hasAny",["ares","dte","ebay","element","erie","item number","nth","position","ppl","separate by","split","split by"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8f89a2ac","guard":[["hasAny",["america","brown","factset","invesco","item number","mastercard","nth","position"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Financials sector."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5f8b7b77","guard":[["hasAny",["boeing","honeywell","leidos","rtx"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Industrials ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a0d6801c","guard":[["hasAny",["fisher","health","insulet","shortest","shortest one","shortest word"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Health Care ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4a99d159","guard":[["hasAny",["diagnostics","element","iqvia","item number","moderna","nth","position","resmed"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Health Care ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-16995420","guard":[["hasAny",["akamai","arista","broadcom","item number","nth","position","teradyne"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Information Technology sector."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e9e82f4a","guard":[["hasAny",["amcor","delete","flavors","newmont","remove","sherwinwilliams","strip out","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",{"lit":"Materials"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-37b336f3","guard":[["hasAny",["akamai","arista","cognizant","item number","longest","longest one","longest word","nth","position","semiconductor"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Information Technology ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-59a43243","guard":[["hasAny",["bancshares","brokers","express","item number","longest","longest one","longest word","markets","nth","position"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Financials sector."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-002d6bb1","guard":[["hasAny",["bancshares","brokers","express","item number","longest","longest one","longest word","markets","nth","position","shortest","shortest one","shortest word"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8d70bfe9","guard":[["hasAny",["bancshares","brokers","express","item number","longest","longest one","longest word","markets","nth","position"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-eb5eef1a","guard":[["hasAny",["bancshares","brokers","express","item number","longest","longest one","longest word","markets","nth","position","shortest","shortest one","shortest word"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0095708c","guard":[["hasAny",["bancshares","brokers","express","item number","longest","longest one","longest word","markets","nth","position"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-1c3e2cc0","guard":[["hasAny",["bancshares","brokers","capitalise","capitalize","capitalize each word","express","item number","longest","longest one","longest word","markets","nth","position","title case"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-1da48543","guard":[["hasAny",["bancshares","brokers","express","item number","markets","nth","position","shortest","shortest one","shortest word"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-71cd0262","guard":[["hasAny",["bancshares","brokers","express","invert case","item number","longest","longest one","longest word","markets","nth","position","swap case","toggle case"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-764de531","guard":[["hasAny",["bancshares","brokers","express","item number","longest","longest one","longest word","lower case","lowercase","markets","nth","position","small letters"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-aaff6956","guard":[["hasAny",["bancshares","brokers","express","item number","markets","nth","position","shortest","shortest one","shortest word"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b9688f3b","guard":[["hasAny",["all caps","bancshares","brokers","capital letters","capitals","express","item number","longest","longest one","longest word","markets","nth","position","upper case","uppercase"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-1ee4fb44","guard":[["hasAny",["bancshares","brokers","express","first n","item number","longest","longest one","longest word","markets","nth","position","take"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-93c070ac","guard":[["hasAny",["bancshares","brokers","express","first n","item number","longest","longest one","longest word","markets","nth","position","take"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-7863d515","guard":[["hasAny",["flavors","newmont","sherwinwilliams","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Materials ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8c5ef859","guard":[["hasAny",["delete","hunt","item number","nth","rtx","snapon","strip out"]],["not",["has","the"]]],"pyramid":["render.str",["transform.remove",{"lit":"industrials"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-af2dfcb4","guard":[["hasAny",["analog","jabil","tyler"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Information Technology ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c98a8365","guard":[["hasAny",["aflac","brown","corpay","longest","longest one","longest word"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Financials ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cfec0fda","guard":[["hasAny",["boeing","honeywell","leidos","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Industrials ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dabe35a0","guard":[["hasAny",["delete","hunt","item number","nth","rtx","snapon","strip out"]],["not",["has","the"]]],"pyramid":["render.str",["transform.remove",{"lit":"Industrials"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-fcabff6f","guard":[["hasAny",["delete","dte","item number","nth","pge","ppl","strip out"]],["has","industry"]],"pyramid":["render.str",["transform.remove",{"lit":"Utilities"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-026db8fa","guard":[["hasAny",["church","element","hershey","item number","nth","position","sysco"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Consumer Staples ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-03d9c7df","guard":[["hasAny",["dominion","element","item number","norfolk","nth","position","textron"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Industrials ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-18354395","guard":[["hasAny",["applovin","element","holdings","item number","meta","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Communication Services ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7853eb31","guard":[["hasAny",["dte","element","item number","nth","pge","position","ppl"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Utilities ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7a377548","guard":[["hasAny",["archer","colgatepalmolive","element","item number","kimberlyclark","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Consumer Staples ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-974812c3","guard":[["hasAny",["element","industries","item number","lyondellbasell","nth","paper","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Materials ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9bacff6f","guard":[["hasAny",["ebay","element","garmin","hilton","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Consumer Discretionary ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-30e205a2","guard":[["hasAny",["d","element","hunt","item number","join","joined with","longest","longest one","longest word","nth","position","separated by","snapon"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["transform.join",["know.find",{"lit":"sp500"},{"lit":"company"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0a76284c","guard":[["hasAny",["delete","dominion","norfolk","remove","strip out","textron","without"]],["has","industry"]],"pyramid":["render.str",["transform.remove",{"lit":"industrials"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-af72a7bd","guard":[["hasAny",["delete","dominion","norfolk","remove","strip out","textron","without"]],["has","industry"]],"pyramid":["render.str",["transform.remove",{"lit":"Industrials"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-549d985d","guard":[["hasAny",["dominion","item number","norfolk","nth","position","textron"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Industrials ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-15ee1132","guard":[["hasAny",["dominion","invert case","item number","norfolk","nth","position","swap case","textron","toggle case"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Industrials ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1606e60a","guard":[["hasAny",["dominion","item number","norfolk","nth","position","textron"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Industrials ",{"slot":1},"."]},["sense.after",{"lit":"of"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9de75254","guard":[["hasAny",["all caps","capital letters","capitals","dominion","item number","norfolk","nth","position","textron","upper case","uppercase"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Industrials ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-affb685e","guard":[["hasAny",["applovin","holdings","item number","longest","longest one","longest word","meta","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Communication Services ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ce4a0f8f","guard":[["hasAny",["dominion","item number","lower case","lowercase","norfolk","nth","position","small letters","textron"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Industrials ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ec1d7805","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dominion","item number","norfolk","nth","position","textron","title case"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Industrials ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-10f81b0a","guard":[["hasAny",["industries","international","item number","nth","position"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials sector."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2d502e44","guard":[["hasAny",["dominion","each word","item number","norfolk","nth","position","split into words","textron"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Industrials ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f0d2a94c","guard":[["hasAny",["dominion","each word","item number","norfolk","nth","position","split into words","textron"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Industrials ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-42bcf84d","guard":[["hasAny",["akamai","arista","item number","longest","longest one","longest word","nth","position","semiconductor"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Information Technology ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-849ebda7","guard":[["hasAny",["bancorp","financial","item number","nth","position","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials sector."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-01ccc23e","guard":[["hasAny",["bancorp","financial","item number","nth","position","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-0c1c207b","guard":[["hasAny",["bancorp","financial","invert case","item number","nth","position","state","swap case","toggle case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-2f2d0c0c","guard":[["hasAny",["bancorp","financial","item number","nth","position","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-775a18e1","guard":[["hasAny",["bancorp","financial","item number","nth","position","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9891854b","guard":[["hasAny",["bancorp","capitalise","capitalize","capitalize each word","financial","item number","nth","position","state","title case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-91ed91bb","guard":[["hasAny",["bancorp","each word","financial","item number","nth","position","split into words","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-e86b2bb2","guard":[["hasAny",["bancorp","each word","financial","item number","nth","position","split into words","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-088a1a1d","guard":[["hasAny",["automotive","delete","ebay","item number","nth","strip out"]],["has","sector"],["words>=",7]],"pyramid":["render.str",["transform.remove",{"lit":"Consumer Discretionary"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-0924736f","guard":[["hasAny",["alliant","ameren","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Utilities ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-105540ea","guard":[["hasAny",["automotive","ebay","item number","nth","separate by","split","split by"]],["has","sector"],["words>=",7]],"pyramid":["render.and",["transform.split",{"lit":"Consumer Discretionary"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-2b628f73","guard":[["hasAny",["ares","delete","erie","item number","nth","strip out"]],["has","industry"]],"pyramid":["render.str",["transform.remove",{"lit":"Financials"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-49a6e227","guard":[["hasAny",["dominos","tapestry"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Consumer Discretionary ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-71b9aac9","guard":[["hasAny",["automotive","ebay","item number","nth","separate by","split","split by"]],["has","sector"],["words>=",7]],"pyramid":["render.lines",["transform.split",{"lit":"Consumer Discretionary"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-9190c748","guard":[["hasAny",["disney","tmobile"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Communication Services ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ab7fdbce","guard":[["hasAny",["beverage","gamble","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Consumer Staples ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b259d651","guard":[["hasAny",["ares","delete","erie","item number","nth","strip out"]],["has","industry"]],"pyramid":["render.str",["transform.remove",{"lit":"financials"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-d9bd5678","guard":[["hasAny",["automotive","ebay","item number","nth","separate by","split","split by"]],["has","sector"],["words>=",7]],"pyramid":["render.list",["transform.split",{"lit":"Consumer Discretionary"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-ec9f5716","guard":[["hasAny",["church","longest","longest one","longest word","sysco"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Consumer Staples ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-04db161d","guard":[["hasAny",["automotive","d","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Consumer Discretionary ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1701837a","guard":[["hasAny",["camden","communications","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Real Estate ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1ff711da","guard":[["hasAny",["b","element","item number","netflix","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Communication Services ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6c48dfac","guard":[["hasAny",["cencora","element","hca","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Health Care ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-75ca6cb1","guard":[["hasAny",["element","item number","kinder","nth","position","resources"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Energy ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-21b6074b","guard":[["hasAny",["delete","element","energy","item number","nth","position","remove","strip out","without"]],["has","sector"],["not",["has","atmos"]],["not",["has","group"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"sector"}],{"lit":1}]]],"mem":null},
{"id":"n-e47adac9","guard":[["not",["hasAny",["atmos","hours","symbol","ticker","uncertainty","wec"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"sector"}],{"lit":1}]]],"mem":null},
{"id":"n-f45be302","guard":[["hasAny",["item number","meta","netflix","nth","position"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Communication Services sector."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1ed3604b","guard":[["hasAny",["dominion","item number","norfolk","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Industrials sector."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-74bb576b","guard":[["hasAny",["longest","longest one","longest word","newmont","sherwinwilliams","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Materials ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8860b553","guard":[["hasAny",["b","item number","netflix","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Communication Services ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-887d437b","guard":[["hasAny",["longest","longest one","longest word","newmont","sherwinwilliams"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Materials ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-05027070","guard":[["hasAny",["akamai","arista","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Information Technology sector."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-101d5800","guard":[["hasAny",["b","capitalise","capitalize","capitalize each word","item number","netflix","nth","position","title case"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Communication Services ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-16e3cdad","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","newmont","sherwinwilliams","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Materials ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-b05a7838","guard":[["hasAny",["all caps","b","capital letters","capitals","item number","netflix","nth","position","upper case","uppercase"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Communication Services ",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bdc2b47a","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","newmont","sherwinwilliams","upper case","uppercase"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Materials ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-ce5c0a12","guard":[["hasAny",["b","item number","lower case","lowercase","netflix","nth","position","small letters"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Communication Services ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e6a8646f","guard":[["hasAny",["invert case","longest","longest one","longest word","newmont","sherwinwilliams","swap case","toggle case"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Materials ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-e852616a","guard":[["hasAny",["b","invert case","item number","netflix","nth","position","swap case","toggle case"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Communication Services ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-efcbb975","guard":[["hasAny",["industries","item number","longest","longest one","longest word","lyondellbasell","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Materials ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fd324780","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","newmont","sherwinwilliams","title case"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Materials ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-8aecbc73","guard":[["hasAny",["first n","longest","longest one","longest word","newmont","sherwinwilliams","take"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Materials ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-a6a28fd1","guard":[["hasAny",["b","each word","item number","netflix","nth","position","split into words"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Communication Services ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-be5e488f","guard":[["hasAny",["b","each word","item number","netflix","nth","position","split into words"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Communication Services ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e5ef40d0","guard":[["hasAny",["first n","longest","longest one","longest word","newmont","sherwinwilliams","take"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Materials ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-918fb213","guard":[["hasAny",["dominion","item number","norfolk","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Industrials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-b087b35d","guard":[["hasAny",["akamai","arista","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Information Technology ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-d6e3c9c5","guard":[["hasAny",["dominion","item number","norfolk","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Industrials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-48b1bb06","guard":[["hasAny",["bancorp","item number","longest","longest one","longest word","nth","position","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials sector."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5c402624","guard":[["hasAny",["akamai","arista","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Information Technology ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-613b1649","guard":[["hasAny",["akamai","arista","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Information Technology ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6e7645c5","guard":[["hasAny",["dominion","item number","lower case","lowercase","norfolk","nth","position","small letters"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Industrials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-718399c6","guard":[["hasAny",["dominion","invert case","item number","norfolk","nth","position","swap case","toggle case"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Industrials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7c5607b1","guard":[["hasAny",["all caps","capital letters","capitals","dominion","item number","norfolk","nth","position","upper case","uppercase"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Industrials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b391b731","guard":[["hasAny",["akamai","arista","capitalise","capitalize","capitalize each word","item number","longest","longest one","longest word","nth","position","title case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Information Technology ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-c2b838f8","guard":[["hasAny",["industries","item number","nth","paper","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-f1da0d5e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dominion","item number","norfolk","nth","position","title case"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Industrials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-06b3e2a2","guard":[["hasAny",["dominion","item number","norfolk","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Industrials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0935f57b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","industries","item number","nth","paper","position","title case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-0b2c92c0","guard":[["hasAny",["dominion","each word","item number","norfolk","nth","position","split into words"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Industrials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-324dd573","guard":[["hasAny",["industries","item number","nth","paper","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3fd683de","guard":[["hasAny",["akamai","arista","each word","item number","longest","longest one","longest word","nth","position","split into words"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Information Technology ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-40905b26","guard":[["hasAny",["dominion","item number","norfolk","normalise","normalize","nth","position","simplify the text"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Industrials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-495c451f","guard":[["hasAny",["dominion","each word","item number","norfolk","nth","position","split into words"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Industrials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d2ab8c5f","guard":[["hasAny",["akamai","arista","each word","item number","longest","longest one","longest word","nth","position","split into words"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Information Technology ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-e59e1f82","guard":[["hasAny",["industries","item number","nth","paper","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e9378a42","guard":[["hasAny",["industries","invert case","item number","nth","paper","position","swap case","toggle case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-3010b784","guard":[["hasAny",["each word","industries","item number","nth","paper","position","split into words"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-7417e344","guard":[["hasAny",["each word","industries","item number","nth","paper","position","split into words"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-9684dc6f","guard":[["hasAny",["bancorp","item number","longest","longest one","longest word","nth","position","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-244217a9","guard":[["hasAny",["bancorp","invert case","item number","longest","longest one","longest word","nth","position","state","swap case","toggle case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-41201615","guard":[["hasAny",["bancorp","item number","longest","longest one","longest word","nth","position","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6451c6d5","guard":[["hasAny",["bancorp","item number","longest","longest one","longest word","nth","position","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a7d2d27b","guard":[["hasAny",["bancorp","capitalise","capitalize","capitalize each word","item number","longest","longest one","longest word","nth","position","state","title case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-354ee0c5","guard":[["hasAny",["bancorp","each word","item number","longest","longest one","longest word","nth","position","split into words","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-707de0c3","guard":[["hasAny",["bancorp","each word","item number","longest","longest one","longest word","nth","position","split into words","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-003a83a6","guard":[["hasAny",["item number","nth","semiconductor","separate by","split","split by"]],["has","what"]],"pyramid":["render.lines",["transform.split",{"lit":"Information Technology"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-365d79d3","guard":[["hasAny",["delete","item number","nth","semiconductor","strip out"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"Information Technology"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-40be273e","guard":[["hasAny",["costar","longest","longest one","longest word"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Real Estate ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4113036d","guard":[["hasAny",["d","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Consumer Discretionary ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4995b569","guard":[["hasAny",["delete","hca","item number","nth","strip out"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"Health Care"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-4d9f733f","guard":[["hasAny",["delete","industries","item number","nth","strip out"]],["has","gics"]],"pyramid":["render.str",["transform.remove",{"lit":"Materials"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-52f96c43","guard":[["hasAny",["delete","item number","nth","strip out","tmobile"]],["has","sector"]],"pyramid":["render.str",["transform.remove",{"lit":"Communication Services"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-5708fd5c","guard":[["hasAny",["co","longest","longest one","longest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Health Care ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-67e05366","guard":[["hasAny",["item number","nth","semiconductor","separate by","split","split by"]],["has","what"]],"pyramid":["render.list",["transform.split",{"lit":"Information Technology"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-77c3aa8a","guard":[["has","tower"],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Real Estate ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-892ffef0","guard":[["hasAny",["jabil","longest","longest one","longest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Information Technology ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a9002191","guard":[["hasAny",["kinder","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Energy ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b7d63f53","guard":[["hasAny",["item number","nth","semiconductor","separate by","split","split by"]],["has","what"]],"pyramid":["render.and",["transform.split",{"lit":"Information Technology"},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-bd9fa2d3","guard":[["hasAny",["dominos","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Consumer Discretionary ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-df6368b1","guard":[["hasAny",["amcor","longest","longest one","longest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Materials ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e3aa377c","guard":[["hasAny",["shortest","shortest one","shortest word","tmobile"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Communication Services ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ebb4cbe0","guard":[["hasAny",["ameren","longest","longest one","longest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Utilities ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f86116e5","guard":[["hasAny",["analog","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Information Technology ",{"slot":1},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-00119b85","guard":[["hasAny",["d","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["D. R. Horton is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-059eb207","guard":[["hasAny",["costar","element","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["CoStar Group is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-08607413","guard":[["hasAny",["assurant","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Assurant is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0e057415","guard":[["hasAny",["brown","element","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["Brown & Brown is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1d7c87a9","guard":[["hasAny",["amcor","element","item number","longest","longest one","longest word","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Amcor is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-212eb27f","guard":[["hasAny",["element","item number","kinder","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["Kinder Morgan is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-213980d3","guard":[["hasAny",["element","item number","newmont","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Newmont is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-28c15485","guard":[["hasAny",["element","gamble","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Procter & Gamble is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-30ac914e","guard":[["hasAny",["element","item number","markets","nth","position","shortest","shortest one","shortest word"]],["has","sector"]],"pyramid":["render.template",{"lit":["Robinhood Markets is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-31a86c21","guard":[["hasAny",["co","element","item number","longest","longest one","longest word","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Merck & Co. is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-35e4229d","guard":[["hasAny",["aflac","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Aflac is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-366c1b52","guard":[["hasAny",["element","item number","nth","position","services","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Universal Health Services is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4610d46a","guard":[["hasAny",["element","item number","nth","position","rtx"]]],"pyramid":["render.template",{"lit":["RTX Corporation is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4a9bf596","guard":[["hasAny",["ameren","element","item number","longest","longest one","longest word","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Ameren is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5360bcf1","guard":[["hasAny",["element","flavors","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["International Flavors & Fragrances is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5a46dee0","guard":[["hasAny",["analog","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Analog Devices is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5c8365ff","guard":[["hasAny",["dominos","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Domino's is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5e17d849","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","paccar","position"]]],"pyramid":["render.template",{"lit":["Paccar is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-607cb6e6","guard":[["hasAny",["copart","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Copart is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-68cfe798","guard":[["hasAny",["element","item number","nth","position","tyler"]],["has","which"]],"pyramid":["render.template",{"lit":["Tyler Technologies is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-71b7663e","guard":[["hasAny",["element","hunt","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["J.B. Hunt is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-72b1c488","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","snapon"]]],"pyramid":["render.template",{"lit":["Snap-on is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-73eab734","guard":[["hasAny",["element","item number","nth","position","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":["American Tower is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7fb434d9","guard":[["hasAny",["disney","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Walt Disney Company (The) is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-837b27cc","guard":[["hasAny",["bancshares","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Huntington Bancshares is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-880637c4","guard":[["hasAny",["alliant","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Alliant Energy is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8a2af52b","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","xylem"]]],"pyramid":["render.template",{"lit":["Xylem Inc. is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8ce5e368","guard":[["hasAny",["element","insulet","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Insulet Corporation is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-94a76521","guard":[["hasAny",["element","honeywell","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Honeywell Technologies is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9db7626c","guard":[["hasAny",["church","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Church & Dwight is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9e5f5c30","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","sysco"]],["has","what"]],"pyramid":["render.template",{"lit":["Sysco is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a7532974","guard":[["hasAny",["beverage","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Monster Beverage is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-aec95ce0","guard":[["hasAny",["element","fisher","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Thermo Fisher Scientific is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b128677b","guard":[["hasAny",["element","item number","jabil","longest","longest one","longest word","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Jabil is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b3867f23","guard":[["hasAny",["boeing","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Boeing is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ba221be5","guard":[["hasAny",["element","item number","nth","position","tapestry"]],["has","which"]],"pyramid":["render.template",{"lit":["Tapestry, Inc. is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-bcfea2da","guard":[["hasAny",["element","express","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["American Express is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c6e04122","guard":[["hasAny",["brokers","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Interactive Brokers is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e803c881","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tmobile"]],["has","which"]],"pyramid":["render.template",{"lit":["T-Mobile US is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ec858f26","guard":[["hasAny",["corpay","element","item number","longest","longest one","longest word","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Corpay is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f820c090","guard":[["hasAny",["cardinal","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Cardinal Health is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f82c589d","guard":[["hasAny",["element","item number","nth","position","sherwinwilliams","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Sherwin-Williams is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fef2a82e","guard":[["hasAny",["element","item number","leidos","longest","longest one","longest word","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Leidos is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0254fc25","guard":[["hasAny",["akamai","element","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["Akamai Technologies is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0612a0f2","guard":[["hasAny",["element","item number","nth","paper","position"]]],"pyramid":["render.template",{"lit":["International Paper is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-08dc07bc","guard":[["hasAny",["dominion","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Old Dominion is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0a959823","guard":[["hasAny",["element","fifth","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["Fifth Third Bancorp is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0d6d9641","guard":[["hasAny",["element","item number","moderna","nth","position"]]],"pyramid":["render.template",{"lit":["Moderna is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1487af70","guard":[["hasAny",["archer","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Archer Daniels Midland is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-15748821","guard":[["hasAny",["arista","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Arista Networks is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1a06288c","guard":[["hasAny",["element","garmin","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Garmin is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1b4bf139","guard":[["hasAny",["broadcom","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Broadcom is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1d41b3bd","guard":[["hasAny",["automotive","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["O'Reilly Automotive is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1e3cb70f","guard":[["hasAny",["element","item number","nth","position","resources"]],["has","gics"]],"pyramid":["render.template",{"lit":["Targa Resources is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2555791a","guard":[["hasAny",["ebay","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["eBay Inc. is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2c565b45","guard":[["hasAny",["dte","element","item number","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":["DTE Energy is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-33482527","guard":[["hasAny",["element","item number","nth","position","transdigm"]]],"pyramid":["render.template",{"lit":["TransDigm Group is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-36330f66","guard":[["hasAny",["element","item number","netflix","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Netflix is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3fb797f3","guard":[["hasAny",["element","item number","meta","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["Meta Platforms is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-43bcdea8","guard":[["hasAny",["cencora","element","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["Cencora is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-48ec5c19","guard":[["hasAny",["diagnostics","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Quest Diagnostics is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-50ec2cdc","guard":[["hasAny",["element","item number","nth","position","state"]],["has","what"]],"pyramid":["render.template",{"lit":["State Street Corporation is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-56e0ee24","guard":[["hasAny",["element","item number","microchip","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":["Microchip Technology is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-573c62a7","guard":[["hasAny",["element","item number","lyondellbasell","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["LyondellBasell is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-57c77948","guard":[["hasAny",["element","item number","nth","pge","position"]],["has","industry"]],"pyramid":["render.template",{"lit":["PG&E Corporation is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5bed97c8","guard":[["hasAny",["america","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["Bank of America is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5f1195ae","guard":[["hasAny",["element","item number","nth","palantir","position"]]],"pyramid":["render.template",{"lit":["Palantir Technologies is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-60c4602c","guard":[["hasAny",["corning","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Corning Inc. is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-694a02a0","guard":[["hasAny",["element","item number","nth","position","textron"]]],"pyramid":["render.template",{"lit":["Textron is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6e41de79","guard":[["hasAny",["element","factset","item number","nth","position"]]],"pyramid":["render.template",{"lit":["FactSet is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-760a5e54","guard":[["hasAny",["element","financial","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["Principal Financial Group is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-768eb8ce","guard":[["hasAny",["element","item number","motorola","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Motorola Solutions is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8732815f","guard":[["hasAny",["cognizant","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Cognizant is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-87d1a988","guard":[["hasAny",["element","iqvia","item number","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":["IQVIA is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8af71ec8","guard":[["hasAny",["colgatepalmolive","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Colgate-Palmolive is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-927d3e80","guard":[["hasAny",["element","item number","mastercard","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":["Mastercard is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9a2164df","guard":[["hasAny",["element","holdings","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["TKO Group Holdings is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a1f3aaa7","guard":[["hasAny",["advanced","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["Advanced Micro Devices is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-aa525818","guard":[["hasAny",["element","invesco","item number","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":["Invesco is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-af60375b","guard":[["hasAny",["chubb","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Chubb Limited is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-af77534c","guard":[["hasAny",["element","grainger","item number","nth","position"]]],"pyramid":["render.template",{"lit":["W. W. Grainger is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-af7c55dd","guard":[["hasAny",["element","industries","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["PPG Industries is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bed04696","guard":[["hasAny",["element","item number","nth","position","resmed"]],["has","industry"]],"pyramid":["render.template",{"lit":["ResMed| is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c0ec0391","guard":[["hasAny",["element","item number","nth","position","teradyne"]],["has","name"]],"pyramid":["render.template",{"lit":["Teradyne is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c333e0f7","guard":[["hasAny",["element","hilton","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Hilton Worldwide is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c3d3911c","guard":[["hasAny",["camden","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Camden Property Trust is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c4fbd768","guard":[["hasAny",["element","item number","kimberlyclark","nth","position"]]],"pyramid":["render.template",{"lit":["Kimberly-Clark is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c986ad3c","guard":[["hasAny",["element","item number","nth","position","semiconductor"]],["has","what"]],"pyramid":["render.template",{"lit":["ON Semiconductor is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d75ef4cf","guard":[["hasAny",["b","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["News Corp (Class B) is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-de15e2e0","guard":[["hasAny",["element","erie","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Erie Indemnity is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e0b11b6c","guard":[["hasAny",["element","item number","norfolk","nth","position"]]],"pyramid":["render.template",{"lit":["Norfolk Southern is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e8e7e583","guard":[["hasAny",["element","hershey","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Hershey Company (The) is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ebabcdc3","guard":[["hasAny",["communications","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["SBA Communications is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ec46269a","guard":[["hasAny",["element","item number","nth","position","ppl"]]],"pyramid":["render.template",{"lit":["PPL Corporation is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f114bfc6","guard":[["hasAny",["element","hca","item number","nth","position"]]],"pyramid":["render.template",{"lit":["HCA Healthcare is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f7380bd8","guard":[["hasAny",["ares","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Ares Management is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fd30abca","guard":[["hasAny",["applovin","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["AppLovin is in the ",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"sector"}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-268ae60f","guard":[["not",["hasAny",["accumulated","description","extravasation","id","lowcarbon","per","symbol","ticker","title","uncertainty","wec","year"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"sector"}],{"lit":1}]]],"mem":null},
{"id":"n-d812248b","guard":[["hasAny",["delete","dte","element","item number","nth","position","remove","strip out","without"]],["has","industry"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"sector"}],{"lit":1}]]],"mem":null},
{"id":"n-28a6a25b","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tmobile"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6898274c","guard":[["hasAny",["element","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","tmobile","toggle case"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-77e0f68d","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","shortest","shortest one","shortest word","tmobile","upper case","uppercase"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c8ed6423","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","tmobile"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the ",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"sp500"},{"lit":"company"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"sector"}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-00f20d48","guard":[["hasAny",["colgatepalmolive","industry","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Colgate-Palmolive":"Colgate-Palmolive is in the Consumer Staples sector."}}},
{"id":"n-03f50695","guard":[["hasAny",["belong","d","gics","horton","r","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does D. R. Horton belong to":"D. R. Horton is in the Consumer Discretionary sector."}}},
{"id":"n-04441b30","guard":[["hasAny",["industry","name","sector","textron"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Textron":"Textron is in the Industrials sector."}}},
{"id":"n-0a2a6414","guard":[["hasAny",["industry","motorola","name","sector","solutions"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Motorola Solutions":"Motorola Solutions is in the Information Technology sector."}}},
{"id":"n-0b3c8b5f","guard":[["hasAny",["belong","gics","lyondellbasell","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does LyondellBasell belong to":"LyondellBasell is in the Materials sector."}}},
{"id":"n-0bad70bf","guard":[["hasAny",["factset","industry","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of FactSet":"FactSet is in the Financials sector."}}},
{"id":"n-120331d5","guard":[["hasAny",["cardinal","health","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Cardinal Health in":"Cardinal Health is in the Health Care sector."}}},
{"id":"n-12ba817a","guard":[["hasAny",["belong","cognizant","gics","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Cognizant belong to":"Cognizant is in the Information Technology sector."}}},
{"id":"n-156b0820","guard":[["hasAny",["belong","gics","hunt","jb","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does J.B. Hunt belong to":"J.B. Hunt is in the Industrials sector."}}},
{"id":"n-1af6f54e","guard":[["hasAny",["corporation","rtx","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is RTX Corporation in":"RTX Corporation is in the Industrials sector."}}},
{"id":"n-1e95adec","guard":[["hasAny",["belong","church","dwight","gics","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Church & Dwight belong to":"Church & Dwight is in the Consumer Staples sector."}}},
{"id":"n-20fe8e9a","guard":[["hasAny",["applovin","belong","gics","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does AppLovin belong to":"AppLovin is in the Communication Services sector."}}},
{"id":"n-22ef540e","guard":[["hasAny",["belong","gics","sector","snapon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Snap-on belong to":"Snap-on is in the Industrials sector."}}},
{"id":"n-2ade24cf","guard":[["hasAny",["hilton","industry","name","sector","worldwide"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Hilton Worldwide":"Hilton Worldwide is in the Consumer Discretionary sector."}}},
{"id":"n-2c16d3be","guard":[["hasAny",["leidos","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Leidos in":"Leidos is in the Industrials sector."}}},
{"id":"n-2f1c2708","guard":[["hasAny",["communications","industry","name","sba","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of SBA Communications":"SBA Communications is in the Real Estate sector."}}},
{"id":"n-319e4ff6","guard":[["hasAny",["ameren","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Ameren in":"Ameren is in the Utilities sector."}}},
{"id":"n-3c6cd816","guard":[["hasAny",["sector","technologies","tyler"]],["has","which"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Tyler Technologies in":"Tyler Technologies is in the Information Technology sector."}}},
{"id":"n-3f221f34","guard":[["hasAny",["co","merck","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Merck & Co. in":"Merck & Co. is in the Health Care sector."}}},
{"id":"n-4252390b","guard":[["hasAny",["belong","gics","inc","sector","xylem"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Xylem Inc. belong to":"Xylem Inc. is in the Industrials sector."}}},
{"id":"n-4572c2d2","guard":[["hasAny",["amcor","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Amcor in":"Amcor is in the Materials sector."}}},
{"id":"n-49561012","guard":[["hasAny",["company","disney","sector","walt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Walt Disney Company (The) in":"Walt Disney Company (The) is in the Communication Services sector."}}},
{"id":"n-4a7fb992","guard":[["hasAny",["belong","costar","gics","group","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does CoStar Group belong to":"CoStar Group is in the Real Estate sector."}}},
{"id":"n-4e998eb9","guard":[["hasAny",["corpay","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Corpay in":"Corpay is in the Financials sector."}}},
{"id":"n-520644d4","guard":[["hasAny",["belong","gics","meta","platforms","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Meta Platforms belong to":"Meta Platforms is in the Communication Services sector."}}},
{"id":"n-5568ac5c","guard":[["hasAny",["alliant","energy","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Alliant Energy in":"Alliant Energy is in the Utilities sector."}}},
{"id":"n-5873fb86","guard":[["hasAny",["belong","copart","gics","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Copart belong to":"Copart is in the Industrials sector."}}},
{"id":"n-5d33ac97","guard":[["hasAny",["boeing","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Boeing in":"Boeing is in the Industrials sector."}}},
{"id":"n-61c489d7","guard":[["hasAny",["honeywell","sector","technologies"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Honeywell Technologies in":"Honeywell Technologies is in the Industrials sector."}}},
{"id":"n-66ece631","guard":[["hasAny",["diagnostics","industry","name","quest","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Quest Diagnostics":"Quest Diagnostics is in the Health Care sector."}}},
{"id":"n-67eba00f","guard":[["hasAny",["belong","gics","grainger","sector","w"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does W. W. Grainger belong to":"W. W. Grainger is in the Industrials sector."}}},
{"id":"n-6b049c09","guard":[["hasAny",["industry","mastercard","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Mastercard":"Mastercard is in the Financials sector."}}},
{"id":"n-6e4c45a5","guard":[["hasAny",["america","bank","belong","gics","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Bank of America belong to":"Bank of America is in the Financials sector."}}},
{"id":"n-6e56c21b","guard":[["hasAny",["corporation","industry","name","pge","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of PG&E Corporation":"PG&E Corporation is in the Utilities sector."}}},
{"id":"n-7014b414","guard":[["hasAny",["industry","name","norfolk","sector","southern"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Norfolk Southern":"Norfolk Southern is in the Industrials sector."}}},
{"id":"n-72b29b20","guard":[["hasAny",["belong","gics","group","holdings","sector","tko"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does TKO Group Holdings belong to":"TKO Group Holdings is in the Communication Services sector."}}},
{"id":"n-735ad81f","guard":[["hasAny",["jabil","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Jabil in":"Jabil is in the Information Technology sector."}}},
{"id":"n-73a73fc0","guard":[["hasAny",["sector","sherwinwilliams"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Sherwin-Williams in":"Sherwin-Williams is in the Materials sector."}}},
{"id":"n-76405b70","guard":[["hasAny",["newmont","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Newmont in":"Newmont is in the Materials sector."}}},
{"id":"n-771c964f","guard":[["hasAny",["belong","gics","resources","sector","targa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Targa Resources belong to":"Targa Resources is in the Energy sector."}}},
{"id":"n-7a95f738","guard":[["hasAny",["belong","gics","paccar","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Paccar belong to":"Paccar is in the Industrials sector."}}},
{"id":"n-7d73eb4b","guard":[["hasAny",["sector","tmobile"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is T-Mobile US in":"T-Mobile US is in the Communication Services sector."}}},
{"id":"n-8172dad1","guard":[["hasAny",["industry","name","palantir","sector","technologies"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Palantir Technologies":"Palantir Technologies is in the Information Technology sector."}}},
{"id":"n-81b1b7f7","guard":[["hasAny",["bancorp","belong","fifth","gics","sector","third"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Fifth Third Bancorp belong to":"Fifth Third Bancorp is in the Financials sector."}}},
{"id":"n-84d4ae9d","guard":[["hasAny",["belong","financial","gics","group","principal","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Principal Financial Group belong to":"Principal Financial Group is in the Financials sector."}}},
{"id":"n-87993c68","guard":[["hasAny",["garmin","industry","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Garmin":"Garmin is in the Consumer Discretionary sector."}}},
{"id":"n-88ae8be4","guard":[["hasAny",["automotive","belong","gics","oreilly","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does O'Reilly Automotive belong to":"O'Reilly Automotive is in the Consumer Discretionary sector."}}},
{"id":"n-88e4bbb5","guard":[["hasAny",["industry","name","sector","teradyne"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Teradyne":"Teradyne is in the Information Technology sector."}}},
{"id":"n-8a0ceaed","guard":[["hasAny",["health","sector","services","universal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Universal Health Services in":"Universal Health Services is in the Health Care sector."}}},
{"id":"n-90cbfe87","guard":[["hasAny",["flavors","fragrances","international","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is International Flavors & Fragrances in":"International Flavors & Fragrances is in the Materials sector."}}},
{"id":"n-90f45f7b","guard":[["hasAny",["corporation","insulet","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Insulet Corporation in":"Insulet Corporation is in the Health Care sector."}}},
{"id":"n-95dd8d56","guard":[["hasAny",["b","class","corp","industry","name","news","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of News Corp (Class B)":"News Corp (Class B) is in the Communication Services sector."}}},
{"id":"n-96126412","guard":[["hasAny",["belong","gics","sector","sysco"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Sysco belong to":"Sysco is in the Consumer Staples sector."}}},
{"id":"n-9d3d20fb","guard":[["hasAny",["belong","gics","sector","semiconductor"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does ON Semiconductor belong to":"ON Semiconductor is in the Information Technology sector."}}},
{"id":"n-9d966f38","guard":[["hasAny",["brokers","interactive","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Interactive Brokers in":"Interactive Brokers is in the Financials sector."}}},
{"id":"n-9ec3c0bb","guard":[["hasAny",["belong","gics","group","sector","transdigm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does TransDigm Group belong to":"TransDigm Group is in the Industrials sector."}}},
{"id":"n-9edcbf26","guard":[["hasAny",["beverage","monster","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Monster Beverage in":"Monster Beverage is in the Consumer Staples sector."}}},
{"id":"n-a3598347","guard":[["hasAny",["bancshares","huntington","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Huntington Bancshares in":"Huntington Bancshares is in the Financials sector."}}},
{"id":"n-a3ac367a","guard":[["hasAny",["camden","industry","name","property","sector","trust"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Camden Property Trust":"Camden Property Trust is in the Real Estate sector."}}},
{"id":"n-a61d0d81","guard":[["hasAny",["arista","belong","gics","networks","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Arista Networks belong to":"Arista Networks is in the Information Technology sector."}}},
{"id":"n-a6bd8a5b","guard":[["hasAny",["inc","sector","tapestry"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Tapestry, Inc. in":"Tapestry, Inc. is in the Consumer Discretionary sector."}}},
{"id":"n-a784ebf8","guard":[["hasAny",["dominos","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Domino's in":"Domino's is in the Consumer Discretionary sector."}}},
{"id":"n-a9887369","guard":[["hasAny",["archer","daniels","industry","midland","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Archer Daniels Midland":"Archer Daniels Midland is in the Consumer Staples sector."}}},
{"id":"n-abcba4b3","guard":[["hasAny",["american","sector","tower"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is American Tower in":"American Tower is in the Real Estate sector."}}},
{"id":"n-acb78400","guard":[["hasAny",["industry","kimberlyclark","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Kimberly-Clark":"Kimberly-Clark is in the Consumer Staples sector."}}},
{"id":"n-b28cd9d6","guard":[["hasAny",["belong","gics","kinder","morgan","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Kinder Morgan belong to":"Kinder Morgan is in the Energy sector."}}},
{"id":"n-b2c1baa2","guard":[["hasAny",["corning","inc","industry","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Corning Inc.":"Corning Inc. is in the Information Technology sector."}}},
{"id":"n-b3316c44","guard":[["hasAny",["industry","invesco","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Invesco":"Invesco is in the Financials sector."}}},
{"id":"n-b33afc24","guard":[["hasAny",["gamble","procter","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Procter & Gamble in":"Procter & Gamble is in the Consumer Staples sector."}}},
{"id":"n-bda75f53","guard":[["hasAny",["ares","industry","management","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Ares Management":"Ares Management is in the Financials sector."}}},
{"id":"n-be47067d","guard":[["hasAny",["industry","name","netflix","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Netflix":"Netflix is in the Communication Services sector."}}},
{"id":"n-c08e4419","guard":[["hasAny",["industry","microchip","name","sector","technology"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Microchip Technology":"Microchip Technology is in the Information Technology sector."}}},
{"id":"n-c0e05fc2","guard":[["hasAny",["belong","gics","international","paper","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does International Paper belong to":"International Paper is in the Materials sector."}}},
{"id":"n-c25643c3","guard":[["hasAny",["belong","brown","gics","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Brown & Brown belong to":"Brown & Brown is in the Financials sector."}}},
{"id":"n-ca4e2226","guard":[["hasAny",["industry","name","resmed","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of ResMed|":"ResMed| is in the Health Care sector."}}},
{"id":"n-cb788a56","guard":[["hasAny",["chubb","industry","limited","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Chubb Limited":"Chubb Limited is in the Financials sector."}}},
{"id":"n-ccbdaf70","guard":[["hasAny",["industry","moderna","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Moderna":"Moderna is in the Health Care sector."}}},
{"id":"n-d4a7b958","guard":[["hasAny",["corporation","industry","name","ppl","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of PPL Corporation":"PPL Corporation is in the Utilities sector."}}},
{"id":"n-d7747daa","guard":[["hasAny",["belong","company","gics","hershey","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Hershey Company (The) belong to":"Hershey Company (The) is in the Consumer Staples sector."}}},
{"id":"n-d798d65a","guard":[["hasAny",["belong","gics","hca","healthcare","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does HCA Healthcare belong to":"HCA Healthcare is in the Health Care sector."}}},
{"id":"n-d8ce3f43","guard":[["hasAny",["dte","energy","industry","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of DTE Energy":"DTE Energy is in the Utilities sector."}}},
{"id":"n-d935ece8","guard":[["hasAny",["american","express","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is American Express in":"American Express is in the Financials sector."}}},
{"id":"n-db08e55f","guard":[["hasAny",["assurant","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Assurant in":"Assurant is in the Financials sector."}}},
{"id":"n-dc539b81","guard":[["hasAny",["akamai","belong","gics","sector","technologies"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Akamai Technologies belong to":"Akamai Technologies is in the Information Technology sector."}}},
{"id":"n-dd4b31ca","guard":[["hasAny",["markets","robinhood","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Robinhood Markets in":"Robinhood Markets is in the Financials sector."}}},
{"id":"n-deab3cb3","guard":[["hasAny",["industry","iqvia","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of IQVIA":"IQVIA is in the Health Care sector."}}},
{"id":"n-df466ff4","guard":[["hasAny",["belong","gics","industries","ppg","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does PPG Industries belong to":"PPG Industries is in the Materials sector."}}},
{"id":"n-e56ff192","guard":[["hasAny",["erie","indemnity","industry","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Erie Indemnity":"Erie Indemnity is in the Financials sector."}}},
{"id":"n-e73cb9e9","guard":[["hasAny",["aflac","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Aflac in":"Aflac is in the Financials sector."}}},
{"id":"n-f0cc9ae0","guard":[["hasAny",["belong","corporation","gics","sector","state","street"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does State Street Corporation belong to":"State Street Corporation is in the Financials sector."}}},
{"id":"n-f100694a","guard":[["hasAny",["ebay","inc","industry","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of eBay Inc.":"eBay Inc. is in the Consumer Discretionary sector."}}},
{"id":"n-f470516a","guard":[["hasAny",["dominion","industry","name","old","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Old Dominion":"Old Dominion is in the Industrials sector."}}},
{"id":"n-f54a2de9","guard":[["hasAny",["advanced","belong","devices","gics","micro","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Advanced Micro Devices belong to":"Advanced Micro Devices is in the Information Technology sector."}}},
{"id":"n-f61289bc","guard":[["hasAny",["fisher","scientific","sector","thermo"]],["has","which"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Thermo Fisher Scientific in":"Thermo Fisher Scientific is in the Health Care sector."}}},
{"id":"n-fe6ce233","guard":[["hasAny",["bancorp","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is U.S. Bancorp in":"U.S. Bancorp is in the Financials sector."}}},
{"id":"n-fe7ec90c","guard":[["hasAny",["broadcom","industry","name","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the industry sector of Broadcom":"Broadcom is in the Information Technology sector."}}},
{"id":"n-fe994af6","guard":[["hasAny",["belong","cencora","gics","sector"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what GICS sector does Cencora belong to":"Cencora is in the Health Care sector."}}},
{"id":"n-ffe0c5d0","guard":[["hasAny",["analog","devices","sector"]],["has","which"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which sector is Analog Devices in":"Analog Devices is in the Information Technology sector."}}},
{"id":"n-10705ccb","guard":[["hasAny",["corpay","longest","longest one","longest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Corpay is in the Financials ",{"slot":0},"."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-656ef7b9","guard":[["has","snapon"]],"pyramid":["render.template",{"lit":["Snap-on is in the Industrials ",{"slot":0},"."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-76ec0c43","guard":[["hasAny",["amcor","longest","longest one","longest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Amcor is in the Materials ",{"slot":0},"."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9bb3d15e","guard":[["hasAny",["assurant","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Assurant is in the Financials ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c523db52","guard":[["hasAny",["sherwinwilliams","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Sherwin-Williams is in the Materials ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cd516a36","guard":[["hasAny",["newmont","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Newmont is in the Materials ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d3450a63","guard":[["hasAny",["ameren","longest","longest one","longest word"]],["has","which"]],"pyramid":["render.template",{"lit":["Ameren is in the Utilities ",{"slot":0},"."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-dfc658f7","guard":[["has","sherwinwilliams"]],"pyramid":["render.template",{"lit":["Sherwin-Williams is in the Materials ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-10d6a2b1","guard":[["hasAny",["invert case","sherwinwilliams","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["Sherwin-Williams is in the Materials ",{"slot":0},"."]},["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-5fe42485","guard":[["hasAny",["invert case","snapon","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["Snap-on is in the Industrials ",{"slot":0},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-79b8ad57","guard":[["hasAny",["lower case","lowercase","sherwinwilliams","small letters"]]],"pyramid":["render.template",{"lit":["Sherwin-Williams is in the Materials ",{"slot":0},"."]},["transform.lower",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-538b7416","guard":[["hasAny",["each word","snapon","split into words"]]],"pyramid":["render.template",{"lit":["Snap-on is in the Industrials ",{"slot":0},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-53da2709","guard":[["hasAny",["each word","snapon","split into words"]]],"pyramid":["render.template",{"lit":["Snap-on is in the Industrials ",{"slot":0},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-74c43f5d","guard":[["hasAny",["item number","norfolk","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":["Norfolk ",{"slot":0}," is in the Industrials ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ba297248","guard":[["hasAny",["express","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," Express is in the Financials ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c1a75343","guard":[["hasAny",["longest","longest one","longest word","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," Tower is in the Real Estate ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-de56eb1a","guard":[["hasAny",["amcor","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in the Materials ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-07354c8b","guard":[["hasAny",["communications","item number","longest","longest one","longest word","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate sector."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0c831701","guard":[["hasAny",["industries","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials sector."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-14e8f8fd","guard":[["hasAny",["america","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["Bank of ",{"slot":0}," is in the Financials ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-30bdcfe1","guard":[["hasAny",["america","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," is in the Financials sector."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8340fc90","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," & Co. is in the Health Care ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8ab4605d","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","resources"]],["has","gics"]],"pyramid":["render.template",{"lit":["Targa ",{"slot":0}," is in the Energy ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9e9c2a11","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate sector."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-aeca5352","guard":[["hasAny",["industries","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["PPG ",{"slot":0}," is in the Materials ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b8f15cc2","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","resources"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Energy sector."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-bb574458","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","sector"]],"pyramid":["render.template",{"lit":["Merck & ",{"slot":0},". is in the Health Care ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c56503dc","guard":[["hasAny",["akamai","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["Akamai ",{"slot":0}," is in the Information Technology ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c9475295","guard":[["hasAny",["express","item number","nth","position","shortest","shortest one","shortest word"]],["has","sector"]],"pyramid":["render.template",{"lit":["American ",{"slot":0}," is in the Financials ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cda3b443","guard":[["hasAny",["communications","item number","longest","longest one","longest word","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":["SBA ",{"slot":0}," is in the Real Estate ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f1dadeb0","guard":[["hasAny",["item number","nth","position","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":["American ",{"slot":0}," is in the Real Estate ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-1087fb85","guard":[["hasAny",["item number","nth","paper","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["International ",{"slot":0}," is in the Materials ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3573e164","guard":[["hasAny",["longest","longest one","longest word","shortest","shortest one","shortest word","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-658b1385","guard":[["hasAny",["communications","item number","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," Communications is in the Real Estate ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-baab9962","guard":[["hasAny",["akamai","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," Technologies is in the Information Technology ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c54e022a","guard":[["hasAny",["industries","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," Industries is in the Materials ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cb00f75d","guard":[["hasAny",["item number","nth","position","resources"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," Resources is in the Energy ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-dd72a40a","guard":[["hasAny",["item number","norfolk","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," Southern is in the Industrials ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ebbd125c","guard":[["hasAny",["item number","nth","paper","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," Paper is in the Materials ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fd24daad","guard":[["hasAny",["america","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," of America is in the Financials ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0cabbf6b","guard":[["hasAny",["industries","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-361e10fe","guard":[["hasAny",["america","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-3b001e89","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-5fa7ebb5","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8176a9c0","guard":[["hasAny",["industries","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-ac959b76","guard":[["hasAny",["communications","item number","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bb8273f6","guard":[["hasAny",["communications","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e8986fd3","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","resources"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Energy ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-eb1b7413","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," & ",{"slot":1},". is in the Health Care ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-02027d7e","guard":[["hasAny",["b","item number","nth","position","shortest","shortest one","shortest word"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," Corp (Class ",{"slot":1},") is in the Communication Services ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0772f6eb","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," & ",{"slot":1},". is in the Health Care ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-08cfbbe9","guard":[["hasAny",["communications","item number","lower case","lowercase","nth","position","small letters"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-092bdc38","guard":[["hasAny",["bancorp","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," Third ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0ad56e32","guard":[["hasAny",["d","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1},". Horton is in the Consumer Discretionary ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1827d469","guard":[["hasAny",["holdings","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Communication Services sector."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-19becbc5","guard":[["hasAny",["invert case","item number","longest","longest one","longest word","nth","position","resources","swap case","toggle case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Energy ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-1c207211","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","longest","longest one","longest word","nth","position","resources","title case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Energy ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-1c6ee4ff","guard":[["hasAny",["holdings","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["TKO ",{"slot":0}," ",{"slot":1}," is in the Communication Services ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-231e9469","guard":[["hasAny",["item number","nth","position","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2c54dc4d","guard":[["hasAny",["industries","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-2dd714aa","guard":[["hasAny",["holdings","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," Group ",{"slot":1}," is in the Communication Services ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2e123298","guard":[["hasAny",["d","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0},". R. ",{"slot":1}," is in the Consumer Discretionary ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2efd7cee","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," & ",{"slot":1},". is in the Health Care ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3a07cd39","guard":[["hasAny",["all caps","capital letters","capitals","communications","item number","nth","position","upper case","uppercase"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3ab2c747","guard":[["hasAny",["co","item number","longest","longest one","longest word","nth","position"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," & ",{"slot":1},". is in the Health Care ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-47cee294","guard":[["hasAny",["item number","nth","position","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-549d733c","guard":[["hasAny",["invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-553dfe9f","guard":[["hasAny",["america","capitalise","capitalize","capitalize each word","item number","longest","longest one","longest word","nth","position","title case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-5785caa2","guard":[["hasAny",["all caps","capital letters","capitals","item number","longest","longest one","longest word","nth","position","tower","upper case","uppercase"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-5d8ffd13","guard":[["hasAny",["capitalise","capitalize","capitalize each word","industries","item number","longest","longest one","longest word","nth","position","title case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-63eadc8f","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-6aefd86e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","communications","item number","nth","position","title case"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6e507737","guard":[["hasAny",["communications","invert case","item number","nth","position","swap case","toggle case"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7e68feb3","guard":[["hasAny",["america","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-86d96ab1","guard":[["hasAny",["america","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-8ecd7ba9","guard":[["hasAny",["item number","longest","longest one","longest word","lower case","lowercase","nth","position","small letters","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-96bcfc9d","guard":[["hasAny",["item number","longest","longest one","longest word","nth","paper","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9833d172","guard":[["hasAny",["industries","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9a306540","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","resources"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Energy ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9c11538b","guard":[["hasAny",["communications","item number","longest","longest one","longest word","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9e3994aa","guard":[["hasAny",["america","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a77d03c1","guard":[["hasAny",["d","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["D. ",{"slot":0},". ",{"slot":1}," is in the Consumer Discretionary ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b0719307","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","state"]],["has","gics"]],"pyramid":["render.template",{"lit":["State ",{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c0448dcc","guard":[["hasAny",["communications","item number","longest","longest one","longest word","nth","position"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-c7160237","guard":[["hasAny",["bancorp","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["Fifth ",{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ccdd9f5f","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," Street ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d1ef90c3","guard":[["hasAny",["industries","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d85519f4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","longest","longest one","longest word","nth","position","title case","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-e1a05303","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","resources"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Energy ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-32af8253","guard":[["hasAny",["america","each word","item number","longest","longest one","longest word","nth","position","split into words"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-3e837db5","guard":[["hasAny",["communications","each word","item number","nth","position","split into words"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4334b6bc","guard":[["hasAny",["communications","item number","normalise","normalize","nth","position","simplify the text"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-462c9e84","guard":[["hasAny",["communications","each word","item number","nth","position","split into words"]],["has","industry"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-49cdcd36","guard":[["hasAny",["holdings","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Holdings is in the Communication Services ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-52553d63","guard":[["hasAny",["each word","industries","item number","longest","longest one","longest word","nth","position","split into words"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-5ed985bf","guard":[["hasAny",["financial","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":["Principal ",{"slot":0}," ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-87d25399","guard":[["hasAny",["financial","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," Financial ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8d4085ae","guard":[["hasAny",["each word","item number","longest","longest one","longest word","nth","position","resources","split into words"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Energy ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-a6e30066","guard":[["hasAny",["bancorp","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Bancorp is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a7b3603e","guard":[["hasAny",["each word","item number","longest","longest one","longest word","nth","position","resources","split into words"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Energy ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-a7c0825c","guard":[["hasAny",["america","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-aa1c29f4","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nth","position","take","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-bc9128cc","guard":[["hasAny",["each word","item number","longest","longest one","longest word","nth","position","split into words","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-c51638bb","guard":[["hasAny",["first n","item number","longest","longest one","longest word","nth","position","take","tower"]],["has","sector"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Real Estate ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-d2e38ef7","guard":[["hasAny",["america","each word","item number","longest","longest one","longest word","nth","position","split into words"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-e56d3ca1","guard":[["hasAny",["d","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1},". ",{"slot":2}," is in the Consumer Discretionary sector."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e5b055e0","guard":[["hasAny",["item number","nth","position","state"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Corporation is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ef8d9852","guard":[["hasAny",["each word","industries","item number","longest","longest one","longest word","nth","position","split into words"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in the Materials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-f7d21460","guard":[["hasAny",["financial","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Group is in the Financials ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-20e96592","guard":[["hasAny",["holdings","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Communication Services ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-94a5b6ea","guard":[["hasAny",["d","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1},". ",{"slot":2}," is in the Consumer Discretionary ",{"slot":3},"."]},["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c5d61faa","guard":[["hasAny",["d","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1},". ",{"slot":2}," is in the Consumer Discretionary ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-df7c3ea9","guard":[["hasAny",["holdings","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Communication Services ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-2c8f3855","guard":[["hasAny",["holdings","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Communication Services ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-471817c1","guard":[["hasAny",["d","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1},". ",{"slot":2}," is in the Consumer Discretionary ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-47b45330","guard":[["hasAny",["financial","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Financials ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4851f2d5","guard":[["hasAny",["holdings","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Communication Services ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-56bceb6d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","holdings","item number","longest","longest one","longest word","nth","position","title case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Communication Services ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-a58c949b","guard":[["hasAny",["d","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1},". ",{"slot":2}," is in the Consumer Discretionary ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-c9a56e84","guard":[["hasAny",["d","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1},". ",{"slot":2}," is in the Consumer Discretionary ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d50b6211","guard":[["hasAny",["holdings","item number","longest","longest one","longest word","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Communication Services ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2dd9fa9c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","d","item number","nth","position","title case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1},". ",{"slot":2}," is in the Consumer Discretionary ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-37f49b89","guard":[["hasAny",["each word","holdings","item number","longest","longest one","longest word","nth","position","split into words"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Communication Services ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-4509202c","guard":[["hasAny",["d","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1},". ",{"slot":2}," is in the Consumer Discretionary ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4581717b","guard":[["hasAny",["d","invert case","item number","nth","position","swap case","toggle case"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1},". ",{"slot":2}," is in the Consumer Discretionary ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-c82ab6c7","guard":[["hasAny",["holdings","item number","nth","position"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Communication Services ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ca6c0718","guard":[["hasAny",["each word","holdings","item number","longest","longest one","longest word","nth","position","split into words"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in the Communication Services ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-60d1726f","guard":[["hasAny",["d","each word","item number","nth","position","split into words"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1},". ",{"slot":2}," is in the Consumer Discretionary ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-a9baaf33","guard":[["hasAny",["d","each word","item number","nth","position","split into words"]],["has","gics"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1},". ",{"slot":2}," is in the Consumer Discretionary ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-01496320","guard":[["has","insulet"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Insulet Corporation in":"Insulet Corporation is in the Health Care sector."}}},
{"id":"n-036d9fb8","guard":[["hasAny",["boeing","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Boeing in":"Boeing is in the Industrials sector."}}},
{"id":"n-05f9a3e3","guard":[["hasAny",["markets","robinhood","sector"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Robinhood Markets in":"Robinhood Markets is in the Financials sector."}}},
{"id":"n-0cdcdfb3","guard":[["hasAny",["bancorp","belong","fifth","gics","sector","third"]],["has","gics"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Fifth Third Bancorp belong to":"Fifth Third Bancorp is in the Financials sector."}}},
{"id":"n-0f972fee","guard":[["has","invesco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Invesco":"Invesco is in the Financials sector."}}},
{"id":"n-10c4e773","guard":[["has","colgatepalmolive"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Colgate-Palmolive":"Colgate-Palmolive is in the Consumer Staples sector."}}},
{"id":"n-115014a9","guard":[["hasAny",["camden","industry","name","property","sector","trust"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Camden Property Trust":"Camden Property Trust is in the Real Estate sector."}}},
{"id":"n-119a3c0b","guard":[["has","netflix"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Netflix":"Netflix is in the Communication Services sector."}}},
{"id":"n-138c38fd","guard":[["hasAny",["beverage","monster","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Monster Beverage in":"Monster Beverage is in the Consumer Staples sector."}}},
{"id":"n-162afdec","guard":[["has","corning"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Corning Inc.":"Corning Inc. is in the Information Technology sector."}}},
{"id":"n-16ec66fd","guard":[["hasAny",["communications","sba"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of SBA Communications":"SBA Communications is in the Real Estate sector."}}},
{"id":"n-17ea2a81","guard":[["has","factset"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of FactSet":"FactSet is in the Financials sector."}}},
{"id":"n-18827a5d","guard":[["hasAny",["b","class","corp","industry","name","news","sector"]],["has","industry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of News Corp (Class B)":"News Corp (Class B) is in the Communication Services sector."}}},
{"id":"n-19143d25","guard":[["hasAny",["belong","corporation","gics","sector","state","street"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does State Street Corporation belong to":"State Street Corporation is in the Financials sector."}}},
{"id":"n-19595876","guard":[["has","rtx"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is RTX Corporation in":"RTX Corporation is in the Industrials sector."}}},
{"id":"n-1bcd5550","guard":[["has","cognizant"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Cognizant belong to":"Cognizant is in the Information Technology sector."}}},
{"id":"n-1d8bb01c","guard":[["hasAny",["belong","d","gics","horton","r","sector"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does D. R. Horton belong to":"D. R. Horton is in the Consumer Discretionary sector."}}},
{"id":"n-1fa50870","guard":[["has","costar"],["has","gics"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does CoStar Group belong to":"CoStar Group is in the Real Estate sector."}}},
{"id":"n-21173ab2","guard":[["hasAny",["grainger","w"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does W. W. Grainger belong to":"W. W. Grainger is in the Industrials sector."}}},
{"id":"n-2348fabd","guard":[["has","lyondellbasell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does LyondellBasell belong to":"LyondellBasell is in the Materials sector."}}},
{"id":"n-2355eca4","guard":[["hasAny",["newmont","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Newmont in":"Newmont is in the Materials sector."}}},
{"id":"n-28d61756","guard":[["hasAny",["microchip","technology"]],["has","industry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Microchip Technology":"Microchip Technology is in the Information Technology sector."}}},
{"id":"n-2a22db13","guard":[["hasAny",["leidos","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Leidos in":"Leidos is in the Industrials sector."}}},
{"id":"n-2baab475","guard":[["has","express"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is American Express in":"American Express is in the Financials sector."}}},
{"id":"n-2e732af7","guard":[["has","semiconductor"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does ON Semiconductor belong to":"ON Semiconductor is in the Information Technology sector."}}},
{"id":"n-2ed20a11","guard":[["hasAny",["dominion","old"]],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Old Dominion":"Old Dominion is in the Industrials sector."}}},
{"id":"n-31376ed2","guard":[["hasAny",["diagnostics","quest"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Quest Diagnostics":"Quest Diagnostics is in the Health Care sector."}}},
{"id":"n-35825c4a","guard":[["hasAny",["jabil","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Jabil in":"Jabil is in the Information Technology sector."}}},
{"id":"n-3696a3fb","guard":[["hasAny",["meta","platforms"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Meta Platforms belong to":"Meta Platforms is in the Communication Services sector."}}},
{"id":"n-370c3853","guard":[["has","teradyne"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Teradyne":"Teradyne is in the Information Technology sector."}}},
{"id":"n-38959d5e","guard":[["hasAny",["health","sector","services","universal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Universal Health Services in":"Universal Health Services is in the Health Care sector."}}},
{"id":"n-3ab74992","guard":[["has","brown"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Brown & Brown belong to":"Brown & Brown is in the Financials sector."}}},
{"id":"n-3b80db03","guard":[["has","garmin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Garmin":"Garmin is in the Consumer Discretionary sector."}}},
{"id":"n-3bdc86d9","guard":[["hasAny",["financial","principal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Principal Financial Group belong to":"Principal Financial Group is in the Financials sector."}}},
{"id":"n-3c6bd326","guard":[["hasAny",["bancorp","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is U.S. Bancorp in":"U.S. Bancorp is in the Financials sector."}}},
{"id":"n-3d4ab4b8","guard":[["has","sysco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Sysco belong to":"Sysco is in the Consumer Staples sector."}}},
{"id":"n-3d75dd21","guard":[["hasAny",["flavors","fragrances","international","sector"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is International Flavors & Fragrances in":"International Flavors & Fragrances is in the Materials sector."}}},
{"id":"n-41cd4ae1","guard":[["hasAny",["inc","sector","tapestry"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Tapestry, Inc. in":"Tapestry, Inc. is in the Consumer Discretionary sector."}}},
{"id":"n-43cd536f","guard":[["has","ppl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of PPL Corporation":"PPL Corporation is in the Utilities sector."}}},
{"id":"n-4d8432f5","guard":[["hasAny",["international","paper"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does International Paper belong to":"International Paper is in the Materials sector."}}},
{"id":"n-4e839d2c","guard":[["hasAny",["palantir","technologies"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Palantir Technologies":"Palantir Technologies is in the Information Technology sector."}}},
{"id":"n-50937cf6","guard":[["hasAny",["brokers","interactive","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Interactive Brokers in":"Interactive Brokers is in the Financials sector."}}},
{"id":"n-521a69b3","guard":[["has","pge"],["has","industry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of PG&E Corporation":"PG&E Corporation is in the Utilities sector."}}},
{"id":"n-5a94be92","guard":[["has","honeywell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Honeywell Technologies in":"Honeywell Technologies is in the Industrials sector."}}},
{"id":"n-5f17959e","guard":[["hasAny",["kinder","morgan"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Kinder Morgan belong to":"Kinder Morgan is in the Energy sector."}}},
{"id":"n-651546b8","guard":[["has","broadcom"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Broadcom":"Broadcom is in the Information Technology sector."}}},
{"id":"n-66f0d203","guard":[["hasAny",["analog","devices","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Analog Devices in":"Analog Devices is in the Information Technology sector."}}},
{"id":"n-688d7f52","guard":[["hasAny",["industries","ppg"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does PPG Industries belong to":"PPG Industries is in the Materials sector."}}},
{"id":"n-6a14f057","guard":[["hasAny",["aflac","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Aflac in":"Aflac is in the Financials sector."}}},
{"id":"n-6b04cb02","guard":[["hasAny",["arista","networks"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Arista Networks belong to":"Arista Networks is in the Information Technology sector."}}},
{"id":"n-6d600320","guard":[["has","cencora"],["has","gics"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Cencora belong to":"Cencora is in the Health Care sector."}}},
{"id":"n-6d7d666b","guard":[["has","ebay"],["has","industry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of eBay Inc.":"eBay Inc. is in the Consumer Discretionary sector."}}},
{"id":"n-6f3d38f8","guard":[["has","applovin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does AppLovin belong to":"AppLovin is in the Communication Services sector."}}},
{"id":"n-712e03ae","guard":[["has","mastercard"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Mastercard":"Mastercard is in the Financials sector."}}},
{"id":"n-718135ac","guard":[["hasAny",["ameren","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Ameren in":"Ameren is in the Utilities sector."}}},
{"id":"n-75e7c028","guard":[["has","tower"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is American Tower in":"American Tower is in the Real Estate sector."}}},
{"id":"n-775c8781","guard":[["hasAny",["gamble","procter","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Procter & Gamble in":"Procter & Gamble is in the Consumer Staples sector."}}},
{"id":"n-7a06d6ab","guard":[["hasAny",["akamai","technologies"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Akamai Technologies belong to":"Akamai Technologies is in the Information Technology sector."}}},
{"id":"n-7cf6d69b","guard":[["hasAny",["automotive","oreilly"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does O'Reilly Automotive belong to":"O'Reilly Automotive is in the Consumer Discretionary sector."}}},
{"id":"n-848b25b3","guard":[["hasAny",["church","dwight"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Church & Dwight belong to":"Church & Dwight is in the Consumer Staples sector."}}},
{"id":"n-87d1afbf","guard":[["has","snapon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Snap-on belong to":"Snap-on is in the Industrials sector."}}},
{"id":"n-8f896dee","guard":[["has","moderna"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Moderna":"Moderna is in the Health Care sector."}}},
{"id":"n-983d197a","guard":[["hasAny",["dte","energy"]],["has","industry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of DTE Energy":"DTE Energy is in the Utilities sector."}}},
{"id":"n-9c76a437","guard":[["hasAny",["bancshares","huntington","sector"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Huntington Bancshares in":"Huntington Bancshares is in the Financials sector."}}},
{"id":"n-a3c5715a","guard":[["hasAny",["erie","indemnity"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Erie Indemnity":"Erie Indemnity is in the Financials sector."}}},
{"id":"n-a3e159a0","guard":[["has","textron"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Textron":"Textron is in the Industrials sector."}}},
{"id":"n-a406eca6","guard":[["hasAny",["hca","healthcare"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does HCA Healthcare belong to":"HCA Healthcare is in the Health Care sector."}}},
{"id":"n-a89fa9ec","guard":[["has","paccar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Paccar belong to":"Paccar is in the Industrials sector."}}},
{"id":"n-a96ffb4c","guard":[["has","tyler"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Tyler Technologies in":"Tyler Technologies is in the Information Technology sector."}}},
{"id":"n-aa1b431b","guard":[["hasAny",["cardinal","health","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Cardinal Health in":"Cardinal Health is in the Health Care sector."}}},
{"id":"n-aa2c8ca2","guard":[["hasAny",["sector","tmobile"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is T-Mobile US in":"T-Mobile US is in the Communication Services sector."}}},
{"id":"n-ad3d5c12","guard":[["hasAny",["advanced","belong","devices","gics","micro","sector"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Advanced Micro Devices belong to":"Advanced Micro Devices is in the Information Technology sector."}}},
{"id":"n-aef77275","guard":[["has","resmed"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of ResMed|":"ResMed| is in the Health Care sector."}}},
{"id":"n-af50fa1c","guard":[["hasAny",["assurant","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Assurant in":"Assurant is in the Financials sector."}}},
{"id":"n-b146f7e3","guard":[["hasAny",["ares","management"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Ares Management":"Ares Management is in the Financials sector."}}},
{"id":"n-bcdbdb16","guard":[["has","transdigm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does TransDigm Group belong to":"TransDigm Group is in the Industrials sector."}}},
{"id":"n-bcecd125","guard":[["hasAny",["motorola","solutions"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Motorola Solutions":"Motorola Solutions is in the Information Technology sector."}}},
{"id":"n-c22dbde2","guard":[["hasAny",["holdings","tko"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does TKO Group Holdings belong to":"TKO Group Holdings is in the Communication Services sector."}}},
{"id":"n-c46869de","guard":[["hasAny",["company","hershey"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Hershey Company (The) belong to":"Hershey Company (The) is in the Consumer Staples sector."}}},
{"id":"n-c50a430e","guard":[["hasAny",["archer","daniels","industry","midland","name","sector"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Archer Daniels Midland":"Archer Daniels Midland is in the Consumer Staples sector."}}},
{"id":"n-c5930273","guard":[["hasAny",["hunt","jb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does J.B. Hunt belong to":"J.B. Hunt is in the Industrials sector."}}},
{"id":"n-c675c6fc","guard":[["hasAny",["inc","xylem"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Xylem Inc. belong to":"Xylem Inc. is in the Industrials sector."}}},
{"id":"n-c9db5001","guard":[["has","iqvia"],["has","industry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of IQVIA":"IQVIA is in the Health Care sector."}}},
{"id":"n-cf158b83","guard":[["hasAny",["hilton","worldwide"]],["has","industry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Hilton Worldwide":"Hilton Worldwide is in the Consumer Discretionary sector."}}},
{"id":"n-d06426cd","guard":[["hasAny",["resources","targa"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Targa Resources belong to":"Targa Resources is in the Energy sector."}}},
{"id":"n-d2327895","guard":[["hasAny",["fisher","scientific","sector","thermo"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Thermo Fisher Scientific in":"Thermo Fisher Scientific is in the Health Care sector."}}},
{"id":"n-d395aa99","guard":[["hasAny",["america","bank"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Bank of America belong to":"Bank of America is in the Financials sector."}}},
{"id":"n-d50b470c","guard":[["hasAny",["norfolk","southern"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Norfolk Southern":"Norfolk Southern is in the Industrials sector."}}},
{"id":"n-d9c4f4ef","guard":[["has","copart"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what GICS sector does Copart belong to":"Copart is in the Industrials sector."}}},
{"id":"n-dbbef42e","guard":[["hasAny",["amcor","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Amcor in":"Amcor is in the Materials sector."}}},
{"id":"n-df343879","guard":[["hasAny",["alliant","energy","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Alliant Energy in":"Alliant Energy is in the Utilities sector."}}},
{"id":"n-e404dae2","guard":[["hasAny",["chubb","limited"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Chubb Limited":"Chubb Limited is in the Financials sector."}}},
{"id":"n-e6c600b8","guard":[["hasAny",["dominos","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Domino's in":"Domino's is in the Consumer Discretionary sector."}}},
{"id":"n-eb2860b7","guard":[["hasAny",["sector","sherwinwilliams"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Sherwin-Williams in":"Sherwin-Williams is in the Materials sector."}}},
{"id":"n-ef14c00c","guard":[["hasAny",["co","merck","sector"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Merck & Co. in":"Merck & Co. is in the Health Care sector."}}},
{"id":"n-f72947c8","guard":[["hasAny",["company","disney","sector","walt"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Walt Disney Company (The) in":"Walt Disney Company (The) is in the Communication Services sector."}}},
{"id":"n-f76899f3","guard":[["has","kimberlyclark"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the industry sector of Kimberly-Clark":"Kimberly-Clark is in the Consumer Staples sector."}}},
{"id":"n-fa3977dd","guard":[["hasAny",["corpay","sector"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which sector is Corpay in":"Corpay is in the Financials sector."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the industry sector of Hilton Worldwide","expect":{"contains":["Consumer Discretionary"],"notRefusal":true}},{"q":"what GICS sector does Hershey Company (The) belong to","expect":{"contains":["Consumer Staples"],"notRefusal":true}},{"q":"which sector is Jabil in","expect":{"contains":["Information Technology"],"notRefusal":true}},{"q":"name the industry sector of Motorola Solutions","expect":{"contains":["Information Technology"],"notRefusal":true}},{"q":"which sector is Walt Disney Company (The) in","expect":{"contains":["Communication Services"],"notRefusal":true}},{"q":"name the industry sector of FactSet","expect":{"contains":["Financials"],"notRefusal":true}},{"q":"name the industry sector of News Corp (Class B)","expect":{"contains":["Communication Services"],"notRefusal":true}},{"q":"what GICS sector does TransDigm Group belong to","expect":{"contains":["Industrials"],"notRefusal":true}},{"q":"name the industry sector of SBA Communications","expect":{"contains":["Real Estate"],"notRefusal":true}},{"q":"what GICS sector does TKO Group Holdings belong to","expect":{"contains":["Communication Services"],"notRefusal":true}},{"q":"what GICS sector does Brown & Brown belong to","expect":{"contains":["Financials"],"notRefusal":true}},{"q":"which sector is Assurant in","expect":{"contains":["Financials"],"notRefusal":true}},{"q":"which sector is RTX Corporation in","expect":{"contains":["Industrials"],"notRefusal":true}},{"q":"which sector is Newmont in","expect":{"contains":["Materials"],"notRefusal":true}},{"q":"which sector is Huntington Bancshares in","expect":{"contains":["Financials"],"notRefusal":true}},{"q":"what GICS sector does Principal Financial Group belong to","expect":{"contains":["Financials"],"notRefusal":true}},{"q":"what GICS sector does Targa Resources belong to","expect":{"contains":["Energy"],"notRefusal":true}},{"q":"which sector is Merck & Co. in","expect":{"contains":["Health Care"],"notRefusal":true}},{"q":"which sector is Interactive Brokers in","expect":{"contains":["Financials"],"notRefusal":true}},{"q":"which sector is Leidos in","expect":{"contains":["Industrials"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
