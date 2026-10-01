// country-population-larger-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"country-population-larger-neo-g6","class":"country-population-larger","generation":6,"lane":"neo","grownFrom":["which has the larger population, British Indian Ocean Territory or Eswatini","between Chile and Turks and Caicos Islands, which has the greater population","whose population is larger: Reunion or Saint Vincent and the Grenadines","between Honduras and Wallis and Futuna, which has the greater population","between New Caledonia and Djibouti, which has the greater population","whose population is larger: Lesotho or Afghanistan","whose population is larger: Angola or Central African Republic","between Armenia and United Arab Emirates, which has the greater population","whose population is larger: Paraguay or Equatorial Guinea","which has the larger population, Ivory Coast or Armenia","which has the larger population, Ghana or Turkey","between Serbia and Sudan, which has the greater population","between Greece and Guyana, which has the greater population","which has the larger population, Rwanda or Tunisia","between Eswatini and Myanmar, which has the greater population","which has the larger population, Portugal or Cuba","between Svalbard and Jan Mayen and Guinea, which has the greater population","whose population is larger: United Arab Emirates or Bolivia","which has the larger population, Malaysia or Seychelles","between United States Minor Outlying Islands and Lesotho, which has the greater population"],"version":1});

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
{"id":"n-64279d81","guard":[["has","population"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, British Indian Ocean Territory or Eswatini":"Eswatini has the larger population (1136191 against 0).","between Chile and Turks and Caicos Islands, which has the greater population":"Chile has the larger population (18729160 against 37665).","whose population is larger: Reunion or Saint Vincent and the Grenadines":"Reunion has the larger population (859959 against 110210).","between Honduras and Wallis and Futuna, which has the greater population":"Honduras has the larger population (9587522 against 15289).","between New Caledonia and Djibouti, which has the greater population":"Djibouti has the larger population (958920 against 284060).","whose population is larger: Lesotho or Afghanistan":"Afghanistan has the larger population (37172386 against 2108132).","whose population is larger: Angola or Central African Republic":"Angola has the larger population (30809762 against 4666377).","between Armenia and United Arab Emirates, which has the greater population":"United Arab Emirates has the larger population (9630959 against 2951776).","whose population is larger: Paraguay or Equatorial Guinea":"Paraguay has the larger population (6956071 against 1308974).","which has the larger population, Ivory Coast or Armenia":"Ivory Coast has the larger population (25069229 against 2951776).","which has the larger population, Ghana or Turkey":"Turkey has the larger population (82319724 against 29767108).","between Serbia and Sudan, which has the greater population":"Sudan has the larger population (41801533 against 6963764).","between Greece and Guyana, which has the greater population":"Greece has the larger population (10731726 against 779004).","which has the larger population, Rwanda or Tunisia":"Rwanda has the larger population (12301939 against 11565204).","between Eswatini and Myanmar, which has the greater population":"Myanmar has the larger population (53708395 against 1136191).","which has the larger population, Portugal or Cuba":"Cuba has the larger population (11338138 against 10283822).","between Svalbard and Jan Mayen and Guinea, which has the greater population":"Guinea has the larger population (12414318 against 2572).","whose population is larger: United Arab Emirates or Bolivia":"Bolivia has the larger population (11353142 against 9630959).","which has the larger population, Malaysia or Seychelles":"Malaysia has the larger population (31528585 against 96762).","between United States Minor Outlying Islands and Lesotho, which has the greater population":"Lesotho has the larger population (2108132 against 300).","between Tokelau and Aruba, which has the greater population":"Aruba has the larger population (105845 against 1411).","whose population is larger: Antigua and Barbuda or Canada":"Canada has the larger population (37057765 against 96286).","between Russia and Angola, which has the greater population":"Russia has the larger population (144478050 against 30809762).","whose population is larger: Saint Kitts and Nevis or French Guiana":"French Guiana has the larger population (290691 against 52441).","between Cuba and Paraguay, which has the greater population":"Cuba has the larger population (11338138 against 6956071).","whose population is larger: Macao or Bangladesh":"Bangladesh has the larger population (161356039 against 631636).","which has the larger population, Bermuda or Faroe Islands":"Bermuda has the larger population (63973 against 48497).","which has the larger population, Ireland or Serbia":"Serbia has the larger population (6963764 against 4867309).","which has the larger population, Senegal or Martinique":"Senegal has the larger population (15854360 against 376480).","whose population is larger: Guinea or Mexico":"Mexico has the larger population (126190788 against 12414318).","between Martinique and Spain, which has the greater population":"Spain has the larger population (46796540 against 376480).","whose population is larger: Burkina Faso or Rwanda":"Burkina Faso has the larger population (19751535 against 12301939).","between Sierra Leone and Iceland, which has the greater population":"Sierra Leone has the larger population (7650154 against 352721).","between Benin and Reunion, which has the greater population":"Benin has the larger population (11485048 against 859959).","which has the larger population, Saint Vincent and the Grenadines or Algeria":"Algeria has the larger population (42228429 against 110210).","which has the larger population, Bangladesh or Tokelau":"Bangladesh has the larger population (161356039 against 1411).","whose population is larger: Kuwait or Ivory Coast":"Ivory Coast has the larger population (25069229 against 4137309).","which has the larger population, Nauru or Russia":"Russia has the larger population (144478050 against 12704).","which has the larger population, Sri Lanka or Anguilla":"Sri Lanka has the larger population (21670000 against 15094).","whose population is larger: Djibouti or Bermuda":"Djibouti has the larger population (958920 against 63973).","between Algeria and Kuwait, which has the greater population":"Algeria has the larger population (42228429 against 4137309).","between India and Macao, which has the greater population":"India has the larger population (1352617328 against 631636).","which has the larger population, Northern Mariana Islands or Chile":"Chile has the larger population (18729160 against 56882).","whose population is larger: Guyana or Sri Lanka":"Sri Lanka has the larger population (21670000 against 779004).","whose population is larger: San Marino or Portugal":"Portugal has the larger population (10283822 against 33785).","which has the larger population, East Timor or Honduras":"Honduras has the larger population (9587522 against 1267972).","whose population is larger: Uganda or Malaysia":"Uganda has the larger population (42723139 against 31528585).","whose population is larger: Spain or Germany":"Germany has the larger population (82905782 against 46796540).","whose population is larger: Mauritania or Senegal":"Senegal has the larger population (15854360 against 4403319).","between Guatemala and Andorra, which has the greater population":"Guatemala has the larger population (17247807 against 77006).","which has the larger population, Pitcairn or Lithuania":"Lithuania has the larger population (2801543 against 67).","which has the larger population, Germany or New Caledonia":"Germany has the larger population (82905782 against 284060).","whose population is larger: Iraq or Finland":"Iraq has the larger population (38433600 against 5515525).","which has the larger population, Bahamas or Sierra Leone":"Sierra Leone has the larger population (7650154 against 385640).","which has the larger population, Afghanistan or Grenada":"Afghanistan has the larger population (37172386 against 111454).","whose population is larger: Saudi Arabia or Latvia":"Saudi Arabia has the larger population (33699947 against 1927174).","whose population is larger: Venezuela or Cocos (Keeling) Islands":"Venezuela has the larger population (28870195 against 596).","whose population is larger: Liechtenstein or Suriname":"Suriname has the larger population (575991 against 37910).","between Nepal and El Salvador, which has the greater population":"Nepal has the larger population (28087871 against 6420744).","between North Macedonia and South Korea, which has the greater population":"South Korea has the larger population (51606633 against 2084367).","which has the larger population, Ethiopia or Benin":"Ethiopia has the larger population (109224559 against 11485048).","which has the larger population, Suriname or Italy":"Italy has the larger population (60421760 against 575991).","which has the larger population, Canada or Greece":"Canada has the larger population (37057765 against 10731726).","between Poland and Brazil, which has the greater population":"Brazil has the larger population (209469333 against 37974750).","whose population is larger: Pakistan or Ireland":"Pakistan has the larger population (212215030 against 4867309).","whose population is larger: Turks and Caicos Islands or Lebanon":"Lebanon has the larger population (6848925 against 37665).","which has the larger population, Latvia or Saint Helena":"Latvia has the larger population (1927174 against 6600).","whose population is larger: Aruba or Pitcairn":"Aruba has the larger population (105845 against 67).","which has the larger population, Lebanon or Cabo Verde":"Lebanon has the larger population (6848925 against 555987).","which has the larger population, French Guiana or Guatemala":"Guatemala has the larger population (17247807 against 290691).","whose population is larger: El Salvador or Ghana":"Ghana has the larger population (29767108 against 6420744).","which has the larger population, Bolivia or Japan":"Japan has the larger population (126529100 against 11353142).","between Anguilla and Pakistan, which has the greater population":"Pakistan has the larger population (212215030 against 15094).","whose population is larger: Antarctica or East Timor":"East Timor has the larger population (1267972 against 1106).","between Lithuania and Saint Kitts and Nevis, which has the greater population":"Lithuania has the larger population (2801543 against 52441).","which has the larger population, Finland or Nepal":"Nepal has the larger population (28087871 against 5515525).","which has the larger population, Cocos (Keeling) Islands or Poland":"Poland has the larger population (37974750 against 596).","between Nigeria and Uganda, which has the greater population":"Nigeria has the larger population (195874740 against 42723139).","whose population is larger: Andorra or British Indian Ocean Territory":"Andorra has the larger population (77006 against 0).","which has the larger population, Cambodia or United States Minor Outlying Islands":"Cambodia has the larger population (16249798 against 300).","which has the larger population, Slovakia or Nigeria":"Nigeria has the larger population (195874740 against 5446771).","between Tunisia and Antarctica, which has the greater population":"Tunisia has the larger population (11565204 against 1106).","which has the larger population, Central African Republic or India":"India has the larger population (1352617328 against 4666377).","whose population is larger: Myanmar or Romania":"Myanmar has the larger population (53708395 against 19466145).","between Faroe Islands and Iraq, which has the greater population":"Iraq has the larger population (38433600 against 48497).","between Saint Helena and Liechtenstein, which has the greater population":"Liechtenstein has the larger population (37910 against 6600).","whose population is larger: Wallis and Futuna or Slovakia":"Slovakia has the larger population (5446771 against 15289).","between Cabo Verde and Saudi Arabia, which has the greater population":"Saudi Arabia has the larger population (33699947 against 555987).","between Japan and San Marino, which has the greater population":"Japan has the larger population (126529100 against 33785).","between Grenada and Mauritania, which has the greater population":"Mauritania has the larger population (4403319 against 111454).","whose population is larger: Sudan or Nauru":"Sudan has the larger population (41801533 against 12704).","between Seychelles and Venezuela, which has the greater population":"Venezuela has the larger population (28870195 against 96762).","whose population is larger: South Korea or Cambodia":"South Korea has the larger population (51606633 against 16249798).","which has the larger population, Romania or Svalbard and Jan Mayen":"Romania has the larger population (19466145 against 2572).","which has the larger population, Equatorial Guinea or North Macedonia":"North Macedonia has the larger population (2084367 against 1308974).","between Italy and Burkina Faso, which has the greater population":"Italy has the larger population (60421760 against 19751535).","whose population is larger: Iceland or Northern Mariana Islands":"Iceland has the larger population (352721 against 56882).","which has the larger population, Mexico or Bhutan":"Mexico has the larger population (126190788 against 754394).","whose population is larger: Brazil or Ethiopia":"Brazil has the larger population (209469333 against 109224559).","between Turkey and Antigua and Barbuda, which has the greater population":"Turkey has the larger population (82319724 against 96286)."}}},
{"id":"n-8bc13c29","guard":[["has","population"],["not",["has","of"]],["not",["has","lesser"]],["not",["has","smaller"]],["not",["has","compare"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, British Indian Ocean Territory or Eswatini":"Eswatini has the larger population (1136191 against 0).","between Chile and Turks and Caicos Islands, which has the greater population":"Chile has the larger population (18729160 against 37665).","whose population is larger: Reunion or Saint Vincent and the Grenadines":"Reunion has the larger population (859959 against 110210).","between Honduras and Wallis and Futuna, which has the greater population":"Honduras has the larger population (9587522 against 15289).","between New Caledonia and Djibouti, which has the greater population":"Djibouti has the larger population (958920 against 284060).","whose population is larger: Lesotho or Afghanistan":"Afghanistan has the larger population (37172386 against 2108132).","whose population is larger: Angola or Central African Republic":"Angola has the larger population (30809762 against 4666377).","between Armenia and United Arab Emirates, which has the greater population":"United Arab Emirates has the larger population (9630959 against 2951776).","whose population is larger: Paraguay or Equatorial Guinea":"Paraguay has the larger population (6956071 against 1308974).","which has the larger population, Ivory Coast or Armenia":"Ivory Coast has the larger population (25069229 against 2951776).","which has the larger population, Ghana or Turkey":"Turkey has the larger population (82319724 against 29767108).","between Serbia and Sudan, which has the greater population":"Sudan has the larger population (41801533 against 6963764).","between Greece and Guyana, which has the greater population":"Greece has the larger population (10731726 against 779004).","which has the larger population, Rwanda or Tunisia":"Rwanda has the larger population (12301939 against 11565204).","between Eswatini and Myanmar, which has the greater population":"Myanmar has the larger population (53708395 against 1136191).","which has the larger population, Portugal or Cuba":"Cuba has the larger population (11338138 against 10283822).","between Svalbard and Jan Mayen and Guinea, which has the greater population":"Guinea has the larger population (12414318 against 2572).","whose population is larger: United Arab Emirates or Bolivia":"Bolivia has the larger population (11353142 against 9630959).","which has the larger population, Malaysia or Seychelles":"Malaysia has the larger population (31528585 against 96762).","between United States Minor Outlying Islands and Lesotho, which has the greater population":"Lesotho has the larger population (2108132 against 300).","between Tokelau and Aruba, which has the greater population":"Aruba has the larger population (105845 against 1411).","whose population is larger: Antigua and Barbuda or Canada":"Canada has the larger population (37057765 against 96286).","between Russia and Angola, which has the greater population":"Russia has the larger population (144478050 against 30809762).","whose population is larger: Saint Kitts and Nevis or French Guiana":"French Guiana has the larger population (290691 against 52441).","between Cuba and Paraguay, which has the greater population":"Cuba has the larger population (11338138 against 6956071).","whose population is larger: Macao or Bangladesh":"Bangladesh has the larger population (161356039 against 631636).","which has the larger population, Bermuda or Faroe Islands":"Bermuda has the larger population (63973 against 48497).","which has the larger population, Ireland or Serbia":"Serbia has the larger population (6963764 against 4867309).","which has the larger population, Senegal or Martinique":"Senegal has the larger population (15854360 against 376480).","whose population is larger: Guinea or Mexico":"Mexico has the larger population (126190788 against 12414318).","between Martinique and Spain, which has the greater population":"Spain has the larger population (46796540 against 376480).","whose population is larger: Burkina Faso or Rwanda":"Burkina Faso has the larger population (19751535 against 12301939).","between Sierra Leone and Iceland, which has the greater population":"Sierra Leone has the larger population (7650154 against 352721).","between Benin and Reunion, which has the greater population":"Benin has the larger population (11485048 against 859959).","which has the larger population, Saint Vincent and the Grenadines or Algeria":"Algeria has the larger population (42228429 against 110210).","which has the larger population, Bangladesh or Tokelau":"Bangladesh has the larger population (161356039 against 1411).","whose population is larger: Kuwait or Ivory Coast":"Ivory Coast has the larger population (25069229 against 4137309).","which has the larger population, Nauru or Russia":"Russia has the larger population (144478050 against 12704).","which has the larger population, Sri Lanka or Anguilla":"Sri Lanka has the larger population (21670000 against 15094).","whose population is larger: Djibouti or Bermuda":"Djibouti has the larger population (958920 against 63973).","between Algeria and Kuwait, which has the greater population":"Algeria has the larger population (42228429 against 4137309).","between India and Macao, which has the greater population":"India has the larger population (1352617328 against 631636).","which has the larger population, Northern Mariana Islands or Chile":"Chile has the larger population (18729160 against 56882).","whose population is larger: Guyana or Sri Lanka":"Sri Lanka has the larger population (21670000 against 779004).","whose population is larger: San Marino or Portugal":"Portugal has the larger population (10283822 against 33785).","which has the larger population, East Timor or Honduras":"Honduras has the larger population (9587522 against 1267972).","whose population is larger: Uganda or Malaysia":"Uganda has the larger population (42723139 against 31528585).","whose population is larger: Spain or Germany":"Germany has the larger population (82905782 against 46796540).","whose population is larger: Mauritania or Senegal":"Senegal has the larger population (15854360 against 4403319).","between Guatemala and Andorra, which has the greater population":"Guatemala has the larger population (17247807 against 77006).","which has the larger population, Pitcairn or Lithuania":"Lithuania has the larger population (2801543 against 67).","which has the larger population, Germany or New Caledonia":"Germany has the larger population (82905782 against 284060).","whose population is larger: Iraq or Finland":"Iraq has the larger population (38433600 against 5515525).","which has the larger population, Bahamas or Sierra Leone":"Sierra Leone has the larger population (7650154 against 385640).","which has the larger population, Afghanistan or Grenada":"Afghanistan has the larger population (37172386 against 111454).","whose population is larger: Saudi Arabia or Latvia":"Saudi Arabia has the larger population (33699947 against 1927174).","whose population is larger: Venezuela or Cocos (Keeling) Islands":"Venezuela has the larger population (28870195 against 596).","whose population is larger: Liechtenstein or Suriname":"Suriname has the larger population (575991 against 37910).","between Nepal and El Salvador, which has the greater population":"Nepal has the larger population (28087871 against 6420744).","between North Macedonia and South Korea, which has the greater population":"South Korea has the larger population (51606633 against 2084367).","which has the larger population, Ethiopia or Benin":"Ethiopia has the larger population (109224559 against 11485048).","which has the larger population, Suriname or Italy":"Italy has the larger population (60421760 against 575991).","which has the larger population, Canada or Greece":"Canada has the larger population (37057765 against 10731726).","between Poland and Brazil, which has the greater population":"Brazil has the larger population (209469333 against 37974750).","whose population is larger: Pakistan or Ireland":"Pakistan has the larger population (212215030 against 4867309).","whose population is larger: Turks and Caicos Islands or Lebanon":"Lebanon has the larger population (6848925 against 37665).","which has the larger population, Latvia or Saint Helena":"Latvia has the larger population (1927174 against 6600).","whose population is larger: Aruba or Pitcairn":"Aruba has the larger population (105845 against 67).","which has the larger population, Lebanon or Cabo Verde":"Lebanon has the larger population (6848925 against 555987).","which has the larger population, French Guiana or Guatemala":"Guatemala has the larger population (17247807 against 290691).","whose population is larger: El Salvador or Ghana":"Ghana has the larger population (29767108 against 6420744).","which has the larger population, Bolivia or Japan":"Japan has the larger population (126529100 against 11353142).","between Anguilla and Pakistan, which has the greater population":"Pakistan has the larger population (212215030 against 15094).","whose population is larger: Antarctica or East Timor":"East Timor has the larger population (1267972 against 1106).","between Lithuania and Saint Kitts and Nevis, which has the greater population":"Lithuania has the larger population (2801543 against 52441).","which has the larger population, Finland or Nepal":"Nepal has the larger population (28087871 against 5515525).","which has the larger population, Cocos (Keeling) Islands or Poland":"Poland has the larger population (37974750 against 596).","between Nigeria and Uganda, which has the greater population":"Nigeria has the larger population (195874740 against 42723139).","whose population is larger: Andorra or British Indian Ocean Territory":"Andorra has the larger population (77006 against 0).","which has the larger population, Cambodia or United States Minor Outlying Islands":"Cambodia has the larger population (16249798 against 300).","which has the larger population, Slovakia or Nigeria":"Nigeria has the larger population (195874740 against 5446771).","between Tunisia and Antarctica, which has the greater population":"Tunisia has the larger population (11565204 against 1106).","which has the larger population, Central African Republic or India":"India has the larger population (1352617328 against 4666377).","whose population is larger: Myanmar or Romania":"Myanmar has the larger population (53708395 against 19466145).","between Faroe Islands and Iraq, which has the greater population":"Iraq has the larger population (38433600 against 48497).","between Saint Helena and Liechtenstein, which has the greater population":"Liechtenstein has the larger population (37910 against 6600).","whose population is larger: Wallis and Futuna or Slovakia":"Slovakia has the larger population (5446771 against 15289).","between Cabo Verde and Saudi Arabia, which has the greater population":"Saudi Arabia has the larger population (33699947 against 555987).","between Japan and San Marino, which has the greater population":"Japan has the larger population (126529100 against 33785).","between Grenada and Mauritania, which has the greater population":"Mauritania has the larger population (4403319 against 111454).","whose population is larger: Sudan or Nauru":"Sudan has the larger population (41801533 against 12704).","between Seychelles and Venezuela, which has the greater population":"Venezuela has the larger population (28870195 against 96762).","whose population is larger: South Korea or Cambodia":"South Korea has the larger population (51606633 against 16249798).","which has the larger population, Romania or Svalbard and Jan Mayen":"Romania has the larger population (19466145 against 2572).","which has the larger population, Equatorial Guinea or North Macedonia":"North Macedonia has the larger population (2084367 against 1308974).","between Italy and Burkina Faso, which has the greater population":"Italy has the larger population (60421760 against 19751535).","whose population is larger: Iceland or Northern Mariana Islands":"Iceland has the larger population (352721 against 56882).","which has the larger population, Mexico or Bhutan":"Mexico has the larger population (126190788 against 754394).","whose population is larger: Brazil or Ethiopia":"Brazil has the larger population (209469333 against 109224559).","between Turkey and Antigua and Barbuda, which has the greater population":"Turkey has the larger population (82319724 against 96286)."}}},
{"id":"n-35ec2f46","guard":[["has","larger"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"larger: Reunion or Saint Vincent and the Grenadines":"Reunion has the larger population (859959 against 110210).","larger: Lesotho or Afghanistan":"Afghanistan has the larger population (37172386 against 2108132).","larger: Angola or Central African Republic":"Angola has the larger population (30809762 against 4666377).","larger: Paraguay or Equatorial Guinea":"Paraguay has the larger population (6956071 against 1308974).","larger: United Arab Emirates or Bolivia":"Bolivia has the larger population (11353142 against 9630959).","larger: Antigua and Barbuda or Canada":"Canada has the larger population (37057765 against 96286).","larger: Saint Kitts and Nevis or French Guiana":"French Guiana has the larger population (290691 against 52441).","larger: Macao or Bangladesh":"Bangladesh has the larger population (161356039 against 631636).","larger: Guinea or Mexico":"Mexico has the larger population (126190788 against 12414318).","larger: Burkina Faso or Rwanda":"Burkina Faso has the larger population (19751535 against 12301939).","larger: Kuwait or Ivory Coast":"Ivory Coast has the larger population (25069229 against 4137309).","larger: Djibouti or Bermuda":"Djibouti has the larger population (958920 against 63973).","larger: Guyana or Sri Lanka":"Sri Lanka has the larger population (21670000 against 779004).","larger: San Marino or Portugal":"Portugal has the larger population (10283822 against 33785).","larger: Uganda or Malaysia":"Uganda has the larger population (42723139 against 31528585).","larger: Spain or Germany":"Germany has the larger population (82905782 against 46796540).","larger: Mauritania or Senegal":"Senegal has the larger population (15854360 against 4403319).","larger: Iraq or Finland":"Iraq has the larger population (38433600 against 5515525).","larger: Saudi Arabia or Latvia":"Saudi Arabia has the larger population (33699947 against 1927174).","larger: Venezuela or Cocos (Keeling) Islands":"Venezuela has the larger population (28870195 against 596).","larger: Liechtenstein or Suriname":"Suriname has the larger population (575991 against 37910).","larger: Pakistan or Ireland":"Pakistan has the larger population (212215030 against 4867309).","larger: Turks and Caicos Islands or Lebanon":"Lebanon has the larger population (6848925 against 37665).","larger: Aruba or Pitcairn":"Aruba has the larger population (105845 against 67).","larger: El Salvador or Ghana":"Ghana has the larger population (29767108 against 6420744).","larger: Antarctica or East Timor":"East Timor has the larger population (1267972 against 1106).","larger: Andorra or British Indian Ocean Territory":"Andorra has the larger population (77006 against 0).","larger: Myanmar or Romania":"Myanmar has the larger population (53708395 against 19466145).","larger: Wallis and Futuna or Slovakia":"Slovakia has the larger population (5446771 against 15289).","larger: Sudan or Nauru":"Sudan has the larger population (41801533 against 12704).","larger: South Korea or Cambodia":"South Korea has the larger population (51606633 against 16249798).","larger: Iceland or Northern Mariana Islands":"Iceland has the larger population (352721 against 56882).","larger: Brazil or Ethiopia":"Brazil has the larger population (209469333 against 109224559)."}}},
{"id":"n-aa89d75a","guard":[["hasAny",["algeria","antigua","bolivia","caicos","chile","delete","eswatini","ghana","guatemala","honduras","india","lesotho","lithuania","macao","mauritania","nepal","poland","portugal","remove","russia","serbia","slovakia","spain","strip out","suriname","without"]],["has","larger"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-8957c254","guard":[["hasAny",["afghanistan","bangladesh","benin","bermuda","bhutan","cabo","each word","futuna","greece","guatemala","helena","honduras","lithuania","longest","longest one","longest word","marino","minor","myanmar","pakistan","russia","spain","split into words","turkey","venezuela","words"]],["has","larger"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"population"}]]]],"mem":null},
{"id":"n-b8e15274","guard":[["hasAny",["african","andorra","antigua","arab","aruba","brazil","cocos","el","equatorial","finland","grenadines","iceland","liechtenstein","malaysia","marino","mauritania","myanmar","nauru","shortest","shortest one","shortest word"]],["has","larger"],["has","population"]],"pyramid":["render.str",["aggregate.shortest",["sense.list"]]],"mem":null},
{"id":"n-22260895","guard":[["hasAny",["african","andorra","antigua","arab","aruba","brazil","cocos","el","equatorial","finland","grenadines","iceland","invert case","liechtenstein","malaysia","marino","mauritania","myanmar","nauru","shortest","shortest one","shortest word","swap case","toggle case"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-29f42b65","guard":[["hasAny",["african","andorra","antigua","arab","aruba","brazil","cocos","el","equatorial","finland","grenadines","iceland","liechtenstein","lower case","lowercase","malaysia","marino","mauritania","myanmar","nauru","shortest","shortest one","shortest word","small letters"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.lower",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-44234e8e","guard":[["hasAny",["african","all caps","andorra","antigua","arab","aruba","brazil","capital letters","capitals","cocos","el","equatorial","finland","grenadines","iceland","liechtenstein","malaysia","marino","mauritania","myanmar","nauru","shortest","shortest one","shortest word","upper case","uppercase"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.upper",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-4ed15576","guard":[["hasAny",["african","andorra","antarctica","antigua","arab","aruba","backwards","brazil","cocos","el","finland","grenadines","guinea","iceland","liechtenstein","malaysia","marino","mauritania","reverse","reverse order","reversed","shortest","shortest one","shortest word"]],["has","larger"],["has","population"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-17a9d10c","guard":[["hasAny",["african","andorra","arabia","aruba","bermuda","brazil","burkina","cambodia","cocos","element","equatorial","finland","grenadines","iceland","ireland","item number","malaysia","myanmar","nauru","nth","position"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":1}]],"mem":null},
{"id":"n-abe0a961","guard":[["hasAny",["a to z","african","alphabetical","alphabetize","andorra","antigua","arab","aruba","brazil","cocos","el","equatorial","finland","grenadines","iceland","liechtenstein","malaysia","marino","mauritania","myanmar","shortest","shortest one","shortest word"]],["has","larger"],["has","population"]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.list"]]]],"mem":null},
{"id":"n-2fabda7e","guard":[["hasAny",["african","andorra","arab","aruba","brazil","cocos","el","equatorial","finland","first n","grenadines","iceland","liechtenstein","malaysia","marino","mauritania","myanmar","nauru","shortest","shortest one","shortest word","take","top"]],["has","larger"],["has","population"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-b4a985ec","guard":[["hasAny",["antigua","bolivia","caicos","chile","french","from position","ghana","honduras","items from to","lesotho","lithuania","portugal","slice","slovakia","suriname"]],["has","larger"],["has","population"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":10}]],"mem":null},
{"id":"n-3a0d9223","guard":[["hasAny",["african","bolivia","british","cocos","delete","east","finland","french","ghana","grenadines","ireland","mariana","nauru","pitcairn","portugal","remove","slovakia","strip out","suriname","without"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"has"}]]],"mem":null},
{"id":"n-89020fa2","guard":[["hasAny",["algeria","chile","cuba","delete","eswatini","guatemala","honduras","india","italy","japan","lithuania","nepal","nigeria","poland","remove","russia","serbia","strip out","turkey","without"]],["has","larger"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-eb8ac51f","guard":[["hasAny",["african","algeria","bolivia","british","chile","cocos","cuba","delete","east","finland","french","ghana","ireland","italy","lithuania","nauru","nigeria","remove","strip out","without"]],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.after",{"lit":"larger"}]]],"mem":null},
{"id":"n-2f2b0399","guard":[["hasAny",["afghanistan","arabia","bangladesh","bermuda","burkina","cambodia","coast","french","futuna","germany","guyana","ireland","longest","longest one","longest word","myanmar","nauru"]],["has","larger"],["has","population"]],"pyramid":["render.str",["aggregate.longest",["sense.list"]]],"mem":null},
{"id":"n-45e074c3","guard":[["hasAny",["afghanistan","antarctica","arabia","backwards","bangladesh","bermuda","burkina","cambodia","coast","french","futuna","germany","guyana","ireland","longest","longest one","longest word","mexico","reverse","reverse order","reversed"]],["has","larger"],["has","population"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-5af476ad","guard":[["hasAny",["afghanistan","arabia","bangladesh","bermuda","burkina","cambodia","capitalise","capitalize","capitalize each word","coast","french","futuna","germany","guyana","ireland","longest","longest one","longest word","myanmar","nauru","title case"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.title",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-970cd2b8","guard":[["hasAny",["afghanistan","arabia","bangladesh","bermuda","burkina","cambodia","coast","french","futuna","germany","guyana","invert case","ireland","longest","longest one","longest word","myanmar","nauru","swap case","toggle case"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-a7dfe510","guard":[["hasAny",["afghanistan","all caps","arabia","bangladesh","bermuda","burkina","cambodia","capital letters","capitals","coast","french","futuna","germany","guyana","ireland","longest","longest one","longest word","myanmar","nauru","upper case","uppercase"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.upper",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-d88ed26a","guard":[["hasAny",["afghanistan","arabia","bangladesh","bermuda","burkina","cambodia","coast","french","futuna","germany","guyana","ireland","longest","longest one","longest word","lower case","lowercase","myanmar","nauru","small letters"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.lower",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-ad65eb61","guard":[["hasAny",["a to z","afghanistan","alphabetical","alphabetize","arabia","bangladesh","bermuda","burkina","cambodia","coast","french","futuna","germany","guyana","ireland","longest","longest one","longest word","myanmar"]],["has","larger"],["has","population"]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["sense.list"]]]],"mem":null},
{"id":"n-72695de9","guard":[["hasAny",["afghanistan","antarctica","arab","bangladesh","coast","el","element","germany","guyana","item number","liechtenstein","marino","mauritania","mexico","nth","position"]],["has","population"],["has","larger"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-df20e9ba","guard":[["hasAny",["afghanistan","antigua","arab","bangladesh","caicos","delete","el","futuna","germany","liechtenstein","marino","mauritania","mexico","remove","strip out","without"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-092c234c","guard":[["hasAny",["afghanistan","antarctica","arab","bangladesh","coast","el","from position","germany","guyana","items from to","liechtenstein","marino","mauritania","mexico","slice"]],["has","population"],["has","larger"]],"pyramid":["render.list",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-7f417732","guard":[["hasAny",["afghanistan","arabia","bangladesh","bermuda","burkina","cambodia","coast","first n","germany","guyana","ireland","longest","longest one","longest word","myanmar","nauru","take","top"]],["has","larger"],["has","population"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-b2ac87aa","guard":[["hasAny",["afghanistan","antarctica","arab","bangladesh","coast","el","from position","germany","guyana","items from to","liechtenstein","marino","mauritania","mexico","slice"]],["has","population"],["has","larger"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-f1c9be45","guard":[["hasAny",["afghanistan","antarctica","arab","bangladesh","coast","el","from position","germany","guyana","items from to","liechtenstein","marino","mauritania","mexico","slice"]],["has","population"],["has","larger"]],"pyramid":["render.and",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-41022384","guard":[["hasAny",["element","finland","ghana","ireland","item number","nauru","nth","pitcairn","portugal","position","slovakia","suriname"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-21c95104","guard":[["hasAny",["bolivia","from position","ghana","items from to","lesotho","portugal","slice","slovakia","suriname"]],["has","larger"],["has","population"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":12}]],"mem":null},
{"id":"n-5760ba25","guard":[["hasAny",["finland","from position","ghana","ireland","items from to","nauru","pitcairn","portugal","slice","slovakia","suriname"]],["has","larger"],["has","population"]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-61ecbd0d","guard":[["hasAny",["afghanistan","djibouti","each word","futuna","longest","longest one","longest word","macao","marino","myanmar","pakistan","spain","split into words","sudan","venezuela","words"]],["has","population"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"larger"}]]]],"mem":null},
{"id":"n-6b4997db","guard":[["hasAny",["finland","from position","ghana","ireland","items from to","nauru","pitcairn","portugal","slice","slovakia","suriname"]],["has","larger"],["has","population"]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-8e124dd1","guard":[["hasAny",["finland","from position","ghana","ireland","items from to","nauru","pitcairn","portugal","slice","slovakia","suriname"]],["has","larger"],["has","population"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-47fa9de2","guard":[["hasAny",["bolivia","capitalise","capitalize","capitalize each word","ghana","portugal","slovakia","suriname","title case"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5fbbd076","guard":[["hasAny",["bolivia","each word","ghana","portugal","slovakia","split into words","suriname"]],["has","larger"],["has","population"]],"pyramid":["render.list",["transform.words",["sense.lastWord"]]],"mem":null},
{"id":"n-955cff75","guard":[["hasAny",["bolivia","ghana","invert case","portugal","slovakia","suriname","swap case","toggle case"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-dafb31aa","guard":[["hasAny",["all caps","bolivia","capital letters","capitals","ghana","portugal","slovakia","suriname","upper case","uppercase"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e5711fc6","guard":[["hasAny",["bolivia","ghana","lower case","lowercase","portugal","slovakia","small letters","suriname"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-22ac4993","guard":[["hasAny",["bolivia","delete","ghana","portugal","remove","slovakia","strip out","suriname","without"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Algeria"}]],"mem":null},
{"id":"n-6f7f4e40","guard":[["hasAny",["bolivia","capitalise","capitalize","capitalize each word","ghana","invert case","portugal","slovakia","suriname","swap case","title case","toggle case"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-7b557b06","guard":[["hasAny",["cocos","each word","ireland","longest","longest one","longest word","nauru","portugal","slovakia","split into words"]],["has","larger"],["has","population"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-7eae3459","guard":[["hasAny",["bolivia","delete","ghana","portugal","remove","slovakia","strip out","suriname","without"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Afghanistan"}]],"mem":null},
{"id":"n-8666feb1","guard":[["hasAny",["bolivia","delete","ghana","portugal","remove","slovakia","strip out","suriname","without"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Canada"}]],"mem":null},
{"id":"n-912c8d33","guard":[["hasAny",["bolivia","delete","ghana","portugal","remove","slovakia","strip out","suriname","without"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Chile"}]],"mem":null},
{"id":"n-c55e6206","guard":[["hasAny",["bolivia","delete","ghana","portugal","remove","slovakia","strip out","suriname","without"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Bangladesh"}]],"mem":null},
{"id":"n-d908fa7b","guard":[["hasAny",["bolivia","delete","ghana","portugal","remove","slovakia","strip out","suriname","without"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Germany"}]],"mem":null},
{"id":"n-159a50fa","guard":[["hasAny",["bolivia","ghana","portugal","separate by","slovakia","split","split by","suriname"]],["has","larger"],["has","population"]],"pyramid":["render.list",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-2da1d175","guard":[["hasAny",["bolivia","ghana","portugal","separate by","slovakia","split","split by","suriname"]],["has","larger"],["has","population"]],"pyramid":["render.lines",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-3057479b","guard":[["hasAny",["bolivia","delete","ghana","portugal","remove","slovakia","strip out","suriname","without"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-86307109","guard":[["hasAny",["bolivia","ghana","portugal","separate by","slovakia","split","split by","suriname"]],["has","larger"],["has","population"]],"pyramid":["render.and",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-19c165a7","guard":[["hasAny",["bolivia","delete","ghana","portugal","remove","slovakia","strip out","suriname","without"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"Cuba"}]],"mem":null},
{"id":"n-df6ae32d","guard":[["hasAny",["afghanistan","bangladesh","bermuda","cocos","each word","futuna","germany","ireland","longest","longest one","longest word","marino","myanmar","split into words","words"]],["has","larger"],["has","population"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-4d1f8cf7","guard":[["hasAny",["afghanistan","bangladesh","bermuda","each word","futuna","germany","ireland","longest","longest one","longest word","myanmar","nauru","split into words"]],["has","larger"],["has","population"]],"pyramid":["render.list",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-d17fcd4c","guard":[["hasAny",["afghanistan","bangladesh","bermuda","each word","futuna","germany","ireland","longest","longest one","longest word","myanmar","nauru","split into words"]],["has","larger"],["has","population"]],"pyramid":["render.and",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-db57ab3e","guard":[["hasAny",["afghanistan","bangladesh","bermuda","each word","futuna","germany","ireland","longest","longest one","longest word","myanmar","nauru","split into words"]],["has","larger"],["has","population"]],"pyramid":["render.lines",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-e2e107fa","guard":[["hasAny",["afghanistan","bangladesh","bermuda","futuna","germany","ireland","longest","longest one","longest word","myanmar","nauru","reverse the words","reverse word order","words backwards"]],["has","larger"],["has","population"]],"pyramid":["render.str",["transform.reverseWords",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-61797b88","guard":[["hasAny",["brazil","element","item number","nth","pakistan","position","venezuela"]],["has","population"],["words<=",9],["not",["has","compare"]],["not",["has","bahrain"]],["not",["has","bosnia"]],["not",["has","bulgaria"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-58a2d142","guard":[["hasAny",["a to z","afghanistan","alphabetical","alphabetize","bangladesh","grenada","longest","longest one","longest word"]],["has","population"],["not",["has","of"]],["not",["has","smaller"]],["not",["has","compare"]],["not",["has","lesser"]]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["sense.words"]]]],"mem":null},
{"id":"n-ba1894df","guard":[["hasAny",["andorra","each word","futuna","kitts","liechtenstein","longest","longest one","longest word","mauritania","split into words","words"]],["has","greater"],["has","population"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.before",{"lit":"has"}]]]],"mem":null},
{"id":"n-13578888","guard":[["hasAny",["african","cocos","element","item number","lebanon","mariana","nth","position"]],["has","larger"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-4ae1cba0","guard":[["hasAny",["afghanistan","backwards","bangladesh","longest","longest one","longest word","reverse","reverse order","reversed"]],["has","larger"],["has","population"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-971cd3e5","guard":[["hasAny",["djibouti","element","iraq","item number","nth","position"]],["not",["has","of"]],["has","population"],["not",["has","lesser"]],["not",["has","smaller"]],["not",["has","compare"]]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c388bb95","guard":[["hasAny",["antigua","caicos","element","french","futuna","item number","nth","position"]],["has","population"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":3}]],"mem":null},
{"id":"n-1972d349","guard":[["hasAny",["african","cocos","from position","items from to","lebanon","mariana","slice"]],["has","larger"]],"pyramid":["render.and",["transform.sliceStrs",["sense.words"],{"lit":10},{"lit":12}]],"mem":null},
{"id":"n-425f2259","guard":[["hasAny",["african","cocos","from position","items from to","lebanon","mariana","slice"]],["has","larger"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":10},{"lit":12}]],"mem":null},
{"id":"n-4ecbdd66","guard":[["hasAny",["african","cocos","from position","items from to","lebanon","mariana","slice"]],["has","larger"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":10},{"lit":12}]],"mem":null},
{"id":"n-7e80c50c","guard":[["hasAny",["african","cocos","from position","items from to","lebanon","mariana","slice"]],["has","larger"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":10},["sense.wordCount"]]],"mem":null},
{"id":"n-8fcfc23c","guard":[["hasAny",["african","cocos","from position","items from to","lebanon","mariana","slice"]],["has","larger"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":10},["sense.wordCount"]]],"mem":null},
{"id":"n-c43ed4fc","guard":[["hasAny",["african","cocos","from position","items from to","lebanon","mariana","slice"]],["has","larger"]],"pyramid":["render.and",["transform.sliceStrs",["sense.words"],{"lit":10},["sense.wordCount"]]],"mem":null},
{"id":"n-676bfe19","guard":[["hasAny",["afghanistan","grenada","longest","longest one","longest word"]],["has","population"],["not",["has","of"]],["not",["has","lesser"]],["not",["has","mozambique"]]],"pyramid":["render.str",["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ce3c7008","guard":[["hasAny",["afghanistan","each word","grenada","longest","longest one","longest word","split into words"]],["has","population"],["not",["has","of"]],["not",["has","lesser"]],["not",["has","mozambique"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.text"]]]],"mem":null},
{"id":"n-dd478d49","guard":[["hasAny",["afghanistan","capitalise","capitalize","capitalize each word","grenada","longest","longest one","longest word","title case"]],["has","population"],["not",["has","of"]],["not",["has","lesser"]],["not",["has","mozambique"]]],"pyramid":["render.str",["transform.title",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-e4a2925c","guard":[["hasAny",["afghanistan","grenada","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","population"],["not",["has","of"]],["not",["has","lesser"]],["not",["has","mozambique"]]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-3377475d","guard":[["hasAny",["afghanistan","first n","grenada","longest","longest one","longest word","take","top"]],["has","population"],["not",["has","of"]],["not",["has","lesser"]],["not",["has","mozambique"]]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":12}]]],"mem":null},
{"id":"n-97bb7dd3","guard":[["hasAny",["afghanistan","first n","grenada","longest","longest one","longest word","take","top"]],["has","population"],["not",["has","of"]],["not",["has","lesser"]],["not",["has","mozambique"]]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":10}]]],"mem":null},
{"id":"n-c2b7cde8","guard":[["hasAny",["afghanistan","first n","grenada","longest","longest one","longest word","take","top"]],["has","population"],["not",["has","of"]],["not",["has","lesser"]],["not",["has","mozambique"]]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":5}]]],"mem":null},
{"id":"n-cc12ed85","guard":[["hasAny",["afghanistan","first n","grenada","longest","longest one","longest word","take","top"]],["has","population"],["not",["has","of"]],["not",["has","lesser"]],["not",["has","mozambique"]]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-69b16eee","guard":[["hasAny",["first n","iraq","shortest","shortest one","shortest word","take","top"]],["not",["has","of"]],["not",["has","compare"]],["not",["has","armenia"]],["not",["has","puerto"]]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-007330e0","guard":[["hasAny",["brazil","ethiopia","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Brazil or Ethiopia":"Brazil has the larger population (209469333 against 109224559)."}}},
{"id":"n-05df3d18","guard":[["has","reunion"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Reunion or Saint Vincent and the Grenadines":"Reunion has the larger population (859959 against 110210)."}}},
{"id":"n-0a27e0aa","guard":[["hasAny",["has","seychelles"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Malaysia or Seychelles":"Malaysia has the larger population (31528585 against 96762)."}}},
{"id":"n-0ae42586","guard":[["hasAny",["has","italy","larger","population","suriname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Suriname or Italy":"Italy has the larger population (60421760 against 575991)."}}},
{"id":"n-0dc38475","guard":[["hasAny",["larger","mauritania","population","senegal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Mauritania or Senegal":"Senegal has the larger population (15854360 against 4403319)."}}},
{"id":"n-0dd26c73","guard":[["hasAny",["algeria","has"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Saint Vincent and the Grenadines or Algeria":"Algeria has the larger population (42228429 against 110210)."}}},
{"id":"n-0eb29143","guard":[["hasAny",["nigeria","uganda"]],["has","nigeria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Nigeria and Uganda, which has the greater population":"Nigeria has the larger population (195874740 against 42723139)."}}},
{"id":"n-10b01e86","guard":[["hasAny",["has","helena","larger","latvia","population","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Latvia or Saint Helena":"Latvia has the larger population (1927174 against 6600)."}}},
{"id":"n-1136b1a1","guard":[["hasAny",["grenada","has"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Afghanistan or Grenada":"Afghanistan has the larger population (37172386 against 111454)."}}},
{"id":"n-113e572f","guard":[["hasAny",["finland","has","larger","nepal","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Finland or Nepal":"Nepal has the larger population (28087871 against 5515525)."}}},
{"id":"n-122d633e","guard":[["hasAny",["eswatini","has"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, British Indian Ocean Territory or Eswatini":"Eswatini has the larger population (1136191 against 0)."}}},
{"id":"n-12989f4e","guard":[["hasAny",["antigua","barbuda","between","greater","has","population","turkey"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Turkey and Antigua and Barbuda, which has the greater population":"Turkey has the larger population (82319724 against 96286)."}}},
{"id":"n-12d13417","guard":[["has","lesotho"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Lesotho or Afghanistan":"Afghanistan has the larger population (37172386 against 2108132)."}}},
{"id":"n-12e5b38a","guard":[["hasAny",["british","eswatini","has","indian","larger","ocean","population","territory"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, British Indian Ocean Territory or Eswatini":"Eswatini has the larger population (1136191 against 0)."}}},
{"id":"n-1604d19e","guard":[["hasAny",["between","greater","has","kitts","lithuania","nevis","population","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Lithuania and Saint Kitts and Nevis, which has the greater population":"Lithuania has the larger population (2801543 against 52441)."}}},
{"id":"n-1698b210","guard":[["hasAny",["caicos","islands","larger","lebanon","population","turks"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Turks and Caicos Islands or Lebanon":"Lebanon has the larger population (6848925 against 37665)."}}},
{"id":"n-17aac742","guard":[["hasAny",["arab","armenia","between","emirates","greater","has","population","united"]],["has","between"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Armenia and United Arab Emirates, which has the greater population":"United Arab Emirates has the larger population (9630959 against 2951776)."}}},
{"id":"n-17aea109","guard":[["hasAny",["arabia","between","cabo","greater","has","population","saudi","verde"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Cabo Verde and Saudi Arabia, which has the greater population":"Saudi Arabia has the larger population (33699947 against 555987)."}}},
{"id":"n-17f77267","guard":[["hasAny",["between","greater","greece","guyana","has","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Greece and Guyana, which has the greater population":"Greece has the larger population (10731726 against 779004)."}}},
{"id":"n-18a1736f","guard":[["hasAny",["antigua","barbuda","canada","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Antigua and Barbuda or Canada":"Canada has the larger population (37057765 against 96286)."}}},
{"id":"n-1a64ea69","guard":[["hasAny",["caledonia","germany","has","larger","new","population"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Germany or New Caledonia":"Germany has the larger population (82905782 against 284060)."}}},
{"id":"n-1b1ae6e6","guard":[["hasAny",["afghanistan","larger","lesotho","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Lesotho or Afghanistan":"Afghanistan has the larger population (37172386 against 2108132)."}}},
{"id":"n-1b46bbb5","guard":[["hasAny",["eswatini","myanmar"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Eswatini and Myanmar, which has the greater population":"Myanmar has the larger population (53708395 against 1136191)."}}},
{"id":"n-1ea13ad4","guard":[["hasAny",["cocos","islands","keeling","larger","population","venezuela"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Venezuela or Cocos (Keeling) Islands":"Venezuela has the larger population (28870195 against 596)."}}},
{"id":"n-1f14c27a","guard":[["hasAny",["serbia","sudan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Serbia and Sudan, which has the greater population":"Sudan has the larger population (41801533 against 6963764)."}}},
{"id":"n-206af44e","guard":[["has","guyana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Guyana or Sri Lanka":"Sri Lanka has the larger population (21670000 against 779004)."}}},
{"id":"n-24a760cb","guard":[["hasAny",["aruba","tokelau"]],["has","tokelau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Tokelau and Aruba, which has the greater population":"Aruba has the larger population (105845 against 1411)."}}},
{"id":"n-27a97f9f","guard":[["hasAny",["guinea","larger","mexico","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Guinea or Mexico":"Mexico has the larger population (126190788 against 12414318)."}}},
{"id":"n-282245ce","guard":[["hasAny",["has","serbia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Ireland or Serbia":"Serbia has the larger population (6963764 against 4867309)."}}},
{"id":"n-2c08e8ef","guard":[["hasAny",["aruba","larger","pitcairn","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Aruba or Pitcairn":"Aruba has the larger population (105845 against 67)."}}},
{"id":"n-2c6e6022","guard":[["hasAny",["french","guiana","kitts","larger","nevis","population","saint"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Saint Kitts and Nevis or French Guiana":"French Guiana has the larger population (290691 against 52441)."}}},
{"id":"n-2ec7c11f","guard":[["hasAny",["cuba","has","larger","population","portugal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Portugal or Cuba":"Cuba has the larger population (11338138 against 10283822)."}}},
{"id":"n-2f40f274","guard":[["hasAny",["canada","greece","has","larger","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Canada or Greece":"Canada has the larger population (37057765 against 10731726)."}}},
{"id":"n-30df1522","guard":[["hasAny",["anguilla","has"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Sri Lanka or Anguilla":"Sri Lanka has the larger population (21670000 against 15094)."}}},
{"id":"n-31685330","guard":[["hasAny",["afghanistan","grenada","has","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Afghanistan or Grenada":"Afghanistan has the larger population (37172386 against 111454)."}}},
{"id":"n-33e1f27f","guard":[["hasAny",["chile","has"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Northern Mariana Islands or Chile":"Chile has the larger population (18729160 against 56882)."}}},
{"id":"n-34ade391","guard":[["hasAny",["faroe","iraq"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Faroe Islands and Iraq, which has the greater population":"Iraq has the larger population (38433600 against 48497)."}}},
{"id":"n-361e57a5","guard":[["hasAny",["arab","armenia","between","emirates","greater","has","population","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Armenia and United Arab Emirates, which has the greater population":"United Arab Emirates has the larger population (9630959 against 2951776)."}}},
{"id":"n-38ec7307","guard":[["hasAny",["equatorial","guinea","larger","paraguay","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Paraguay or Equatorial Guinea":"Paraguay has the larger population (6956071 against 1308974)."}}},
{"id":"n-3b19761f","guard":[["hasAny",["bermuda","djibouti","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Djibouti or Bermuda":"Djibouti has the larger population (958920 against 63973)."}}},
{"id":"n-3b228fb8","guard":[["hasAny",["larger","romania"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Romania or Svalbard and Jan Mayen":"Romania has the larger population (19466145 against 2572)."}}},
{"id":"n-3c576913","guard":[["hasAny",["arab","bolivia","emirates","larger","population","united"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: United Arab Emirates or Bolivia":"Bolivia has the larger population (11353142 against 9630959)."}}},
{"id":"n-3d141ffa","guard":[["hasAny",["has","lithuania"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Pitcairn or Lithuania":"Lithuania has the larger population (2801543 against 67)."}}},
{"id":"n-3d8fee41","guard":[["has","venezuela"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Venezuela or Cocos (Keeling) Islands":"Venezuela has the larger population (28870195 against 596)."}}},
{"id":"n-406d4a8e","guard":[["hasAny",["armenia","has"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Ivory Coast or Armenia":"Ivory Coast has the larger population (25069229 against 2951776)."}}},
{"id":"n-41d2c4a3","guard":[["has","paraguay"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Paraguay or Equatorial Guinea":"Paraguay has the larger population (6956071 against 1308974)."}}},
{"id":"n-41ed654a","guard":[["hasAny",["seychelles","venezuela"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Seychelles and Venezuela, which has the greater population":"Venezuela has the larger population (28870195 against 96762)."}}},
{"id":"n-42c1cdbb","guard":[["hasAny",["between","greater","has","iceland","leone","population","sierra"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Sierra Leone and Iceland, which has the greater population":"Sierra Leone has the larger population (7650154 against 352721)."}}},
{"id":"n-42eb0768","guard":[["hasAny",["between","greater","has","nigeria","population","uganda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Nigeria and Uganda, which has the greater population":"Nigeria has the larger population (195874740 against 42723139)."}}},
{"id":"n-44bbf412","guard":[["hasAny",["larger","myanmar","population","romania"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Myanmar or Romania":"Myanmar has the larger population (53708395 against 19466145)."}}},
{"id":"n-45109759","guard":[["hasAny",["el","ghana","larger","population","salvador"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: El Salvador or Ghana":"Ghana has the larger population (29767108 against 6420744)."}}},
{"id":"n-45d751c1","guard":[["hasAny",["between","greater","has","japan","marino","population","san"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Japan and San Marino, which has the greater population":"Japan has the larger population (126529100 against 33785)."}}},
{"id":"n-45eb3b35","guard":[["has","sudan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Sudan or Nauru":"Sudan has the larger population (41801533 against 12704)."}}},
{"id":"n-47c64c05","guard":[["hasAny",["between","greater","has","helena","liechtenstein","population","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Saint Helena and Liechtenstein, which has the greater population":"Liechtenstein has the larger population (37910 against 6600)."}}},
{"id":"n-48243402","guard":[["hasAny",["bolivia","has","japan","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Bolivia or Japan":"Japan has the larger population (126529100 against 11353142)."}}},
{"id":"n-4900723f","guard":[["hasAny",["has","ireland","larger","population","serbia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Ireland or Serbia":"Serbia has the larger population (6963764 against 4867309)."}}},
{"id":"n-4b4300f7","guard":[["has","iraq"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Iraq or Finland":"Iraq has the larger population (38433600 against 5515525)."}}},
{"id":"n-4b7f3316","guard":[["hasAny",["antarctica","east","larger","population","timor"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Antarctica or East Timor":"East Timor has the larger population (1267972 against 1106)."}}},
{"id":"n-4bbf8f61","guard":[["hasAny",["has","larger","nigeria","population","slovakia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Slovakia or Nigeria":"Nigeria has the larger population (195874740 against 5446771)."}}},
{"id":"n-4bd8c063","guard":[["hasAny",["angola","between","greater","has","population","russia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Russia and Angola, which has the greater population":"Russia has the larger population (144478050 against 30809762)."}}},
{"id":"n-4dbe0c71","guard":[["hasAny",["canada","greece","has","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Canada or Greece":"Canada has the larger population (37057765 against 10731726)."}}},
{"id":"n-4e48e346","guard":[["hasAny",["french","guatemala","guiana","has","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, French Guiana or Guatemala":"Guatemala has the larger population (17247807 against 290691)."}}},
{"id":"n-4e9fb8c0","guard":[["hasAny",["between","greater","has","population","seychelles","venezuela"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Seychelles and Venezuela, which has the greater population":"Venezuela has the larger population (28870195 against 96762)."}}},
{"id":"n-522ceed1","guard":[["hasAny",["between","caicos","chile","greater","has","islands","population","turks"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Chile and Turks and Caicos Islands, which has the greater population":"Chile has the larger population (18729160 against 37665)."}}},
{"id":"n-5278857c","guard":[["hasAny",["larger","marino","population","portugal","san"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: San Marino or Portugal":"Portugal has the larger population (10283822 against 33785)."}}},
{"id":"n-53cf8bdd","guard":[["hasAny",["between","caledonia","djibouti","greater","has","new","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between New Caledonia and Djibouti, which has the greater population":"Djibouti has the larger population (958920 against 284060)."}}},
{"id":"n-54a4b6e8","guard":[["hasAny",["cambodia","larger"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Cambodia or United States Minor Outlying Islands":"Cambodia has the larger population (16249798 against 300)."}}},
{"id":"n-59fde6db","guard":[["hasAny",["futuna","larger","population","slovakia","wallis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Wallis and Futuna or Slovakia":"Slovakia has the larger population (5446771 against 15289)."}}},
{"id":"n-5b75e4dc","guard":[["hasAny",["between","greater","has","iceland","leone","population","sierra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Sierra Leone and Iceland, which has the greater population":"Sierra Leone has the larger population (7650154 against 352721)."}}},
{"id":"n-5b95aa3b","guard":[["hasAny",["bolivia","has","japan","larger","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Bolivia or Japan":"Japan has the larger population (126529100 against 11353142)."}}},
{"id":"n-5c3150cc","guard":[["hasAny",["between","el","greater","has","nepal","population","salvador"]],["has","nepal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Nepal and El Salvador, which has the greater population":"Nepal has the larger population (28087871 against 6420744)."}}},
{"id":"n-5f5c0553","guard":[["hasAny",["has","poland"]],["has","larger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Cocos (Keeling) Islands or Poland":"Poland has the larger population (37974750 against 596)."}}},
{"id":"n-5f97fae9","guard":[["hasAny",["has","larger","lithuania","pitcairn","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Pitcairn or Lithuania":"Lithuania has the larger population (2801543 against 67)."}}},
{"id":"n-607dfef3","guard":[["hasAny",["andorra","british","indian","larger","ocean","population","territory"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Andorra or British Indian Ocean Territory":"Andorra has the larger population (77006 against 0)."}}},
{"id":"n-63e638a2","guard":[["hasAny",["el","ghana","larger","population","salvador"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: El Salvador or Ghana":"Ghana has the larger population (29767108 against 6420744)."}}},
{"id":"n-642588e2","guard":[["hasAny",["between","burkina","faso","greater","has","italy","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Italy and Burkina Faso, which has the greater population":"Italy has the larger population (60421760 against 19751535)."}}},
{"id":"n-64de96ac","guard":[["hasAny",["india","macao"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between India and Macao, which has the greater population":"India has the larger population (1352617328 against 631636)."}}},
{"id":"n-64e64545","guard":[["hasAny",["cambodia","korea","larger","population","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: South Korea or Cambodia":"South Korea has the larger population (51606633 against 16249798)."}}},
{"id":"n-65c53be8","guard":[["hasAny",["has","larger","malaysia","population","seychelles"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Malaysia or Seychelles":"Malaysia has the larger population (31528585 against 96762)."}}},
{"id":"n-66defac0","guard":[["hasAny",["has","martinique"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Senegal or Martinique":"Senegal has the larger population (15854360 against 376480)."}}},
{"id":"n-67c0273a","guard":[["hasAny",["has","larger","nauru","population","russia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Nauru or Russia":"Russia has the larger population (144478050 against 12704)."}}},
{"id":"n-67c9c0a5","guard":[["hasAny",["caledonia","germany","has","larger","new","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Germany or New Caledonia":"Germany has the larger population (82905782 against 284060)."}}},
{"id":"n-6e378180","guard":[["hasAny",["larger","nauru","population","sudan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Sudan or Nauru":"Sudan has the larger population (41801533 against 12704)."}}},
{"id":"n-7534d4ca","guard":[["hasAny",["french","guatemala","guiana","has","larger","population"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, French Guiana or Guatemala":"Guatemala has the larger population (17247807 against 290691)."}}},
{"id":"n-75f5176d","guard":[["hasAny",["has","larger","population","rwanda","tunisia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Rwanda or Tunisia":"Rwanda has the larger population (12301939 against 11565204)."}}},
{"id":"n-78a34209","guard":[["hasAny",["has","honduras"]],["has","larger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, East Timor or Honduras":"Honduras has the larger population (9587522 against 1267972)."}}},
{"id":"n-78bf44c6","guard":[["hasAny",["helena","liechtenstein"]],["has","liechtenstein"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Saint Helena and Liechtenstein, which has the greater population":"Liechtenstein has the larger population (37910 against 6600)."}}},
{"id":"n-7905f71e","guard":[["hasAny",["bahamas","has","larger","leone","population","sierra"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Bahamas or Sierra Leone":"Sierra Leone has the larger population (7650154 against 385640)."}}},
{"id":"n-795c5660","guard":[["hasAny",["cocos","has","islands","keeling","larger","poland","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Cocos (Keeling) Islands or Poland":"Poland has the larger population (37974750 against 596)."}}},
{"id":"n-7ba08388","guard":[["hasAny",["between","greater","guinea","has","jan","mayen","population","svalbard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Svalbard and Jan Mayen and Guinea, which has the greater population":"Guinea has the larger population (12414318 against 2572)."}}},
{"id":"n-7c8d916e","guard":[["has","pakistan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Pakistan or Ireland":"Pakistan has the larger population (212215030 against 4867309)."}}},
{"id":"n-7cdeb540","guard":[["hasAny",["has","macedonia","north"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Equatorial Guinea or North Macedonia":"North Macedonia has the larger population (2084367 against 1308974)."}}},
{"id":"n-7d0e0273","guard":[["hasAny",["french","guiana","kitts","larger","nevis","population","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Saint Kitts and Nevis or French Guiana":"French Guiana has the larger population (290691 against 52441)."}}},
{"id":"n-7e85d1dd","guard":[["hasAny",["cabo","has","larger","lebanon","population","verde"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Lebanon or Cabo Verde":"Lebanon has the larger population (6848925 against 555987)."}}},
{"id":"n-7e9f0d28","guard":[["hasAny",["antarctica","tunisia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Tunisia and Antarctica, which has the greater population":"Tunisia has the larger population (11565204 against 1106)."}}},
{"id":"n-7f0d0965","guard":[["hasAny",["benin","reunion"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Benin and Reunion, which has the greater population":"Benin has the larger population (11485048 against 859959)."}}},
{"id":"n-80ec4fcc","guard":[["hasAny",["antigua","barbuda","between","greater","has","population","turkey"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Turkey and Antigua and Barbuda, which has the greater population":"Turkey has the larger population (82319724 against 96286)."}}},
{"id":"n-8135bddd","guard":[["hasAny",["bermuda","faroe","has","islands","larger","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Bermuda or Faroe Islands":"Bermuda has the larger population (63973 against 48497)."}}},
{"id":"n-81eec955","guard":[["hasAny",["bangladesh","has","larger","population","tokelau"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Bangladesh or Tokelau":"Bangladesh has the larger population (161356039 against 1411)."}}},
{"id":"n-831a68de","guard":[["hasAny",["aruba","between","greater","has","population","tokelau"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Tokelau and Aruba, which has the greater population":"Aruba has the larger population (105845 against 1411)."}}},
{"id":"n-8344f88b","guard":[["hasAny",["arab","bolivia","emirates","larger","population","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: United Arab Emirates or Bolivia":"Bolivia has the larger population (11353142 against 9630959)."}}},
{"id":"n-83e3281c","guard":[["has","andorra"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Andorra or British Indian Ocean Territory":"Andorra has the larger population (77006 against 0)."}}},
{"id":"n-8474819e","guard":[["hasAny",["andorra","guatemala"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Guatemala and Andorra, which has the greater population":"Guatemala has the larger population (17247807 against 77006)."}}},
{"id":"n-84df781d","guard":[["hasAny",["algeria","grenadines","has","larger","population","saint","vincent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Saint Vincent and the Grenadines or Algeria":"Algeria has the larger population (42228429 against 110210)."}}},
{"id":"n-84fa35f7","guard":[["hasAny",["ireland","larger","pakistan","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Pakistan or Ireland":"Pakistan has the larger population (212215030 against 4867309)."}}},
{"id":"n-86781cae","guard":[["has","macao"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Macao or Bangladesh":"Bangladesh has the larger population (161356039 against 631636)."}}},
{"id":"n-86ef4c4e","guard":[["hasAny",["between","faroe","greater","has","iraq","islands","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Faroe Islands and Iraq, which has the greater population":"Iraq has the larger population (38433600 against 48497)."}}},
{"id":"n-8b9754ae","guard":[["hasAny",["guyana","lanka","larger","population","sri"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Guyana or Sri Lanka":"Sri Lanka has the larger population (21670000 against 779004)."}}},
{"id":"n-8be7c124","guard":[["hasAny",["grenada","mauritania"]],["has","greater"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Grenada and Mauritania, which has the greater population":"Mauritania has the larger population (4403319 against 111454)."}}},
{"id":"n-8c29c6c6","guard":[["hasAny",["antigua","barbuda","canada","larger","population"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Antigua and Barbuda or Canada":"Canada has the larger population (37057765 against 96286)."}}},
{"id":"n-8c9e4d8d","guard":[["hasAny",["african","angola","central","larger","population","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Angola or Central African Republic":"Angola has the larger population (30809762 against 4666377)."}}},
{"id":"n-8f40312a","guard":[["hasAny",["ghana","has","larger","population","turkey"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Ghana or Turkey":"Turkey has the larger population (82319724 against 29767108)."}}},
{"id":"n-9007e39e","guard":[["has","antarctica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Antarctica or East Timor":"East Timor has the larger population (1267972 against 1106)."}}},
{"id":"n-90b0b73c","guard":[["has","liechtenstein"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Liechtenstein or Suriname":"Suriname has the larger population (575991 against 37910)."}}},
{"id":"n-923b480e","guard":[["hasAny",["has","larger","population","rwanda","tunisia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Rwanda or Tunisia":"Rwanda has the larger population (12301939 against 11565204)."}}},
{"id":"n-926cdfc9","guard":[["hasAny",["anguilla","between","greater","has","pakistan","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Anguilla and Pakistan, which has the greater population":"Pakistan has the larger population (212215030 against 15094)."}}},
{"id":"n-94463fff","guard":[["hasAny",["between","greater","has","korea","macedonia","north","population","south"]],["has","macedonia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between North Macedonia and South Korea, which has the greater population":"South Korea has the larger population (51606633 against 2084367)."}}},
{"id":"n-957f8464","guard":[["hasAny",["has","larger","nigeria","population","slovakia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Slovakia or Nigeria":"Nigeria has the larger population (195874740 against 5446771)."}}},
{"id":"n-95bd4027","guard":[["hasAny",["between","greater","lesotho"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between United States Minor Outlying Islands and Lesotho, which has the greater population":"Lesotho has the larger population (2108132 against 300)."}}},
{"id":"n-95e67085","guard":[["has","uganda"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Uganda or Malaysia":"Uganda has the larger population (42723139 against 31528585)."}}},
{"id":"n-9b3adb25","guard":[["hasAny",["bahamas","has","larger","leone","population","sierra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Bahamas or Sierra Leone":"Sierra Leone has the larger population (7650154 against 385640)."}}},
{"id":"n-9b748298","guard":[["hasAny",["east","has","honduras","larger","population","timor"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, East Timor or Honduras":"Honduras has the larger population (9587522 against 1267972)."}}},
{"id":"n-9bc85926","guard":[["hasAny",["algeria","kuwait"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Algeria and Kuwait, which has the greater population":"Algeria has the larger population (42228429 against 4137309)."}}},
{"id":"n-9ccc8d5f","guard":[["hasAny",["andorra","between","greater","guatemala","has","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Guatemala and Andorra, which has the greater population":"Guatemala has the larger population (17247807 against 77006)."}}},
{"id":"n-9d10a671","guard":[["hasAny",["bermuda","djibouti","larger","population"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Djibouti or Bermuda":"Djibouti has the larger population (958920 against 63973)."}}},
{"id":"n-9dd1f399","guard":[["hasAny",["angola","russia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Russia and Angola, which has the greater population":"Russia has the larger population (144478050 against 30809762)."}}},
{"id":"n-9e3319aa","guard":[["hasAny",["larger","marino","population","portugal","san"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: San Marino or Portugal":"Portugal has the larger population (10283822 against 33785)."}}},
{"id":"n-9f12258f","guard":[["hasAny",["bhutan","has","larger","mexico","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Mexico or Bhutan":"Mexico has the larger population (126190788 against 754394)."}}},
{"id":"n-a032e4ae","guard":[["hasAny",["ghana","has","larger","population","turkey"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Ghana or Turkey":"Turkey has the larger population (82319724 against 29767108)."}}},
{"id":"n-a22bf431","guard":[["hasAny",["arabia","larger","latvia","population","saudi"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Saudi Arabia or Latvia":"Saudi Arabia has the larger population (33699947 against 1927174)."}}},
{"id":"n-a57da883","guard":[["hasAny",["burkina","faso","larger","population","rwanda"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Burkina Faso or Rwanda":"Burkina Faso has the larger population (19751535 against 12301939)."}}},
{"id":"n-a90fb09d","guard":[["hasAny",["african","central","has","india","larger","population","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Central African Republic or India":"India has the larger population (1352617328 against 4666377)."}}},
{"id":"n-aa5b9aef","guard":[["hasAny",["has","nepal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Finland or Nepal":"Nepal has the larger population (28087871 against 5515525)."}}},
{"id":"n-adbcfe0c","guard":[["hasAny",["benin","ethiopia","has","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Ethiopia or Benin":"Ethiopia has the larger population (109224559 against 11485048)."}}},
{"id":"n-af029e1d","guard":[["hasAny",["cuba","paraguay"]],["has","cuba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Cuba and Paraguay, which has the greater population":"Cuba has the larger population (11338138 against 6956071)."}}},
{"id":"n-b15fc0a1","guard":[["hasAny",["greece","guyana"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Greece and Guyana, which has the greater population":"Greece has the larger population (10731726 against 779004)."}}},
{"id":"n-b17d6d3f","guard":[["has","brazil"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Brazil or Ethiopia":"Brazil has the larger population (209469333 against 109224559)."}}},
{"id":"n-b1b2b401","guard":[["hasAny",["between","greater","has","martinique","population","spain"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Martinique and Spain, which has the greater population":"Spain has the larger population (46796540 against 376480)."}}},
{"id":"n-b1d62e06","guard":[["hasAny",["anguilla","pakistan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Anguilla and Pakistan, which has the greater population":"Pakistan has the larger population (212215030 against 15094)."}}},
{"id":"n-b3ce4a5b","guard":[["hasAny",["coast","ivory","kuwait","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Kuwait or Ivory Coast":"Ivory Coast has the larger population (25069229 against 4137309)."}}},
{"id":"n-b57a6035","guard":[["hasAny",["futuna","larger","population","slovakia","wallis"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Wallis and Futuna or Slovakia":"Slovakia has the larger population (5446771 against 15289)."}}},
{"id":"n-b5ac2b3d","guard":[["hasAny",["between","eswatini","greater","has","myanmar","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Eswatini and Myanmar, which has the greater population":"Myanmar has the larger population (53708395 against 1136191)."}}},
{"id":"n-b5ffa221","guard":[["hasAny",["armenia","coast","has","ivory","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Ivory Coast or Armenia":"Ivory Coast has the larger population (25069229 against 2951776)."}}},
{"id":"n-b74b2ecc","guard":[["has","iceland"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Iceland or Northern Mariana Islands":"Iceland has the larger population (352721 against 56882)."}}},
{"id":"n-b8f9688e","guard":[["hasAny",["benin","between","greater","has","population","reunion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Benin and Reunion, which has the greater population":"Benin has the larger population (11485048 against 859959)."}}},
{"id":"n-b97ef8e9","guard":[["hasAny",["grenadines","larger","population","reunion","saint","vincent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Reunion or Saint Vincent and the Grenadines":"Reunion has the larger population (859959 against 110210)."}}},
{"id":"n-b9eaea2b","guard":[["hasAny",["benin","has"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Ethiopia or Benin":"Ethiopia has the larger population (109224559 against 11485048)."}}},
{"id":"n-bae31cb7","guard":[["hasAny",["between","futuna","greater","has","honduras","population","wallis"]],["has","honduras"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Honduras and Wallis and Futuna, which has the greater population":"Honduras has the larger population (9587522 against 15289)."}}},
{"id":"n-bd79586f","guard":[["hasAny",["cuba","has","larger","population","portugal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Portugal or Cuba":"Cuba has the larger population (11338138 against 10283822)."}}},
{"id":"n-bddf17ac","guard":[["hasAny",["has","jan","larger","mayen","population","romania","svalbard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Romania or Svalbard and Jan Mayen":"Romania has the larger population (19466145 against 2572)."}}},
{"id":"n-bf1a1bc0","guard":[["hasAny",["bermuda","faroe","has","islands","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Bermuda or Faroe Islands":"Bermuda has the larger population (63973 against 48497)."}}},
{"id":"n-c1e357b8","guard":[["hasAny",["caicos","chile","turks"]],["has","between"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Chile and Turks and Caicos Islands, which has the greater population":"Chile has the larger population (18729160 against 37665)."}}},
{"id":"n-c23ea481","guard":[["hasAny",["antarctica","between","greater","has","population","tunisia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Tunisia and Antarctica, which has the greater population":"Tunisia has the larger population (11565204 against 1106)."}}},
{"id":"n-c2845956","guard":[["hasAny",["between","greater","guinea"]],["words<=",12]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Svalbard and Jan Mayen and Guinea, which has the greater population":"Guinea has the larger population (12414318 against 2572)."}}},
{"id":"n-c3a4a5bd","guard":[["hasAny",["burkina","faso","larger","population","rwanda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Burkina Faso or Rwanda":"Burkina Faso has the larger population (19751535 against 12301939)."}}},
{"id":"n-c5229416","guard":[["hasAny",["between","cuba","greater","has","paraguay","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Cuba and Paraguay, which has the greater population":"Cuba has the larger population (11338138 against 6956071)."}}},
{"id":"n-c9468d35","guard":[["hasAny",["bangladesh","larger","macao","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Macao or Bangladesh":"Bangladesh has the larger population (161356039 against 631636)."}}},
{"id":"n-cc5fd6fd","guard":[["hasAny",["brazil","poland"]],["has","brazil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Poland and Brazil, which has the greater population":"Brazil has the larger population (209469333 against 37974750)."}}},
{"id":"n-ccc82531","guard":[["hasAny",["between","brazil","greater","has","poland","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Poland and Brazil, which has the greater population":"Brazil has the larger population (209469333 against 37974750)."}}},
{"id":"n-cf0954b3","guard":[["hasAny",["between","greater","grenada","has","mauritania","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Grenada and Mauritania, which has the greater population":"Mauritania has the larger population (4403319 against 111454)."}}},
{"id":"n-d05322fc","guard":[["has","kuwait"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Kuwait or Ivory Coast":"Ivory Coast has the larger population (25069229 against 4137309)."}}},
{"id":"n-d3b5e537","guard":[["hasAny",["germany","larger","population","spain"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Spain or Germany":"Germany has the larger population (82905782 against 46796540)."}}},
{"id":"n-d4121674","guard":[["hasAny",["chile","has","islands","larger","mariana","northern","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Northern Mariana Islands or Chile":"Chile has the larger population (18729160 against 56882)."}}},
{"id":"n-d4b5fcb7","guard":[["hasAny",["between","greater","has","korea","macedonia","north","population","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between North Macedonia and South Korea, which has the greater population":"South Korea has the larger population (51606633 against 2084367)."}}},
{"id":"n-d5a16b5f","guard":[["hasAny",["martinique","spain"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Martinique and Spain, which has the greater population":"Spain has the larger population (46796540 against 376480)."}}},
{"id":"n-d689c680","guard":[["hasAny",["has","tokelau"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Bangladesh or Tokelau":"Bangladesh has the larger population (161356039 against 1411)."}}},
{"id":"n-d8ce3175","guard":[["hasAny",["between","greater","has","islands","lesotho","minor","outlying","population","states","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between United States Minor Outlying Islands and Lesotho, which has the greater population":"Lesotho has the larger population (2108132 against 300)."}}},
{"id":"n-dab32143","guard":[["hasAny",["cambodia","korea","larger","population","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: South Korea or Cambodia":"South Korea has the larger population (51606633 against 16249798)."}}},
{"id":"n-db094343","guard":[["has","aruba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Aruba or Pitcairn":"Aruba has the larger population (105845 against 67)."}}},
{"id":"n-dbd79a6a","guard":[["hasAny",["has","russia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Nauru or Russia":"Russia has the larger population (144478050 against 12704)."}}},
{"id":"n-dc6cc6fb","guard":[["hasAny",["anguilla","has","lanka","larger","population","sri"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Sri Lanka or Anguilla":"Sri Lanka has the larger population (21670000 against 15094)."}}},
{"id":"n-dd0aa302","guard":[["hasAny",["between","caledonia","djibouti","greater","has","new","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between New Caledonia and Djibouti, which has the greater population":"Djibouti has the larger population (958920 against 284060)."}}},
{"id":"n-dd283b78","guard":[["hasAny",["between","greater","has","india","macao","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between India and Macao, which has the greater population":"India has the larger population (1352617328 against 631636)."}}},
{"id":"n-df761782","guard":[["hasAny",["between","burkina","faso","greater","has","italy","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Italy and Burkina Faso, which has the greater population":"Italy has the larger population (60421760 against 19751535)."}}},
{"id":"n-df887bf0","guard":[["hasAny",["cabo","has","larger","lebanon","population","verde"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Lebanon or Cabo Verde":"Lebanon has the larger population (6848925 against 555987)."}}},
{"id":"n-e13d6ce6","guard":[["has","mauritania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Mauritania or Senegal":"Senegal has the larger population (15854360 against 4403319)."}}},
{"id":"n-e2ea09b6","guard":[["hasAny",["caicos","islands","larger","lebanon","population","turks"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Turks and Caicos Islands or Lebanon":"Lebanon has the larger population (6848925 against 37665)."}}},
{"id":"n-e3dc29af","guard":[["hasAny",["kitts","lithuania","nevis"]],["has","lithuania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Lithuania and Saint Kitts and Nevis, which has the greater population":"Lithuania has the larger population (2801543 against 52441)."}}},
{"id":"n-e5f80963","guard":[["hasAny",["between","greater","has","population","serbia","sudan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Serbia and Sudan, which has the greater population":"Sudan has the larger population (41801533 against 6963764)."}}},
{"id":"n-e635385d","guard":[["hasAny",["larger","myanmar","population","romania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Myanmar or Romania":"Myanmar has the larger population (53708395 against 19466145)."}}},
{"id":"n-e718b4f6","guard":[["hasAny",["germany","larger","population","spain"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Spain or Germany":"Germany has the larger population (82905782 against 46796540)."}}},
{"id":"n-e72b02ba","guard":[["hasAny",["cambodia","has","islands","larger","minor","outlying","population","states","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Cambodia or United States Minor Outlying Islands":"Cambodia has the larger population (16249798 against 300)."}}},
{"id":"n-e7cd4193","guard":[["hasAny",["bhutan","has"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Mexico or Bhutan":"Mexico has the larger population (126190788 against 754394)."}}},
{"id":"n-e815de51","guard":[["hasAny",["larger","liechtenstein","population","suriname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Liechtenstein or Suriname":"Suriname has the larger population (575991 against 37910)."}}},
{"id":"n-e87ffb64","guard":[["hasAny",["finland","iraq","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Iraq or Finland":"Iraq has the larger population (38433600 against 5515525)."}}},
{"id":"n-ec1d7cda","guard":[["hasAny",["algeria","between","greater","has","kuwait","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Algeria and Kuwait, which has the greater population":"Algeria has the larger population (42228429 against 4137309)."}}},
{"id":"n-ee0ebb1f","guard":[["hasAny",["between","greater","has","japan","marino","population","san"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Japan and San Marino, which has the greater population":"Japan has the larger population (126529100 against 33785)."}}},
{"id":"n-ef437b35","guard":[["hasAny",["has","larger","martinique","population","senegal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Senegal or Martinique":"Senegal has the larger population (15854360 against 376480)."}}},
{"id":"n-f1b669ca","guard":[["has","angola"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Angola or Central African Republic":"Angola has the larger population (30809762 against 4666377)."}}},
{"id":"n-f1dac0ca","guard":[["hasAny",["has","helena","larger","latvia","population","saint"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Latvia or Saint Helena":"Latvia has the larger population (1927174 against 6600)."}}},
{"id":"n-f1ec8d50","guard":[["hasAny",["has","india"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Central African Republic or India":"India has the larger population (1352617328 against 4666377)."}}},
{"id":"n-f25a541e","guard":[["hasAny",["has","italy"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Suriname or Italy":"Italy has the larger population (60421760 against 575991)."}}},
{"id":"n-f35c2d7a","guard":[["hasAny",["arabia","between","cabo","greater","has","population","saudi","verde"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Cabo Verde and Saudi Arabia, which has the greater population":"Saudi Arabia has the larger population (33699947 against 555987)."}}},
{"id":"n-f41754af","guard":[["hasAny",["between","el","greater","has","nepal","population","salvador"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Nepal and El Salvador, which has the greater population":"Nepal has the larger population (28087871 against 6420744)."}}},
{"id":"n-f5b2eb84","guard":[["hasAny",["between","futuna","greater","has","honduras","population","wallis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Honduras and Wallis and Futuna, which has the greater population":"Honduras has the larger population (9587522 against 15289)."}}},
{"id":"n-f6aef35f","guard":[["hasAny",["equatorial","guinea","has","larger","macedonia","north","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Equatorial Guinea or North Macedonia":"North Macedonia has the larger population (2084367 against 1308974)."}}},
{"id":"n-f6b29497","guard":[["hasAny",["iceland","islands","larger","mariana","northern","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Iceland or Northern Mariana Islands":"Iceland has the larger population (352721 against 56882)."}}},
{"id":"n-faf29374","guard":[["hasAny",["larger","malaysia","population","uganda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Uganda or Malaysia":"Uganda has the larger population (42723139 against 31528585)."}}},
{"id":"n-fb511fa6","guard":[["hasAny",["arabia","larger","latvia","population","saudi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Saudi Arabia or Latvia":"Saudi Arabia has the larger population (33699947 against 1927174)."}}},
{"id":"n-2020ab1a","guard":[["hasAny",["bangladesh","delete","remove","strip out","without"]],["has","tokelau"]],"pyramid":["render.str",["transform.remove",{"lit":"Bangladesh"},["sense.lastWord"]]],"mem":null},
{"id":"n-4f0c1956","guard":[["hasAny",["delete","germany","remove","strip out","without"]],["has","larger"]],"pyramid":["render.str",["transform.remove",{"lit":"Germany"},["sense.lastWord"]]],"mem":null},
{"id":"n-64532383","guard":[["hasAny",["algeria","delete","remove","strip out","without"]],["has","between"]],"pyramid":["render.str",["transform.remove",{"lit":"Algeria"},["sense.lastWord"]]],"mem":null},
{"id":"n-6f76dc33","guard":[["hasAny",["algeria","element","item number","nth","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-7629acb7","guard":[["hasAny",["canada","delete","remove","strip out","without"]],["has","larger"]],"pyramid":["render.str",["transform.remove",{"lit":"Canada"},["sense.lastWord"]]],"mem":null},
{"id":"n-a82c0808","guard":[["hasAny",["chile","delete","remove","strip out","without"]],["has","turks"]],"pyramid":["render.str",["transform.remove",{"lit":"Chile"},["sense.lastWord"]]],"mem":null},
{"id":"n-b4760024","guard":[["hasAny",["afghanistan","delete","remove","strip out","without"]],["has","population"]],"pyramid":["render.str",["transform.remove",{"lit":"Afghanistan"},["sense.lastWord"]]],"mem":null},
{"id":"n-f7c2da07","guard":[["hasAny",["cuba","delete","remove","strip out","without"]],["has","paraguay"]],"pyramid":["render.str",["transform.remove",{"lit":"Cuba"},["sense.lastWord"]]],"mem":null},
{"id":"n-36081268","guard":[["hasAny",["algeria","from position","items from to","slice"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":12},["sense.wordCount"]]],"mem":null},
{"id":"n-3632be3a","guard":[["hasAny",["algeria","from position","items from to","slice"]]],"pyramid":["render.and",["transform.sliceStrs",["sense.words"],{"lit":12},["sense.wordCount"]]],"mem":null},
{"id":"n-40d78aa3","guard":[["hasAny",["algeria","from position","items from to","slice"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":12},["sense.wordCount"]]],"mem":null},
{"id":"n-82ccdf57","guard":[["hasAny",["afghanistan","each word","longest","longest one","longest word","split into words","words"]],["has","population"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"has"}]]]],"mem":null},
{"id":"n-06b10446","guard":[["hasAny",["element","item number","lesotho","longest","longest one","longest word","nth","position"]],["has","united"]],"pyramid":["render.template",{"lit":["Lesotho ",{"slot":0}," the larger ",{"slot":1}," (2108132 against 300)."]},["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e9d909fd","guard":[["hasAny",["djibouti","element","item number","longest","longest one","longest word","nth","position"]],["has","new"]],"pyramid":["render.template",{"lit":["Djibouti ",{"slot":0}," the larger ",{"slot":1}," (958920 against 284060)."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f37bf718","guard":[["hasAny",["bahamas","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (7650154 against 385640)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-09977c3e","guard":[["hasAny",["longest","longest one","longest word","malaysia","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (42723139 against 31528585)."]},["aggregate.shortest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0d21afed","guard":[["hasAny",["bahamas","element","item number","longest","longest one","longest word","nth","position"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (7650154 against 385640)."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-203bd19a","guard":[["hasAny",["african","longest","longest one","longest word","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (30809762 against 4666377)."]},["aggregate.shortest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2ad95ea3","guard":[["hasAny",["longest","longest one","longest word","myanmar","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (53708395 against 19466145)."]},["aggregate.shortest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-43d58d57","guard":[["hasAny",["element","french","item number","longest","longest one","longest word","nth","position"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the larger ",{"slot":2}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4893980e","guard":[["hasAny",["ireland","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (212215030 against 4867309)."]},["aggregate.longest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-63397c55","guard":[["hasAny",["bermuda","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","djibouti"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (958920 against 63973)."]},["aggregate.longest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a3c4adf1","guard":[["hasAny",["djibouti","element","item number","nth","position"]],["has","new"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger population (958920 against 284060)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-a7f5c450","guard":[["hasAny",["equatorial","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (6956071 against 1308974)."]},["aggregate.shortest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ab52712c","guard":[["hasAny",["longest","longest one","longest word","mauritania","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (15854360 against 4403319)."]},["aggregate.shortest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-bb69cba2","guard":[["hasAny",["brazil","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (209469333 against 109224559)."]},["aggregate.shortest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-bcd78d77","guard":[["hasAny",["iceland","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","mariana"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (352721 against 56882)."]},["aggregate.shortest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cfb2ab7e","guard":[["hasAny",["longest","longest one","longest word","myanmar","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (53708395 against 19466145)."]},["aggregate.longest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ec4f5daa","guard":[["hasAny",["antigua","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (37057765 against 96286)."]},["aggregate.shortest",["sense.list"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f2ece211","guard":[["hasAny",["bahamas","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," population (7650154 against 385640)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0b989aa8","guard":[["hasAny",["bermuda","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","djibouti"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (958920 against 63973)."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-185e244c","guard":[["hasAny",["brazil","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (209469333 against 109224559)."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-23d1aaa8","guard":[["hasAny",["el","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (29767108 against 6420744)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-270d8a60","guard":[["hasAny",["element","item number","longest","longest one","longest word","marino","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (10283822 against 33785)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-28838c6d","guard":[["hasAny",["element","grenadines","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (859959 against 110210)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3a26072d","guard":[["hasAny",["bahamas","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra Leone ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," (7650154 against 385640)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3ac60298","guard":[["hasAny",["element","ireland","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (212215030 against 4867309)."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-447b3bce","guard":[["hasAny",["element","item number","longest","longest one","longest word","myanmar","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (53708395 against 19466145)."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4fe0587f","guard":[["hasAny",["djibouti","element","item number","nth","position"]],["has","new"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (958920 against 284060)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.subject"]],"mem":null},
{"id":"n-660fe355","guard":[["hasAny",["djibouti","element","item number","nth","position"]],["has","new"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (958920 against 284060)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-8b5dda24","guard":[["hasAny",["african","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (30809762 against 4666377)."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8e6f8f41","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ba930eb2","guard":[["hasAny",["element","item number","longest","longest one","longest word","malaysia","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (42723139 against 31528585)."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-bcd39b22","guard":[["hasAny",["arab","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (11353142 against 9630959)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c52e1352","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":["Mexico ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," (126190788 against 754394)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d49bd584","guard":[["hasAny",["element","iceland","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","mariana"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (352721 against 56882)."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e0275766","guard":[["hasAny",["element","finland","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (38433600 against 5515525)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ed943611","guard":[["hasAny",["element","french","item number","nth","position"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," population (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f3969dad","guard":[["hasAny",["element","equatorial","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (6956071 against 1308974)."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-03d94ea6","guard":[["hasAny",["bahamas","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-048960cc","guard":[["hasAny",["bhutan","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," population (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0c56900e","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0e7ff2f3","guard":[["hasAny",["equatorial","first n","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (6956071 against 1308974)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-139459a1","guard":[["hasAny",["element","finland","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (38433600 against 5515525)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2c92b0cd","guard":[["hasAny",["djibouti","element","item number","longest","longest one","longest word","nth","position"]],["has","new"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (958920 against 284060)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-392ff27b","guard":[["hasAny",["first n","longest","longest one","longest word","malaysia","shortest","shortest one","shortest word","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (42723139 against 31528585)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4686719e","guard":[["hasAny",["element","grenadines","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (859959 against 110210)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-57d7a1ab","guard":[["hasAny",["african","first n","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (30809762 against 4666377)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5cbd2b12","guard":[["hasAny",["first n","ireland","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (212215030 against 4867309)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-64bdf299","guard":[["hasAny",["element","french","item number","longest","longest one","longest word","nth","position"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," Guiana has the ",{"slot":1}," ",{"slot":2}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6b76a3a9","guard":[["hasAny",["bahamas","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-76a405e0","guard":[["hasAny",["bahamas","element","item number","longest","longest one","longest word","nth","position"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["sense.lastWord"],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-823eb5cb","guard":[["hasAny",["equatorial","first n","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","paraguay"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (6956071 against 1308974)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a0dc96d1","guard":[["hasAny",["element","iraq","item number","longest","longest one","longest word","nth","position"]],["has","faroe"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (38433600 against 48497)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a591c4a3","guard":[["hasAny",["all caps","capital letters","capitals","djibouti","element","item number","nth","position","upper case","uppercase"]],["has","new"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (958920 against 284060)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-ac78bd59","guard":[["hasAny",["african","first n","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (30809762 against 4666377)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-acaabc76","guard":[["hasAny",["first n","longest","longest one","longest word","malaysia","shortest","shortest one","shortest word","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (42723139 against 31528585)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ae324337","guard":[["hasAny",["first n","longest","longest one","longest word","myanmar","shortest","shortest one","shortest word","take","top"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (53708395 against 19466145)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b95b5bd7","guard":[["hasAny",["djibouti","element","invert case","item number","nth","position","swap case","toggle case"]],["has","new"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (958920 against 284060)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bacd2c58","guard":[["hasAny",["bermuda","first n","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","djibouti"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (958920 against 63973)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-be4844bb","guard":[["hasAny",["first n","iceland","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","mariana"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (352721 against 56882)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-bfb3e23c","guard":[["hasAny",["djibouti","element","item number","longest","longest one","longest word","nth","position"]],["has","new"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (958920 against 284060)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c56508e3","guard":[["hasAny",["djibouti","element","item number","lower case","lowercase","nth","position","small letters"]],["has","new"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (958920 against 284060)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c8b4c2fd","guard":[["hasAny",["bermuda","first n","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","djibouti"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (958920 against 63973)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ce0eac32","guard":[["hasAny",["bahamas","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["sense.subject"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d931713b","guard":[["hasAny",["brazil","first n","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (209469333 against 109224559)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-dd18d223","guard":[["hasAny",["capitalise","capitalize","capitalize each word","djibouti","element","item number","nth","position","title case"]],["has","new"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (958920 against 284060)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e4c4ecf0","guard":[["hasAny",["first n","longest","longest one","longest word","myanmar","shortest","shortest one","shortest word","take","top"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (53708395 against 19466145)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e5901943","guard":[["hasAny",["first n","ireland","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (212215030 against 4867309)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f789f3c0","guard":[["hasAny",["brazil","first n","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","population"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (209469333 against 109224559)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fea0d333","guard":[["hasAny",["first n","iceland","longest","longest one","longest word","shortest","shortest one","shortest word","take","top"]],["has","mariana"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (352721 against 56882)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-016685bc","guard":[["hasAny",["bahamas","element","invert case","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["transform.swapCase",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-04fee912","guard":[["hasAny",["element","finland","first n","item number","longest","longest one","longest word","nth","position","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (38433600 against 5515525)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0989b150","guard":[["hasAny",["all caps","bahamas","capital letters","capitals","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["transform.upper",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1d882433","guard":[["hasAny",["element","french","item number","longest","longest one","longest word","nth","position"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2418024f","guard":[["hasAny",["bahamas","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2d47aa36","guard":[["hasAny",["all caps","bahamas","capital letters","capitals","element","item number","longest","longest one","longest word","nth","position","upper case","uppercase"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["sense.lastWord"],["transform.upper",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-393cbd97","guard":[["hasAny",["bahamas","element","item number","longest","longest one","longest word","nth","position"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-54f7e0c4","guard":[["hasAny",["bahamas","element","item number","longest","longest one","longest word","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-69fbf7d1","guard":[["hasAny",["bahamas","capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","title case"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["transform.title",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7d53c870","guard":[["hasAny",["bahamas","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-81cfdbc0","guard":[["hasAny",["element","first n","grenadines","item number","longest","longest one","longest word","nth","position","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (859959 against 110210)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9146b368","guard":[["hasAny",["element","french","item number","nth","position"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a44c721f","guard":[["hasAny",["bahamas","element","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c7c9caa0","guard":[["hasAny",["djibouti","each word","element","item number","nth","position","split into words"]],["has","new"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (958920 against 284060)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c9961486","guard":[["hasAny",["element","finland","first n","item number","longest","longest one","longest word","nth","position","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (38433600 against 5515525)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ca789294","guard":[["hasAny",["bahamas","capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","nth","position","title case"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e4cf248d","guard":[["hasAny",["bahamas","element","item number","longest","longest one","longest word","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["transform.lower",["sense.subject"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e699d5ed","guard":[["hasAny",["bahamas","element","item number","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["sense.lastWord"],["transform.lower",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e7b109f2","guard":[["hasAny",["element","french","item number","longest","longest one","longest word","nth","position"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f94c2707","guard":[["hasAny",["djibouti","each word","element","item number","nth","position","split into words"]],["has","new"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (958920 against 284060)."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fbcd9a0e","guard":[["hasAny",["element","first n","grenadines","item number","longest","longest one","longest word","nth","position","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (859959 against 110210)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-22ed16b7","guard":[["hasAny",["bahamas","each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["render.list",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2684da38","guard":[["hasAny",["element","french","item number","nth","position"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-39ba8d17","guard":[["hasAny",["element","french","invert case","item number","nth","position","swap case","toggle case"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-3fa3d9c2","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-47c090ba","guard":[["hasAny",["bahamas","each word","element","item number","longest","longest one","longest word","nth","position","split into words"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-515fbb61","guard":[["hasAny",["diagonal","element","hypotenuse","item number","liechtenstein","longest","longest one","longest word","nth","position","pythagoras","pythagorean"]],["has","between"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (37910 against ",{"slot":3},")."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["render.number",["compute.hypot",["sense.wordCount"],{"lit":6600}]]],"mem":null},
{"id":"n-56616565","guard":[["hasAny",["all caps","capital letters","capitals","element","french","item number","nth","position","upper case","uppercase"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.upper",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-65b7ef1f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","french","item number","nth","position","title case"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-71436cb3","guard":[["hasAny",["bahamas","each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["render.and",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7767bcb4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","french","item number","longest","longest one","longest word","nth","position","title case"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8026f82e","guard":[["hasAny",["element","french","item number","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8579388c","guard":[["hasAny",["element","french","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-958036d6","guard":[["hasAny",["all caps","capital letters","capitals","element","french","item number","longest","longest one","longest word","nth","position","upper case","uppercase"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9e2833d0","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a2f59459","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b0c23041","guard":[["hasAny",["bahamas","each word","element","item number","longest","longest one","longest word","nth","position","split into words"]],["has","larger"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (7650154 against 385640)."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c44527b7","guard":[["hasAny",["element","french","item number","lower case","lowercase","nth","position","small letters"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.lower",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-0650f3e5","guard":[["hasAny",["diagonal","element","hypotenuse","item number","longest","longest one","longest word","nauru","nth","position","pythagoras","pythagorean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (41801533 against ",{"slot":3},")."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["compute.hypot",["sense.wordCount"],{"lit":12704}]]],"mem":null},
{"id":"n-11371893","guard":[["hasAny",["each word","element","french","item number","nth","position","split into words"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-1b2b33a4","guard":[["hasAny",["each word","element","french","item number","nth","position","split into words"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-2115740e","guard":[["hasAny",["bhutan","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-25e84c4d","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-40697014","guard":[["hasAny",["bhutan","capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","nth","position","title case"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-79821394","guard":[["hasAny",["cocos","decimal places","element","item number","longest","longest one","longest word","nth","position","round to","rounded to","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (28870195 against ",{"slot":3},")."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["transform.roundTo",{"lit":596},["sense.wordCount"]]]],"mem":null},
{"id":"n-8cfb5ef2","guard":[["hasAny",["andorra","divide","divided by","element","item number","longest","longest one","longest word","nth","over","per","position","quotient","shortest","shortest one","shortest word","split"]],["has","british"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (77006 against ",{"slot":3},")."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["transform.div",["sense.wordCount"],{"lit":1000}]]],"mem":null},
{"id":"n-8e85bdfe","guard":[["hasAny",["bhutan","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8f4feb7f","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9f9edff4","guard":[["hasAny",["each word","element","french","item number","longest","longest one","longest word","nth","position","split into words"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c259de80","guard":[["hasAny",["diagonal","element","hypotenuse","item number","longest","longest one","longest word","nauru","nth","position","pythagoras","pythagorean","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (41801533 against ",{"slot":3},")."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["compute.hypot",["sense.wordCount"],{"lit":12704}]]],"mem":null},
{"id":"n-f1f1b1c5","guard":[["hasAny",["delete","element","french","item number","longest","longest one","longest word","nth","position","remove","strip out","without"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["transform.remove",["sense.lastWord"],["sense.subject"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f36eacaf","guard":[["hasAny",["each word","element","french","item number","longest","longest one","longest word","nth","position","split into words"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fee54e62","guard":[["hasAny",["bhutan","element","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ff7bff60","guard":[["hasAny",["aruba","decimal places","element","item number","longest","longest one","longest word","nth","position","round to","rounded to","shortest","shortest one","shortest word"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (105845 against ",{"slot":3},")."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["transform.roundTo",{"lit":67},["sense.wordCount"]]]],"mem":null},
{"id":"n-ffd87072","guard":[["hasAny",["all caps","bhutan","capital letters","capitals","element","item number","longest","longest one","longest word","nth","position","upper case","uppercase"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3a437765","guard":[["hasAny",["diagonal","element","hypotenuse","item number","longest","longest one","longest word","nauru","nth","position","pythagoras","pythagorean"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (41801533 against ",{"slot":3},")."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["compute.hypot",["sense.wordCount"],{"lit":12704}]]],"mem":null},
{"id":"n-4c5ab0e2","guard":[["hasAny",["bhutan","each word","element","item number","longest","longest one","longest word","nth","position","split into words"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5eb8bd64","guard":[["hasAny",["aruba","decimal places","element","item number","longest","longest one","longest word","nth","position","round to","rounded to"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (105845 against ",{"slot":3},")."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["transform.roundTo",{"lit":67},["sense.wordCount"]]]],"mem":null},
{"id":"n-9269b6a7","guard":[["hasAny",["element","french","item number","longest","longest one","longest word","nth","position","separate by","split","split by"]],["has","saint"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (290691 against 52441)."]},["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.split",["sense.lastWord"],["sense.subject"]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-99ab414c","guard":[["hasAny",["bhutan","each word","element","item number","longest","longest one","longest word","nth","position","split into words"]],["has","has"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (126190788 against 754394)."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a1fbe804","guard":[["hasAny",["andorra","divide","divided by","element","item number","longest","longest one","longest word","nth","over","per","position","quotient","split"]],["has","british"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (77006 against ",{"slot":3},")."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["transform.div",["sense.wordCount"],{"lit":1000}]]],"mem":null},
{"id":"n-f129d59f","guard":[["hasAny",["cocos","decimal places","element","item number","longest","longest one","longest word","nth","position","round to","rounded to"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (28870195 against ",{"slot":3},")."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["transform.roundTo",{"lit":596},["sense.wordCount"]]]],"mem":null},
{"id":"n-60e21f92","guard":[["hasAny",["aruba","decimal places","element","first n","item number","longest","longest one","longest word","nth","position","round to","rounded to","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (105845 against ",{"slot":3},")."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["transform.roundTo",{"lit":67},["sense.wordCount"]]]],"mem":null},
{"id":"n-61d1fd02","guard":[["hasAny",["andorra","divide","divided by","element","first n","item number","longest","longest one","longest word","nth","over","per","position","quotient","split","take","top"]],["has","british"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (77006 against ",{"slot":3},")."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["transform.div",["sense.wordCount"],{"lit":1000}]]],"mem":null},
{"id":"n-708cd159","guard":[["hasAny",["cocos","decimal places","element","first n","item number","longest","longest one","longest word","nth","position","round to","rounded to","take","top"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (28870195 against ",{"slot":3},")."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["transform.roundTo",{"lit":596},["sense.wordCount"]]]],"mem":null},
{"id":"n-71a79545","guard":[["hasAny",["diagonal","element","first n","hypotenuse","item number","longest","longest one","longest word","nauru","nth","position","pythagoras","pythagorean","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (41801533 against ",{"slot":3},")."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["compute.hypot",["sense.wordCount"],{"lit":12704}]]],"mem":null},
{"id":"n-7bb2dfee","guard":[["hasAny",["aruba","decimal places","element","first n","item number","longest","longest one","longest word","nth","position","round to","rounded to","take","top"]],["has","whose"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (105845 against ",{"slot":3},")."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["transform.roundTo",{"lit":67},["sense.wordCount"]]]],"mem":null},
{"id":"n-7e893f6e","guard":[["hasAny",["cocos","decimal places","element","first n","item number","longest","longest one","longest word","nth","position","round to","rounded to","take","top"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (28870195 against ",{"slot":3},")."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["transform.roundTo",{"lit":596},["sense.wordCount"]]]],"mem":null},
{"id":"n-caf33868","guard":[["hasAny",["diagonal","element","first n","hypotenuse","item number","longest","longest one","longest word","nauru","nth","position","pythagoras","pythagorean","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (41801533 against ",{"slot":3},")."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["compute.hypot",["sense.wordCount"],{"lit":12704}]]],"mem":null},
{"id":"n-f4f7b289","guard":[["hasAny",["andorra","divide","divided by","element","first n","item number","longest","longest one","longest word","nth","over","per","position","quotient","split","take","top"]],["has","british"]],"pyramid":["render.template",{"lit":[{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (77006 against ",{"slot":3},")."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]],["render.number",["transform.div",["sense.wordCount"],{"lit":1000}]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which has the larger population, British Indian Ocean Territory or Eswatini","expect":{"contains":["Eswatini"],"notContains":["British Indian Ocean Territory"],"notRefusal":true}},{"q":"between Chile and Turks and Caicos Islands, which has the greater population","expect":{"contains":["Chile"],"notContains":["Turks and Caicos Islands"],"notRefusal":true}},{"q":"whose population is larger: Reunion or Saint Vincent and the Grenadines","expect":{"contains":["Reunion"],"notContains":["Saint Vincent and the Grenadines"],"notRefusal":true}},{"q":"between Honduras and Wallis and Futuna, which has the greater population","expect":{"contains":["Honduras"],"notContains":["Wallis and Futuna"],"notRefusal":true}},{"q":"between New Caledonia and Djibouti, which has the greater population","expect":{"contains":["Djibouti"],"notContains":["New Caledonia"],"notRefusal":true}},{"q":"whose population is larger: Lesotho or Afghanistan","expect":{"contains":["Afghanistan"],"notContains":["Lesotho"],"notRefusal":true}},{"q":"whose population is larger: Angola or Central African Republic","expect":{"contains":["Angola"],"notContains":["Central African Republic"],"notRefusal":true}},{"q":"between Armenia and United Arab Emirates, which has the greater population","expect":{"contains":["United Arab Emirates"],"notContains":["Armenia"],"notRefusal":true}},{"q":"whose population is larger: Paraguay or Equatorial Guinea","expect":{"contains":["Paraguay"],"notContains":["Equatorial Guinea"],"notRefusal":true}},{"q":"which has the larger population, Ivory Coast or Armenia","expect":{"contains":["Ivory Coast"],"notContains":["Armenia"],"notRefusal":true}},{"q":"which has the larger population, Ghana or Turkey","expect":{"contains":["Turkey"],"notContains":["Ghana"],"notRefusal":true}},{"q":"between Serbia and Sudan, which has the greater population","expect":{"contains":["Sudan"],"notContains":["Serbia"],"notRefusal":true}},{"q":"between Greece and Guyana, which has the greater population","expect":{"contains":["Greece"],"notContains":["Guyana"],"notRefusal":true}},{"q":"which has the larger population, Rwanda or Tunisia","expect":{"contains":["Rwanda"],"notContains":["Tunisia"],"notRefusal":true}},{"q":"between Eswatini and Myanmar, which has the greater population","expect":{"contains":["Myanmar"],"notContains":["Eswatini"],"notRefusal":true}},{"q":"which has the larger population, Portugal or Cuba","expect":{"contains":["Cuba"],"notContains":["Portugal"],"notRefusal":true}},{"q":"between Svalbard and Jan Mayen and Guinea, which has the greater population","expect":{"contains":["Guinea"],"notContains":["Svalbard and Jan Mayen"],"notRefusal":true}},{"q":"whose population is larger: United Arab Emirates or Bolivia","expect":{"contains":["Bolivia"],"notContains":["United Arab Emirates"],"notRefusal":true}},{"q":"which has the larger population, Malaysia or Seychelles","expect":{"contains":["Malaysia"],"notContains":["Seychelles"],"notRefusal":true}},{"q":"between United States Minor Outlying Islands and Lesotho, which has the greater population","expect":{"contains":["Lesotho"],"notContains":["United States Minor Outlying Islands"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
