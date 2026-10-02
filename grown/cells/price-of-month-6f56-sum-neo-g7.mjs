// price-of-month-6f56-sum-neo-g7.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"price-of-month-6f56-sum-neo-g7","class":"price-of-month-6f56-sum","generation":7,"lane":"neo","grownFrom":["what is the sum of the price of 1998-06 and 2006-08","the price of 2024-11 plus the price of 2006-09 makes what","what is the sum of the price of 2020-10 and 2020-09","what is the sum of the price of 2013-09 and 2002-05","the price of 2008-12 plus the price of 1999-04 makes what","add the price of 2006-06 to the price of 2010-04","the price of 1997-11 plus the price of 2016-03 makes what","what is the sum of the price of 1997-03 and 1999-02","the price of 2011-12 plus the price of 2019-06 makes what","the price of 2012-10 plus the price of 2016-04 makes what","what is the sum of the price of 2009-02 and 2026-07","the price of 2013-06 plus the price of 2019-07 makes what","add the price of 2000-05 to the price of 2013-06","what is the sum of the price of 2021-06 and 2005-05","the price of 2013-05 plus the price of 2026-01 makes what","add the price of 1997-07 to the price of 1997-12","add the price of 2017-10 to the price of 2008-07","the price of 1997-12 plus the price of 2009-04 makes what","add the price of 2003-01 to the price of 2011-09","the price of 2005-12 plus the price of 2012-03 makes what"],"version":1});

