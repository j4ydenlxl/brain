// us-city-population-sum-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"us-city-population-sum-neo-g6","class":"us-city-population-sum","generation":6,"lane":"neo","grownFrom":["the population of Hattiesburg, Mississippi plus the population of Sarasota, Florida makes what","add the population of Hoboken, New Jersey to the population of Springfield, Ohio","the population of Taunton, Massachusetts plus the population of Indianapolis, Indiana makes what","the population of Ocala, Florida plus the population of Greeley, Colorado makes what","add the population of Binghamton, New York to the population of Tuckahoe, Virginia","what is the sum of the population of Greeley, Colorado and Potomac, Maryland","what is the sum of the population of Chesapeake, Virginia and Utica, New York","the population of Dearborn, Michigan plus the population of Glen Burnie, Maryland makes what","the population of San Bruno, California plus the population of Albany, New York makes what","what is the sum of the population of Lake Charles, Louisiana and Provo, Utah","what is the sum of the population of Sarasota, Florida and Bellflower, California","the population of Florissant, Missouri plus the population of Vista, California makes what","add the population of Concord, North Carolina to the population of San Bruno, California","what is the sum of the population of Mobile, Alabama and Harrisburg, Pennsylvania","the population of Springfield, Ohio plus the population of Newport News, Virginia makes what","the population of Lafayette, Louisiana plus the population of Yuma, Arizona makes what","the population of Burke, Virginia plus the population of Barnstable Town, Massachusetts makes what","the population of Gainesville, Florida plus the population of Brownsville, Texas makes what","what is the sum of the population of Medford, Oregon and Methuen Town, Massachusetts","add the population of Fairfield, Ohio to the population of Coachella, California"],"version":1});

