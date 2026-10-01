// tld-type-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"tld-type-neo-g6","class":"tld-type","generation":6,"lane":"neo","grownFrom":["name the kind of top-level domain .furniture is","what type of top-level domain is .hm","what type of top-level domain is .immobilien","name the kind of top-level domain .nagoya is","name the kind of top-level domain .tci is","what category of top-level domain is .bz","name the kind of top-level domain .reit is","what category of top-level domain is .bananarepublic","what type of top-level domain is .auspost","what type of top-level domain is .macys","what category of top-level domain is .dnp","what category of top-level domain is .sling","what category of top-level domain is .gf","what category of top-level domain is .rocks","name the kind of top-level domain .bauhaus is","what category of top-level domain is .space","name the kind of top-level domain .pr is","what type of top-level domain is .film","what type of top-level domain is .reise","what type of top-level domain is .新闻"],"version":1});

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
{"id":"n-ea43a258","guard":[["has","domain"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .furniture is":".furniture is a generic top-level domain.","what type of top-level domain is .hm":".hm is a country-code top-level domain.","what type of top-level domain is .immobilien":".immobilien is a generic top-level domain.","name the kind of top-level domain .nagoya is":".nagoya is a generic top-level domain.","name the kind of top-level domain .tci is":".tci is a generic top-level domain.","what category of top-level domain is .bz":".bz is a country-code top-level domain.","name the kind of top-level domain .reit is":".reit is a generic top-level domain.","what category of top-level domain is .bananarepublic":".bananarepublic is a generic top-level domain.","what type of top-level domain is .auspost":".auspost is a generic top-level domain.","what type of top-level domain is .macys":".macys is a generic top-level domain.","what category of top-level domain is .dnp":".dnp is a generic top-level domain.","what category of top-level domain is .sling":".sling is a generic top-level domain.","what category of top-level domain is .gf":".gf is a country-code top-level domain.","what category of top-level domain is .rocks":".rocks is a generic top-level domain.","name the kind of top-level domain .bauhaus is":".bauhaus is a generic top-level domain.","what category of top-level domain is .space":".space is a generic top-level domain.","name the kind of top-level domain .pr is":".pr is a country-code top-level domain.","what type of top-level domain is .film":".film is a generic top-level domain.","what type of top-level domain is .reise":".reise is a generic top-level domain.","what type of top-level domain is .新闻":".新闻 is a generic top-level domain.","what type of top-level domain is .hbo":".hbo is a generic top-level domain.","name the kind of top-level domain .ro is":".ro is a country-code top-level domain.","what type of top-level domain is .ভারত":".ভারত is a country-code top-level domain.","what type of top-level domain is .닷컴":".닷컴 is a generic top-level domain.","what category of top-level domain is .ren":".ren is a generic top-level domain.","what category of top-level domain is .volvo":".volvo is a generic top-level domain.","what type of top-level domain is .uol":".uol is a generic top-level domain.","what category of top-level domain is .goo":".goo is a generic top-level domain.","what type of top-level domain is .sew":".sew is a generic top-level domain.","what type of top-level domain is .lb":".lb is a country-code top-level domain.","name the kind of top-level domain .укр is":".укр is a country-code top-level domain.","what type of top-level domain is .lamborghini":".lamborghini is a generic top-level domain.","name the kind of top-level domain .game is":".game is a generic top-level domain.","name the kind of top-level domain .py is":".py is a country-code top-level domain.","name the kind of top-level domain .nikon is":".nikon is a generic top-level domain.","what category of top-level domain is .bg":".bg is a country-code top-level domain.","name the kind of top-level domain .no is":".no is a country-code top-level domain.","what type of top-level domain is .परीक्षा":".परीक्षा is a test top-level domain.","what category of top-level domain is .cricket":".cricket is a generic top-level domain.","name the kind of top-level domain .msd is":".msd is a generic top-level domain.","what type of top-level domain is .sarl":".sarl is a generic top-level domain.","name the kind of top-level domain ‏.همراه‎ is":"‏.همراه‎ is a generic top-level domain.","what category of top-level domain is .scot":".scot is a generic top-level domain.","name the kind of top-level domain .cartier is":".cartier is a generic top-level domain.","what type of top-level domain is .iveco":".iveco is a generic top-level domain.","name the kind of top-level domain .cbre is":".cbre is a generic top-level domain.","name the kind of top-level domain .vermögensberatung is":".vermögensberatung is a generic top-level domain.","what category of top-level domain is .xbox":".xbox is a generic top-level domain.","name the kind of top-level domain .fun is":".fun is a generic top-level domain.","name the kind of top-level domain .cu is":".cu is a country-code top-level domain.","what type of top-level domain is .zw":".zw is a country-code top-level domain.","what category of top-level domain is .aq":".aq is a country-code top-level domain.","name the kind of top-level domain .apple is":".apple is a generic top-level domain.","name the kind of top-level domain .canon is":".canon is a generic top-level domain.","name the kind of top-level domain .fitness is":".fitness is a generic top-level domain.","what category of top-level domain is .hyatt":".hyatt is a generic top-level domain.","what category of top-level domain is .bar":".bar is a generic top-level domain.","what type of top-level domain is .au":".au is a country-code top-level domain.","what type of top-level domain is .慈善":".慈善 is a generic top-level domain.","what category of top-level domain is .itau":".itau is a generic top-level domain.","what type of top-level domain is .clothing":".clothing is a generic top-level domain.","what type of top-level domain is .oldnavy":".oldnavy is a generic top-level domain.","name the kind of top-level domain .everbank is":".everbank is a generic top-level domain.","what category of top-level domain is .nokia":".nokia is a generic top-level domain.","what category of top-level domain is .kindle":".kindle is a generic top-level domain.","what category of top-level domain is .hsbc":".hsbc is a generic top-level domain.","name the kind of top-level domain .solar is":".solar is a generic top-level domain.","what type of top-level domain is .bentley":".bentley is a generic top-level domain.","what type of top-level domain is .dog":".dog is a generic top-level domain.","what type of top-level domain is .lu":".lu is a country-code top-level domain.","what category of top-level domain is .emerson":".emerson is a generic top-level domain.","what category of top-level domain is .nissan":".nissan is a generic top-level domain.","what category of top-level domain is .பரிட்சை":".பரிட்சை is a test top-level domain.","what category of top-level domain is .cloud":".cloud is a generic top-level domain.","what category of top-level domain is .io":".io is a country-code top-level domain.","what type of top-level domain is .genting":".genting is a generic top-level domain.","name the kind of top-level domain .hr is":".hr is a country-code top-level domain.","what type of top-level domain is .extraspace":".extraspace is a generic top-level domain.","what category of top-level domain is .alsace":".alsace is a generic top-level domain.","what type of top-level domain is .services":".services is a generic top-level domain.","name the kind of top-level domain .zip is":".zip is a generic top-level domain.","what type of top-level domain is .sa":".sa is a country-code top-level domain.","what category of top-level domain is .merckmsd":".merckmsd is a generic top-level domain.","name the kind of top-level domain .dance is":".dance is a generic top-level domain.","what category of top-level domain is .photography":".photography is a generic top-level domain.","what category of top-level domain is .бг":".бг is a country-code top-level domain.","what type of top-level domain is .ファッション":".ファッション is a generic top-level domain.","name the kind of top-level domain .uz is":".uz is a country-code top-level domain.","name the kind of top-level domain .moto is":".moto is a generic top-level domain.","what category of top-level domain is .pramerica":".pramerica is a generic top-level domain.","what category of top-level domain is .ruhr":".ruhr is a generic top-level domain.","what type of top-level domain is .sanofi":".sanofi is a generic top-level domain.","name the kind of top-level domain .shangrila is":".shangrila is a generic top-level domain.","name the kind of top-level domain .madrid is":".madrid is a generic top-level domain.","what type of top-level domain is .қаз":".қаз is a country-code top-level domain.","what type of top-level domain is .courses":".courses is a generic top-level domain.","what type of top-level domain is .direct":".direct is a generic top-level domain.","name the kind of top-level domain .tokyo is":".tokyo is a generic top-level domain.","name the kind of top-level domain .community is":".community is a generic top-level domain.","what category of top-level domain is .weatherchannel":".weatherchannel is a generic top-level domain."}}},
{"id":"n-fdeefba9","guard":[["has","domain"],["has","of"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .furniture is":".furniture is a generic top-level domain.","what type of top-level domain is .hm":".hm is a country-code top-level domain.","what type of top-level domain is .immobilien":".immobilien is a generic top-level domain.","name the kind of top-level domain .nagoya is":".nagoya is a generic top-level domain.","name the kind of top-level domain .tci is":".tci is a generic top-level domain.","what category of top-level domain is .bz":".bz is a country-code top-level domain.","name the kind of top-level domain .reit is":".reit is a generic top-level domain.","what category of top-level domain is .bananarepublic":".bananarepublic is a generic top-level domain.","what type of top-level domain is .auspost":".auspost is a generic top-level domain.","what type of top-level domain is .macys":".macys is a generic top-level domain.","what category of top-level domain is .dnp":".dnp is a generic top-level domain.","what category of top-level domain is .sling":".sling is a generic top-level domain.","what category of top-level domain is .gf":".gf is a country-code top-level domain.","what category of top-level domain is .rocks":".rocks is a generic top-level domain.","name the kind of top-level domain .bauhaus is":".bauhaus is a generic top-level domain.","what category of top-level domain is .space":".space is a generic top-level domain.","name the kind of top-level domain .pr is":".pr is a country-code top-level domain.","what type of top-level domain is .film":".film is a generic top-level domain.","what type of top-level domain is .reise":".reise is a generic top-level domain.","what type of top-level domain is .新闻":".新闻 is a generic top-level domain.","what type of top-level domain is .hbo":".hbo is a generic top-level domain.","name the kind of top-level domain .ro is":".ro is a country-code top-level domain.","what type of top-level domain is .ভারত":".ভারত is a country-code top-level domain.","what type of top-level domain is .닷컴":".닷컴 is a generic top-level domain.","what category of top-level domain is .ren":".ren is a generic top-level domain.","what category of top-level domain is .volvo":".volvo is a generic top-level domain.","what type of top-level domain is .uol":".uol is a generic top-level domain.","what category of top-level domain is .goo":".goo is a generic top-level domain.","what type of top-level domain is .sew":".sew is a generic top-level domain.","what type of top-level domain is .lb":".lb is a country-code top-level domain.","name the kind of top-level domain .укр is":".укр is a country-code top-level domain.","what type of top-level domain is .lamborghini":".lamborghini is a generic top-level domain.","name the kind of top-level domain .game is":".game is a generic top-level domain.","name the kind of top-level domain .py is":".py is a country-code top-level domain.","name the kind of top-level domain .nikon is":".nikon is a generic top-level domain.","what category of top-level domain is .bg":".bg is a country-code top-level domain.","name the kind of top-level domain .no is":".no is a country-code top-level domain.","what type of top-level domain is .परीक्षा":".परीक्षा is a test top-level domain.","what category of top-level domain is .cricket":".cricket is a generic top-level domain.","name the kind of top-level domain .msd is":".msd is a generic top-level domain.","what type of top-level domain is .sarl":".sarl is a generic top-level domain.","name the kind of top-level domain ‏.همراه‎ is":"‏.همراه‎ is a generic top-level domain.","what category of top-level domain is .scot":".scot is a generic top-level domain.","name the kind of top-level domain .cartier is":".cartier is a generic top-level domain.","what type of top-level domain is .iveco":".iveco is a generic top-level domain.","name the kind of top-level domain .cbre is":".cbre is a generic top-level domain.","name the kind of top-level domain .vermögensberatung is":".vermögensberatung is a generic top-level domain.","what category of top-level domain is .xbox":".xbox is a generic top-level domain.","name the kind of top-level domain .fun is":".fun is a generic top-level domain.","name the kind of top-level domain .cu is":".cu is a country-code top-level domain.","what type of top-level domain is .zw":".zw is a country-code top-level domain.","what category of top-level domain is .aq":".aq is a country-code top-level domain.","name the kind of top-level domain .apple is":".apple is a generic top-level domain.","name the kind of top-level domain .canon is":".canon is a generic top-level domain.","name the kind of top-level domain .fitness is":".fitness is a generic top-level domain.","what category of top-level domain is .hyatt":".hyatt is a generic top-level domain.","what category of top-level domain is .bar":".bar is a generic top-level domain.","what type of top-level domain is .au":".au is a country-code top-level domain.","what type of top-level domain is .慈善":".慈善 is a generic top-level domain.","what category of top-level domain is .itau":".itau is a generic top-level domain.","what type of top-level domain is .clothing":".clothing is a generic top-level domain.","what type of top-level domain is .oldnavy":".oldnavy is a generic top-level domain.","name the kind of top-level domain .everbank is":".everbank is a generic top-level domain.","what category of top-level domain is .nokia":".nokia is a generic top-level domain.","what category of top-level domain is .kindle":".kindle is a generic top-level domain.","what category of top-level domain is .hsbc":".hsbc is a generic top-level domain.","name the kind of top-level domain .solar is":".solar is a generic top-level domain.","what type of top-level domain is .bentley":".bentley is a generic top-level domain.","what type of top-level domain is .dog":".dog is a generic top-level domain.","what type of top-level domain is .lu":".lu is a country-code top-level domain.","what category of top-level domain is .emerson":".emerson is a generic top-level domain.","what category of top-level domain is .nissan":".nissan is a generic top-level domain.","what category of top-level domain is .பரிட்சை":".பரிட்சை is a test top-level domain.","what category of top-level domain is .cloud":".cloud is a generic top-level domain.","what category of top-level domain is .io":".io is a country-code top-level domain.","what type of top-level domain is .genting":".genting is a generic top-level domain.","name the kind of top-level domain .hr is":".hr is a country-code top-level domain.","what type of top-level domain is .extraspace":".extraspace is a generic top-level domain.","what category of top-level domain is .alsace":".alsace is a generic top-level domain.","what type of top-level domain is .services":".services is a generic top-level domain.","name the kind of top-level domain .zip is":".zip is a generic top-level domain.","what type of top-level domain is .sa":".sa is a country-code top-level domain.","what category of top-level domain is .merckmsd":".merckmsd is a generic top-level domain.","name the kind of top-level domain .dance is":".dance is a generic top-level domain.","what category of top-level domain is .photography":".photography is a generic top-level domain.","what category of top-level domain is .бг":".бг is a country-code top-level domain.","what type of top-level domain is .ファッション":".ファッション is a generic top-level domain.","name the kind of top-level domain .uz is":".uz is a country-code top-level domain.","name the kind of top-level domain .moto is":".moto is a generic top-level domain.","what category of top-level domain is .pramerica":".pramerica is a generic top-level domain.","what category of top-level domain is .ruhr":".ruhr is a generic top-level domain.","what type of top-level domain is .sanofi":".sanofi is a generic top-level domain.","name the kind of top-level domain .shangrila is":".shangrila is a generic top-level domain.","name the kind of top-level domain .madrid is":".madrid is a generic top-level domain.","what type of top-level domain is .қаз":".қаз is a country-code top-level domain.","what type of top-level domain is .courses":".courses is a generic top-level domain.","what type of top-level domain is .direct":".direct is a generic top-level domain.","name the kind of top-level domain .tokyo is":".tokyo is a generic top-level domain.","name the kind of top-level domain .community is":".community is a generic top-level domain.","what category of top-level domain is .weatherchannel":".weatherchannel is a generic top-level domain."}}},
{"id":"n-2412c3fc","guard":[["has","domain"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"top-level domain .furniture is":".furniture is a generic top-level domain.","top-level domain is .hm":".hm is a country-code top-level domain.","top-level domain is .immobilien":".immobilien is a generic top-level domain.","top-level domain .nagoya is":".nagoya is a generic top-level domain.","top-level domain .tci is":".tci is a generic top-level domain.","top-level domain is .bz":".bz is a country-code top-level domain.","top-level domain .reit is":".reit is a generic top-level domain.","top-level domain is .bananarepublic":".bananarepublic is a generic top-level domain.","top-level domain is .auspost":".auspost is a generic top-level domain.","top-level domain is .macys":".macys is a generic top-level domain.","top-level domain is .dnp":".dnp is a generic top-level domain.","top-level domain is .sling":".sling is a generic top-level domain.","top-level domain is .gf":".gf is a country-code top-level domain.","top-level domain is .rocks":".rocks is a generic top-level domain.","top-level domain .bauhaus is":".bauhaus is a generic top-level domain.","top-level domain is .space":".space is a generic top-level domain.","top-level domain .pr is":".pr is a country-code top-level domain.","top-level domain is .film":".film is a generic top-level domain.","top-level domain is .reise":".reise is a generic top-level domain.","top-level domain is .新闻":".新闻 is a generic top-level domain.","top-level domain is .hbo":".hbo is a generic top-level domain.","top-level domain .ro is":".ro is a country-code top-level domain.","top-level domain is .ভারত":".ভারত is a country-code top-level domain.","top-level domain is .닷컴":".닷컴 is a generic top-level domain.","top-level domain is .ren":".ren is a generic top-level domain.","top-level domain is .volvo":".volvo is a generic top-level domain.","top-level domain is .uol":".uol is a generic top-level domain.","top-level domain is .goo":".goo is a generic top-level domain.","top-level domain is .sew":".sew is a generic top-level domain.","top-level domain is .lb":".lb is a country-code top-level domain.","top-level domain .укр is":".укр is a country-code top-level domain.","top-level domain is .lamborghini":".lamborghini is a generic top-level domain.","top-level domain .game is":".game is a generic top-level domain.","top-level domain .py is":".py is a country-code top-level domain.","top-level domain .nikon is":".nikon is a generic top-level domain.","top-level domain is .bg":".bg is a country-code top-level domain.","top-level domain .no is":".no is a country-code top-level domain.","top-level domain is .परीक्षा":".परीक्षा is a test top-level domain.","top-level domain is .cricket":".cricket is a generic top-level domain.","top-level domain .msd is":".msd is a generic top-level domain.","top-level domain is .sarl":".sarl is a generic top-level domain.","top-level domain ‏.همراه‎ is":"‏.همراه‎ is a generic top-level domain.","top-level domain is .scot":".scot is a generic top-level domain.","top-level domain .cartier is":".cartier is a generic top-level domain.","top-level domain is .iveco":".iveco is a generic top-level domain.","top-level domain .cbre is":".cbre is a generic top-level domain.","top-level domain .vermögensberatung is":".vermögensberatung is a generic top-level domain.","top-level domain is .xbox":".xbox is a generic top-level domain.","top-level domain .fun is":".fun is a generic top-level domain.","top-level domain .cu is":".cu is a country-code top-level domain.","top-level domain is .zw":".zw is a country-code top-level domain.","top-level domain is .aq":".aq is a country-code top-level domain.","top-level domain .apple is":".apple is a generic top-level domain.","top-level domain .canon is":".canon is a generic top-level domain.","top-level domain .fitness is":".fitness is a generic top-level domain.","top-level domain is .hyatt":".hyatt is a generic top-level domain.","top-level domain is .bar":".bar is a generic top-level domain.","top-level domain is .au":".au is a country-code top-level domain.","top-level domain is .慈善":".慈善 is a generic top-level domain.","top-level domain is .itau":".itau is a generic top-level domain.","top-level domain is .clothing":".clothing is a generic top-level domain.","top-level domain is .oldnavy":".oldnavy is a generic top-level domain.","top-level domain .everbank is":".everbank is a generic top-level domain.","top-level domain is .nokia":".nokia is a generic top-level domain.","top-level domain is .kindle":".kindle is a generic top-level domain.","top-level domain is .hsbc":".hsbc is a generic top-level domain.","top-level domain .solar is":".solar is a generic top-level domain.","top-level domain is .bentley":".bentley is a generic top-level domain.","top-level domain is .dog":".dog is a generic top-level domain.","top-level domain is .lu":".lu is a country-code top-level domain.","top-level domain is .emerson":".emerson is a generic top-level domain.","top-level domain is .nissan":".nissan is a generic top-level domain.","top-level domain is .பரிட்சை":".பரிட்சை is a test top-level domain.","top-level domain is .cloud":".cloud is a generic top-level domain.","top-level domain is .io":".io is a country-code top-level domain.","top-level domain is .genting":".genting is a generic top-level domain.","top-level domain .hr is":".hr is a country-code top-level domain.","top-level domain is .extraspace":".extraspace is a generic top-level domain.","top-level domain is .alsace":".alsace is a generic top-level domain.","top-level domain is .services":".services is a generic top-level domain.","top-level domain .zip is":".zip is a generic top-level domain.","top-level domain is .sa":".sa is a country-code top-level domain.","top-level domain is .merckmsd":".merckmsd is a generic top-level domain.","top-level domain .dance is":".dance is a generic top-level domain.","top-level domain is .photography":".photography is a generic top-level domain.","top-level domain is .бг":".бг is a country-code top-level domain.","top-level domain is .ファッション":".ファッション is a generic top-level domain.","top-level domain .uz is":".uz is a country-code top-level domain.","top-level domain .moto is":".moto is a generic top-level domain.","top-level domain is .pramerica":".pramerica is a generic top-level domain.","top-level domain is .ruhr":".ruhr is a generic top-level domain.","top-level domain is .sanofi":".sanofi is a generic top-level domain.","top-level domain .shangrila is":".shangrila is a generic top-level domain.","top-level domain .madrid is":".madrid is a generic top-level domain.","top-level domain is .қаз":".қаз is a country-code top-level domain.","top-level domain is .courses":".courses is a generic top-level domain.","top-level domain is .direct":".direct is a generic top-level domain.","top-level domain .tokyo is":".tokyo is a generic top-level domain.","top-level domain .community is":".community is a generic top-level domain.","top-level domain is .weatherchannel":".weatherchannel is a generic top-level domain."}}},
{"id":"n-a118c6a6","guard":[["has","domain"],["has","of"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"domain"}]]],"mem":{"table":{".furniture is":".furniture is a generic top-level domain.","is .hm":".hm is a country-code top-level domain.","is .immobilien":".immobilien is a generic top-level domain.",".nagoya is":".nagoya is a generic top-level domain.",".tci is":".tci is a generic top-level domain.","is .bz":".bz is a country-code top-level domain.",".reit is":".reit is a generic top-level domain.","is .bananarepublic":".bananarepublic is a generic top-level domain.","is .auspost":".auspost is a generic top-level domain.","is .macys":".macys is a generic top-level domain.","is .dnp":".dnp is a generic top-level domain.","is .sling":".sling is a generic top-level domain.","is .gf":".gf is a country-code top-level domain.","is .rocks":".rocks is a generic top-level domain.",".bauhaus is":".bauhaus is a generic top-level domain.","is .space":".space is a generic top-level domain.",".pr is":".pr is a country-code top-level domain.","is .film":".film is a generic top-level domain.","is .reise":".reise is a generic top-level domain.","is .新闻":".新闻 is a generic top-level domain.","is .hbo":".hbo is a generic top-level domain.",".ro is":".ro is a country-code top-level domain.","is .ভারত":".ভারত is a country-code top-level domain.","is .닷컴":".닷컴 is a generic top-level domain.","is .ren":".ren is a generic top-level domain.","is .volvo":".volvo is a generic top-level domain.","is .uol":".uol is a generic top-level domain.","is .goo":".goo is a generic top-level domain.","is .sew":".sew is a generic top-level domain.","is .lb":".lb is a country-code top-level domain.",".укр is":".укр is a country-code top-level domain.","is .lamborghini":".lamborghini is a generic top-level domain.",".game is":".game is a generic top-level domain.",".py is":".py is a country-code top-level domain.",".nikon is":".nikon is a generic top-level domain.","is .bg":".bg is a country-code top-level domain.",".no is":".no is a country-code top-level domain.","is .परीक्षा":".परीक्षा is a test top-level domain.","is .cricket":".cricket is a generic top-level domain.",".msd is":".msd is a generic top-level domain.","is .sarl":".sarl is a generic top-level domain.","‏.همراه‎ is":"‏.همراه‎ is a generic top-level domain.","is .scot":".scot is a generic top-level domain.",".cartier is":".cartier is a generic top-level domain.","is .iveco":".iveco is a generic top-level domain.",".cbre is":".cbre is a generic top-level domain.",".vermögensberatung is":".vermögensberatung is a generic top-level domain.","is .xbox":".xbox is a generic top-level domain.",".fun is":".fun is a generic top-level domain.",".cu is":".cu is a country-code top-level domain.","is .zw":".zw is a country-code top-level domain.","is .aq":".aq is a country-code top-level domain.",".apple is":".apple is a generic top-level domain.",".canon is":".canon is a generic top-level domain.",".fitness is":".fitness is a generic top-level domain.","is .hyatt":".hyatt is a generic top-level domain.","is .bar":".bar is a generic top-level domain.","is .au":".au is a country-code top-level domain.","is .慈善":".慈善 is a generic top-level domain.","is .itau":".itau is a generic top-level domain.","is .clothing":".clothing is a generic top-level domain.","is .oldnavy":".oldnavy is a generic top-level domain.",".everbank is":".everbank is a generic top-level domain.","is .nokia":".nokia is a generic top-level domain.","is .kindle":".kindle is a generic top-level domain.","is .hsbc":".hsbc is a generic top-level domain.",".solar is":".solar is a generic top-level domain.","is .bentley":".bentley is a generic top-level domain.","is .dog":".dog is a generic top-level domain.","is .lu":".lu is a country-code top-level domain.","is .emerson":".emerson is a generic top-level domain.","is .nissan":".nissan is a generic top-level domain.","is .பரிட்சை":".பரிட்சை is a test top-level domain.","is .cloud":".cloud is a generic top-level domain.","is .io":".io is a country-code top-level domain.","is .genting":".genting is a generic top-level domain.",".hr is":".hr is a country-code top-level domain.","is .extraspace":".extraspace is a generic top-level domain.","is .alsace":".alsace is a generic top-level domain.","is .services":".services is a generic top-level domain.",".zip is":".zip is a generic top-level domain.","is .sa":".sa is a country-code top-level domain.","is .merckmsd":".merckmsd is a generic top-level domain.",".dance is":".dance is a generic top-level domain.","is .photography":".photography is a generic top-level domain.","is .бг":".бг is a country-code top-level domain.","is .ファッション":".ファッション is a generic top-level domain.",".uz is":".uz is a country-code top-level domain.",".moto is":".moto is a generic top-level domain.","is .pramerica":".pramerica is a generic top-level domain.","is .ruhr":".ruhr is a generic top-level domain.","is .sanofi":".sanofi is a generic top-level domain.",".shangrila is":".shangrila is a generic top-level domain.",".madrid is":".madrid is a generic top-level domain.","is .қаз":".қаз is a country-code top-level domain.","is .courses":".courses is a generic top-level domain.","is .direct":".direct is a generic top-level domain.",".tokyo is":".tokyo is a generic top-level domain.",".community is":".community is a generic top-level domain.","is .weatherchannel":".weatherchannel is a generic top-level domain."}}},
{"id":"n-45336f3f","guard":[["has","domain"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{".hm":".hm is a country-code top-level domain.",".immobilien":".immobilien is a generic top-level domain.",".bz":".bz is a country-code top-level domain.",".bananarepublic":".bananarepublic is a generic top-level domain.",".auspost":".auspost is a generic top-level domain.",".macys":".macys is a generic top-level domain.",".dnp":".dnp is a generic top-level domain.",".sling":".sling is a generic top-level domain.",".gf":".gf is a country-code top-level domain.",".rocks":".rocks is a generic top-level domain.",".space":".space is a generic top-level domain.",".film":".film is a generic top-level domain.",".reise":".reise is a generic top-level domain.",".新闻":".新闻 is a generic top-level domain.",".hbo":".hbo is a generic top-level domain.",".ভারত":".ভারত is a country-code top-level domain.",".닷컴":".닷컴 is a generic top-level domain.",".ren":".ren is a generic top-level domain.",".volvo":".volvo is a generic top-level domain.",".uol":".uol is a generic top-level domain.",".goo":".goo is a generic top-level domain.",".sew":".sew is a generic top-level domain.",".lb":".lb is a country-code top-level domain.",".lamborghini":".lamborghini is a generic top-level domain.",".bg":".bg is a country-code top-level domain.",".परीक्षा":".परीक्षा is a test top-level domain.",".cricket":".cricket is a generic top-level domain.",".sarl":".sarl is a generic top-level domain.",".scot":".scot is a generic top-level domain.",".iveco":".iveco is a generic top-level domain.",".xbox":".xbox is a generic top-level domain.",".zw":".zw is a country-code top-level domain.",".aq":".aq is a country-code top-level domain.",".hyatt":".hyatt is a generic top-level domain.",".bar":".bar is a generic top-level domain.",".au":".au is a country-code top-level domain.",".慈善":".慈善 is a generic top-level domain.",".itau":".itau is a generic top-level domain.",".clothing":".clothing is a generic top-level domain.",".oldnavy":".oldnavy is a generic top-level domain.",".nokia":".nokia is a generic top-level domain.",".kindle":".kindle is a generic top-level domain.",".hsbc":".hsbc is a generic top-level domain.",".bentley":".bentley is a generic top-level domain.",".dog":".dog is a generic top-level domain.",".lu":".lu is a country-code top-level domain.",".emerson":".emerson is a generic top-level domain.",".nissan":".nissan is a generic top-level domain.",".பரிட்சை":".பரிட்சை is a test top-level domain.",".cloud":".cloud is a generic top-level domain.",".io":".io is a country-code top-level domain.",".genting":".genting is a generic top-level domain.",".extraspace":".extraspace is a generic top-level domain.",".alsace":".alsace is a generic top-level domain.",".services":".services is a generic top-level domain.",".sa":".sa is a country-code top-level domain.",".merckmsd":".merckmsd is a generic top-level domain.",".photography":".photography is a generic top-level domain.",".бг":".бг is a country-code top-level domain.",".ファッション":".ファッション is a generic top-level domain.",".pramerica":".pramerica is a generic top-level domain.",".ruhr":".ruhr is a generic top-level domain.",".sanofi":".sanofi is a generic top-level domain.",".қаз":".қаз is a country-code top-level domain.",".courses":".courses is a generic top-level domain.",".direct":".direct is a generic top-level domain.",".weatherchannel":".weatherchannel is a generic top-level domain."}}},
{"id":"n-7a5d48e8","guard":[["hasAny",["alsace","auspost","bananarepublic","bar","bentley","clothing","cloud","courses","cricket","delete","direct","dnp","dog","emerson","extraspace","film","genting","goo","hbo","hsbc","hyatt","immobilien","itau","iveco","kindle","lamborghini","macys","merckmsd","nissan","nokia","oldnavy","photography","pramerica","reise","remove","ren","rocks","ruhr","sanofi","sarl","scot","services","sew","sling","space","strip out","uol","volvo","weatherchannel","without","xbox","ファッション","慈善","新闻","닷컴"]],["has","toplevel"]],"pyramid":["render.str",["transform.remove",{"lit":"generic"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-a30f174d","guard":[["hasAny",["alsace","auspost","bananarepublic","bar","bentley","clothing","cloud","courses","cricket","direct","dnp","dog","emerson","extraspace","film","genting","goo","hbo","hsbc","hyatt","immobilien","itau","item number","iveco","kindle","lamborghini","macys","merckmsd","nissan","nokia","nth","oldnavy","photography","position","pramerica","reise","ren","rocks","ruhr","sanofi","sarl","scot","services","sew","sling","space","uol","volvo","weatherchannel","xbox","ファッション","慈善","新闻","닷컴"]],["has","toplevel"],["has","what"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a generic top-level domain."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2aea631a","guard":[["hasAny",["alsace","auspost","bananarepublic","bar","bentley","clothing","cloud","courses","cricket","direct","dnp","dog","emerson","extraspace","film","genting","goo","hbo","hsbc","hyatt","immobilien","itau","item number","iveco","kindle","lamborghini","macys","merckmsd","nissan","nokia","nth","oldnavy","photography","position","pramerica","reise","ren","rocks","ruhr","sanofi","sarl","scot","services","sew","sling","space","uol","volvo","weatherchannel","xbox","ファッション","慈善","新闻","닷컴"]],["has","toplevel"],["has","what"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a generic top-level ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-76c9d7fc","guard":[["hasAny",["alsace","auspost","bananarepublic","bar","bentley","clothing","cloud","courses","cricket","direct","dnp","dog","emerson","extraspace","film","genting","goo","hbo","hsbc","hyatt","immobilien","invert case","itau","item number","iveco","kindle","lamborghini","macys","merckmsd","nissan","nokia","nth","oldnavy","photography","position","pramerica","reise","ren","rocks","ruhr","sanofi","sarl","scot","services","sew","sling","space","swap case","toggle case","uol","volvo","weatherchannel","xbox","ファッション","慈善","新闻","닷컴"]],["has","toplevel"],["has","what"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a generic top-level ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c2e64fe5","guard":[["hasAny",["alsace","auspost","bananarepublic","bar","bentley","capitalise","capitalize","capitalize each word","clothing","cloud","courses","cricket","direct","dnp","dog","emerson","extraspace","film","genting","goo","hbo","hsbc","hyatt","immobilien","itau","item number","iveco","kindle","lamborghini","macys","merckmsd","nissan","nokia","nth","oldnavy","photography","position","pramerica","reise","ren","rocks","ruhr","sanofi","sarl","scot","services","sew","sling","space","title case","uol","volvo","weatherchannel","xbox","ファッション","慈善","新闻","닷컴"]],["has","toplevel"],["has","what"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a generic top-level ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-00a7ada9","guard":[["hasAny",["alsace","auspost","bananarepublic","bar","bentley","clothing","cloud","courses","cricket","direct","dnp","dog","emerson","extraspace","film","genting","goo","hbo","hsbc","hyatt","immobilien","itau","item number","iveco","kindle","lamborghini","macys","merckmsd","nissan","nokia","nth","oldnavy","photography","position","pramerica","reise","ren","rocks","ruhr","sanofi","sarl","scot","services","sew","sling","space","uol","volvo","weatherchannel","xbox","ファッション","慈善","新闻","닷컴"]],["has","toplevel"],["has","what"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a generic top-level ",{"slot":1},"."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0e3e79e9","guard":[["hasAny",["alsace","auspost","bananarepublic","bar","bentley","clothing","cloud","courses","cricket","direct","dnp","dog","each word","emerson","extraspace","film","genting","goo","hbo","hsbc","hyatt","immobilien","itau","item number","iveco","kindle","lamborghini","macys","merckmsd","nissan","nokia","nth","oldnavy","photography","position","pramerica","reise","ren","rocks","ruhr","sanofi","sarl","scot","services","sew","sling","space","split into words","uol","volvo","weatherchannel","xbox","ファッション","慈善","新闻","닷컴"]],["has","toplevel"],["has","what"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a generic top-level ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4d123a8a","guard":[["hasAny",["alsace","auspost","bananarepublic","bar","bentley","clothing","cloud","courses","cricket","direct","dnp","dog","emerson","extraspace","film","genting","goo","hbo","hsbc","hyatt","immobilien","itau","item number","iveco","kindle","lamborghini","macys","merckmsd","nissan","nokia","nth","oldnavy","photography","position","pramerica","reise","ren","rocks","ruhr","sanofi","sarl","scot","services","sew","sling","space","uol","volvo","weatherchannel","xbox","ファッション","慈善","新闻","닷컴"]],["has","toplevel"],["has","what"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a generic top-level ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a856e16f","guard":[["hasAny",["alsace","auspost","bananarepublic","bar","bentley","clothing","cloud","courses","cricket","direct","dnp","dog","emerson","extraspace","film","genting","goo","hbo","hsbc","hyatt","immobilien","itau","item number","iveco","kindle","lamborghini","macys","merckmsd","nissan","nokia","normalise","normalize","nth","oldnavy","photography","position","pramerica","reise","ren","rocks","ruhr","sanofi","sarl","scot","services","sew","simplify the text","sling","space","uol","volvo","weatherchannel","xbox","ファッション","慈善","新闻","닷컴"]],["has","toplevel"],["has","what"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a generic top-level ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b60df704","guard":[["hasAny",["alsace","auspost","bananarepublic","bar","bentley","clothing","cloud","courses","cricket","direct","dnp","dog","each word","emerson","extraspace","film","genting","goo","hbo","hsbc","hyatt","immobilien","itau","item number","iveco","kindle","lamborghini","macys","merckmsd","nissan","nokia","nth","oldnavy","photography","position","pramerica","reise","ren","rocks","ruhr","sanofi","sarl","scot","services","sew","sling","space","split into words","uol","volvo","weatherchannel","xbox","ファッション","慈善","新闻","닷컴"]],["has","toplevel"],["has","what"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a generic top-level ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-205454ea","guard":[["hasAny",["alsace","auspost","bananarepublic","bar","bentley","clothing","cloud","courses","cricket","direct","dnp","dog","each word","emerson","extraspace","film","genting","goo","hbo","hsbc","hyatt","immobilien","itau","item number","iveco","kindle","lamborghini","macys","merckmsd","nissan","nokia","nth","oldnavy","photography","position","pramerica","reise","ren","rocks","ruhr","sanofi","sarl","scot","services","sew","sling","space","split into words","uol","volvo","weatherchannel","words","xbox","ファッション","慈善","新闻","닷컴"]],["has","toplevel"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a generic top-level ",{"slot":1},"."]},["render.list",["transform.words",["sense.after",{"lit":"is"}]]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9e74f2d7","guard":[["hasAny",["bar","cloud","dnp","dog","fun","goo","hbo","hsbc","hyatt","itau","msd","nokia","ren","rocks","ruhr","scot","sew","shortest","shortest one","shortest word","sling","space","tci","uol","volvo","xbox","zip","慈善","新闻","닷컴"]],["has","toplevel"],["has","of"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a generic top-level domain."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-90d6d168","guard":[["hasAny",["apple","bauhaus","canon","cartier","cbre","community","dance","everbank","fitness","fun","furniture","game","madrid","moto","msd","nagoya","nikon","reit","shangrila","solar","tci","tokyo","vermögensberatung","zip","همراه"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," a generic top-level domain."]},["sense.after",{"lit":"domain"}]],"mem":null},
{"id":"n-7d51b34d","guard":[["hasAny",["apple","bauhaus","canon","cartier","cbre","community","dance","element","everbank","fitness","fun","furniture","game","item number","madrid","moto","msd","nagoya","nikon","nth","position","reit","shangrila","solar","tci","tokyo","vermögensberatung","zip","همراه"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," a generic top-level ",{"slot":1},"."]},["sense.after",{"lit":"domain"}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d0e4fd48","guard":[["hasAny",["apple","bauhaus","canon","capitalise","capitalize","capitalize each word","cartier","cbre","community","dance","element","everbank","fitness","fun","furniture","game","item number","madrid","moto","msd","nagoya","nikon","nth","position","reit","shangrila","solar","tci","title case","tokyo","vermögensberatung","zip","همراه"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," a generic top-level ",{"slot":1},"."]},["transform.title",["sense.after",{"lit":"domain"}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dc96b7f1","guard":[["hasAny",["apple","bauhaus","canon","cartier","cbre","community","dance","element","everbank","fitness","fun","furniture","game","invert case","item number","madrid","moto","msd","nagoya","nikon","nth","position","reit","shangrila","solar","swap case","tci","toggle case","tokyo","vermögensberatung","zip","همراه"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," a generic top-level ",{"slot":1},"."]},["transform.swapCase",["sense.after",{"lit":"domain"}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ffa05356","guard":[["hasAny",["apple","bauhaus","canon","cartier","cbre","community","dance","everbank","fitness","fun","furniture","game","item number","madrid","moto","msd","nagoya","nikon","nth","position","reit","shangrila","solar","tci","tokyo","vermögensberatung","zip","همراه"]],["has","kind"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a generic top-level ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c102114f","guard":[["hasAny",["aq","au","bg","bz","cu","gf","hm","hr","io","lb","lu","no","pr","py","ro","sa","shortest","shortest one","shortest word","uz","zw","бг","укр","қаз","ভরত"]],["has","toplevel"],["has","of"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a country-code top-level domain."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-04f9b258","guard":[["hasAny",["aq","au","bg","bz","delete","gf","hm","io","lb","lu","remove","sa","strip out","without","zw","бг","қаз","ভরত"]],["has","toplevel"],["has","of"]],"pyramid":["render.str",["transform.remove",{"lit":"country-code"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-46324141","guard":[["hasAny",["aq","au","bg","bz","gf","hm","io","item number","lb","lu","nth","position","sa","zw","бг","қаз","ভরত"]],["has","toplevel"],["has","of"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a country-code top-level domain."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f29b6416","guard":[["hasAny",["aq","au","bg","bz","gf","hm","io","lb","lu","reverse the words","reverse word order","sa","words backwards","zw","бг","қаз","ভরত"]],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," a country-code top-level domain."]},["transform.reverseWords",["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-5654594e","guard":[["hasAny",["aq","au","bg","bz","element","gf","hm","io","item number","lb","lu","nth","position","reverse the words","reverse word order","sa","words backwards","zw","бг","қаз","ভরত"]],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," a country-code top-level ",{"slot":1},"."]},["transform.reverseWords",["sense.after",{"lit":"domain"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7accc196","guard":[["hasAny",["aq","au","bg","bz","gf","hm","io","item number","lb","lu","nth","position","sa","zw","бг","қаз","ভরত"]],["has","toplevel"],["has","of"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a country-code top-level ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-90aa9ca8","guard":[["hasAny",["aq","au","bg","bz","gf","hm","io","item number","lb","lu","nth","position","sa","zw","бг","қаз","ভরত"]],["has","toplevel"],["has","of"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a country-code top-level ",{"slot":1},"."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6b7db5ba","guard":[["hasAny",["aq","au","bg","bz","gf","hm","io","item number","lb","lu","nth","position","sa","zw","бг","қаз"]],["has","toplevel"],["has","of"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a country-code top-level ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0e4ae020","guard":[["hasAny",["aq","au","bg","bz","gf","hm","invert case","io","item number","lb","lu","nth","position","sa","swap case","toggle case","zw","бг","қаз"]],["has","toplevel"],["has","of"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a country-code top-level ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-20644ec2","guard":[["hasAny",["aq","au","bg","bz","capitalise","capitalize","capitalize each word","gf","hm","io","item number","lb","lu","nth","position","sa","title case","zw","бг","қаз"]],["has","toplevel"],["has","of"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a country-code top-level ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-25047df9","guard":[["hasAny",["aq","au","bg","bz","each word","gf","hm","io","item number","lb","lu","nth","position","sa","split into words","zw","бг","қаз"]],["has","toplevel"],["has","of"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a country-code top-level ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6f8ff265","guard":[["hasAny",["aq","au","bg","bz","gf","hm","io","item number","lb","lu","normalise","normalize","nth","position","sa","simplify the text","zw","бг","қаз"]],["has","toplevel"],["has","of"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a country-code top-level ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d71a98a8","guard":[["hasAny",["aq","au","bg","bz","each word","gf","hm","io","item number","lb","lu","nth","position","sa","split into words","zw","бг","қаз"]],["has","toplevel"],["has","of"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a country-code top-level ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c970f5c3","guard":[["hasAny",["aq","au","bg","bz","each word","gf","hm","io","item number","lb","lu","nth","position","sa","split into words","words","zw","бг","қаз"]],["has","toplevel"],["has","of"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a country-code top-level ",{"slot":1},"."]},["render.list",["transform.words",["sense.after",{"lit":"is"}]]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4ceb74ae","guard":[["hasAny",["alsace","bananarepublic","cricket","emerson","item number","kindle","merckmsd","nissan","nth","photography","position","pramerica","shortest","shortest one","shortest word","weatherchannel"]],["has","what"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a generic top-level ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4125bb9b","guard":[["hasAny",["cu","hr","item number","no","nth","position","pr","py","ro","shortest","shortest one","shortest word","uz","укр"]],["has","kind"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a country-code top-level ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-566678b4","guard":[["hasAny",["cu","hr","item number","no","nth","position","pr","py","ro","uz","укр"]],["has","kind"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a country-code top-level ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d43b3e3b","guard":[["hasAny",["fun","item number","msd","nth","position","shortest","shortest one","shortest word","tci","zip"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is a generic top-level ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9d87d4a7","guard":[["hasAny",["delete","domain","remove","strip out","without"]],["has","of"]],"pyramid":["render.str",["transform.remove",{"lit":"country-code"},["sense.unit"]]],"mem":null},
{"id":"n-42942b68","guard":[["hasAny",["reverse the words","reverse word order","words backwards","परकष","பரடச"]]],"pyramid":["render.template",{"lit":[{"slot":0}," a test top-level domain."]},["transform.reverseWords",["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-eb414e88","guard":[["hasAny",["delete","remove","strip out","without","परकष","பரடச"]]],"pyramid":["render.str",["transform.remove",{"lit":"test"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-9411825d","guard":[["hasAny",["element","item number","nth","position","reverse the words","reverse word order","words backwards","परकष","பரடச"]]],"pyramid":["render.template",{"lit":[{"slot":0}," a test top-level ",{"slot":1},"."]},["transform.reverseWords",["sense.after",{"lit":"domain"}]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-01789199","guard":[["hasAny",["domain","kind","name","nikon","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .nikon is":".nikon is a generic top-level domain."}}},
{"id":"n-019937f7","guard":[["hasAny",["domain","toplevel","type","қаз"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .қаз":".қаз is a country-code top-level domain."}}},
{"id":"n-01cf567e","guard":[["hasAny",["domain","game","kind","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .game is":".game is a generic top-level domain."}}},
{"id":"n-047ed4ef","guard":[["hasAny",["courses","domain","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .courses":".courses is a generic top-level domain."}}},
{"id":"n-05ef5df5","guard":[["hasAny",["domain","film","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .film":".film is a generic top-level domain."}}},
{"id":"n-06c8f285","guard":[["hasAny",["category","domain","hyatt","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .hyatt":".hyatt is a generic top-level domain."}}},
{"id":"n-07985a7d","guard":[["hasAny",["domain","lb","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .lb":".lb is a country-code top-level domain."}}},
{"id":"n-08a58277","guard":[["hasAny",["dog","domain","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .dog":".dog is a generic top-level domain."}}},
{"id":"n-12175831","guard":[["hasAny",["category","domain","toplevel","бг"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .бг":".бг is a country-code top-level domain."}}},
{"id":"n-13e1a92a","guard":[["has","madrid"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .madrid is":".madrid is a generic top-level domain."}}},
{"id":"n-14b8f9d8","guard":[["has","everbank"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .everbank is":".everbank is a generic top-level domain."}}},
{"id":"n-1614cd0b","guard":[["has","hbo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .hbo":".hbo is a generic top-level domain."}}},
{"id":"n-16af6eb3","guard":[["has","lamborghini"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .lamborghini":".lamborghini is a generic top-level domain."}}},
{"id":"n-1800f319","guard":[["hasAny",["category","domain","nissan","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .nissan":".nissan is a generic top-level domain."}}},
{"id":"n-1851a568","guard":[["hasAny",["category","domain","ren","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .ren":".ren is a generic top-level domain."}}},
{"id":"n-19c6f3cc","guard":[["has","sa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .sa":".sa is a country-code top-level domain."}}},
{"id":"n-1aa44b78","guard":[["hasAny",["direct","domain","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .direct":".direct is a generic top-level domain."}}},
{"id":"n-1c1f7bf9","guard":[["has","py"],["has","kind"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .py is":".py is a country-code top-level domain."}}},
{"id":"n-1c3f261d","guard":[["has","macys"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .macys":".macys is a generic top-level domain."}}},
{"id":"n-1c70a31e","guard":[["has","alsace"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .alsace":".alsace is a generic top-level domain."}}},
{"id":"n-1d2e6834","guard":[["hasAny",["domain","sarl","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .sarl":".sarl is a generic top-level domain."}}},
{"id":"n-1e3c8cd0","guard":[["has","fitness"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .fitness is":".fitness is a generic top-level domain."}}},
{"id":"n-1eea1b0a","guard":[["hasAny",["bentley","domain","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .bentley":".bentley is a generic top-level domain."}}},
{"id":"n-1f3b8707","guard":[["has","reit"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .reit is":".reit is a generic top-level domain."}}},
{"id":"n-20470b98","guard":[["has","emerson"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .emerson":".emerson is a generic top-level domain."}}},
{"id":"n-24bb948f","guard":[["has","shangrila"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .shangrila is":".shangrila is a generic top-level domain."}}},
{"id":"n-26d411f6","guard":[["hasAny",["category","domain","itau","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .itau":".itau is a generic top-level domain."}}},
{"id":"n-26ed9c6b","guard":[["hasAny",["alsace","category","domain","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .alsace":".alsace is a generic top-level domain."}}},
{"id":"n-26ff41d0","guard":[["hasAny",["category","domain","gf","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .gf":".gf is a country-code top-level domain."}}},
{"id":"n-275960f9","guard":[["hasAny",["domain","toplevel","type","ファッション"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .ファッション":".ファッション is a generic top-level domain."}}},
{"id":"n-286c7353","guard":[["hasAny",["domain","kind","name","tokyo","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .tokyo is":".tokyo is a generic top-level domain."}}},
{"id":"n-28d6abe6","guard":[["has","genting"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .genting":".genting is a generic top-level domain."}}},
{"id":"n-2c42ae33","guard":[["has","परकष"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .परीक्षा":".परीक्षा is a test top-level domain."}}},
{"id":"n-2d6b9ee5","guard":[["has","scot"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .scot":".scot is a generic top-level domain."}}},
{"id":"n-2e0e3b79","guard":[["has","бг"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .бг":".бг is a country-code top-level domain."}}},
{"id":"n-2e4d8260","guard":[["hasAny",["domain","sa","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .sa":".sa is a country-code top-level domain."}}},
{"id":"n-2edc760d","guard":[["has","bar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .bar":".bar is a generic top-level domain."}}},
{"id":"n-2fb7dc39","guard":[["hasAny",["category","domain","toplevel","volvo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .volvo":".volvo is a generic top-level domain."}}},
{"id":"n-307b6f66","guard":[["hasAny",["category","cloud","domain","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .cloud":".cloud is a generic top-level domain."}}},
{"id":"n-30f79458","guard":[["has","nokia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .nokia":".nokia is a generic top-level domain."}}},
{"id":"n-351836cc","guard":[["has","nikon"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .nikon is":".nikon is a generic top-level domain."}}},
{"id":"n-35e7ad3e","guard":[["has","pr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .pr is":".pr is a country-code top-level domain."}}},
{"id":"n-361400bf","guard":[["hasAny",["domain","kind","name","ro","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .ro is":".ro is a country-code top-level domain."}}},
{"id":"n-36b8f644","guard":[["hasAny",["domain","sew","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .sew":".sew is a generic top-level domain."}}},
{"id":"n-36fcae27","guard":[["has","bananarepublic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .bananarepublic":".bananarepublic is a generic top-level domain."}}},
{"id":"n-39701f96","guard":[["hasAny",["domain","kind","name","toplevel","zip"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .zip is":".zip is a generic top-level domain."}}},
{"id":"n-3b492a76","guard":[["has","ro"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .ro is":".ro is a country-code top-level domain."}}},
{"id":"n-3c0f21ff","guard":[["has","hyatt"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .hyatt":".hyatt is a generic top-level domain."}}},
{"id":"n-3d749efc","guard":[["hasAny",["domain","fitness","kind","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .fitness is":".fitness is a generic top-level domain."}}},
{"id":"n-3e4f083f","guard":[["has","sew"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .sew":".sew is a generic top-level domain."}}},
{"id":"n-3e6688cc","guard":[["hasAny",["domain","macys","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .macys":".macys is a generic top-level domain."}}},
{"id":"n-3f0fceb7","guard":[["has","ভরত"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .ভারত":".ভারত is a country-code top-level domain."}}},
{"id":"n-40c8aa39","guard":[["hasAny",["category","domain","toplevel","பரடச"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .பரிட்சை":".பரிட்சை is a test top-level domain."}}},
{"id":"n-41b0d047","guard":[["hasAny",["apple","domain","kind","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .apple is":".apple is a generic top-level domain."}}},
{"id":"n-47e72b43","guard":[["hasAny",["cartier","domain","kind","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .cartier is":".cartier is a generic top-level domain."}}},
{"id":"n-4947eba6","guard":[["has","photography"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .photography":".photography is a generic top-level domain."}}},
{"id":"n-49e3bfc7","guard":[["has","dog"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .dog":".dog is a generic top-level domain."}}},
{"id":"n-4a55b669","guard":[["hasAny",["dance","domain","kind","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .dance is":".dance is a generic top-level domain."}}},
{"id":"n-4b3e53db","guard":[["has","pramerica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .pramerica":".pramerica is a generic top-level domain."}}},
{"id":"n-4ba794c4","guard":[["hasAny",["domain","kind","name","toplevel","همراه"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain ‏.همراه‎ is":"‏.همراه‎ is a generic top-level domain."}}},
{"id":"n-4bce26dc","guard":[["has","weatherchannel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .weatherchannel":".weatherchannel is a generic top-level domain."}}},
{"id":"n-4d83573d","guard":[["hasAny",["bz","category","domain","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .bz":".bz is a country-code top-level domain."}}},
{"id":"n-4e3c7f7c","guard":[["has","moto"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .moto is":".moto is a generic top-level domain."}}},
{"id":"n-513de2b4","guard":[["has","sanofi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .sanofi":".sanofi is a generic top-level domain."}}},
{"id":"n-523c2b23","guard":[["hasAny",["domain","kind","name","no","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .no is":".no is a country-code top-level domain."}}},
{"id":"n-5494e48a","guard":[["has","hr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .hr is":".hr is a country-code top-level domain."}}},
{"id":"n-551326c4","guard":[["hasAny",["domain","lamborghini","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .lamborghini":".lamborghini is a generic top-level domain."}}},
{"id":"n-5586ee4d","guard":[["hasAny",["domain","kind","name","toplevel","vermögensberatung"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .vermögensberatung is":".vermögensberatung is a generic top-level domain."}}},
{"id":"n-58708872","guard":[["hasAny",["category","domain","space","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .space":".space is a generic top-level domain."}}},
{"id":"n-597746a0","guard":[["has","iveco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .iveco":".iveco is a generic top-level domain."}}},
{"id":"n-5b34ea84","guard":[["has","services"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .services":".services is a generic top-level domain."}}},
{"id":"n-5bf53aec","guard":[["has","immobilien"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .immobilien":".immobilien is a generic top-level domain."}}},
{"id":"n-5def9bd0","guard":[["hasAny",["domain","kind","name","toplevel","укр"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .укр is":".укр is a country-code top-level domain."}}},
{"id":"n-6154a20f","guard":[["hasAny",["domain","toplevel","type","परकष"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .परीक्षा":".परीक्षा is a test top-level domain."}}},
{"id":"n-618cf2b4","guard":[["hasAny",["bar","category","domain","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .bar":".bar is a generic top-level domain."}}},
{"id":"n-620ac1cd","guard":[["hasAny",["domain","toplevel","type","新闻"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .新闻":".新闻 is a generic top-level domain."}}},
{"id":"n-6267233e","guard":[["has","aq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .aq":".aq is a country-code top-level domain."}}},
{"id":"n-62af977d","guard":[["hasAny",["domain","kind","name","pr","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .pr is":".pr is a country-code top-level domain."}}},
{"id":"n-6304feff","guard":[["hasAny",["community","domain","kind","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .community is":".community is a generic top-level domain."}}},
{"id":"n-64c69696","guard":[["has","bauhaus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .bauhaus is":".bauhaus is a generic top-level domain."}}},
{"id":"n-64d464cd","guard":[["hasAny",["category","domain","merckmsd","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .merckmsd":".merckmsd is a generic top-level domain."}}},
{"id":"n-651f7594","guard":[["hasAny",["category","domain","io","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .io":".io is a country-code top-level domain."}}},
{"id":"n-6553b9ab","guard":[["hasAny",["domain","oldnavy","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .oldnavy":".oldnavy is a generic top-level domain."}}},
{"id":"n-670d3b9b","guard":[["has","space"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .space":".space is a generic top-level domain."}}},
{"id":"n-67e65d13","guard":[["hasAny",["bauhaus","domain","kind","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .bauhaus is":".bauhaus is a generic top-level domain."}}},
{"id":"n-68415db8","guard":[["hasAny",["category","domain","ruhr","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .ruhr":".ruhr is a generic top-level domain."}}},
{"id":"n-685e1dea","guard":[["hasAny",["domain","fun","kind","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .fun is":".fun is a generic top-level domain."}}},
{"id":"n-6a9c2c96","guard":[["hasAny",["cu","domain","kind","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .cu is":".cu is a country-code top-level domain."}}},
{"id":"n-6ac09113","guard":[["hasAny",["domain","kind","name","solar","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .solar is":".solar is a generic top-level domain."}}},
{"id":"n-6bdaffb2","guard":[["hasAny",["domain","kind","nagoya","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .nagoya is":".nagoya is a generic top-level domain."}}},
{"id":"n-6c2ffbcd","guard":[["hasAny",["category","cricket","domain","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .cricket":".cricket is a generic top-level domain."}}},
{"id":"n-6c3d483f","guard":[["hasAny",["domain","kind","msd","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .msd is":".msd is a generic top-level domain."}}},
{"id":"n-6d0f0fce","guard":[["has","қаз"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .қаз":".қаз is a country-code top-level domain."}}},
{"id":"n-6e52cf37","guard":[["has","nagoya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .nagoya is":".nagoya is a generic top-level domain."}}},
{"id":"n-6eff3b4d","guard":[["hasAny",["canon","domain","kind","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .canon is":".canon is a generic top-level domain."}}},
{"id":"n-738f1694","guard":[["has","bz"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .bz":".bz is a country-code top-level domain."}}},
{"id":"n-74cf18b8","guard":[["has","ruhr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .ruhr":".ruhr is a generic top-level domain."}}},
{"id":"n-75cf3416","guard":[["has","cricket"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .cricket":".cricket is a generic top-level domain."}}},
{"id":"n-76312773","guard":[["hasAny",["domain","services","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .services":".services is a generic top-level domain."}}},
{"id":"n-7a883cfe","guard":[["has","新闻"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .新闻":".新闻 is a generic top-level domain."}}},
{"id":"n-7a88bd51","guard":[["hasAny",["cbre","domain","kind","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .cbre is":".cbre is a generic top-level domain."}}},
{"id":"n-7ac506a7","guard":[["hasAny",["domain","kind","moto","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .moto is":".moto is a generic top-level domain."}}},
{"id":"n-7ccede5c","guard":[["hasAny",["category","dnp","domain","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .dnp":".dnp is a generic top-level domain."}}},
{"id":"n-7d0d481f","guard":[["has","clothing"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .clothing":".clothing is a generic top-level domain."}}},
{"id":"n-7dae4095","guard":[["has","auspost"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .auspost":".auspost is a generic top-level domain."}}},
{"id":"n-7eddc50e","guard":[["hasAny",["domain","toplevel","type","ভরত"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .ভারত":".ভারত is a country-code top-level domain."}}},
{"id":"n-815e3e09","guard":[["has","merckmsd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .merckmsd":".merckmsd is a generic top-level domain."}}},
{"id":"n-821234f9","guard":[["hasAny",["category","domain","pramerica","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .pramerica":".pramerica is a generic top-level domain."}}},
{"id":"n-834bdcab","guard":[["has","bentley"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .bentley":".bentley is a generic top-level domain."}}},
{"id":"n-841e1a87","guard":[["hasAny",["domain","immobilien","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .immobilien":".immobilien is a generic top-level domain."}}},
{"id":"n-852e9ee2","guard":[["has","uz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .uz is":".uz is a country-code top-level domain."}}},
{"id":"n-857b38b6","guard":[["has","dnp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .dnp":".dnp is a generic top-level domain."}}},
{"id":"n-859cfccd","guard":[["has","goo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .goo":".goo is a generic top-level domain."}}},
{"id":"n-86af83a6","guard":[["has","reise"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .reise":".reise is a generic top-level domain."}}},
{"id":"n-877b7a9e","guard":[["has","lb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .lb":".lb is a country-code top-level domain."}}},
{"id":"n-87df3fc7","guard":[["hasAny",["auspost","domain","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .auspost":".auspost is a generic top-level domain."}}},
{"id":"n-8808bd8d","guard":[["hasAny",["domain","kind","name","py","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .py is":".py is a country-code top-level domain."}}},
{"id":"n-888664be","guard":[["has","community"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .community is":".community is a generic top-level domain."}}},
{"id":"n-889b9ace","guard":[["has","bg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .bg":".bg is a country-code top-level domain."}}},
{"id":"n-89698004","guard":[["has","укр"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .укр is":".укр is a country-code top-level domain."}}},
{"id":"n-8afa163c","guard":[["hasAny",["category","domain","rocks","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .rocks":".rocks is a generic top-level domain."}}},
{"id":"n-8d14788e","guard":[["has","io"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .io":".io is a country-code top-level domain."}}},
{"id":"n-8dbc40ac","guard":[["has","canon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .canon is":".canon is a generic top-level domain."}}},
{"id":"n-8ed7a2d2","guard":[["hasAny",["category","domain","sling","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .sling":".sling is a generic top-level domain."}}},
{"id":"n-8fa25334","guard":[["hasAny",["category","domain","photography","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .photography":".photography is a generic top-level domain."}}},
{"id":"n-8fc90ee7","guard":[["has","au"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .au":".au is a country-code top-level domain."}}},
{"id":"n-908053f6","guard":[["has","no"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .no is":".no is a country-code top-level domain."}}},
{"id":"n-93094a86","guard":[["hasAny",["domain","kind","madrid","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .madrid is":".madrid is a generic top-level domain."}}},
{"id":"n-97202116","guard":[["hasAny",["category","domain","hsbc","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .hsbc":".hsbc is a generic top-level domain."}}},
{"id":"n-9d73dd48","guard":[["has","cbre"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .cbre is":".cbre is a generic top-level domain."}}},
{"id":"n-a0256853","guard":[["hasAny",["domain","reise","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .reise":".reise is a generic top-level domain."}}},
{"id":"n-a32dd10e","guard":[["hasAny",["domain","genting","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .genting":".genting is a generic top-level domain."}}},
{"id":"n-a368169a","guard":[["hasAny",["category","domain","nokia","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .nokia":".nokia is a generic top-level domain."}}},
{"id":"n-a3903e87","guard":[["has","sling"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .sling":".sling is a generic top-level domain."}}},
{"id":"n-a396aad1","guard":[["has","fun"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .fun is":".fun is a generic top-level domain."}}},
{"id":"n-a54aa55b","guard":[["hasAny",["domain","kind","name","toplevel","uz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .uz is":".uz is a country-code top-level domain."}}},
{"id":"n-a9705b30","guard":[["has","همراه"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain ‏.همراه‎ is":"‏.همراه‎ is a generic top-level domain."}}},
{"id":"n-a9ccb179","guard":[["has","courses"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .courses":".courses is a generic top-level domain."}}},
{"id":"n-aa63a474","guard":[["has","furniture"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .furniture is":".furniture is a generic top-level domain."}}},
{"id":"n-aa93182f","guard":[["has","lu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .lu":".lu is a country-code top-level domain."}}},
{"id":"n-aa9aea87","guard":[["has","vermögensberatung"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .vermögensberatung is":".vermögensberatung is a generic top-level domain."}}},
{"id":"n-aafbd4af","guard":[["hasAny",["category","domain","toplevel","xbox"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .xbox":".xbox is a generic top-level domain."}}},
{"id":"n-ab1cee3d","guard":[["has","cloud"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .cloud":".cloud is a generic top-level domain."}}},
{"id":"n-abc0e6f4","guard":[["hasAny",["domain","kind","name","tci","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .tci is":".tci is a generic top-level domain."}}},
{"id":"n-ada415c3","guard":[["has","itau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .itau":".itau is a generic top-level domain."}}},
{"id":"n-b4ca6811","guard":[["hasAny",["clothing","domain","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .clothing":".clothing is a generic top-level domain."}}},
{"id":"n-b73fa63e","guard":[["hasAny",["domain","furniture","kind","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .furniture is":".furniture is a generic top-level domain."}}},
{"id":"n-b86f767e","guard":[["has","oldnavy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .oldnavy":".oldnavy is a generic top-level domain."}}},
{"id":"n-b9db691c","guard":[["hasAny",["domain","iveco","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .iveco":".iveco is a generic top-level domain."}}},
{"id":"n-bb02e2af","guard":[["hasAny",["domain","hr","kind","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .hr is":".hr is a country-code top-level domain."}}},
{"id":"n-bfc8f01f","guard":[["hasAny",["domain","toplevel","type","zw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .zw":".zw is a country-code top-level domain."}}},
{"id":"n-bffd910e","guard":[["hasAny",["domain","toplevel","type","닷컴"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .닷컴":".닷컴 is a generic top-level domain."}}},
{"id":"n-c33a543f","guard":[["has","sarl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .sarl":".sarl is a generic top-level domain."}}},
{"id":"n-c60ce1cc","guard":[["hasAny",["category","domain","kindle","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .kindle":".kindle is a generic top-level domain."}}},
{"id":"n-c77e7f08","guard":[["has","zw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .zw":".zw is a country-code top-level domain."}}},
{"id":"n-c9e97f01","guard":[["hasAny",["category","domain","goo","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .goo":".goo is a generic top-level domain."}}},
{"id":"n-ca622d77","guard":[["has","ファッション"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .ファッション":".ファッション is a generic top-level domain."}}},
{"id":"n-cb00fd06","guard":[["hasAny",["aq","category","domain","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .aq":".aq is a country-code top-level domain."}}},
{"id":"n-cb6ed367","guard":[["hasAny",["bananarepublic","category","domain","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .bananarepublic":".bananarepublic is a generic top-level domain."}}},
{"id":"n-cc050658","guard":[["hasAny",["domain","toplevel","type","uol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .uol":".uol is a generic top-level domain."}}},
{"id":"n-ced1d556","guard":[["has","hm"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .hm":".hm is a country-code top-level domain."}}},
{"id":"n-cfc56c19","guard":[["has","uol"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .uol":".uol is a generic top-level domain."}}},
{"id":"n-d080f3a6","guard":[["has","பரடச"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .பரிட்சை":".பரிட்சை is a test top-level domain."}}},
{"id":"n-d09a2968","guard":[["has","gf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .gf":".gf is a country-code top-level domain."}}},
{"id":"n-d1310741","guard":[["has","msd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .msd is":".msd is a generic top-level domain."}}},
{"id":"n-d242da86","guard":[["hasAny",["category","domain","toplevel","weatherchannel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .weatherchannel":".weatherchannel is a generic top-level domain."}}},
{"id":"n-d43c2ba8","guard":[["has","kindle"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .kindle":".kindle is a generic top-level domain."}}},
{"id":"n-d482e746","guard":[["has","cu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .cu is":".cu is a country-code top-level domain."}}},
{"id":"n-d53a98f2","guard":[["has","tci"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .tci is":".tci is a generic top-level domain."}}},
{"id":"n-d5b97fe8","guard":[["hasAny",["domain","kind","name","shangrila","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .shangrila is":".shangrila is a generic top-level domain."}}},
{"id":"n-d897d468","guard":[["hasAny",["domain","hm","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .hm":".hm is a country-code top-level domain."}}},
{"id":"n-d9abae56","guard":[["has","닷컴"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .닷컴":".닷컴 is a generic top-level domain."}}},
{"id":"n-d9cdce89","guard":[["has","dance"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .dance is":".dance is a generic top-level domain."}}},
{"id":"n-da13f82b","guard":[["hasAny",["au","domain","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .au":".au is a country-code top-level domain."}}},
{"id":"n-dae8d562","guard":[["has","apple"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .apple is":".apple is a generic top-level domain."}}},
{"id":"n-dcc5eac2","guard":[["has","ren"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .ren":".ren is a generic top-level domain."}}},
{"id":"n-deaac3f3","guard":[["has","solar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .solar is":".solar is a generic top-level domain."}}},
{"id":"n-e032b089","guard":[["hasAny",["domain","everbank","kind","name","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .everbank is":".everbank is a generic top-level domain."}}},
{"id":"n-e05c5273","guard":[["has","xbox"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .xbox":".xbox is a generic top-level domain."}}},
{"id":"n-e1003b67","guard":[["hasAny",["domain","extraspace","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .extraspace":".extraspace is a generic top-level domain."}}},
{"id":"n-e144db50","guard":[["has","rocks"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .rocks":".rocks is a generic top-level domain."}}},
{"id":"n-e2438665","guard":[["hasAny",["domain","kind","name","reit","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .reit is":".reit is a generic top-level domain."}}},
{"id":"n-e33e8d1e","guard":[["has","nissan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .nissan":".nissan is a generic top-level domain."}}},
{"id":"n-e3fe7e61","guard":[["hasAny",["bg","category","domain","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .bg":".bg is a country-code top-level domain."}}},
{"id":"n-e467aecc","guard":[["hasAny",["category","domain","emerson","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .emerson":".emerson is a generic top-level domain."}}},
{"id":"n-e9dad493","guard":[["has","tokyo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .tokyo is":".tokyo is a generic top-level domain."}}},
{"id":"n-eab54eba","guard":[["has","game"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .game is":".game is a generic top-level domain."}}},
{"id":"n-eb7bc512","guard":[["has","zip"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .zip is":".zip is a generic top-level domain."}}},
{"id":"n-eba8fbe0","guard":[["hasAny",["domain","lu","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .lu":".lu is a country-code top-level domain."}}},
{"id":"n-f04584af","guard":[["hasAny",["domain","toplevel","type","慈善"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .慈善":".慈善 is a generic top-level domain."}}},
{"id":"n-f06a78d7","guard":[["hasAny",["domain","sanofi","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .sanofi":".sanofi is a generic top-level domain."}}},
{"id":"n-f1ed77f2","guard":[["has","film"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .film":".film is a generic top-level domain."}}},
{"id":"n-f36aeabe","guard":[["has","volvo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .volvo":".volvo is a generic top-level domain."}}},
{"id":"n-f454bfd4","guard":[["has","extraspace"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .extraspace":".extraspace is a generic top-level domain."}}},
{"id":"n-f45762cb","guard":[["has","hsbc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .hsbc":".hsbc is a generic top-level domain."}}},
{"id":"n-f7ef9805","guard":[["has","cartier"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the kind of top-level domain .cartier is":".cartier is a generic top-level domain."}}},
{"id":"n-f810d128","guard":[["hasAny",["category","domain","scot","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what category of top-level domain is .scot":".scot is a generic top-level domain."}}},
{"id":"n-f81159b6","guard":[["has","慈善"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .慈善":".慈善 is a generic top-level domain."}}},
{"id":"n-fd02b9e8","guard":[["has","direct"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .direct":".direct is a generic top-level domain."}}},
{"id":"n-fe7c6adc","guard":[["hasAny",["domain","hbo","toplevel","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what type of top-level domain is .hbo":".hbo is a generic top-level domain."}}},
{"id":"n-00d2af7b","guard":[["hasAny",["canon","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".canon is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0144e8f3","guard":[["hasAny",["cu","item number","nth","position"]],["has","kind"]],"pyramid":["render.template",{"lit":[".cu is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-07d6e735","guard":[["hasAny",["item number","nth","position","shangrila"]]],"pyramid":["render.template",{"lit":[".shangrila is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0a327d83","guard":[["hasAny",["item number","msd","nth","position"]]],"pyramid":["render.template",{"lit":[".msd is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0aa98e09","guard":[["hasAny",["aq","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[".aq is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0c206cf2","guard":[["hasAny",["item number","nth","position","weatherchannel"]]],"pyramid":["render.template",{"lit":[".weatherchannel is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0e3a635e","guard":[["hasAny",["item number","lamborghini","nth","position"]]],"pyramid":["render.template",{"lit":[".lamborghini is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-16a759a5","guard":[["hasAny",["item number","nth","position","sarl"]]],"pyramid":["render.template",{"lit":[".sarl is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-19990541","guard":[["hasAny",["courses","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".courses is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1c1e8ba3","guard":[["hasAny",["item number","nth","position","бг"]]],"pyramid":["render.template",{"lit":[".бг is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1cf94f67","guard":[["hasAny",["item number","lb","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[".lb is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1d339a1b","guard":[["hasAny",["item number","iveco","nth","position"]]],"pyramid":["render.template",{"lit":[".iveco is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2074cd08","guard":[["hasAny",["clothing","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".clothing is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-251d9627","guard":[["hasAny",["everbank","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".everbank is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-26e87a18","guard":[["hasAny",["item number","nth","position","sanofi"]]],"pyramid":["render.template",{"lit":[".sanofi is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2cffbe6b","guard":[["hasAny",["item number","nth","position","reise"]]],"pyramid":["render.template",{"lit":[".reise is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2eb0f065","guard":[["hasAny",["io","item number","nth","position"]],["has","category"]],"pyramid":["render.template",{"lit":[".io is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-30a60ffc","guard":[["hasAny",["bz","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[".bz is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-30fe810b","guard":[["hasAny",["item number","nth","position","укр"]]],"pyramid":["render.template",{"lit":[".укр is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-318b45a6","guard":[["hasAny",["item number","nth","position","space"]],["has","category"]],"pyramid":["render.template",{"lit":[".space is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3239e4f6","guard":[["hasAny",["hm","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[".hm is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-34d0bf00","guard":[["hasAny",["item number","nth","position","ভরত"]]],"pyramid":["render.template",{"lit":[".ভারত is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-35bca274","guard":[["hasAny",["extraspace","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".extraspace is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-377cbfc3","guard":[["hasAny",["item number","nth","position","zip"]]],"pyramid":["render.template",{"lit":[".zip is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-39372a28","guard":[["hasAny",["item number","macys","nth","position"]]],"pyramid":["render.template",{"lit":[".macys is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3c062ce4","guard":[["hasAny",["item number","nth","position","xbox"]]],"pyramid":["render.template",{"lit":[".xbox is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3e53b69c","guard":[["hasAny",["item number","nikon","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[".nikon is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3ea33bb7","guard":[["hasAny",["item number","nth","position","همراه"]]],"pyramid":["render.template",{"lit":["‏.همراه‎ is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3fe92ac0","guard":[["hasAny",["item number","nth","oldnavy","position"]]],"pyramid":["render.template",{"lit":[".oldnavy is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-40fd3123","guard":[["hasAny",["item number","lu","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[".lu is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-473b1fda","guard":[["hasAny",["item number","nth","position","pramerica"]]],"pyramid":["render.template",{"lit":[".pramerica is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-482a7f43","guard":[["hasAny",["film","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".film is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-485f1933","guard":[["hasAny",["goo","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".goo is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4964639d","guard":[["hasAny",["fitness","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".fitness is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-513c941f","guard":[["hasAny",["item number","nth","position","uz"]],["has","name"]],"pyramid":["render.template",{"lit":[".uz is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-52542dd4","guard":[["hasAny",["item number","nth","position","қаз"]]],"pyramid":["render.template",{"lit":[".қаз is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-525c5365","guard":[["hasAny",["community","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".community is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5b1f5bcf","guard":[["hasAny",["bauhaus","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[".bauhaus is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5d97f9c7","guard":[["hasAny",["item number","nokia","nth","position"]]],"pyramid":["render.template",{"lit":[".nokia is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-60f71288","guard":[["hasAny",["dance","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".dance is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-61264d45","guard":[["hasAny",["hsbc","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".hsbc is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6237a634","guard":[["hasAny",["cloud","item number","nth","position"]],["has","category"]],"pyramid":["render.template",{"lit":[".cloud is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-688a1997","guard":[["hasAny",["bg","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".bg is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-68ca87d0","guard":[["hasAny",["alsace","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".alsace is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6a53c3dc","guard":[["hasAny",["hbo","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[".hbo is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6cbb5fb6","guard":[["hasAny",["item number","nth","photography","position"]],["has","what"]],"pyramid":["render.template",{"lit":[".photography is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-707d84e1","guard":[["hasAny",["gf","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".gf is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-76c8f8f6","guard":[["hasAny",["hr","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".hr is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7ada01e4","guard":[["hasAny",["apple","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[".apple is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7b942d71","guard":[["hasAny",["item number","nth","position","sa"]],["has","type"]],"pyramid":["render.template",{"lit":[".sa is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7eee8f47","guard":[["hasAny",["item number","nth","position","py"]],["has","kind"]],"pyramid":["render.template",{"lit":[".py is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7f9c0622","guard":[["hasAny",["item number","nth","position","zw"]],["has","what"]],"pyramid":["render.template",{"lit":[".zw is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8127de5f","guard":[["hasAny",["item number","nth","position","sew"]]],"pyramid":["render.template",{"lit":[".sew is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8287efcf","guard":[["hasAny",["item number","nth","position","scot"]]],"pyramid":["render.template",{"lit":[".scot is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-82b04d2d","guard":[["hasAny",["auspost","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".auspost is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-839f86f7","guard":[["hasAny",["item number","kindle","nth","position"]]],"pyramid":["render.template",{"lit":[".kindle is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8670dac5","guard":[["hasAny",["cbre","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".cbre is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-877c23ed","guard":[["hasAny",["game","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[".game is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8d8c5de9","guard":[["hasAny",["cricket","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[".cricket is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8e6ac930","guard":[["hasAny",["itau","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[".itau is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8f72318e","guard":[["hasAny",["bar","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[".bar is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8fe864b9","guard":[["hasAny",["dog","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[".dog is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-92b4344a","guard":[["hasAny",["genting","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".genting is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-93b8775b","guard":[["hasAny",["item number","nth","position","volvo"]]],"pyramid":["render.template",{"lit":[".volvo is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-97ba94cd","guard":[["hasAny",["hyatt","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[".hyatt is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9acc72c0","guard":[["hasAny",["item number","nth","position","பரடச"]]],"pyramid":["render.template",{"lit":[".பரிட்சை is a test top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9d1e53af","guard":[["hasAny",["item number","nth","position","rocks"]]],"pyramid":["render.template",{"lit":[".rocks is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a0d02a40","guard":[["hasAny",["item number","madrid","nth","position"]]],"pyramid":["render.template",{"lit":[".madrid is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a5762013","guard":[["hasAny",["item number","nth","position","ruhr"]]],"pyramid":["render.template",{"lit":[".ruhr is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a7b76bfb","guard":[["hasAny",["item number","nissan","nth","position"]]],"pyramid":["render.template",{"lit":[".nissan is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b0a95add","guard":[["hasAny",["bananarepublic","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".bananarepublic is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b0d63834","guard":[["hasAny",["emerson","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".emerson is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b202308f","guard":[["hasAny",["cartier","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".cartier is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b90d65eb","guard":[["hasAny",["item number","nth","position","tci"]]],"pyramid":["render.template",{"lit":[".tci is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bc011e02","guard":[["hasAny",["immobilien","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".immobilien is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-bcbbf713","guard":[["hasAny",["furniture","item number","nth","position"]],["has","kind"]],"pyramid":["render.template",{"lit":[".furniture is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bf067551","guard":[["hasAny",["item number","nth","position","pr"]],["has","name"]],"pyramid":["render.template",{"lit":[".pr is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bf3a2dca","guard":[["hasAny",["item number","merckmsd","nth","position"]]],"pyramid":["render.template",{"lit":[".merckmsd is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-bfb982ca","guard":[["hasAny",["item number","nth","position","慈善"]]],"pyramid":["render.template",{"lit":[".慈善 is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c1c60638","guard":[["hasAny",["item number","nth","position","닷컴"]]],"pyramid":["render.template",{"lit":[".닷컴 is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c61c7bcb","guard":[["hasAny",["item number","nth","position","ro"]]],"pyramid":["render.template",{"lit":[".ro is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d11247f2","guard":[["hasAny",["fun","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".fun is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d6c446dc","guard":[["hasAny",["bentley","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".bentley is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-dba5e50a","guard":[["hasAny",["item number","nth","position","新闻"]]],"pyramid":["render.template",{"lit":[".新闻 is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-dd366260","guard":[["hasAny",["item number","nth","position","services"]],["has","what"]],"pyramid":["render.template",{"lit":[".services is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-de67c303","guard":[["hasAny",["item number","nth","position","ファッション"]]],"pyramid":["render.template",{"lit":[".ファッション is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-dfc1ef07","guard":[["hasAny",["au","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[".au is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e61d5abb","guard":[["hasAny",["change to","lb","replace","substitute","swap"]],["has","what"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.unit"],{"lit":"country-code"}]],"mem":null},
{"id":"n-e956b8e4","guard":[["hasAny",["item number","moto","nth","position"]]],"pyramid":["render.template",{"lit":[".moto is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ea43f68a","guard":[["hasAny",["item number","no","nth","position"]],["has","kind"]],"pyramid":["render.template",{"lit":[".no is a country-code top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-eba7ea60","guard":[["hasAny",["item number","nth","position","sling"]]],"pyramid":["render.template",{"lit":[".sling is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ebc9cf02","guard":[["hasAny",["direct","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".direct is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f10c487d","guard":[["hasAny",["item number","nth","position","vermögensberatung"]]],"pyramid":["render.template",{"lit":[".vermögensberatung is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f59095c2","guard":[["hasAny",["item number","nth","position","uol"]]],"pyramid":["render.template",{"lit":[".uol is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f7845d78","guard":[["hasAny",["item number","nth","position","ren"]]],"pyramid":["render.template",{"lit":[".ren is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f81a46dc","guard":[["hasAny",["change to","lb","replace","substitute","swap"]],["has","what"]],"pyramid":["render.str",["transform.replace",["sense.unit"],["sense.lastWord"],{"lit":"country-code"}]],"mem":null},
{"id":"n-f9ddef97","guard":[["hasAny",["item number","nagoya","nth","position"]]],"pyramid":["render.template",{"lit":[".nagoya is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fb2be2e8","guard":[["hasAny",["item number","nth","position","परकष"]],["has","what"]],"pyramid":["render.template",{"lit":[".परीक्षा is a test top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-fdfd7c3b","guard":[["hasAny",["item number","nth","position","reit"]]],"pyramid":["render.template",{"lit":[".reit is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fe2c38a2","guard":[["hasAny",["item number","nth","position","tokyo"]],["has","kind"]],"pyramid":["render.template",{"lit":[".tokyo is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fe956d96","guard":[["hasAny",["dnp","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".dnp is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ff083798","guard":[["hasAny",["item number","nth","position","solar"]]],"pyramid":["render.template",{"lit":[".solar is a generic top-level ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the kind of top-level domain .furniture is","expect":{"contains":["generic"],"notRefusal":true}},{"q":"what type of top-level domain is .hm","expect":{"contains":["country-code"],"notRefusal":true}},{"q":"what type of top-level domain is .immobilien","expect":{"contains":["generic"],"notRefusal":true}},{"q":"name the kind of top-level domain .nagoya is","expect":{"contains":["generic"],"notRefusal":true}},{"q":"name the kind of top-level domain .tci is","expect":{"contains":["generic"],"notRefusal":true}},{"q":"what category of top-level domain is .bz","expect":{"contains":["country-code"],"notRefusal":true}},{"q":"name the kind of top-level domain .reit is","expect":{"contains":["generic"],"notRefusal":true}},{"q":"what category of top-level domain is .bananarepublic","expect":{"contains":["generic"],"notRefusal":true}},{"q":"what type of top-level domain is .auspost","expect":{"contains":["generic"],"notRefusal":true}},{"q":"what type of top-level domain is .macys","expect":{"contains":["generic"],"notRefusal":true}},{"q":"what category of top-level domain is .dnp","expect":{"contains":["generic"],"notRefusal":true}},{"q":"what category of top-level domain is .sling","expect":{"contains":["generic"],"notRefusal":true}},{"q":"what category of top-level domain is .gf","expect":{"contains":["country-code"],"notRefusal":true}},{"q":"what category of top-level domain is .rocks","expect":{"contains":["generic"],"notRefusal":true}},{"q":"name the kind of top-level domain .bauhaus is","expect":{"contains":["generic"],"notRefusal":true}},{"q":"what category of top-level domain is .space","expect":{"contains":["generic"],"notRefusal":true}},{"q":"name the kind of top-level domain .pr is","expect":{"contains":["country-code"],"notRefusal":true}},{"q":"what type of top-level domain is .film","expect":{"contains":["generic"],"notRefusal":true}},{"q":"what type of top-level domain is .reise","expect":{"contains":["generic"],"notRefusal":true}},{"q":"what type of top-level domain is .新闻","expect":{"contains":["generic"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
