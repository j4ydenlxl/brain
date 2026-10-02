// country-area-compare-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"country-area-compare-neo-g6","class":"country-area-compare","generation":6,"lane":"neo","grownFrom":["compare the surface area of Yemen and Saint Helena","compare the surface area of Portugal and Faroe Islands","Aruba versus Armenia: compare their surface area","Peru versus Yemen: compare their surface area","compare the surface area of Vietnam and Finland","how does the surface area of Bahrain compare with that of Iraq","compare the surface area of Antarctica and Jamaica","compare the surface area of Nigeria and Rwanda","Cayman Islands versus Algeria: compare their surface area","Iraq versus Romania: compare their surface area","how does the surface area of Canada compare with that of French Polynesia","compare the surface area of Tonga and Angola","how does the surface area of Rwanda compare with that of Saint Kitts and Nevis","Wallis and Futuna versus Afghanistan: compare their surface area","compare the surface area of Tunisia and Mayotte","how does the surface area of Kazakhstan compare with that of Iceland","French Guiana versus United States: compare their surface area","how does the surface area of Saint Helena compare with that of Wallis and Futuna","compare the surface area of Mauritania and Nepal","France versus Ukraine: compare their surface area"],"version":1});

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
{"id":"n-27aff66b","guard":[["has","area"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Yemen and Saint Helena":"The surface area of Yemen is 527968 and that of Saint Helena is 314, so Yemen has the larger surface area.","compare the surface area of Portugal and Faroe Islands":"The surface area of Portugal is 91982 and that of Faroe Islands is 1399, so Portugal has the larger surface area.","Aruba versus Armenia: compare their surface area":"The surface area of Aruba is 193 and that of Armenia is 29800, so Armenia has the larger surface area.","Peru versus Yemen: compare their surface area":"The surface area of Peru is 1285216 and that of Yemen is 527968, so Peru has the larger surface area.","compare the surface area of Vietnam and Finland":"The surface area of Vietnam is 331689 and that of Finland is 338145, so Finland has the larger surface area.","how does the surface area of Bahrain compare with that of Iraq":"The surface area of Bahrain is 694 and that of Iraq is 438317, so Iraq has the larger surface area.","compare the surface area of Antarctica and Jamaica":"The surface area of Antarctica is 13120000 and that of Jamaica is 10990, so Antarctica has the larger surface area.","compare the surface area of Nigeria and Rwanda":"The surface area of Nigeria is 923768 and that of Rwanda is 26338, so Nigeria has the larger surface area.","Cayman Islands versus Algeria: compare their surface area":"The surface area of Cayman Islands is 264 and that of Algeria is 2381741, so Algeria has the larger surface area.","Iraq versus Romania: compare their surface area":"The surface area of Iraq is 438317 and that of Romania is 238391, so Iraq has the larger surface area.","how does the surface area of Canada compare with that of French Polynesia":"The surface area of Canada is 9970610 and that of French Polynesia is 4000, so Canada has the larger surface area.","compare the surface area of Tonga and Angola":"The surface area of Tonga is 650 and that of Angola is 1246700, so Angola has the larger surface area.","how does the surface area of Rwanda compare with that of Saint Kitts and Nevis":"The surface area of Rwanda is 26338 and that of Saint Kitts and Nevis is 261, so Rwanda has the larger surface area.","Wallis and Futuna versus Afghanistan: compare their surface area":"The surface area of Wallis and Futuna is 200 and that of Afghanistan is 652090, so Afghanistan has the larger surface area.","compare the surface area of Tunisia and Mayotte":"The surface area of Tunisia is 163610 and that of Mayotte is 373, so Tunisia has the larger surface area.","how does the surface area of Kazakhstan compare with that of Iceland":"The surface area of Kazakhstan is 2724900 and that of Iceland is 103000, so Kazakhstan has the larger surface area.","French Guiana versus United States: compare their surface area":"The surface area of French Guiana is 90000 and that of United States is 9363520, so United States has the larger surface area.","how does the surface area of Saint Helena compare with that of Wallis and Futuna":"The surface area of Saint Helena is 314 and that of Wallis and Futuna is 200, so Saint Helena has the larger surface area.","compare the surface area of Mauritania and Nepal":"The surface area of Mauritania is 1025520 and that of Nepal is 147181, so Mauritania has the larger surface area.","France versus Ukraine: compare their surface area":"The surface area of France is 551500 and that of Ukraine is 603700, so Ukraine has the larger surface area.","compare the surface area of Armenia and Norway":"The surface area of Armenia is 29800 and that of Norway is 323877, so Norway has the larger surface area.","New Zealand versus Nigeria: compare their surface area":"The surface area of New Zealand is 270534 and that of Nigeria is 923768, so Nigeria has the larger surface area.","Czech Republic versus Reunion: compare their surface area":"The surface area of Czech Republic is 78866 and that of Reunion is 2510, so Czech Republic has the larger surface area.","how does the surface area of Kenya compare with that of Togo":"The surface area of Kenya is 580367 and that of Togo is 56785, so Kenya has the larger surface area.","Pitcairn versus Niue: compare their surface area":"The surface area of Pitcairn is 49 and that of Niue is 260, so Niue has the larger surface area.","how does the surface area of Puerto Rico compare with that of Egypt":"The surface area of Puerto Rico is 8875 and that of Egypt is 1001449, so Egypt has the larger surface area.","compare the surface area of Bulgaria and Western Sahara":"The surface area of Bulgaria is 110994 and that of Western Sahara is 266000, so Western Sahara has the larger surface area.","how does the surface area of Finland compare with that of Malaysia":"The surface area of Finland is 338145 and that of Malaysia is 329758, so Finland has the larger surface area.","how does the surface area of Cambodia compare with that of El Salvador":"The surface area of Cambodia is 181035 and that of El Salvador is 21041, so Cambodia has the larger surface area.","compare the surface area of Paraguay and Bermuda":"The surface area of Paraguay is 406752 and that of Bermuda is 53, so Paraguay has the larger surface area.","North Macedonia versus Bulgaria: compare their surface area":"The surface area of North Macedonia is 25713 and that of Bulgaria is 110994, so Bulgaria has the larger surface area.","El Salvador versus Guadeloupe: compare their surface area":"The surface area of El Salvador is 21041 and that of Guadeloupe is 1705, so El Salvador has the larger surface area.","how does the surface area of Angola compare with that of Gibraltar":"The surface area of Angola is 1246700 and that of Gibraltar is 6, so Angola has the larger surface area.","how does the surface area of Ivory Coast compare with that of Guatemala":"The surface area of Ivory Coast is 322463 and that of Guatemala is 108889, so Ivory Coast has the larger surface area.","how does the surface area of Congo compare with that of Australia":"The surface area of Congo is 342000 and that of Australia is 7741220, so Australia has the larger surface area.","how does the surface area of Western Sahara compare with that of French Guiana":"The surface area of Western Sahara is 266000 and that of French Guiana is 90000, so Western Sahara has the larger surface area.","Togo versus Zambia: compare their surface area":"The surface area of Togo is 56785 and that of Zambia is 752618, so Zambia has the larger surface area.","how does the surface area of Cuba compare with that of Lithuania":"The surface area of Cuba is 110861 and that of Lithuania is 65301, so Cuba has the larger surface area.","how does the surface area of Germany compare with that of United States Minor Outlying Islands":"The surface area of Germany is 357022 and that of United States Minor Outlying Islands is 16, so Germany has the larger surface area.","compare the surface area of Zambia and Cuba":"The surface area of Zambia is 752618 and that of Cuba is 110861, so Zambia has the larger surface area.","Egypt versus Vietnam: compare their surface area":"The surface area of Egypt is 1001449 and that of Vietnam is 331689, so Egypt has the larger surface area.","compare the surface area of United States and French Southern territories":"The surface area of United States is 9363520 and that of French Southern territories is 7780, so United States has the larger surface area.","Guatemala versus Uzbekistan: compare their surface area":"The surface area of Guatemala is 108889 and that of Uzbekistan is 447400, so Uzbekistan has the larger surface area.","compare the surface area of Afghanistan and Gambia":"The surface area of Afghanistan is 652090 and that of Gambia is 11295, so Afghanistan has the larger surface area.","Italy versus Paraguay: compare their surface area":"The surface area of Italy is 301316 and that of Paraguay is 406752, so Paraguay has the larger surface area.","how does the surface area of Switzerland compare with that of British Virgin Islands":"The surface area of Switzerland is 41284 and that of British Virgin Islands is 151, so Switzerland has the larger surface area.","Azerbaijan versus Portugal: compare their surface area":"The surface area of Azerbaijan is 86600 and that of Portugal is 91982, so Portugal has the larger surface area.","how does the surface area of Colombia compare with that of Aruba":"The surface area of Colombia is 1138914 and that of Aruba is 193, so Colombia has the larger surface area.","compare the surface area of Sao Tome and Principe and Lebanon":"The surface area of Sao Tome and Principe is 964 and that of Lebanon is 10400, so Lebanon has the larger surface area.","compare the surface area of Reunion and Bahrain":"The surface area of Reunion is 2510 and that of Bahrain is 694, so Reunion has the larger surface area.","Lithuania versus Dominica: compare their surface area":"The surface area of Lithuania is 65301 and that of Dominica is 751, so Lithuania has the larger surface area.","compare the surface area of Guadeloupe and Switzerland":"The surface area of Guadeloupe is 1705 and that of Switzerland is 41284, so Switzerland has the larger surface area.","how does the surface area of Jamaica compare with that of Chad":"The surface area of Jamaica is 10990 and that of Chad is 1284000, so Chad has the larger surface area.","how does the surface area of Faroe Islands compare with that of Peru":"The surface area of Faroe Islands is 1399 and that of Peru is 1285216, so Peru has the larger surface area.","how does the surface area of Ghana compare with that of Italy":"The surface area of Ghana is 238533 and that of Italy is 301316, so Italy has the larger surface area.","how does the surface area of Kiribati compare with that of Zimbabwe":"The surface area of Kiribati is 726 and that of Zimbabwe is 390757, so Zimbabwe has the larger surface area.","compare the surface area of Uzbekistan and Kenya":"The surface area of Uzbekistan is 447400 and that of Kenya is 580367, so Kenya has the larger surface area.","how does the surface area of Niger compare with that of North Macedonia":"The surface area of Niger is 1267000 and that of North Macedonia is 25713, so Niger has the larger surface area.","compare the surface area of Ukraine and Ivory Coast":"The surface area of Ukraine is 603700 and that of Ivory Coast is 322463, so Ukraine has the larger surface area.","French Polynesia versus Mauritania: compare their surface area":"The surface area of French Polynesia is 4000 and that of Mauritania is 1025520, so Mauritania has the larger surface area.","compare the surface area of United Arab Emirates and Netherlands Antilles":"The surface area of United Arab Emirates is 83600 and that of Netherlands Antilles is 800, so United Arab Emirates has the larger surface area.","compare the surface area of Morocco and Niger":"The surface area of Morocco is 446550 and that of Niger is 1267000, so Niger has the larger surface area.","compare the surface area of Dominica and Kazakhstan":"The surface area of Dominica is 751 and that of Kazakhstan is 2724900, so Kazakhstan has the larger surface area.","how does the surface area of Sweden compare with that of Costa Rica":"The surface area of Sweden is 449964 and that of Costa Rica is 51100, so Sweden has the larger surface area.","compare the surface area of Panama and Svalbard and Jan Mayen":"The surface area of Panama is 75517 and that of Svalbard and Jan Mayen is 62422, so Panama has the larger surface area.","Australia versus Sao Tome and Principe: compare their surface area":"The surface area of Australia is 7741220 and that of Sao Tome and Principe is 964, so Australia has the larger surface area.","compare the surface area of Mozambique and Ghana":"The surface area of Mozambique is 801590 and that of Ghana is 238533, so Mozambique has the larger surface area.","compare the surface area of Belize and Germany":"The surface area of Belize is 22696 and that of Germany is 357022, so Germany has the larger surface area.","Zimbabwe versus Uganda: compare their surface area":"The surface area of Zimbabwe is 390757 and that of Uganda is 241038, so Zimbabwe has the larger surface area.","Malaysia versus Serbia: compare their surface area":"The surface area of Malaysia is 329758 and that of Serbia is 88361, so Malaysia has the larger surface area.","Saint Kitts and Nevis versus Mozambique: compare their surface area":"The surface area of Saint Kitts and Nevis is 261 and that of Mozambique is 801590, so Mozambique has the larger surface area.","compare the surface area of Benin and Puerto Rico":"The surface area of Benin is 112622 and that of Puerto Rico is 8875, so Benin has the larger surface area.","how does the surface area of Nepal compare with that of Solomon Islands":"The surface area of Nepal is 147181 and that of Solomon Islands is 28896, so Nepal has the larger surface area.","Costa Rica versus Tunisia: compare their surface area":"The surface area of Costa Rica is 51100 and that of Tunisia is 163610, so Tunisia has the larger surface area.","Saudi Arabia versus North Korea: compare their surface area":"The surface area of Saudi Arabia is 2149690 and that of North Korea is 120538, so Saudi Arabia has the larger surface area.","Chad versus Benin: compare their surface area":"The surface area of Chad is 1284000 and that of Benin is 112622, so Chad has the larger surface area.","how does the surface area of Netherlands Antilles compare with that of New Zealand":"The surface area of Netherlands Antilles is 800 and that of New Zealand is 270534, so New Zealand has the larger surface area.","how does the surface area of Northern Mariana Islands compare with that of Saudi Arabia":"The surface area of Northern Mariana Islands is 464 and that of Saudi Arabia is 2149690, so Saudi Arabia has the larger surface area.","United States Minor Outlying Islands versus Falkland Islands: compare their surface area":"The surface area of United States Minor Outlying Islands is 16 and that of Falkland Islands is 12173, so Falkland Islands has the larger surface area.","British Virgin Islands versus Antarctica: compare their surface area":"The surface area of British Virgin Islands is 151 and that of Antarctica is 13120000, so Antarctica has the larger surface area.","Iceland versus Panama: compare their surface area":"The surface area of Iceland is 103000 and that of Panama is 75517, so Iceland has the larger surface area.","how does the surface area of French Southern territories compare with that of Cayman Islands":"The surface area of French Southern territories is 7780 and that of Cayman Islands is 264, so French Southern territories has the larger surface area.","how does the surface area of Norway compare with that of Pitcairn":"The surface area of Norway is 323877 and that of Pitcairn is 49, so Norway has the larger surface area.","Vanuatu versus United Arab Emirates: compare their surface area":"The surface area of Vanuatu is 12189 and that of United Arab Emirates is 83600, so United Arab Emirates has the larger surface area.","how does the surface area of Eritrea compare with that of Azerbaijan":"The surface area of Eritrea is 117600 and that of Azerbaijan is 86600, so Eritrea has the larger surface area.","Gibraltar versus Belize: compare their surface area":"The surface area of Gibraltar is 6 and that of Belize is 22696, so Belize has the larger surface area.","compare the surface area of Falkland Islands and Cambodia":"The surface area of Falkland Islands is 12173 and that of Cambodia is 181035, so Cambodia has the larger surface area.","compare the surface area of Algeria and Kiribati":"The surface area of Algeria is 2381741 and that of Kiribati is 726, so Algeria has the larger surface area.","compare the surface area of Romania and Northern Mariana Islands":"The surface area of Romania is 238391 and that of Northern Mariana Islands is 464, so Romania has the larger surface area.","compare the surface area of Uganda and Congo":"The surface area of Uganda is 241038 and that of Congo is 342000, so Congo has the larger surface area.","Indonesia versus Japan: compare their surface area":"The surface area of Indonesia is 1904569 and that of Japan is 377829, so Indonesia has the larger surface area.","how does the surface area of Bermuda compare with that of France":"The surface area of Bermuda is 53 and that of France is 551500, so France has the larger surface area.","Solomon Islands versus Morocco: compare their surface area":"The surface area of Solomon Islands is 28896 and that of Morocco is 446550, so Morocco has the larger surface area.","compare the surface area of Serbia and Colombia":"The surface area of Serbia is 88361 and that of Colombia is 1138914, so Colombia has the larger surface area.","compare the surface area of North Korea and Eritrea":"The surface area of North Korea is 120538 and that of Eritrea is 117600, so North Korea has the larger surface area.","how does the surface area of Lebanon compare with that of Vanuatu":"The surface area of Lebanon is 10400 and that of Vanuatu is 12189, so Vanuatu has the larger surface area.","compare the surface area of Niue and Canada":"The surface area of Niue is 260 and that of Canada is 9970610, so Canada has the larger surface area.","how does the surface area of Svalbard and Jan Mayen compare with that of Czech Republic":"The surface area of Svalbard and Jan Mayen is 62422 and that of Czech Republic is 78866, so Czech Republic has the larger surface area.","compare the surface area of Japan and Sweden":"The surface area of Japan is 377829 and that of Sweden is 449964, so Sweden has the larger surface area.","how does the surface area of Gambia compare with that of Indonesia":"The surface area of Gambia is 11295 and that of Indonesia is 1904569, so Indonesia has the larger surface area."}}},
{"id":"n-58d085ff","guard":[["has","area"],["has","compare"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"compare the surface area of Yemen and Saint Helena":"The surface area of Yemen is 527968 and that of Saint Helena is 314, so Yemen has the larger surface area.","compare the surface area of Portugal and Faroe Islands":"The surface area of Portugal is 91982 and that of Faroe Islands is 1399, so Portugal has the larger surface area.","Aruba versus Armenia: compare their surface area":"The surface area of Aruba is 193 and that of Armenia is 29800, so Armenia has the larger surface area.","Peru versus Yemen: compare their surface area":"The surface area of Peru is 1285216 and that of Yemen is 527968, so Peru has the larger surface area.","compare the surface area of Vietnam and Finland":"The surface area of Vietnam is 331689 and that of Finland is 338145, so Finland has the larger surface area.","how does the surface area of Bahrain compare with that of Iraq":"The surface area of Bahrain is 694 and that of Iraq is 438317, so Iraq has the larger surface area.","compare the surface area of Antarctica and Jamaica":"The surface area of Antarctica is 13120000 and that of Jamaica is 10990, so Antarctica has the larger surface area.","compare the surface area of Nigeria and Rwanda":"The surface area of Nigeria is 923768 and that of Rwanda is 26338, so Nigeria has the larger surface area.","Cayman Islands versus Algeria: compare their surface area":"The surface area of Cayman Islands is 264 and that of Algeria is 2381741, so Algeria has the larger surface area.","Iraq versus Romania: compare their surface area":"The surface area of Iraq is 438317 and that of Romania is 238391, so Iraq has the larger surface area.","how does the surface area of Canada compare with that of French Polynesia":"The surface area of Canada is 9970610 and that of French Polynesia is 4000, so Canada has the larger surface area.","compare the surface area of Tonga and Angola":"The surface area of Tonga is 650 and that of Angola is 1246700, so Angola has the larger surface area.","how does the surface area of Rwanda compare with that of Saint Kitts and Nevis":"The surface area of Rwanda is 26338 and that of Saint Kitts and Nevis is 261, so Rwanda has the larger surface area.","Wallis and Futuna versus Afghanistan: compare their surface area":"The surface area of Wallis and Futuna is 200 and that of Afghanistan is 652090, so Afghanistan has the larger surface area.","compare the surface area of Tunisia and Mayotte":"The surface area of Tunisia is 163610 and that of Mayotte is 373, so Tunisia has the larger surface area.","how does the surface area of Kazakhstan compare with that of Iceland":"The surface area of Kazakhstan is 2724900 and that of Iceland is 103000, so Kazakhstan has the larger surface area.","French Guiana versus United States: compare their surface area":"The surface area of French Guiana is 90000 and that of United States is 9363520, so United States has the larger surface area.","how does the surface area of Saint Helena compare with that of Wallis and Futuna":"The surface area of Saint Helena is 314 and that of Wallis and Futuna is 200, so Saint Helena has the larger surface area.","compare the surface area of Mauritania and Nepal":"The surface area of Mauritania is 1025520 and that of Nepal is 147181, so Mauritania has the larger surface area.","France versus Ukraine: compare their surface area":"The surface area of France is 551500 and that of Ukraine is 603700, so Ukraine has the larger surface area.","compare the surface area of Armenia and Norway":"The surface area of Armenia is 29800 and that of Norway is 323877, so Norway has the larger surface area.","New Zealand versus Nigeria: compare their surface area":"The surface area of New Zealand is 270534 and that of Nigeria is 923768, so Nigeria has the larger surface area.","Czech Republic versus Reunion: compare their surface area":"The surface area of Czech Republic is 78866 and that of Reunion is 2510, so Czech Republic has the larger surface area.","how does the surface area of Kenya compare with that of Togo":"The surface area of Kenya is 580367 and that of Togo is 56785, so Kenya has the larger surface area.","Pitcairn versus Niue: compare their surface area":"The surface area of Pitcairn is 49 and that of Niue is 260, so Niue has the larger surface area.","how does the surface area of Puerto Rico compare with that of Egypt":"The surface area of Puerto Rico is 8875 and that of Egypt is 1001449, so Egypt has the larger surface area.","compare the surface area of Bulgaria and Western Sahara":"The surface area of Bulgaria is 110994 and that of Western Sahara is 266000, so Western Sahara has the larger surface area.","how does the surface area of Finland compare with that of Malaysia":"The surface area of Finland is 338145 and that of Malaysia is 329758, so Finland has the larger surface area.","how does the surface area of Cambodia compare with that of El Salvador":"The surface area of Cambodia is 181035 and that of El Salvador is 21041, so Cambodia has the larger surface area.","compare the surface area of Paraguay and Bermuda":"The surface area of Paraguay is 406752 and that of Bermuda is 53, so Paraguay has the larger surface area.","North Macedonia versus Bulgaria: compare their surface area":"The surface area of North Macedonia is 25713 and that of Bulgaria is 110994, so Bulgaria has the larger surface area.","El Salvador versus Guadeloupe: compare their surface area":"The surface area of El Salvador is 21041 and that of Guadeloupe is 1705, so El Salvador has the larger surface area.","how does the surface area of Angola compare with that of Gibraltar":"The surface area of Angola is 1246700 and that of Gibraltar is 6, so Angola has the larger surface area.","how does the surface area of Ivory Coast compare with that of Guatemala":"The surface area of Ivory Coast is 322463 and that of Guatemala is 108889, so Ivory Coast has the larger surface area.","how does the surface area of Congo compare with that of Australia":"The surface area of Congo is 342000 and that of Australia is 7741220, so Australia has the larger surface area.","how does the surface area of Western Sahara compare with that of French Guiana":"The surface area of Western Sahara is 266000 and that of French Guiana is 90000, so Western Sahara has the larger surface area.","Togo versus Zambia: compare their surface area":"The surface area of Togo is 56785 and that of Zambia is 752618, so Zambia has the larger surface area.","how does the surface area of Cuba compare with that of Lithuania":"The surface area of Cuba is 110861 and that of Lithuania is 65301, so Cuba has the larger surface area.","how does the surface area of Germany compare with that of United States Minor Outlying Islands":"The surface area of Germany is 357022 and that of United States Minor Outlying Islands is 16, so Germany has the larger surface area.","compare the surface area of Zambia and Cuba":"The surface area of Zambia is 752618 and that of Cuba is 110861, so Zambia has the larger surface area.","Egypt versus Vietnam: compare their surface area":"The surface area of Egypt is 1001449 and that of Vietnam is 331689, so Egypt has the larger surface area.","compare the surface area of United States and French Southern territories":"The surface area of United States is 9363520 and that of French Southern territories is 7780, so United States has the larger surface area.","Guatemala versus Uzbekistan: compare their surface area":"The surface area of Guatemala is 108889 and that of Uzbekistan is 447400, so Uzbekistan has the larger surface area.","compare the surface area of Afghanistan and Gambia":"The surface area of Afghanistan is 652090 and that of Gambia is 11295, so Afghanistan has the larger surface area.","Italy versus Paraguay: compare their surface area":"The surface area of Italy is 301316 and that of Paraguay is 406752, so Paraguay has the larger surface area.","how does the surface area of Switzerland compare with that of British Virgin Islands":"The surface area of Switzerland is 41284 and that of British Virgin Islands is 151, so Switzerland has the larger surface area.","Azerbaijan versus Portugal: compare their surface area":"The surface area of Azerbaijan is 86600 and that of Portugal is 91982, so Portugal has the larger surface area.","how does the surface area of Colombia compare with that of Aruba":"The surface area of Colombia is 1138914 and that of Aruba is 193, so Colombia has the larger surface area.","compare the surface area of Sao Tome and Principe and Lebanon":"The surface area of Sao Tome and Principe is 964 and that of Lebanon is 10400, so Lebanon has the larger surface area.","compare the surface area of Reunion and Bahrain":"The surface area of Reunion is 2510 and that of Bahrain is 694, so Reunion has the larger surface area.","Lithuania versus Dominica: compare their surface area":"The surface area of Lithuania is 65301 and that of Dominica is 751, so Lithuania has the larger surface area.","compare the surface area of Guadeloupe and Switzerland":"The surface area of Guadeloupe is 1705 and that of Switzerland is 41284, so Switzerland has the larger surface area.","how does the surface area of Jamaica compare with that of Chad":"The surface area of Jamaica is 10990 and that of Chad is 1284000, so Chad has the larger surface area.","how does the surface area of Faroe Islands compare with that of Peru":"The surface area of Faroe Islands is 1399 and that of Peru is 1285216, so Peru has the larger surface area.","how does the surface area of Ghana compare with that of Italy":"The surface area of Ghana is 238533 and that of Italy is 301316, so Italy has the larger surface area.","how does the surface area of Kiribati compare with that of Zimbabwe":"The surface area of Kiribati is 726 and that of Zimbabwe is 390757, so Zimbabwe has the larger surface area.","compare the surface area of Uzbekistan and Kenya":"The surface area of Uzbekistan is 447400 and that of Kenya is 580367, so Kenya has the larger surface area.","how does the surface area of Niger compare with that of North Macedonia":"The surface area of Niger is 1267000 and that of North Macedonia is 25713, so Niger has the larger surface area.","compare the surface area of Ukraine and Ivory Coast":"The surface area of Ukraine is 603700 and that of Ivory Coast is 322463, so Ukraine has the larger surface area.","French Polynesia versus Mauritania: compare their surface area":"The surface area of French Polynesia is 4000 and that of Mauritania is 1025520, so Mauritania has the larger surface area.","compare the surface area of United Arab Emirates and Netherlands Antilles":"The surface area of United Arab Emirates is 83600 and that of Netherlands Antilles is 800, so United Arab Emirates has the larger surface area.","compare the surface area of Morocco and Niger":"The surface area of Morocco is 446550 and that of Niger is 1267000, so Niger has the larger surface area.","compare the surface area of Dominica and Kazakhstan":"The surface area of Dominica is 751 and that of Kazakhstan is 2724900, so Kazakhstan has the larger surface area.","how does the surface area of Sweden compare with that of Costa Rica":"The surface area of Sweden is 449964 and that of Costa Rica is 51100, so Sweden has the larger surface area.","compare the surface area of Panama and Svalbard and Jan Mayen":"The surface area of Panama is 75517 and that of Svalbard and Jan Mayen is 62422, so Panama has the larger surface area.","Australia versus Sao Tome and Principe: compare their surface area":"The surface area of Australia is 7741220 and that of Sao Tome and Principe is 964, so Australia has the larger surface area.","compare the surface area of Mozambique and Ghana":"The surface area of Mozambique is 801590 and that of Ghana is 238533, so Mozambique has the larger surface area.","compare the surface area of Belize and Germany":"The surface area of Belize is 22696 and that of Germany is 357022, so Germany has the larger surface area.","Zimbabwe versus Uganda: compare their surface area":"The surface area of Zimbabwe is 390757 and that of Uganda is 241038, so Zimbabwe has the larger surface area.","Malaysia versus Serbia: compare their surface area":"The surface area of Malaysia is 329758 and that of Serbia is 88361, so Malaysia has the larger surface area.","Saint Kitts and Nevis versus Mozambique: compare their surface area":"The surface area of Saint Kitts and Nevis is 261 and that of Mozambique is 801590, so Mozambique has the larger surface area.","compare the surface area of Benin and Puerto Rico":"The surface area of Benin is 112622 and that of Puerto Rico is 8875, so Benin has the larger surface area.","how does the surface area of Nepal compare with that of Solomon Islands":"The surface area of Nepal is 147181 and that of Solomon Islands is 28896, so Nepal has the larger surface area.","Costa Rica versus Tunisia: compare their surface area":"The surface area of Costa Rica is 51100 and that of Tunisia is 163610, so Tunisia has the larger surface area.","Saudi Arabia versus North Korea: compare their surface area":"The surface area of Saudi Arabia is 2149690 and that of North Korea is 120538, so Saudi Arabia has the larger surface area.","Chad versus Benin: compare their surface area":"The surface area of Chad is 1284000 and that of Benin is 112622, so Chad has the larger surface area.","how does the surface area of Netherlands Antilles compare with that of New Zealand":"The surface area of Netherlands Antilles is 800 and that of New Zealand is 270534, so New Zealand has the larger surface area.","how does the surface area of Northern Mariana Islands compare with that of Saudi Arabia":"The surface area of Northern Mariana Islands is 464 and that of Saudi Arabia is 2149690, so Saudi Arabia has the larger surface area.","United States Minor Outlying Islands versus Falkland Islands: compare their surface area":"The surface area of United States Minor Outlying Islands is 16 and that of Falkland Islands is 12173, so Falkland Islands has the larger surface area.","British Virgin Islands versus Antarctica: compare their surface area":"The surface area of British Virgin Islands is 151 and that of Antarctica is 13120000, so Antarctica has the larger surface area.","Iceland versus Panama: compare their surface area":"The surface area of Iceland is 103000 and that of Panama is 75517, so Iceland has the larger surface area.","how does the surface area of French Southern territories compare with that of Cayman Islands":"The surface area of French Southern territories is 7780 and that of Cayman Islands is 264, so French Southern territories has the larger surface area.","how does the surface area of Norway compare with that of Pitcairn":"The surface area of Norway is 323877 and that of Pitcairn is 49, so Norway has the larger surface area.","Vanuatu versus United Arab Emirates: compare their surface area":"The surface area of Vanuatu is 12189 and that of United Arab Emirates is 83600, so United Arab Emirates has the larger surface area.","how does the surface area of Eritrea compare with that of Azerbaijan":"The surface area of Eritrea is 117600 and that of Azerbaijan is 86600, so Eritrea has the larger surface area.","Gibraltar versus Belize: compare their surface area":"The surface area of Gibraltar is 6 and that of Belize is 22696, so Belize has the larger surface area.","compare the surface area of Falkland Islands and Cambodia":"The surface area of Falkland Islands is 12173 and that of Cambodia is 181035, so Cambodia has the larger surface area.","compare the surface area of Algeria and Kiribati":"The surface area of Algeria is 2381741 and that of Kiribati is 726, so Algeria has the larger surface area.","compare the surface area of Romania and Northern Mariana Islands":"The surface area of Romania is 238391 and that of Northern Mariana Islands is 464, so Romania has the larger surface area.","compare the surface area of Uganda and Congo":"The surface area of Uganda is 241038 and that of Congo is 342000, so Congo has the larger surface area.","Indonesia versus Japan: compare their surface area":"The surface area of Indonesia is 1904569 and that of Japan is 377829, so Indonesia has the larger surface area.","how does the surface area of Bermuda compare with that of France":"The surface area of Bermuda is 53 and that of France is 551500, so France has the larger surface area.","Solomon Islands versus Morocco: compare their surface area":"The surface area of Solomon Islands is 28896 and that of Morocco is 446550, so Morocco has the larger surface area.","compare the surface area of Serbia and Colombia":"The surface area of Serbia is 88361 and that of Colombia is 1138914, so Colombia has the larger surface area.","compare the surface area of North Korea and Eritrea":"The surface area of North Korea is 120538 and that of Eritrea is 117600, so North Korea has the larger surface area.","how does the surface area of Lebanon compare with that of Vanuatu":"The surface area of Lebanon is 10400 and that of Vanuatu is 12189, so Vanuatu has the larger surface area.","compare the surface area of Niue and Canada":"The surface area of Niue is 260 and that of Canada is 9970610, so Canada has the larger surface area.","how does the surface area of Svalbard and Jan Mayen compare with that of Czech Republic":"The surface area of Svalbard and Jan Mayen is 62422 and that of Czech Republic is 78866, so Czech Republic has the larger surface area.","compare the surface area of Japan and Sweden":"The surface area of Japan is 377829 and that of Sweden is 449964, so Sweden has the larger surface area.","how does the surface area of Gambia compare with that of Indonesia":"The surface area of Gambia is 11295 and that of Indonesia is 1904569, so Indonesia has the larger surface area."}}},
{"id":"n-490fdbcd","guard":[["has","area"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"Yemen and Saint Helena":"The surface area of Yemen is 527968 and that of Saint Helena is 314, so Yemen has the larger surface area.","Portugal and Faroe Islands":"The surface area of Portugal is 91982 and that of Faroe Islands is 1399, so Portugal has the larger surface area.","Vietnam and Finland":"The surface area of Vietnam is 331689 and that of Finland is 338145, so Finland has the larger surface area.","Bahrain compare with that of Iraq":"The surface area of Bahrain is 694 and that of Iraq is 438317, so Iraq has the larger surface area.","Antarctica and Jamaica":"The surface area of Antarctica is 13120000 and that of Jamaica is 10990, so Antarctica has the larger surface area.","Nigeria and Rwanda":"The surface area of Nigeria is 923768 and that of Rwanda is 26338, so Nigeria has the larger surface area.","Canada compare with that of French Polynesia":"The surface area of Canada is 9970610 and that of French Polynesia is 4000, so Canada has the larger surface area.","Tonga and Angola":"The surface area of Tonga is 650 and that of Angola is 1246700, so Angola has the larger surface area.","Rwanda compare with that of Saint Kitts and Nevis":"The surface area of Rwanda is 26338 and that of Saint Kitts and Nevis is 261, so Rwanda has the larger surface area.","Tunisia and Mayotte":"The surface area of Tunisia is 163610 and that of Mayotte is 373, so Tunisia has the larger surface area.","Kazakhstan compare with that of Iceland":"The surface area of Kazakhstan is 2724900 and that of Iceland is 103000, so Kazakhstan has the larger surface area.","Saint Helena compare with that of Wallis and Futuna":"The surface area of Saint Helena is 314 and that of Wallis and Futuna is 200, so Saint Helena has the larger surface area.","Mauritania and Nepal":"The surface area of Mauritania is 1025520 and that of Nepal is 147181, so Mauritania has the larger surface area.","Armenia and Norway":"The surface area of Armenia is 29800 and that of Norway is 323877, so Norway has the larger surface area.","Kenya compare with that of Togo":"The surface area of Kenya is 580367 and that of Togo is 56785, so Kenya has the larger surface area.","Puerto Rico compare with that of Egypt":"The surface area of Puerto Rico is 8875 and that of Egypt is 1001449, so Egypt has the larger surface area.","Bulgaria and Western Sahara":"The surface area of Bulgaria is 110994 and that of Western Sahara is 266000, so Western Sahara has the larger surface area.","Finland compare with that of Malaysia":"The surface area of Finland is 338145 and that of Malaysia is 329758, so Finland has the larger surface area.","Cambodia compare with that of El Salvador":"The surface area of Cambodia is 181035 and that of El Salvador is 21041, so Cambodia has the larger surface area.","Paraguay and Bermuda":"The surface area of Paraguay is 406752 and that of Bermuda is 53, so Paraguay has the larger surface area.","Angola compare with that of Gibraltar":"The surface area of Angola is 1246700 and that of Gibraltar is 6, so Angola has the larger surface area.","Ivory Coast compare with that of Guatemala":"The surface area of Ivory Coast is 322463 and that of Guatemala is 108889, so Ivory Coast has the larger surface area.","Congo compare with that of Australia":"The surface area of Congo is 342000 and that of Australia is 7741220, so Australia has the larger surface area.","Western Sahara compare with that of French Guiana":"The surface area of Western Sahara is 266000 and that of French Guiana is 90000, so Western Sahara has the larger surface area.","Cuba compare with that of Lithuania":"The surface area of Cuba is 110861 and that of Lithuania is 65301, so Cuba has the larger surface area.","Germany compare with that of United States Minor Outlying Islands":"The surface area of Germany is 357022 and that of United States Minor Outlying Islands is 16, so Germany has the larger surface area.","Zambia and Cuba":"The surface area of Zambia is 752618 and that of Cuba is 110861, so Zambia has the larger surface area.","United States and French Southern territories":"The surface area of United States is 9363520 and that of French Southern territories is 7780, so United States has the larger surface area.","Afghanistan and Gambia":"The surface area of Afghanistan is 652090 and that of Gambia is 11295, so Afghanistan has the larger surface area.","Switzerland compare with that of British Virgin Islands":"The surface area of Switzerland is 41284 and that of British Virgin Islands is 151, so Switzerland has the larger surface area.","Colombia compare with that of Aruba":"The surface area of Colombia is 1138914 and that of Aruba is 193, so Colombia has the larger surface area.","Sao Tome and Principe and Lebanon":"The surface area of Sao Tome and Principe is 964 and that of Lebanon is 10400, so Lebanon has the larger surface area.","Reunion and Bahrain":"The surface area of Reunion is 2510 and that of Bahrain is 694, so Reunion has the larger surface area.","Guadeloupe and Switzerland":"The surface area of Guadeloupe is 1705 and that of Switzerland is 41284, so Switzerland has the larger surface area.","Jamaica compare with that of Chad":"The surface area of Jamaica is 10990 and that of Chad is 1284000, so Chad has the larger surface area.","Faroe Islands compare with that of Peru":"The surface area of Faroe Islands is 1399 and that of Peru is 1285216, so Peru has the larger surface area.","Ghana compare with that of Italy":"The surface area of Ghana is 238533 and that of Italy is 301316, so Italy has the larger surface area.","Kiribati compare with that of Zimbabwe":"The surface area of Kiribati is 726 and that of Zimbabwe is 390757, so Zimbabwe has the larger surface area.","Uzbekistan and Kenya":"The surface area of Uzbekistan is 447400 and that of Kenya is 580367, so Kenya has the larger surface area.","Niger compare with that of North Macedonia":"The surface area of Niger is 1267000 and that of North Macedonia is 25713, so Niger has the larger surface area.","Ukraine and Ivory Coast":"The surface area of Ukraine is 603700 and that of Ivory Coast is 322463, so Ukraine has the larger surface area.","United Arab Emirates and Netherlands Antilles":"The surface area of United Arab Emirates is 83600 and that of Netherlands Antilles is 800, so United Arab Emirates has the larger surface area.","Morocco and Niger":"The surface area of Morocco is 446550 and that of Niger is 1267000, so Niger has the larger surface area.","Dominica and Kazakhstan":"The surface area of Dominica is 751 and that of Kazakhstan is 2724900, so Kazakhstan has the larger surface area.","Sweden compare with that of Costa Rica":"The surface area of Sweden is 449964 and that of Costa Rica is 51100, so Sweden has the larger surface area.","Panama and Svalbard and Jan Mayen":"The surface area of Panama is 75517 and that of Svalbard and Jan Mayen is 62422, so Panama has the larger surface area.","Mozambique and Ghana":"The surface area of Mozambique is 801590 and that of Ghana is 238533, so Mozambique has the larger surface area.","Belize and Germany":"The surface area of Belize is 22696 and that of Germany is 357022, so Germany has the larger surface area.","Benin and Puerto Rico":"The surface area of Benin is 112622 and that of Puerto Rico is 8875, so Benin has the larger surface area.","Nepal compare with that of Solomon Islands":"The surface area of Nepal is 147181 and that of Solomon Islands is 28896, so Nepal has the larger surface area.","Netherlands Antilles compare with that of New Zealand":"The surface area of Netherlands Antilles is 800 and that of New Zealand is 270534, so New Zealand has the larger surface area.","Northern Mariana Islands compare with that of Saudi Arabia":"The surface area of Northern Mariana Islands is 464 and that of Saudi Arabia is 2149690, so Saudi Arabia has the larger surface area.","French Southern territories compare with that of Cayman Islands":"The surface area of French Southern territories is 7780 and that of Cayman Islands is 264, so French Southern territories has the larger surface area.","Norway compare with that of Pitcairn":"The surface area of Norway is 323877 and that of Pitcairn is 49, so Norway has the larger surface area.","Eritrea compare with that of Azerbaijan":"The surface area of Eritrea is 117600 and that of Azerbaijan is 86600, so Eritrea has the larger surface area.","Falkland Islands and Cambodia":"The surface area of Falkland Islands is 12173 and that of Cambodia is 181035, so Cambodia has the larger surface area.","Algeria and Kiribati":"The surface area of Algeria is 2381741 and that of Kiribati is 726, so Algeria has the larger surface area.","Romania and Northern Mariana Islands":"The surface area of Romania is 238391 and that of Northern Mariana Islands is 464, so Romania has the larger surface area.","Uganda and Congo":"The surface area of Uganda is 241038 and that of Congo is 342000, so Congo has the larger surface area.","Bermuda compare with that of France":"The surface area of Bermuda is 53 and that of France is 551500, so France has the larger surface area.","Serbia and Colombia":"The surface area of Serbia is 88361 and that of Colombia is 1138914, so Colombia has the larger surface area.","North Korea and Eritrea":"The surface area of North Korea is 120538 and that of Eritrea is 117600, so North Korea has the larger surface area.","Lebanon compare with that of Vanuatu":"The surface area of Lebanon is 10400 and that of Vanuatu is 12189, so Vanuatu has the larger surface area.","Niue and Canada":"The surface area of Niue is 260 and that of Canada is 9970610, so Canada has the larger surface area.","Svalbard and Jan Mayen compare with that of Czech Republic":"The surface area of Svalbard and Jan Mayen is 62422 and that of Czech Republic is 78866, so Czech Republic has the larger surface area.","Japan and Sweden":"The surface area of Japan is 377829 and that of Sweden is 449964, so Sweden has the larger surface area.","Gambia compare with that of Indonesia":"The surface area of Gambia is 11295 and that of Indonesia is 1904569, so Indonesia has the larger surface area."}}},
{"id":"n-62d543a9","guard":[["has","area"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"area"}]]],"mem":{"table":{"of Yemen and Saint Helena":"The surface area of Yemen is 527968 and that of Saint Helena is 314, so Yemen has the larger surface area.","of Portugal and Faroe Islands":"The surface area of Portugal is 91982 and that of Faroe Islands is 1399, so Portugal has the larger surface area.","of Vietnam and Finland":"The surface area of Vietnam is 331689 and that of Finland is 338145, so Finland has the larger surface area.","of Bahrain compare with that of Iraq":"The surface area of Bahrain is 694 and that of Iraq is 438317, so Iraq has the larger surface area.","of Antarctica and Jamaica":"The surface area of Antarctica is 13120000 and that of Jamaica is 10990, so Antarctica has the larger surface area.","of Nigeria and Rwanda":"The surface area of Nigeria is 923768 and that of Rwanda is 26338, so Nigeria has the larger surface area.","of Canada compare with that of French Polynesia":"The surface area of Canada is 9970610 and that of French Polynesia is 4000, so Canada has the larger surface area.","of Tonga and Angola":"The surface area of Tonga is 650 and that of Angola is 1246700, so Angola has the larger surface area.","of Rwanda compare with that of Saint Kitts and Nevis":"The surface area of Rwanda is 26338 and that of Saint Kitts and Nevis is 261, so Rwanda has the larger surface area.","of Tunisia and Mayotte":"The surface area of Tunisia is 163610 and that of Mayotte is 373, so Tunisia has the larger surface area.","of Kazakhstan compare with that of Iceland":"The surface area of Kazakhstan is 2724900 and that of Iceland is 103000, so Kazakhstan has the larger surface area.","of Saint Helena compare with that of Wallis and Futuna":"The surface area of Saint Helena is 314 and that of Wallis and Futuna is 200, so Saint Helena has the larger surface area.","of Mauritania and Nepal":"The surface area of Mauritania is 1025520 and that of Nepal is 147181, so Mauritania has the larger surface area.","of Armenia and Norway":"The surface area of Armenia is 29800 and that of Norway is 323877, so Norway has the larger surface area.","of Kenya compare with that of Togo":"The surface area of Kenya is 580367 and that of Togo is 56785, so Kenya has the larger surface area.","of Puerto Rico compare with that of Egypt":"The surface area of Puerto Rico is 8875 and that of Egypt is 1001449, so Egypt has the larger surface area.","of Bulgaria and Western Sahara":"The surface area of Bulgaria is 110994 and that of Western Sahara is 266000, so Western Sahara has the larger surface area.","of Finland compare with that of Malaysia":"The surface area of Finland is 338145 and that of Malaysia is 329758, so Finland has the larger surface area.","of Cambodia compare with that of El Salvador":"The surface area of Cambodia is 181035 and that of El Salvador is 21041, so Cambodia has the larger surface area.","of Paraguay and Bermuda":"The surface area of Paraguay is 406752 and that of Bermuda is 53, so Paraguay has the larger surface area.","of Angola compare with that of Gibraltar":"The surface area of Angola is 1246700 and that of Gibraltar is 6, so Angola has the larger surface area.","of Ivory Coast compare with that of Guatemala":"The surface area of Ivory Coast is 322463 and that of Guatemala is 108889, so Ivory Coast has the larger surface area.","of Congo compare with that of Australia":"The surface area of Congo is 342000 and that of Australia is 7741220, so Australia has the larger surface area.","of Western Sahara compare with that of French Guiana":"The surface area of Western Sahara is 266000 and that of French Guiana is 90000, so Western Sahara has the larger surface area.","of Cuba compare with that of Lithuania":"The surface area of Cuba is 110861 and that of Lithuania is 65301, so Cuba has the larger surface area.","of Germany compare with that of United States Minor Outlying Islands":"The surface area of Germany is 357022 and that of United States Minor Outlying Islands is 16, so Germany has the larger surface area.","of Zambia and Cuba":"The surface area of Zambia is 752618 and that of Cuba is 110861, so Zambia has the larger surface area.","of United States and French Southern territories":"The surface area of United States is 9363520 and that of French Southern territories is 7780, so United States has the larger surface area.","of Afghanistan and Gambia":"The surface area of Afghanistan is 652090 and that of Gambia is 11295, so Afghanistan has the larger surface area.","of Switzerland compare with that of British Virgin Islands":"The surface area of Switzerland is 41284 and that of British Virgin Islands is 151, so Switzerland has the larger surface area.","of Colombia compare with that of Aruba":"The surface area of Colombia is 1138914 and that of Aruba is 193, so Colombia has the larger surface area.","of Sao Tome and Principe and Lebanon":"The surface area of Sao Tome and Principe is 964 and that of Lebanon is 10400, so Lebanon has the larger surface area.","of Reunion and Bahrain":"The surface area of Reunion is 2510 and that of Bahrain is 694, so Reunion has the larger surface area.","of Guadeloupe and Switzerland":"The surface area of Guadeloupe is 1705 and that of Switzerland is 41284, so Switzerland has the larger surface area.","of Jamaica compare with that of Chad":"The surface area of Jamaica is 10990 and that of Chad is 1284000, so Chad has the larger surface area.","of Faroe Islands compare with that of Peru":"The surface area of Faroe Islands is 1399 and that of Peru is 1285216, so Peru has the larger surface area.","of Ghana compare with that of Italy":"The surface area of Ghana is 238533 and that of Italy is 301316, so Italy has the larger surface area.","of Kiribati compare with that of Zimbabwe":"The surface area of Kiribati is 726 and that of Zimbabwe is 390757, so Zimbabwe has the larger surface area.","of Uzbekistan and Kenya":"The surface area of Uzbekistan is 447400 and that of Kenya is 580367, so Kenya has the larger surface area.","of Niger compare with that of North Macedonia":"The surface area of Niger is 1267000 and that of North Macedonia is 25713, so Niger has the larger surface area.","of Ukraine and Ivory Coast":"The surface area of Ukraine is 603700 and that of Ivory Coast is 322463, so Ukraine has the larger surface area.","of United Arab Emirates and Netherlands Antilles":"The surface area of United Arab Emirates is 83600 and that of Netherlands Antilles is 800, so United Arab Emirates has the larger surface area.","of Morocco and Niger":"The surface area of Morocco is 446550 and that of Niger is 1267000, so Niger has the larger surface area.","of Dominica and Kazakhstan":"The surface area of Dominica is 751 and that of Kazakhstan is 2724900, so Kazakhstan has the larger surface area.","of Sweden compare with that of Costa Rica":"The surface area of Sweden is 449964 and that of Costa Rica is 51100, so Sweden has the larger surface area.","of Panama and Svalbard and Jan Mayen":"The surface area of Panama is 75517 and that of Svalbard and Jan Mayen is 62422, so Panama has the larger surface area.","of Mozambique and Ghana":"The surface area of Mozambique is 801590 and that of Ghana is 238533, so Mozambique has the larger surface area.","of Belize and Germany":"The surface area of Belize is 22696 and that of Germany is 357022, so Germany has the larger surface area.","of Benin and Puerto Rico":"The surface area of Benin is 112622 and that of Puerto Rico is 8875, so Benin has the larger surface area.","of Nepal compare with that of Solomon Islands":"The surface area of Nepal is 147181 and that of Solomon Islands is 28896, so Nepal has the larger surface area.","of Netherlands Antilles compare with that of New Zealand":"The surface area of Netherlands Antilles is 800 and that of New Zealand is 270534, so New Zealand has the larger surface area.","of Northern Mariana Islands compare with that of Saudi Arabia":"The surface area of Northern Mariana Islands is 464 and that of Saudi Arabia is 2149690, so Saudi Arabia has the larger surface area.","of French Southern territories compare with that of Cayman Islands":"The surface area of French Southern territories is 7780 and that of Cayman Islands is 264, so French Southern territories has the larger surface area.","of Norway compare with that of Pitcairn":"The surface area of Norway is 323877 and that of Pitcairn is 49, so Norway has the larger surface area.","of Eritrea compare with that of Azerbaijan":"The surface area of Eritrea is 117600 and that of Azerbaijan is 86600, so Eritrea has the larger surface area.","of Falkland Islands and Cambodia":"The surface area of Falkland Islands is 12173 and that of Cambodia is 181035, so Cambodia has the larger surface area.","of Algeria and Kiribati":"The surface area of Algeria is 2381741 and that of Kiribati is 726, so Algeria has the larger surface area.","of Romania and Northern Mariana Islands":"The surface area of Romania is 238391 and that of Northern Mariana Islands is 464, so Romania has the larger surface area.","of Uganda and Congo":"The surface area of Uganda is 241038 and that of Congo is 342000, so Congo has the larger surface area.","of Bermuda compare with that of France":"The surface area of Bermuda is 53 and that of France is 551500, so France has the larger surface area.","of Serbia and Colombia":"The surface area of Serbia is 88361 and that of Colombia is 1138914, so Colombia has the larger surface area.","of North Korea and Eritrea":"The surface area of North Korea is 120538 and that of Eritrea is 117600, so North Korea has the larger surface area.","of Lebanon compare with that of Vanuatu":"The surface area of Lebanon is 10400 and that of Vanuatu is 12189, so Vanuatu has the larger surface area.","of Niue and Canada":"The surface area of Niue is 260 and that of Canada is 9970610, so Canada has the larger surface area.","of Svalbard and Jan Mayen compare with that of Czech Republic":"The surface area of Svalbard and Jan Mayen is 62422 and that of Czech Republic is 78866, so Czech Republic has the larger surface area.","of Japan and Sweden":"The surface area of Japan is 377829 and that of Sweden is 449964, so Sweden has the larger surface area.","of Gambia compare with that of Indonesia":"The surface area of Gambia is 11295 and that of Indonesia is 1904569, so Indonesia has the larger surface area."}}},
{"id":"n-020e8bf6","guard":[["hasAny",["area","compare","czech","republic","reunion","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Czech Republic versus Reunion: compare their surface area":"The surface area of Czech Republic is 78866 and that of Reunion is 2510, so Czech Republic has the larger surface area."}}},
{"id":"n-022e6f6f","guard":[["hasAny",["vanuatu","versus"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Vanuatu versus United Arab Emirates: compare their surface area":"The surface area of Vanuatu is 12189 and that of United Arab Emirates is 83600, so United Arab Emirates has the larger surface area."}}},
{"id":"n-058d66db","guard":[["has","falkland"],["has","surface"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"United States Minor Outlying Islands versus Falkland Islands: compare their surface area":"The surface area of United States Minor Outlying Islands is 16 and that of Falkland Islands is 12173, so Falkland Islands has the larger surface area."}}},
{"id":"n-0753cd46","guard":[["hasAny",["area","compare","indonesia","japan","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Indonesia versus Japan: compare their surface area":"The surface area of Indonesia is 1904569 and that of Japan is 377829, so Indonesia has the larger surface area."}}},
{"id":"n-079b5357","guard":[["has","romania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Iraq versus Romania: compare their surface area":"The surface area of Iraq is 438317 and that of Romania is 238391, so Iraq has the larger surface area."}}},
{"id":"n-08689a32","guard":[["hasAny",["area","belize","compare","germany","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Belize and Germany":"The surface area of Belize is 22696 and that of Germany is 357022, so Germany has the larger surface area."}}},
{"id":"n-089b1550","guard":[["hasAny",["area","compare","morocco","niger","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Morocco and Niger":"The surface area of Morocco is 446550 and that of Niger is 1267000, so Niger has the larger surface area."}}},
{"id":"n-08b7a044","guard":[["hasAny",["area","compare","italy","paraguay","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Italy versus Paraguay: compare their surface area":"The surface area of Italy is 301316 and that of Paraguay is 406752, so Paraguay has the larger surface area."}}},
{"id":"n-0adc7c71","guard":[["hasAny",["area","compare","el","guadeloupe","salvador","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"El Salvador versus Guadeloupe: compare their surface area":"The surface area of El Salvador is 21041 and that of Guadeloupe is 1705, so El Salvador has the larger surface area."}}},
{"id":"n-0adeed12","guard":[["hasAny",["area","benin","chad","compare","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Chad versus Benin: compare their surface area":"The surface area of Chad is 1284000 and that of Benin is 112622, so Chad has the larger surface area."}}},
{"id":"n-0c7f968a","guard":[["hasAny",["area","compare","kenya","surface","uzbekistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Uzbekistan and Kenya":"The surface area of Uzbekistan is 447400 and that of Kenya is 580367, so Kenya has the larger surface area."}}},
{"id":"n-0e3cf0bc","guard":[["hasAny",["area","compare","japan","surface","sweden"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Japan and Sweden":"The surface area of Japan is 377829 and that of Sweden is 449964, so Sweden has the larger surface area."}}},
{"id":"n-1051c384","guard":[["has","germany"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"compare the surface area of Belize and Germany":"The surface area of Belize is 22696 and that of Germany is 357022, so Germany has the larger surface area."}}},
{"id":"n-105e8c20","guard":[["hasAny",["algeria","area","cayman","compare","islands","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Cayman Islands versus Algeria: compare their surface area":"The surface area of Cayman Islands is 264 and that of Algeria is 2381741, so Algeria has the larger surface area."}}},
{"id":"n-1251181a","guard":[["hasAny",["area","compare","peru","surface","versus","yemen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Peru versus Yemen: compare their surface area":"The surface area of Peru is 1285216 and that of Yemen is 527968, so Peru has the larger surface area."}}},
{"id":"n-14931f2c","guard":[["hasAny",["area","compare","falkland","islands","minor","outlying","states","surface","united","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"United States Minor Outlying Islands versus Falkland Islands: compare their surface area":"The surface area of United States Minor Outlying Islands is 16 and that of Falkland Islands is 12173, so Falkland Islands has the larger surface area."}}},
{"id":"n-14dd8269","guard":[["hasAny",["algeria","area","compare","kiribati","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Algeria and Kiribati":"The surface area of Algeria is 2381741 and that of Kiribati is 726, so Algeria has the larger surface area."}}},
{"id":"n-14ec324e","guard":[["hasAny",["area","compare","islands","morocco","solomon","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Solomon Islands versus Morocco: compare their surface area":"The surface area of Solomon Islands is 28896 and that of Morocco is 446550, so Morocco has the larger surface area."}}},
{"id":"n-1802c7b6","guard":[["hasAny",["area","compare","guadeloupe","surface","switzerland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Guadeloupe and Switzerland":"The surface area of Guadeloupe is 1705 and that of Switzerland is 41284, so Switzerland has the larger surface area."}}},
{"id":"n-19223a65","guard":[["has","antarctica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"compare the surface area of Antarctica and Jamaica":"The surface area of Antarctica is 13120000 and that of Jamaica is 10990, so Antarctica has the larger surface area."}}},
{"id":"n-1933c8c7","guard":[["has","germany"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"how does the surface area of Germany compare with that of United States Minor Outlying Islands":"The surface area of Germany is 357022 and that of United States Minor Outlying Islands is 16, so Germany has the larger surface area."}}},
{"id":"n-1a0ff769","guard":[["hasAny",["area","compare","jan","mayen","panama","surface","svalbard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Panama and Svalbard and Jan Mayen":"The surface area of Panama is 75517 and that of Svalbard and Jan Mayen is 62422, so Panama has the larger surface area."}}},
{"id":"n-20e93450","guard":[["hasAny",["antilles","arab","area","compare","emirates","netherlands","surface","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of United Arab Emirates and Netherlands Antilles":"The surface area of United Arab Emirates is 83600 and that of Netherlands Antilles is 800, so United Arab Emirates has the larger surface area."}}},
{"id":"n-237b88c1","guard":[["hasAny",["arabia","area","compare","islands","mariana","northern","saudi","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Northern Mariana Islands compare with that of Saudi Arabia":"The surface area of Northern Mariana Islands is 464 and that of Saudi Arabia is 2149690, so Saudi Arabia has the larger surface area."}}},
{"id":"n-2841537b","guard":[["hasAny",["area","compare","ghana","mozambique","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Mozambique and Ghana":"The surface area of Mozambique is 801590 and that of Ghana is 238533, so Mozambique has the larger surface area."}}},
{"id":"n-2b02137c","guard":[["hasAny",["area","compare","germany","islands","minor","outlying","states","surface","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Germany compare with that of United States Minor Outlying Islands":"The surface area of Germany is 357022 and that of United States Minor Outlying Islands is 16, so Germany has the larger surface area."}}},
{"id":"n-303c2591","guard":[["hasAny",["area","australia","compare","congo","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Congo compare with that of Australia":"The surface area of Congo is 342000 and that of Australia is 7741220, so Australia has the larger surface area."}}},
{"id":"n-34ca0205","guard":[["has","bulgaria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"North Macedonia versus Bulgaria: compare their surface area":"The surface area of North Macedonia is 25713 and that of Bulgaria is 110994, so Bulgaria has the larger surface area."}}},
{"id":"n-3a8906d2","guard":[["hasAny",["mozambique","versus"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Saint Kitts and Nevis versus Mozambique: compare their surface area":"The surface area of Saint Kitts and Nevis is 261 and that of Mozambique is 801590, so Mozambique has the larger surface area."}}},
{"id":"n-3b479838","guard":[["hasAny",["area","compare","faroe","islands","portugal","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Portugal and Faroe Islands":"The surface area of Portugal is 91982 and that of Faroe Islands is 1399, so Portugal has the larger surface area."}}},
{"id":"n-3bf60de9","guard":[["hasAny",["area","compare","islands","nepal","solomon","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Nepal compare with that of Solomon Islands":"The surface area of Nepal is 147181 and that of Solomon Islands is 28896, so Nepal has the larger surface area."}}},
{"id":"n-4022173c","guard":[["hasAny",["area","compare","finland","malaysia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Finland compare with that of Malaysia":"The surface area of Finland is 338145 and that of Malaysia is 329758, so Finland has the larger surface area."}}},
{"id":"n-41e1a617","guard":[["hasAny",["area","bermuda","compare","france","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Bermuda compare with that of France":"The surface area of Bermuda is 53 and that of France is 551500, so France has the larger surface area."}}},
{"id":"n-43790921","guard":[["hasAny",["antarctica","area","british","compare","islands","surface","versus","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"British Virgin Islands versus Antarctica: compare their surface area":"The surface area of British Virgin Islands is 151 and that of Antarctica is 13120000, so Antarctica has the larger surface area."}}},
{"id":"n-46064156","guard":[["hasAny",["angola","area","compare","gibraltar","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Angola compare with that of Gibraltar":"The surface area of Angola is 1246700 and that of Gibraltar is 6, so Angola has the larger surface area."}}},
{"id":"n-486d16cb","guard":[["hasAny",["area","cambodia","compare","falkland","islands","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Falkland Islands and Cambodia":"The surface area of Falkland Islands is 12173 and that of Cambodia is 181035, so Cambodia has the larger surface area."}}},
{"id":"n-48d33e6b","guard":[["hasAny",["area","compare","czech","jan","mayen","republic","surface","svalbard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Svalbard and Jan Mayen compare with that of Czech Republic":"The surface area of Svalbard and Jan Mayen is 62422 and that of Czech Republic is 78866, so Czech Republic has the larger surface area."}}},
{"id":"n-493366f4","guard":[["hasAny",["area","compare","egypt","puerto","rico","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Puerto Rico compare with that of Egypt":"The surface area of Puerto Rico is 8875 and that of Egypt is 1001449, so Egypt has the larger surface area."}}},
{"id":"n-4959a486","guard":[["hasAny",["area","compare","helena","saint","surface","yemen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Yemen and Saint Helena":"The surface area of Yemen is 527968 and that of Saint Helena is 314, so Yemen has the larger surface area."}}},
{"id":"n-4c8bac9a","guard":[["has","versus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"El Salvador versus Guadeloupe: compare their surface area":"The surface area of El Salvador is 21041 and that of Guadeloupe is 1705, so El Salvador has the larger surface area."}}},
{"id":"n-4df74c38","guard":[["hasAny",["area","compare","costa","rica","surface","sweden"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Sweden compare with that of Costa Rica":"The surface area of Sweden is 449964 and that of Costa Rica is 51100, so Sweden has the larger surface area."}}},
{"id":"n-4f29e5f1","guard":[["hasAny",["area","compare","ghana","italy","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Ghana compare with that of Italy":"The surface area of Ghana is 238533 and that of Italy is 301316, so Italy has the larger surface area."}}},
{"id":"n-517a8dc1","guard":[["hasAny",["area","bulgaria","compare","sahara","surface","western"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Bulgaria and Western Sahara":"The surface area of Bulgaria is 110994 and that of Western Sahara is 266000, so Western Sahara has the larger surface area."}}},
{"id":"n-51a7ea07","guard":[["has","versus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"New Zealand versus Nigeria: compare their surface area":"The surface area of New Zealand is 270534 and that of Nigeria is 923768, so Nigeria has the larger surface area."}}},
{"id":"n-52302217","guard":[["hasAny",["area","azerbaijan","compare","portugal","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Azerbaijan versus Portugal: compare their surface area":"The surface area of Azerbaijan is 86600 and that of Portugal is 91982, so Portugal has the larger surface area."}}},
{"id":"n-56d515e8","guard":[["hasAny",["area","chad","compare","jamaica","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Jamaica compare with that of Chad":"The surface area of Jamaica is 10990 and that of Chad is 1284000, so Chad has the larger surface area."}}},
{"id":"n-5a93d77e","guard":[["has","versus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Czech Republic versus Reunion: compare their surface area":"The surface area of Czech Republic is 78866 and that of Reunion is 2510, so Czech Republic has the larger surface area."}}},
{"id":"n-5c157ac4","guard":[["hasAny",["area","compare","kenya","surface","togo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Kenya compare with that of Togo":"The surface area of Kenya is 580367 and that of Togo is 56785, so Kenya has the larger surface area."}}},
{"id":"n-5c548f7c","guard":[["hasAny",["arabia","area","compare","korea","north","saudi","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Saudi Arabia versus North Korea: compare their surface area":"The surface area of Saudi Arabia is 2149690 and that of North Korea is 120538, so Saudi Arabia has the larger surface area."}}},
{"id":"n-606c62be","guard":[["hasAny",["area","compare","costa","rica","surface","tunisia","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Costa Rica versus Tunisia: compare their surface area":"The surface area of Costa Rica is 51100 and that of Tunisia is 163610, so Tunisia has the larger surface area."}}},
{"id":"n-639dc6bb","guard":[["hasAny",["area","compare","french","mauritania","polynesia","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"French Polynesia versus Mauritania: compare their surface area":"The surface area of French Polynesia is 4000 and that of Mauritania is 1025520, so Mauritania has the larger surface area."}}},
{"id":"n-649fdc4e","guard":[["hasAny",["antarctica","area","compare","jamaica","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Antarctica and Jamaica":"The surface area of Antarctica is 13120000 and that of Jamaica is 10990, so Antarctica has the larger surface area."}}},
{"id":"n-663bc2d0","guard":[["hasAny",["area","compare","lebanon","surface","vanuatu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Lebanon compare with that of Vanuatu":"The surface area of Lebanon is 10400 and that of Vanuatu is 12189, so Vanuatu has the larger surface area."}}},
{"id":"n-670da7dc","guard":[["has","vanuatu"],["has","how"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"how does the surface area of Lebanon compare with that of Vanuatu":"The surface area of Lebanon is 10400 and that of Vanuatu is 12189, so Vanuatu has the larger surface area."}}},
{"id":"n-6e4d4081","guard":[["hasAny",["arabia","saudi"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"how does the surface area of Northern Mariana Islands compare with that of Saudi Arabia":"The surface area of Northern Mariana Islands is 464 and that of Saudi Arabia is 2149690, so Saudi Arabia has the larger surface area."}}},
{"id":"n-6f21b633","guard":[["hasAny",["area","compare","iceland","kazakhstan","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Kazakhstan compare with that of Iceland":"The surface area of Kazakhstan is 2724900 and that of Iceland is 103000, so Kazakhstan has the larger surface area."}}},
{"id":"n-6f4d94b7","guard":[["hasAny",["area","compare","iceland","panama","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Iceland versus Panama: compare their surface area":"The surface area of Iceland is 103000 and that of Panama is 75517, so Iceland has the larger surface area."}}},
{"id":"n-6f8e0f61","guard":[["has","panama"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"compare the surface area of Panama and Svalbard and Jan Mayen":"The surface area of Panama is 75517 and that of Svalbard and Jan Mayen is 62422, so Panama has the larger surface area."}}},
{"id":"n-6fa2d17d","guard":[["hasAny",["area","aruba","colombia","compare","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Colombia compare with that of Aruba":"The surface area of Colombia is 1138914 and that of Aruba is 193, so Colombia has the larger surface area."}}},
{"id":"n-6fd5c849","guard":[["hasAny",["area","compare","faroe","islands","peru","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Faroe Islands compare with that of Peru":"The surface area of Faroe Islands is 1399 and that of Peru is 1285216, so Peru has the larger surface area."}}},
{"id":"n-71b6e59f","guard":[["hasAny",["area","benin","compare","puerto","rico","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Benin and Puerto Rico":"The surface area of Benin is 112622 and that of Puerto Rico is 8875, so Benin has the larger surface area."}}},
{"id":"n-72d1bd06","guard":[["has","versus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Wallis and Futuna versus Afghanistan: compare their surface area":"The surface area of Wallis and Futuna is 200 and that of Afghanistan is 652090, so Afghanistan has the larger surface area."}}},
{"id":"n-745bc332","guard":[["hasAny",["area","compare","french","guiana","sahara","surface","western"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Western Sahara compare with that of French Guiana":"The surface area of Western Sahara is 266000 and that of French Guiana is 90000, so Western Sahara has the larger surface area."}}},
{"id":"n-779ea984","guard":[["hasAny",["area","compare","norway","pitcairn","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Norway compare with that of Pitcairn":"The surface area of Norway is 323877 and that of Pitcairn is 49, so Norway has the larger surface area."}}},
{"id":"n-7a4db28b","guard":[["hasAny",["area","canada","compare","niue","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Niue and Canada":"The surface area of Niue is 260 and that of Canada is 9970610, so Canada has the larger surface area."}}},
{"id":"n-7b776a45","guard":[["hasAny",["area","belize","compare","gibraltar","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Gibraltar versus Belize: compare their surface area":"The surface area of Gibraltar is 6 and that of Belize is 22696, so Belize has the larger surface area."}}},
{"id":"n-7b9514ee","guard":[["has","falkland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"compare the surface area of Falkland Islands and Cambodia":"The surface area of Falkland Islands is 12173 and that of Cambodia is 181035, so Cambodia has the larger surface area."}}},
{"id":"n-814703de","guard":[["has","versus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Costa Rica versus Tunisia: compare their surface area":"The surface area of Costa Rica is 51100 and that of Tunisia is 163610, so Tunisia has the larger surface area."}}},
{"id":"n-816290bb","guard":[["hasAny",["area","compare","malaysia","serbia","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Malaysia versus Serbia: compare their surface area":"The surface area of Malaysia is 329758 and that of Serbia is 88361, so Malaysia has the larger surface area."}}},
{"id":"n-834517ed","guard":[["hasAny",["area","compare","eritrea","korea","north","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of North Korea and Eritrea":"The surface area of North Korea is 120538 and that of Eritrea is 117600, so North Korea has the larger surface area."}}},
{"id":"n-85007fe0","guard":[["hasAny",["area","compare","macedonia","niger","north","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Niger compare with that of North Macedonia":"The surface area of Niger is 1267000 and that of North Macedonia is 25713, so Niger has the larger surface area."}}},
{"id":"n-86389a50","guard":[["hasAny",["area","compare","french","guiana","states","surface","united","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"French Guiana versus United States: compare their surface area":"The surface area of French Guiana is 90000 and that of United States is 9363520, so United States has the larger surface area."}}},
{"id":"n-864a08db","guard":[["hasAny",["area","compare","gambia","indonesia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Gambia compare with that of Indonesia":"The surface area of Gambia is 11295 and that of Indonesia is 1904569, so Indonesia has the larger surface area."}}},
{"id":"n-86bf267c","guard":[["hasAny",["arabia","saudi"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Saudi Arabia versus North Korea: compare their surface area":"The surface area of Saudi Arabia is 2149690 and that of North Korea is 120538, so Saudi Arabia has the larger surface area."}}},
{"id":"n-891c3015","guard":[["hasAny",["area","compare","nigeria","rwanda","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Nigeria and Rwanda":"The surface area of Nigeria is 923768 and that of Rwanda is 26338, so Nigeria has the larger surface area."}}},
{"id":"n-8bacf496","guard":[["has","romania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"compare the surface area of Romania and Northern Mariana Islands":"The surface area of Romania is 238391 and that of Northern Mariana Islands is 464, so Romania has the larger surface area."}}},
{"id":"n-8bdc000c","guard":[["hasAny",["area","azerbaijan","compare","eritrea","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Eritrea compare with that of Azerbaijan":"The surface area of Eritrea is 117600 and that of Azerbaijan is 86600, so Eritrea has the larger surface area."}}},
{"id":"n-8d3e9454","guard":[["has","australia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"how does the surface area of Congo compare with that of Australia":"The surface area of Congo is 342000 and that of Australia is 7741220, so Australia has the larger surface area."}}},
{"id":"n-97ba4441","guard":[["hasAny",["area","bulgaria","compare","macedonia","north","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"North Macedonia versus Bulgaria: compare their surface area":"The surface area of North Macedonia is 25713 and that of Bulgaria is 110994, so Bulgaria has the larger surface area."}}},
{"id":"n-98618d8a","guard":[["hasAny",["antilles","area","compare","netherlands","new","surface","zealand"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Netherlands Antilles compare with that of New Zealand":"The surface area of Netherlands Antilles is 800 and that of New Zealand is 270534, so New Zealand has the larger surface area."}}},
{"id":"n-9b551884","guard":[["has","mayotte"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"compare the surface area of Tunisia and Mayotte":"The surface area of Tunisia is 163610 and that of Mayotte is 373, so Tunisia has the larger surface area."}}},
{"id":"n-9e522aa8","guard":[["hasAny",["area","coast","compare","ivory","surface","ukraine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Ukraine and Ivory Coast":"The surface area of Ukraine is 603700 and that of Ivory Coast is 322463, so Ukraine has the larger surface area."}}},
{"id":"n-9eda8e61","guard":[["hasAny",["area","compare","kitts","nevis","rwanda","saint","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Rwanda compare with that of Saint Kitts and Nevis":"The surface area of Rwanda is 26338 and that of Saint Kitts and Nevis is 261, so Rwanda has the larger surface area."}}},
{"id":"n-a233eb59","guard":[["hasAny",["area","compare","futuna","helena","saint","surface","wallis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Saint Helena compare with that of Wallis and Futuna":"The surface area of Saint Helena is 314 and that of Wallis and Futuna is 200, so Saint Helena has the larger surface area."}}},
{"id":"n-a336a7b4","guard":[["hasAny",["area","compare","dominica","kazakhstan","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Dominica and Kazakhstan":"The surface area of Dominica is 751 and that of Kazakhstan is 2724900, so Kazakhstan has the larger surface area."}}},
{"id":"n-a3c0a7e3","guard":[["hasAny",["afghanistan","area","compare","gambia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Afghanistan and Gambia":"The surface area of Afghanistan is 652090 and that of Gambia is 11295, so Afghanistan has the larger surface area."}}},
{"id":"n-a40cfe32","guard":[["hasAny",["area","compare","dominica","lithuania","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Lithuania versus Dominica: compare their surface area":"The surface area of Lithuania is 65301 and that of Dominica is 751, so Lithuania has the larger surface area."}}},
{"id":"n-a62b97dc","guard":[["has","mozambique"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"compare the surface area of Mozambique and Ghana":"The surface area of Mozambique is 801590 and that of Ghana is 238533, so Mozambique has the larger surface area."}}},
{"id":"n-a8746aa8","guard":[["hasAny",["area","compare","niue","pitcairn","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Pitcairn versus Niue: compare their surface area":"The surface area of Pitcairn is 49 and that of Niue is 260, so Niue has the larger surface area."}}},
{"id":"n-ab28a5a5","guard":[["hasAny",["area","compare","iraq","romania","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Iraq versus Romania: compare their surface area":"The surface area of Iraq is 438317 and that of Romania is 238391, so Iraq has the larger surface area."}}},
{"id":"n-acca0508","guard":[["has","bulgaria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"compare the surface area of Bulgaria and Western Sahara":"The surface area of Bulgaria is 110994 and that of Western Sahara is 266000, so Western Sahara has the larger surface area."}}},
{"id":"n-ad06ee3e","guard":[["hasAny",["area","compare","lebanon","principe","sao","surface","tome"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Sao Tome and Principe and Lebanon":"The surface area of Sao Tome and Principe is 964 and that of Lebanon is 10400, so Lebanon has the larger surface area."}}},
{"id":"n-ada5aa10","guard":[["hasAny",["area","compare","guatemala","surface","uzbekistan","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Guatemala versus Uzbekistan: compare their surface area":"The surface area of Guatemala is 108889 and that of Uzbekistan is 447400, so Uzbekistan has the larger surface area."}}},
{"id":"n-b0463064","guard":[["has","antarctica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"British Virgin Islands versus Antarctica: compare their surface area":"The surface area of British Virgin Islands is 151 and that of Antarctica is 13120000, so Antarctica has the larger surface area."}}},
{"id":"n-b6cc243f","guard":[["hasAny",["area","compare","cuba","surface","zambia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Zambia and Cuba":"The surface area of Zambia is 752618 and that of Cuba is 110861, so Zambia has the larger surface area."}}},
{"id":"n-b8731559","guard":[["hasAny",["area","colombia","compare","serbia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Serbia and Colombia":"The surface area of Serbia is 88361 and that of Colombia is 1138914, so Colombia has the larger surface area."}}},
{"id":"n-bc6884cc","guard":[["hasAny",["area","australia","compare","principe","sao","surface","tome","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Australia versus Sao Tome and Principe: compare their surface area":"The surface area of Australia is 7741220 and that of Sao Tome and Principe is 964, so Australia has the larger surface area."}}},
{"id":"n-bce2dd33","guard":[["hasAny",["area","bahrain","compare","reunion","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Reunion and Bahrain":"The surface area of Reunion is 2510 and that of Bahrain is 694, so Reunion has the larger surface area."}}},
{"id":"n-c02a4710","guard":[["hasAny",["area","compare","surface","togo","versus","zambia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Togo versus Zambia: compare their surface area":"The surface area of Togo is 56785 and that of Zambia is 752618, so Zambia has the larger surface area."}}},
{"id":"n-c02c5f9f","guard":[["hasAny",["australia","versus"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Australia versus Sao Tome and Principe: compare their surface area":"The surface area of Australia is 7741220 and that of Sao Tome and Principe is 964, so Australia has the larger surface area."}}},
{"id":"n-c34efc3d","guard":[["hasAny",["area","compare","kiribati","surface","zimbabwe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Kiribati compare with that of Zimbabwe":"The surface area of Kiribati is 726 and that of Zimbabwe is 390757, so Zimbabwe has the larger surface area."}}},
{"id":"n-c503de32","guard":[["hasAny",["area","cayman","compare","french","islands","southern","surface","territories"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of French Southern territories compare with that of Cayman Islands":"The surface area of French Southern territories is 7780 and that of Cayman Islands is 264, so French Southern territories has the larger surface area."}}},
{"id":"n-c517bba8","guard":[["hasAny",["area","british","compare","islands","surface","switzerland","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Switzerland compare with that of British Virgin Islands":"The surface area of Switzerland is 41284 and that of British Virgin Islands is 151, so Switzerland has the larger surface area."}}},
{"id":"n-c602b8e5","guard":[["hasAny",["area","canada","compare","french","polynesia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Canada compare with that of French Polynesia":"The surface area of Canada is 9970610 and that of French Polynesia is 4000, so Canada has the larger surface area."}}},
{"id":"n-c7aa78ce","guard":[["has","panama"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Iceland versus Panama: compare their surface area":"The surface area of Iceland is 103000 and that of Panama is 75517, so Iceland has the larger surface area."}}},
{"id":"n-c8615ec3","guard":[["hasAny",["area","compare","surface","uganda","versus","zimbabwe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Zimbabwe versus Uganda: compare their surface area":"The surface area of Zimbabwe is 390757 and that of Uganda is 241038, so Zimbabwe has the larger surface area."}}},
{"id":"n-c98ea052","guard":[["hasAny",["afghanistan","area","compare","futuna","surface","versus","wallis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Wallis and Futuna versus Afghanistan: compare their surface area":"The surface area of Wallis and Futuna is 200 and that of Afghanistan is 652090, so Afghanistan has the larger surface area."}}},
{"id":"n-c9fc232e","guard":[["hasAny",["arab","area","compare","emirates","surface","united","vanuatu","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Vanuatu versus United Arab Emirates: compare their surface area":"The surface area of Vanuatu is 12189 and that of United Arab Emirates is 83600, so United Arab Emirates has the larger surface area."}}},
{"id":"n-cb6f6ac0","guard":[["hasAny",["area","compare","congo","surface","uganda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Uganda and Congo":"The surface area of Uganda is 241038 and that of Congo is 342000, so Congo has the larger surface area."}}},
{"id":"n-cd1fd165","guard":[["hasAny",["area","compare","mauritania","nepal","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Mauritania and Nepal":"The surface area of Mauritania is 1025520 and that of Nepal is 147181, so Mauritania has the larger surface area."}}},
{"id":"n-cf76c02e","guard":[["hasAny",["area","coast","compare","guatemala","ivory","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Ivory Coast compare with that of Guatemala":"The surface area of Ivory Coast is 322463 and that of Guatemala is 108889, so Ivory Coast has the larger surface area."}}},
{"id":"n-d04b1020","guard":[["hasAny",["area","bermuda","compare","paraguay","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Paraguay and Bermuda":"The surface area of Paraguay is 406752 and that of Bermuda is 53, so Paraguay has the larger surface area."}}},
{"id":"n-d37f9491","guard":[["hasAny",["area","compare","egypt","surface","versus","vietnam"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Egypt versus Vietnam: compare their surface area":"The surface area of Egypt is 1001449 and that of Vietnam is 331689, so Egypt has the larger surface area."}}},
{"id":"n-d3b1874b","guard":[["hasAny",["area","compare","mayotte","surface","tunisia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Tunisia and Mayotte":"The surface area of Tunisia is 163610 and that of Mayotte is 373, so Tunisia has the larger surface area."}}},
{"id":"n-d69a76a0","guard":[["hasAny",["area","compare","cuba","lithuania","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Cuba compare with that of Lithuania":"The surface area of Cuba is 110861 and that of Lithuania is 65301, so Cuba has the larger surface area."}}},
{"id":"n-d8349bfe","guard":[["hasAny",["area","bahrain","compare","iraq","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Bahrain compare with that of Iraq":"The surface area of Bahrain is 694 and that of Iraq is 438317, so Iraq has the larger surface area."}}},
{"id":"n-da93bc7e","guard":[["hasAny",["area","compare","kitts","mozambique","nevis","saint","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Saint Kitts and Nevis versus Mozambique: compare their surface area":"The surface area of Saint Kitts and Nevis is 261 and that of Mozambique is 801590, so Mozambique has the larger surface area."}}},
{"id":"n-dc1f84a9","guard":[["hasAny",["angola","area","compare","surface","tonga"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Tonga and Angola":"The surface area of Tonga is 650 and that of Angola is 1246700, so Angola has the larger surface area."}}},
{"id":"n-df7e0abc","guard":[["hasAny",["area","cambodia","compare","el","salvador","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the surface area of Cambodia compare with that of El Salvador":"The surface area of Cambodia is 181035 and that of El Salvador is 21041, so Cambodia has the larger surface area."}}},
{"id":"n-e221051a","guard":[["hasAny",["area","compare","new","nigeria","surface","versus","zealand"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"New Zealand versus Nigeria: compare their surface area":"The surface area of New Zealand is 270534 and that of Nigeria is 923768, so Nigeria has the larger surface area."}}},
{"id":"n-e49a08d4","guard":[["hasAny",["area","compare","islands","mariana","northern","romania","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Romania and Northern Mariana Islands":"The surface area of Romania is 238391 and that of Northern Mariana Islands is 464, so Romania has the larger surface area."}}},
{"id":"n-e5256bf4","guard":[["hasAny",["area","compare","finland","surface","vietnam"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Vietnam and Finland":"The surface area of Vietnam is 331689 and that of Finland is 338145, so Finland has the larger surface area."}}},
{"id":"n-e6a63941","guard":[["hasAny",["area","armenia","compare","norway","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of Armenia and Norway":"The surface area of Armenia is 29800 and that of Norway is 323877, so Norway has the larger surface area."}}},
{"id":"n-e769a897","guard":[["hasAny",["area","compare","french","southern","states","surface","territories","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the surface area of United States and French Southern territories":"The surface area of United States is 9363520 and that of French Southern territories is 7780, so United States has the larger surface area."}}},
{"id":"n-e9969977","guard":[["hasAny",["area","compare","france","surface","ukraine","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"France versus Ukraine: compare their surface area":"The surface area of France is 551500 and that of Ukraine is 603700, so Ukraine has the larger surface area."}}},
{"id":"n-ed7cd2d0","guard":[["hasAny",["area","armenia","aruba","compare","surface","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Aruba versus Armenia: compare their surface area":"The surface area of Aruba is 193 and that of Armenia is 29800, so Armenia has the larger surface area."}}},
{"id":"n-fcc7e3a7","guard":[["has","tonga"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"compare the surface area of Tonga and Angola":"The surface area of Tonga is 650 and that of Angola is 1246700, so Angola has the larger surface area."}}},
{"id":"n-07f0b67e","guard":[["hasAny",["lower case","lowercase","shortest","shortest one","shortest word","small letters","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface area."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-58dc7693","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so Angola has the larger surface ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-78bb248a","guard":[["hasAny",["element","item number","mayotte","nth","position","shortest","shortest one","shortest word"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface area."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-d9bafe9d","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface area of Tonga is 650 and that of ",{"slot":0}," is 1246700, so ",{"slot":1}," has the larger surface ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ec09af6c","guard":[["hasAny",["element","item number","mayotte","nth","position","shortest","shortest one","shortest word"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tunisia is 163610 and that of ",{"slot":1}," is 373, so Tunisia has the larger surface ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0824e770","guard":[["hasAny",["lower case","lowercase","shortest","shortest one","shortest word","small letters","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4dd0bd9d","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["sense.subject"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-563bafb0","guard":[["hasAny",["element","item number","mayotte","nth","position"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," area of Tunisia is 163610 and that of ",{"slot":1}," is 373, so Tunisia has the larger surface ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9a96ec47","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ac5377c5","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of Angola is 1246700, so ",{"slot":1}," has the larger surface ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-041b310a","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-095432e9","guard":[["hasAny",["element","item number","mayotte","nth","position","shortest","shortest one","shortest word"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0adb17bc","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["sense.subject"],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-79d1b38c","guard":[["hasAny",["element","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8d805912","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ca4c9497","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","shortest","shortest one","shortest word","title case","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d4ff3ca3","guard":[["hasAny",["element","item number","mayotte","nth","position","shortest","shortest one","shortest word"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e88b3802","guard":[["hasAny",["element","item number","mayotte","nth","position","shortest","shortest one","shortest word"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of Mayotte is 373, so Tunisia has the larger surface ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f2a93309","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","shortest","shortest one","shortest word","tonga","upper case","uppercase"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-017ac2ac","guard":[["hasAny",["british","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","how"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," is 41284 and that of ",{"slot":2}," Virgin ",{"slot":3}," is 151, so Switzerland has the larger surface area."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":12}],["sense.lastWord"]],"mem":null},
{"id":"n-01f27c21","guard":[["hasAny",["element","item number","macedonia","nth","position","shortest","shortest one","shortest word"]],["has","surface"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," is 1267000 and that of ",{"slot":2}," ",{"slot":3}," is 25713, so Niger has the larger surface area."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":12}],["sense.lastWord"]],"mem":null},
{"id":"n-1c45a399","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","mayotte","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.upper",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2a01b05c","guard":[["hasAny",["element","item number","mayotte","nth","position","shortest","shortest one","shortest word"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-2c798a25","guard":[["hasAny",["canada","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","how"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," is 9970610 and that of ",{"slot":2}," ",{"slot":3}," is 4000, so Canada has the larger surface area."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":12}],["sense.lastWord"]],"mem":null},
{"id":"n-369b126f","guard":[["hasAny",["element","invert case","item number","mayotte","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-39fd037f","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","tonga","upper case","uppercase"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.upper",["sense.lastWord"]],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4655f08c","guard":[["hasAny",["element","item number","niue","nth","position","shortest","shortest one","shortest word"]],["has","pitcairn"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Pitcairn is 49 and that of ",{"slot":1}," is 260, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-4727a49f","guard":[["hasAny",["element","iraq","item number","nth","position","shortest","shortest one","shortest word"]],["has","versus"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," is 438317 and that of ",{"slot":2}," is 238391, so Iraq has the larger surface ",{"slot":3},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-5a416410","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mayotte","nth","position","shortest","shortest one","shortest word","title case"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.title",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6a53d987","guard":[["hasAny",["element","item number","nepal","nth","position","shortest","shortest one","shortest word"]],["has","how"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," is 147181 and that of ",{"slot":2}," ",{"slot":3}," is 28896, so Nepal has the larger surface area."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":12}],["sense.lastWord"]],"mem":null},
{"id":"n-7174370b","guard":[["hasAny",["chad","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","versus"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," is 1284000 and that of ",{"slot":2}," is 112622, so Chad has the larger surface ",{"slot":3},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-7306cbe8","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-976d6de5","guard":[["hasAny",["element","item number","mayotte","nth","position","shortest","shortest one","shortest word"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9fa6ffce","guard":[["hasAny",["element","item number","lower case","lowercase","mayotte","nth","position","shortest","shortest one","shortest word","small letters"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.lower",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a1de4f10","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","togo"]]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," is 56785 and that of ",{"slot":2}," is 752618, so Zambia has the larger surface ",{"slot":3},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-a3394b59","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a3f84095","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.lastWord"],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b1612446","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b501aed8","guard":[["hasAny",["each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ba3dce74","guard":[["hasAny",["element","germany","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," is 357022 and that of ",{"slot":2}," States Minor Outlying ",{"slot":3}," is 16, so Germany has the larger surface area."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":12}],["sense.lastWord"]],"mem":null},
{"id":"n-bdbc1e82","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","title case","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c2dc9081","guard":[["hasAny",["element","invert case","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","swap case","toggle case","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cc3418ca","guard":[["hasAny",["each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e8c384ea","guard":[["hasAny",["element","item number","mayotte","nth","position","shortest","shortest one","shortest word"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["sense.subject"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f354b620","guard":[["hasAny",["costa","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","how"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," is 449964 and that of ",{"slot":2}," ",{"slot":3}," is 51100, so Sweden has the larger surface area."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":12}],["sense.lastWord"]],"mem":null},
{"id":"n-f96027c8","guard":[["hasAny",["element","item number","kitts","nth","position","shortest","shortest one","shortest word"]],["has","how"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," is 26338 and that of ",{"slot":2}," Kitts and ",{"slot":3}," is 261, so Rwanda has the larger surface area."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":12}],["sense.lastWord"]],"mem":null},
{"id":"n-0134381c","guard":[["hasAny",["element","italy","item number","nth","position"]],["has","versus"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Italy is 301316 and that of ",{"slot":2}," is 406752, so Paraguay has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-018a8540","guard":[["hasAny",["armenia","element","item number","nth","position"]],["has","aruba"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Aruba is 193 and that of ",{"slot":2}," is 29800, so Armenia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-04a04944","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-069ef164","guard":[["hasAny",["element","item number","nth","panama","position"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Panama is 75517 and that of ",{"slot":1}," and ",{"slot":2}," ",{"slot":3}," is 62422, so Panama has the larger surface area."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-13424383","guard":[["hasAny",["chad","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","versus"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," is 1284000 and that of ",{"slot":2}," is 112622, so Chad has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-281b0e4e","guard":[["hasAny",["element","invert case","item number","mayotte","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-337211a2","guard":[["hasAny",["element","item number","lower case","lowercase","niue","nth","position","shortest","shortest one","shortest word","small letters"]],["has","pitcairn"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Pitcairn is 49 and that of ",{"slot":1}," is 260, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-34ac52bd","guard":[["hasAny",["element","france","item number","nth","position"]],["has","versus"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of France is 551500 and that of ",{"slot":2}," is 603700, so Ukraine has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-3c83b46b","guard":[["hasAny",["element","item number","nth","position","vietnam"]],["has","egypt"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Egypt is 1001449 and that of ",{"slot":2}," is 331689, so Egypt has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-40a76685","guard":[["hasAny",["element","item number","mayotte","nth","position"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-40f4d6e8","guard":[["hasAny",["dominica","element","item number","nth","position"]],["has","versus"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Lithuania is 65301 and that of ",{"slot":2}," is 751, so Lithuania has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-4a119aae","guard":[["hasAny",["element","item number","malaysia","nth","position"]],["has","versus"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Malaysia is 329758 and that of ",{"slot":2}," is 88361, so Malaysia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-555a0690","guard":[["hasAny",["element","item number","nth","position","uganda"]],["has","zimbabwe"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Zimbabwe is 390757 and that of ",{"slot":2}," is 241038, so Zimbabwe has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-6ff5f3ee","guard":[["hasAny",["cambodia","element","item number","nth","position"]],["has","how"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," area of ",{"slot":1}," is 181035 and that of ",{"slot":2}," ",{"slot":3}," is 21041, so Cambodia has the larger surface area."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":12}],["sense.lastWord"]],"mem":null},
{"id":"n-8f85f849","guard":[["hasAny",["belize","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Gibraltar is 6 and that of ",{"slot":2}," is 22696, so Belize has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-a05216be","guard":[["hasAny",["each word","element","item number","mayotte","nth","position","shortest","shortest one","shortest word","split into words"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a82b0bae","guard":[["hasAny",["azerbaijan","element","item number","nth","position"]],["has","versus"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Azerbaijan is 86600 and that of ",{"slot":2}," is 91982, so Portugal has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-abe468a8","guard":[["hasAny",["each word","element","item number","mayotte","nth","position","shortest","shortest one","shortest word","split into words"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b4b5c994","guard":[["hasAny",["element","iceland","item number","nth","position"]],["has","versus"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Iceland is 103000 and that of ",{"slot":2}," is 75517, so Iceland has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-b7f2bdde","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","mayotte","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c2a21804","guard":[["hasAny",["element","iraq","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","versus"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," is 438317 and that of ",{"slot":2}," is 238391, so Iraq has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c37ebfff","guard":[["hasAny",["element","indonesia","item number","nth","position"]],["has","versus"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Indonesia is 1904569 and that of ",{"slot":2}," is 377829, so Indonesia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-c788545b","guard":[["hasAny",["element","item number","mayotte","nth","position"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c82c1c88","guard":[["hasAny",["element","item number","lower case","lowercase","mayotte","nth","position","shortest","shortest one","shortest word","small letters"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d4b89216","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mayotte","nth","position","shortest","shortest one","shortest word","title case"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d6fdce6c","guard":[["hasAny",["element","item number","nth","position","uzbekistan"]],["has","guatemala"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Guatemala is 108889 and that of ",{"slot":2}," is 447400, so Uzbekistan has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":6}]],"mem":null},
{"id":"n-dea39eab","guard":[["hasAny",["each word","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","split into words","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f9348c02","guard":[["hasAny",["each word","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","split into words","tonga"]],["has","compare"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of Tonga is 650 and that of ",{"slot":1}," is 1246700, so ",{"slot":2}," has the larger surface ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fef2a0a8","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","togo"]]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," is 56785 and that of ",{"slot":2}," is 752618, so Zambia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1af60902","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","uganda"]],["has","zimbabwe"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Zimbabwe is 390757 and that of ",{"slot":2}," is 241038, so Zimbabwe has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2edcbb4f","guard":[["hasAny",["element","indonesia","item number","nth","position","shortest","shortest one","shortest word"]],["has","versus"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Indonesia is 1904569 and that of ",{"slot":2}," is 377829, so Indonesia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4372e3c2","guard":[["hasAny",["azerbaijan","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","versus"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Azerbaijan is 86600 and that of ",{"slot":2}," is 91982, so Portugal has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-711ba36e","guard":[["hasAny",["element","item number","mayotte","nth","position","shortest","shortest one","shortest word"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-71ef6b10","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","uzbekistan"]],["has","guatemala"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Guatemala is 108889 and that of ",{"slot":2}," is 447400, so Uzbekistan has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-84b50a68","guard":[["hasAny",["armenia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","aruba"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Aruba is 193 and that of ",{"slot":2}," is 29800, so Armenia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-88248f0a","guard":[["hasAny",["element","iceland","item number","nth","position","shortest","shortest one","shortest word"]],["has","versus"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Iceland is 103000 and that of ",{"slot":2}," is 75517, so Iceland has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9c08b8f8","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","vietnam"]],["has","egypt"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Egypt is 1001449 and that of ",{"slot":2}," is 331689, so Egypt has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b96f53c9","guard":[["hasAny",["each word","element","item number","mayotte","nth","position","shortest","shortest one","shortest word","split into words"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bf266b59","guard":[["hasAny",["element","france","item number","nth","position","shortest","shortest one","shortest word"]],["has","versus"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of France is 551500 and that of ",{"slot":2}," is 603700, so Ukraine has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c9d3d868","guard":[["hasAny",["element","italy","item number","nth","position","shortest","shortest one","shortest word"]],["has","versus"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Italy is 301316 and that of ",{"slot":2}," is 406752, so Paraguay has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cfbdf837","guard":[["hasAny",["each word","element","item number","mayotte","nth","position","shortest","shortest one","shortest word","split into words"]],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is 163610 and that of ",{"slot":2}," is 373, so Tunisia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-db6d2f51","guard":[["hasAny",["dominica","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","versus"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Lithuania is 65301 and that of ",{"slot":2}," is 751, so Lithuania has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e9650af0","guard":[["hasAny",["element","item number","malaysia","nth","position","shortest","shortest one","shortest word"]],["has","versus"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Malaysia is 329758 and that of ",{"slot":2}," is 88361, so Malaysia has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fd4bae6b","guard":[["hasAny",["belize","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Gibraltar is 6 and that of ",{"slot":2}," is 22696, so Belize has the larger surface ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"compare the surface area of Yemen and Saint Helena","expect":{"contains":["527968","314","Yemen"],"notRefusal":true}},{"q":"compare the surface area of Portugal and Faroe Islands","expect":{"contains":["91982","1399","Portugal"],"notRefusal":true}},{"q":"Aruba versus Armenia: compare their surface area","expect":{"contains":["193","29800","Armenia"],"notRefusal":true}},{"q":"Peru versus Yemen: compare their surface area","expect":{"contains":["1285216","527968","Peru"],"notRefusal":true}},{"q":"compare the surface area of Vietnam and Finland","expect":{"contains":["331689","338145","Finland"],"notRefusal":true}},{"q":"how does the surface area of Bahrain compare with that of Iraq","expect":{"contains":["694","438317","Iraq"],"notRefusal":true}},{"q":"compare the surface area of Antarctica and Jamaica","expect":{"contains":["13120000","10990","Antarctica"],"notRefusal":true}},{"q":"compare the surface area of Nigeria and Rwanda","expect":{"contains":["923768","26338","Nigeria"],"notRefusal":true}},{"q":"Cayman Islands versus Algeria: compare their surface area","expect":{"contains":["264","2381741","Algeria"],"notRefusal":true}},{"q":"Iraq versus Romania: compare their surface area","expect":{"contains":["438317","238391","Iraq"],"notRefusal":true}},{"q":"how does the surface area of Canada compare with that of French Polynesia","expect":{"contains":["9970610","4000","Canada"],"notRefusal":true}},{"q":"compare the surface area of Tonga and Angola","expect":{"contains":["650","1246700","Angola"],"notRefusal":true}},{"q":"how does the surface area of Rwanda compare with that of Saint Kitts and Nevis","expect":{"contains":["26338","261","Rwanda"],"notRefusal":true}},{"q":"Wallis and Futuna versus Afghanistan: compare their surface area","expect":{"contains":["200","652090","Afghanistan"],"notRefusal":true}},{"q":"compare the surface area of Tunisia and Mayotte","expect":{"contains":["163610","373","Tunisia"],"notRefusal":true}},{"q":"how does the surface area of Kazakhstan compare with that of Iceland","expect":{"contains":["2724900","103000","Kazakhstan"],"notRefusal":true}},{"q":"French Guiana versus United States: compare their surface area","expect":{"contains":["90000","9363520","United States"],"notRefusal":true}},{"q":"how does the surface area of Saint Helena compare with that of Wallis and Futuna","expect":{"contains":["314","200","Saint Helena"],"notRefusal":true}},{"q":"compare the surface area of Mauritania and Nepal","expect":{"contains":["1025520","147181","Mauritania"],"notRefusal":true}},{"q":"France versus Ukraine: compare their surface area","expect":{"contains":["551500","603700","Ukraine"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
