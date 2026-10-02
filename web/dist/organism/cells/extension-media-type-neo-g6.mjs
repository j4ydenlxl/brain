// extension-media-type-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"extension-media-type-neo-g6","class":"extension-media-type","generation":6,"lane":"neo","grownFrom":["name the content type for .osfpvg files","which MIME type goes with the extension xhtml","what is the media type of a .gnumeric file","which MIME type goes with the extension me","what is the media type of a .xlt file","what is the media type of a .ez file","which MIME type goes with the extension gxf","name the content type for .qam files","what is the media type of a .oth file","what is the media type of a .texi file","name the content type for .frame files","name the content type for .ttc files","name the content type for .dataless files","name the content type for .wpd files","name the content type for .qxb files","what is the media type of a .webmanifest file","which MIME type goes with the extension es3","which MIME type goes with the extension glb","name the content type for .ustar files","name the content type for .jad files"],"version":1});

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
{"id":"n-02497990","guard":[["has","type"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","which MIME type goes with the extension xhtml":"application/xhtml+xml","what is the media type of a .gnumeric file":"application/x-gnumeric","which MIME type goes with the extension me":"text/troff","what is the media type of a .xlt file":"application/vnd.ms-excel","what is the media type of a .ez file":"application/andrew-inset","which MIME type goes with the extension gxf":"application/gxf","name the content type for .qam files":"application/vnd.epson.quickanime","what is the media type of a .oth file":"application/vnd.oasis.opendocument.text-web","what is the media type of a .texi file":"application/x-texinfo","name the content type for .frame files":"application/vnd.framemaker","name the content type for .ttc files":"font/collection","name the content type for .dataless files":"application/vnd.fdsn.seed","name the content type for .wpd files":"application/vnd.wordperfect","name the content type for .qxb files":"application/vnd.quark.quarkxpress","what is the media type of a .webmanifest file":"application/manifest+json","which MIME type goes with the extension es3":"application/vnd.eszigno3+xml","which MIME type goes with the extension glb":"model/gltf-binary","name the content type for .ustar files":"application/x-ustar","name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor","which MIME type goes with the extension m4u":"video/vnd.mpegurl","which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","what is the media type of a .h file":"text/x-c","name the content type for .xpi files":"application/x-xpinstall","name the content type for .kml files":"application/vnd.google-earth.kml+xml","which MIME type goes with the extension stpnc":"model/step","which MIME type goes with the extension rsheet":"application/urc-ressheet+xml","name the content type for .prf files":"application/pics-rules","what is the media type of a .fvt file":"video/vnd.fvt","what is the media type of a .stw file":"application/vnd.sun.xml.writer.template","what is the media type of a .edx file":"application/vnd.novadigm.edx","what is the media type of a .mvt file":"application/vnd.mapbox-vector-tile","what is the media type of a .sbml file":"application/sbml+xml","name the content type for .hdf files":"application/x-hdf","what is the media type of a .stpxz file":"model/step-xml+zip","what is the media type of a .rusd file":"application/route-usd+xml","what is the media type of a .gif file":"image/gif","what is the media type of a .mpkg file":"application/vnd.apple.installer+xml","which MIME type goes with the extension uvv":"video/vnd.dece.video","which MIME type goes with the extension lostxml":"application/lost+xml","which MIME type goes with the extension au":"audio/basic","name the content type for .evy files":"application/x-envoy","name the content type for .txf files":"application/vnd.mobius.txf","which MIME type goes with the extension 3ds":"image/x-3ds","what is the media type of a .jais file":"image/jais","which MIME type goes with the extension wmx":"video/x-ms-wmx","which MIME type goes with the extension uvg":"image/vnd.dece.graphic","name the content type for .cjs files":"application/node","name the content type for .held files":"application/atsc-held+xml","name the content type for .less files":"text/less","name the content type for .u8mdn files":"message/global-disposition-notification","name the content type for .pas files":"text/x-pascal","what is the media type of a .xo file":"application/vnd.olpc-sugar","what is the media type of a .spx file":"audio/ogg","what is the media type of a .nsc file":"application/x-conference","which MIME type goes with the extension spl":"application/x-futuresplash","name the content type for .tpl files":"application/vnd.groove-tool-template","which MIME type goes with the extension ppt":"application/vnd.ms-powerpoint","which MIME type goes with the extension cdmid":"application/cdmi-domain","what is the media type of a .ova file":"application/x-virtualbox-ova","name the content type for .spdx files":"text/spdx","what is the media type of a .arj file":"application/x-arj","what is the media type of a .umj file":"application/vnd.umajin","name the content type for .vtx files":"application/vnd.visio","which MIME type goes with the extension oas":"application/vnd.fujitsu.oasys","what is the media type of a .rdz file":"application/vnd.data-vision.rdz","name the content type for .dot files":"application/msword","name the content type for .tsd files":"application/timestamped-data","which MIME type goes with the extension m4b":"audio/mp4","which MIME type goes with the extension amlx":"application/automationml-amlx+zip","what is the media type of a .yaml file":"text/yaml","what is the media type of a .sieve file":"application/sieve","which MIME type goes with the extension exr":"image/aces","name the content type for .fhc files":"image/x-freehand","which MIME type goes with the extension n3":"text/n3","name the content type for .vcard files":"text/vcard","which MIME type goes with the extension p":"text/x-pascal","which MIME type goes with the extension sfv":"text/x-sfv","which MIME type goes with the extension vec":"application/vec+xml","which MIME type goes with the extension sdc":"application/vnd.stardivision.calc","name the content type for .mmf files":"application/vnd.smaf","which MIME type goes with the extension dvb":"video/vnd.dvb.file","name the content type for .spf files":"application/vnd.yamaha.smaf-phrase","name the content type for .c4p files":"application/vnd.clonk.c4group","what is the media type of a .rq file":"application/sparql-query","name the content type for .ice files":"x-conference/x-cooltalk","which MIME type goes with the extension h261":"video/h261","name the content type for .hdd files":"application/x-virtualbox-hdd","which MIME type goes with the extension gph":"application/vnd.flographit","what is the media type of a .text file":"text/plain","what is the media type of a .pic file":"image/x-pict","what is the media type of a .gbr file":"application/rpki-ghostbusters","what is the media type of a .wmlc file":"application/vnd.wap.wmlc","what is the media type of a .mxs file":"application/vnd.triscape.mxs","which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template","which MIME type goes with the extension wbxml":"application/vnd.wap.wbxml","which MIME type goes with the extension onetoc":"application/onenote","name the content type for .xls files":"application/vnd.ms-excel","what is the media type of a .x3dbz file":"model/x3d+binary","what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-3fe6c5cf","guard":[["has","type"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"type"}]]],"mem":{"table":{"for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml","goes with the extension xhtml":"application/xhtml+xml","of a .gnumeric file":"application/x-gnumeric","goes with the extension me":"text/troff","of a .xlt file":"application/vnd.ms-excel","of a .ez file":"application/andrew-inset","goes with the extension gxf":"application/gxf","for .qam files":"application/vnd.epson.quickanime","of a .oth file":"application/vnd.oasis.opendocument.text-web","of a .texi file":"application/x-texinfo","for .frame files":"application/vnd.framemaker","for .ttc files":"font/collection","for .dataless files":"application/vnd.fdsn.seed","for .wpd files":"application/vnd.wordperfect","for .qxb files":"application/vnd.quark.quarkxpress","of a .webmanifest file":"application/manifest+json","goes with the extension es3":"application/vnd.eszigno3+xml","goes with the extension glb":"model/gltf-binary","for .ustar files":"application/x-ustar","for .jad files":"text/vnd.sun.j2me.app-descriptor","goes with the extension m4u":"video/vnd.mpegurl","goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template","of a .h file":"text/x-c","for .xpi files":"application/x-xpinstall","for .kml files":"application/vnd.google-earth.kml+xml","goes with the extension stpnc":"model/step","goes with the extension rsheet":"application/urc-ressheet+xml","for .prf files":"application/pics-rules","of a .fvt file":"video/vnd.fvt","of a .stw file":"application/vnd.sun.xml.writer.template","of a .edx file":"application/vnd.novadigm.edx","of a .mvt file":"application/vnd.mapbox-vector-tile","of a .sbml file":"application/sbml+xml","for .hdf files":"application/x-hdf","of a .stpxz file":"model/step-xml+zip","of a .rusd file":"application/route-usd+xml","of a .gif file":"image/gif","of a .mpkg file":"application/vnd.apple.installer+xml","goes with the extension uvv":"video/vnd.dece.video","goes with the extension lostxml":"application/lost+xml","goes with the extension au":"audio/basic","for .evy files":"application/x-envoy","for .txf files":"application/vnd.mobius.txf","goes with the extension 3ds":"image/x-3ds","of a .jais file":"image/jais","goes with the extension wmx":"video/x-ms-wmx","goes with the extension uvg":"image/vnd.dece.graphic","for .cjs files":"application/node","for .held files":"application/atsc-held+xml","for .less files":"text/less","for .u8mdn files":"message/global-disposition-notification","for .pas files":"text/x-pascal","of a .xo file":"application/vnd.olpc-sugar","of a .spx file":"audio/ogg","of a .nsc file":"application/x-conference","goes with the extension spl":"application/x-futuresplash","for .tpl files":"application/vnd.groove-tool-template","goes with the extension ppt":"application/vnd.ms-powerpoint","goes with the extension cdmid":"application/cdmi-domain","of a .ova file":"application/x-virtualbox-ova","for .spdx files":"text/spdx","of a .arj file":"application/x-arj","of a .umj file":"application/vnd.umajin","for .vtx files":"application/vnd.visio","goes with the extension oas":"application/vnd.fujitsu.oasys","of a .rdz file":"application/vnd.data-vision.rdz","for .dot files":"application/msword","for .tsd files":"application/timestamped-data","goes with the extension m4b":"audio/mp4","goes with the extension amlx":"application/automationml-amlx+zip","of a .yaml file":"text/yaml","of a .sieve file":"application/sieve","goes with the extension exr":"image/aces","for .fhc files":"image/x-freehand","goes with the extension n3":"text/n3","for .vcard files":"text/vcard","goes with the extension p":"text/x-pascal","goes with the extension sfv":"text/x-sfv","goes with the extension vec":"application/vec+xml","goes with the extension sdc":"application/vnd.stardivision.calc","for .mmf files":"application/vnd.smaf","goes with the extension dvb":"video/vnd.dvb.file","for .spf files":"application/vnd.yamaha.smaf-phrase","for .c4p files":"application/vnd.clonk.c4group","of a .rq file":"application/sparql-query","for .ice files":"x-conference/x-cooltalk","goes with the extension h261":"video/h261","for .hdd files":"application/x-virtualbox-hdd","goes with the extension gph":"application/vnd.flographit","of a .text file":"text/plain","of a .pic file":"image/x-pict","of a .gbr file":"application/rpki-ghostbusters","of a .wmlc file":"application/vnd.wap.wmlc","of a .mxs file":"application/vnd.triscape.mxs","goes with the extension clkt":"application/vnd.crick.clicker.template","goes with the extension wbxml":"application/vnd.wap.wbxml","goes with the extension onetoc":"application/onenote","for .xls files":"application/vnd.ms-excel","of a .x3dbz file":"model/x3d+binary","of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-123c8409","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"a .gnumeric file":"application/x-gnumeric","a .xlt file":"application/vnd.ms-excel","a .ez file":"application/andrew-inset","a .oth file":"application/vnd.oasis.opendocument.text-web","a .texi file":"application/x-texinfo","a .webmanifest file":"application/manifest+json","a .h file":"text/x-c","a .fvt file":"video/vnd.fvt","a .stw file":"application/vnd.sun.xml.writer.template","a .edx file":"application/vnd.novadigm.edx","a .mvt file":"application/vnd.mapbox-vector-tile","a .sbml file":"application/sbml+xml","a .stpxz file":"model/step-xml+zip","a .rusd file":"application/route-usd+xml","a .gif file":"image/gif","a .mpkg file":"application/vnd.apple.installer+xml","a .jais file":"image/jais","a .xo file":"application/vnd.olpc-sugar","a .spx file":"audio/ogg","a .nsc file":"application/x-conference","a .ova file":"application/x-virtualbox-ova","a .arj file":"application/x-arj","a .umj file":"application/vnd.umajin","a .rdz file":"application/vnd.data-vision.rdz","a .yaml file":"text/yaml","a .sieve file":"application/sieve","a .rq file":"application/sparql-query","a .text file":"text/plain","a .pic file":"image/x-pict","a .gbr file":"application/rpki-ghostbusters","a .wmlc file":"application/vnd.wap.wmlc","a .mxs file":"application/vnd.triscape.mxs","a .x3dbz file":"model/x3d+binary","a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-afdbb333","guard":[["has","file"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the media type of a .gnumeric file":"application/x-gnumeric","the media type of a .xlt file":"application/vnd.ms-excel","the media type of a .ez file":"application/andrew-inset","the media type of a .oth file":"application/vnd.oasis.opendocument.text-web","the media type of a .texi file":"application/x-texinfo","the media type of a .webmanifest file":"application/manifest+json","the media type of a .h file":"text/x-c","the media type of a .fvt file":"video/vnd.fvt","the media type of a .stw file":"application/vnd.sun.xml.writer.template","the media type of a .edx file":"application/vnd.novadigm.edx","the media type of a .mvt file":"application/vnd.mapbox-vector-tile","the media type of a .sbml file":"application/sbml+xml","the media type of a .stpxz file":"model/step-xml+zip","the media type of a .rusd file":"application/route-usd+xml","the media type of a .gif file":"image/gif","the media type of a .mpkg file":"application/vnd.apple.installer+xml","the media type of a .jais file":"image/jais","the media type of a .xo file":"application/vnd.olpc-sugar","the media type of a .spx file":"audio/ogg","the media type of a .nsc file":"application/x-conference","the media type of a .ova file":"application/x-virtualbox-ova","the media type of a .arj file":"application/x-arj","the media type of a .umj file":"application/vnd.umajin","the media type of a .rdz file":"application/vnd.data-vision.rdz","the media type of a .yaml file":"text/yaml","the media type of a .sieve file":"application/sieve","the media type of a .rq file":"application/sparql-query","the media type of a .text file":"text/plain","the media type of a .pic file":"image/x-pict","the media type of a .gbr file":"application/rpki-ghostbusters","the media type of a .wmlc file":"application/vnd.wap.wmlc","the media type of a .mxs file":"application/vnd.triscape.mxs","the media type of a .x3dbz file":"model/x3d+binary","the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-33cb3bb4","guard":[["has","content"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{".osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml",".qam files":"application/vnd.epson.quickanime",".frame files":"application/vnd.framemaker",".ttc files":"font/collection",".dataless files":"application/vnd.fdsn.seed",".wpd files":"application/vnd.wordperfect",".qxb files":"application/vnd.quark.quarkxpress",".ustar files":"application/x-ustar",".jad files":"text/vnd.sun.j2me.app-descriptor",".xpi files":"application/x-xpinstall",".kml files":"application/vnd.google-earth.kml+xml",".prf files":"application/pics-rules",".hdf files":"application/x-hdf",".evy files":"application/x-envoy",".txf files":"application/vnd.mobius.txf",".cjs files":"application/node",".held files":"application/atsc-held+xml",".less files":"text/less",".u8mdn files":"message/global-disposition-notification",".pas files":"text/x-pascal",".tpl files":"application/vnd.groove-tool-template",".spdx files":"text/spdx",".vtx files":"application/vnd.visio",".dot files":"application/msword",".tsd files":"application/timestamped-data",".fhc files":"image/x-freehand",".vcard files":"text/vcard",".mmf files":"application/vnd.smaf",".spf files":"application/vnd.yamaha.smaf-phrase",".c4p files":"application/vnd.clonk.c4group",".ice files":"x-conference/x-cooltalk",".hdd files":"application/x-virtualbox-hdd",".xls files":"application/vnd.ms-excel"}}},
{"id":"n-cfc6ae2a","guard":[["has","type"]],"pyramid":["render.str",["memory.lookup",["sense.numeral"]]],"mem":{"table":{"es3":"application/vnd.eszigno3+xml","m4u":"video/vnd.mpegurl","3ds":"image/x-3ds","u8mdn":"message/global-disposition-notification","m4b":"audio/mp4","n3":"text/n3","c4p":"application/vnd.clonk.c4group","h261":"video/h261","x3dbz":"model/x3d+binary"}}},
{"id":"n-4184401b","guard":[["hasAny",["item number","less","nth","position","spdx","vcard"]],["has","name"]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-21ea6727","guard":[["hasAny",["delete","remove","strip out","without","xls","xlt"]]],"pyramid":["render.str",["transform.remove",{"lit":"application/vnd.ms-excel"},["sense.lastWord"]]],"mem":null},
{"id":"n-4c4d168e","guard":[["hasAny",["normalise","normalize","simplify the text","xls","xlt"]]],"pyramid":["render.str",["transform.norm",{"lit":"application/vnd.ms-excel"},["sense.howMany"]]],"mem":null},
{"id":"n-4c5fe7e1","guard":[["hasAny",["hdd","ova","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["application/x-virtualbox-",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-98e9929d","guard":[["hasAny",["separate by","split","split by","xls","xlt"]]],"pyramid":["render.and",["transform.split",{"lit":"application/vnd.ms-excel"},["sense.lastWord"]]],"mem":null},
{"id":"n-a091259f","guard":[["hasAny",["separate by","split","split by","xls","xlt"]]],"pyramid":["render.list",["transform.split",{"lit":"application/vnd.ms-excel"},["sense.lastWord"]]],"mem":null},
{"id":"n-c01f0f8b","guard":[["hasAny",["arj","hdf","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["application/x-",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ef289c04","guard":[["hasAny",["separate by","split","split by","xls","xlt"]]],"pyramid":["render.lines",["transform.split",{"lit":"application/vnd.ms-excel"},["sense.lastWord"]]],"mem":null},
{"id":"n-f2c7171c","guard":[["hasAny",["normalise","normalize","p","pas","simplify the text"]],["has","type"]],"pyramid":["render.str",["transform.norm",{"lit":"text/x-pascal"},["sense.howMany"]]],"mem":null},
{"id":"n-4a135557","guard":[["hasAny",["hdf","item number","nth","position","ustar"]]],"pyramid":["render.template",{"lit":["application/x-",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b49ddee5","guard":[["hasAny",["arj","gnumeric","item number","nth","position"]]],"pyramid":["render.template",{"lit":["application/x-",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cfe29b2d","guard":[["hasAny",["gif","item number","jais","nth","position"]]],"pyramid":["render.template",{"lit":["image/",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-037e8d62","guard":[["hasAny",["content","files","name","pas","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .pas files":"text/x-pascal"}}},
{"id":"n-0403c171","guard":[["hasAny",["file","media","spx","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .spx file":"audio/ogg"}}},
{"id":"n-065224a0","guard":[["has","xhtml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension xhtml":"application/xhtml+xml"}}},
{"id":"n-07d7af0c","guard":[["has","mxs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .mxs file":"application/vnd.triscape.mxs"}}},
{"id":"n-0871ccba","guard":[["has","wbxml"]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-0d5d6376","guard":[["hasAny",["file","media","text","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .text file":"text/plain"}}},
{"id":"n-0e672696","guard":[["hasAny",["content","files","name","txf","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .txf files":"application/vnd.mobius.txf"}}},
{"id":"n-0f6e7601","guard":[["has","rq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .rq file":"application/sparql-query"}}},
{"id":"n-0f79c6b3","guard":[["has","ez"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .ez file":"application/andrew-inset"}}},
{"id":"n-0fe88588","guard":[["has","sfv"]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-10e99273","guard":[["hasAny",["amlx","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension amlx":"application/automationml-amlx+zip"}}},
{"id":"n-12a4317f","guard":[["has","amlx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension amlx":"application/automationml-amlx+zip"}}},
{"id":"n-12ab3865","guard":[["hasAny",["dvb","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension dvb":"video/vnd.dvb.file"}}},
{"id":"n-1319daa8","guard":[["hasAny",["au","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension au":"audio/basic"}}},
{"id":"n-1372f090","guard":[["hasAny",["extension","goes","mime","ots","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template"}}},
{"id":"n-145fd880","guard":[["hasAny",["file","media","sbml","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .sbml file":"application/sbml+xml"}}},
{"id":"n-170eed67","guard":[["has","uvg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvg":"image/vnd.dece.graphic"}}},
{"id":"n-1710bc4f","guard":[["has","wmlc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .wmlc file":"application/vnd.wap.wmlc"}}},
{"id":"n-1bffa5ce","guard":[["has","cjs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .cjs files":"application/node"}}},
{"id":"n-1c73813e","guard":[["has","txf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .txf files":"application/vnd.mobius.txf"}}},
{"id":"n-1d76cb46","guard":[["hasAny",["file","media","nsc","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .nsc file":"application/x-conference"}}},
{"id":"n-1f5fb014","guard":[["has","spdx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .spdx files":"text/spdx"}}},
{"id":"n-20421e29","guard":[["has","stpxz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .stpxz file":"model/step-xml+zip"}}},
{"id":"n-20e3f79b","guard":[["hasAny",["file","ipynb","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-2145f6da","guard":[["hasAny",["extension","goes","mime","onetoc","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension onetoc":"application/onenote"}}},
{"id":"n-225ec381","guard":[["has","h261"]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["sense.numeral"]],"mem":null},
{"id":"n-22ecbcbe","guard":[["hasAny",["arj","file","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .arj file":"application/x-arj"}}},
{"id":"n-22fe6d05","guard":[["hasAny",["content","files","name","qam","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .qam files":"application/vnd.epson.quickanime"}}},
{"id":"n-231d3cad","guard":[["has","cdmid"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension cdmid":"application/cdmi-domain"}}},
{"id":"n-23424389","guard":[["hasAny",["content","files","hdd","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .hdd files":"application/x-virtualbox-hdd"}}},
{"id":"n-23b2b999","guard":[["has","wmx"]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-275f5e35","guard":[["hasAny",["es3","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension es3":"application/vnd.eszigno3+xml"}}},
{"id":"n-27f636b9","guard":[["hasAny",["file","media","texi","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .texi file":"application/x-texinfo"}}},
{"id":"n-2eaf6baf","guard":[["has","less"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .less files":"text/less"}}},
{"id":"n-2eb7250f","guard":[["hasAny",["clkt","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template"}}},
{"id":"n-2ff04184","guard":[["has","texi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .texi file":"application/x-texinfo"}}},
{"id":"n-30c8866d","guard":[["has","sieve"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .sieve file":"application/sieve"}}},
{"id":"n-3185cb1c","guard":[["has","mpkg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .mpkg file":"application/vnd.apple.installer+xml"}}},
{"id":"n-31b29f3b","guard":[["has","held"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .held files":"application/atsc-held+xml"}}},
{"id":"n-31cfb4f4","guard":[["has","hdf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .hdf files":"application/x-hdf"}}},
{"id":"n-35a7dc76","guard":[["hasAny",["file","media","type","xlt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .xlt file":"application/vnd.ms-excel"}}},
{"id":"n-36ba5dc1","guard":[["has","dvb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension dvb":"video/vnd.dvb.file"}}},
{"id":"n-377e8eb5","guard":[["has","stw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .stw file":"application/vnd.sun.xml.writer.template"}}},
{"id":"n-38a8ca4b","guard":[["hasAny",["content","files","name","type","xls"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .xls files":"application/vnd.ms-excel"}}},
{"id":"n-3a49061c","guard":[["hasAny",["extension","goes","m4u","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension m4u":"video/vnd.mpegurl"}}},
{"id":"n-3ae93d4e","guard":[["hasAny",["extension","goes","mime","p","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension p":"text/x-pascal"}}},
{"id":"n-3b181ab2","guard":[["hasAny",["content","files","name","type","ustar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .ustar files":"application/x-ustar"}}},
{"id":"n-3b3c836c","guard":[["has","lostxml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension lostxml":"application/lost+xml"}}},
{"id":"n-3b5339fc","guard":[["hasAny",["content","dataless","files","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .dataless files":"application/vnd.fdsn.seed"}}},
{"id":"n-3cb7db1d","guard":[["hasAny",["content","files","jad","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor"}}},
{"id":"n-401c9dde","guard":[["has","xlt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .xlt file":"application/vnd.ms-excel"}}},
{"id":"n-402277e7","guard":[["has","hdd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .hdd files":"application/x-virtualbox-hdd"}}},
{"id":"n-420bf27d","guard":[["hasAny",["extension","goes","mime","type","xhtml"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension xhtml":"application/xhtml+xml"}}},
{"id":"n-451d6564","guard":[["has","qxb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .qxb files":"application/vnd.quark.quarkxpress"}}},
{"id":"n-45a5c87d","guard":[["has","stpnc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension stpnc":"model/step"}}},
{"id":"n-45e12871","guard":[["has","onetoc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension onetoc":"application/onenote"}}},
{"id":"n-461ec796","guard":[["hasAny",["file","fvt","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .fvt file":"video/vnd.fvt"}}},
{"id":"n-4a39750f","guard":[["hasAny",["extension","goes","mime","type","uvv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvv":"video/vnd.dece.video"}}},
{"id":"n-4a6fcc7a","guard":[["hasAny",["file","gbr","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gbr file":"application/rpki-ghostbusters"}}},
{"id":"n-4e3956a5","guard":[["hasAny",["content","files","name","osfpvg","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml"}}},
{"id":"n-4f0ef214","guard":[["hasAny",["content","evy","files","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .evy files":"application/x-envoy"}}},
{"id":"n-51b4c7c5","guard":[["has","n3"]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-51f5e556","guard":[["has","mvt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .mvt file":"application/vnd.mapbox-vector-tile"}}},
{"id":"n-527a2fe3","guard":[["hasAny",["content","files","kml","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .kml files":"application/vnd.google-earth.kml+xml"}}},
{"id":"n-5336125c","guard":[["hasAny",["extension","glb","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension glb":"model/gltf-binary"}}},
{"id":"n-53bf61f5","guard":[["hasAny",["file","media","rusd","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .rusd file":"application/route-usd+xml"}}},
{"id":"n-5610207a","guard":[["has","xls"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .xls files":"application/vnd.ms-excel"}}},
{"id":"n-564d7d16","guard":[["hasAny",["extension","goes","mime","type","uvg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvg":"image/vnd.dece.graphic"}}},
{"id":"n-56faa8f3","guard":[["has","au"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension au":"audio/basic"}}},
{"id":"n-5c3dd275","guard":[["hasAny",["extension","goes","m4b","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension m4b":"audio/mp4"}}},
{"id":"n-5d869711","guard":[["has","jad"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .jad files":"text/vnd.sun.j2me.app-descriptor"}}},
{"id":"n-5e22ead0","guard":[["hasAny",["content","files","name","spdx","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .spdx files":"text/spdx"}}},
{"id":"n-5ee3ce54","guard":[["hasAny",["file","media","stpxz","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .stpxz file":"model/step-xml+zip"}}},
{"id":"n-5f1edcbf","guard":[["has","amlx"],["has","mime"]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["sense.lastWord"]],"mem":null},
{"id":"n-5f2bd9da","guard":[["has","ipynb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .ipynb file":"application/x-ipynb+json"}}},
{"id":"n-5faddbfa","guard":[["hasAny",["file","media","type","umj"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .umj file":"application/vnd.umajin"}}},
{"id":"n-60a8cc1b","guard":[["hasAny",["content","files","name","type","vcard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .vcard files":"text/vcard"}}},
{"id":"n-60ab94e2","guard":[["has","uvv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension uvv":"video/vnd.dece.video"}}},
{"id":"n-618fa1b1","guard":[["hasAny",["file","gnumeric","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gnumeric file":"application/x-gnumeric"}}},
{"id":"n-61936c8e","guard":[["hasAny",["extension","goes","mime","type","vec"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension vec":"application/vec+xml"}}},
{"id":"n-62cf95b2","guard":[["has","sdc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension sdc":"application/vnd.stardivision.calc"}}},
{"id":"n-656ad0f0","guard":[["hasAny",["content","dot","files","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .dot files":"application/msword"}}},
{"id":"n-659428af","guard":[["has","ppt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ppt":"application/vnd.ms-powerpoint"}}},
{"id":"n-6643d779","guard":[["has","webmanifest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .webmanifest file":"application/manifest+json"}}},
{"id":"n-67b39780","guard":[["hasAny",["file","media","sieve","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .sieve file":"application/sieve"}}},
{"id":"n-6939b78c","guard":[["hasAny",["extension","goes","mime","spl","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension spl":"application/x-futuresplash"}}},
{"id":"n-6a92ce2f","guard":[["hasAny",["file","media","type","yaml"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .yaml file":"text/yaml"}}},
{"id":"n-6dcf2208","guard":[["has","vcard"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .vcard files":"text/vcard"}}},
{"id":"n-6ed89bfd","guard":[["hasAny",["content","files","name","ttc","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .ttc files":"font/collection"}}},
{"id":"n-6f56d1a4","guard":[["hasAny",["content","files","name","type","xpi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .xpi files":"application/x-xpinstall"}}},
{"id":"n-6f7c52ac","guard":[["hasAny",["file","gif","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .gif file":"image/gif"}}},
{"id":"n-6fb6da14","guard":[["hasAny",["content","files","name","qxb","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .qxb files":"application/vnd.quark.quarkxpress"}}},
{"id":"n-70bdd6a5","guard":[["has","wbxml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension wbxml":"application/vnd.wap.wbxml"}}},
{"id":"n-7279c8df","guard":[["has","tsd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .tsd files":"application/timestamped-data"}}},
{"id":"n-73521c2c","guard":[["hasAny",["file","media","mpkg","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .mpkg file":"application/vnd.apple.installer+xml"}}},
{"id":"n-74d89842","guard":[["has","prf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .prf files":"application/pics-rules"}}},
{"id":"n-76242b99","guard":[["has","rdz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .rdz file":"application/vnd.data-vision.rdz"}}},
{"id":"n-7c227af3","guard":[["has","pas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .pas files":"text/x-pascal"}}},
{"id":"n-7d24cdb9","guard":[["hasAny",["file","media","oth","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .oth file":"application/vnd.oasis.opendocument.text-web"}}},
{"id":"n-7ed34778","guard":[["has","h261"]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-83ec20c3","guard":[["has","clkt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension clkt":"application/vnd.crick.clicker.template"}}},
{"id":"n-8410e7e1","guard":[["hasAny",["extension","goes","lostxml","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension lostxml":"application/lost+xml"}}},
{"id":"n-86b6dd67","guard":[["has","ova"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .ova file":"application/x-virtualbox-ova"}}},
{"id":"n-88f235ff","guard":[["has","kml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .kml files":"application/vnd.google-earth.kml+xml"}}},
{"id":"n-89bfc87c","guard":[["hasAny",["content","files","name","type","wpd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .wpd files":"application/vnd.wordperfect"}}},
{"id":"n-8f418e89","guard":[["has","edx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .edx file":"application/vnd.novadigm.edx"}}},
{"id":"n-8fb2c7f2","guard":[["has","text"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .text file":"text/plain"}}},
{"id":"n-903a39d0","guard":[["hasAny",["content","fhc","files","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .fhc files":"image/x-freehand"}}},
{"id":"n-92ed7c9b","guard":[["has","nsc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .nsc file":"application/x-conference"}}},
{"id":"n-93973c6c","guard":[["has","exr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension exr":"image/aces"}}},
{"id":"n-96ed8d5d","guard":[["hasAny",["content","files","frame","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .frame files":"application/vnd.framemaker"}}},
{"id":"n-97421e44","guard":[["has","spf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .spf files":"application/vnd.yamaha.smaf-phrase"}}},
{"id":"n-98415901","guard":[["has","sbml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .sbml file":"application/sbml+xml"}}},
{"id":"n-98523198","guard":[["has","umj"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .umj file":"application/vnd.umajin"}}},
{"id":"n-98e4b47b","guard":[["has","p"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension p":"text/x-pascal"}}},
{"id":"n-993ec2e3","guard":[["has","gxf"]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-99a9f253","guard":[["hasAny",["file","h","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .h file":"text/x-c"}}},
{"id":"n-9a00d0ca","guard":[["has","spl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension spl":"application/x-futuresplash"}}},
{"id":"n-9ab11bed","guard":[["hasAny",["extension","goes","gxf","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension gxf":"application/gxf"}}},
{"id":"n-9c0eadaa","guard":[["has","spx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .spx file":"audio/ogg"}}},
{"id":"n-9e4dd8de","guard":[["hasAny",["extension","goes","mime","type","wbxml"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension wbxml":"application/vnd.wap.wbxml"}}},
{"id":"n-9e7f77d4","guard":[["has","xpi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .xpi files":"application/x-xpinstall"}}},
{"id":"n-9e8e27c5","guard":[["hasAny",["file","media","type","webmanifest"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .webmanifest file":"application/manifest+json"}}},
{"id":"n-a1069472","guard":[["has","gnumeric"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .gnumeric file":"application/x-gnumeric"}}},
{"id":"n-a1b0d566","guard":[["hasAny",["c4p","content","files","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .c4p files":"application/vnd.clonk.c4group"}}},
{"id":"n-a22d87db","guard":[["hasAny",["cdmid","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension cdmid":"application/cdmi-domain"}}},
{"id":"n-a256b92a","guard":[["has","ots"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ots":"application/vnd.oasis.opendocument.spreadsheet-template"}}},
{"id":"n-a270adb8","guard":[["hasAny",["extension","goes","mime","rsheet","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension rsheet":"application/urc-ressheet+xml"}}},
{"id":"n-a4e26910","guard":[["has","dot"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .dot files":"application/msword"}}},
{"id":"n-a7187ba2","guard":[["hasAny",["content","files","ice","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .ice files":"x-conference/x-cooltalk"}}},
{"id":"n-a79ddb33","guard":[["has","gph"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension gph":"application/vnd.flographit"}}},
{"id":"n-a7d02d14","guard":[["hasAny",["content","files","hdf","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .hdf files":"application/x-hdf"}}},
{"id":"n-a87d2c4d","guard":[["hasAny",["file","media","type","wmlc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .wmlc file":"application/vnd.wap.wmlc"}}},
{"id":"n-a88c1206","guard":[["hasAny",["extension","goes","mime","oas","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension oas":"application/vnd.fujitsu.oasys"}}},
{"id":"n-a91d86ad","guard":[["has","gbr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .gbr file":"application/rpki-ghostbusters"}}},
{"id":"n-ac64e837","guard":[["hasAny",["file","media","mvt","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .mvt file":"application/vnd.mapbox-vector-tile"}}},
{"id":"n-ac7dfb27","guard":[["hasAny",["exr","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension exr":"image/aces"}}},
{"id":"n-ad6eeb12","guard":[["has","oth"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .oth file":"application/vnd.oasis.opendocument.text-web"}}},
{"id":"n-ae1dfa80","guard":[["hasAny",["extension","goes","mime","stpnc","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension stpnc":"model/step"}}},
{"id":"n-af4f3169","guard":[["hasAny",["content","files","mmf","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .mmf files":"application/vnd.smaf"}}},
{"id":"n-b1d34340","guard":[["hasAny",["file","media","rdz","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .rdz file":"application/vnd.data-vision.rdz"}}},
{"id":"n-b2298daa","guard":[["has","gxf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension gxf":"application/gxf"}}},
{"id":"n-b29a8e8b","guard":[["has","fvt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .fvt file":"video/vnd.fvt"}}},
{"id":"n-b2ff77ce","guard":[["has","qam"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .qam files":"application/vnd.epson.quickanime"}}},
{"id":"n-b35bd1bd","guard":[["hasAny",["extension","goes","gph","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension gph":"application/vnd.flographit"}}},
{"id":"n-b3aec8b6","guard":[["has","xo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .xo file":"application/vnd.olpc-sugar"}}},
{"id":"n-b6e595bb","guard":[["hasAny",["file","media","mxs","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .mxs file":"application/vnd.triscape.mxs"}}},
{"id":"n-b85d241a","guard":[["hasAny",["content","files","name","spf","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .spf files":"application/vnd.yamaha.smaf-phrase"}}},
{"id":"n-ba014465","guard":[["has","rusd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .rusd file":"application/route-usd+xml"}}},
{"id":"n-bb0eccc4","guard":[["hasAny",["content","files","held","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .held files":"application/atsc-held+xml"}}},
{"id":"n-bbbebcdd","guard":[["hasAny",["extension","goes","mime","n3","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension n3":"text/n3"}}},
{"id":"n-bc265843","guard":[["hasAny",["3ds","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension 3ds":"image/x-3ds"}}},
{"id":"n-bcffc5de","guard":[["has","ustar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .ustar files":"application/x-ustar"}}},
{"id":"n-bdcb4995","guard":[["hasAny",["cjs","content","files","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .cjs files":"application/node"}}},
{"id":"n-c026c818","guard":[["has","ttc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .ttc files":"font/collection"}}},
{"id":"n-c134742d","guard":[["hasAny",["content","files","name","tpl","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .tpl files":"application/vnd.groove-tool-template"}}},
{"id":"n-c2975e89","guard":[["has","glb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension glb":"model/gltf-binary"}}},
{"id":"n-c57f585d","guard":[["has","arj"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .arj file":"application/x-arj"}}},
{"id":"n-c703f0c1","guard":[["hasAny",["extension","goes","mime","sdc","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension sdc":"application/vnd.stardivision.calc"}}},
{"id":"n-c7bd0eb6","guard":[["has","h"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .h file":"text/x-c"}}},
{"id":"n-c7e7b8ee","guard":[["hasAny",["ez","file","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .ez file":"application/andrew-inset"}}},
{"id":"n-ca5fb4f5","guard":[["has","fhc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .fhc files":"image/x-freehand"}}},
{"id":"n-cbd01443","guard":[["has","vtx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .vtx files":"application/vnd.visio"}}},
{"id":"n-cd66c579","guard":[["hasAny",["file","jais","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .jais file":"image/jais"}}},
{"id":"n-cd9da7d3","guard":[["hasAny",["extension","goes","mime","type","wmx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension wmx":"video/x-ms-wmx"}}},
{"id":"n-cff9969e","guard":[["hasAny",["file","media","ova","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .ova file":"application/x-virtualbox-ova"}}},
{"id":"n-d06463e9","guard":[["has","dataless"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .dataless files":"application/vnd.fdsn.seed"}}},
{"id":"n-d0a66833","guard":[["has","evy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .evy files":"application/x-envoy"}}},
{"id":"n-d156b108","guard":[["has","frame"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .frame files":"application/vnd.framemaker"}}},
{"id":"n-d429f3af","guard":[["has","oas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension oas":"application/vnd.fujitsu.oasys"}}},
{"id":"n-d586533f","guard":[["hasAny",["file","media","type","x3dbz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .x3dbz file":"model/x3d+binary"}}},
{"id":"n-d7380e70","guard":[["hasAny",["content","files","name","type","u8mdn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .u8mdn files":"message/global-disposition-notification"}}},
{"id":"n-dd581f24","guard":[["hasAny",["file","media","type","xo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .xo file":"application/vnd.olpc-sugar"}}},
{"id":"n-ddbdf2eb","guard":[["hasAny",["content","files","name","tsd","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .tsd files":"application/timestamped-data"}}},
{"id":"n-de983cc6","guard":[["hasAny",["edx","file","media","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .edx file":"application/vnd.novadigm.edx"}}},
{"id":"n-def463ac","guard":[["hasAny",["extension","goes","h261","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension h261":"video/h261"}}},
{"id":"n-df43e3d9","guard":[["hasAny",["file","media","pic","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .pic file":"image/x-pict"}}},
{"id":"n-dfac0fab","guard":[["has","osfpvg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .osfpvg files":"application/vnd.yamaha.openscoreformat.osfpvg+xml"}}},
{"id":"n-e25658a0","guard":[["has","wpd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .wpd files":"application/vnd.wordperfect"}}},
{"id":"n-e291f272","guard":[["has","vec"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension vec":"application/vec+xml"}}},
{"id":"n-e32b6fea","guard":[["has","rsheet"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension rsheet":"application/urc-ressheet+xml"}}},
{"id":"n-e49dc9dd","guard":[["has","sfv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension sfv":"text/x-sfv"}}},
{"id":"n-e4c36255","guard":[["hasAny",["extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension me":"text/troff"}}},
{"id":"n-e4f3d425","guard":[["has","ice"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .ice files":"x-conference/x-cooltalk"}}},
{"id":"n-e50bb19b","guard":[["has","gif"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .gif file":"image/gif"}}},
{"id":"n-e6be0c4d","guard":[["has","wmx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension wmx":"video/x-ms-wmx"}}},
{"id":"n-e7d8fe06","guard":[["hasAny",["extension","goes","mime","ppt","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension ppt":"application/vnd.ms-powerpoint"}}},
{"id":"n-e8b61140","guard":[["has","tpl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .tpl files":"application/vnd.groove-tool-template"}}},
{"id":"n-ea32881d","guard":[["hasAny",["content","files","name","type","vtx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .vtx files":"application/vnd.visio"}}},
{"id":"n-ee26f637","guard":[["hasAny",["file","media","stw","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .stw file":"application/vnd.sun.xml.writer.template"}}},
{"id":"n-ef0f3da8","guard":[["has","mmf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the content type for .mmf files":"application/vnd.smaf"}}},
{"id":"n-f0113a82","guard":[["has","yaml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .yaml file":"text/yaml"}}},
{"id":"n-f46f1169","guard":[["has","jais"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .jais file":"image/jais"}}},
{"id":"n-f4c05e04","guard":[["hasAny",["file","media","rq","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the media type of a .rq file":"application/sparql-query"}}},
{"id":"n-f5cfd8c5","guard":[["hasAny",["content","files","name","prf","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .prf files":"application/pics-rules"}}},
{"id":"n-f7156337","guard":[["has","pic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the media type of a .pic file":"image/x-pict"}}},
{"id":"n-f74772fb","guard":[["has","3ds"]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-f777b4b5","guard":[["hasAny",["content","files","less","name","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the content type for .less files":"text/less"}}},
{"id":"n-fa01e600","guard":[["hasAny",["extension","goes","mime","sfv","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which MIME type goes with the extension sfv":"text/x-sfv"}}},
{"id":"n-012423d4","guard":[["hasAny",["invert case","sfv","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-05abd1d4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","wbxml"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0a5b3a0a","guard":[["hasAny",["shortest","shortest one","shortest word","txf"]]],"pyramid":["render.template",{"lit":["application/vnd.mobius.",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0ee249b0","guard":[["hasAny",["3ds","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0fc65410","guard":[["hasAny",["3ds","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-2b3067cb","guard":[["hasAny",["no vowels","remove vowels","wbxml","without vowels"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-3215a031","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sfv","title case"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5250d214","guard":[["hasAny",["h261","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-574f255d","guard":[["hasAny",["rdz","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["application/vnd.data-vision.",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5fc6a8ac","guard":[["hasAny",["shortest","shortest one","shortest word","vec"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6ac344c0","guard":[["hasAny",["3ds","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6f8f2029","guard":[["hasAny",["delete","pas","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"text/x-pascal"},["sense.lastWord"]]],"mem":null},
{"id":"n-71dc033c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","n3","title case"]]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-74a90a9c","guard":[["hasAny",["no vowels","remove vowels","without vowels","wmx"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-78008908","guard":[["hasAny",["gxf","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7a48c3e8","guard":[["hasAny",["edx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["application/vnd.novadigm.",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-844751a7","guard":[["hasAny",["mxs","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["application/vnd.triscape.",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-91ec2c27","guard":[["hasAny",["pas","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"text/x-pascal"},["sense.lastWord"]]],"mem":null},
{"id":"n-93d9561a","guard":[["hasAny",["3ds","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-95dfafac","guard":[["hasAny",["gif","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["image/",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-96b01774","guard":[["hasAny",["amlx","capitalise","capitalize","capitalize each word","title case"]],["has","mime"]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9c9f8381","guard":[["hasAny",["no vowels","remove vowels","sfv","without vowels"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-a20ca946","guard":[["hasAny",["pas","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"text/x-pascal"},["sense.lastWord"]]],"mem":null},
{"id":"n-a4ba0f8a","guard":[["hasAny",["gxf","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a5e01b52","guard":[["hasAny",["no vowels","remove vowels","without vowels","xhtml"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-ad2217e9","guard":[["hasAny",["gxf","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-b706551b","guard":[["hasAny",["invert case","swap case","toggle case","wbxml"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b86436a1","guard":[["hasAny",["invert case","n3","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bdaa339b","guard":[["hasAny",["sfv","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bdb45451","guard":[["hasAny",["invert case","swap case","toggle case","wmx"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-befba250","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","wmx"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c634d367","guard":[["hasAny",["shortest","shortest one","shortest word","wmx"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d183e0c8","guard":[["hasAny",["pas","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"text/x-pascal"},["sense.lastWord"]]],"mem":null},
{"id":"n-d28f8fd2","guard":[["hasAny",["kml","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["application/vnd.google-earth.",{"slot":0},"+xml"]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d33683d5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","h261","title case"]]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d66a55ed","guard":[["hasAny",["amlx","invert case","swap case","toggle case"]],["has","mime"]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-df02eec1","guard":[["hasAny",["fvt","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ed0cd0a4","guard":[["hasAny",["n3","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-ee3466c4","guard":[["hasAny",["h261","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f777f3a1","guard":[["hasAny",["dvb","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0},".file"]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f79599fa","guard":[["hasAny",["n3","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fb5f9444","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gxf","title case"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0083248c","guard":[["hasAny",["each word","split into words","wmx"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-06d15ec3","guard":[["hasAny",["edx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["application/vnd.novadigm.",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-16aa106a","guard":[["hasAny",["h261","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-1a597406","guard":[["hasAny",["item number","n3","nth","position"]]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-234a0326","guard":[["hasAny",["normalise","normalize","sfv","simplify the text"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-284a36d2","guard":[["hasAny",["dvb","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0},".file"]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2a0ba239","guard":[["hasAny",["gxf","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-3169145d","guard":[["hasAny",["item number","nth","position","sbml"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0},"+xml"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-37107860","guard":[["hasAny",["amlx","each word","split into words"]],["has","mime"]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-386d3aae","guard":[["hasAny",["each word","n3","split into words"]]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-416f3f7a","guard":[["hasAny",["item number","nth","position","sieve"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4b62a195","guard":[["hasAny",["each word","sfv","split into words"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4f2eb8ff","guard":[["hasAny",["each word","split into words","wmx"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4fd56b94","guard":[["hasAny",["amlx","each word","split into words"]],["has","mime"]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-502c291b","guard":[["hasAny",["item number","nth","position","yaml"]]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-523431f9","guard":[["hasAny",["n3","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5ac9256c","guard":[["hasAny",["ipynb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["application/x-",{"slot":0},"+json"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5c2c95b6","guard":[["hasAny",["3ds","each word","split into words"]]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-68f63597","guard":[["hasAny",["item number","nth","position","sfv"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-7a1c1725","guard":[["hasAny",["each word","n3","split into words"]]],"pyramid":["render.template",{"lit":["text/",{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-86647583","guard":[["hasAny",["dvb","item number","nth","position"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0},".file"]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-90f19f9c","guard":[["hasAny",["amlx","item number","nth","position"]],["has","mime"]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-91417e83","guard":[["hasAny",["item number","kml","nth","position"]]],"pyramid":["render.template",{"lit":["application/vnd.google-earth.",{"slot":0},"+xml"]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-95056fda","guard":[["hasAny",["item number","nth","position","wmlc"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-967296a6","guard":[["hasAny",["each word","gxf","split into words"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-97d43d20","guard":[["hasAny",["3ds","each word","split into words"]]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-988b2133","guard":[["hasAny",["each word","split into words","wbxml"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9e4ed6d7","guard":[["hasAny",["dvb","each word","split into words"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0},".file"]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a25aad58","guard":[["hasAny",["dvb","each word","split into words"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0},".file"]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a379be90","guard":[["hasAny",["gxf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-a48b9a2d","guard":[["hasAny",["item number","nth","position","txf"]]],"pyramid":["render.template",{"lit":["application/vnd.mobius.",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a6d22933","guard":[["hasAny",["item number","nth","position","rdz"]]],"pyramid":["render.template",{"lit":["application/vnd.data-vision.",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-aa0c5d7d","guard":[["hasAny",["fvt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["video/vnd.",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-aa279786","guard":[["hasAny",["each word","h261","split into words"]]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b1c79f56","guard":[["hasAny",["item number","nth","ova","position"]]],"pyramid":["render.template",{"lit":["application/x-virtualbox-",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b4002c6f","guard":[["hasAny",["each word","sfv","split into words"]]],"pyramid":["render.template",{"lit":["text/x-",{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ccde5dd1","guard":[["hasAny",["each word","gxf","split into words"]]],"pyramid":["render.template",{"lit":["application/",{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ce213c09","guard":[["hasAny",["normalise","normalize","simplify the text","wmx"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d3c0801f","guard":[["hasAny",["normalise","normalize","simplify the text","wbxml"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d523dda7","guard":[["hasAny",["h261","item number","nth","position"]]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d6dd312d","guard":[["hasAny",["each word","split into words","wbxml"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d9217449","guard":[["hasAny",["item number","nth","position","text"]]],"pyramid":["render.template",{"lit":[{"slot":0},"/plain"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-db3ef7ba","guard":[["hasAny",["each word","h261","split into words"]]],"pyramid":["render.template",{"lit":["video/",{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dc0e73b6","guard":[["hasAny",["amlx","normalise","normalize","simplify the text"]],["has","mime"]],"pyramid":["render.template",{"lit":["application/automationml-",{"slot":0},"+zip"]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-de477487","guard":[["hasAny",["item number","nth","position","wbxml"]]],"pyramid":["render.template",{"lit":["application/vnd.wap.",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e53ba0ad","guard":[["hasAny",["item number","nth","position","wmx"]]],"pyramid":["render.template",{"lit":["video/x-ms-",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e5e9f875","guard":[["hasAny",["3ds","item number","nth","position"]]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-ebc7309d","guard":[["hasAny",["hdd","item number","nth","position"]]],"pyramid":["render.template",{"lit":["application/x-virtualbox-",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ec3186f8","guard":[["hasAny",["3ds","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["image/x-",{"slot":0}]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-f44b75db","guard":[["hasAny",["item number","mxs","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["application/vnd.triscape.",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the content type for .osfpvg files","expect":{"equals":"application/vnd.yamaha.openscoreformat.osfpvg+xml","notRefusal":true}},{"q":"which MIME type goes with the extension xhtml","expect":{"equals":"application/xhtml+xml","notRefusal":true}},{"q":"what is the media type of a .gnumeric file","expect":{"equals":"application/x-gnumeric","notRefusal":true}},{"q":"which MIME type goes with the extension me","expect":{"equals":"text/troff","notRefusal":true}},{"q":"what is the media type of a .xlt file","expect":{"equals":"application/vnd.ms-excel","notRefusal":true}},{"q":"what is the media type of a .ez file","expect":{"equals":"application/andrew-inset","notRefusal":true}},{"q":"which MIME type goes with the extension gxf","expect":{"equals":"application/gxf","notRefusal":true}},{"q":"name the content type for .qam files","expect":{"equals":"application/vnd.epson.quickanime","notRefusal":true}},{"q":"what is the media type of a .oth file","expect":{"equals":"application/vnd.oasis.opendocument.text-web","notRefusal":true}},{"q":"what is the media type of a .texi file","expect":{"equals":"application/x-texinfo","notRefusal":true}},{"q":"name the content type for .frame files","expect":{"equals":"application/vnd.framemaker","notRefusal":true}},{"q":"name the content type for .ttc files","expect":{"equals":"font/collection","notRefusal":true}},{"q":"name the content type for .dataless files","expect":{"equals":"application/vnd.fdsn.seed","notRefusal":true}},{"q":"name the content type for .wpd files","expect":{"equals":"application/vnd.wordperfect","notRefusal":true}},{"q":"name the content type for .qxb files","expect":{"equals":"application/vnd.quark.quarkxpress","notRefusal":true}},{"q":"what is the media type of a .webmanifest file","expect":{"equals":"application/manifest+json","notRefusal":true}},{"q":"which MIME type goes with the extension es3","expect":{"equals":"application/vnd.eszigno3+xml","notRefusal":true}},{"q":"which MIME type goes with the extension glb","expect":{"equals":"model/gltf-binary","notRefusal":true}},{"q":"name the content type for .ustar files","expect":{"equals":"application/x-ustar","notRefusal":true}},{"q":"name the content type for .jad files","expect":{"equals":"text/vnd.sun.j2me.app-descriptor","notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