// <KERNEL>
const KERNEL_VERSION = 1;
const MAX_DEPTH = 64;
const MAX_LIST = 10000;
const MAX_BITS = 65536;
const MAX_TEXT = 100000;
const SAFE = 9007199254740991n;
const NEAR = 0.5;
const TYPES = Object.freeze(['text', 'num', 'nums', 'str', 'strs', 'bool', 'kv', 'tpl']);
const FAMILIES = Object.freeze(['sense', 'transform', 'aggregate', 'compare', 'compute', 'memory', 'know', 'route', 'iterate', 'render']);
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
const CHECK = Object.freeze({
  text: (v) => typeof v === 'string', str: (v) => typeof v === 'string', num: isNum, bool: (v) => typeof v === 'boolean',
  nums: (v) => Array.isArray(v) && v.every(isNum), strs: (v) => Array.isArray(v) && v.every((s) => typeof s === 'string'),
  kv: isKv, tpl: isTpl,
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
    KNOW.set(p.id, { id: p.id, cols: p.columns.slice(), col: new Map(p.columns.map((c, j) => [c, j])), rows: clean, keys: new Map(), grams: new Map() });
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
  return Object.freeze(out);
}

// ---- evaluation: nodes, types, shape
function isLit(node) { return isKv(node) && Object.hasOwn(node, 'lit'); }
/** The argument types a node of this primitive carries (its in list without the implicit "text"), or null. */
function argTypes(name) { return typeof name === 'string' && Object.hasOwn(ARGS, name) ? ARGS[name].slice() : null; }
/** Evaluate a node on a prompt and a mem: a value of the node's type, or null (a miss, never a guess). */
function evalNode(node, q, mem, depth = 0) {
  try {
    if (depth > MAX_DEPTH) return null;
    if (isLit(node)) return clean(node.lit);
    if (!Array.isArray(node) || typeof node[0] !== 'string' || !Object.hasOwn(PRIMS, node[0])) return null;
    const p = PRIMS[node[0]], ts = ARGS[node[0]], n = node.length - 1;
    if (n < ts.length || (n > ts.length && !p.rest)) return null;
    const args = [];
    for (let i = 1; i <= n; i++) { const v = evalNode(node[i], q, mem, depth + 1); if (v === null && !p.lazy) return null; args.push(v); }
    return p.fn(args, { q: typeof q === 'string' ? q : '', mem: isKv(mem) ? mem : null });
  } catch { return null; }
}
/** Whether a node is well typed and yields the wanted type (any type when want is undefined). */
function wellTyped(node, want, depth = 0) {
  if (depth > MAX_DEPTH) return false;
  if (isLit(node)) return typeof want === 'string' && want !== 'text' && Object.hasOwn(CHECK, want) && CHECK[want](clean(node.lit));
  if (!Array.isArray(node) || typeof node[0] !== 'string' || !Object.hasOwn(PRIMS, node[0])) return false;
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
  if (node.length === 1) return ['sense', 'memory'].includes(PRIMS[node[0]]?.family);
  return node.slice(1).every((x) => leavesOk(x, depth + 1));
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
  else if (PRIMS[c.pyramid[0]].family !== 'render') errors.push('the apex is not a render primitive');
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
knowLoad([{"id":"fr-natural-gas-monthly-984ace","columns":["month","price"],"n":356,"cols":[{"f":"01997-01|62|63|64|65|66|67|68|69|510|61|62|38-01|62|63|64|65|66|67|68|69|510|61|62|39-01|62|63|64|65|66|67|68|69|510|61|62|02000-01|62|63|64|65|66|67|68|69|510|61|62|31-01|62|63|64|65|66|67|68|69|510|61|62|32-01|62|63|64|65|66|67|68|69|510|61|62|33-01|62|63|64|65|66|67|68|69|510|61|62|34-01|62|63|64|65|66|67|68|69|510|61|62|35-01|62|63|64|65|66|67|68|69|510|61|62|36-01|62|63|64|65|66|67|68|69|510|61|62|37-01|62|63|64|65|66|67|68|69|510|61|62|38-01|62|63|64|65|66|67|68|69|510|61|62|39-01|62|63|64|65|66|67|68|69|510|61|62|210-01|62|63|64|65|66|67|68|69|510|61|62|31-01|62|63|64|65|66|67|68|69|510|61|62|32-01|62|63|64|65|66|67|68|69|510|61|62|33-01|62|63|64|65|66|67|68|69|510|61|62|34-01|62|63|64|65|66|67|68|69|510|61|62|35-01|62|63|64|65|66|67|68|69|510|61|62|36-01|62|63|64|65|66|67|68|69|510|61|62|37-01|62|63|64|65|66|67|68|69|510|61|62|38-01|62|63|64|65|66|67|68|69|510|61|62|39-01|62|63|64|65|66|67|68|69|510|61|62|220-01|62|63|64|65|66|67|68|69|510|61|62|31-01|62|63|64|65|66|67|68|69|510|61|62|32-01|62|63|64|65|66|67|68|69|510|61|62|33-01|62|63|64|65|66|67|68|69|510|61|62|34-01|62|63|64|65|66|67|68|69|510|61|62|35-01|62|63|64|65|66|67|68|69|510|61|62|36-01|62|63|64|65|66|67|68","sep":"|"},{"s":"3.45|2.15|1.89|2.03|2.25|2.2|2.19|2.49|2.88|3.07|3.01|2.35|2.09|2.23|2.24|2.43|2.14|2.17|2.17|1.85|2.02|1.91|2.12|1.72|1.85|1.77|1.79|2.15|2.26|2.3|2.31|2.8|2.55|2.73|2.37|2.36|2.42|2.66|2.79|3.04|3.59|4.29|3.99|4.43|5.06|5.02|5.52|8.9|8.17|5.61|5.23|5.19|4.19|3.72|3.11|2.97|2.19|2.46|2.34|2.3|2.32|2.32|3.03|3.43|3.5|3.26|2.99|3.09|3.55|4.13|4.04|4.74|5.43|7.71|5.93|5.26|5.81|5.82|5.03|4.99|4.62|4.63|4.47|6.13|6.14|5.37|5.39|5.71|6.33|6.27|5.93|5.41|5.15|6.35|6.17|6.58|6.15|6.14|6.96|7.16|6.47|7.18|7.63|9.53|11.75|13.42|10.3|13.05|8.69|7.54|6.89|7.16|6.25|6.21|6.17|7.14|4.9|5.85|7.41|6.73|6.55|8|7.11|7.6|7.64|7.35|6.22|6.22|6.08|6.74|7.1|7.11|7.99|8.54|9.41|10.18|11.27|12.69|11.09|8.26|7.67|6.74|6.68|5.82|5.24|4.52|3.96|3.5|3.83|3.8|3.38|3.14|2.99|4.01|3.66|5.35|5.83|5.32|4.29|4.03|4.14|4.8|4.63|4.32|3.89|3.43|3.71|4.25|4.49|4.09|3.97|4.24|4.31|4.54|4.42|4.06|3.9|3.57|3.24|3.17|2.67|2.51|2.17|1.95|2.43|2.46|2.95|2.84|2.85|3.32|3.54|3.34|3.33|3.33|3.81|4.17|4.04|3.83|3.62|3.43|3.62|3.68|3.64|4.24|4.71|6|4.9|4.66|4.58|4.59|4.05|3.91|3.92|3.78|4.12|3.48|2.99|2.87|2.83|2.61|2.85|2.78|2.84|2.77|2.66|2.34|2.09|1.93|2.28|1.99|1.73|1.92|1.92|2.59|2.82|2.82|2.99|2.98|2.55|3.59|3.3|2.85|2.88|3.1|3.15|2.98|2.98|2.9|2.98|2.88|3.01|2.82|3.87|2.67|2.69|2.8|2.8|2.97|2.83|2.96|3|3.28|4.09|4.04|3.11|2.69|2.95|2.65|2.64|2.4|2.37|2.22|2.56|2.33|2.65|2.22|2.02|1.91|1.79|1.74|1.75|1.63|1.76|2.3|1.92|2.39|2.61|2.58|2.71|5.35|2.62|2.66|2.91|3.26|3.84|4.07|5.16|5.51|5.05|3.76|4.38|4.69|4.9|6.6|8.14|7.7|7.28|8.81|7.88|5.66|5.45|5.53|3.27|2.38|2.31|2.16|2.15|2.18|2.55|2.58|2.64|2.98|2.71|2.52|3.18|1.72|1.49|1.6|2.12|2.54|2.07|1.99|2.28|2.2|2.12|3.01|4.13|4.19|4.12|3.42|3.12|3.02|3.2|2.91|2.97|3.19|3.79|4.26|7.72|3.62|3.04|2.77|2.94|3.15|2.89|2.78","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-0df0a2f7","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 1998-06 and 2006-08":"The price of 1998-06 (2.17) plus that of 2006-08 (7.14) is 9.31.","the price of 2024-11 plus the price of 2006-09 makes what":"The price of 2024-11 (2.12) plus that of 2006-09 (4.9) is 7.02.","what is the sum of the price of 2020-10 and 2020-09":"The price of 2020-10 (2.39) plus that of 2020-09 (1.92) is 4.31.","what is the sum of the price of 2013-09 and 2002-05":"The price of 2013-09 (3.62) plus that of 2002-05 (3.5) is 7.12.","the price of 2008-12 plus the price of 1999-04 makes what":"The price of 2008-12 (5.82) plus that of 1999-04 (2.15) is 7.97.","add the price of 2006-06 to the price of 2010-04":"The price of 2006-06 (6.21) plus that of 2010-04 (4.03) is 10.24.","the price of 1997-11 plus the price of 2016-03 makes what":"The price of 1997-11 (3.01) plus that of 2016-03 (1.73) is 4.74.","what is the sum of the price of 1997-03 and 1999-02":"The price of 1997-03 (1.89) plus that of 1999-02 (1.77) is 3.66.","the price of 2011-12 plus the price of 2019-06 makes what":"The price of 2011-12 (3.17) plus that of 2019-06 (2.4) is 5.57.","the price of 2012-10 plus the price of 2016-04 makes what":"The price of 2012-10 (3.32) plus that of 2016-04 (1.92) is 5.24.","what is the sum of the price of 2009-02 and 2026-07":"The price of 2009-02 (4.52) plus that of 2026-07 (2.89) is 7.41.","the price of 2013-06 plus the price of 2019-07 makes what":"The price of 2013-06 (3.83) plus that of 2019-07 (2.37) is 6.2.","add the price of 2000-05 to the price of 2013-06":"The price of 2000-05 (3.59) plus that of 2013-06 (3.83) is 7.42.","what is the sum of the price of 2021-06 and 2005-05":"The price of 2021-06 (3.26) plus that of 2005-05 (6.47) is 9.73.","the price of 2013-05 plus the price of 2026-01 makes what":"The price of 2013-05 (4.04) plus that of 2026-01 (7.72) is 11.76.","add the price of 1997-07 to the price of 1997-12":"The price of 1997-07 (2.19) plus that of 1997-12 (2.35) is 4.54.","add the price of 2017-10 to the price of 2008-07":"The price of 2017-10 (2.88) plus that of 2008-07 (11.09) is 13.97.","the price of 1997-12 plus the price of 2009-04 makes what":"The price of 1997-12 (2.35) plus that of 2009-04 (3.5) is 5.85.","add the price of 2003-01 to the price of 2011-09":"The price of 2003-01 (5.43) plus that of 2011-09 (3.9) is 9.33.","the price of 2005-12 plus the price of 2012-03 makes what":"The price of 2005-12 (13.05) plus that of 2012-03 (2.17) is 15.22.","add the price of 2015-02 to the price of 2008-06":"The price of 2015-02 (2.87) plus that of 2008-06 (12.69) is 15.56.","what is the sum of the price of 2007-09 and 2012-05":"The price of 2007-09 (6.08) plus that of 2012-05 (2.43) is 8.51.","the price of 2011-09 plus the price of 2019-11 makes what":"The price of 2011-09 (3.9) plus that of 2019-11 (2.65) is 6.55.","add the price of 2020-09 to the price of 2011-04":"The price of 2020-09 (1.92) plus that of 2011-04 (4.24) is 6.16.","add the price of 2003-05 to the price of 2011-05":"The price of 2003-05 (5.81) plus that of 2011-05 (4.31) is 10.12.","the price of 2008-07 plus the price of 1997-03 makes what":"The price of 2008-07 (11.09) plus that of 1997-03 (1.89) is 12.98.","what is the sum of the price of 2016-09 and 2007-10":"The price of 2016-09 (2.99) plus that of 2007-10 (6.74) is 9.73.","add the price of 1998-05 to the price of 2007-05":"The price of 1998-05 (2.14) plus that of 2007-05 (7.64) is 9.78.","what is the sum of the price of 2017-01 and 2021-08":"The price of 2017-01 (3.3) plus that of 2021-08 (4.07) is 7.37.","what is the sum of the price of 2016-03 and 1997-06":"The price of 2016-03 (1.73) plus that of 1997-06 (2.2) is 3.93.","what is the sum of the price of 2021-11 and 2003-01":"The price of 2021-11 (5.05) plus that of 2003-01 (5.43) is 10.48.","add the price of 2026-07 to the price of 2013-05":"The price of 2026-07 (2.89) plus that of 2013-05 (4.04) is 6.93.","what is the sum of the price of 2016-04 and 2012-09":"The price of 2016-04 (1.92) plus that of 2012-09 (2.85) is 4.77.","what is the sum of the price of 2019-11 and 2006-06":"The price of 2019-11 (2.65) plus that of 2006-06 (6.21) is 8.86.","add the price of 2007-10 to the price of 1997-11":"The price of 2007-10 (6.74) plus that of 1997-11 (3.01) is 9.75.","the price of 2007-05 plus the price of 2016-02 makes what":"The price of 2007-05 (7.64) plus that of 2016-02 (1.99) is 9.63.","what is the sum of the price of 2007-01 and 2020-02":"The price of 2007-01 (6.55) plus that of 2020-02 (1.91) is 8.46.","the price of 2011-06 plus the price of 2015-06 makes what":"The price of 2011-06 (4.54) plus that of 2015-06 (2.78) is 7.32.","what is the sum of the price of 2016-02 and 2000-05":"The price of 2016-02 (1.99) plus that of 2000-05 (3.59) is 5.58.","the price of 2024-07 plus the price of 2007-09 makes what":"The price of 2024-07 (2.07) plus that of 2007-09 (6.08) is 8.15.","add the price of 2013-11 to the price of 2007-03":"The price of 2013-11 (3.64) plus that of 2007-03 (7.11) is 10.75.","the price of 2026-08 plus the price of 2015-12 makes what":"The price of 2026-08 (2.78) plus that of 2015-12 (1.93) is 4.71.","the price of 2010-04 plus the price of 2009-02 makes what":"The price of 2010-04 (4.03) plus that of 2009-02 (4.52) is 8.55.","the price of 2001-06 plus the price of 1998-06 makes what":"The price of 2001-06 (3.72) plus that of 1998-06 (2.17) is 5.89.","the price of 2007-11 plus the price of 2020-08 makes what":"The price of 2007-11 (7.1) plus that of 2020-08 (2.3) is 9.4.","the price of 2007-03 plus the price of 2014-02 makes what":"The price of 2007-03 (7.11) plus that of 2014-02 (6) is 13.11.","what is the sum of the price of 2000-07 and 2017-10":"The price of 2000-07 (3.99) plus that of 2017-10 (2.88) is 6.87.","what is the sum of the price of 2001-08 and 2000-03":"The price of 2001-08 (2.97) plus that of 2000-03 (2.79) is 5.76.","what is the sum of the price of 2009-04 and 2017-11":"The price of 2009-04 (3.5) plus that of 2017-11 (3.01) is 6.51.","what is the sum of the price of 2020-08 and 1998-05":"The price of 2020-08 (2.3) plus that of 1998-05 (2.14) is 4.44.","what is the sum of the price of 2026-01 and 2013-11":"The price of 2026-01 (7.72) plus that of 2013-11 (3.64) is 11.36.","add the price of 2014-08 to the price of 2005-07":"The price of 2014-08 (3.91) plus that of 2005-07 (7.63) is 11.54.","add the price of 2010-01 to the price of 2011-12":"The price of 2010-01 (5.83) plus that of 2011-12 (3.17) is 9.","what is the sum of the price of 2019-07 and 2008-04":"The price of 2019-07 (2.37) plus that of 2008-04 (10.18) is 12.55.","add the price of 2017-12 to the price of 2024-07":"The price of 2017-12 (2.82) plus that of 2024-07 (2.07) is 4.89.","the price of 2003-02 plus the price of 2018-02 makes what":"The price of 2003-02 (7.71) plus that of 2018-02 (2.67) is 10.38.","add the price of 2010-02 to the price of 2001-06":"The price of 2010-02 (5.32) plus that of 2001-06 (3.72) is 9.04.","what is the sum of the price of 2000-09 and 2003-05":"The price of 2000-09 (5.06) plus that of 2003-05 (5.81) is 10.87.","add the price of 2021-08 to the price of 2019-09":"The price of 2021-08 (4.07) plus that of 2019-09 (2.56) is 6.63.","add the price of 2017-11 to the price of 2009-09":"The price of 2017-11 (3.01) plus that of 2009-09 (2.99) is 6.","the price of 2007-08 plus the price of 2001-08 makes what":"The price of 2007-08 (6.22) plus that of 2001-08 (2.97) is 9.19.","add the price of 2020-02 to the price of 2005-12":"The price of 2020-02 (1.91) plus that of 2005-12 (13.05) is 14.96.","add the price of 2006-08 to the price of 2007-08":"The price of 2006-08 (7.14) plus that of 2007-08 (6.22) is 13.36.","what is the sum of the price of 2015-12 and 2010-02":"The price of 2015-12 (1.93) plus that of 2010-02 (5.32) is 7.25.","add the price of 2016-06 to the price of 2025-05":"The price of 2016-06 (2.59) plus that of 2025-05 (3.12) is 5.71.","what is the sum of the price of 2005-04 and 2006-11":"The price of 2005-04 (7.16) plus that of 2006-11 (7.41) is 14.57.","add the price of 2002-05 to the price of 2008-12":"The price of 2002-05 (3.5) plus that of 2008-12 (5.82) is 9.32.","what is the sum of the price of 2006-09 and 2017-12":"The price of 2006-09 (4.9) plus that of 2017-12 (2.82) is 7.72.","what is the sum of the price of 2020-12 and 2010-01":"The price of 2020-12 (2.58) plus that of 2010-01 (5.83) is 8.41.","add the price of 1997-06 to the price of 2012-10":"The price of 1997-06 (2.2) plus that of 2012-10 (3.32) is 5.52.","add the price of 2008-04 to the price of 2012-12":"The price of 2008-04 (10.18) plus that of 2012-12 (3.34) is 13.52.","what is the sum of the price of 2015-06 and 2015-02":"The price of 2015-06 (2.78) plus that of 2015-02 (2.87) is 5.65.","the price of 2011-05 plus the price of 2017-01 makes what":"The price of 2011-05 (4.31) plus that of 2017-01 (3.3) is 7.61.","add the price of 2012-09 to the price of 2003-02":"The price of 2012-09 (2.85) plus that of 2003-02 (7.71) is 10.56.","what is the sum of the price of 2018-02 and 2009-10":"The price of 2018-02 (2.67) plus that of 2009-10 (4.01) is 6.68.","add the price of 2012-05 to the price of 2018-10":"The price of 2012-05 (2.43) plus that of 2018-10 (3.28) is 5.71.","the price of 2008-06 plus the price of 2021-11 makes what":"The price of 2008-06 (12.69) plus that of 2021-11 (5.05) is 17.74.","the price of 2009-09 plus the price of 1999-12 makes what":"The price of 2009-09 (2.99) plus that of 1999-12 (2.36) is 5.35.","add the price of 2000-03 to the price of 2014-10":"The price of 2000-03 (2.79) plus that of 2014-10 (3.78) is 6.57.","add the price of 1999-02 to the price of 2024-11":"The price of 1999-02 (1.77) plus that of 2024-11 (2.12) is 3.89.","what is the sum of the price of 2012-03 and 2000-10":"The price of 2012-03 (2.17) plus that of 2000-10 (5.02) is 7.19.","the price of 2014-10 plus the price of 2000-07 makes what":"The price of 2014-10 (3.78) plus that of 2000-07 (3.99) is 7.77.","add the price of 2007-04 to the price of 2026-08":"The price of 2007-04 (7.6) plus that of 2026-08 (2.78) is 10.38.","add the price of 2019-05 to the price of 2000-11":"The price of 2019-05 (2.64) plus that of 2000-11 (5.52) is 8.16.","what is the sum of the price of 2019-06 and 2014-08":"The price of 2019-06 (2.4) plus that of 2014-08 (3.91) is 6.31.","what is the sum of the price of 1999-04 and 2016-06":"The price of 1999-04 (2.15) plus that of 2016-06 (2.59) is 4.74.","the price of 2025-05 plus the price of 2004-11 makes what":"The price of 2025-05 (3.12) plus that of 2004-11 (6.17) is 9.29.","the price of 2018-10 plus the price of 2007-01 makes what":"The price of 2018-10 (3.28) plus that of 2007-01 (6.55) is 9.83.","the price of 2019-02 plus the price of 2020-12 makes what":"The price of 2019-02 (2.69) plus that of 2020-12 (2.58) is 5.27.","what is the sum of the price of 2004-11 and 2019-05":"The price of 2004-11 (6.17) plus that of 2019-05 (2.64) is 8.81.","the price of 2005-07 plus the price of 2021-06 makes what":"The price of 2005-07 (7.63) plus that of 2021-06 (3.26) is 10.89.","what is the sum of the price of 1999-12 and 2007-04":"The price of 1999-12 (2.36) plus that of 2007-04 (7.6) is 9.96.","the price of 2000-11 plus the price of 2016-09 makes what":"The price of 2000-11 (5.52) plus that of 2016-09 (2.99) is 8.51.","the price of 2019-09 plus the price of 2020-10 makes what":"The price of 2019-09 (2.56) plus that of 2020-10 (2.39) is 4.95.","the price of 2011-04 plus the price of 2013-09 makes what":"The price of 2011-04 (4.24) plus that of 2013-09 (3.62) is 7.86.","add the price of 2009-10 to the price of 2011-06":"The price of 2009-10 (4.01) plus that of 2011-06 (4.54) is 8.55.","what is the sum of the price of 2014-02 and 1997-07":"The price of 2014-02 (6) plus that of 1997-07 (2.19) is 8.19.","the price of 2012-12 plus the price of 2000-09 makes what":"The price of 2012-12 (3.34) plus that of 2000-09 (5.06) is 8.4.","add the price of 2006-11 to the price of 2007-11":"The price of 2006-11 (7.41) plus that of 2007-11 (7.1) is 14.51.","add the price of 2000-10 to the price of 2019-02":"The price of 2000-10 (5.02) plus that of 2019-02 (2.69) is 7.71."}}},
{"id":"n-08c6311f","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the price of 1998-06 and 2006-08":"The price of 1998-06 (2.17) plus that of 2006-08 (7.14) is 9.31.","2024-11 plus the price of 2006-09 makes what":"The price of 2024-11 (2.12) plus that of 2006-09 (4.9) is 7.02.","the price of 2020-10 and 2020-09":"The price of 2020-10 (2.39) plus that of 2020-09 (1.92) is 4.31.","the price of 2013-09 and 2002-05":"The price of 2013-09 (3.62) plus that of 2002-05 (3.5) is 7.12.","2008-12 plus the price of 1999-04 makes what":"The price of 2008-12 (5.82) plus that of 1999-04 (2.15) is 7.97.","2006-06 to the price of 2010-04":"The price of 2006-06 (6.21) plus that of 2010-04 (4.03) is 10.24.","1997-11 plus the price of 2016-03 makes what":"The price of 1997-11 (3.01) plus that of 2016-03 (1.73) is 4.74.","the price of 1997-03 and 1999-02":"The price of 1997-03 (1.89) plus that of 1999-02 (1.77) is 3.66.","2011-12 plus the price of 2019-06 makes what":"The price of 2011-12 (3.17) plus that of 2019-06 (2.4) is 5.57.","2012-10 plus the price of 2016-04 makes what":"The price of 2012-10 (3.32) plus that of 2016-04 (1.92) is 5.24.","the price of 2009-02 and 2026-07":"The price of 2009-02 (4.52) plus that of 2026-07 (2.89) is 7.41.","2013-06 plus the price of 2019-07 makes what":"The price of 2013-06 (3.83) plus that of 2019-07 (2.37) is 6.2.","2000-05 to the price of 2013-06":"The price of 2000-05 (3.59) plus that of 2013-06 (3.83) is 7.42.","the price of 2021-06 and 2005-05":"The price of 2021-06 (3.26) plus that of 2005-05 (6.47) is 9.73.","2013-05 plus the price of 2026-01 makes what":"The price of 2013-05 (4.04) plus that of 2026-01 (7.72) is 11.76.","1997-07 to the price of 1997-12":"The price of 1997-07 (2.19) plus that of 1997-12 (2.35) is 4.54.","2017-10 to the price of 2008-07":"The price of 2017-10 (2.88) plus that of 2008-07 (11.09) is 13.97.","1997-12 plus the price of 2009-04 makes what":"The price of 1997-12 (2.35) plus that of 2009-04 (3.5) is 5.85.","2003-01 to the price of 2011-09":"The price of 2003-01 (5.43) plus that of 2011-09 (3.9) is 9.33.","2005-12 plus the price of 2012-03 makes what":"The price of 2005-12 (13.05) plus that of 2012-03 (2.17) is 15.22.","2015-02 to the price of 2008-06":"The price of 2015-02 (2.87) plus that of 2008-06 (12.69) is 15.56.","the price of 2007-09 and 2012-05":"The price of 2007-09 (6.08) plus that of 2012-05 (2.43) is 8.51.","2011-09 plus the price of 2019-11 makes what":"The price of 2011-09 (3.9) plus that of 2019-11 (2.65) is 6.55.","2020-09 to the price of 2011-04":"The price of 2020-09 (1.92) plus that of 2011-04 (4.24) is 6.16.","2003-05 to the price of 2011-05":"The price of 2003-05 (5.81) plus that of 2011-05 (4.31) is 10.12.","2008-07 plus the price of 1997-03 makes what":"The price of 2008-07 (11.09) plus that of 1997-03 (1.89) is 12.98.","the price of 2016-09 and 2007-10":"The price of 2016-09 (2.99) plus that of 2007-10 (6.74) is 9.73.","1998-05 to the price of 2007-05":"The price of 1998-05 (2.14) plus that of 2007-05 (7.64) is 9.78.","the price of 2017-01 and 2021-08":"The price of 2017-01 (3.3) plus that of 2021-08 (4.07) is 7.37.","the price of 2016-03 and 1997-06":"The price of 2016-03 (1.73) plus that of 1997-06 (2.2) is 3.93.","the price of 2021-11 and 2003-01":"The price of 2021-11 (5.05) plus that of 2003-01 (5.43) is 10.48.","2026-07 to the price of 2013-05":"The price of 2026-07 (2.89) plus that of 2013-05 (4.04) is 6.93.","the price of 2016-04 and 2012-09":"The price of 2016-04 (1.92) plus that of 2012-09 (2.85) is 4.77.","the price of 2019-11 and 2006-06":"The price of 2019-11 (2.65) plus that of 2006-06 (6.21) is 8.86.","2007-10 to the price of 1997-11":"The price of 2007-10 (6.74) plus that of 1997-11 (3.01) is 9.75.","2007-05 plus the price of 2016-02 makes what":"The price of 2007-05 (7.64) plus that of 2016-02 (1.99) is 9.63.","the price of 2007-01 and 2020-02":"The price of 2007-01 (6.55) plus that of 2020-02 (1.91) is 8.46.","2011-06 plus the price of 2015-06 makes what":"The price of 2011-06 (4.54) plus that of 2015-06 (2.78) is 7.32.","the price of 2016-02 and 2000-05":"The price of 2016-02 (1.99) plus that of 2000-05 (3.59) is 5.58.","2024-07 plus the price of 2007-09 makes what":"The price of 2024-07 (2.07) plus that of 2007-09 (6.08) is 8.15.","2013-11 to the price of 2007-03":"The price of 2013-11 (3.64) plus that of 2007-03 (7.11) is 10.75.","2026-08 plus the price of 2015-12 makes what":"The price of 2026-08 (2.78) plus that of 2015-12 (1.93) is 4.71.","2010-04 plus the price of 2009-02 makes what":"The price of 2010-04 (4.03) plus that of 2009-02 (4.52) is 8.55.","2001-06 plus the price of 1998-06 makes what":"The price of 2001-06 (3.72) plus that of 1998-06 (2.17) is 5.89.","2007-11 plus the price of 2020-08 makes what":"The price of 2007-11 (7.1) plus that of 2020-08 (2.3) is 9.4.","2007-03 plus the price of 2014-02 makes what":"The price of 2007-03 (7.11) plus that of 2014-02 (6) is 13.11.","the price of 2000-07 and 2017-10":"The price of 2000-07 (3.99) plus that of 2017-10 (2.88) is 6.87.","the price of 2001-08 and 2000-03":"The price of 2001-08 (2.97) plus that of 2000-03 (2.79) is 5.76.","the price of 2009-04 and 2017-11":"The price of 2009-04 (3.5) plus that of 2017-11 (3.01) is 6.51.","the price of 2020-08 and 1998-05":"The price of 2020-08 (2.3) plus that of 1998-05 (2.14) is 4.44.","the price of 2026-01 and 2013-11":"The price of 2026-01 (7.72) plus that of 2013-11 (3.64) is 11.36.","2014-08 to the price of 2005-07":"The price of 2014-08 (3.91) plus that of 2005-07 (7.63) is 11.54.","2010-01 to the price of 2011-12":"The price of 2010-01 (5.83) plus that of 2011-12 (3.17) is 9.","the price of 2019-07 and 2008-04":"The price of 2019-07 (2.37) plus that of 2008-04 (10.18) is 12.55.","2017-12 to the price of 2024-07":"The price of 2017-12 (2.82) plus that of 2024-07 (2.07) is 4.89.","2003-02 plus the price of 2018-02 makes what":"The price of 2003-02 (7.71) plus that of 2018-02 (2.67) is 10.38.","2010-02 to the price of 2001-06":"The price of 2010-02 (5.32) plus that of 2001-06 (3.72) is 9.04.","the price of 2000-09 and 2003-05":"The price of 2000-09 (5.06) plus that of 2003-05 (5.81) is 10.87.","2021-08 to the price of 2019-09":"The price of 2021-08 (4.07) plus that of 2019-09 (2.56) is 6.63.","2017-11 to the price of 2009-09":"The price of 2017-11 (3.01) plus that of 2009-09 (2.99) is 6.","2007-08 plus the price of 2001-08 makes what":"The price of 2007-08 (6.22) plus that of 2001-08 (2.97) is 9.19.","2020-02 to the price of 2005-12":"The price of 2020-02 (1.91) plus that of 2005-12 (13.05) is 14.96.","2006-08 to the price of 2007-08":"The price of 2006-08 (7.14) plus that of 2007-08 (6.22) is 13.36.","the price of 2015-12 and 2010-02":"The price of 2015-12 (1.93) plus that of 2010-02 (5.32) is 7.25.","2016-06 to the price of 2025-05":"The price of 2016-06 (2.59) plus that of 2025-05 (3.12) is 5.71.","the price of 2005-04 and 2006-11":"The price of 2005-04 (7.16) plus that of 2006-11 (7.41) is 14.57.","2002-05 to the price of 2008-12":"The price of 2002-05 (3.5) plus that of 2008-12 (5.82) is 9.32.","the price of 2006-09 and 2017-12":"The price of 2006-09 (4.9) plus that of 2017-12 (2.82) is 7.72.","the price of 2020-12 and 2010-01":"The price of 2020-12 (2.58) plus that of 2010-01 (5.83) is 8.41.","1997-06 to the price of 2012-10":"The price of 1997-06 (2.2) plus that of 2012-10 (3.32) is 5.52.","2008-04 to the price of 2012-12":"The price of 2008-04 (10.18) plus that of 2012-12 (3.34) is 13.52.","the price of 2015-06 and 2015-02":"The price of 2015-06 (2.78) plus that of 2015-02 (2.87) is 5.65.","2011-05 plus the price of 2017-01 makes what":"The price of 2011-05 (4.31) plus that of 2017-01 (3.3) is 7.61.","2012-09 to the price of 2003-02":"The price of 2012-09 (2.85) plus that of 2003-02 (7.71) is 10.56.","the price of 2018-02 and 2009-10":"The price of 2018-02 (2.67) plus that of 2009-10 (4.01) is 6.68.","2012-05 to the price of 2018-10":"The price of 2012-05 (2.43) plus that of 2018-10 (3.28) is 5.71.","2008-06 plus the price of 2021-11 makes what":"The price of 2008-06 (12.69) plus that of 2021-11 (5.05) is 17.74.","2009-09 plus the price of 1999-12 makes what":"The price of 2009-09 (2.99) plus that of 1999-12 (2.36) is 5.35.","2000-03 to the price of 2014-10":"The price of 2000-03 (2.79) plus that of 2014-10 (3.78) is 6.57.","1999-02 to the price of 2024-11":"The price of 1999-02 (1.77) plus that of 2024-11 (2.12) is 3.89.","the price of 2012-03 and 2000-10":"The price of 2012-03 (2.17) plus that of 2000-10 (5.02) is 7.19.","2014-10 plus the price of 2000-07 makes what":"The price of 2014-10 (3.78) plus that of 2000-07 (3.99) is 7.77.","2007-04 to the price of 2026-08":"The price of 2007-04 (7.6) plus that of 2026-08 (2.78) is 10.38.","2019-05 to the price of 2000-11":"The price of 2019-05 (2.64) plus that of 2000-11 (5.52) is 8.16.","the price of 2019-06 and 2014-08":"The price of 2019-06 (2.4) plus that of 2014-08 (3.91) is 6.31.","the price of 1999-04 and 2016-06":"The price of 1999-04 (2.15) plus that of 2016-06 (2.59) is 4.74.","2025-05 plus the price of 2004-11 makes what":"The price of 2025-05 (3.12) plus that of 2004-11 (6.17) is 9.29.","2018-10 plus the price of 2007-01 makes what":"The price of 2018-10 (3.28) plus that of 2007-01 (6.55) is 9.83.","2019-02 plus the price of 2020-12 makes what":"The price of 2019-02 (2.69) plus that of 2020-12 (2.58) is 5.27.","the price of 2004-11 and 2019-05":"The price of 2004-11 (6.17) plus that of 2019-05 (2.64) is 8.81.","2005-07 plus the price of 2021-06 makes what":"The price of 2005-07 (7.63) plus that of 2021-06 (3.26) is 10.89.","the price of 1999-12 and 2007-04":"The price of 1999-12 (2.36) plus that of 2007-04 (7.6) is 9.96.","2000-11 plus the price of 2016-09 makes what":"The price of 2000-11 (5.52) plus that of 2016-09 (2.99) is 8.51.","2019-09 plus the price of 2020-10 makes what":"The price of 2019-09 (2.56) plus that of 2020-10 (2.39) is 4.95.","2011-04 plus the price of 2013-09 makes what":"The price of 2011-04 (4.24) plus that of 2013-09 (3.62) is 7.86.","2009-10 to the price of 2011-06":"The price of 2009-10 (4.01) plus that of 2011-06 (4.54) is 8.55.","the price of 2014-02 and 1997-07":"The price of 2014-02 (6) plus that of 1997-07 (2.19) is 8.19.","2012-12 plus the price of 2000-09 makes what":"The price of 2012-12 (3.34) plus that of 2000-09 (5.06) is 8.4.","2006-11 to the price of 2007-11":"The price of 2006-11 (7.41) plus that of 2007-11 (7.1) is 14.51.","2000-10 to the price of 2019-02":"The price of 2000-10 (5.02) plus that of 2019-02 (2.69) is 7.71."}}},
{"id":"n-1c3b5bf6","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"price"}]]],"mem":{"table":{"of 1998-06 and 2006-08":"The price of 1998-06 (2.17) plus that of 2006-08 (7.14) is 9.31.","of 2024-11 plus the price of 2006-09 makes what":"The price of 2024-11 (2.12) plus that of 2006-09 (4.9) is 7.02.","of 2020-10 and 2020-09":"The price of 2020-10 (2.39) plus that of 2020-09 (1.92) is 4.31.","of 2013-09 and 2002-05":"The price of 2013-09 (3.62) plus that of 2002-05 (3.5) is 7.12.","of 2008-12 plus the price of 1999-04 makes what":"The price of 2008-12 (5.82) plus that of 1999-04 (2.15) is 7.97.","of 2006-06 to the price of 2010-04":"The price of 2006-06 (6.21) plus that of 2010-04 (4.03) is 10.24.","of 1997-11 plus the price of 2016-03 makes what":"The price of 1997-11 (3.01) plus that of 2016-03 (1.73) is 4.74.","of 1997-03 and 1999-02":"The price of 1997-03 (1.89) plus that of 1999-02 (1.77) is 3.66.","of 2011-12 plus the price of 2019-06 makes what":"The price of 2011-12 (3.17) plus that of 2019-06 (2.4) is 5.57.","of 2012-10 plus the price of 2016-04 makes what":"The price of 2012-10 (3.32) plus that of 2016-04 (1.92) is 5.24.","of 2009-02 and 2026-07":"The price of 2009-02 (4.52) plus that of 2026-07 (2.89) is 7.41.","of 2013-06 plus the price of 2019-07 makes what":"The price of 2013-06 (3.83) plus that of 2019-07 (2.37) is 6.2.","of 2000-05 to the price of 2013-06":"The price of 2000-05 (3.59) plus that of 2013-06 (3.83) is 7.42.","of 2021-06 and 2005-05":"The price of 2021-06 (3.26) plus that of 2005-05 (6.47) is 9.73.","of 2013-05 plus the price of 2026-01 makes what":"The price of 2013-05 (4.04) plus that of 2026-01 (7.72) is 11.76.","of 1997-07 to the price of 1997-12":"The price of 1997-07 (2.19) plus that of 1997-12 (2.35) is 4.54.","of 2017-10 to the price of 2008-07":"The price of 2017-10 (2.88) plus that of 2008-07 (11.09) is 13.97.","of 1997-12 plus the price of 2009-04 makes what":"The price of 1997-12 (2.35) plus that of 2009-04 (3.5) is 5.85.","of 2003-01 to the price of 2011-09":"The price of 2003-01 (5.43) plus that of 2011-09 (3.9) is 9.33.","of 2005-12 plus the price of 2012-03 makes what":"The price of 2005-12 (13.05) plus that of 2012-03 (2.17) is 15.22.","of 2015-02 to the price of 2008-06":"The price of 2015-02 (2.87) plus that of 2008-06 (12.69) is 15.56.","of 2007-09 and 2012-05":"The price of 2007-09 (6.08) plus that of 2012-05 (2.43) is 8.51.","of 2011-09 plus the price of 2019-11 makes what":"The price of 2011-09 (3.9) plus that of 2019-11 (2.65) is 6.55.","of 2020-09 to the price of 2011-04":"The price of 2020-09 (1.92) plus that of 2011-04 (4.24) is 6.16.","of 2003-05 to the price of 2011-05":"The price of 2003-05 (5.81) plus that of 2011-05 (4.31) is 10.12.","of 2008-07 plus the price of 1997-03 makes what":"The price of 2008-07 (11.09) plus that of 1997-03 (1.89) is 12.98.","of 2016-09 and 2007-10":"The price of 2016-09 (2.99) plus that of 2007-10 (6.74) is 9.73.","of 1998-05 to the price of 2007-05":"The price of 1998-05 (2.14) plus that of 2007-05 (7.64) is 9.78.","of 2017-01 and 2021-08":"The price of 2017-01 (3.3) plus that of 2021-08 (4.07) is 7.37.","of 2016-03 and 1997-06":"The price of 2016-03 (1.73) plus that of 1997-06 (2.2) is 3.93.","of 2021-11 and 2003-01":"The price of 2021-11 (5.05) plus that of 2003-01 (5.43) is 10.48.","of 2026-07 to the price of 2013-05":"The price of 2026-07 (2.89) plus that of 2013-05 (4.04) is 6.93.","of 2016-04 and 2012-09":"The price of 2016-04 (1.92) plus that of 2012-09 (2.85) is 4.77.","of 2019-11 and 2006-06":"The price of 2019-11 (2.65) plus that of 2006-06 (6.21) is 8.86.","of 2007-10 to the price of 1997-11":"The price of 2007-10 (6.74) plus that of 1997-11 (3.01) is 9.75.","of 2007-05 plus the price of 2016-02 makes what":"The price of 2007-05 (7.64) plus that of 2016-02 (1.99) is 9.63.","of 2007-01 and 2020-02":"The price of 2007-01 (6.55) plus that of 2020-02 (1.91) is 8.46.","of 2011-06 plus the price of 2015-06 makes what":"The price of 2011-06 (4.54) plus that of 2015-06 (2.78) is 7.32.","of 2016-02 and 2000-05":"The price of 2016-02 (1.99) plus that of 2000-05 (3.59) is 5.58.","of 2024-07 plus the price of 2007-09 makes what":"The price of 2024-07 (2.07) plus that of 2007-09 (6.08) is 8.15.","of 2013-11 to the price of 2007-03":"The price of 2013-11 (3.64) plus that of 2007-03 (7.11) is 10.75.","of 2026-08 plus the price of 2015-12 makes what":"The price of 2026-08 (2.78) plus that of 2015-12 (1.93) is 4.71.","of 2010-04 plus the price of 2009-02 makes what":"The price of 2010-04 (4.03) plus that of 2009-02 (4.52) is 8.55.","of 2001-06 plus the price of 1998-06 makes what":"The price of 2001-06 (3.72) plus that of 1998-06 (2.17) is 5.89.","of 2007-11 plus the price of 2020-08 makes what":"The price of 2007-11 (7.1) plus that of 2020-08 (2.3) is 9.4.","of 2007-03 plus the price of 2014-02 makes what":"The price of 2007-03 (7.11) plus that of 2014-02 (6) is 13.11.","of 2000-07 and 2017-10":"The price of 2000-07 (3.99) plus that of 2017-10 (2.88) is 6.87.","of 2001-08 and 2000-03":"The price of 2001-08 (2.97) plus that of 2000-03 (2.79) is 5.76.","of 2009-04 and 2017-11":"The price of 2009-04 (3.5) plus that of 2017-11 (3.01) is 6.51.","of 2020-08 and 1998-05":"The price of 2020-08 (2.3) plus that of 1998-05 (2.14) is 4.44.","of 2026-01 and 2013-11":"The price of 2026-01 (7.72) plus that of 2013-11 (3.64) is 11.36.","of 2014-08 to the price of 2005-07":"The price of 2014-08 (3.91) plus that of 2005-07 (7.63) is 11.54.","of 2010-01 to the price of 2011-12":"The price of 2010-01 (5.83) plus that of 2011-12 (3.17) is 9.","of 2019-07 and 2008-04":"The price of 2019-07 (2.37) plus that of 2008-04 (10.18) is 12.55.","of 2017-12 to the price of 2024-07":"The price of 2017-12 (2.82) plus that of 2024-07 (2.07) is 4.89.","of 2003-02 plus the price of 2018-02 makes what":"The price of 2003-02 (7.71) plus that of 2018-02 (2.67) is 10.38.","of 2010-02 to the price of 2001-06":"The price of 2010-02 (5.32) plus that of 2001-06 (3.72) is 9.04.","of 2000-09 and 2003-05":"The price of 2000-09 (5.06) plus that of 2003-05 (5.81) is 10.87.","of 2021-08 to the price of 2019-09":"The price of 2021-08 (4.07) plus that of 2019-09 (2.56) is 6.63.","of 2017-11 to the price of 2009-09":"The price of 2017-11 (3.01) plus that of 2009-09 (2.99) is 6.","of 2007-08 plus the price of 2001-08 makes what":"The price of 2007-08 (6.22) plus that of 2001-08 (2.97) is 9.19.","of 2020-02 to the price of 2005-12":"The price of 2020-02 (1.91) plus that of 2005-12 (13.05) is 14.96.","of 2006-08 to the price of 2007-08":"The price of 2006-08 (7.14) plus that of 2007-08 (6.22) is 13.36.","of 2015-12 and 2010-02":"The price of 2015-12 (1.93) plus that of 2010-02 (5.32) is 7.25.","of 2016-06 to the price of 2025-05":"The price of 2016-06 (2.59) plus that of 2025-05 (3.12) is 5.71.","of 2005-04 and 2006-11":"The price of 2005-04 (7.16) plus that of 2006-11 (7.41) is 14.57.","of 2002-05 to the price of 2008-12":"The price of 2002-05 (3.5) plus that of 2008-12 (5.82) is 9.32.","of 2006-09 and 2017-12":"The price of 2006-09 (4.9) plus that of 2017-12 (2.82) is 7.72.","of 2020-12 and 2010-01":"The price of 2020-12 (2.58) plus that of 2010-01 (5.83) is 8.41.","of 1997-06 to the price of 2012-10":"The price of 1997-06 (2.2) plus that of 2012-10 (3.32) is 5.52.","of 2008-04 to the price of 2012-12":"The price of 2008-04 (10.18) plus that of 2012-12 (3.34) is 13.52.","of 2015-06 and 2015-02":"The price of 2015-06 (2.78) plus that of 2015-02 (2.87) is 5.65.","of 2011-05 plus the price of 2017-01 makes what":"The price of 2011-05 (4.31) plus that of 2017-01 (3.3) is 7.61.","of 2012-09 to the price of 2003-02":"The price of 2012-09 (2.85) plus that of 2003-02 (7.71) is 10.56.","of 2018-02 and 2009-10":"The price of 2018-02 (2.67) plus that of 2009-10 (4.01) is 6.68.","of 2012-05 to the price of 2018-10":"The price of 2012-05 (2.43) plus that of 2018-10 (3.28) is 5.71.","of 2008-06 plus the price of 2021-11 makes what":"The price of 2008-06 (12.69) plus that of 2021-11 (5.05) is 17.74.","of 2009-09 plus the price of 1999-12 makes what":"The price of 2009-09 (2.99) plus that of 1999-12 (2.36) is 5.35.","of 2000-03 to the price of 2014-10":"The price of 2000-03 (2.79) plus that of 2014-10 (3.78) is 6.57.","of 1999-02 to the price of 2024-11":"The price of 1999-02 (1.77) plus that of 2024-11 (2.12) is 3.89.","of 2012-03 and 2000-10":"The price of 2012-03 (2.17) plus that of 2000-10 (5.02) is 7.19.","of 2014-10 plus the price of 2000-07 makes what":"The price of 2014-10 (3.78) plus that of 2000-07 (3.99) is 7.77.","of 2007-04 to the price of 2026-08":"The price of 2007-04 (7.6) plus that of 2026-08 (2.78) is 10.38.","of 2019-05 to the price of 2000-11":"The price of 2019-05 (2.64) plus that of 2000-11 (5.52) is 8.16.","of 2019-06 and 2014-08":"The price of 2019-06 (2.4) plus that of 2014-08 (3.91) is 6.31.","of 1999-04 and 2016-06":"The price of 1999-04 (2.15) plus that of 2016-06 (2.59) is 4.74.","of 2025-05 plus the price of 2004-11 makes what":"The price of 2025-05 (3.12) plus that of 2004-11 (6.17) is 9.29.","of 2018-10 plus the price of 2007-01 makes what":"The price of 2018-10 (3.28) plus that of 2007-01 (6.55) is 9.83.","of 2019-02 plus the price of 2020-12 makes what":"The price of 2019-02 (2.69) plus that of 2020-12 (2.58) is 5.27.","of 2004-11 and 2019-05":"The price of 2004-11 (6.17) plus that of 2019-05 (2.64) is 8.81.","of 2005-07 plus the price of 2021-06 makes what":"The price of 2005-07 (7.63) plus that of 2021-06 (3.26) is 10.89.","of 1999-12 and 2007-04":"The price of 1999-12 (2.36) plus that of 2007-04 (7.6) is 9.96.","of 2000-11 plus the price of 2016-09 makes what":"The price of 2000-11 (5.52) plus that of 2016-09 (2.99) is 8.51.","of 2019-09 plus the price of 2020-10 makes what":"The price of 2019-09 (2.56) plus that of 2020-10 (2.39) is 4.95.","of 2011-04 plus the price of 2013-09 makes what":"The price of 2011-04 (4.24) plus that of 2013-09 (3.62) is 7.86.","of 2009-10 to the price of 2011-06":"The price of 2009-10 (4.01) plus that of 2011-06 (4.54) is 8.55.","of 2014-02 and 1997-07":"The price of 2014-02 (6) plus that of 1997-07 (2.19) is 8.19.","of 2012-12 plus the price of 2000-09 makes what":"The price of 2012-12 (3.34) plus that of 2000-09 (5.06) is 8.4.","of 2006-11 to the price of 2007-11":"The price of 2006-11 (7.41) plus that of 2007-11 (7.1) is 14.51.","of 2000-10 to the price of 2019-02":"The price of 2000-10 (5.02) plus that of 2019-02 (2.69) is 7.71."}}},
{"id":"n-538ce861","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the sum of the price of 1998-06 and 2006-08":"The price of 1998-06 (2.17) plus that of 2006-08 (7.14) is 9.31.","the sum of the price of 2020-10 and 2020-09":"The price of 2020-10 (2.39) plus that of 2020-09 (1.92) is 4.31.","the sum of the price of 2013-09 and 2002-05":"The price of 2013-09 (3.62) plus that of 2002-05 (3.5) is 7.12.","the sum of the price of 1997-03 and 1999-02":"The price of 1997-03 (1.89) plus that of 1999-02 (1.77) is 3.66.","the sum of the price of 2009-02 and 2026-07":"The price of 2009-02 (4.52) plus that of 2026-07 (2.89) is 7.41.","the sum of the price of 2021-06 and 2005-05":"The price of 2021-06 (3.26) plus that of 2005-05 (6.47) is 9.73.","the sum of the price of 2007-09 and 2012-05":"The price of 2007-09 (6.08) plus that of 2012-05 (2.43) is 8.51.","the sum of the price of 2016-09 and 2007-10":"The price of 2016-09 (2.99) plus that of 2007-10 (6.74) is 9.73.","the sum of the price of 2017-01 and 2021-08":"The price of 2017-01 (3.3) plus that of 2021-08 (4.07) is 7.37.","the sum of the price of 2016-03 and 1997-06":"The price of 2016-03 (1.73) plus that of 1997-06 (2.2) is 3.93.","the sum of the price of 2021-11 and 2003-01":"The price of 2021-11 (5.05) plus that of 2003-01 (5.43) is 10.48.","the sum of the price of 2016-04 and 2012-09":"The price of 2016-04 (1.92) plus that of 2012-09 (2.85) is 4.77.","the sum of the price of 2019-11 and 2006-06":"The price of 2019-11 (2.65) plus that of 2006-06 (6.21) is 8.86.","the sum of the price of 2007-01 and 2020-02":"The price of 2007-01 (6.55) plus that of 2020-02 (1.91) is 8.46.","the sum of the price of 2016-02 and 2000-05":"The price of 2016-02 (1.99) plus that of 2000-05 (3.59) is 5.58.","the sum of the price of 2000-07 and 2017-10":"The price of 2000-07 (3.99) plus that of 2017-10 (2.88) is 6.87.","the sum of the price of 2001-08 and 2000-03":"The price of 2001-08 (2.97) plus that of 2000-03 (2.79) is 5.76.","the sum of the price of 2009-04 and 2017-11":"The price of 2009-04 (3.5) plus that of 2017-11 (3.01) is 6.51.","the sum of the price of 2020-08 and 1998-05":"The price of 2020-08 (2.3) plus that of 1998-05 (2.14) is 4.44.","the sum of the price of 2026-01 and 2013-11":"The price of 2026-01 (7.72) plus that of 2013-11 (3.64) is 11.36.","the sum of the price of 2019-07 and 2008-04":"The price of 2019-07 (2.37) plus that of 2008-04 (10.18) is 12.55.","the sum of the price of 2000-09 and 2003-05":"The price of 2000-09 (5.06) plus that of 2003-05 (5.81) is 10.87.","the sum of the price of 2015-12 and 2010-02":"The price of 2015-12 (1.93) plus that of 2010-02 (5.32) is 7.25.","the sum of the price of 2005-04 and 2006-11":"The price of 2005-04 (7.16) plus that of 2006-11 (7.41) is 14.57.","the sum of the price of 2006-09 and 2017-12":"The price of 2006-09 (4.9) plus that of 2017-12 (2.82) is 7.72.","the sum of the price of 2020-12 and 2010-01":"The price of 2020-12 (2.58) plus that of 2010-01 (5.83) is 8.41.","the sum of the price of 2015-06 and 2015-02":"The price of 2015-06 (2.78) plus that of 2015-02 (2.87) is 5.65.","the sum of the price of 2018-02 and 2009-10":"The price of 2018-02 (2.67) plus that of 2009-10 (4.01) is 6.68.","the sum of the price of 2012-03 and 2000-10":"The price of 2012-03 (2.17) plus that of 2000-10 (5.02) is 7.19.","the sum of the price of 2019-06 and 2014-08":"The price of 2019-06 (2.4) plus that of 2014-08 (3.91) is 6.31.","the sum of the price of 1999-04 and 2016-06":"The price of 1999-04 (2.15) plus that of 2016-06 (2.59) is 4.74.","the sum of the price of 2004-11 and 2019-05":"The price of 2004-11 (6.17) plus that of 2019-05 (2.64) is 8.81.","the sum of the price of 1999-12 and 2007-04":"The price of 1999-12 (2.36) plus that of 2007-04 (7.6) is 9.96.","the sum of the price of 2014-02 and 1997-07":"The price of 2014-02 (6) plus that of 1997-07 (2.19) is 8.19."}}},
{"id":"n-8606b8ff","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-3ebbdd6d","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-46ce09ae","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-5de8a0f5","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["has","price"],["nums==",4]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-0677c694","guard":[["hasAny",["added to","delete","element","item number","more than","nth","plus","position","remove","strip out","without"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["sense.numeral"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-b6141eee","guard":[["hasAny",["added to","delete","element","item number","more than","nth","plus","position","remove","strip out","without"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-b711e164","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-c1be6a44","guard":[["hasAny",["added to","delete","element","item number","more than","nth","plus","position","remove","strip out","without"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-cfc77da9","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-02f729de","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position","separate by","split","split by"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["sense.numeral"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-22490dba","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position","separate by","split","split by"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["sense.numeral"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-35e42c1e","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position","separate by","split","split by"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-507eb032","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position","separate by","split","split by"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-9a8bd72b","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-9ce5c3c7","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-a0433a8f","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position","separate by","split","split by"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-b7979617","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-fe1db8d3","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-a2b422b1","guard":[["hasAny",["add","add the digits","added to","digit sum","element","item number","more than","nth","position","sum of the digits"]],["nums==",4],["has","price"]],"pyramid":["render.number",["aggregate.digitSum",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-51e3d98f","guard":[["hasAny",["add","added to","element","item number","more than","nth","position"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],["sense.last"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-d27cdfa7","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["nums==",4],["has","price"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],{"lit":7}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],["sense.second"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":1}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"}],{"lit":2}],{"lit":"fr-natural-gas-monthly-984ace"},{"lit":"month"},{"lit":"price"}]]]]],"mem":null},
{"id":"n-0c6ef3fb","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2019-07 and 2008-04":"The price of 2019-07 (2.37) plus that of 2008-04 (10.18) is 12.55."}}},
{"id":"n-127e64a0","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2000-11 plus the price of 2016-09 makes what":"The price of 2000-11 (5.52) plus that of 2016-09 (2.99) is 8.51."}}},
{"id":"n-17f0eb79","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2000-09 and 2003-05":"The price of 2000-09 (5.06) plus that of 2003-05 (5.81) is 10.87."}}},
{"id":"n-19cf473b","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2000-07 and 2017-10":"The price of 2000-07 (3.99) plus that of 2017-10 (2.88) is 6.87."}}},
{"id":"n-1b2a9bfd","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2015-06 and 2015-02":"The price of 2015-06 (2.78) plus that of 2015-02 (2.87) is 5.65."}}},
{"id":"n-1d9f3bf0","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2020-12 and 2010-01":"The price of 2020-12 (2.58) plus that of 2010-01 (5.83) is 8.41."}}},
{"id":"n-21e87cb7","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2019-09 plus the price of 2020-10 makes what":"The price of 2019-09 (2.56) plus that of 2020-10 (2.39) is 4.95."}}},
{"id":"n-259fbeb6","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2002-05 to the price of 2008-12":"The price of 2002-05 (3.5) plus that of 2008-12 (5.82) is 9.32."}}},
{"id":"n-27c59689","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2011-12 plus the price of 2019-06 makes what":"The price of 2011-12 (3.17) plus that of 2019-06 (2.4) is 5.57."}}},
{"id":"n-28fe1a94","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2020-09 to the price of 2011-04":"The price of 2020-09 (1.92) plus that of 2011-04 (4.24) is 6.16."}}},
{"id":"n-293a2e61","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2011-09 plus the price of 2019-11 makes what":"The price of 2011-09 (3.9) plus that of 2019-11 (2.65) is 6.55."}}},
{"id":"n-2d93c9ae","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 1999-02 to the price of 2024-11":"The price of 1999-02 (1.77) plus that of 2024-11 (2.12) is 3.89."}}},
{"id":"n-303ff68f","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2026-07 to the price of 2013-05":"The price of 2026-07 (2.89) plus that of 2013-05 (4.04) is 6.93."}}},
{"id":"n-372d836b","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2010-01 to the price of 2011-12":"The price of 2010-01 (5.83) plus that of 2011-12 (3.17) is 9."}}},
{"id":"n-38d332a0","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 1999-04 and 2016-06":"The price of 1999-04 (2.15) plus that of 2016-06 (2.59) is 4.74."}}},
{"id":"n-3bd9126c","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2000-10 to the price of 2019-02":"The price of 2000-10 (5.02) plus that of 2019-02 (2.69) is 7.71."}}},
{"id":"n-413c52d6","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2003-02 plus the price of 2018-02 makes what":"The price of 2003-02 (7.71) plus that of 2018-02 (2.67) is 10.38."}}},
{"id":"n-42dfc9d0","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2000-03 to the price of 2014-10":"The price of 2000-03 (2.79) plus that of 2014-10 (3.78) is 6.57."}}},
{"id":"n-47753868","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2012-05 to the price of 2018-10":"The price of 2012-05 (2.43) plus that of 2018-10 (3.28) is 5.71."}}},
{"id":"n-47bc52a9","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2008-04 to the price of 2012-12":"The price of 2008-04 (10.18) plus that of 2012-12 (3.34) is 13.52."}}},
{"id":"n-47eed2fe","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2009-02 and 2026-07":"The price of 2009-02 (4.52) plus that of 2026-07 (2.89) is 7.41."}}},
{"id":"n-4970654e","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2024-07 plus the price of 2007-09 makes what":"The price of 2024-07 (2.07) plus that of 2007-09 (6.08) is 8.15."}}},
{"id":"n-4d7e26af","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2006-06 to the price of 2010-04":"The price of 2006-06 (6.21) plus that of 2010-04 (4.03) is 10.24."}}},
{"id":"n-504838d9","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2005-07 plus the price of 2021-06 makes what":"The price of 2005-07 (7.63) plus that of 2021-06 (3.26) is 10.89."}}},
{"id":"n-5316c96c","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2019-02 plus the price of 2020-12 makes what":"The price of 2019-02 (2.69) plus that of 2020-12 (2.58) is 5.27."}}},
{"id":"n-543bb227","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2013-06 plus the price of 2019-07 makes what":"The price of 2013-06 (3.83) plus that of 2019-07 (2.37) is 6.2."}}},
{"id":"n-55145bbb","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2016-06 to the price of 2025-05":"The price of 2016-06 (2.59) plus that of 2025-05 (3.12) is 5.71."}}},
{"id":"n-573e57ac","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2009-09 plus the price of 1999-12 makes what":"The price of 2009-09 (2.99) plus that of 1999-12 (2.36) is 5.35."}}},
{"id":"n-5cb5ac2a","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 1997-06 to the price of 2012-10":"The price of 1997-06 (2.2) plus that of 2012-10 (3.32) is 5.52."}}},
{"id":"n-5cd6555b","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 1998-05 to the price of 2007-05":"The price of 1998-05 (2.14) plus that of 2007-05 (7.64) is 9.78."}}},
{"id":"n-5e8a5aa0","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 1997-12 plus the price of 2009-04 makes what":"The price of 1997-12 (2.35) plus that of 2009-04 (3.5) is 5.85."}}},
{"id":"n-5f0d90e5","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 1998-06 and 2006-08":"The price of 1998-06 (2.17) plus that of 2006-08 (7.14) is 9.31."}}},
{"id":"n-60d9efa1","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2008-07 plus the price of 1997-03 makes what":"The price of 2008-07 (11.09) plus that of 1997-03 (1.89) is 12.98."}}},
{"id":"n-6646f502","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2017-11 to the price of 2009-09":"The price of 2017-11 (3.01) plus that of 2009-09 (2.99) is 6."}}},
{"id":"n-665080c6","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2020-02 to the price of 2005-12":"The price of 2020-02 (1.91) plus that of 2005-12 (13.05) is 14.96."}}},
{"id":"n-66738d8c","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2007-11 plus the price of 2020-08 makes what":"The price of 2007-11 (7.1) plus that of 2020-08 (2.3) is 9.4."}}},
{"id":"n-66e0650b","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2008-06 plus the price of 2021-11 makes what":"The price of 2008-06 (12.69) plus that of 2021-11 (5.05) is 17.74."}}},
{"id":"n-6935fb3b","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2011-06 plus the price of 2015-06 makes what":"The price of 2011-06 (4.54) plus that of 2015-06 (2.78) is 7.32."}}},
{"id":"n-6999ccca","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2017-10 to the price of 2008-07":"The price of 2017-10 (2.88) plus that of 2008-07 (11.09) is 13.97."}}},
{"id":"n-6dc44f73","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2025-05 plus the price of 2004-11 makes what":"The price of 2025-05 (3.12) plus that of 2004-11 (6.17) is 9.29."}}},
{"id":"n-71565f99","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2019-11 and 2006-06":"The price of 2019-11 (2.65) plus that of 2006-06 (6.21) is 8.86."}}},
{"id":"n-76d0c487","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 1999-12 and 2007-04":"The price of 1999-12 (2.36) plus that of 2007-04 (7.6) is 9.96."}}},
{"id":"n-7fefa0fc","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2003-05 to the price of 2011-05":"The price of 2003-05 (5.81) plus that of 2011-05 (4.31) is 10.12."}}},
{"id":"n-816e61ec","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2017-01 and 2021-08":"The price of 2017-01 (3.3) plus that of 2021-08 (4.07) is 7.37."}}},
{"id":"n-82c24415","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2005-12 plus the price of 2012-03 makes what":"The price of 2005-12 (13.05) plus that of 2012-03 (2.17) is 15.22."}}},
{"id":"n-83f9fc00","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2009-10 to the price of 2011-06":"The price of 2009-10 (4.01) plus that of 2011-06 (4.54) is 8.55."}}},
{"id":"n-85316e14","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2007-09 and 2012-05":"The price of 2007-09 (6.08) plus that of 2012-05 (2.43) is 8.51."}}},
{"id":"n-86d2422c","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2017-12 to the price of 2024-07":"The price of 2017-12 (2.82) plus that of 2024-07 (2.07) is 4.89."}}},
{"id":"n-86e9988f","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2011-05 plus the price of 2017-01 makes what":"The price of 2011-05 (4.31) plus that of 2017-01 (3.3) is 7.61."}}},
{"id":"n-88d475df","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2013-11 to the price of 2007-03":"The price of 2013-11 (3.64) plus that of 2007-03 (7.11) is 10.75."}}},
{"id":"n-8d6aff81","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2006-11 to the price of 2007-11":"The price of 2006-11 (7.41) plus that of 2007-11 (7.1) is 14.51."}}},
{"id":"n-8ea81812","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2007-10 to the price of 1997-11":"The price of 2007-10 (6.74) plus that of 1997-11 (3.01) is 9.75."}}},
{"id":"n-91049380","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2019-06 and 2014-08":"The price of 2019-06 (2.4) plus that of 2014-08 (3.91) is 6.31."}}},
{"id":"n-9163d558","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2006-08 to the price of 2007-08":"The price of 2006-08 (7.14) plus that of 2007-08 (6.22) is 13.36."}}},
{"id":"n-9538dc56","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2006-09 and 2017-12":"The price of 2006-09 (4.9) plus that of 2017-12 (2.82) is 7.72."}}},
{"id":"n-9c7c446e","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2011-04 plus the price of 2013-09 makes what":"The price of 2011-04 (4.24) plus that of 2013-09 (3.62) is 7.86."}}},
{"id":"n-9d238f3c","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2007-08 plus the price of 2001-08 makes what":"The price of 2007-08 (6.22) plus that of 2001-08 (2.97) is 9.19."}}},
{"id":"n-9e304abd","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2013-05 plus the price of 2026-01 makes what":"The price of 2013-05 (4.04) plus that of 2026-01 (7.72) is 11.76."}}},
{"id":"n-9f514b80","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2003-01 to the price of 2011-09":"The price of 2003-01 (5.43) plus that of 2011-09 (3.9) is 9.33."}}},
{"id":"n-a2f780d7","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2012-10 plus the price of 2016-04 makes what":"The price of 2012-10 (3.32) plus that of 2016-04 (1.92) is 5.24."}}},
{"id":"n-a46a19cb","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2018-02 and 2009-10":"The price of 2018-02 (2.67) plus that of 2009-10 (4.01) is 6.68."}}},
{"id":"n-a93e400d","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2014-10 plus the price of 2000-07 makes what":"The price of 2014-10 (3.78) plus that of 2000-07 (3.99) is 7.77."}}},
{"id":"n-aad6813a","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2007-01 and 2020-02":"The price of 2007-01 (6.55) plus that of 2020-02 (1.91) is 8.46."}}},
{"id":"n-aae6c440","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2020-10 and 2020-09":"The price of 2020-10 (2.39) plus that of 2020-09 (1.92) is 4.31."}}},
{"id":"n-ae1dfbb4","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 1997-03 and 1999-02":"The price of 1997-03 (1.89) plus that of 1999-02 (1.77) is 3.66."}}},
{"id":"n-aec32cf9","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2021-08 to the price of 2019-09":"The price of 2021-08 (4.07) plus that of 2019-09 (2.56) is 6.63."}}},
{"id":"n-b132088c","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2007-05 plus the price of 2016-02 makes what":"The price of 2007-05 (7.64) plus that of 2016-02 (1.99) is 9.63."}}},
{"id":"n-b2f4fd29","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2021-06 and 2005-05":"The price of 2021-06 (3.26) plus that of 2005-05 (6.47) is 9.73."}}},
{"id":"n-b70bf624","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2010-04 plus the price of 2009-02 makes what":"The price of 2010-04 (4.03) plus that of 2009-02 (4.52) is 8.55."}}},
{"id":"n-b92ad5fb","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 1997-11 plus the price of 2016-03 makes what":"The price of 1997-11 (3.01) plus that of 2016-03 (1.73) is 4.74."}}},
{"id":"n-bad5c33e","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2008-12 plus the price of 1999-04 makes what":"The price of 2008-12 (5.82) plus that of 1999-04 (2.15) is 7.97."}}},
{"id":"n-badd5ce9","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2014-02 and 1997-07":"The price of 2014-02 (6) plus that of 1997-07 (2.19) is 8.19."}}},
{"id":"n-bd5e210e","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 1997-07 to the price of 1997-12":"The price of 1997-07 (2.19) plus that of 1997-12 (2.35) is 4.54."}}},
{"id":"n-c0907d07","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2015-12 and 2010-02":"The price of 2015-12 (1.93) plus that of 2010-02 (5.32) is 7.25."}}},
{"id":"n-c124c104","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2026-01 and 2013-11":"The price of 2026-01 (7.72) plus that of 2013-11 (3.64) is 11.36."}}},
{"id":"n-c196ee9f","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2018-10 plus the price of 2007-01 makes what":"The price of 2018-10 (3.28) plus that of 2007-01 (6.55) is 9.83."}}},
{"id":"n-c5322d04","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2005-04 and 2006-11":"The price of 2005-04 (7.16) plus that of 2006-11 (7.41) is 14.57."}}},
{"id":"n-c5a312ed","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2014-08 to the price of 2005-07":"The price of 2014-08 (3.91) plus that of 2005-07 (7.63) is 11.54."}}},
{"id":"n-c67cecfe","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2000-05 to the price of 2013-06":"The price of 2000-05 (3.59) plus that of 2013-06 (3.83) is 7.42."}}},
{"id":"n-c6d24a98","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2026-08 plus the price of 2015-12 makes what":"The price of 2026-08 (2.78) plus that of 2015-12 (1.93) is 4.71."}}},
{"id":"n-ca12a51c","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2015-02 to the price of 2008-06":"The price of 2015-02 (2.87) plus that of 2008-06 (12.69) is 15.56."}}},
{"id":"n-ca439c72","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2016-03 and 1997-06":"The price of 2016-03 (1.73) plus that of 1997-06 (2.2) is 3.93."}}},
{"id":"n-cd46dba7","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2004-11 and 2019-05":"The price of 2004-11 (6.17) plus that of 2019-05 (2.64) is 8.81."}}},
{"id":"n-cd9140b7","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2016-02 and 2000-05":"The price of 2016-02 (1.99) plus that of 2000-05 (3.59) is 5.58."}}},
{"id":"n-d265d1fe","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2012-09 to the price of 2003-02":"The price of 2012-09 (2.85) plus that of 2003-02 (7.71) is 10.56."}}},
{"id":"n-d969d877","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2012-12 plus the price of 2000-09 makes what":"The price of 2012-12 (3.34) plus that of 2000-09 (5.06) is 8.4."}}},
{"id":"n-de60d210","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2013-09 and 2002-05":"The price of 2013-09 (3.62) plus that of 2002-05 (3.5) is 7.12."}}},
{"id":"n-def442ea","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2007-04 to the price of 2026-08":"The price of 2007-04 (7.6) plus that of 2026-08 (2.78) is 10.38."}}},
{"id":"n-df538695","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2024-11 plus the price of 2006-09 makes what":"The price of 2024-11 (2.12) plus that of 2006-09 (4.9) is 7.02."}}},
{"id":"n-e0ad5d59","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2016-04 and 2012-09":"The price of 2016-04 (1.92) plus that of 2012-09 (2.85) is 4.77."}}},
{"id":"n-e38ecae2","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2001-06 plus the price of 1998-06 makes what":"The price of 2001-06 (3.72) plus that of 1998-06 (2.17) is 5.89."}}},
{"id":"n-e3c70138","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2010-02 to the price of 2001-06":"The price of 2010-02 (5.32) plus that of 2001-06 (3.72) is 9.04."}}},
{"id":"n-e51acb1e","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2012-03 and 2000-10":"The price of 2012-03 (2.17) plus that of 2000-10 (5.02) is 7.19."}}},
{"id":"n-e5d8dde8","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2001-08 and 2000-03":"The price of 2001-08 (2.97) plus that of 2000-03 (2.79) is 5.76."}}},
{"id":"n-e9816007","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2016-09 and 2007-10":"The price of 2016-09 (2.99) plus that of 2007-10 (6.74) is 9.73."}}},
{"id":"n-ef55100a","guard":[["hasAny",["makes","plus","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the price of 2007-03 plus the price of 2014-02 makes what":"The price of 2007-03 (7.11) plus that of 2014-02 (6) is 13.11."}}},
{"id":"n-f707e17c","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2009-04 and 2017-11":"The price of 2009-04 (3.5) plus that of 2017-11 (3.01) is 6.51."}}},
{"id":"n-f84c136f","guard":[["hasAny",["add","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the price of 2019-05 to the price of 2000-11":"The price of 2019-05 (2.64) plus that of 2000-11 (5.52) is 8.16."}}},
{"id":"n-f9719cb3","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2021-11 and 2003-01":"The price of 2021-11 (5.05) plus that of 2003-01 (5.43) is 10.48."}}},
{"id":"n-fad07c43","guard":[["hasAny",["price","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the price of 2020-08 and 1998-05":"The price of 2020-08 (2.3) plus that of 1998-05 (2.14) is 4.44."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the sum of the price of 1998-06 and 2006-08","expect":{"contains":["9.31"],"notRefusal":true}},{"q":"the price of 2024-11 plus the price of 2006-09 makes what","expect":{"contains":["7.02"],"notRefusal":true}},{"q":"what is the sum of the price of 2020-10 and 2020-09","expect":{"contains":["4.31"],"notRefusal":true}},{"q":"what is the sum of the price of 2013-09 and 2002-05","expect":{"contains":["7.12"],"notRefusal":true}},{"q":"the price of 2008-12 plus the price of 1999-04 makes what","expect":{"contains":["7.97"],"notRefusal":true}},{"q":"add the price of 2006-06 to the price of 2010-04","expect":{"contains":["10.24"],"notRefusal":true}},{"q":"the price of 1997-11 plus the price of 2016-03 makes what","expect":{"contains":["4.74"],"notRefusal":true}},{"q":"what is the sum of the price of 1997-03 and 1999-02","expect":{"contains":["3.66"],"notRefusal":true}},{"q":"the price of 2011-12 plus the price of 2019-06 makes what","expect":{"contains":["5.57"],"notRefusal":true}},{"q":"the price of 2012-10 plus the price of 2016-04 makes what","expect":{"contains":["5.24"],"notRefusal":true}},{"q":"what is the sum of the price of 2009-02 and 2026-07","expect":{"contains":["7.41"],"notRefusal":true}},{"q":"the price of 2013-06 plus the price of 2019-07 makes what","expect":{"contains":["6.2"],"notRefusal":true}},{"q":"add the price of 2000-05 to the price of 2013-06","expect":{"contains":["7.42"],"notRefusal":true}},{"q":"what is the sum of the price of 2021-06 and 2005-05","expect":{"contains":["9.73"],"notRefusal":true}},{"q":"the price of 2013-05 plus the price of 2026-01 makes what","expect":{"contains":["11.76"],"notRefusal":true}},{"q":"add the price of 1997-07 to the price of 1997-12","expect":{"contains":["4.54"],"notRefusal":true}},{"q":"add the price of 2017-10 to the price of 2008-07","expect":{"contains":["13.97"],"notRefusal":true}},{"q":"the price of 1997-12 plus the price of 2009-04 makes what","expect":{"contains":["5.85"],"notRefusal":true}},{"q":"add the price of 2003-01 to the price of 2011-09","expect":{"contains":["9.33"],"notRefusal":true}},{"q":"the price of 2005-12 plus the price of 2012-03 makes what","expect":{"contains":["15.22"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