// <KERNEL>
const KERNEL_VERSION = 1;
const MAX_DEPTH = 64;
const MAX_LIST = 10000;
const MAX_BITS = 65536;
const MAX_TEXT = 100000;
const SAFE = 9007199254740991n;
const NEAR = 0.5;
const TYPES = Object.freeze(['text', 'num', 'nums', 'str', 'strs', 'bool', 'kv', 'tpl']);
const FAMILIES = Object.freeze(['sense', 'transform', 'aggregate', 'compare', 'compute', 'memory', 'route', 'iterate', 'render']);
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
const COLONY = [
{"id":"n-525f1276","guard":[["has","population"],["words>=",12],["has","of"],["not",["has","spain"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Hattiesburg, Mississippi plus the population of Sarasota, Florida makes what":"The population of Hattiesburg, Mississippi (46846) plus that of Sarasota, Florida (54425) is 101271.","add the population of Hoboken, New Jersey to the population of Springfield, Ohio":"The population of Hoboken, New Jersey (53136) plus that of Springfield, Ohio (59761) is 112897.","the population of Taunton, Massachusetts plus the population of Indianapolis, Indiana makes what":"The population of Taunton, Massachusetts (56504) plus that of Indianapolis, Indiana (846674) is 903178.","the population of Ocala, Florida plus the population of Greeley, Colorado makes what":"The population of Ocala, Florida (57873) plus that of Greeley, Colorado (98975) is 156848.","add the population of Binghamton, New York to the population of Tuckahoe, Virginia":"The population of Binghamton, New York (46277) plus that of Tuckahoe, Virginia (47997) is 94274.","what is the sum of the population of Greeley, Colorado and Potomac, Maryland":"The population of Greeley, Colorado (98975) plus that of Potomac, Maryland (45882) is 144857.","what is the sum of the population of Chesapeake, Virginia and Utica, New York":"The population of Chesapeake, Virginia (233194) plus that of Utica, New York (61337) is 294531.","the population of Dearborn, Michigan plus the population of Glen Burnie, Maryland makes what":"The population of Dearborn, Michigan (95520) plus that of Glen Burnie, Maryland (69060) is 164580.","the population of San Bruno, California plus the population of Albany, New York makes what":"The population of San Bruno, California (42736) plus that of Albany, New York (98425) is 141161.","what is the sum of the population of Lake Charles, Louisiana and Provo, Utah":"The population of Lake Charles, Louisiana (75044) plus that of Provo, Utah (115718) is 190762.","what is the sum of the population of Sarasota, Florida and Bellflower, California":"The population of Sarasota, Florida (54425) plus that of Bellflower, California (77687) is 132112.","the population of Florissant, Missouri plus the population of Vista, California makes what":"The population of Florissant, Missouri (52218) plus that of Vista, California (98560) is 150778.","add the population of Concord, North Carolina to the population of San Bruno, California":"The population of Concord, North Carolina (85753) plus that of San Bruno, California (42736) is 128489.","what is the sum of the population of Mobile, Alabama and Harrisburg, Pennsylvania":"The population of Mobile, Alabama (193717) plus that of Harrisburg, Pennsylvania (49160) is 242877.","the population of Springfield, Ohio plus the population of Newport News, Virginia makes what":"The population of Springfield, Ohio (59761) plus that of Newport News, Virginia (181606) is 241367.","the population of Lafayette, Louisiana plus the population of Yuma, Arizona makes what":"The population of Lafayette, Louisiana (125808) plus that of Yuma, Arizona (93704) is 219512.","the population of Burke, Virginia plus the population of Barnstable Town, Massachusetts makes what":"The population of Burke, Virginia (42290) plus that of Barnstable Town, Massachusetts (44498) is 86788.","the population of Gainesville, Florida plus the population of Brownsville, Texas makes what":"The population of Gainesville, Florida (128610) plus that of Brownsville, Texas (182110) is 310720.","what is the sum of the population of Medford, Oregon and Methuen Town, Massachusetts":"The population of Medford, Oregon (78856) plus that of Methuen Town, Massachusetts (49043) is 127899.","add the population of Fairfield, Ohio to the population of Coachella, California":"The population of Fairfield, Ohio (42640) plus that of Coachella, California (43826) is 86466.","add the population of Tonawanda, New York to the population of Ocala, Florida":"The population of Tonawanda, New York (57844) plus that of Ocala, Florida (57873) is 115717.","what is the sum of the population of Bedford, Texas and Honolulu, Hawaii":"The population of Bedford, Texas (48864) plus that of Honolulu, Hawaii (349597) is 398461.","what is the sum of the population of Indianapolis, Indiana and Carson City, Nevada":"The population of Indianapolis, Indiana (846674) plus that of Carson City, Nevada (54412) is 901086.","add the population of Peabody, Massachusetts to the population of Gainesville, Florida":"The population of Peabody, Massachusetts (52235) plus that of Gainesville, Florida (128610) is 180845.","what is the sum of the population of Oklahoma City, Oklahoma and Peabody, Massachusetts":"The population of Oklahoma City, Oklahoma (620015) plus that of Peabody, Massachusetts (52235) is 672250.","the population of Victorville, California plus the population of Mobile, Alabama makes what":"The population of Victorville, California (121320) plus that of Mobile, Alabama (193717) is 315037.","what is the sum of the population of Bossier City, Louisiana and Virginia Beach, Virginia":"The population of Bossier City, Louisiana (67152) plus that of Virginia Beach, Virginia (449733) is 516885.","add the population of Utica, New York to the population of Pompano Beach, Florida":"The population of Utica, New York (61337) plus that of Pompano Beach, Florida (106004) is 167341.","add the population of Yorba Linda, California to the population of New York, New York":"The population of Yorba Linda, California (67362) plus that of New York, New York (8461961) is 8529323.","add the population of Virginia Beach, Virginia to the population of Orem, Utah":"The population of Virginia Beach, Virginia (449733) plus that of Orem, Utah (93220) is 542953.","what is the sum of the population of The Woodlands, Texas and Yorba Linda, California":"The population of The Woodlands, Texas (108373) plus that of Yorba Linda, California (67362) is 175735.","what is the sum of the population of Tempe, Arizona and Tonawanda, New York":"The population of Tempe, Arizona (174708) plus that of Tonawanda, New York (57844) is 232552.","add the population of Towson, Maryland to the population of Florissant, Missouri":"The population of Towson, Maryland (58189) plus that of Florissant, Missouri (52218) is 110407.","add the population of Harrisburg, Pennsylvania to the population of Rowlett, Texas":"The population of Harrisburg, Pennsylvania (49160) plus that of Rowlett, Texas (59203) is 108363.","the population of Coachella, California plus the population of Bossier City, Louisiana makes what":"The population of Coachella, California (43826) plus that of Bossier City, Louisiana (67152) is 110978.","add the population of Rochester, Minnesota to the population of Victorville, California":"The population of Rochester, Minnesota (111396) plus that of Victorville, California (121320) is 232716.","add the population of Honolulu, Hawaii to the population of Clearwater, Florida":"The population of Honolulu, Hawaii (349597) plus that of Clearwater, Florida (111747) is 461344.","the population of Edinburg, Texas plus the population of Chesapeake, Virginia makes what":"The population of Edinburg, Texas (84399) plus that of Chesapeake, Virginia (233194) is 317593.","the population of Lee's Summit, Missouri plus the population of Hillsboro, Oregon makes what":"The population of Lee's Summit, Missouri (94257) plus that of Hillsboro, Oregon (100462) is 194719.","the population of West Lafayette, Indiana plus the population of Commerce City, Colorado makes what":"The population of West Lafayette, Indiana (44543) plus that of Commerce City, Colorado (51731) is 96274.","the population of Kannapolis, North Carolina plus the population of Lake Charles, Louisiana makes what":"The population of Kannapolis, North Carolina (45685) plus that of Lake Charles, Louisiana (75044) is 120729.","add the population of Sammamish, Washington to the population of Kannapolis, North Carolina":"The population of Sammamish, Washington (62136) plus that of Kannapolis, North Carolina (45685) is 107821.","what is the sum of the population of Melbourne, Florida and Rochester, Minnesota":"The population of Melbourne, Florida (78911) plus that of Rochester, Minnesota (111396) is 190307.","what is the sum of the population of Jefferson City, Missouri and Sugar Land, Texas":"The population of Jefferson City, Missouri (43143) plus that of Sugar Land, Texas (85681) is 128824.","add the population of Carson City, Nevada to the population of San Marcos, Texas":"The population of Carson City, Nevada (54412) plus that of San Marcos, Texas (57743) is 112155.","what is the sum of the population of Green Bay, Wisconsin and Everett, Washington":"The population of Green Bay, Wisconsin (104951) plus that of Everett, Washington (106580) is 211531.","the population of New York, New York plus the population of Lakeland, Florida makes what":"The population of New York, New York (8461961) plus that of Lakeland, Florida (102714) is 8564675.","what is the sum of the population of Danville, California and Lakeville, Minnesota":"The population of Danville, California (43758) plus that of Lakeville, Minnesota (59786) is 103544.","add the population of Palm Bay, Florida to the population of Pine Hills, Florida":"The population of Palm Bay, Florida (106573) plus that of Pine Hills, Florida (69733) is 176306.","the population of Alpharetta, Georgia plus the population of Brockton, Massachusetts makes what":"The population of Alpharetta, Georgia (63013) plus that of Brockton, Massachusetts (94813) is 157826.","the population of Atascocita, Texas plus the population of Kingsport, Tennessee makes what":"The population of Atascocita, Texas (72713) plus that of Kingsport, Tennessee (52871) is 125584.","the population of Orem, Utah plus the population of Pinellas Park, Florida makes what":"The population of Orem, Utah (93220) plus that of Pinellas Park, Florida (50946) is 144166.","the population of Boulder, Colorado plus the population of Danville, California makes what":"The population of Boulder, Colorado (105420) plus that of Danville, California (43758) is 149178.","what is the sum of the population of Glen Burnie, Maryland and Palm Bay, Florida":"The population of Glen Burnie, Maryland (69060) plus that of Palm Bay, Florida (106573) is 175633.","what is the sum of the population of Fayetteville, Arkansas and Tustin, California":"The population of Fayetteville, Arkansas (80552) plus that of Tustin, California (79396) is 159948.","add the population of Sugar Land, Texas to the population of Hattiesburg, Mississippi":"The population of Sugar Land, Texas (85681) plus that of Hattiesburg, Mississippi (46846) is 132527.","what is the sum of the population of Commerce City, Colorado and Pasadena, California":"The population of Commerce City, Colorado (51731) plus that of Pasadena, California (140268) is 191999.","the population of Wauwatosa, Wisconsin plus the population of Green Bay, Wisconsin makes what":"The population of Wauwatosa, Wisconsin (47388) plus that of Green Bay, Wisconsin (104951) is 152339.","add the population of Auburn, Washington to the population of Mesa, Arizona":"The population of Auburn, Washington (75607) plus that of Mesa, Arizona (470456) is 546063.","add the population of Lawrence, Indiana to the population of Taunton, Massachusetts":"The population of Lawrence, Indiana (47415) plus that of Taunton, Massachusetts (56504) is 103919.","what is the sum of the population of Pinellas Park, Florida and Sammamish, Washington":"The population of Pinellas Park, Florida (50946) plus that of Sammamish, Washington (62136) is 113082.","what is the sum of the population of Newport News, Virginia and Lakewood, California":"The population of Newport News, Virginia (181606) plus that of Lakewood, California (81054) is 262660.","what is the sum of the population of Trujillo Alto, Puerto Rico and Towson, Maryland":"The population of Trujillo Alto, Puerto Rico (46226) plus that of Towson, Maryland (58189) is 104415.","add the population of Santa Clarita, California to the population of West Lafayette, Indiana":"The population of Santa Clarita, California (180303) plus that of West Lafayette, Indiana (44543) is 224846.","what is the sum of the population of Lakeland, Florida and Auburn, Washington":"The population of Lakeland, Florida (102714) plus that of Auburn, Washington (75607) is 178321.","add the population of Lakewood, California to the population of Wauwatosa, Wisconsin":"The population of Lakewood, California (81054) plus that of Wauwatosa, Wisconsin (47388) is 128442.","the population of Pico Rivera, California plus the population of Melbourne, Florida makes what":"The population of Pico Rivera, California (63724) plus that of Melbourne, Florida (78911) is 142635.","add the population of Provo, Utah to the population of Atascocita, Texas":"The population of Provo, Utah (115718) plus that of Atascocita, Texas (72713) is 188431.","what is the sum of the population of Vista, California and Lawrence, Indiana":"The population of Vista, California (98560) plus that of Lawrence, Indiana (47415) is 145975.","add the population of Potomac, Maryland to the population of Alpharetta, Georgia":"The population of Potomac, Maryland (45882) plus that of Alpharetta, Georgia (63013) is 108895.","what is the sum of the population of Lombard, Illinois and Portland, Oregon":"The population of Lombard, Illinois (44025) plus that of Portland, Oregon (620589) is 664614.","the population of Pompano Beach, Florida plus the population of Fayetteville, Arkansas makes what":"The population of Pompano Beach, Florida (106004) plus that of Fayetteville, Arkansas (80552) is 186556.","what is the sum of the population of Brownsville, Texas and Binghamton, New York":"The population of Brownsville, Texas (182110) plus that of Binghamton, New York (46277) is 228387.","add the population of Tustin, California to the population of Lee's Summit, Missouri":"The population of Tustin, California (79396) plus that of Lee's Summit, Missouri (94257) is 173653.","add the population of Bellflower, California to the population of Boulder, Colorado":"The population of Bellflower, California (77687) plus that of Boulder, Colorado (105420) is 183107.","add the population of Glendale, California to the population of Burke, Virginia":"The population of Glendale, California (197895) plus that of Burke, Virginia (42290) is 240185.","what is the sum of the population of Yuma, Arizona and Conway, Arkansas":"The population of Yuma, Arizona (93704) plus that of Conway, Arkansas (64184) is 157888.","add the population of Lakeville, Minnesota to the population of Edinburg, Texas":"The population of Lakeville, Minnesota (59786) plus that of Edinburg, Texas (84399) is 144185.","add the population of Conroe, Texas to the population of Dearborn, Michigan":"The population of Conroe, Texas (74482) plus that of Dearborn, Michigan (95520) is 170002.","add the population of Methuen Town, Massachusetts to the population of Madera, California":"The population of Methuen Town, Massachusetts (49043) plus that of Madera, California (63398) is 112441.","the population of Mesa, Arizona plus the population of Trujillo Alto, Puerto Rico makes what":"The population of Mesa, Arizona (470456) plus that of Trujillo Alto, Puerto Rico (46226) is 516682.","what is the sum of the population of Albany, New York and Fairfield, Ohio":"The population of Albany, New York (98425) plus that of Fairfield, Ohio (42640) is 141065.","what is the sum of the population of Hillsboro, Oregon and Spokane Valley, Washington":"The population of Hillsboro, Oregon (100462) plus that of Spokane Valley, Washington (93322) is 193784.","the population of Pine Hills, Florida plus the population of The Woodlands, Texas makes what":"The population of Pine Hills, Florida (69733) plus that of The Woodlands, Texas (108373) is 178106.","the population of Tuckahoe, Virginia plus the population of Fontana, California makes what":"The population of Tuckahoe, Virginia (47997) plus that of Fontana, California (205228) is 253225.","what is the sum of the population of Barnstable Town, Massachusetts and Conroe, Texas":"The population of Barnstable Town, Massachusetts (44498) plus that of Conroe, Texas (74482) is 118980.","what is the sum of the population of Brockton, Massachusetts and Hoboken, New Jersey":"The population of Brockton, Massachusetts (94813) plus that of Hoboken, New Jersey (53136) is 147949.","add the population of Spokane Valley, Washington to the population of New Britain, Connecticut":"The population of Spokane Valley, Washington (93322) plus that of New Britain, Connecticut (72876) is 166198.","add the population of Everett, Washington to the population of Pico Rivera, California":"The population of Everett, Washington (106580) plus that of Pico Rivera, California (63724) is 170304.","what is the sum of the population of Fontana, California and Glendale, California":"The population of Fontana, California (205228) plus that of Glendale, California (197895) is 403123.","the population of Madera, California plus the population of Oklahoma City, Oklahoma makes what":"The population of Madera, California (63398) plus that of Oklahoma City, Oklahoma (620015) is 683413.","what is the sum of the population of Kingsport, Tennessee and Santa Clarita, California":"The population of Kingsport, Tennessee (52871) plus that of Santa Clarita, California (180303) is 233174.","what is the sum of the population of Beaumont, Texas and Concord, North Carolina":"The population of Beaumont, Texas (117729) plus that of Concord, North Carolina (85753) is 203482.","add the population of Portland, Oregon to the population of Lafayette, Louisiana":"The population of Portland, Oregon (620589) plus that of Lafayette, Louisiana (125808) is 746397.","the population of South Gate, California plus the population of Bedford, Texas makes what":"The population of South Gate, California (95219) plus that of Bedford, Texas (48864) is 144083.","add the population of Pasadena, California to the population of South Gate, California":"The population of Pasadena, California (140268) plus that of South Gate, California (95219) is 235487.","the population of San Marcos, Texas plus the population of Beaumont, Texas makes what":"The population of San Marcos, Texas (57743) plus that of Beaumont, Texas (117729) is 175472.","the population of New Britain, Connecticut plus the population of Medford, Oregon makes what":"The population of New Britain, Connecticut (72876) plus that of Medford, Oregon (78856) is 151732.","the population of Clearwater, Florida plus the population of Lombard, Illinois makes what":"The population of Clearwater, Florida (111747) plus that of Lombard, Illinois (44025) is 155772.","the population of Rowlett, Texas plus the population of Jefferson City, Missouri makes what":"The population of Rowlett, Texas (59203) plus that of Jefferson City, Missouri (43143) is 102346."}}},
{"id":"n-8ba25c3c","guard":[["has","population"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Hattiesburg, Mississippi plus the population of Sarasota, Florida makes what":"The population of Hattiesburg, Mississippi (46846) plus that of Sarasota, Florida (54425) is 101271.","add the population of Hoboken, New Jersey to the population of Springfield, Ohio":"The population of Hoboken, New Jersey (53136) plus that of Springfield, Ohio (59761) is 112897.","the population of Taunton, Massachusetts plus the population of Indianapolis, Indiana makes what":"The population of Taunton, Massachusetts (56504) plus that of Indianapolis, Indiana (846674) is 903178.","the population of Ocala, Florida plus the population of Greeley, Colorado makes what":"The population of Ocala, Florida (57873) plus that of Greeley, Colorado (98975) is 156848.","add the population of Binghamton, New York to the population of Tuckahoe, Virginia":"The population of Binghamton, New York (46277) plus that of Tuckahoe, Virginia (47997) is 94274.","what is the sum of the population of Greeley, Colorado and Potomac, Maryland":"The population of Greeley, Colorado (98975) plus that of Potomac, Maryland (45882) is 144857.","what is the sum of the population of Chesapeake, Virginia and Utica, New York":"The population of Chesapeake, Virginia (233194) plus that of Utica, New York (61337) is 294531.","the population of Dearborn, Michigan plus the population of Glen Burnie, Maryland makes what":"The population of Dearborn, Michigan (95520) plus that of Glen Burnie, Maryland (69060) is 164580.","the population of San Bruno, California plus the population of Albany, New York makes what":"The population of San Bruno, California (42736) plus that of Albany, New York (98425) is 141161.","what is the sum of the population of Lake Charles, Louisiana and Provo, Utah":"The population of Lake Charles, Louisiana (75044) plus that of Provo, Utah (115718) is 190762.","what is the sum of the population of Sarasota, Florida and Bellflower, California":"The population of Sarasota, Florida (54425) plus that of Bellflower, California (77687) is 132112.","the population of Florissant, Missouri plus the population of Vista, California makes what":"The population of Florissant, Missouri (52218) plus that of Vista, California (98560) is 150778.","add the population of Concord, North Carolina to the population of San Bruno, California":"The population of Concord, North Carolina (85753) plus that of San Bruno, California (42736) is 128489.","what is the sum of the population of Mobile, Alabama and Harrisburg, Pennsylvania":"The population of Mobile, Alabama (193717) plus that of Harrisburg, Pennsylvania (49160) is 242877.","the population of Springfield, Ohio plus the population of Newport News, Virginia makes what":"The population of Springfield, Ohio (59761) plus that of Newport News, Virginia (181606) is 241367.","the population of Lafayette, Louisiana plus the population of Yuma, Arizona makes what":"The population of Lafayette, Louisiana (125808) plus that of Yuma, Arizona (93704) is 219512.","the population of Burke, Virginia plus the population of Barnstable Town, Massachusetts makes what":"The population of Burke, Virginia (42290) plus that of Barnstable Town, Massachusetts (44498) is 86788.","the population of Gainesville, Florida plus the population of Brownsville, Texas makes what":"The population of Gainesville, Florida (128610) plus that of Brownsville, Texas (182110) is 310720.","what is the sum of the population of Medford, Oregon and Methuen Town, Massachusetts":"The population of Medford, Oregon (78856) plus that of Methuen Town, Massachusetts (49043) is 127899.","add the population of Fairfield, Ohio to the population of Coachella, California":"The population of Fairfield, Ohio (42640) plus that of Coachella, California (43826) is 86466.","add the population of Tonawanda, New York to the population of Ocala, Florida":"The population of Tonawanda, New York (57844) plus that of Ocala, Florida (57873) is 115717.","what is the sum of the population of Bedford, Texas and Honolulu, Hawaii":"The population of Bedford, Texas (48864) plus that of Honolulu, Hawaii (349597) is 398461.","what is the sum of the population of Indianapolis, Indiana and Carson City, Nevada":"The population of Indianapolis, Indiana (846674) plus that of Carson City, Nevada (54412) is 901086.","add the population of Peabody, Massachusetts to the population of Gainesville, Florida":"The population of Peabody, Massachusetts (52235) plus that of Gainesville, Florida (128610) is 180845.","what is the sum of the population of Oklahoma City, Oklahoma and Peabody, Massachusetts":"The population of Oklahoma City, Oklahoma (620015) plus that of Peabody, Massachusetts (52235) is 672250.","the population of Victorville, California plus the population of Mobile, Alabama makes what":"The population of Victorville, California (121320) plus that of Mobile, Alabama (193717) is 315037.","what is the sum of the population of Bossier City, Louisiana and Virginia Beach, Virginia":"The population of Bossier City, Louisiana (67152) plus that of Virginia Beach, Virginia (449733) is 516885.","add the population of Utica, New York to the population of Pompano Beach, Florida":"The population of Utica, New York (61337) plus that of Pompano Beach, Florida (106004) is 167341.","add the population of Yorba Linda, California to the population of New York, New York":"The population of Yorba Linda, California (67362) plus that of New York, New York (8461961) is 8529323.","add the population of Virginia Beach, Virginia to the population of Orem, Utah":"The population of Virginia Beach, Virginia (449733) plus that of Orem, Utah (93220) is 542953.","what is the sum of the population of The Woodlands, Texas and Yorba Linda, California":"The population of The Woodlands, Texas (108373) plus that of Yorba Linda, California (67362) is 175735.","what is the sum of the population of Tempe, Arizona and Tonawanda, New York":"The population of Tempe, Arizona (174708) plus that of Tonawanda, New York (57844) is 232552.","add the population of Towson, Maryland to the population of Florissant, Missouri":"The population of Towson, Maryland (58189) plus that of Florissant, Missouri (52218) is 110407.","add the population of Harrisburg, Pennsylvania to the population of Rowlett, Texas":"The population of Harrisburg, Pennsylvania (49160) plus that of Rowlett, Texas (59203) is 108363.","the population of Coachella, California plus the population of Bossier City, Louisiana makes what":"The population of Coachella, California (43826) plus that of Bossier City, Louisiana (67152) is 110978.","add the population of Rochester, Minnesota to the population of Victorville, California":"The population of Rochester, Minnesota (111396) plus that of Victorville, California (121320) is 232716.","add the population of Honolulu, Hawaii to the population of Clearwater, Florida":"The population of Honolulu, Hawaii (349597) plus that of Clearwater, Florida (111747) is 461344.","the population of Edinburg, Texas plus the population of Chesapeake, Virginia makes what":"The population of Edinburg, Texas (84399) plus that of Chesapeake, Virginia (233194) is 317593.","the population of Lee's Summit, Missouri plus the population of Hillsboro, Oregon makes what":"The population of Lee's Summit, Missouri (94257) plus that of Hillsboro, Oregon (100462) is 194719.","the population of West Lafayette, Indiana plus the population of Commerce City, Colorado makes what":"The population of West Lafayette, Indiana (44543) plus that of Commerce City, Colorado (51731) is 96274.","the population of Kannapolis, North Carolina plus the population of Lake Charles, Louisiana makes what":"The population of Kannapolis, North Carolina (45685) plus that of Lake Charles, Louisiana (75044) is 120729.","add the population of Sammamish, Washington to the population of Kannapolis, North Carolina":"The population of Sammamish, Washington (62136) plus that of Kannapolis, North Carolina (45685) is 107821.","what is the sum of the population of Melbourne, Florida and Rochester, Minnesota":"The population of Melbourne, Florida (78911) plus that of Rochester, Minnesota (111396) is 190307.","what is the sum of the population of Jefferson City, Missouri and Sugar Land, Texas":"The population of Jefferson City, Missouri (43143) plus that of Sugar Land, Texas (85681) is 128824.","add the population of Carson City, Nevada to the population of San Marcos, Texas":"The population of Carson City, Nevada (54412) plus that of San Marcos, Texas (57743) is 112155.","what is the sum of the population of Green Bay, Wisconsin and Everett, Washington":"The population of Green Bay, Wisconsin (104951) plus that of Everett, Washington (106580) is 211531.","the population of New York, New York plus the population of Lakeland, Florida makes what":"The population of New York, New York (8461961) plus that of Lakeland, Florida (102714) is 8564675.","what is the sum of the population of Danville, California and Lakeville, Minnesota":"The population of Danville, California (43758) plus that of Lakeville, Minnesota (59786) is 103544.","add the population of Palm Bay, Florida to the population of Pine Hills, Florida":"The population of Palm Bay, Florida (106573) plus that of Pine Hills, Florida (69733) is 176306.","the population of Alpharetta, Georgia plus the population of Brockton, Massachusetts makes what":"The population of Alpharetta, Georgia (63013) plus that of Brockton, Massachusetts (94813) is 157826.","the population of Atascocita, Texas plus the population of Kingsport, Tennessee makes what":"The population of Atascocita, Texas (72713) plus that of Kingsport, Tennessee (52871) is 125584.","the population of Orem, Utah plus the population of Pinellas Park, Florida makes what":"The population of Orem, Utah (93220) plus that of Pinellas Park, Florida (50946) is 144166.","the population of Boulder, Colorado plus the population of Danville, California makes what":"The population of Boulder, Colorado (105420) plus that of Danville, California (43758) is 149178.","what is the sum of the population of Glen Burnie, Maryland and Palm Bay, Florida":"The population of Glen Burnie, Maryland (69060) plus that of Palm Bay, Florida (106573) is 175633.","what is the sum of the population of Fayetteville, Arkansas and Tustin, California":"The population of Fayetteville, Arkansas (80552) plus that of Tustin, California (79396) is 159948.","add the population of Sugar Land, Texas to the population of Hattiesburg, Mississippi":"The population of Sugar Land, Texas (85681) plus that of Hattiesburg, Mississippi (46846) is 132527.","what is the sum of the population of Commerce City, Colorado and Pasadena, California":"The population of Commerce City, Colorado (51731) plus that of Pasadena, California (140268) is 191999.","the population of Wauwatosa, Wisconsin plus the population of Green Bay, Wisconsin makes what":"The population of Wauwatosa, Wisconsin (47388) plus that of Green Bay, Wisconsin (104951) is 152339.","add the population of Auburn, Washington to the population of Mesa, Arizona":"The population of Auburn, Washington (75607) plus that of Mesa, Arizona (470456) is 546063.","add the population of Lawrence, Indiana to the population of Taunton, Massachusetts":"The population of Lawrence, Indiana (47415) plus that of Taunton, Massachusetts (56504) is 103919.","what is the sum of the population of Pinellas Park, Florida and Sammamish, Washington":"The population of Pinellas Park, Florida (50946) plus that of Sammamish, Washington (62136) is 113082.","what is the sum of the population of Newport News, Virginia and Lakewood, California":"The population of Newport News, Virginia (181606) plus that of Lakewood, California (81054) is 262660.","what is the sum of the population of Trujillo Alto, Puerto Rico and Towson, Maryland":"The population of Trujillo Alto, Puerto Rico (46226) plus that of Towson, Maryland (58189) is 104415.","add the population of Santa Clarita, California to the population of West Lafayette, Indiana":"The population of Santa Clarita, California (180303) plus that of West Lafayette, Indiana (44543) is 224846.","what is the sum of the population of Lakeland, Florida and Auburn, Washington":"The population of Lakeland, Florida (102714) plus that of Auburn, Washington (75607) is 178321.","add the population of Lakewood, California to the population of Wauwatosa, Wisconsin":"The population of Lakewood, California (81054) plus that of Wauwatosa, Wisconsin (47388) is 128442.","the population of Pico Rivera, California plus the population of Melbourne, Florida makes what":"The population of Pico Rivera, California (63724) plus that of Melbourne, Florida (78911) is 142635.","add the population of Provo, Utah to the population of Atascocita, Texas":"The population of Provo, Utah (115718) plus that of Atascocita, Texas (72713) is 188431.","what is the sum of the population of Vista, California and Lawrence, Indiana":"The population of Vista, California (98560) plus that of Lawrence, Indiana (47415) is 145975.","add the population of Potomac, Maryland to the population of Alpharetta, Georgia":"The population of Potomac, Maryland (45882) plus that of Alpharetta, Georgia (63013) is 108895.","what is the sum of the population of Lombard, Illinois and Portland, Oregon":"The population of Lombard, Illinois (44025) plus that of Portland, Oregon (620589) is 664614.","the population of Pompano Beach, Florida plus the population of Fayetteville, Arkansas makes what":"The population of Pompano Beach, Florida (106004) plus that of Fayetteville, Arkansas (80552) is 186556.","what is the sum of the population of Brownsville, Texas and Binghamton, New York":"The population of Brownsville, Texas (182110) plus that of Binghamton, New York (46277) is 228387.","add the population of Tustin, California to the population of Lee's Summit, Missouri":"The population of Tustin, California (79396) plus that of Lee's Summit, Missouri (94257) is 173653.","add the population of Bellflower, California to the population of Boulder, Colorado":"The population of Bellflower, California (77687) plus that of Boulder, Colorado (105420) is 183107.","add the population of Glendale, California to the population of Burke, Virginia":"The population of Glendale, California (197895) plus that of Burke, Virginia (42290) is 240185.","what is the sum of the population of Yuma, Arizona and Conway, Arkansas":"The population of Yuma, Arizona (93704) plus that of Conway, Arkansas (64184) is 157888.","add the population of Lakeville, Minnesota to the population of Edinburg, Texas":"The population of Lakeville, Minnesota (59786) plus that of Edinburg, Texas (84399) is 144185.","add the population of Conroe, Texas to the population of Dearborn, Michigan":"The population of Conroe, Texas (74482) plus that of Dearborn, Michigan (95520) is 170002.","add the population of Methuen Town, Massachusetts to the population of Madera, California":"The population of Methuen Town, Massachusetts (49043) plus that of Madera, California (63398) is 112441.","the population of Mesa, Arizona plus the population of Trujillo Alto, Puerto Rico makes what":"The population of Mesa, Arizona (470456) plus that of Trujillo Alto, Puerto Rico (46226) is 516682.","what is the sum of the population of Albany, New York and Fairfield, Ohio":"The population of Albany, New York (98425) plus that of Fairfield, Ohio (42640) is 141065.","what is the sum of the population of Hillsboro, Oregon and Spokane Valley, Washington":"The population of Hillsboro, Oregon (100462) plus that of Spokane Valley, Washington (93322) is 193784.","the population of Pine Hills, Florida plus the population of The Woodlands, Texas makes what":"The population of Pine Hills, Florida (69733) plus that of The Woodlands, Texas (108373) is 178106.","the population of Tuckahoe, Virginia plus the population of Fontana, California makes what":"The population of Tuckahoe, Virginia (47997) plus that of Fontana, California (205228) is 253225.","what is the sum of the population of Barnstable Town, Massachusetts and Conroe, Texas":"The population of Barnstable Town, Massachusetts (44498) plus that of Conroe, Texas (74482) is 118980.","what is the sum of the population of Brockton, Massachusetts and Hoboken, New Jersey":"The population of Brockton, Massachusetts (94813) plus that of Hoboken, New Jersey (53136) is 147949.","add the population of Spokane Valley, Washington to the population of New Britain, Connecticut":"The population of Spokane Valley, Washington (93322) plus that of New Britain, Connecticut (72876) is 166198.","add the population of Everett, Washington to the population of Pico Rivera, California":"The population of Everett, Washington (106580) plus that of Pico Rivera, California (63724) is 170304.","what is the sum of the population of Fontana, California and Glendale, California":"The population of Fontana, California (205228) plus that of Glendale, California (197895) is 403123.","the population of Madera, California plus the population of Oklahoma City, Oklahoma makes what":"The population of Madera, California (63398) plus that of Oklahoma City, Oklahoma (620015) is 683413.","what is the sum of the population of Kingsport, Tennessee and Santa Clarita, California":"The population of Kingsport, Tennessee (52871) plus that of Santa Clarita, California (180303) is 233174.","what is the sum of the population of Beaumont, Texas and Concord, North Carolina":"The population of Beaumont, Texas (117729) plus that of Concord, North Carolina (85753) is 203482.","add the population of Portland, Oregon to the population of Lafayette, Louisiana":"The population of Portland, Oregon (620589) plus that of Lafayette, Louisiana (125808) is 746397.","the population of South Gate, California plus the population of Bedford, Texas makes what":"The population of South Gate, California (95219) plus that of Bedford, Texas (48864) is 144083.","add the population of Pasadena, California to the population of South Gate, California":"The population of Pasadena, California (140268) plus that of South Gate, California (95219) is 235487.","the population of San Marcos, Texas plus the population of Beaumont, Texas makes what":"The population of San Marcos, Texas (57743) plus that of Beaumont, Texas (117729) is 175472.","the population of New Britain, Connecticut plus the population of Medford, Oregon makes what":"The population of New Britain, Connecticut (72876) plus that of Medford, Oregon (78856) is 151732.","the population of Clearwater, Florida plus the population of Lombard, Illinois makes what":"The population of Clearwater, Florida (111747) plus that of Lombard, Illinois (44025) is 155772.","the population of Rowlett, Texas plus the population of Jefferson City, Missouri makes what":"The population of Rowlett, Texas (59203) plus that of Jefferson City, Missouri (43143) is 102346."}}},
{"id":"n-16be2a84","guard":[["has","population"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"population"}]]],"mem":{"table":{"of Hattiesburg, Mississippi plus the population of Sarasota, Florida makes what":"The population of Hattiesburg, Mississippi (46846) plus that of Sarasota, Florida (54425) is 101271.","of Hoboken, New Jersey to the population of Springfield, Ohio":"The population of Hoboken, New Jersey (53136) plus that of Springfield, Ohio (59761) is 112897.","of Taunton, Massachusetts plus the population of Indianapolis, Indiana makes what":"The population of Taunton, Massachusetts (56504) plus that of Indianapolis, Indiana (846674) is 903178.","of Ocala, Florida plus the population of Greeley, Colorado makes what":"The population of Ocala, Florida (57873) plus that of Greeley, Colorado (98975) is 156848.","of Binghamton, New York to the population of Tuckahoe, Virginia":"The population of Binghamton, New York (46277) plus that of Tuckahoe, Virginia (47997) is 94274.","of Greeley, Colorado and Potomac, Maryland":"The population of Greeley, Colorado (98975) plus that of Potomac, Maryland (45882) is 144857.","of Chesapeake, Virginia and Utica, New York":"The population of Chesapeake, Virginia (233194) plus that of Utica, New York (61337) is 294531.","of Dearborn, Michigan plus the population of Glen Burnie, Maryland makes what":"The population of Dearborn, Michigan (95520) plus that of Glen Burnie, Maryland (69060) is 164580.","of San Bruno, California plus the population of Albany, New York makes what":"The population of San Bruno, California (42736) plus that of Albany, New York (98425) is 141161.","of Lake Charles, Louisiana and Provo, Utah":"The population of Lake Charles, Louisiana (75044) plus that of Provo, Utah (115718) is 190762.","of Sarasota, Florida and Bellflower, California":"The population of Sarasota, Florida (54425) plus that of Bellflower, California (77687) is 132112.","of Florissant, Missouri plus the population of Vista, California makes what":"The population of Florissant, Missouri (52218) plus that of Vista, California (98560) is 150778.","of Concord, North Carolina to the population of San Bruno, California":"The population of Concord, North Carolina (85753) plus that of San Bruno, California (42736) is 128489.","of Mobile, Alabama and Harrisburg, Pennsylvania":"The population of Mobile, Alabama (193717) plus that of Harrisburg, Pennsylvania (49160) is 242877.","of Springfield, Ohio plus the population of Newport News, Virginia makes what":"The population of Springfield, Ohio (59761) plus that of Newport News, Virginia (181606) is 241367.","of Lafayette, Louisiana plus the population of Yuma, Arizona makes what":"The population of Lafayette, Louisiana (125808) plus that of Yuma, Arizona (93704) is 219512.","of Burke, Virginia plus the population of Barnstable Town, Massachusetts makes what":"The population of Burke, Virginia (42290) plus that of Barnstable Town, Massachusetts (44498) is 86788.","of Gainesville, Florida plus the population of Brownsville, Texas makes what":"The population of Gainesville, Florida (128610) plus that of Brownsville, Texas (182110) is 310720.","of Medford, Oregon and Methuen Town, Massachusetts":"The population of Medford, Oregon (78856) plus that of Methuen Town, Massachusetts (49043) is 127899.","of Fairfield, Ohio to the population of Coachella, California":"The population of Fairfield, Ohio (42640) plus that of Coachella, California (43826) is 86466.","of Tonawanda, New York to the population of Ocala, Florida":"The population of Tonawanda, New York (57844) plus that of Ocala, Florida (57873) is 115717.","of Bedford, Texas and Honolulu, Hawaii":"The population of Bedford, Texas (48864) plus that of Honolulu, Hawaii (349597) is 398461.","of Indianapolis, Indiana and Carson City, Nevada":"The population of Indianapolis, Indiana (846674) plus that of Carson City, Nevada (54412) is 901086.","of Peabody, Massachusetts to the population of Gainesville, Florida":"The population of Peabody, Massachusetts (52235) plus that of Gainesville, Florida (128610) is 180845.","of Oklahoma City, Oklahoma and Peabody, Massachusetts":"The population of Oklahoma City, Oklahoma (620015) plus that of Peabody, Massachusetts (52235) is 672250.","of Victorville, California plus the population of Mobile, Alabama makes what":"The population of Victorville, California (121320) plus that of Mobile, Alabama (193717) is 315037.","of Bossier City, Louisiana and Virginia Beach, Virginia":"The population of Bossier City, Louisiana (67152) plus that of Virginia Beach, Virginia (449733) is 516885.","of Utica, New York to the population of Pompano Beach, Florida":"The population of Utica, New York (61337) plus that of Pompano Beach, Florida (106004) is 167341.","of Yorba Linda, California to the population of New York, New York":"The population of Yorba Linda, California (67362) plus that of New York, New York (8461961) is 8529323.","of Virginia Beach, Virginia to the population of Orem, Utah":"The population of Virginia Beach, Virginia (449733) plus that of Orem, Utah (93220) is 542953.","of The Woodlands, Texas and Yorba Linda, California":"The population of The Woodlands, Texas (108373) plus that of Yorba Linda, California (67362) is 175735.","of Tempe, Arizona and Tonawanda, New York":"The population of Tempe, Arizona (174708) plus that of Tonawanda, New York (57844) is 232552.","of Towson, Maryland to the population of Florissant, Missouri":"The population of Towson, Maryland (58189) plus that of Florissant, Missouri (52218) is 110407.","of Harrisburg, Pennsylvania to the population of Rowlett, Texas":"The population of Harrisburg, Pennsylvania (49160) plus that of Rowlett, Texas (59203) is 108363.","of Coachella, California plus the population of Bossier City, Louisiana makes what":"The population of Coachella, California (43826) plus that of Bossier City, Louisiana (67152) is 110978.","of Rochester, Minnesota to the population of Victorville, California":"The population of Rochester, Minnesota (111396) plus that of Victorville, California (121320) is 232716.","of Honolulu, Hawaii to the population of Clearwater, Florida":"The population of Honolulu, Hawaii (349597) plus that of Clearwater, Florida (111747) is 461344.","of Edinburg, Texas plus the population of Chesapeake, Virginia makes what":"The population of Edinburg, Texas (84399) plus that of Chesapeake, Virginia (233194) is 317593.","of Lee's Summit, Missouri plus the population of Hillsboro, Oregon makes what":"The population of Lee's Summit, Missouri (94257) plus that of Hillsboro, Oregon (100462) is 194719.","of West Lafayette, Indiana plus the population of Commerce City, Colorado makes what":"The population of West Lafayette, Indiana (44543) plus that of Commerce City, Colorado (51731) is 96274.","of Kannapolis, North Carolina plus the population of Lake Charles, Louisiana makes what":"The population of Kannapolis, North Carolina (45685) plus that of Lake Charles, Louisiana (75044) is 120729.","of Sammamish, Washington to the population of Kannapolis, North Carolina":"The population of Sammamish, Washington (62136) plus that of Kannapolis, North Carolina (45685) is 107821.","of Melbourne, Florida and Rochester, Minnesota":"The population of Melbourne, Florida (78911) plus that of Rochester, Minnesota (111396) is 190307.","of Jefferson City, Missouri and Sugar Land, Texas":"The population of Jefferson City, Missouri (43143) plus that of Sugar Land, Texas (85681) is 128824.","of Carson City, Nevada to the population of San Marcos, Texas":"The population of Carson City, Nevada (54412) plus that of San Marcos, Texas (57743) is 112155.","of Green Bay, Wisconsin and Everett, Washington":"The population of Green Bay, Wisconsin (104951) plus that of Everett, Washington (106580) is 211531.","of New York, New York plus the population of Lakeland, Florida makes what":"The population of New York, New York (8461961) plus that of Lakeland, Florida (102714) is 8564675.","of Danville, California and Lakeville, Minnesota":"The population of Danville, California (43758) plus that of Lakeville, Minnesota (59786) is 103544.","of Palm Bay, Florida to the population of Pine Hills, Florida":"The population of Palm Bay, Florida (106573) plus that of Pine Hills, Florida (69733) is 176306.","of Alpharetta, Georgia plus the population of Brockton, Massachusetts makes what":"The population of Alpharetta, Georgia (63013) plus that of Brockton, Massachusetts (94813) is 157826.","of Atascocita, Texas plus the population of Kingsport, Tennessee makes what":"The population of Atascocita, Texas (72713) plus that of Kingsport, Tennessee (52871) is 125584.","of Orem, Utah plus the population of Pinellas Park, Florida makes what":"The population of Orem, Utah (93220) plus that of Pinellas Park, Florida (50946) is 144166.","of Boulder, Colorado plus the population of Danville, California makes what":"The population of Boulder, Colorado (105420) plus that of Danville, California (43758) is 149178.","of Glen Burnie, Maryland and Palm Bay, Florida":"The population of Glen Burnie, Maryland (69060) plus that of Palm Bay, Florida (106573) is 175633.","of Fayetteville, Arkansas and Tustin, California":"The population of Fayetteville, Arkansas (80552) plus that of Tustin, California (79396) is 159948.","of Sugar Land, Texas to the population of Hattiesburg, Mississippi":"The population of Sugar Land, Texas (85681) plus that of Hattiesburg, Mississippi (46846) is 132527.","of Commerce City, Colorado and Pasadena, California":"The population of Commerce City, Colorado (51731) plus that of Pasadena, California (140268) is 191999.","of Wauwatosa, Wisconsin plus the population of Green Bay, Wisconsin makes what":"The population of Wauwatosa, Wisconsin (47388) plus that of Green Bay, Wisconsin (104951) is 152339.","of Auburn, Washington to the population of Mesa, Arizona":"The population of Auburn, Washington (75607) plus that of Mesa, Arizona (470456) is 546063.","of Lawrence, Indiana to the population of Taunton, Massachusetts":"The population of Lawrence, Indiana (47415) plus that of Taunton, Massachusetts (56504) is 103919.","of Pinellas Park, Florida and Sammamish, Washington":"The population of Pinellas Park, Florida (50946) plus that of Sammamish, Washington (62136) is 113082.","of Newport News, Virginia and Lakewood, California":"The population of Newport News, Virginia (181606) plus that of Lakewood, California (81054) is 262660.","of Trujillo Alto, Puerto Rico and Towson, Maryland":"The population of Trujillo Alto, Puerto Rico (46226) plus that of Towson, Maryland (58189) is 104415.","of Santa Clarita, California to the population of West Lafayette, Indiana":"The population of Santa Clarita, California (180303) plus that of West Lafayette, Indiana (44543) is 224846.","of Lakeland, Florida and Auburn, Washington":"The population of Lakeland, Florida (102714) plus that of Auburn, Washington (75607) is 178321.","of Lakewood, California to the population of Wauwatosa, Wisconsin":"The population of Lakewood, California (81054) plus that of Wauwatosa, Wisconsin (47388) is 128442.","of Pico Rivera, California plus the population of Melbourne, Florida makes what":"The population of Pico Rivera, California (63724) plus that of Melbourne, Florida (78911) is 142635.","of Provo, Utah to the population of Atascocita, Texas":"The population of Provo, Utah (115718) plus that of Atascocita, Texas (72713) is 188431.","of Vista, California and Lawrence, Indiana":"The population of Vista, California (98560) plus that of Lawrence, Indiana (47415) is 145975.","of Potomac, Maryland to the population of Alpharetta, Georgia":"The population of Potomac, Maryland (45882) plus that of Alpharetta, Georgia (63013) is 108895.","of Lombard, Illinois and Portland, Oregon":"The population of Lombard, Illinois (44025) plus that of Portland, Oregon (620589) is 664614.","of Pompano Beach, Florida plus the population of Fayetteville, Arkansas makes what":"The population of Pompano Beach, Florida (106004) plus that of Fayetteville, Arkansas (80552) is 186556.","of Brownsville, Texas and Binghamton, New York":"The population of Brownsville, Texas (182110) plus that of Binghamton, New York (46277) is 228387.","of Tustin, California to the population of Lee's Summit, Missouri":"The population of Tustin, California (79396) plus that of Lee's Summit, Missouri (94257) is 173653.","of Bellflower, California to the population of Boulder, Colorado":"The population of Bellflower, California (77687) plus that of Boulder, Colorado (105420) is 183107.","of Glendale, California to the population of Burke, Virginia":"The population of Glendale, California (197895) plus that of Burke, Virginia (42290) is 240185.","of Yuma, Arizona and Conway, Arkansas":"The population of Yuma, Arizona (93704) plus that of Conway, Arkansas (64184) is 157888.","of Lakeville, Minnesota to the population of Edinburg, Texas":"The population of Lakeville, Minnesota (59786) plus that of Edinburg, Texas (84399) is 144185.","of Conroe, Texas to the population of Dearborn, Michigan":"The population of Conroe, Texas (74482) plus that of Dearborn, Michigan (95520) is 170002.","of Methuen Town, Massachusetts to the population of Madera, California":"The population of Methuen Town, Massachusetts (49043) plus that of Madera, California (63398) is 112441.","of Mesa, Arizona plus the population of Trujillo Alto, Puerto Rico makes what":"The population of Mesa, Arizona (470456) plus that of Trujillo Alto, Puerto Rico (46226) is 516682.","of Albany, New York and Fairfield, Ohio":"The population of Albany, New York (98425) plus that of Fairfield, Ohio (42640) is 141065.","of Hillsboro, Oregon and Spokane Valley, Washington":"The population of Hillsboro, Oregon (100462) plus that of Spokane Valley, Washington (93322) is 193784.","of Pine Hills, Florida plus the population of The Woodlands, Texas makes what":"The population of Pine Hills, Florida (69733) plus that of The Woodlands, Texas (108373) is 178106.","of Tuckahoe, Virginia plus the population of Fontana, California makes what":"The population of Tuckahoe, Virginia (47997) plus that of Fontana, California (205228) is 253225.","of Barnstable Town, Massachusetts and Conroe, Texas":"The population of Barnstable Town, Massachusetts (44498) plus that of Conroe, Texas (74482) is 118980.","of Brockton, Massachusetts and Hoboken, New Jersey":"The population of Brockton, Massachusetts (94813) plus that of Hoboken, New Jersey (53136) is 147949.","of Spokane Valley, Washington to the population of New Britain, Connecticut":"The population of Spokane Valley, Washington (93322) plus that of New Britain, Connecticut (72876) is 166198.","of Everett, Washington to the population of Pico Rivera, California":"The population of Everett, Washington (106580) plus that of Pico Rivera, California (63724) is 170304.","of Fontana, California and Glendale, California":"The population of Fontana, California (205228) plus that of Glendale, California (197895) is 403123.","of Madera, California plus the population of Oklahoma City, Oklahoma makes what":"The population of Madera, California (63398) plus that of Oklahoma City, Oklahoma (620015) is 683413.","of Kingsport, Tennessee and Santa Clarita, California":"The population of Kingsport, Tennessee (52871) plus that of Santa Clarita, California (180303) is 233174.","of Beaumont, Texas and Concord, North Carolina":"The population of Beaumont, Texas (117729) plus that of Concord, North Carolina (85753) is 203482.","of Portland, Oregon to the population of Lafayette, Louisiana":"The population of Portland, Oregon (620589) plus that of Lafayette, Louisiana (125808) is 746397.","of South Gate, California plus the population of Bedford, Texas makes what":"The population of South Gate, California (95219) plus that of Bedford, Texas (48864) is 144083.","of Pasadena, California to the population of South Gate, California":"The population of Pasadena, California (140268) plus that of South Gate, California (95219) is 235487.","of San Marcos, Texas plus the population of Beaumont, Texas makes what":"The population of San Marcos, Texas (57743) plus that of Beaumont, Texas (117729) is 175472.","of New Britain, Connecticut plus the population of Medford, Oregon makes what":"The population of New Britain, Connecticut (72876) plus that of Medford, Oregon (78856) is 151732.","of Clearwater, Florida plus the population of Lombard, Illinois makes what":"The population of Clearwater, Florida (111747) plus that of Lombard, Illinois (44025) is 155772.","of Rowlett, Texas plus the population of Jefferson City, Missouri makes what":"The population of Rowlett, Texas (59203) plus that of Jefferson City, Missouri (43143) is 102346."}}},
{"id":"n-37f9ad76","guard":[["has","population"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"Hattiesburg, Mississippi plus the population of Sarasota, Florida makes what":"The population of Hattiesburg, Mississippi (46846) plus that of Sarasota, Florida (54425) is 101271.","Hoboken, New Jersey to the population of Springfield, Ohio":"The population of Hoboken, New Jersey (53136) plus that of Springfield, Ohio (59761) is 112897.","Taunton, Massachusetts plus the population of Indianapolis, Indiana makes what":"The population of Taunton, Massachusetts (56504) plus that of Indianapolis, Indiana (846674) is 903178.","Ocala, Florida plus the population of Greeley, Colorado makes what":"The population of Ocala, Florida (57873) plus that of Greeley, Colorado (98975) is 156848.","Binghamton, New York to the population of Tuckahoe, Virginia":"The population of Binghamton, New York (46277) plus that of Tuckahoe, Virginia (47997) is 94274.","the population of Greeley, Colorado and Potomac, Maryland":"The population of Greeley, Colorado (98975) plus that of Potomac, Maryland (45882) is 144857.","the population of Chesapeake, Virginia and Utica, New York":"The population of Chesapeake, Virginia (233194) plus that of Utica, New York (61337) is 294531.","Dearborn, Michigan plus the population of Glen Burnie, Maryland makes what":"The population of Dearborn, Michigan (95520) plus that of Glen Burnie, Maryland (69060) is 164580.","San Bruno, California plus the population of Albany, New York makes what":"The population of San Bruno, California (42736) plus that of Albany, New York (98425) is 141161.","the population of Lake Charles, Louisiana and Provo, Utah":"The population of Lake Charles, Louisiana (75044) plus that of Provo, Utah (115718) is 190762.","the population of Sarasota, Florida and Bellflower, California":"The population of Sarasota, Florida (54425) plus that of Bellflower, California (77687) is 132112.","Florissant, Missouri plus the population of Vista, California makes what":"The population of Florissant, Missouri (52218) plus that of Vista, California (98560) is 150778.","Concord, North Carolina to the population of San Bruno, California":"The population of Concord, North Carolina (85753) plus that of San Bruno, California (42736) is 128489.","the population of Mobile, Alabama and Harrisburg, Pennsylvania":"The population of Mobile, Alabama (193717) plus that of Harrisburg, Pennsylvania (49160) is 242877.","Springfield, Ohio plus the population of Newport News, Virginia makes what":"The population of Springfield, Ohio (59761) plus that of Newport News, Virginia (181606) is 241367.","Lafayette, Louisiana plus the population of Yuma, Arizona makes what":"The population of Lafayette, Louisiana (125808) plus that of Yuma, Arizona (93704) is 219512.","Burke, Virginia plus the population of Barnstable Town, Massachusetts makes what":"The population of Burke, Virginia (42290) plus that of Barnstable Town, Massachusetts (44498) is 86788.","Gainesville, Florida plus the population of Brownsville, Texas makes what":"The population of Gainesville, Florida (128610) plus that of Brownsville, Texas (182110) is 310720.","the population of Medford, Oregon and Methuen Town, Massachusetts":"The population of Medford, Oregon (78856) plus that of Methuen Town, Massachusetts (49043) is 127899.","Fairfield, Ohio to the population of Coachella, California":"The population of Fairfield, Ohio (42640) plus that of Coachella, California (43826) is 86466.","Tonawanda, New York to the population of Ocala, Florida":"The population of Tonawanda, New York (57844) plus that of Ocala, Florida (57873) is 115717.","the population of Bedford, Texas and Honolulu, Hawaii":"The population of Bedford, Texas (48864) plus that of Honolulu, Hawaii (349597) is 398461.","the population of Indianapolis, Indiana and Carson City, Nevada":"The population of Indianapolis, Indiana (846674) plus that of Carson City, Nevada (54412) is 901086.","Peabody, Massachusetts to the population of Gainesville, Florida":"The population of Peabody, Massachusetts (52235) plus that of Gainesville, Florida (128610) is 180845.","the population of Oklahoma City, Oklahoma and Peabody, Massachusetts":"The population of Oklahoma City, Oklahoma (620015) plus that of Peabody, Massachusetts (52235) is 672250.","Victorville, California plus the population of Mobile, Alabama makes what":"The population of Victorville, California (121320) plus that of Mobile, Alabama (193717) is 315037.","the population of Bossier City, Louisiana and Virginia Beach, Virginia":"The population of Bossier City, Louisiana (67152) plus that of Virginia Beach, Virginia (449733) is 516885.","Utica, New York to the population of Pompano Beach, Florida":"The population of Utica, New York (61337) plus that of Pompano Beach, Florida (106004) is 167341.","Yorba Linda, California to the population of New York, New York":"The population of Yorba Linda, California (67362) plus that of New York, New York (8461961) is 8529323.","Virginia Beach, Virginia to the population of Orem, Utah":"The population of Virginia Beach, Virginia (449733) plus that of Orem, Utah (93220) is 542953.","the population of The Woodlands, Texas and Yorba Linda, California":"The population of The Woodlands, Texas (108373) plus that of Yorba Linda, California (67362) is 175735.","the population of Tempe, Arizona and Tonawanda, New York":"The population of Tempe, Arizona (174708) plus that of Tonawanda, New York (57844) is 232552.","Towson, Maryland to the population of Florissant, Missouri":"The population of Towson, Maryland (58189) plus that of Florissant, Missouri (52218) is 110407.","Harrisburg, Pennsylvania to the population of Rowlett, Texas":"The population of Harrisburg, Pennsylvania (49160) plus that of Rowlett, Texas (59203) is 108363.","Coachella, California plus the population of Bossier City, Louisiana makes what":"The population of Coachella, California (43826) plus that of Bossier City, Louisiana (67152) is 110978.","Rochester, Minnesota to the population of Victorville, California":"The population of Rochester, Minnesota (111396) plus that of Victorville, California (121320) is 232716.","Honolulu, Hawaii to the population of Clearwater, Florida":"The population of Honolulu, Hawaii (349597) plus that of Clearwater, Florida (111747) is 461344.","Edinburg, Texas plus the population of Chesapeake, Virginia makes what":"The population of Edinburg, Texas (84399) plus that of Chesapeake, Virginia (233194) is 317593.","Lee's Summit, Missouri plus the population of Hillsboro, Oregon makes what":"The population of Lee's Summit, Missouri (94257) plus that of Hillsboro, Oregon (100462) is 194719.","West Lafayette, Indiana plus the population of Commerce City, Colorado makes what":"The population of West Lafayette, Indiana (44543) plus that of Commerce City, Colorado (51731) is 96274.","Kannapolis, North Carolina plus the population of Lake Charles, Louisiana makes what":"The population of Kannapolis, North Carolina (45685) plus that of Lake Charles, Louisiana (75044) is 120729.","Sammamish, Washington to the population of Kannapolis, North Carolina":"The population of Sammamish, Washington (62136) plus that of Kannapolis, North Carolina (45685) is 107821.","the population of Melbourne, Florida and Rochester, Minnesota":"The population of Melbourne, Florida (78911) plus that of Rochester, Minnesota (111396) is 190307.","the population of Jefferson City, Missouri and Sugar Land, Texas":"The population of Jefferson City, Missouri (43143) plus that of Sugar Land, Texas (85681) is 128824.","Carson City, Nevada to the population of San Marcos, Texas":"The population of Carson City, Nevada (54412) plus that of San Marcos, Texas (57743) is 112155.","the population of Green Bay, Wisconsin and Everett, Washington":"The population of Green Bay, Wisconsin (104951) plus that of Everett, Washington (106580) is 211531.","New York, New York plus the population of Lakeland, Florida makes what":"The population of New York, New York (8461961) plus that of Lakeland, Florida (102714) is 8564675.","the population of Danville, California and Lakeville, Minnesota":"The population of Danville, California (43758) plus that of Lakeville, Minnesota (59786) is 103544.","Palm Bay, Florida to the population of Pine Hills, Florida":"The population of Palm Bay, Florida (106573) plus that of Pine Hills, Florida (69733) is 176306.","Alpharetta, Georgia plus the population of Brockton, Massachusetts makes what":"The population of Alpharetta, Georgia (63013) plus that of Brockton, Massachusetts (94813) is 157826.","Atascocita, Texas plus the population of Kingsport, Tennessee makes what":"The population of Atascocita, Texas (72713) plus that of Kingsport, Tennessee (52871) is 125584.","Orem, Utah plus the population of Pinellas Park, Florida makes what":"The population of Orem, Utah (93220) plus that of Pinellas Park, Florida (50946) is 144166.","Boulder, Colorado plus the population of Danville, California makes what":"The population of Boulder, Colorado (105420) plus that of Danville, California (43758) is 149178.","the population of Glen Burnie, Maryland and Palm Bay, Florida":"The population of Glen Burnie, Maryland (69060) plus that of Palm Bay, Florida (106573) is 175633.","the population of Fayetteville, Arkansas and Tustin, California":"The population of Fayetteville, Arkansas (80552) plus that of Tustin, California (79396) is 159948.","Sugar Land, Texas to the population of Hattiesburg, Mississippi":"The population of Sugar Land, Texas (85681) plus that of Hattiesburg, Mississippi (46846) is 132527.","the population of Commerce City, Colorado and Pasadena, California":"The population of Commerce City, Colorado (51731) plus that of Pasadena, California (140268) is 191999.","Wauwatosa, Wisconsin plus the population of Green Bay, Wisconsin makes what":"The population of Wauwatosa, Wisconsin (47388) plus that of Green Bay, Wisconsin (104951) is 152339.","Auburn, Washington to the population of Mesa, Arizona":"The population of Auburn, Washington (75607) plus that of Mesa, Arizona (470456) is 546063.","Lawrence, Indiana to the population of Taunton, Massachusetts":"The population of Lawrence, Indiana (47415) plus that of Taunton, Massachusetts (56504) is 103919.","the population of Pinellas Park, Florida and Sammamish, Washington":"The population of Pinellas Park, Florida (50946) plus that of Sammamish, Washington (62136) is 113082.","the population of Newport News, Virginia and Lakewood, California":"The population of Newport News, Virginia (181606) plus that of Lakewood, California (81054) is 262660.","the population of Trujillo Alto, Puerto Rico and Towson, Maryland":"The population of Trujillo Alto, Puerto Rico (46226) plus that of Towson, Maryland (58189) is 104415.","Santa Clarita, California to the population of West Lafayette, Indiana":"The population of Santa Clarita, California (180303) plus that of West Lafayette, Indiana (44543) is 224846.","the population of Lakeland, Florida and Auburn, Washington":"The population of Lakeland, Florida (102714) plus that of Auburn, Washington (75607) is 178321.","Lakewood, California to the population of Wauwatosa, Wisconsin":"The population of Lakewood, California (81054) plus that of Wauwatosa, Wisconsin (47388) is 128442.","Pico Rivera, California plus the population of Melbourne, Florida makes what":"The population of Pico Rivera, California (63724) plus that of Melbourne, Florida (78911) is 142635.","Provo, Utah to the population of Atascocita, Texas":"The population of Provo, Utah (115718) plus that of Atascocita, Texas (72713) is 188431.","the population of Vista, California and Lawrence, Indiana":"The population of Vista, California (98560) plus that of Lawrence, Indiana (47415) is 145975.","Potomac, Maryland to the population of Alpharetta, Georgia":"The population of Potomac, Maryland (45882) plus that of Alpharetta, Georgia (63013) is 108895.","the population of Lombard, Illinois and Portland, Oregon":"The population of Lombard, Illinois (44025) plus that of Portland, Oregon (620589) is 664614.","Pompano Beach, Florida plus the population of Fayetteville, Arkansas makes what":"The population of Pompano Beach, Florida (106004) plus that of Fayetteville, Arkansas (80552) is 186556.","the population of Brownsville, Texas and Binghamton, New York":"The population of Brownsville, Texas (182110) plus that of Binghamton, New York (46277) is 228387.","Tustin, California to the population of Lee's Summit, Missouri":"The population of Tustin, California (79396) plus that of Lee's Summit, Missouri (94257) is 173653.","Bellflower, California to the population of Boulder, Colorado":"The population of Bellflower, California (77687) plus that of Boulder, Colorado (105420) is 183107.","Glendale, California to the population of Burke, Virginia":"The population of Glendale, California (197895) plus that of Burke, Virginia (42290) is 240185.","the population of Yuma, Arizona and Conway, Arkansas":"The population of Yuma, Arizona (93704) plus that of Conway, Arkansas (64184) is 157888.","Lakeville, Minnesota to the population of Edinburg, Texas":"The population of Lakeville, Minnesota (59786) plus that of Edinburg, Texas (84399) is 144185.","Conroe, Texas to the population of Dearborn, Michigan":"The population of Conroe, Texas (74482) plus that of Dearborn, Michigan (95520) is 170002.","Methuen Town, Massachusetts to the population of Madera, California":"The population of Methuen Town, Massachusetts (49043) plus that of Madera, California (63398) is 112441.","Mesa, Arizona plus the population of Trujillo Alto, Puerto Rico makes what":"The population of Mesa, Arizona (470456) plus that of Trujillo Alto, Puerto Rico (46226) is 516682.","the population of Albany, New York and Fairfield, Ohio":"The population of Albany, New York (98425) plus that of Fairfield, Ohio (42640) is 141065.","the population of Hillsboro, Oregon and Spokane Valley, Washington":"The population of Hillsboro, Oregon (100462) plus that of Spokane Valley, Washington (93322) is 193784.","Pine Hills, Florida plus the population of The Woodlands, Texas makes what":"The population of Pine Hills, Florida (69733) plus that of The Woodlands, Texas (108373) is 178106.","Tuckahoe, Virginia plus the population of Fontana, California makes what":"The population of Tuckahoe, Virginia (47997) plus that of Fontana, California (205228) is 253225.","the population of Barnstable Town, Massachusetts and Conroe, Texas":"The population of Barnstable Town, Massachusetts (44498) plus that of Conroe, Texas (74482) is 118980.","the population of Brockton, Massachusetts and Hoboken, New Jersey":"The population of Brockton, Massachusetts (94813) plus that of Hoboken, New Jersey (53136) is 147949.","Spokane Valley, Washington to the population of New Britain, Connecticut":"The population of Spokane Valley, Washington (93322) plus that of New Britain, Connecticut (72876) is 166198.","Everett, Washington to the population of Pico Rivera, California":"The population of Everett, Washington (106580) plus that of Pico Rivera, California (63724) is 170304.","the population of Fontana, California and Glendale, California":"The population of Fontana, California (205228) plus that of Glendale, California (197895) is 403123.","Madera, California plus the population of Oklahoma City, Oklahoma makes what":"The population of Madera, California (63398) plus that of Oklahoma City, Oklahoma (620015) is 683413.","the population of Kingsport, Tennessee and Santa Clarita, California":"The population of Kingsport, Tennessee (52871) plus that of Santa Clarita, California (180303) is 233174.","the population of Beaumont, Texas and Concord, North Carolina":"The population of Beaumont, Texas (117729) plus that of Concord, North Carolina (85753) is 203482.","Portland, Oregon to the population of Lafayette, Louisiana":"The population of Portland, Oregon (620589) plus that of Lafayette, Louisiana (125808) is 746397.","South Gate, California plus the population of Bedford, Texas makes what":"The population of South Gate, California (95219) plus that of Bedford, Texas (48864) is 144083.","Pasadena, California to the population of South Gate, California":"The population of Pasadena, California (140268) plus that of South Gate, California (95219) is 235487.","San Marcos, Texas plus the population of Beaumont, Texas makes what":"The population of San Marcos, Texas (57743) plus that of Beaumont, Texas (117729) is 175472.","New Britain, Connecticut plus the population of Medford, Oregon makes what":"The population of New Britain, Connecticut (72876) plus that of Medford, Oregon (78856) is 151732.","Clearwater, Florida plus the population of Lombard, Illinois makes what":"The population of Clearwater, Florida (111747) plus that of Lombard, Illinois (44025) is 155772.","Rowlett, Texas plus the population of Jefferson City, Missouri makes what":"The population of Rowlett, Texas (59203) plus that of Jefferson City, Missouri (43143) is 102346."}}},
{"id":"n-0f7757a3","guard":[["has","population"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the sum of the population of Greeley, Colorado and Potomac, Maryland":"The population of Greeley, Colorado (98975) plus that of Potomac, Maryland (45882) is 144857.","the sum of the population of Chesapeake, Virginia and Utica, New York":"The population of Chesapeake, Virginia (233194) plus that of Utica, New York (61337) is 294531.","the sum of the population of Lake Charles, Louisiana and Provo, Utah":"The population of Lake Charles, Louisiana (75044) plus that of Provo, Utah (115718) is 190762.","the sum of the population of Sarasota, Florida and Bellflower, California":"The population of Sarasota, Florida (54425) plus that of Bellflower, California (77687) is 132112.","the sum of the population of Mobile, Alabama and Harrisburg, Pennsylvania":"The population of Mobile, Alabama (193717) plus that of Harrisburg, Pennsylvania (49160) is 242877.","the sum of the population of Medford, Oregon and Methuen Town, Massachusetts":"The population of Medford, Oregon (78856) plus that of Methuen Town, Massachusetts (49043) is 127899.","the sum of the population of Bedford, Texas and Honolulu, Hawaii":"The population of Bedford, Texas (48864) plus that of Honolulu, Hawaii (349597) is 398461.","the sum of the population of Indianapolis, Indiana and Carson City, Nevada":"The population of Indianapolis, Indiana (846674) plus that of Carson City, Nevada (54412) is 901086.","the sum of the population of Oklahoma City, Oklahoma and Peabody, Massachusetts":"The population of Oklahoma City, Oklahoma (620015) plus that of Peabody, Massachusetts (52235) is 672250.","the sum of the population of Bossier City, Louisiana and Virginia Beach, Virginia":"The population of Bossier City, Louisiana (67152) plus that of Virginia Beach, Virginia (449733) is 516885.","the sum of the population of The Woodlands, Texas and Yorba Linda, California":"The population of The Woodlands, Texas (108373) plus that of Yorba Linda, California (67362) is 175735.","the sum of the population of Tempe, Arizona and Tonawanda, New York":"The population of Tempe, Arizona (174708) plus that of Tonawanda, New York (57844) is 232552.","the sum of the population of Melbourne, Florida and Rochester, Minnesota":"The population of Melbourne, Florida (78911) plus that of Rochester, Minnesota (111396) is 190307.","the sum of the population of Jefferson City, Missouri and Sugar Land, Texas":"The population of Jefferson City, Missouri (43143) plus that of Sugar Land, Texas (85681) is 128824.","the sum of the population of Green Bay, Wisconsin and Everett, Washington":"The population of Green Bay, Wisconsin (104951) plus that of Everett, Washington (106580) is 211531.","the sum of the population of Danville, California and Lakeville, Minnesota":"The population of Danville, California (43758) plus that of Lakeville, Minnesota (59786) is 103544.","the sum of the population of Glen Burnie, Maryland and Palm Bay, Florida":"The population of Glen Burnie, Maryland (69060) plus that of Palm Bay, Florida (106573) is 175633.","the sum of the population of Fayetteville, Arkansas and Tustin, California":"The population of Fayetteville, Arkansas (80552) plus that of Tustin, California (79396) is 159948.","the sum of the population of Commerce City, Colorado and Pasadena, California":"The population of Commerce City, Colorado (51731) plus that of Pasadena, California (140268) is 191999.","the sum of the population of Pinellas Park, Florida and Sammamish, Washington":"The population of Pinellas Park, Florida (50946) plus that of Sammamish, Washington (62136) is 113082.","the sum of the population of Newport News, Virginia and Lakewood, California":"The population of Newport News, Virginia (181606) plus that of Lakewood, California (81054) is 262660.","the sum of the population of Trujillo Alto, Puerto Rico and Towson, Maryland":"The population of Trujillo Alto, Puerto Rico (46226) plus that of Towson, Maryland (58189) is 104415.","the sum of the population of Lakeland, Florida and Auburn, Washington":"The population of Lakeland, Florida (102714) plus that of Auburn, Washington (75607) is 178321.","the sum of the population of Vista, California and Lawrence, Indiana":"The population of Vista, California (98560) plus that of Lawrence, Indiana (47415) is 145975.","the sum of the population of Lombard, Illinois and Portland, Oregon":"The population of Lombard, Illinois (44025) plus that of Portland, Oregon (620589) is 664614.","the sum of the population of Brownsville, Texas and Binghamton, New York":"The population of Brownsville, Texas (182110) plus that of Binghamton, New York (46277) is 228387.","the sum of the population of Yuma, Arizona and Conway, Arkansas":"The population of Yuma, Arizona (93704) plus that of Conway, Arkansas (64184) is 157888.","the sum of the population of Albany, New York and Fairfield, Ohio":"The population of Albany, New York (98425) plus that of Fairfield, Ohio (42640) is 141065.","the sum of the population of Hillsboro, Oregon and Spokane Valley, Washington":"The population of Hillsboro, Oregon (100462) plus that of Spokane Valley, Washington (93322) is 193784.","the sum of the population of Barnstable Town, Massachusetts and Conroe, Texas":"The population of Barnstable Town, Massachusetts (44498) plus that of Conroe, Texas (74482) is 118980.","the sum of the population of Brockton, Massachusetts and Hoboken, New Jersey":"The population of Brockton, Massachusetts (94813) plus that of Hoboken, New Jersey (53136) is 147949.","the sum of the population of Fontana, California and Glendale, California":"The population of Fontana, California (205228) plus that of Glendale, California (197895) is 403123.","the sum of the population of Kingsport, Tennessee and Santa Clarita, California":"The population of Kingsport, Tennessee (52871) plus that of Santa Clarita, California (180303) is 233174.","the sum of the population of Beaumont, Texas and Concord, North Carolina":"The population of Beaumont, Texas (117729) plus that of Concord, North Carolina (85753) is 203482."}}},
{"id":"n-09405696","guard":[["hasAny",["added to","coachella","decimal places","more than","round to","rounded to"]]],"pyramid":["render.number",["transform.add",{"lit":42640},["transform.roundTo",{"lit":43826},["sense.wordCount"]]]],"mem":null},
{"id":"n-0015903e","guard":[["hasAny",["add","burke","california","glendale","population","virginia"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Glendale, California to the population of Burke, Virginia":"The population of Glendale, California (197895) plus that of Burke, Virginia (42290) is 240185."}}},
{"id":"n-0034970b","guard":[["hasAny",["brockton","hoboken","jersey","massachusetts","new","population","sum"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Brockton, Massachusetts and Hoboken, New Jersey":"The population of Brockton, Massachusetts (94813) plus that of Hoboken, New Jersey (53136) is 147949."}}},
{"id":"n-017ecea6","guard":[["hasAny",["arizona","arkansas","conway","population","sum","yuma"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Yuma, Arizona and Conway, Arkansas":"The population of Yuma, Arizona (93704) plus that of Conway, Arkansas (64184) is 157888."}}},
{"id":"n-0249c0bf","guard":[["hasAny",["add","california","clarita","indiana","lafayette","population","santa","west"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Santa Clarita, California to the population of West Lafayette, Indiana":"The population of Santa Clarita, California (180303) plus that of West Lafayette, Indiana (44543) is 224846."}}},
{"id":"n-03a325c7","guard":[["hasAny",["carson","city","indiana","indianapolis","nevada","population","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Indianapolis, Indiana and Carson City, Nevada":"The population of Indianapolis, Indiana (846674) plus that of Carson City, Nevada (54412) is 901086."}}},
{"id":"n-0432eeaf","guard":[["hasAny",["carolina","charles","kannapolis","lake","louisiana","makes","north","plus","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Kannapolis, North Carolina plus the population of Lake Charles, Louisiana makes what":"The population of Kannapolis, North Carolina (45685) plus that of Lake Charles, Louisiana (75044) is 120729."}}},
{"id":"n-07e33699","guard":[["hasAny",["california","city","colorado","commerce","pasadena","population","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Commerce City, Colorado and Pasadena, California":"The population of Commerce City, Colorado (51731) plus that of Pasadena, California (140268) is 191999."}}},
{"id":"n-0badda1f","guard":[["hasAny",["california","city","colorado","commerce","pasadena","population","sum"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Commerce City, Colorado and Pasadena, California":"The population of Commerce City, Colorado (51731) plus that of Pasadena, California (140268) is 191999."}}},
{"id":"n-0bdd9dbd","guard":[["hasAny",["add","california","minnesota","population","rochester","victorville"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Rochester, Minnesota to the population of Victorville, California":"The population of Rochester, Minnesota (111396) plus that of Victorville, California (121320) is 232716."}}},
{"id":"n-0c3251b0","guard":[["hasAny",["add","binghamton","new","population","tuckahoe","virginia","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Binghamton, New York to the population of Tuckahoe, Virginia":"The population of Binghamton, New York (46277) plus that of Tuckahoe, Virginia (47997) is 94274."}}},
{"id":"n-0d8dfe70","guard":[["hasAny",["add","california","minnesota","population","rochester","victorville"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Rochester, Minnesota to the population of Victorville, California":"The population of Rochester, Minnesota (111396) plus that of Victorville, California (121320) is 232716."}}},
{"id":"n-0e0b9fc2","guard":[["hasAny",["burnie","dearborn","glen","makes","maryland","michigan","plus","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Dearborn, Michigan plus the population of Glen Burnie, Maryland makes what":"The population of Dearborn, Michigan (95520) plus that of Glen Burnie, Maryland (69060) is 164580."}}},
{"id":"n-11de57ab","guard":[["hasAny",["bedford","california","gate","makes","plus","population","south","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of South Gate, California plus the population of Bedford, Texas makes what":"The population of South Gate, California (95219) plus that of Bedford, Texas (48864) is 144083."}}},
{"id":"n-137ef076","guard":[["hasAny",["indiana","indianapolis","makes","massachusetts","plus","population","taunton"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Taunton, Massachusetts plus the population of Indianapolis, Indiana makes what":"The population of Taunton, Massachusetts (56504) plus that of Indianapolis, Indiana (846674) is 903178."}}},
{"id":"n-13c9019b","guard":[["hasAny",["add","lafayette","louisiana","oregon","population","portland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Portland, Oregon to the population of Lafayette, Louisiana":"The population of Portland, Oregon (620589) plus that of Lafayette, Louisiana (125808) is 746397."}}},
{"id":"n-145f19dc","guard":[["hasAny",["carolina","charles","kannapolis","lake","louisiana","makes","north","plus","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Kannapolis, North Carolina plus the population of Lake Charles, Louisiana makes what":"The population of Kannapolis, North Carolina (45685) plus that of Lake Charles, Louisiana (75044) is 120729."}}},
{"id":"n-15e8857e","guard":[["hasAny",["add","arizona","auburn","mesa","population","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Auburn, Washington to the population of Mesa, Arizona":"The population of Auburn, Washington (75607) plus that of Mesa, Arizona (470456) is 546063."}}},
{"id":"n-18587aff","guard":[["hasAny",["add","florissant","maryland","missouri","population","towson"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Towson, Maryland to the population of Florissant, Missouri":"The population of Towson, Maryland (58189) plus that of Florissant, Missouri (52218) is 110407."}}},
{"id":"n-1958ea4c","guard":[["hasAny",["florida","lakeland","makes","new","plus","population","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of New York, New York plus the population of Lakeland, Florida makes what":"The population of New York, New York (8461961) plus that of Lakeland, Florida (102714) is 8564675."}}},
{"id":"n-1a38ff9f","guard":[["hasAny",["bay","burnie","florida","glen","maryland","palm","population","sum"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Glen Burnie, Maryland and Palm Bay, Florida":"The population of Glen Burnie, Maryland (69060) plus that of Palm Bay, Florida (106573) is 175633."}}},
{"id":"n-1b62ab7b","guard":[["hasAny",["arkansas","california","fayetteville","population","sum","tustin"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Fayetteville, Arkansas and Tustin, California":"The population of Fayetteville, Arkansas (80552) plus that of Tustin, California (79396) is 159948."}}},
{"id":"n-1c441b41","guard":[["hasAny",["add","lafayette","louisiana","oregon","population","portland"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Portland, Oregon to the population of Lafayette, Louisiana":"The population of Portland, Oregon (620589) plus that of Lafayette, Louisiana (125808) is 746397."}}},
{"id":"n-1c931c98","guard":[["hasAny",["binghamton","brownsville","new","population","sum","texas","york"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Brownsville, Texas and Binghamton, New York":"The population of Brownsville, Texas (182110) plus that of Binghamton, New York (46277) is 228387."}}},
{"id":"n-1ef7092d","guard":[["hasAny",["bossier","california","city","coachella","louisiana","makes","plus","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Coachella, California plus the population of Bossier City, Louisiana makes what":"The population of Coachella, California (43826) plus that of Bossier City, Louisiana (67152) is 110978."}}},
{"id":"n-206c7406","guard":[["hasAny",["hills","pine","woodlands"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Pine Hills, Florida plus the population of The Woodlands, Texas makes what":"The population of Pine Hills, Florida (69733) plus that of The Woodlands, Texas (108373) is 178106."}}},
{"id":"n-214f1301","guard":[["hasAny",["add","conroe","dearborn","michigan","population","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Conroe, Texas to the population of Dearborn, Michigan":"The population of Conroe, Texas (74482) plus that of Dearborn, Michigan (95520) is 170002."}}},
{"id":"n-245b1287","guard":[["hasAny",["add","bruno","california","carolina","concord","north","population","san"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Concord, North Carolina to the population of San Bruno, California":"The population of Concord, North Carolina (85753) plus that of San Bruno, California (42736) is 128489."}}},
{"id":"n-271741c6","guard":[["hasAny",["albany","fairfield","new","ohio","population","sum","york"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Albany, New York and Fairfield, Ohio":"The population of Albany, New York (98425) plus that of Fairfield, Ohio (42640) is 141065."}}},
{"id":"n-27df90b4","guard":[["hasAny",["massachusetts","medford","methuen","oregon","population","sum","town"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Medford, Oregon and Methuen Town, Massachusetts":"The population of Medford, Oregon (78856) plus that of Methuen Town, Massachusetts (49043) is 127899."}}},
{"id":"n-284a5282","guard":[["hasAny",["add","alpharetta","georgia","maryland","population","potomac"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Potomac, Maryland to the population of Alpharetta, Georgia":"The population of Potomac, Maryland (45882) plus that of Alpharetta, Georgia (63013) is 108895."}}},
{"id":"n-2861797c","guard":[["hasAny",["add","hattiesburg","land","mississippi","population","sugar","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Sugar Land, Texas to the population of Hattiesburg, Mississippi":"The population of Sugar Land, Texas (85681) plus that of Hattiesburg, Mississippi (46846) is 132527."}}},
{"id":"n-2ae8a601","guard":[["hasAny",["add","clearwater","florida","hawaii","honolulu","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Honolulu, Hawaii to the population of Clearwater, Florida":"The population of Honolulu, Hawaii (349597) plus that of Clearwater, Florida (111747) is 461344."}}},
{"id":"n-2b249a9a","guard":[["hasAny",["california","linda","population","sum","texas","woodlands","yorba"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of The Woodlands, Texas and Yorba Linda, California":"The population of The Woodlands, Texas (108373) plus that of Yorba Linda, California (67362) is 175735."}}},
{"id":"n-2fb4c52f","guard":[["hasAny",["add","california","lakewood","population","wauwatosa","wisconsin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Lakewood, California to the population of Wauwatosa, Wisconsin":"The population of Lakewood, California (81054) plus that of Wauwatosa, Wisconsin (47388) is 128442."}}},
{"id":"n-31582b1f","guard":[["hasAny",["alto","maryland","population","puerto","rico","sum","towson","trujillo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Trujillo Alto, Puerto Rico and Towson, Maryland":"The population of Trujillo Alto, Puerto Rico (46226) plus that of Towson, Maryland (58189) is 104415."}}},
{"id":"n-32ef7302","guard":[["hasAny",["add","hattiesburg","land","mississippi","population","sugar","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Sugar Land, Texas to the population of Hattiesburg, Mississippi":"The population of Sugar Land, Texas (85681) plus that of Hattiesburg, Mississippi (46846) is 132527."}}},
{"id":"n-32fbe6c8","guard":[["hasAny",["colorado","florida","greeley","makes","ocala","plus","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Ocala, Florida plus the population of Greeley, Colorado makes what":"The population of Ocala, Florida (57873) plus that of Greeley, Colorado (98975) is 156848."}}},
{"id":"n-358ea03f","guard":[["hasAny",["burnie","dearborn","glen","makes","maryland","michigan","plus","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Dearborn, Michigan plus the population of Glen Burnie, Maryland makes what":"The population of Dearborn, Michigan (95520) plus that of Glen Burnie, Maryland (69060) is 164580."}}},
{"id":"n-381cc40d","guard":[["hasAny",["massachusetts","medford","methuen","oregon","population","sum","town"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Medford, Oregon and Methuen Town, Massachusetts":"The population of Medford, Oregon (78856) plus that of Methuen Town, Massachusetts (49043) is 127899."}}},
{"id":"n-39ae2026","guard":[["hasAny",["makes","newport","news","ohio","plus","population","springfield","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Springfield, Ohio plus the population of Newport News, Virginia makes what":"The population of Springfield, Ohio (59761) plus that of Newport News, Virginia (181606) is 241367."}}},
{"id":"n-3a1dce3e","guard":[["hasAny",["add","florida","gainesville","massachusetts","peabody","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Peabody, Massachusetts to the population of Gainesville, Florida":"The population of Peabody, Massachusetts (52235) plus that of Gainesville, Florida (128610) is 180845."}}},
{"id":"n-3a4ff123","guard":[["hasAny",["bellflower","california","florida","population","sarasota","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Sarasota, Florida and Bellflower, California":"The population of Sarasota, Florida (54425) plus that of Bellflower, California (77687) is 132112."}}},
{"id":"n-3a6199f6","guard":[["hasAny",["city","jefferson","makes","missouri","plus","population","rowlett","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Rowlett, Texas plus the population of Jefferson City, Missouri makes what":"The population of Rowlett, Texas (59203) plus that of Jefferson City, Missouri (43143) is 102346."}}},
{"id":"n-3cb12591","guard":[["hasAny",["california","danville","lakeville","minnesota","population","sum"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Danville, California and Lakeville, Minnesota":"The population of Danville, California (43758) plus that of Lakeville, Minnesota (59786) is 103544."}}},
{"id":"n-3da57641","guard":[["hasAny",["colorado","florida","greeley","makes","ocala","plus","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Ocala, Florida plus the population of Greeley, Colorado makes what":"The population of Ocala, Florida (57873) plus that of Greeley, Colorado (98975) is 156848."}}},
{"id":"n-3e5534e3","guard":[["hasAny",["florida","park","pinellas","population","sammamish","sum","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Pinellas Park, Florida and Sammamish, Washington":"The population of Pinellas Park, Florida (50946) plus that of Sammamish, Washington (62136) is 113082."}}},
{"id":"n-3e5e92bd","guard":[["hasAny",["city","jefferson","land","missouri","population","sugar","sum","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Jefferson City, Missouri and Sugar Land, Texas":"The population of Jefferson City, Missouri (43143) plus that of Sugar Land, Texas (85681) is 128824."}}},
{"id":"n-3fcfd067","guard":[["hasAny",["add","carolina","kannapolis","north","population","sammamish","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Sammamish, Washington to the population of Kannapolis, North Carolina":"The population of Sammamish, Washington (62136) plus that of Kannapolis, North Carolina (45685) is 107821."}}},
{"id":"n-4018e1cc","guard":[["hasAny",["florida","melbourne","minnesota","population","rochester","sum"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Melbourne, Florida and Rochester, Minnesota":"The population of Melbourne, Florida (78911) plus that of Rochester, Minnesota (111396) is 190307."}}},
{"id":"n-4047b9a0","guard":[["hasAny",["add","california","lees","missouri","population","summit","tustin"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Tustin, California to the population of Lee's Summit, Missouri":"The population of Tustin, California (79396) plus that of Lee's Summit, Missouri (94257) is 173653."}}},
{"id":"n-42342589","guard":[["hasAny",["beaumont","carolina","concord","north","population","sum","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Beaumont, Texas and Concord, North Carolina":"The population of Beaumont, Texas (117729) plus that of Concord, North Carolina (85753) is 203482."}}},
{"id":"n-42520863","guard":[["hasAny",["add","california","gate","pasadena","population","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Pasadena, California to the population of South Gate, California":"The population of Pasadena, California (140268) plus that of South Gate, California (95219) is 235487."}}},
{"id":"n-47a5d8b7","guard":[["hasAny",["bay","green","makes","plus","population","wauwatosa","wisconsin"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Wauwatosa, Wisconsin plus the population of Green Bay, Wisconsin makes what":"The population of Wauwatosa, Wisconsin (47388) plus that of Green Bay, Wisconsin (104951) is 152339."}}},
{"id":"n-47cd3314","guard":[["hasAny",["florida","hattiesburg","makes","mississippi","plus","population","sarasota"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Hattiesburg, Mississippi plus the population of Sarasota, Florida makes what":"The population of Hattiesburg, Mississippi (46846) plus that of Sarasota, Florida (54425) is 101271."}}},
{"id":"n-48933251","guard":[["hasAny",["add","alpharetta","georgia","maryland","population","potomac"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Potomac, Maryland to the population of Alpharetta, Georgia":"The population of Potomac, Maryland (45882) plus that of Alpharetta, Georgia (63013) is 108895."}}},
{"id":"n-49f93aa8","guard":[["hasAny",["florida","hills","makes","pine","plus","population","texas","woodlands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Pine Hills, Florida plus the population of The Woodlands, Texas makes what":"The population of Pine Hills, Florida (69733) plus that of The Woodlands, Texas (108373) is 178106."}}},
{"id":"n-4a12f3dc","guard":[["hasAny",["california","florissant","makes","missouri","plus","population","vista"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Florissant, Missouri plus the population of Vista, California makes what":"The population of Florissant, Missouri (52218) plus that of Vista, California (98560) is 150778."}}},
{"id":"n-4b515668","guard":[["hasAny",["california","lakewood","newport","news","population","sum","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Newport News, Virginia and Lakewood, California":"The population of Newport News, Virginia (181606) plus that of Lakewood, California (81054) is 262660."}}},
{"id":"n-4c8f811f","guard":[["hasAny",["city","colorado","commerce","indiana","lafayette","makes","plus","population","west"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of West Lafayette, Indiana plus the population of Commerce City, Colorado makes what":"The population of West Lafayette, Indiana (44543) plus that of Commerce City, Colorado (51731) is 96274."}}},
{"id":"n-4cc47036","guard":[["hasAny",["alabama","california","makes","mobile","plus","population","victorville"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Victorville, California plus the population of Mobile, Alabama makes what":"The population of Victorville, California (121320) plus that of Mobile, Alabama (193717) is 315037."}}},
{"id":"n-4d10a052","guard":[["hasAny",["beaumont","makes","marcos","plus","population","san","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of San Marcos, Texas plus the population of Beaumont, Texas makes what":"The population of San Marcos, Texas (57743) plus that of Beaumont, Texas (117729) is 175472."}}},
{"id":"n-4d5cfbd2","guard":[["hasAny",["california","florissant","makes","missouri","plus","population","vista"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Florissant, Missouri plus the population of Vista, California makes what":"The population of Florissant, Missouri (52218) plus that of Vista, California (98560) is 150778."}}},
{"id":"n-4da23fbe","guard":[["hasAny",["alto","arizona","makes","mesa","plus","population","puerto","rico","trujillo"]],["has","mesa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Mesa, Arizona plus the population of Trujillo Alto, Puerto Rico makes what":"The population of Mesa, Arizona (470456) plus that of Trujillo Alto, Puerto Rico (46226) is 516682."}}},
{"id":"n-4e353e99","guard":[["hasAny",["boulder","california","colorado","danville","makes","plus","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Boulder, Colorado plus the population of Danville, California makes what":"The population of Boulder, Colorado (105420) plus that of Danville, California (43758) is 149178."}}},
{"id":"n-4e38bfee","guard":[["hasAny",["beaumont","carolina","concord","north","population","sum","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Beaumont, Texas and Concord, North Carolina":"The population of Beaumont, Texas (117729) plus that of Concord, North Carolina (85753) is 203482."}}},
{"id":"n-4e7ab138","guard":[["hasAny",["bedford","california","gate","makes","plus","population","south","texas"]],["has","the"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of South Gate, California plus the population of Bedford, Texas makes what":"The population of South Gate, California (95219) plus that of Bedford, Texas (48864) is 144083."}}},
{"id":"n-500e9d34","guard":[["hasAny",["arizona","arkansas","conway","population","sum","yuma"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Yuma, Arizona and Conway, Arkansas":"The population of Yuma, Arizona (93704) plus that of Conway, Arkansas (64184) is 157888."}}},
{"id":"n-5263bd9a","guard":[["hasAny",["alabama","harrisburg","mobile","pennsylvania","population","sum"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Mobile, Alabama and Harrisburg, Pennsylvania":"The population of Mobile, Alabama (193717) plus that of Harrisburg, Pennsylvania (49160) is 242877."}}},
{"id":"n-56d2ca23","guard":[["hasAny",["colorado","greeley","maryland","population","potomac","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Greeley, Colorado and Potomac, Maryland":"The population of Greeley, Colorado (98975) plus that of Potomac, Maryland (45882) is 144857."}}},
{"id":"n-5b7a6024","guard":[["hasAny",["city","jefferson","makes","missouri","plus","population","rowlett","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Rowlett, Texas plus the population of Jefferson City, Missouri makes what":"The population of Rowlett, Texas (59203) plus that of Jefferson City, Missouri (43143) is 102346."}}},
{"id":"n-5b8f50fd","guard":[["hasAny",["hillsboro","oregon","population","spokane","sum","valley","washington"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Hillsboro, Oregon and Spokane Valley, Washington":"The population of Hillsboro, Oregon (100462) plus that of Spokane Valley, Washington (93322) is 193784."}}},
{"id":"n-5c30cb40","guard":[["hasAny",["add","britain","connecticut","new","population","spokane","valley","washington"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Spokane Valley, Washington to the population of New Britain, Connecticut":"The population of Spokane Valley, Washington (93322) plus that of New Britain, Connecticut (72876) is 166198."}}},
{"id":"n-5c4c019b","guard":[["hasAny",["add","burke","california","glendale","population","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Glendale, California to the population of Burke, Virginia":"The population of Glendale, California (197895) plus that of Burke, Virginia (42290) is 240185."}}},
{"id":"n-5da366d2","guard":[["hasAny",["arkansas","california","fayetteville","population","sum","tustin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Fayetteville, Arkansas and Tustin, California":"The population of Fayetteville, Arkansas (80552) plus that of Tustin, California (79396) is 159948."}}},
{"id":"n-5e802254","guard":[["hasAny",["colorado","greeley","maryland","population","potomac","sum"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Greeley, Colorado and Potomac, Maryland":"The population of Greeley, Colorado (98975) plus that of Potomac, Maryland (45882) is 144857."}}},
{"id":"n-6282ff0c","guard":[["hasAny",["add","california","coachella","fairfield","ohio","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Fairfield, Ohio to the population of Coachella, California":"The population of Fairfield, Ohio (42640) plus that of Coachella, California (43826) is 86466."}}},
{"id":"n-66065239","guard":[["hasAny",["chesapeake","new","population","sum","utica","virginia","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Chesapeake, Virginia and Utica, New York":"The population of Chesapeake, Virginia (233194) plus that of Utica, New York (61337) is 294531."}}},
{"id":"n-67f9e9ed","guard":[["hasAny",["arkansas","beach","fayetteville","florida","makes","plus","pompano","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Pompano Beach, Florida plus the population of Fayetteville, Arkansas makes what":"The population of Pompano Beach, Florida (106004) plus that of Fayetteville, Arkansas (80552) is 186556."}}},
{"id":"n-698b9bc6","guard":[["hasAny",["barnstable","burke","makes","massachusetts","plus","population","town","virginia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Burke, Virginia plus the population of Barnstable Town, Massachusetts makes what":"The population of Burke, Virginia (42290) plus that of Barnstable Town, Massachusetts (44498) is 86788."}}},
{"id":"n-6a89994f","guard":[["hasAny",["add","california","madera","massachusetts","methuen","population","town"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Methuen Town, Massachusetts to the population of Madera, California":"The population of Methuen Town, Massachusetts (49043) plus that of Madera, California (63398) is 112441."}}},
{"id":"n-6bce3c57","guard":[["hasAny",["add","edinburg","lakeville","minnesota","population","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Lakeville, Minnesota to the population of Edinburg, Texas":"The population of Lakeville, Minnesota (59786) plus that of Edinburg, Texas (84399) is 144185."}}},
{"id":"n-6e3d8119","guard":[["hasAny",["alpharetta","brockton","georgia","makes","massachusetts","plus","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Alpharetta, Georgia plus the population of Brockton, Massachusetts makes what":"The population of Alpharetta, Georgia (63013) plus that of Brockton, Massachusetts (94813) is 157826."}}},
{"id":"n-6e54726f","guard":[["hasAny",["add","california","lakewood","population","wauwatosa","wisconsin"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Lakewood, California to the population of Wauwatosa, Wisconsin":"The population of Lakewood, California (81054) plus that of Wauwatosa, Wisconsin (47388) is 128442."}}},
{"id":"n-6ec75bef","guard":[["hasAny",["add","california","everett","pico","population","rivera","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Everett, Washington to the population of Pico Rivera, California":"The population of Everett, Washington (106580) plus that of Pico Rivera, California (63724) is 170304."}}},
{"id":"n-714580a6","guard":[["hasAny",["arizona","lafayette","louisiana","makes","plus","population","yuma"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Lafayette, Louisiana plus the population of Yuma, Arizona makes what":"The population of Lafayette, Louisiana (125808) plus that of Yuma, Arizona (93704) is 219512."}}},
{"id":"n-7239b272","guard":[["hasAny",["bedford","hawaii","honolulu","population","sum","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Bedford, Texas and Honolulu, Hawaii":"The population of Bedford, Texas (48864) plus that of Honolulu, Hawaii (349597) is 398461."}}},
{"id":"n-7274f6aa","guard":[["hasAny",["arizona","new","population","sum","tempe","tonawanda","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Tempe, Arizona and Tonawanda, New York":"The population of Tempe, Arizona (174708) plus that of Tonawanda, New York (57844) is 232552."}}},
{"id":"n-7339cbf5","guard":[["hasAny",["add","indiana","lawrence","massachusetts","population","taunton"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Lawrence, Indiana to the population of Taunton, Massachusetts":"The population of Lawrence, Indiana (47415) plus that of Taunton, Massachusetts (56504) is 103919."}}},
{"id":"n-73eff151","guard":[["hasAny",["chesapeake","edinburg","makes","plus","population","texas","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Edinburg, Texas plus the population of Chesapeake, Virginia makes what":"The population of Edinburg, Texas (84399) plus that of Chesapeake, Virginia (233194) is 317593."}}},
{"id":"n-7617067e","guard":[["hasAny",["california","fontana","glendale","population","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Fontana, California and Glendale, California":"The population of Fontana, California (205228) plus that of Glendale, California (197895) is 403123."}}},
{"id":"n-7770c9f1","guard":[["hasAny",["add","hoboken","jersey","new","ohio","population","springfield"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Hoboken, New Jersey to the population of Springfield, Ohio":"The population of Hoboken, New Jersey (53136) plus that of Springfield, Ohio (59761) is 112897."}}},
{"id":"n-7777e671","guard":[["hasAny",["ocala","tonawanda"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Tonawanda, New York to the population of Ocala, Florida":"The population of Tonawanda, New York (57844) plus that of Ocala, Florida (57873) is 115717."}}},
{"id":"n-785b9535","guard":[["hasAny",["california","florida","makes","melbourne","pico","plus","population","rivera"]],["has","plus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Pico Rivera, California plus the population of Melbourne, Florida makes what":"The population of Pico Rivera, California (63724) plus that of Melbourne, Florida (78911) is 142635."}}},
{"id":"n-799dd6c1","guard":[["hasAny",["arizona","new","population","sum","tempe","tonawanda","york"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Tempe, Arizona and Tonawanda, New York":"The population of Tempe, Arizona (174708) plus that of Tonawanda, New York (57844) is 232552."}}},
{"id":"n-79da3e31","guard":[["hasAny",["bay","burnie","florida","glen","maryland","palm","population","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Glen Burnie, Maryland and Palm Bay, Florida":"The population of Glen Burnie, Maryland (69060) plus that of Palm Bay, Florida (106573) is 175633."}}},
{"id":"n-7b2610c8","guard":[["hasAny",["alpharetta","brockton","georgia","makes","massachusetts","plus","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Alpharetta, Georgia plus the population of Brockton, Massachusetts makes what":"The population of Alpharetta, Georgia (63013) plus that of Brockton, Massachusetts (94813) is 157826."}}},
{"id":"n-7bc4a0ec","guard":[["hasAny",["hillsboro","lees","makes","missouri","oregon","plus","population","summit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Lee's Summit, Missouri plus the population of Hillsboro, Oregon makes what":"The population of Lee's Summit, Missouri (94257) plus that of Hillsboro, Oregon (100462) is 194719."}}},
{"id":"n-7ef7fabc","guard":[["hasAny",["add","carson","city","marcos","nevada","population","san","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Carson City, Nevada to the population of San Marcos, Texas":"The population of Carson City, Nevada (54412) plus that of San Marcos, Texas (57743) is 112155."}}},
{"id":"n-7fb7598d","guard":[["hasAny",["california","indiana","lawrence","population","sum","vista"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Vista, California and Lawrence, Indiana":"The population of Vista, California (98560) plus that of Lawrence, Indiana (47415) is 145975."}}},
{"id":"n-817c5f7a","guard":[["hasAny",["add","beach","florida","new","pompano","population","utica","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Utica, New York to the population of Pompano Beach, Florida":"The population of Utica, New York (61337) plus that of Pompano Beach, Florida (106004) is 167341."}}},
{"id":"n-83a404b3","guard":[["hasAny",["albany","fairfield","new","ohio","population","sum","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Albany, New York and Fairfield, Ohio":"The population of Albany, New York (98425) plus that of Fairfield, Ohio (42640) is 141065."}}},
{"id":"n-84249242","guard":[["hasAny",["add","bellflower","boulder","california","colorado","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Bellflower, California to the population of Boulder, Colorado":"The population of Bellflower, California (77687) plus that of Boulder, Colorado (105420) is 183107."}}},
{"id":"n-849914a2","guard":[["hasAny",["add","california","coachella","fairfield","ohio","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Fairfield, Ohio to the population of Coachella, California":"The population of Fairfield, Ohio (42640) plus that of Coachella, California (43826) is 86466."}}},
{"id":"n-849bbd5f","guard":[["hasAny",["alabama","harrisburg","mobile","pennsylvania","population","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Mobile, Alabama and Harrisburg, Pennsylvania":"The population of Mobile, Alabama (193717) plus that of Harrisburg, Pennsylvania (49160) is 242877."}}},
{"id":"n-8504b9ae","guard":[["hasAny",["florida","lakeland","makes","new","plus","population","york"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of New York, New York plus the population of Lakeland, Florida makes what":"The population of New York, New York (8461961) plus that of Lakeland, Florida (102714) is 8564675."}}},
{"id":"n-86b39536","guard":[["hasAny",["arizona","lafayette","louisiana","makes","plus","population","yuma"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Lafayette, Louisiana plus the population of Yuma, Arizona makes what":"The population of Lafayette, Louisiana (125808) plus that of Yuma, Arizona (93704) is 219512."}}},
{"id":"n-89663d32","guard":[["hasAny",["add","california","gate","pasadena","population","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Pasadena, California to the population of South Gate, California":"The population of Pasadena, California (140268) plus that of South Gate, California (95219) is 235487."}}},
{"id":"n-89d9c95f","guard":[["hasAny",["california","clarita","kingsport","population","santa","sum","tennessee"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Kingsport, Tennessee and Santa Clarita, California":"The population of Kingsport, Tennessee (52871) plus that of Santa Clarita, California (180303) is 233174."}}},
{"id":"n-8dcc5f12","guard":[["hasAny",["brownsville","florida","gainesville","makes","plus","population","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Gainesville, Florida plus the population of Brownsville, Texas makes what":"The population of Gainesville, Florida (128610) plus that of Brownsville, Texas (182110) is 310720."}}},
{"id":"n-8e301152","guard":[["hasAny",["california","fontana","makes","plus","population","tuckahoe","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Tuckahoe, Virginia plus the population of Fontana, California makes what":"The population of Tuckahoe, Virginia (47997) plus that of Fontana, California (205228) is 253225."}}},
{"id":"n-8f7e08be","guard":[["hasAny",["california","linda","population","sum","texas","woodlands","yorba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of The Woodlands, Texas and Yorba Linda, California":"The population of The Woodlands, Texas (108373) plus that of Yorba Linda, California (67362) is 175735."}}},
{"id":"n-901d8331","guard":[["hasAny",["california","fontana","glendale","population","sum"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Fontana, California and Glendale, California":"The population of Fontana, California (205228) plus that of Glendale, California (197895) is 403123."}}},
{"id":"n-907c0eab","guard":[["hasAny",["add","california","linda","new","population","yorba","york"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Yorba Linda, California to the population of New York, New York":"The population of Yorba Linda, California (67362) plus that of New York, New York (8461961) is 8529323."}}},
{"id":"n-90a7eb42","guard":[["hasAny",["beaumont","makes","marcos","plus","population","san","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of San Marcos, Texas plus the population of Beaumont, Texas makes what":"The population of San Marcos, Texas (57743) plus that of Beaumont, Texas (117729) is 175472."}}},
{"id":"n-91c9bd87","guard":[["hasAny",["brownsville","gainesville"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Gainesville, Florida plus the population of Brownsville, Texas makes what":"The population of Gainesville, Florida (128610) plus that of Brownsville, Texas (182110) is 310720."}}},
{"id":"n-9244833f","guard":[["hasAny",["add","florissant","maryland","missouri","population","towson"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Towson, Maryland to the population of Florissant, Missouri":"The population of Towson, Maryland (58189) plus that of Florissant, Missouri (52218) is 110407."}}},
{"id":"n-92db4f62","guard":[["hasAny",["add","california","lees","missouri","population","summit","tustin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Tustin, California to the population of Lee's Summit, Missouri":"The population of Tustin, California (79396) plus that of Lee's Summit, Missouri (94257) is 173653."}}},
{"id":"n-949604b5","guard":[["hasAny",["city","colorado","commerce","indiana","lafayette","makes","plus","population","west"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of West Lafayette, Indiana plus the population of Commerce City, Colorado makes what":"The population of West Lafayette, Indiana (44543) plus that of Commerce City, Colorado (51731) is 96274."}}},
{"id":"n-95f28582","guard":[["hasAny",["illinois","lombard","oregon","population","portland","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Lombard, Illinois and Portland, Oregon":"The population of Lombard, Illinois (44025) plus that of Portland, Oregon (620589) is 664614."}}},
{"id":"n-97afc90d","guard":[["hasAny",["add","harrisburg","pennsylvania","population","rowlett","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Harrisburg, Pennsylvania to the population of Rowlett, Texas":"The population of Harrisburg, Pennsylvania (49160) plus that of Rowlett, Texas (59203) is 108363."}}},
{"id":"n-98012a7d","guard":[["hasAny",["hillsboro","lees","makes","missouri","oregon","plus","population","summit"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Lee's Summit, Missouri plus the population of Hillsboro, Oregon makes what":"The population of Lee's Summit, Missouri (94257) plus that of Hillsboro, Oregon (100462) is 194719."}}},
{"id":"n-984cce83","guard":[["hasAny",["makes","newport","news","ohio","plus","population","springfield","virginia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Springfield, Ohio plus the population of Newport News, Virginia makes what":"The population of Springfield, Ohio (59761) plus that of Newport News, Virginia (181606) is 241367."}}},
{"id":"n-984ddf63","guard":[["hasAny",["add","bruno","california","carolina","concord","north","population","san"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Concord, North Carolina to the population of San Bruno, California":"The population of Concord, North Carolina (85753) plus that of San Bruno, California (42736) is 128489."}}},
{"id":"n-9d8bfa82","guard":[["hasAny",["albany","bruno","california","makes","new","plus","population","san","york"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of San Bruno, California plus the population of Albany, New York makes what":"The population of San Bruno, California (42736) plus that of Albany, New York (98425) is 141161."}}},
{"id":"n-9eb83aac","guard":[["hasAny",["california","florida","makes","melbourne","pico","plus","population","rivera"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Pico Rivera, California plus the population of Melbourne, Florida makes what":"The population of Pico Rivera, California (63724) plus that of Melbourne, Florida (78911) is 142635."}}},
{"id":"n-9f3626e3","guard":[["hasAny",["clearwater","florida","illinois","lombard","makes","plus","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Clearwater, Florida plus the population of Lombard, Illinois makes what":"The population of Clearwater, Florida (111747) plus that of Lombard, Illinois (44025) is 155772."}}},
{"id":"n-a27589e3","guard":[["hasAny",["barnstable","burke","makes","massachusetts","plus","population","town","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Burke, Virginia plus the population of Barnstable Town, Massachusetts makes what":"The population of Burke, Virginia (42290) plus that of Barnstable Town, Massachusetts (44498) is 86788."}}},
{"id":"n-a2f9cbb8","guard":[["hasAny",["britain","connecticut","makes","medford","new","oregon","plus","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of New Britain, Connecticut plus the population of Medford, Oregon makes what":"The population of New Britain, Connecticut (72876) plus that of Medford, Oregon (78856) is 151732."}}},
{"id":"n-a40dc832","guard":[["hasAny",["florida","hattiesburg","makes","mississippi","plus","population","sarasota"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Hattiesburg, Mississippi plus the population of Sarasota, Florida makes what":"The population of Hattiesburg, Mississippi (46846) plus that of Sarasota, Florida (54425) is 101271."}}},
{"id":"n-a4cfdb9e","guard":[["hasAny",["barnstable","conroe","massachusetts","population","sum","texas","town"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Barnstable Town, Massachusetts and Conroe, Texas":"The population of Barnstable Town, Massachusetts (44498) plus that of Conroe, Texas (74482) is 118980."}}},
{"id":"n-a4e8b57f","guard":[["hasAny",["add","florida","new","ocala","population","tonawanda","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Tonawanda, New York to the population of Ocala, Florida":"The population of Tonawanda, New York (57844) plus that of Ocala, Florida (57873) is 115717."}}},
{"id":"n-a5bdff4c","guard":[["hasAny",["california","lakewood","newport","news","population","sum","virginia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Newport News, Virginia and Lakewood, California":"The population of Newport News, Virginia (181606) plus that of Lakewood, California (81054) is 262660."}}},
{"id":"n-aa50cb57","guard":[["hasAny",["add","carolina","kannapolis","north","population","sammamish","washington"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Sammamish, Washington to the population of Kannapolis, North Carolina":"The population of Sammamish, Washington (62136) plus that of Kannapolis, North Carolina (45685) is 107821."}}},
{"id":"n-abdf3654","guard":[["hasAny",["charles","lake","louisiana","population","provo","sum","utah"]],["has","sum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Lake Charles, Louisiana and Provo, Utah":"The population of Lake Charles, Louisiana (75044) plus that of Provo, Utah (115718) is 190762."}}},
{"id":"n-ad7c2f60","guard":[["hasAny",["california","danville","lakeville","minnesota","population","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Danville, California and Lakeville, Minnesota":"The population of Danville, California (43758) plus that of Lakeville, Minnesota (59786) is 103544."}}},
{"id":"n-ae0a1755","guard":[["hasAny",["chesapeake","new","population","sum","utica","virginia","york"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Chesapeake, Virginia and Utica, New York":"The population of Chesapeake, Virginia (233194) plus that of Utica, New York (61337) is 294531."}}},
{"id":"n-ae2acc76","guard":[["hasAny",["binghamton","brownsville","new","population","sum","texas","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Brownsville, Texas and Binghamton, New York":"The population of Brownsville, Texas (182110) plus that of Binghamton, New York (46277) is 228387."}}},
{"id":"n-ae45d0b2","guard":[["hasAny",["chesapeake","edinburg","makes","plus","population","texas","virginia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Edinburg, Texas plus the population of Chesapeake, Virginia makes what":"The population of Edinburg, Texas (84399) plus that of Chesapeake, Virginia (233194) is 317593."}}},
{"id":"n-afe59720","guard":[["hasAny",["add","harrisburg","pennsylvania","population","rowlett","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Harrisburg, Pennsylvania to the population of Rowlett, Texas":"The population of Harrisburg, Pennsylvania (49160) plus that of Rowlett, Texas (59203) is 108363."}}},
{"id":"n-b26d58bb","guard":[["hasAny",["california","clarita","kingsport","population","santa","sum","tennessee"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Kingsport, Tennessee and Santa Clarita, California":"The population of Kingsport, Tennessee (52871) plus that of Santa Clarita, California (180303) is 233174."}}},
{"id":"n-b3348f6b","guard":[["hasAny",["add","bay","florida","hills","palm","pine","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Palm Bay, Florida to the population of Pine Hills, Florida":"The population of Palm Bay, Florida (106573) plus that of Pine Hills, Florida (69733) is 176306."}}},
{"id":"n-b61c2ea9","guard":[["hasAny",["auburn","florida","lakeland","population","sum","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Lakeland, Florida and Auburn, Washington":"The population of Lakeland, Florida (102714) plus that of Auburn, Washington (75607) is 178321."}}},
{"id":"n-b6467111","guard":[["hasAny",["add","arizona","auburn","mesa","population","washington"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Auburn, Washington to the population of Mesa, Arizona":"The population of Auburn, Washington (75607) plus that of Mesa, Arizona (470456) is 546063."}}},
{"id":"n-b660ec9d","guard":[["hasAny",["illinois","lombard","oregon","population","portland","sum"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Lombard, Illinois and Portland, Oregon":"The population of Lombard, Illinois (44025) plus that of Portland, Oregon (620589) is 664614."}}},
{"id":"n-b8b09917","guard":[["hasAny",["beach","bossier","city","louisiana","population","sum","virginia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Bossier City, Louisiana and Virginia Beach, Virginia":"The population of Bossier City, Louisiana (67152) plus that of Virginia Beach, Virginia (449733) is 516885."}}},
{"id":"n-b9dcd3a3","guard":[["hasAny",["city","massachusetts","oklahoma","peabody","population","sum"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Oklahoma City, Oklahoma and Peabody, Massachusetts":"The population of Oklahoma City, Oklahoma (620015) plus that of Peabody, Massachusetts (52235) is 672250."}}},
{"id":"n-bbdd72e4","guard":[["hasAny",["florida","park","pinellas","population","sammamish","sum","washington"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Pinellas Park, Florida and Sammamish, Washington":"The population of Pinellas Park, Florida (50946) plus that of Sammamish, Washington (62136) is 113082."}}},
{"id":"n-bd01d2bc","guard":[["hasAny",["add","binghamton","new","population","tuckahoe","virginia","york"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Binghamton, New York to the population of Tuckahoe, Virginia":"The population of Binghamton, New York (46277) plus that of Tuckahoe, Virginia (47997) is 94274."}}},
{"id":"n-c00e0072","guard":[["hasAny",["bellflower","california","florida","population","sarasota","sum"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Sarasota, Florida and Bellflower, California":"The population of Sarasota, Florida (54425) plus that of Bellflower, California (77687) is 132112."}}},
{"id":"n-c24c5c21","guard":[["hasAny",["add","indiana","lawrence","massachusetts","population","taunton"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Lawrence, Indiana to the population of Taunton, Massachusetts":"The population of Lawrence, Indiana (47415) plus that of Taunton, Massachusetts (56504) is 103919."}}},
{"id":"n-c434df5d","guard":[["hasAny",["add","california","madera","massachusetts","methuen","population","town"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Methuen Town, Massachusetts to the population of Madera, California":"The population of Methuen Town, Massachusetts (49043) plus that of Madera, California (63398) is 112441."}}},
{"id":"n-c6e0026b","guard":[["hasAny",["albany","bruno","california","makes","new","plus","population","san","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of San Bruno, California plus the population of Albany, New York makes what":"The population of San Bruno, California (42736) plus that of Albany, New York (98425) is 141161."}}},
{"id":"n-c749a2dc","guard":[["hasAny",["boulder","california","colorado","danville","makes","plus","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Boulder, Colorado plus the population of Danville, California makes what":"The population of Boulder, Colorado (105420) plus that of Danville, California (43758) is 149178."}}},
{"id":"n-c798935b","guard":[["hasAny",["clearwater","florida","illinois","lombard","makes","plus","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Clearwater, Florida plus the population of Lombard, Illinois makes what":"The population of Clearwater, Florida (111747) plus that of Lombard, Illinois (44025) is 155772."}}},
{"id":"n-c7cbdf62","guard":[["hasAny",["bossier","coachella","louisiana"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Coachella, California plus the population of Bossier City, Louisiana makes what":"The population of Coachella, California (43826) plus that of Bossier City, Louisiana (67152) is 110978."}}},
{"id":"n-ca5d3efd","guard":[["hasAny",["charles","lake","louisiana","population","provo","sum","utah"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Lake Charles, Louisiana and Provo, Utah":"The population of Lake Charles, Louisiana (75044) plus that of Provo, Utah (115718) is 190762."}}},
{"id":"n-cb9a6a3e","guard":[["hasAny",["add","california","linda","new","population","yorba","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Yorba Linda, California to the population of New York, New York":"The population of Yorba Linda, California (67362) plus that of New York, New York (8461961) is 8529323."}}},
{"id":"n-cc121c7c","guard":[["hasAny",["add","atascocita","population","provo","texas","utah"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Provo, Utah to the population of Atascocita, Texas":"The population of Provo, Utah (115718) plus that of Atascocita, Texas (72713) is 188431."}}},
{"id":"n-cc5362c1","guard":[["hasAny",["city","jefferson","land","missouri","population","sugar","sum","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Jefferson City, Missouri and Sugar Land, Texas":"The population of Jefferson City, Missouri (43143) plus that of Sugar Land, Texas (85681) is 128824."}}},
{"id":"n-ccd83203","guard":[["hasAny",["florida","melbourne","minnesota","population","rochester","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Melbourne, Florida and Rochester, Minnesota":"The population of Melbourne, Florida (78911) plus that of Rochester, Minnesota (111396) is 190307."}}},
{"id":"n-cd484137","guard":[["hasAny",["florida","makes","orem","park","pinellas","plus","population","utah"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Orem, Utah plus the population of Pinellas Park, Florida makes what":"The population of Orem, Utah (93220) plus that of Pinellas Park, Florida (50946) is 144166."}}},
{"id":"n-cda6ba64","guard":[["hasAny",["alabama","california","makes","mobile","plus","population","victorville"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Victorville, California plus the population of Mobile, Alabama makes what":"The population of Victorville, California (121320) plus that of Mobile, Alabama (193717) is 315037."}}},
{"id":"n-ced36fbb","guard":[["hasAny",["bedford","hawaii","honolulu","population","sum","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Bedford, Texas and Honolulu, Hawaii":"The population of Bedford, Texas (48864) plus that of Honolulu, Hawaii (349597) is 398461."}}},
{"id":"n-cf67883a","guard":[["hasAny",["beach","bossier","city","louisiana","population","sum","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Bossier City, Louisiana and Virginia Beach, Virginia":"The population of Bossier City, Louisiana (67152) plus that of Virginia Beach, Virginia (449733) is 516885."}}},
{"id":"n-d1937dbd","guard":[["hasAny",["add","california","clarita","indiana","lafayette","population","santa","west"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Santa Clarita, California to the population of West Lafayette, Indiana":"The population of Santa Clarita, California (180303) plus that of West Lafayette, Indiana (44543) is 224846."}}},
{"id":"n-d3c5ad05","guard":[["hasAny",["california","indiana","lawrence","population","sum","vista"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Vista, California and Lawrence, Indiana":"The population of Vista, California (98560) plus that of Lawrence, Indiana (47415) is 145975."}}},
{"id":"n-d49daac9","guard":[["hasAny",["alto","maryland","population","puerto","rico","sum","towson","trujillo"]],["has","sum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Trujillo Alto, Puerto Rico and Towson, Maryland":"The population of Trujillo Alto, Puerto Rico (46226) plus that of Towson, Maryland (58189) is 104415."}}},
{"id":"n-d4a39f4c","guard":[["hasAny",["hillsboro","oregon","population","spokane","sum","valley","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Hillsboro, Oregon and Spokane Valley, Washington":"The population of Hillsboro, Oregon (100462) plus that of Spokane Valley, Washington (93322) is 193784."}}},
{"id":"n-d580651e","guard":[["hasAny",["brockton","hoboken","jersey","massachusetts","new","population","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Brockton, Massachusetts and Hoboken, New Jersey":"The population of Brockton, Massachusetts (94813) plus that of Hoboken, New Jersey (53136) is 147949."}}},
{"id":"n-d68ba3b0","guard":[["hasAny",["florida","makes","orem","park","pinellas","plus","population","utah"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Orem, Utah plus the population of Pinellas Park, Florida makes what":"The population of Orem, Utah (93220) plus that of Pinellas Park, Florida (50946) is 144166."}}},
{"id":"n-d8c4480d","guard":[["hasAny",["atascocita","kingsport","makes","plus","population","tennessee","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Atascocita, Texas plus the population of Kingsport, Tennessee makes what":"The population of Atascocita, Texas (72713) plus that of Kingsport, Tennessee (52871) is 125584."}}},
{"id":"n-d93d729a","guard":[["hasAny",["auburn","florida","lakeland","population","sum","washington"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Lakeland, Florida and Auburn, Washington":"The population of Lakeland, Florida (102714) plus that of Auburn, Washington (75607) is 178321."}}},
{"id":"n-d9a4472b","guard":[["hasAny",["add","bellflower","boulder","california","colorado","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Bellflower, California to the population of Boulder, Colorado":"The population of Bellflower, California (77687) plus that of Boulder, Colorado (105420) is 183107."}}},
{"id":"n-dafab6f4","guard":[["hasAny",["california","city","madera","makes","oklahoma","plus","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Madera, California plus the population of Oklahoma City, Oklahoma makes what":"The population of Madera, California (63398) plus that of Oklahoma City, Oklahoma (620015) is 683413."}}},
{"id":"n-dc35705a","guard":[["hasAny",["bay","green","makes","plus","population","wauwatosa","wisconsin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Wauwatosa, Wisconsin plus the population of Green Bay, Wisconsin makes what":"The population of Wauwatosa, Wisconsin (47388) plus that of Green Bay, Wisconsin (104951) is 152339."}}},
{"id":"n-dde87dfa","guard":[["hasAny",["bay","everett","green","population","sum","washington","wisconsin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Green Bay, Wisconsin and Everett, Washington":"The population of Green Bay, Wisconsin (104951) plus that of Everett, Washington (106580) is 211531."}}},
{"id":"n-dfb3179c","guard":[["hasAny",["arkansas","beach","fayetteville","florida","makes","plus","pompano","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Pompano Beach, Florida plus the population of Fayetteville, Arkansas makes what":"The population of Pompano Beach, Florida (106004) plus that of Fayetteville, Arkansas (80552) is 186556."}}},
{"id":"n-e1383a2e","guard":[["hasAny",["beach","pompano","utica"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Utica, New York to the population of Pompano Beach, Florida":"The population of Utica, New York (61337) plus that of Pompano Beach, Florida (106004) is 167341."}}},
{"id":"n-e2590fe3","guard":[["hasAny",["carson","city","indiana","indianapolis","nevada","population","sum"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Indianapolis, Indiana and Carson City, Nevada":"The population of Indianapolis, Indiana (846674) plus that of Carson City, Nevada (54412) is 901086."}}},
{"id":"n-e360134b","guard":[["hasAny",["add","atascocita","population","provo","texas","utah"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Provo, Utah to the population of Atascocita, Texas":"The population of Provo, Utah (115718) plus that of Atascocita, Texas (72713) is 188431."}}},
{"id":"n-e3a585f2","guard":[["hasAny",["add","clearwater","florida","hawaii","honolulu","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Honolulu, Hawaii to the population of Clearwater, Florida":"The population of Honolulu, Hawaii (349597) plus that of Clearwater, Florida (111747) is 461344."}}},
{"id":"n-e56b9e85","guard":[["hasAny",["add","carson","city","marcos","nevada","population","san","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Carson City, Nevada to the population of San Marcos, Texas":"The population of Carson City, Nevada (54412) plus that of San Marcos, Texas (57743) is 112155."}}},
{"id":"n-e69f7d58","guard":[["hasAny",["alto","arizona","makes","mesa","plus","population","puerto","rico","trujillo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Mesa, Arizona plus the population of Trujillo Alto, Puerto Rico makes what":"The population of Mesa, Arizona (470456) plus that of Trujillo Alto, Puerto Rico (46226) is 516682."}}},
{"id":"n-e74f016f","guard":[["hasAny",["add","hoboken","jersey","new","ohio","population","springfield"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Hoboken, New Jersey to the population of Springfield, Ohio":"The population of Hoboken, New Jersey (53136) plus that of Springfield, Ohio (59761) is 112897."}}},
{"id":"n-e77c1973","guard":[["hasAny",["madera","oklahoma"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Madera, California plus the population of Oklahoma City, Oklahoma makes what":"The population of Madera, California (63398) plus that of Oklahoma City, Oklahoma (620015) is 683413."}}},
{"id":"n-e984b796","guard":[["hasAny",["city","massachusetts","oklahoma","peabody","population","sum"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Oklahoma City, Oklahoma and Peabody, Massachusetts":"The population of Oklahoma City, Oklahoma (620015) plus that of Peabody, Massachusetts (52235) is 672250."}}},
{"id":"n-eb0918e1","guard":[["hasAny",["add","conroe","dearborn","michigan","population","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Conroe, Texas to the population of Dearborn, Michigan":"The population of Conroe, Texas (74482) plus that of Dearborn, Michigan (95520) is 170002."}}},
{"id":"n-eb87925c","guard":[["hasAny",["add","bay","florida","hills","palm","pine","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Palm Bay, Florida to the population of Pine Hills, Florida":"The population of Palm Bay, Florida (106573) plus that of Pine Hills, Florida (69733) is 176306."}}},
{"id":"n-ed3a7dc1","guard":[["hasAny",["indiana","indianapolis","makes","massachusetts","plus","population","taunton"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of Taunton, Massachusetts plus the population of Indianapolis, Indiana makes what":"The population of Taunton, Massachusetts (56504) plus that of Indianapolis, Indiana (846674) is 903178."}}},
{"id":"n-f02ec2e2","guard":[["hasAny",["add","florida","gainesville","massachusetts","peabody","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Peabody, Massachusetts to the population of Gainesville, Florida":"The population of Peabody, Massachusetts (52235) plus that of Gainesville, Florida (128610) is 180845."}}},
{"id":"n-f18fefdc","guard":[["hasAny",["britain","connecticut","makes","medford","new","oregon","plus","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the population of New Britain, Connecticut plus the population of Medford, Oregon makes what":"The population of New Britain, Connecticut (72876) plus that of Medford, Oregon (78856) is 151732."}}},
{"id":"n-f275d410","guard":[["hasAny",["add","edinburg","lakeville","minnesota","population","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Lakeville, Minnesota to the population of Edinburg, Texas":"The population of Lakeville, Minnesota (59786) plus that of Edinburg, Texas (84399) is 144185."}}},
{"id":"n-f733288b","guard":[["hasAny",["barnstable","conroe","massachusetts","population","sum","texas","town"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Barnstable Town, Massachusetts and Conroe, Texas":"The population of Barnstable Town, Massachusetts (44498) plus that of Conroe, Texas (74482) is 118980."}}},
{"id":"n-f745f21e","guard":[["hasAny",["add","beach","orem","population","utah","virginia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Virginia Beach, Virginia to the population of Orem, Utah":"The population of Virginia Beach, Virginia (449733) plus that of Orem, Utah (93220) is 542953."}}},
{"id":"n-f78ab69d","guard":[["hasAny",["add","california","everett","pico","population","rivera","washington"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the population of Everett, Washington to the population of Pico Rivera, California":"The population of Everett, Washington (106580) plus that of Pico Rivera, California (63724) is 170304."}}},
{"id":"n-f9ccf0a2","guard":[["hasAny",["bay","everett","green","population","sum","washington","wisconsin"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the population of Green Bay, Wisconsin and Everett, Washington":"The population of Green Bay, Wisconsin (104951) plus that of Everett, Washington (106580) is 211531."}}},
{"id":"n-fbcb44c9","guard":[["hasAny",["atascocita","kingsport","makes","plus","population","tennessee","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Atascocita, Texas plus the population of Kingsport, Tennessee makes what":"The population of Atascocita, Texas (72713) plus that of Kingsport, Tennessee (52871) is 125584."}}},
{"id":"n-fcdbeac3","guard":[["hasAny",["add","beach","orem","population","utah","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Virginia Beach, Virginia to the population of Orem, Utah":"The population of Virginia Beach, Virginia (449733) plus that of Orem, Utah (93220) is 542953."}}},
{"id":"n-feb33a91","guard":[["hasAny",["california","fontana","makes","plus","population","tuckahoe","virginia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the population of Tuckahoe, Virginia plus the population of Fontana, California makes what":"The population of Tuckahoe, Virginia (47997) plus that of Fontana, California (205228) is 253225."}}},
{"id":"n-ffd0a56f","guard":[["hasAny",["add","britain","connecticut","new","population","spokane","valley","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the population of Spokane Valley, Washington to the population of New Britain, Connecticut":"The population of Spokane Valley, Washington (93322) plus that of New Britain, Connecticut (72876) is 166198."}}},
{"id":"n-1b26bc97","guard":[["hasAny",["conway","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1},", ",{"slot":2}," (93704) plus that of Conway, Arkansas (64184) is 157888."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-373d477c","guard":[["hasAny",["conway","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Yuma, ",{"slot":1}," (93704) plus that of ",{"slot":2},", Arkansas (64184) is 157888."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3eba9a64","guard":[["hasAny",["conway","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1},", Arizona (93704) plus that of ",{"slot":2},", Arkansas (64184) is 157888."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-409e041b","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","tempe"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Tempe, ",{"slot":1}," (174708) plus that of ",{"slot":2},", New York (57844) is 232552."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-938375e9","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","tempe"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1},", ",{"slot":2}," (174708) plus that of Tonawanda, New York (57844) is 232552."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9be0cc18","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","tempe"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1},", Arizona (174708) plus that of ",{"slot":2},", New York (57844) is 232552."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-8ae8f551","guard":[["hasAny",["item number","nth","position","tempe"]]],"pyramid":["render.template",{"lit":["The population of ",{"slot":0},", ",{"slot":1}," (174708) plus that of ",{"slot":2},", New York (57844) is 232552."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d7428c87","guard":[["hasAny",["conway","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The population of ",{"slot":0},", ",{"slot":1}," (93704) plus that of ",{"slot":2},", Arkansas (64184) is 157888."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-4355a685","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","tempe"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1},", ",{"slot":2}," (174708) plus that of ",{"slot":3},", New York (57844) is 232552."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-58998593","guard":[["hasAny",["conway","element","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1},", ",{"slot":2}," (93704) plus that of ",{"slot":3},", Arkansas (64184) is 157888."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5e55a393","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","tempe"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1},", ",{"slot":2}," (174708) plus that of ",{"slot":3},", New York (57844) is 232552."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-63f593e2","guard":[["hasAny",["conway","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1},", ",{"slot":2}," (93704) plus that of ",{"slot":3},", Arkansas (64184) is 157888."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-988255e9","guard":[["hasAny",["conway","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1},", ",{"slot":2}," (93704) plus that of ",{"slot":3},", Arkansas (64184) is 157888."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-d3cf52a3","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","tempe"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1},", ",{"slot":2}," (174708) plus that of ",{"slot":3},", New York (57844) is 232552."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-acb7aeb1","guard":[["hasAny",["conway","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1},", ",{"slot":2}," (93704) plus that of ",{"slot":3},", Arkansas (64184) is 157888."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-c58452d0","guard":[["hasAny",["item number","nth","position","tempe"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1},", ",{"slot":2}," (174708) plus that of ",{"slot":3},", New York (57844) is 232552."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"the population of Hattiesburg, Mississippi plus the population of Sarasota, Florida makes what","expect":{"contains":["101271"],"notRefusal":true}},{"q":"add the population of Hoboken, New Jersey to the population of Springfield, Ohio","expect":{"contains":["112897"],"notRefusal":true}},{"q":"the population of Taunton, Massachusetts plus the population of Indianapolis, Indiana makes what","expect":{"contains":["903178"],"notRefusal":true}},{"q":"the population of Ocala, Florida plus the population of Greeley, Colorado makes what","expect":{"contains":["156848"],"notRefusal":true}},{"q":"add the population of Binghamton, New York to the population of Tuckahoe, Virginia","expect":{"contains":["94274"],"notRefusal":true}},{"q":"what is the sum of the population of Greeley, Colorado and Potomac, Maryland","expect":{"contains":["144857"],"notRefusal":true}},{"q":"what is the sum of the population of Chesapeake, Virginia and Utica, New York","expect":{"contains":["294531"],"notRefusal":true}},{"q":"the population of Dearborn, Michigan plus the population of Glen Burnie, Maryland makes what","expect":{"contains":["164580"],"notRefusal":true}},{"q":"the population of San Bruno, California plus the population of Albany, New York makes what","expect":{"contains":["141161"],"notRefusal":true}},{"q":"what is the sum of the population of Lake Charles, Louisiana and Provo, Utah","expect":{"contains":["190762"],"notRefusal":true}},{"q":"what is the sum of the population of Sarasota, Florida and Bellflower, California","expect":{"contains":["132112"],"notRefusal":true}},{"q":"the population of Florissant, Missouri plus the population of Vista, California makes what","expect":{"contains":["150778"],"notRefusal":true}},{"q":"add the population of Concord, North Carolina to the population of San Bruno, California","expect":{"contains":["128489"],"notRefusal":true}},{"q":"what is the sum of the population of Mobile, Alabama and Harrisburg, Pennsylvania","expect":{"contains":["242877"],"notRefusal":true}},{"q":"the population of Springfield, Ohio plus the population of Newport News, Virginia makes what","expect":{"contains":["241367"],"notRefusal":true}},{"q":"the population of Lafayette, Louisiana plus the population of Yuma, Arizona makes what","expect":{"contains":["219512"],"notRefusal":true}},{"q":"the population of Burke, Virginia plus the population of Barnstable Town, Massachusetts makes what","expect":{"contains":["86788"],"notRefusal":true}},{"q":"the population of Gainesville, Florida plus the population of Brownsville, Texas makes what","expect":{"contains":["310720"],"notRefusal":true}},{"q":"what is the sum of the population of Medford, Oregon and Methuen Town, Massachusetts","expect":{"contains":["127899"],"notRefusal":true}},{"q":"add the population of Fairfield, Ohio to the population of Coachella, California","expect":{"contains":["86466"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
