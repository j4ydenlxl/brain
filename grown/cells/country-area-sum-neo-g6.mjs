// country-area-sum-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"country-area-sum-neo-g6","class":"country-area-sum","generation":6,"lane":"neo","grownFrom":["the surface area of Iceland plus the surface area of French Guiana makes what","what is the sum of the surface area of Netherlands Antilles and Honduras","add the surface area of Hungary to the surface area of Papua New Guinea","add the surface area of Thailand to the surface area of Kuwait","what is the sum of the surface area of French Southern territories and Fiji Islands","add the surface area of Tanzania to the surface area of Madagascar","the surface area of Madagascar plus the surface area of Uzbekistan makes what","add the surface area of North Korea to the surface area of Gibraltar","what is the sum of the surface area of Nepal and Russia","what is the sum of the surface area of Kazakhstan and Thailand","the surface area of Somalia plus the surface area of Malawi makes what","add the surface area of Djibouti to the surface area of Estonia","what is the sum of the surface area of Gabon and Iraq","what is the sum of the surface area of Turkmenistan and Tokelau","what is the sum of the surface area of French Guiana and Hungary","what is the sum of the surface area of Malawi and Maldives","the surface area of New Caledonia plus the surface area of Netherlands Antilles makes what","add the surface area of Tokelau to the surface area of Zambia","what is the sum of the surface area of Holy See (Vatican City State) and Djibouti","what is the sum of the surface area of Canada and Tanzania"],"version":1});

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
{"id":"n-9091da26","guard":[["has","area"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Iceland plus the surface area of French Guiana makes what":"The surface area of Iceland (103000) plus that of French Guiana (90000) is 193000.","what is the sum of the surface area of Netherlands Antilles and Honduras":"The surface area of Netherlands Antilles (800) plus that of Honduras (112088) is 112888.","add the surface area of Hungary to the surface area of Papua New Guinea":"The surface area of Hungary (93030) plus that of Papua New Guinea (462840) is 555870.","add the surface area of Thailand to the surface area of Kuwait":"The surface area of Thailand (513115) plus that of Kuwait (17818) is 530933.","what is the sum of the surface area of French Southern territories and Fiji Islands":"The surface area of French Southern territories (7780) plus that of Fiji Islands (18274) is 26054.","add the surface area of Tanzania to the surface area of Madagascar":"The surface area of Tanzania (883749) plus that of Madagascar (587041) is 1470790.","the surface area of Madagascar plus the surface area of Uzbekistan makes what":"The surface area of Madagascar (587041) plus that of Uzbekistan (447400) is 1034441.","add the surface area of North Korea to the surface area of Gibraltar":"The surface area of North Korea (120538) plus that of Gibraltar (6) is 120544.","what is the sum of the surface area of Nepal and Russia":"The surface area of Nepal (147181) plus that of Russia (17075400) is 17222581.","what is the sum of the surface area of Kazakhstan and Thailand":"The surface area of Kazakhstan (2724900) plus that of Thailand (513115) is 3238015.","the surface area of Somalia plus the surface area of Malawi makes what":"The surface area of Somalia (637657) plus that of Malawi (118484) is 756141.","add the surface area of Djibouti to the surface area of Estonia":"The surface area of Djibouti (23200) plus that of Estonia (45227) is 68427.","what is the sum of the surface area of Gabon and Iraq":"The surface area of Gabon (267668) plus that of Iraq (438317) is 705985.","what is the sum of the surface area of Turkmenistan and Tokelau":"The surface area of Turkmenistan (488100) plus that of Tokelau (12) is 488112.","what is the sum of the surface area of French Guiana and Hungary":"The surface area of French Guiana (90000) plus that of Hungary (93030) is 183030.","what is the sum of the surface area of Malawi and Maldives":"The surface area of Malawi (118484) plus that of Maldives (298) is 118782.","the surface area of New Caledonia plus the surface area of Netherlands Antilles makes what":"The surface area of New Caledonia (18575) plus that of Netherlands Antilles (800) is 19375.","add the surface area of Tokelau to the surface area of Zambia":"The surface area of Tokelau (12) plus that of Zambia (752618) is 752630.","what is the sum of the surface area of Holy See (Vatican City State) and Djibouti":"The surface area of Holy See (Vatican City State) (0.4) plus that of Djibouti (23200) is 23200.4.","what is the sum of the surface area of Canada and Tanzania":"The surface area of Canada (9970610) plus that of Tanzania (883749) is 10854359.","add the surface area of Russia to the surface area of Niger":"The surface area of Russia (17075400) plus that of Niger (1267000) is 18342400.","the surface area of Costa Rica plus the surface area of Turkmenistan makes what":"The surface area of Costa Rica (51100) plus that of Turkmenistan (488100) is 539200.","the surface area of Brunei plus the surface area of Andorra makes what":"The surface area of Brunei (5765) plus that of Andorra (468) is 6233.","add the surface area of Rwanda to the surface area of Lebanon":"The surface area of Rwanda (26338) plus that of Lebanon (10400) is 36738.","the surface area of Serbia plus the surface area of San Marino makes what":"The surface area of Serbia (88361) plus that of San Marino (61) is 88422.","add the surface area of Mongolia to the surface area of Barbados":"The surface area of Mongolia (1566500) plus that of Barbados (430) is 1566930.","add the surface area of Ghana to the surface area of Iceland":"The surface area of Ghana (238533) plus that of Iceland (103000) is 341533.","the surface area of United Kingdom plus the surface area of Pitcairn makes what":"The surface area of United Kingdom (242900) plus that of Pitcairn (49) is 242949.","what is the sum of the surface area of Dominican Republic and Rwanda":"The surface area of Dominican Republic (48511) plus that of Rwanda (26338) is 74849.","the surface area of Cook Islands plus the surface area of American Samoa makes what":"The surface area of Cook Islands (236) plus that of American Samoa (199) is 435.","what is the sum of the surface area of Ukraine and Ghana":"The surface area of Ukraine (603700) plus that of Ghana (238533) is 842233.","the surface area of Lesotho plus the surface area of Niue makes what":"The surface area of Lesotho (30355) plus that of Niue (260) is 30615.","the surface area of Zambia plus the surface area of Bangladesh makes what":"The surface area of Zambia (752618) plus that of Bangladesh (143998) is 896616.","what is the sum of the surface area of Cocos (Keeling) Islands and North Korea":"The surface area of Cocos (Keeling) Islands (14) plus that of North Korea (120538) is 120552.","add the surface area of Aruba to the surface area of Lesotho":"The surface area of Aruba (193) plus that of Lesotho (30355) is 30548.","what is the sum of the surface area of American Samoa and Benin":"The surface area of American Samoa (199) plus that of Benin (112622) is 112821.","add the surface area of Fiji Islands to the surface area of Albania":"The surface area of Fiji Islands (18274) plus that of Albania (28748) is 47022.","add the surface area of Uganda to the surface area of British Virgin Islands":"The surface area of Uganda (241038) plus that of British Virgin Islands (151) is 241189.","the surface area of Papua New Guinea plus the surface area of Nepal makes what":"The surface area of Papua New Guinea (462840) plus that of Nepal (147181) is 610021.","what is the sum of the surface area of Angola and Slovenia":"The surface area of Angola (1246700) plus that of Slovenia (20256) is 1266956.","add the surface area of United States to the surface area of Brunei":"The surface area of United States (9363520) plus that of Brunei (5765) is 9369285.","add the surface area of Reunion to the surface area of Cameroon":"The surface area of Reunion (2510) plus that of Cameroon (475442) is 477952.","the surface area of Cameroon plus the surface area of Gabon makes what":"The surface area of Cameroon (475442) plus that of Gabon (267668) is 743110.","add the surface area of Finland to the surface area of Qatar":"The surface area of Finland (338145) plus that of Qatar (11000) is 349145.","add the surface area of Wallis and Futuna to the surface area of Bulgaria":"The surface area of Wallis and Futuna (200) plus that of Bulgaria (110994) is 111194.","what is the sum of the surface area of Malta and Uganda":"The surface area of Malta (316) plus that of Uganda (241038) is 241354.","add the surface area of Croatia to the surface area of Brazil":"The surface area of Croatia (56538) plus that of Brazil (8547403) is 8603941.","add the surface area of Switzerland to the surface area of Taiwan":"The surface area of Switzerland (41284) plus that of Taiwan (36188) is 77472.","what is the sum of the surface area of San Marino and Netherlands":"The surface area of San Marino (61) plus that of Netherlands (41526) is 41587.","what is the sum of the surface area of Andorra and Singapore":"The surface area of Andorra (468) plus that of Singapore (618) is 1086.","add the surface area of Netherlands to the surface area of Bosnia and Herzegovina":"The surface area of Netherlands (41526) plus that of Bosnia and Herzegovina (51197) is 92723.","the surface area of Svalbard and Jan Mayen plus the surface area of Chile makes what":"The surface area of Svalbard and Jan Mayen (62422) plus that of Chile (756626) is 819048.","add the surface area of Bahamas to the surface area of Laos":"The surface area of Bahamas (13878) plus that of Laos (236800) is 250678.","what is the sum of the surface area of Puerto Rico and Aruba":"The surface area of Puerto Rico (8875) plus that of Aruba (193) is 9068.","the surface area of Burundi plus the surface area of Holy See (Vatican City State) makes what":"The surface area of Burundi (27834) plus that of Holy See (Vatican City State) (0.4) is 27834.4.","the surface area of Niger plus the surface area of Libya makes what":"The surface area of Niger (1267000) plus that of Libya (1759540) is 3026540.","the surface area of British Virgin Islands plus the surface area of Northern Mariana Islands makes what":"The surface area of British Virgin Islands (151) plus that of Northern Mariana Islands (464) is 615.","the surface area of Bosnia and Herzegovina plus the surface area of Kazakhstan makes what":"The surface area of Bosnia and Herzegovina (51197) plus that of Kazakhstan (2724900) is 2776097.","what is the sum of the surface area of Mayotte and Mongolia":"The surface area of Mayotte (373) plus that of Mongolia (1566500) is 1566873.","the surface area of Brazil plus the surface area of Turks and Caicos Islands makes what":"The surface area of Brazil (8547403) plus that of Turks and Caicos Islands (430) is 8547833.","what is the sum of the surface area of Niue and Namibia":"The surface area of Niue (260) plus that of Namibia (824292) is 824552.","add the surface area of Honduras to the surface area of Burundi":"The surface area of Honduras (112088) plus that of Burundi (27834) is 139922.","the surface area of Qatar plus the surface area of French Southern territories makes what":"The surface area of Qatar (11000) plus that of French Southern territories (7780) is 18780.","add the surface area of Portugal to the surface area of Greenland":"The surface area of Portugal (91982) plus that of Greenland (2166090) is 2258072.","the surface area of Japan plus the surface area of Malta makes what":"The surface area of Japan (377829) plus that of Malta (316) is 378145.","the surface area of Saint Kitts and Nevis plus the surface area of Dominican Republic makes what":"The surface area of Saint Kitts and Nevis (261) plus that of Dominican Republic (48511) is 48772.","what is the sum of the surface area of Pitcairn and Croatia":"The surface area of Pitcairn (49) plus that of Croatia (56538) is 56587.","add the surface area of Martinique to the surface area of New Caledonia":"The surface area of Martinique (1102) plus that of New Caledonia (18575) is 19677.","the surface area of Estonia plus the surface area of Puerto Rico makes what":"The surface area of Estonia (45227) plus that of Puerto Rico (8875) is 54102.","the surface area of Barbados plus the surface area of Mali makes what":"The surface area of Barbados (430) plus that of Mali (1240192) is 1240622.","the surface area of Laos plus the surface area of Canada makes what":"The surface area of Laos (236800) plus that of Canada (9970610) is 10207410.","add the surface area of Benin to the surface area of Japan":"The surface area of Benin (112622) plus that of Japan (377829) is 490451.","what is the sum of the surface area of Turks and Caicos Islands and Bahamas":"The surface area of Turks and Caicos Islands (430) plus that of Bahamas (13878) is 14308.","the surface area of Albania plus the surface area of Hong Kong makes what":"The surface area of Albania (28748) plus that of Hong Kong (1075) is 29823.","add the surface area of Chad to the surface area of Cook Islands":"The surface area of Chad (1284000) plus that of Cook Islands (236) is 1284236.","the surface area of Lebanon plus the surface area of Kiribati makes what":"The surface area of Lebanon (10400) plus that of Kiribati (726) is 11126.","what is the sum of the surface area of Comoros and Finland":"The surface area of Comoros (1862) plus that of Finland (338145) is 340007.","the surface area of Gibraltar plus the surface area of Ukraine makes what":"The surface area of Gibraltar (6) plus that of Ukraine (603700) is 603706.","what is the sum of the surface area of Northern Mariana Islands and Wallis and Futuna":"The surface area of Northern Mariana Islands (464) plus that of Wallis and Futuna (200) is 664.","add the surface area of Iraq to the surface area of Svalbard and Jan Mayen":"The surface area of Iraq (438317) plus that of Svalbard and Jan Mayen (62422) is 500739.","add the surface area of Singapore to the surface area of United Kingdom":"The surface area of Singapore (618) plus that of United Kingdom (242900) is 243518.","add the surface area of Grenada to the surface area of Saint Kitts and Nevis":"The surface area of Grenada (344) plus that of Saint Kitts and Nevis (261) is 605.","what is the sum of the surface area of Kiribati and United States":"The surface area of Kiribati (726) plus that of United States (9363520) is 9364246.","the surface area of Greenland plus the surface area of Ethiopia makes what":"The surface area of Greenland (2166090) plus that of Ethiopia (1104300) is 3270390.","the surface area of Guinea plus the surface area of Cocos (Keeling) Islands makes what":"The surface area of Guinea (245857) plus that of Cocos (Keeling) Islands (14) is 245871.","what is the sum of the surface area of Panama and Reunion":"The surface area of Panama (75517) plus that of Reunion (2510) is 78027.","the surface area of Taiwan plus the surface area of Angola makes what":"The surface area of Taiwan (36188) plus that of Angola (1246700) is 1282888.","add the surface area of Nicaragua to the surface area of Costa Rica":"The surface area of Nicaragua (130000) plus that of Costa Rica (51100) is 181100.","what is the sum of the surface area of Bangladesh and Portugal":"The surface area of Bangladesh (143998) plus that of Portugal (91982) is 235980.","what is the sum of the surface area of Ethiopia and Chad":"The surface area of Ethiopia (1104300) plus that of Chad (1284000) is 2388300.","the surface area of Kuwait plus the surface area of Mayotte makes what":"The surface area of Kuwait (17818) plus that of Mayotte (373) is 18191.","what is the sum of the surface area of Uzbekistan and Nicaragua":"The surface area of Uzbekistan (447400) plus that of Nicaragua (130000) is 577400.","the surface area of Bulgaria plus the surface area of Panama makes what":"The surface area of Bulgaria (110994) plus that of Panama (75517) is 186511.","add the surface area of Equatorial Guinea to the surface area of Serbia":"The surface area of Equatorial Guinea (28051) plus that of Serbia (88361) is 116412.","add the surface area of Slovenia to the surface area of Somalia":"The surface area of Slovenia (20256) plus that of Somalia (637657) is 657913.","what is the sum of the surface area of Libya and Grenada":"The surface area of Libya (1759540) plus that of Grenada (344) is 1759884.","what is the sum of the surface area of Chile and Switzerland":"The surface area of Chile (756626) plus that of Switzerland (41284) is 797910.","what is the sum of the surface area of Mali and Martinique":"The surface area of Mali (1240192) plus that of Martinique (1102) is 1241294.","add the surface area of Namibia to the surface area of Guinea":"The surface area of Namibia (824292) plus that of Guinea (245857) is 1070149.","what is the sum of the surface area of Hong Kong and Equatorial Guinea":"The surface area of Hong Kong (1075) plus that of Equatorial Guinea (28051) is 29126."}}},
{"id":"n-4b878e59","guard":[["has","area"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"surface"}]]],"mem":{"table":{"area of Iceland plus the surface area of French Guiana makes what":"The surface area of Iceland (103000) plus that of French Guiana (90000) is 193000.","area of Netherlands Antilles and Honduras":"The surface area of Netherlands Antilles (800) plus that of Honduras (112088) is 112888.","area of Hungary to the surface area of Papua New Guinea":"The surface area of Hungary (93030) plus that of Papua New Guinea (462840) is 555870.","area of Thailand to the surface area of Kuwait":"The surface area of Thailand (513115) plus that of Kuwait (17818) is 530933.","area of French Southern territories and Fiji Islands":"The surface area of French Southern territories (7780) plus that of Fiji Islands (18274) is 26054.","area of Tanzania to the surface area of Madagascar":"The surface area of Tanzania (883749) plus that of Madagascar (587041) is 1470790.","area of Madagascar plus the surface area of Uzbekistan makes what":"The surface area of Madagascar (587041) plus that of Uzbekistan (447400) is 1034441.","area of North Korea to the surface area of Gibraltar":"The surface area of North Korea (120538) plus that of Gibraltar (6) is 120544.","area of Nepal and Russia":"The surface area of Nepal (147181) plus that of Russia (17075400) is 17222581.","area of Kazakhstan and Thailand":"The surface area of Kazakhstan (2724900) plus that of Thailand (513115) is 3238015.","area of Somalia plus the surface area of Malawi makes what":"The surface area of Somalia (637657) plus that of Malawi (118484) is 756141.","area of Djibouti to the surface area of Estonia":"The surface area of Djibouti (23200) plus that of Estonia (45227) is 68427.","area of Gabon and Iraq":"The surface area of Gabon (267668) plus that of Iraq (438317) is 705985.","area of Turkmenistan and Tokelau":"The surface area of Turkmenistan (488100) plus that of Tokelau (12) is 488112.","area of French Guiana and Hungary":"The surface area of French Guiana (90000) plus that of Hungary (93030) is 183030.","area of Malawi and Maldives":"The surface area of Malawi (118484) plus that of Maldives (298) is 118782.","area of New Caledonia plus the surface area of Netherlands Antilles makes what":"The surface area of New Caledonia (18575) plus that of Netherlands Antilles (800) is 19375.","area of Tokelau to the surface area of Zambia":"The surface area of Tokelau (12) plus that of Zambia (752618) is 752630.","area of Holy See (Vatican City State) and Djibouti":"The surface area of Holy See (Vatican City State) (0.4) plus that of Djibouti (23200) is 23200.4.","area of Canada and Tanzania":"The surface area of Canada (9970610) plus that of Tanzania (883749) is 10854359.","area of Russia to the surface area of Niger":"The surface area of Russia (17075400) plus that of Niger (1267000) is 18342400.","area of Costa Rica plus the surface area of Turkmenistan makes what":"The surface area of Costa Rica (51100) plus that of Turkmenistan (488100) is 539200.","area of Brunei plus the surface area of Andorra makes what":"The surface area of Brunei (5765) plus that of Andorra (468) is 6233.","area of Rwanda to the surface area of Lebanon":"The surface area of Rwanda (26338) plus that of Lebanon (10400) is 36738.","area of Serbia plus the surface area of San Marino makes what":"The surface area of Serbia (88361) plus that of San Marino (61) is 88422.","area of Mongolia to the surface area of Barbados":"The surface area of Mongolia (1566500) plus that of Barbados (430) is 1566930.","area of Ghana to the surface area of Iceland":"The surface area of Ghana (238533) plus that of Iceland (103000) is 341533.","area of United Kingdom plus the surface area of Pitcairn makes what":"The surface area of United Kingdom (242900) plus that of Pitcairn (49) is 242949.","area of Dominican Republic and Rwanda":"The surface area of Dominican Republic (48511) plus that of Rwanda (26338) is 74849.","area of Cook Islands plus the surface area of American Samoa makes what":"The surface area of Cook Islands (236) plus that of American Samoa (199) is 435.","area of Ukraine and Ghana":"The surface area of Ukraine (603700) plus that of Ghana (238533) is 842233.","area of Lesotho plus the surface area of Niue makes what":"The surface area of Lesotho (30355) plus that of Niue (260) is 30615.","area of Zambia plus the surface area of Bangladesh makes what":"The surface area of Zambia (752618) plus that of Bangladesh (143998) is 896616.","area of Cocos (Keeling) Islands and North Korea":"The surface area of Cocos (Keeling) Islands (14) plus that of North Korea (120538) is 120552.","area of Aruba to the surface area of Lesotho":"The surface area of Aruba (193) plus that of Lesotho (30355) is 30548.","area of American Samoa and Benin":"The surface area of American Samoa (199) plus that of Benin (112622) is 112821.","area of Fiji Islands to the surface area of Albania":"The surface area of Fiji Islands (18274) plus that of Albania (28748) is 47022.","area of Uganda to the surface area of British Virgin Islands":"The surface area of Uganda (241038) plus that of British Virgin Islands (151) is 241189.","area of Papua New Guinea plus the surface area of Nepal makes what":"The surface area of Papua New Guinea (462840) plus that of Nepal (147181) is 610021.","area of Angola and Slovenia":"The surface area of Angola (1246700) plus that of Slovenia (20256) is 1266956.","area of United States to the surface area of Brunei":"The surface area of United States (9363520) plus that of Brunei (5765) is 9369285.","area of Reunion to the surface area of Cameroon":"The surface area of Reunion (2510) plus that of Cameroon (475442) is 477952.","area of Cameroon plus the surface area of Gabon makes what":"The surface area of Cameroon (475442) plus that of Gabon (267668) is 743110.","area of Finland to the surface area of Qatar":"The surface area of Finland (338145) plus that of Qatar (11000) is 349145.","area of Wallis and Futuna to the surface area of Bulgaria":"The surface area of Wallis and Futuna (200) plus that of Bulgaria (110994) is 111194.","area of Malta and Uganda":"The surface area of Malta (316) plus that of Uganda (241038) is 241354.","area of Croatia to the surface area of Brazil":"The surface area of Croatia (56538) plus that of Brazil (8547403) is 8603941.","area of Switzerland to the surface area of Taiwan":"The surface area of Switzerland (41284) plus that of Taiwan (36188) is 77472.","area of San Marino and Netherlands":"The surface area of San Marino (61) plus that of Netherlands (41526) is 41587.","area of Andorra and Singapore":"The surface area of Andorra (468) plus that of Singapore (618) is 1086.","area of Netherlands to the surface area of Bosnia and Herzegovina":"The surface area of Netherlands (41526) plus that of Bosnia and Herzegovina (51197) is 92723.","area of Svalbard and Jan Mayen plus the surface area of Chile makes what":"The surface area of Svalbard and Jan Mayen (62422) plus that of Chile (756626) is 819048.","area of Bahamas to the surface area of Laos":"The surface area of Bahamas (13878) plus that of Laos (236800) is 250678.","area of Puerto Rico and Aruba":"The surface area of Puerto Rico (8875) plus that of Aruba (193) is 9068.","area of Burundi plus the surface area of Holy See (Vatican City State) makes what":"The surface area of Burundi (27834) plus that of Holy See (Vatican City State) (0.4) is 27834.4.","area of Niger plus the surface area of Libya makes what":"The surface area of Niger (1267000) plus that of Libya (1759540) is 3026540.","area of British Virgin Islands plus the surface area of Northern Mariana Islands makes what":"The surface area of British Virgin Islands (151) plus that of Northern Mariana Islands (464) is 615.","area of Bosnia and Herzegovina plus the surface area of Kazakhstan makes what":"The surface area of Bosnia and Herzegovina (51197) plus that of Kazakhstan (2724900) is 2776097.","area of Mayotte and Mongolia":"The surface area of Mayotte (373) plus that of Mongolia (1566500) is 1566873.","area of Brazil plus the surface area of Turks and Caicos Islands makes what":"The surface area of Brazil (8547403) plus that of Turks and Caicos Islands (430) is 8547833.","area of Niue and Namibia":"The surface area of Niue (260) plus that of Namibia (824292) is 824552.","area of Honduras to the surface area of Burundi":"The surface area of Honduras (112088) plus that of Burundi (27834) is 139922.","area of Qatar plus the surface area of French Southern territories makes what":"The surface area of Qatar (11000) plus that of French Southern territories (7780) is 18780.","area of Portugal to the surface area of Greenland":"The surface area of Portugal (91982) plus that of Greenland (2166090) is 2258072.","area of Japan plus the surface area of Malta makes what":"The surface area of Japan (377829) plus that of Malta (316) is 378145.","area of Saint Kitts and Nevis plus the surface area of Dominican Republic makes what":"The surface area of Saint Kitts and Nevis (261) plus that of Dominican Republic (48511) is 48772.","area of Pitcairn and Croatia":"The surface area of Pitcairn (49) plus that of Croatia (56538) is 56587.","area of Martinique to the surface area of New Caledonia":"The surface area of Martinique (1102) plus that of New Caledonia (18575) is 19677.","area of Estonia plus the surface area of Puerto Rico makes what":"The surface area of Estonia (45227) plus that of Puerto Rico (8875) is 54102.","area of Barbados plus the surface area of Mali makes what":"The surface area of Barbados (430) plus that of Mali (1240192) is 1240622.","area of Laos plus the surface area of Canada makes what":"The surface area of Laos (236800) plus that of Canada (9970610) is 10207410.","area of Benin to the surface area of Japan":"The surface area of Benin (112622) plus that of Japan (377829) is 490451.","area of Turks and Caicos Islands and Bahamas":"The surface area of Turks and Caicos Islands (430) plus that of Bahamas (13878) is 14308.","area of Albania plus the surface area of Hong Kong makes what":"The surface area of Albania (28748) plus that of Hong Kong (1075) is 29823.","area of Chad to the surface area of Cook Islands":"The surface area of Chad (1284000) plus that of Cook Islands (236) is 1284236.","area of Lebanon plus the surface area of Kiribati makes what":"The surface area of Lebanon (10400) plus that of Kiribati (726) is 11126.","area of Comoros and Finland":"The surface area of Comoros (1862) plus that of Finland (338145) is 340007.","area of Gibraltar plus the surface area of Ukraine makes what":"The surface area of Gibraltar (6) plus that of Ukraine (603700) is 603706.","area of Northern Mariana Islands and Wallis and Futuna":"The surface area of Northern Mariana Islands (464) plus that of Wallis and Futuna (200) is 664.","area of Iraq to the surface area of Svalbard and Jan Mayen":"The surface area of Iraq (438317) plus that of Svalbard and Jan Mayen (62422) is 500739.","area of Singapore to the surface area of United Kingdom":"The surface area of Singapore (618) plus that of United Kingdom (242900) is 243518.","area of Grenada to the surface area of Saint Kitts and Nevis":"The surface area of Grenada (344) plus that of Saint Kitts and Nevis (261) is 605.","area of Kiribati and United States":"The surface area of Kiribati (726) plus that of United States (9363520) is 9364246.","area of Greenland plus the surface area of Ethiopia makes what":"The surface area of Greenland (2166090) plus that of Ethiopia (1104300) is 3270390.","area of Guinea plus the surface area of Cocos (Keeling) Islands makes what":"The surface area of Guinea (245857) plus that of Cocos (Keeling) Islands (14) is 245871.","area of Panama and Reunion":"The surface area of Panama (75517) plus that of Reunion (2510) is 78027.","area of Taiwan plus the surface area of Angola makes what":"The surface area of Taiwan (36188) plus that of Angola (1246700) is 1282888.","area of Nicaragua to the surface area of Costa Rica":"The surface area of Nicaragua (130000) plus that of Costa Rica (51100) is 181100.","area of Bangladesh and Portugal":"The surface area of Bangladesh (143998) plus that of Portugal (91982) is 235980.","area of Ethiopia and Chad":"The surface area of Ethiopia (1104300) plus that of Chad (1284000) is 2388300.","area of Kuwait plus the surface area of Mayotte makes what":"The surface area of Kuwait (17818) plus that of Mayotte (373) is 18191.","area of Uzbekistan and Nicaragua":"The surface area of Uzbekistan (447400) plus that of Nicaragua (130000) is 577400.","area of Bulgaria plus the surface area of Panama makes what":"The surface area of Bulgaria (110994) plus that of Panama (75517) is 186511.","area of Equatorial Guinea to the surface area of Serbia":"The surface area of Equatorial Guinea (28051) plus that of Serbia (88361) is 116412.","area of Slovenia to the surface area of Somalia":"The surface area of Slovenia (20256) plus that of Somalia (637657) is 657913.","area of Libya and Grenada":"The surface area of Libya (1759540) plus that of Grenada (344) is 1759884.","area of Chile and Switzerland":"The surface area of Chile (756626) plus that of Switzerland (41284) is 797910.","area of Mali and Martinique":"The surface area of Mali (1240192) plus that of Martinique (1102) is 1241294.","area of Namibia to the surface area of Guinea":"The surface area of Namibia (824292) plus that of Guinea (245857) is 1070149.","area of Hong Kong and Equatorial Guinea":"The surface area of Hong Kong (1075) plus that of Equatorial Guinea (28051) is 29126."}}},
{"id":"n-c0a95274","guard":[["has","area"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"area"}]]],"mem":{"table":{"of Iceland plus the surface area of French Guiana makes what":"The surface area of Iceland (103000) plus that of French Guiana (90000) is 193000.","of Netherlands Antilles and Honduras":"The surface area of Netherlands Antilles (800) plus that of Honduras (112088) is 112888.","of Hungary to the surface area of Papua New Guinea":"The surface area of Hungary (93030) plus that of Papua New Guinea (462840) is 555870.","of Thailand to the surface area of Kuwait":"The surface area of Thailand (513115) plus that of Kuwait (17818) is 530933.","of French Southern territories and Fiji Islands":"The surface area of French Southern territories (7780) plus that of Fiji Islands (18274) is 26054.","of Tanzania to the surface area of Madagascar":"The surface area of Tanzania (883749) plus that of Madagascar (587041) is 1470790.","of Madagascar plus the surface area of Uzbekistan makes what":"The surface area of Madagascar (587041) plus that of Uzbekistan (447400) is 1034441.","of North Korea to the surface area of Gibraltar":"The surface area of North Korea (120538) plus that of Gibraltar (6) is 120544.","of Nepal and Russia":"The surface area of Nepal (147181) plus that of Russia (17075400) is 17222581.","of Kazakhstan and Thailand":"The surface area of Kazakhstan (2724900) plus that of Thailand (513115) is 3238015.","of Somalia plus the surface area of Malawi makes what":"The surface area of Somalia (637657) plus that of Malawi (118484) is 756141.","of Djibouti to the surface area of Estonia":"The surface area of Djibouti (23200) plus that of Estonia (45227) is 68427.","of Gabon and Iraq":"The surface area of Gabon (267668) plus that of Iraq (438317) is 705985.","of Turkmenistan and Tokelau":"The surface area of Turkmenistan (488100) plus that of Tokelau (12) is 488112.","of French Guiana and Hungary":"The surface area of French Guiana (90000) plus that of Hungary (93030) is 183030.","of Malawi and Maldives":"The surface area of Malawi (118484) plus that of Maldives (298) is 118782.","of New Caledonia plus the surface area of Netherlands Antilles makes what":"The surface area of New Caledonia (18575) plus that of Netherlands Antilles (800) is 19375.","of Tokelau to the surface area of Zambia":"The surface area of Tokelau (12) plus that of Zambia (752618) is 752630.","of Holy See (Vatican City State) and Djibouti":"The surface area of Holy See (Vatican City State) (0.4) plus that of Djibouti (23200) is 23200.4.","of Canada and Tanzania":"The surface area of Canada (9970610) plus that of Tanzania (883749) is 10854359.","of Russia to the surface area of Niger":"The surface area of Russia (17075400) plus that of Niger (1267000) is 18342400.","of Costa Rica plus the surface area of Turkmenistan makes what":"The surface area of Costa Rica (51100) plus that of Turkmenistan (488100) is 539200.","of Brunei plus the surface area of Andorra makes what":"The surface area of Brunei (5765) plus that of Andorra (468) is 6233.","of Rwanda to the surface area of Lebanon":"The surface area of Rwanda (26338) plus that of Lebanon (10400) is 36738.","of Serbia plus the surface area of San Marino makes what":"The surface area of Serbia (88361) plus that of San Marino (61) is 88422.","of Mongolia to the surface area of Barbados":"The surface area of Mongolia (1566500) plus that of Barbados (430) is 1566930.","of Ghana to the surface area of Iceland":"The surface area of Ghana (238533) plus that of Iceland (103000) is 341533.","of United Kingdom plus the surface area of Pitcairn makes what":"The surface area of United Kingdom (242900) plus that of Pitcairn (49) is 242949.","of Dominican Republic and Rwanda":"The surface area of Dominican Republic (48511) plus that of Rwanda (26338) is 74849.","of Cook Islands plus the surface area of American Samoa makes what":"The surface area of Cook Islands (236) plus that of American Samoa (199) is 435.","of Ukraine and Ghana":"The surface area of Ukraine (603700) plus that of Ghana (238533) is 842233.","of Lesotho plus the surface area of Niue makes what":"The surface area of Lesotho (30355) plus that of Niue (260) is 30615.","of Zambia plus the surface area of Bangladesh makes what":"The surface area of Zambia (752618) plus that of Bangladesh (143998) is 896616.","of Cocos (Keeling) Islands and North Korea":"The surface area of Cocos (Keeling) Islands (14) plus that of North Korea (120538) is 120552.","of Aruba to the surface area of Lesotho":"The surface area of Aruba (193) plus that of Lesotho (30355) is 30548.","of American Samoa and Benin":"The surface area of American Samoa (199) plus that of Benin (112622) is 112821.","of Fiji Islands to the surface area of Albania":"The surface area of Fiji Islands (18274) plus that of Albania (28748) is 47022.","of Uganda to the surface area of British Virgin Islands":"The surface area of Uganda (241038) plus that of British Virgin Islands (151) is 241189.","of Papua New Guinea plus the surface area of Nepal makes what":"The surface area of Papua New Guinea (462840) plus that of Nepal (147181) is 610021.","of Angola and Slovenia":"The surface area of Angola (1246700) plus that of Slovenia (20256) is 1266956.","of United States to the surface area of Brunei":"The surface area of United States (9363520) plus that of Brunei (5765) is 9369285.","of Reunion to the surface area of Cameroon":"The surface area of Reunion (2510) plus that of Cameroon (475442) is 477952.","of Cameroon plus the surface area of Gabon makes what":"The surface area of Cameroon (475442) plus that of Gabon (267668) is 743110.","of Finland to the surface area of Qatar":"The surface area of Finland (338145) plus that of Qatar (11000) is 349145.","of Wallis and Futuna to the surface area of Bulgaria":"The surface area of Wallis and Futuna (200) plus that of Bulgaria (110994) is 111194.","of Malta and Uganda":"The surface area of Malta (316) plus that of Uganda (241038) is 241354.","of Croatia to the surface area of Brazil":"The surface area of Croatia (56538) plus that of Brazil (8547403) is 8603941.","of Switzerland to the surface area of Taiwan":"The surface area of Switzerland (41284) plus that of Taiwan (36188) is 77472.","of San Marino and Netherlands":"The surface area of San Marino (61) plus that of Netherlands (41526) is 41587.","of Andorra and Singapore":"The surface area of Andorra (468) plus that of Singapore (618) is 1086.","of Netherlands to the surface area of Bosnia and Herzegovina":"The surface area of Netherlands (41526) plus that of Bosnia and Herzegovina (51197) is 92723.","of Svalbard and Jan Mayen plus the surface area of Chile makes what":"The surface area of Svalbard and Jan Mayen (62422) plus that of Chile (756626) is 819048.","of Bahamas to the surface area of Laos":"The surface area of Bahamas (13878) plus that of Laos (236800) is 250678.","of Puerto Rico and Aruba":"The surface area of Puerto Rico (8875) plus that of Aruba (193) is 9068.","of Burundi plus the surface area of Holy See (Vatican City State) makes what":"The surface area of Burundi (27834) plus that of Holy See (Vatican City State) (0.4) is 27834.4.","of Niger plus the surface area of Libya makes what":"The surface area of Niger (1267000) plus that of Libya (1759540) is 3026540.","of British Virgin Islands plus the surface area of Northern Mariana Islands makes what":"The surface area of British Virgin Islands (151) plus that of Northern Mariana Islands (464) is 615.","of Bosnia and Herzegovina plus the surface area of Kazakhstan makes what":"The surface area of Bosnia and Herzegovina (51197) plus that of Kazakhstan (2724900) is 2776097.","of Mayotte and Mongolia":"The surface area of Mayotte (373) plus that of Mongolia (1566500) is 1566873.","of Brazil plus the surface area of Turks and Caicos Islands makes what":"The surface area of Brazil (8547403) plus that of Turks and Caicos Islands (430) is 8547833.","of Niue and Namibia":"The surface area of Niue (260) plus that of Namibia (824292) is 824552.","of Honduras to the surface area of Burundi":"The surface area of Honduras (112088) plus that of Burundi (27834) is 139922.","of Qatar plus the surface area of French Southern territories makes what":"The surface area of Qatar (11000) plus that of French Southern territories (7780) is 18780.","of Portugal to the surface area of Greenland":"The surface area of Portugal (91982) plus that of Greenland (2166090) is 2258072.","of Japan plus the surface area of Malta makes what":"The surface area of Japan (377829) plus that of Malta (316) is 378145.","of Saint Kitts and Nevis plus the surface area of Dominican Republic makes what":"The surface area of Saint Kitts and Nevis (261) plus that of Dominican Republic (48511) is 48772.","of Pitcairn and Croatia":"The surface area of Pitcairn (49) plus that of Croatia (56538) is 56587.","of Martinique to the surface area of New Caledonia":"The surface area of Martinique (1102) plus that of New Caledonia (18575) is 19677.","of Estonia plus the surface area of Puerto Rico makes what":"The surface area of Estonia (45227) plus that of Puerto Rico (8875) is 54102.","of Barbados plus the surface area of Mali makes what":"The surface area of Barbados (430) plus that of Mali (1240192) is 1240622.","of Laos plus the surface area of Canada makes what":"The surface area of Laos (236800) plus that of Canada (9970610) is 10207410.","of Benin to the surface area of Japan":"The surface area of Benin (112622) plus that of Japan (377829) is 490451.","of Turks and Caicos Islands and Bahamas":"The surface area of Turks and Caicos Islands (430) plus that of Bahamas (13878) is 14308.","of Albania plus the surface area of Hong Kong makes what":"The surface area of Albania (28748) plus that of Hong Kong (1075) is 29823.","of Chad to the surface area of Cook Islands":"The surface area of Chad (1284000) plus that of Cook Islands (236) is 1284236.","of Lebanon plus the surface area of Kiribati makes what":"The surface area of Lebanon (10400) plus that of Kiribati (726) is 11126.","of Comoros and Finland":"The surface area of Comoros (1862) plus that of Finland (338145) is 340007.","of Gibraltar plus the surface area of Ukraine makes what":"The surface area of Gibraltar (6) plus that of Ukraine (603700) is 603706.","of Northern Mariana Islands and Wallis and Futuna":"The surface area of Northern Mariana Islands (464) plus that of Wallis and Futuna (200) is 664.","of Iraq to the surface area of Svalbard and Jan Mayen":"The surface area of Iraq (438317) plus that of Svalbard and Jan Mayen (62422) is 500739.","of Singapore to the surface area of United Kingdom":"The surface area of Singapore (618) plus that of United Kingdom (242900) is 243518.","of Grenada to the surface area of Saint Kitts and Nevis":"The surface area of Grenada (344) plus that of Saint Kitts and Nevis (261) is 605.","of Kiribati and United States":"The surface area of Kiribati (726) plus that of United States (9363520) is 9364246.","of Greenland plus the surface area of Ethiopia makes what":"The surface area of Greenland (2166090) plus that of Ethiopia (1104300) is 3270390.","of Guinea plus the surface area of Cocos (Keeling) Islands makes what":"The surface area of Guinea (245857) plus that of Cocos (Keeling) Islands (14) is 245871.","of Panama and Reunion":"The surface area of Panama (75517) plus that of Reunion (2510) is 78027.","of Taiwan plus the surface area of Angola makes what":"The surface area of Taiwan (36188) plus that of Angola (1246700) is 1282888.","of Nicaragua to the surface area of Costa Rica":"The surface area of Nicaragua (130000) plus that of Costa Rica (51100) is 181100.","of Bangladesh and Portugal":"The surface area of Bangladesh (143998) plus that of Portugal (91982) is 235980.","of Ethiopia and Chad":"The surface area of Ethiopia (1104300) plus that of Chad (1284000) is 2388300.","of Kuwait plus the surface area of Mayotte makes what":"The surface area of Kuwait (17818) plus that of Mayotte (373) is 18191.","of Uzbekistan and Nicaragua":"The surface area of Uzbekistan (447400) plus that of Nicaragua (130000) is 577400.","of Bulgaria plus the surface area of Panama makes what":"The surface area of Bulgaria (110994) plus that of Panama (75517) is 186511.","of Equatorial Guinea to the surface area of Serbia":"The surface area of Equatorial Guinea (28051) plus that of Serbia (88361) is 116412.","of Slovenia to the surface area of Somalia":"The surface area of Slovenia (20256) plus that of Somalia (637657) is 657913.","of Libya and Grenada":"The surface area of Libya (1759540) plus that of Grenada (344) is 1759884.","of Chile and Switzerland":"The surface area of Chile (756626) plus that of Switzerland (41284) is 797910.","of Mali and Martinique":"The surface area of Mali (1240192) plus that of Martinique (1102) is 1241294.","of Namibia to the surface area of Guinea":"The surface area of Namibia (824292) plus that of Guinea (245857) is 1070149.","of Hong Kong and Equatorial Guinea":"The surface area of Hong Kong (1075) plus that of Equatorial Guinea (28051) is 29126."}}},
{"id":"n-d85bcd37","guard":[["has","area"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"Iceland plus the surface area of French Guiana makes what":"The surface area of Iceland (103000) plus that of French Guiana (90000) is 193000.","the surface area of Netherlands Antilles and Honduras":"The surface area of Netherlands Antilles (800) plus that of Honduras (112088) is 112888.","Hungary to the surface area of Papua New Guinea":"The surface area of Hungary (93030) plus that of Papua New Guinea (462840) is 555870.","Thailand to the surface area of Kuwait":"The surface area of Thailand (513115) plus that of Kuwait (17818) is 530933.","the surface area of French Southern territories and Fiji Islands":"The surface area of French Southern territories (7780) plus that of Fiji Islands (18274) is 26054.","Tanzania to the surface area of Madagascar":"The surface area of Tanzania (883749) plus that of Madagascar (587041) is 1470790.","Madagascar plus the surface area of Uzbekistan makes what":"The surface area of Madagascar (587041) plus that of Uzbekistan (447400) is 1034441.","North Korea to the surface area of Gibraltar":"The surface area of North Korea (120538) plus that of Gibraltar (6) is 120544.","the surface area of Nepal and Russia":"The surface area of Nepal (147181) plus that of Russia (17075400) is 17222581.","the surface area of Kazakhstan and Thailand":"The surface area of Kazakhstan (2724900) plus that of Thailand (513115) is 3238015.","Somalia plus the surface area of Malawi makes what":"The surface area of Somalia (637657) plus that of Malawi (118484) is 756141.","Djibouti to the surface area of Estonia":"The surface area of Djibouti (23200) plus that of Estonia (45227) is 68427.","the surface area of Gabon and Iraq":"The surface area of Gabon (267668) plus that of Iraq (438317) is 705985.","the surface area of Turkmenistan and Tokelau":"The surface area of Turkmenistan (488100) plus that of Tokelau (12) is 488112.","the surface area of French Guiana and Hungary":"The surface area of French Guiana (90000) plus that of Hungary (93030) is 183030.","the surface area of Malawi and Maldives":"The surface area of Malawi (118484) plus that of Maldives (298) is 118782.","New Caledonia plus the surface area of Netherlands Antilles makes what":"The surface area of New Caledonia (18575) plus that of Netherlands Antilles (800) is 19375.","Tokelau to the surface area of Zambia":"The surface area of Tokelau (12) plus that of Zambia (752618) is 752630.","the surface area of Holy See (Vatican City State) and Djibouti":"The surface area of Holy See (Vatican City State) (0.4) plus that of Djibouti (23200) is 23200.4.","the surface area of Canada and Tanzania":"The surface area of Canada (9970610) plus that of Tanzania (883749) is 10854359.","Russia to the surface area of Niger":"The surface area of Russia (17075400) plus that of Niger (1267000) is 18342400.","Costa Rica plus the surface area of Turkmenistan makes what":"The surface area of Costa Rica (51100) plus that of Turkmenistan (488100) is 539200.","Brunei plus the surface area of Andorra makes what":"The surface area of Brunei (5765) plus that of Andorra (468) is 6233.","Rwanda to the surface area of Lebanon":"The surface area of Rwanda (26338) plus that of Lebanon (10400) is 36738.","Serbia plus the surface area of San Marino makes what":"The surface area of Serbia (88361) plus that of San Marino (61) is 88422.","Mongolia to the surface area of Barbados":"The surface area of Mongolia (1566500) plus that of Barbados (430) is 1566930.","Ghana to the surface area of Iceland":"The surface area of Ghana (238533) plus that of Iceland (103000) is 341533.","United Kingdom plus the surface area of Pitcairn makes what":"The surface area of United Kingdom (242900) plus that of Pitcairn (49) is 242949.","the surface area of Dominican Republic and Rwanda":"The surface area of Dominican Republic (48511) plus that of Rwanda (26338) is 74849.","Cook Islands plus the surface area of American Samoa makes what":"The surface area of Cook Islands (236) plus that of American Samoa (199) is 435.","the surface area of Ukraine and Ghana":"The surface area of Ukraine (603700) plus that of Ghana (238533) is 842233.","Lesotho plus the surface area of Niue makes what":"The surface area of Lesotho (30355) plus that of Niue (260) is 30615.","Zambia plus the surface area of Bangladesh makes what":"The surface area of Zambia (752618) plus that of Bangladesh (143998) is 896616.","the surface area of Cocos (Keeling) Islands and North Korea":"The surface area of Cocos (Keeling) Islands (14) plus that of North Korea (120538) is 120552.","Aruba to the surface area of Lesotho":"The surface area of Aruba (193) plus that of Lesotho (30355) is 30548.","the surface area of American Samoa and Benin":"The surface area of American Samoa (199) plus that of Benin (112622) is 112821.","Fiji Islands to the surface area of Albania":"The surface area of Fiji Islands (18274) plus that of Albania (28748) is 47022.","Uganda to the surface area of British Virgin Islands":"The surface area of Uganda (241038) plus that of British Virgin Islands (151) is 241189.","Papua New Guinea plus the surface area of Nepal makes what":"The surface area of Papua New Guinea (462840) plus that of Nepal (147181) is 610021.","the surface area of Angola and Slovenia":"The surface area of Angola (1246700) plus that of Slovenia (20256) is 1266956.","United States to the surface area of Brunei":"The surface area of United States (9363520) plus that of Brunei (5765) is 9369285.","Reunion to the surface area of Cameroon":"The surface area of Reunion (2510) plus that of Cameroon (475442) is 477952.","Cameroon plus the surface area of Gabon makes what":"The surface area of Cameroon (475442) plus that of Gabon (267668) is 743110.","Finland to the surface area of Qatar":"The surface area of Finland (338145) plus that of Qatar (11000) is 349145.","Wallis and Futuna to the surface area of Bulgaria":"The surface area of Wallis and Futuna (200) plus that of Bulgaria (110994) is 111194.","the surface area of Malta and Uganda":"The surface area of Malta (316) plus that of Uganda (241038) is 241354.","Croatia to the surface area of Brazil":"The surface area of Croatia (56538) plus that of Brazil (8547403) is 8603941.","Switzerland to the surface area of Taiwan":"The surface area of Switzerland (41284) plus that of Taiwan (36188) is 77472.","the surface area of San Marino and Netherlands":"The surface area of San Marino (61) plus that of Netherlands (41526) is 41587.","the surface area of Andorra and Singapore":"The surface area of Andorra (468) plus that of Singapore (618) is 1086.","Netherlands to the surface area of Bosnia and Herzegovina":"The surface area of Netherlands (41526) plus that of Bosnia and Herzegovina (51197) is 92723.","Svalbard and Jan Mayen plus the surface area of Chile makes what":"The surface area of Svalbard and Jan Mayen (62422) plus that of Chile (756626) is 819048.","Bahamas to the surface area of Laos":"The surface area of Bahamas (13878) plus that of Laos (236800) is 250678.","the surface area of Puerto Rico and Aruba":"The surface area of Puerto Rico (8875) plus that of Aruba (193) is 9068.","Burundi plus the surface area of Holy See (Vatican City State) makes what":"The surface area of Burundi (27834) plus that of Holy See (Vatican City State) (0.4) is 27834.4.","Niger plus the surface area of Libya makes what":"The surface area of Niger (1267000) plus that of Libya (1759540) is 3026540.","British Virgin Islands plus the surface area of Northern Mariana Islands makes what":"The surface area of British Virgin Islands (151) plus that of Northern Mariana Islands (464) is 615.","Bosnia and Herzegovina plus the surface area of Kazakhstan makes what":"The surface area of Bosnia and Herzegovina (51197) plus that of Kazakhstan (2724900) is 2776097.","the surface area of Mayotte and Mongolia":"The surface area of Mayotte (373) plus that of Mongolia (1566500) is 1566873.","Brazil plus the surface area of Turks and Caicos Islands makes what":"The surface area of Brazil (8547403) plus that of Turks and Caicos Islands (430) is 8547833.","the surface area of Niue and Namibia":"The surface area of Niue (260) plus that of Namibia (824292) is 824552.","Honduras to the surface area of Burundi":"The surface area of Honduras (112088) plus that of Burundi (27834) is 139922.","Qatar plus the surface area of French Southern territories makes what":"The surface area of Qatar (11000) plus that of French Southern territories (7780) is 18780.","Portugal to the surface area of Greenland":"The surface area of Portugal (91982) plus that of Greenland (2166090) is 2258072.","Japan plus the surface area of Malta makes what":"The surface area of Japan (377829) plus that of Malta (316) is 378145.","Saint Kitts and Nevis plus the surface area of Dominican Republic makes what":"The surface area of Saint Kitts and Nevis (261) plus that of Dominican Republic (48511) is 48772.","the surface area of Pitcairn and Croatia":"The surface area of Pitcairn (49) plus that of Croatia (56538) is 56587.","Martinique to the surface area of New Caledonia":"The surface area of Martinique (1102) plus that of New Caledonia (18575) is 19677.","Estonia plus the surface area of Puerto Rico makes what":"The surface area of Estonia (45227) plus that of Puerto Rico (8875) is 54102.","Barbados plus the surface area of Mali makes what":"The surface area of Barbados (430) plus that of Mali (1240192) is 1240622.","Laos plus the surface area of Canada makes what":"The surface area of Laos (236800) plus that of Canada (9970610) is 10207410.","Benin to the surface area of Japan":"The surface area of Benin (112622) plus that of Japan (377829) is 490451.","the surface area of Turks and Caicos Islands and Bahamas":"The surface area of Turks and Caicos Islands (430) plus that of Bahamas (13878) is 14308.","Albania plus the surface area of Hong Kong makes what":"The surface area of Albania (28748) plus that of Hong Kong (1075) is 29823.","Chad to the surface area of Cook Islands":"The surface area of Chad (1284000) plus that of Cook Islands (236) is 1284236.","Lebanon plus the surface area of Kiribati makes what":"The surface area of Lebanon (10400) plus that of Kiribati (726) is 11126.","the surface area of Comoros and Finland":"The surface area of Comoros (1862) plus that of Finland (338145) is 340007.","Gibraltar plus the surface area of Ukraine makes what":"The surface area of Gibraltar (6) plus that of Ukraine (603700) is 603706.","the surface area of Northern Mariana Islands and Wallis and Futuna":"The surface area of Northern Mariana Islands (464) plus that of Wallis and Futuna (200) is 664.","Iraq to the surface area of Svalbard and Jan Mayen":"The surface area of Iraq (438317) plus that of Svalbard and Jan Mayen (62422) is 500739.","Singapore to the surface area of United Kingdom":"The surface area of Singapore (618) plus that of United Kingdom (242900) is 243518.","Grenada to the surface area of Saint Kitts and Nevis":"The surface area of Grenada (344) plus that of Saint Kitts and Nevis (261) is 605.","the surface area of Kiribati and United States":"The surface area of Kiribati (726) plus that of United States (9363520) is 9364246.","Greenland plus the surface area of Ethiopia makes what":"The surface area of Greenland (2166090) plus that of Ethiopia (1104300) is 3270390.","Guinea plus the surface area of Cocos (Keeling) Islands makes what":"The surface area of Guinea (245857) plus that of Cocos (Keeling) Islands (14) is 245871.","the surface area of Panama and Reunion":"The surface area of Panama (75517) plus that of Reunion (2510) is 78027.","Taiwan plus the surface area of Angola makes what":"The surface area of Taiwan (36188) plus that of Angola (1246700) is 1282888.","Nicaragua to the surface area of Costa Rica":"The surface area of Nicaragua (130000) plus that of Costa Rica (51100) is 181100.","the surface area of Bangladesh and Portugal":"The surface area of Bangladesh (143998) plus that of Portugal (91982) is 235980.","the surface area of Ethiopia and Chad":"The surface area of Ethiopia (1104300) plus that of Chad (1284000) is 2388300.","Kuwait plus the surface area of Mayotte makes what":"The surface area of Kuwait (17818) plus that of Mayotte (373) is 18191.","the surface area of Uzbekistan and Nicaragua":"The surface area of Uzbekistan (447400) plus that of Nicaragua (130000) is 577400.","Bulgaria plus the surface area of Panama makes what":"The surface area of Bulgaria (110994) plus that of Panama (75517) is 186511.","Equatorial Guinea to the surface area of Serbia":"The surface area of Equatorial Guinea (28051) plus that of Serbia (88361) is 116412.","Slovenia to the surface area of Somalia":"The surface area of Slovenia (20256) plus that of Somalia (637657) is 657913.","the surface area of Libya and Grenada":"The surface area of Libya (1759540) plus that of Grenada (344) is 1759884.","the surface area of Chile and Switzerland":"The surface area of Chile (756626) plus that of Switzerland (41284) is 797910.","the surface area of Mali and Martinique":"The surface area of Mali (1240192) plus that of Martinique (1102) is 1241294.","Namibia to the surface area of Guinea":"The surface area of Namibia (824292) plus that of Guinea (245857) is 1070149.","the surface area of Hong Kong and Equatorial Guinea":"The surface area of Hong Kong (1075) plus that of Equatorial Guinea (28051) is 29126."}}},
{"id":"n-cba7343e","guard":[["has","area"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the sum of the surface area of Netherlands Antilles and Honduras":"The surface area of Netherlands Antilles (800) plus that of Honduras (112088) is 112888.","the sum of the surface area of French Southern territories and Fiji Islands":"The surface area of French Southern territories (7780) plus that of Fiji Islands (18274) is 26054.","the sum of the surface area of Nepal and Russia":"The surface area of Nepal (147181) plus that of Russia (17075400) is 17222581.","the sum of the surface area of Kazakhstan and Thailand":"The surface area of Kazakhstan (2724900) plus that of Thailand (513115) is 3238015.","the sum of the surface area of Gabon and Iraq":"The surface area of Gabon (267668) plus that of Iraq (438317) is 705985.","the sum of the surface area of Turkmenistan and Tokelau":"The surface area of Turkmenistan (488100) plus that of Tokelau (12) is 488112.","the sum of the surface area of French Guiana and Hungary":"The surface area of French Guiana (90000) plus that of Hungary (93030) is 183030.","the sum of the surface area of Malawi and Maldives":"The surface area of Malawi (118484) plus that of Maldives (298) is 118782.","the sum of the surface area of Holy See (Vatican City State) and Djibouti":"The surface area of Holy See (Vatican City State) (0.4) plus that of Djibouti (23200) is 23200.4.","the sum of the surface area of Canada and Tanzania":"The surface area of Canada (9970610) plus that of Tanzania (883749) is 10854359.","the sum of the surface area of Dominican Republic and Rwanda":"The surface area of Dominican Republic (48511) plus that of Rwanda (26338) is 74849.","the sum of the surface area of Ukraine and Ghana":"The surface area of Ukraine (603700) plus that of Ghana (238533) is 842233.","the sum of the surface area of Cocos (Keeling) Islands and North Korea":"The surface area of Cocos (Keeling) Islands (14) plus that of North Korea (120538) is 120552.","the sum of the surface area of American Samoa and Benin":"The surface area of American Samoa (199) plus that of Benin (112622) is 112821.","the sum of the surface area of Angola and Slovenia":"The surface area of Angola (1246700) plus that of Slovenia (20256) is 1266956.","the sum of the surface area of Malta and Uganda":"The surface area of Malta (316) plus that of Uganda (241038) is 241354.","the sum of the surface area of San Marino and Netherlands":"The surface area of San Marino (61) plus that of Netherlands (41526) is 41587.","the sum of the surface area of Andorra and Singapore":"The surface area of Andorra (468) plus that of Singapore (618) is 1086.","the sum of the surface area of Puerto Rico and Aruba":"The surface area of Puerto Rico (8875) plus that of Aruba (193) is 9068.","the sum of the surface area of Mayotte and Mongolia":"The surface area of Mayotte (373) plus that of Mongolia (1566500) is 1566873.","the sum of the surface area of Niue and Namibia":"The surface area of Niue (260) plus that of Namibia (824292) is 824552.","the sum of the surface area of Pitcairn and Croatia":"The surface area of Pitcairn (49) plus that of Croatia (56538) is 56587.","the sum of the surface area of Turks and Caicos Islands and Bahamas":"The surface area of Turks and Caicos Islands (430) plus that of Bahamas (13878) is 14308.","the sum of the surface area of Comoros and Finland":"The surface area of Comoros (1862) plus that of Finland (338145) is 340007.","the sum of the surface area of Northern Mariana Islands and Wallis and Futuna":"The surface area of Northern Mariana Islands (464) plus that of Wallis and Futuna (200) is 664.","the sum of the surface area of Kiribati and United States":"The surface area of Kiribati (726) plus that of United States (9363520) is 9364246.","the sum of the surface area of Panama and Reunion":"The surface area of Panama (75517) plus that of Reunion (2510) is 78027.","the sum of the surface area of Bangladesh and Portugal":"The surface area of Bangladesh (143998) plus that of Portugal (91982) is 235980.","the sum of the surface area of Ethiopia and Chad":"The surface area of Ethiopia (1104300) plus that of Chad (1284000) is 2388300.","the sum of the surface area of Uzbekistan and Nicaragua":"The surface area of Uzbekistan (447400) plus that of Nicaragua (130000) is 577400.","the sum of the surface area of Libya and Grenada":"The surface area of Libya (1759540) plus that of Grenada (344) is 1759884.","the sum of the surface area of Chile and Switzerland":"The surface area of Chile (756626) plus that of Switzerland (41284) is 797910.","the sum of the surface area of Mali and Martinique":"The surface area of Mali (1240192) plus that of Martinique (1102) is 1241294.","the sum of the surface area of Hong Kong and Equatorial Guinea":"The surface area of Hong Kong (1075) plus that of Equatorial Guinea (28051) is 29126."}}},
{"id":"n-0067b8fb","guard":[["hasAny",["area","mayotte","mongolia","sum","surface"]],["has","sum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Mayotte and Mongolia":"The surface area of Mayotte (373) plus that of Mongolia (1566500) is 1566873."}}},
{"id":"n-0426a5bf","guard":[["hasAny",["area","bosnia","herzegovina","kazakhstan","makes","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Bosnia and Herzegovina plus the surface area of Kazakhstan makes what":"The surface area of Bosnia and Herzegovina (51197) plus that of Kazakhstan (2724900) is 2776097."}}},
{"id":"n-057a4126","guard":[["hasAny",["add","area","bulgaria","futuna","surface","wallis"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Wallis and Futuna to the surface area of Bulgaria":"The surface area of Wallis and Futuna (200) plus that of Bulgaria (110994) is 111194."}}},
{"id":"n-05d2fb74","guard":[["hasAny",["area","chile","jan","makes","mayen","plus","surface","svalbard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Svalbard and Jan Mayen plus the surface area of Chile makes what":"The surface area of Svalbard and Jan Mayen (62422) plus that of Chile (756626) is 819048."}}},
{"id":"n-06c62d5e","guard":[["hasAny",["area","brazil","caicos","islands","makes","plus","surface","turks"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Brazil plus the surface area of Turks and Caicos Islands makes what":"The surface area of Brazil (8547403) plus that of Turks and Caicos Islands (430) is 8547833."}}},
{"id":"n-0955adc9","guard":[["hasAny",["area","sum","surface","tokelau","turkmenistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Turkmenistan and Tokelau":"The surface area of Turkmenistan (488100) plus that of Tokelau (12) is 488112."}}},
{"id":"n-09bf94cc","guard":[["hasAny",["add","iraq"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Iraq to the surface area of Svalbard and Jan Mayen":"The surface area of Iraq (438317) plus that of Svalbard and Jan Mayen (62422) is 500739."}}},
{"id":"n-0a4ff6ab","guard":[["hasAny",["area","bulgaria","makes","panama","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Bulgaria plus the surface area of Panama makes what":"The surface area of Bulgaria (110994) plus that of Panama (75517) is 186511."}}},
{"id":"n-0d17b8bd","guard":[["hasAny",["area","city","djibouti","holy","see","state","sum","surface","vatican"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Holy See (Vatican City State) and Djibouti":"The surface area of Holy See (Vatican City State) (0.4) plus that of Djibouti (23200) is 23200.4."}}},
{"id":"n-0eafc1c9","guard":[["hasAny",["barbados","mali"]],["has","plus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Barbados plus the surface area of Mali makes what":"The surface area of Barbados (430) plus that of Mali (1240192) is 1240622."}}},
{"id":"n-115750d3","guard":[["hasAny",["area","fiji","french","islands","southern","sum","surface","territories"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of French Southern territories and Fiji Islands":"The surface area of French Southern territories (7780) plus that of Fiji Islands (18274) is 26054."}}},
{"id":"n-14a9a7e5","guard":[["hasAny",["area","cocos","guinea","islands","keeling","makes","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Guinea plus the surface area of Cocos (Keeling) Islands makes what":"The surface area of Guinea (245857) plus that of Cocos (Keeling) Islands (14) is 245871."}}},
{"id":"n-1558f1e7","guard":[["hasAny",["area","ghana","sum","surface","ukraine"]],["has","sum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Ukraine and Ghana":"The surface area of Ukraine (603700) plus that of Ghana (238533) is 842233."}}},
{"id":"n-16230f65","guard":[["hasAny",["add","area","guinea","hungary","new","papua","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Hungary to the surface area of Papua New Guinea":"The surface area of Hungary (93030) plus that of Papua New Guinea (462840) is 555870."}}},
{"id":"n-172ba179","guard":[["hasAny",["area","cocos","islands","keeling","korea","north","sum","surface"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Cocos (Keeling) Islands and North Korea":"The surface area of Cocos (Keeling) Islands (14) plus that of North Korea (120538) is 120552."}}},
{"id":"n-183392fc","guard":[["hasAny",["area","grenada","libya","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Libya and Grenada":"The surface area of Libya (1759540) plus that of Grenada (344) is 1759884."}}},
{"id":"n-196aa5e2","guard":[["hasAny",["area","sum","surface","tokelau","turkmenistan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Turkmenistan and Tokelau":"The surface area of Turkmenistan (488100) plus that of Tokelau (12) is 488112."}}},
{"id":"n-1ad9b059","guard":[["hasAny",["area","mayotte","mongolia","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Mayotte and Mongolia":"The surface area of Mayotte (373) plus that of Mongolia (1566500) is 1566873."}}},
{"id":"n-1b521a23","guard":[["hasAny",["american","area","benin","samoa","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of American Samoa and Benin":"The surface area of American Samoa (199) plus that of Benin (112622) is 112821."}}},
{"id":"n-1bc41472","guard":[["hasAny",["area","malta","sum","surface","uganda"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Malta and Uganda":"The surface area of Malta (316) plus that of Uganda (241038) is 241354."}}},
{"id":"n-1c60793a","guard":[["hasAny",["add","area","british","islands","surface","uganda","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Uganda to the surface area of British Virgin Islands":"The surface area of Uganda (241038) plus that of British Virgin Islands (151) is 241189."}}},
{"id":"n-1c86f9e5","guard":[["hasAny",["area","kingdom","makes","pitcairn","plus","surface","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of United Kingdom plus the surface area of Pitcairn makes what":"The surface area of United Kingdom (242900) plus that of Pitcairn (49) is 242949."}}},
{"id":"n-1d552bc9","guard":[["hasAny",["albania","area","hong","kong","makes","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Albania plus the surface area of Hong Kong makes what":"The surface area of Albania (28748) plus that of Hong Kong (1075) is 29823."}}},
{"id":"n-1f36ff98","guard":[["hasAny",["bahamas","sum"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Turks and Caicos Islands and Bahamas":"The surface area of Turks and Caicos Islands (430) plus that of Bahamas (13878) is 14308."}}},
{"id":"n-2180cf46","guard":[["hasAny",["burundi","makes","plus"]],["has","surface"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Burundi plus the surface area of Holy See (Vatican City State) makes what":"The surface area of Burundi (27834) plus that of Holy See (Vatican City State) (0.4) is 27834.4."}}},
{"id":"n-22757237","guard":[["hasAny",["area","namibia","niue","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Niue and Namibia":"The surface area of Niue (260) plus that of Namibia (824292) is 824552."}}},
{"id":"n-24991358","guard":[["hasAny",["area","grenada","libya","sum","surface"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Libya and Grenada":"The surface area of Libya (1759540) plus that of Grenada (344) is 1759884."}}},
{"id":"n-27a417ce","guard":[["hasAny",["chad","cook"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Chad to the surface area of Cook Islands":"The surface area of Chad (1284000) plus that of Cook Islands (236) is 1284236."}}},
{"id":"n-2b367ba4","guard":[["hasAny",["area","dominican","republic","rwanda","sum","surface"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Dominican Republic and Rwanda":"The surface area of Dominican Republic (48511) plus that of Rwanda (26338) is 74849."}}},
{"id":"n-2cea9656","guard":[["hasAny",["add","area","barbados","mongolia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Mongolia to the surface area of Barbados":"The surface area of Mongolia (1566500) plus that of Barbados (430) is 1566930."}}},
{"id":"n-2ed67fa8","guard":[["hasAny",["qatar","southern","territories"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Qatar plus the surface area of French Southern territories makes what":"The surface area of Qatar (11000) plus that of French Southern territories (7780) is 18780."}}},
{"id":"n-3429f154","guard":[["hasAny",["add","area","costa","nicaragua","rica","surface"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Nicaragua to the surface area of Costa Rica":"The surface area of Nicaragua (130000) plus that of Costa Rica (51100) is 181100."}}},
{"id":"n-3787a697","guard":[["hasAny",["area","chad","ethiopia","sum","surface"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Ethiopia and Chad":"The surface area of Ethiopia (1104300) plus that of Chad (1284000) is 2388300."}}},
{"id":"n-379745d8","guard":[["hasAny",["add","area","niger","russia","surface"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Russia to the surface area of Niger":"The surface area of Russia (17075400) plus that of Niger (1267000) is 18342400."}}},
{"id":"n-389e4ac7","guard":[["hasAny",["area","bangladesh","makes","plus","surface","zambia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Zambia plus the surface area of Bangladesh makes what":"The surface area of Zambia (752618) plus that of Bangladesh (143998) is 896616."}}},
{"id":"n-3b77431a","guard":[["hasAny",["american","area","cook","islands","makes","plus","samoa","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Cook Islands plus the surface area of American Samoa makes what":"The surface area of Cook Islands (236) plus that of American Samoa (199) is 435."}}},
{"id":"n-3f73ed98","guard":[["hasAny",["add","area","gibraltar","korea","north","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of North Korea to the surface area of Gibraltar":"The surface area of North Korea (120538) plus that of Gibraltar (6) is 120544."}}},
{"id":"n-3f8d0c6c","guard":[["hasAny",["add","area","slovenia","somalia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Slovenia to the surface area of Somalia":"The surface area of Slovenia (20256) plus that of Somalia (637657) is 657913."}}},
{"id":"n-40130f32","guard":[["hasAny",["area","french","guiana","hungary","sum","surface"]],["has","sum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of French Guiana and Hungary":"The surface area of French Guiana (90000) plus that of Hungary (93030) is 183030."}}},
{"id":"n-40de2e42","guard":[["hasAny",["add","area","british","islands","surface","uganda","virgin"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Uganda to the surface area of British Virgin Islands":"The surface area of Uganda (241038) plus that of British Virgin Islands (151) is 241189."}}},
{"id":"n-433a303d","guard":[["hasAny",["add","area","aruba","lesotho","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Aruba to the surface area of Lesotho":"The surface area of Aruba (193) plus that of Lesotho (30355) is 30548."}}},
{"id":"n-4436585d","guard":[["hasAny",["area","kuwait","makes","mayotte","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Kuwait plus the surface area of Mayotte makes what":"The surface area of Kuwait (17818) plus that of Mayotte (373) is 18191."}}},
{"id":"n-44e3ab59","guard":[["hasAny",["add","area","surface","tokelau","zambia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Tokelau to the surface area of Zambia":"The surface area of Tokelau (12) plus that of Zambia (752618) is 752630."}}},
{"id":"n-46315d3d","guard":[["hasAny",["area","dominican","kitts","makes","nevis","plus","republic","saint","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Saint Kitts and Nevis plus the surface area of Dominican Republic makes what":"The surface area of Saint Kitts and Nevis (261) plus that of Dominican Republic (48511) is 48772."}}},
{"id":"n-46c4c7eb","guard":[["hasAny",["antilles","honduras"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Netherlands Antilles and Honduras":"The surface area of Netherlands Antilles (800) plus that of Honduras (112088) is 112888."}}},
{"id":"n-4769031a","guard":[["hasAny",["brazil","makes","plus"]],["has","surface"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Brazil plus the surface area of Turks and Caicos Islands makes what":"The surface area of Brazil (8547403) plus that of Turks and Caicos Islands (430) is 8547833."}}},
{"id":"n-48c9b953","guard":[["hasAny",["angola","taiwan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Taiwan plus the surface area of Angola makes what":"The surface area of Taiwan (36188) plus that of Angola (1246700) is 1282888."}}},
{"id":"n-4939676f","guard":[["hasAny",["madagascar","uzbekistan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Madagascar plus the surface area of Uzbekistan makes what":"The surface area of Madagascar (587041) plus that of Uzbekistan (447400) is 1034441."}}},
{"id":"n-49eda408","guard":[["hasAny",["bulgaria","panama"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Bulgaria plus the surface area of Panama makes what":"The surface area of Bulgaria (110994) plus that of Panama (75517) is 186511."}}},
{"id":"n-49f6e2f3","guard":[["hasAny",["area","french","guiana","hungary","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of French Guiana and Hungary":"The surface area of French Guiana (90000) plus that of Hungary (93030) is 183030."}}},
{"id":"n-4b1b9f3a","guard":[["hasAny",["area","makes","marino","plus","san","serbia","surface"]],["has","serbia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Serbia plus the surface area of San Marino makes what":"The surface area of Serbia (88361) plus that of San Marino (61) is 88422."}}},
{"id":"n-4b1f67ab","guard":[["hasAny",["add","area","burundi","honduras","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Honduras to the surface area of Burundi":"The surface area of Honduras (112088) plus that of Burundi (27834) is 139922."}}},
{"id":"n-4ccd4db5","guard":[["hasAny",["area","kiribati","states","sum","surface","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Kiribati and United States":"The surface area of Kiribati (726) plus that of United States (9363520) is 9364246."}}},
{"id":"n-4d178962","guard":[["hasAny",["area","kazakhstan","sum","surface","thailand"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Kazakhstan and Thailand":"The surface area of Kazakhstan (2724900) plus that of Thailand (513115) is 3238015."}}},
{"id":"n-4dd0d62c","guard":[["hasAny",["area","panama","reunion","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Panama and Reunion":"The surface area of Panama (75517) plus that of Reunion (2510) is 78027."}}},
{"id":"n-4f3b611e","guard":[["hasAny",["antilles","area","caledonia","makes","netherlands","new","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of New Caledonia plus the surface area of Netherlands Antilles makes what":"The surface area of New Caledonia (18575) plus that of Netherlands Antilles (800) is 19375."}}},
{"id":"n-50be5cdc","guard":[["hasAny",["area","nepal","russia","sum","surface"]],["has","sum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Nepal and Russia":"The surface area of Nepal (147181) plus that of Russia (17075400) is 17222581."}}},
{"id":"n-50da6c39","guard":[["hasAny",["malawi","somalia"]],["has","plus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Somalia plus the surface area of Malawi makes what":"The surface area of Somalia (637657) plus that of Malawi (118484) is 756141."}}},
{"id":"n-51bd5ace","guard":[["hasAny",["area","futuna","islands","mariana","northern","sum","surface","wallis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Northern Mariana Islands and Wallis and Futuna":"The surface area of Northern Mariana Islands (464) plus that of Wallis and Futuna (200) is 664."}}},
{"id":"n-524bc2b0","guard":[["hasAny",["angola","area","makes","plus","surface","taiwan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Taiwan plus the surface area of Angola makes what":"The surface area of Taiwan (36188) plus that of Angola (1246700) is 1282888."}}},
{"id":"n-52da2a55","guard":[["hasAny",["area","bahamas","caicos","islands","sum","surface","turks"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Turks and Caicos Islands and Bahamas":"The surface area of Turks and Caicos Islands (430) plus that of Bahamas (13878) is 14308."}}},
{"id":"n-53512d4b","guard":[["hasAny",["add","area","niger","russia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Russia to the surface area of Niger":"The surface area of Russia (17075400) plus that of Niger (1267000) is 18342400."}}},
{"id":"n-544667f2","guard":[["hasAny",["area","aruba","puerto","rico","sum","surface"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Puerto Rico and Aruba":"The surface area of Puerto Rico (8875) plus that of Aruba (193) is 9068."}}},
{"id":"n-548edce3","guard":[["hasAny",["area","panama","reunion","sum","surface"]],["has","sum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Panama and Reunion":"The surface area of Panama (75517) plus that of Reunion (2510) is 78027."}}},
{"id":"n-559e65e1","guard":[["hasAny",["kiribati","lebanon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Lebanon plus the surface area of Kiribati makes what":"The surface area of Lebanon (10400) plus that of Kiribati (726) is 11126."}}},
{"id":"n-579e23b6","guard":[["hasAny",["add","area","guinea","namibia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Namibia to the surface area of Guinea":"The surface area of Namibia (824292) plus that of Guinea (245857) is 1070149."}}},
{"id":"n-586e3d5f","guard":[["hasAny",["area","futuna","islands","mariana","northern","sum","surface","wallis"]],["has","sum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Northern Mariana Islands and Wallis and Futuna":"The surface area of Northern Mariana Islands (464) plus that of Wallis and Futuna (200) is 664."}}},
{"id":"n-59a019b6","guard":[["hasAny",["area","canada","sum","surface","tanzania"]],["has","sum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Canada and Tanzania":"The surface area of Canada (9970610) plus that of Tanzania (883749) is 10854359."}}},
{"id":"n-5abe1442","guard":[["hasAny",["guiana","iceland"]],["has","iceland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Iceland plus the surface area of French Guiana makes what":"The surface area of Iceland (103000) plus that of French Guiana (90000) is 193000."}}},
{"id":"n-5b12f636","guard":[["hasAny",["area","kingdom","makes","pitcairn","plus","surface","united"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of United Kingdom plus the surface area of Pitcairn makes what":"The surface area of United Kingdom (242900) plus that of Pitcairn (49) is 242949."}}},
{"id":"n-5bec96ae","guard":[["hasAny",["area","croatia","pitcairn","sum","surface"]],["has","sum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Pitcairn and Croatia":"The surface area of Pitcairn (49) plus that of Croatia (56538) is 56587."}}},
{"id":"n-5fb70817","guard":[["hasAny",["area","madagascar","makes","plus","surface","uzbekistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Madagascar plus the surface area of Uzbekistan makes what":"The surface area of Madagascar (587041) plus that of Uzbekistan (447400) is 1034441."}}},
{"id":"n-614c563f","guard":[["hasAny",["ethiopia","greenland"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Greenland plus the surface area of Ethiopia makes what":"The surface area of Greenland (2166090) plus that of Ethiopia (1104300) is 3270390."}}},
{"id":"n-61644af0","guard":[["hasAny",["add","area","madagascar","surface","tanzania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Tanzania to the surface area of Madagascar":"The surface area of Tanzania (883749) plus that of Madagascar (587041) is 1470790."}}},
{"id":"n-6165463f","guard":[["hasAny",["area","nicaragua","sum","surface","uzbekistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Uzbekistan and Nicaragua":"The surface area of Uzbekistan (447400) plus that of Nicaragua (130000) is 577400."}}},
{"id":"n-61cdffd3","guard":[["hasAny",["add","area","ghana","iceland","surface"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Ghana to the surface area of Iceland":"The surface area of Ghana (238533) plus that of Iceland (103000) is 341533."}}},
{"id":"n-621cc029","guard":[["hasAny",["area","malta","sum","surface","uganda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Malta and Uganda":"The surface area of Malta (316) plus that of Uganda (241038) is 241354."}}},
{"id":"n-6224a433","guard":[["hasAny",["area","makes","marino","plus","san","serbia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Serbia plus the surface area of San Marino makes what":"The surface area of Serbia (88361) plus that of San Marino (61) is 88422."}}},
{"id":"n-6247a502","guard":[["hasAny",["kuwait","mayotte"]],["has","plus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Kuwait plus the surface area of Mayotte makes what":"The surface area of Kuwait (17818) plus that of Mayotte (373) is 18191."}}},
{"id":"n-647865c9","guard":[["hasAny",["area","mali","martinique","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Mali and Martinique":"The surface area of Mali (1240192) plus that of Martinique (1102) is 1241294."}}},
{"id":"n-652bc866","guard":[["has","hungary"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Hungary to the surface area of Papua New Guinea":"The surface area of Hungary (93030) plus that of Papua New Guinea (462840) is 555870."}}},
{"id":"n-654ec409","guard":[["hasAny",["area","estonia","makes","plus","puerto","rico","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Estonia plus the surface area of Puerto Rico makes what":"The surface area of Estonia (45227) plus that of Puerto Rico (8875) is 54102."}}},
{"id":"n-65e25c89","guard":[["hasAny",["add","area","brazil","croatia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Croatia to the surface area of Brazil":"The surface area of Croatia (56538) plus that of Brazil (8547403) is 8603941."}}},
{"id":"n-696bc08f","guard":[["hasAny",["area","dominican","republic","rwanda","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Dominican Republic and Rwanda":"The surface area of Dominican Republic (48511) plus that of Rwanda (26338) is 74849."}}},
{"id":"n-6b5eb1b4","guard":[["hasAny",["area","burundi","city","holy","makes","plus","see","state","surface","vatican"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Burundi plus the surface area of Holy See (Vatican City State) makes what":"The surface area of Burundi (27834) plus that of Holy See (Vatican City State) (0.4) is 27834.4."}}},
{"id":"n-6bdb5f99","guard":[["hasAny",["add","area","greenland","portugal","surface"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Portugal to the surface area of Greenland":"The surface area of Portugal (91982) plus that of Greenland (2166090) is 2258072."}}},
{"id":"n-6c0e0b97","guard":[["hasAny",["area","makes","malawi","plus","somalia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Somalia plus the surface area of Malawi makes what":"The surface area of Somalia (637657) plus that of Malawi (118484) is 756141."}}},
{"id":"n-6ccb4af1","guard":[["hasAny",["area","bosnia","herzegovina","kazakhstan","makes","plus","surface"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Bosnia and Herzegovina plus the surface area of Kazakhstan makes what":"The surface area of Bosnia and Herzegovina (51197) plus that of Kazakhstan (2724900) is 2776097."}}},
{"id":"n-6f61b813","guard":[["hasAny",["area","costa","makes","plus","rica","surface","turkmenistan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Costa Rica plus the surface area of Turkmenistan makes what":"The surface area of Costa Rica (51100) plus that of Turkmenistan (488100) is 539200."}}},
{"id":"n-717cbd1d","guard":[["hasAny",["area","dominican","kitts","makes","nevis","plus","republic","saint","surface"]],["has","plus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Saint Kitts and Nevis plus the surface area of Dominican Republic makes what":"The surface area of Saint Kitts and Nevis (261) plus that of Dominican Republic (48511) is 48772."}}},
{"id":"n-740a4fc5","guard":[["hasAny",["area","libya","makes","niger","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Niger plus the surface area of Libya makes what":"The surface area of Niger (1267000) plus that of Libya (1759540) is 3026540."}}},
{"id":"n-749ea610","guard":[["hasAny",["andorra","area","singapore","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Andorra and Singapore":"The surface area of Andorra (468) plus that of Singapore (618) is 1086."}}},
{"id":"n-74d4a9ae","guard":[["hasAny",["area","namibia","niue","sum","surface"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Niue and Namibia":"The surface area of Niue (260) plus that of Namibia (824292) is 824552."}}},
{"id":"n-757996ef","guard":[["hasAny",["add","area","bulgaria","futuna","surface","wallis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Wallis and Futuna to the surface area of Bulgaria":"The surface area of Wallis and Futuna (200) plus that of Bulgaria (110994) is 111194."}}},
{"id":"n-760a3c2e","guard":[["hasAny",["area","ethiopia","greenland","makes","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Greenland plus the surface area of Ethiopia makes what":"The surface area of Greenland (2166090) plus that of Ethiopia (1104300) is 3270390."}}},
{"id":"n-7662a00d","guard":[["hasAny",["area","french","guiana","iceland","makes","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Iceland plus the surface area of French Guiana makes what":"The surface area of Iceland (103000) plus that of French Guiana (90000) is 193000."}}},
{"id":"n-76cc5dc8","guard":[["hasAny",["add","area","cameroon","reunion","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Reunion to the surface area of Cameroon":"The surface area of Reunion (2510) plus that of Cameroon (475442) is 477952."}}},
{"id":"n-775e8d01","guard":[["hasAny",["add","area","brunei","states","surface","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of United States to the surface area of Brunei":"The surface area of United States (9363520) plus that of Brunei (5765) is 9369285."}}},
{"id":"n-777221ad","guard":[["hasAny",["area","croatia","pitcairn","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Pitcairn and Croatia":"The surface area of Pitcairn (49) plus that of Croatia (56538) is 56587."}}},
{"id":"n-77db1ca7","guard":[["hasAny",["area","bangladesh","portugal","sum","surface"]],["has","sum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Bangladesh and Portugal":"The surface area of Bangladesh (143998) plus that of Portugal (91982) is 235980."}}},
{"id":"n-798176d4","guard":[["hasAny",["area","malawi","maldives","sum","surface"]],["has","sum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Malawi and Maldives":"The surface area of Malawi (118484) plus that of Maldives (298) is 118782."}}},
{"id":"n-79df4505","guard":[["hasAny",["add","area","bosnia","herzegovina","netherlands","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Netherlands to the surface area of Bosnia and Herzegovina":"The surface area of Netherlands (41526) plus that of Bosnia and Herzegovina (51197) is 92723."}}},
{"id":"n-7afa1bab","guard":[["hasAny",["bangladesh","zambia"]],["has","zambia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Zambia plus the surface area of Bangladesh makes what":"The surface area of Zambia (752618) plus that of Bangladesh (143998) is 896616."}}},
{"id":"n-7c3ffa41","guard":[["hasAny",["add","area","kingdom","singapore","surface","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Singapore to the surface area of United Kingdom":"The surface area of Singapore (618) plus that of United Kingdom (242900) is 243518."}}},
{"id":"n-7c46a150","guard":[["hasAny",["add","area","surface","switzerland","taiwan"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Switzerland to the surface area of Taiwan":"The surface area of Switzerland (41284) plus that of Taiwan (36188) is 77472."}}},
{"id":"n-7da46af8","guard":[["hasAny",["marino","san"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of San Marino and Netherlands":"The surface area of San Marino (61) plus that of Netherlands (41526) is 41587."}}},
{"id":"n-7e0c6391","guard":[["hasAny",["andorra","area","brunei","makes","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Brunei plus the surface area of Andorra makes what":"The surface area of Brunei (5765) plus that of Andorra (468) is 6233."}}},
{"id":"n-7eef6465","guard":[["has","brunei"],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of United States to the surface area of Brunei":"The surface area of United States (9363520) plus that of Brunei (5765) is 9369285."}}},
{"id":"n-80ec00ff","guard":[["hasAny",["libya","niger"]],["has","plus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Niger plus the surface area of Libya makes what":"The surface area of Niger (1267000) plus that of Libya (1759540) is 3026540."}}},
{"id":"n-8115cdb7","guard":[["hasAny",["add","area","ghana","iceland","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Ghana to the surface area of Iceland":"The surface area of Ghana (238533) plus that of Iceland (103000) is 341533."}}},
{"id":"n-81dd2310","guard":[["hasAny",["area","mali","martinique","sum","surface"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Mali and Martinique":"The surface area of Mali (1240192) plus that of Martinique (1102) is 1241294."}}},
{"id":"n-824c33c0","guard":[["hasAny",["area","chad","ethiopia","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Ethiopia and Chad":"The surface area of Ethiopia (1104300) plus that of Chad (1284000) is 2388300."}}},
{"id":"n-8709a650","guard":[["hasAny",["add","area","lebanon","rwanda","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Rwanda to the surface area of Lebanon":"The surface area of Rwanda (26338) plus that of Lebanon (10400) is 36738."}}},
{"id":"n-8b629c2e","guard":[["hasAny",["area","chile","sum","surface","switzerland"]],["has","sum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Chile and Switzerland":"The surface area of Chile (756626) plus that of Switzerland (41284) is 797910."}}},
{"id":"n-8e2903a0","guard":[["hasAny",["area","nepal","russia","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Nepal and Russia":"The surface area of Nepal (147181) plus that of Russia (17075400) is 17222581."}}},
{"id":"n-8ef3351b","guard":[["hasAny",["add","area","greenland","portugal","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Portugal to the surface area of Greenland":"The surface area of Portugal (91982) plus that of Greenland (2166090) is 2258072."}}},
{"id":"n-911b2607","guard":[["hasAny",["area","malawi","maldives","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Malawi and Maldives":"The surface area of Malawi (118484) plus that of Maldives (298) is 118782."}}},
{"id":"n-929f2104","guard":[["hasAny",["area","french","makes","plus","qatar","southern","surface","territories"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Qatar plus the surface area of French Southern territories makes what":"The surface area of Qatar (11000) plus that of French Southern territories (7780) is 18780."}}},
{"id":"n-950add6b","guard":[["hasAny",["add","area","caledonia","martinique","new","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Martinique to the surface area of New Caledonia":"The surface area of Martinique (1102) plus that of New Caledonia (18575) is 19677."}}},
{"id":"n-967f0528","guard":[["hasAny",["cameroon","gabon"]],["has","cameroon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Cameroon plus the surface area of Gabon makes what":"The surface area of Cameroon (475442) plus that of Gabon (267668) is 743110."}}},
{"id":"n-9882c856","guard":[["hasAny",["area","gibraltar","makes","plus","surface","ukraine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Gibraltar plus the surface area of Ukraine makes what":"The surface area of Gibraltar (6) plus that of Ukraine (603700) is 603706."}}},
{"id":"n-98dbdda1","guard":[["hasAny",["area","costa","makes","plus","rica","surface","turkmenistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Costa Rica plus the surface area of Turkmenistan makes what":"The surface area of Costa Rica (51100) plus that of Turkmenistan (488100) is 539200."}}},
{"id":"n-991ab2fe","guard":[["hasAny",["area","estonia","makes","plus","puerto","rico","surface"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Estonia plus the surface area of Puerto Rico makes what":"The surface area of Estonia (45227) plus that of Puerto Rico (8875) is 54102."}}},
{"id":"n-9a41cb7f","guard":[["hasAny",["area","gabon","iraq","sum","surface"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Gabon and Iraq":"The surface area of Gabon (267668) plus that of Iraq (438317) is 705985."}}},
{"id":"n-9baf594e","guard":[["hasAny",["area","fiji","french","islands","southern","sum","surface","territories"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of French Southern territories and Fiji Islands":"The surface area of French Southern territories (7780) plus that of Fiji Islands (18274) is 26054."}}},
{"id":"n-9d472ab6","guard":[["hasAny",["area","equatorial","guinea","hong","kong","sum","surface"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Hong Kong and Equatorial Guinea":"The surface area of Hong Kong (1075) plus that of Equatorial Guinea (28051) is 29126."}}},
{"id":"n-9ddcf62f","guard":[["hasAny",["area","marino","netherlands","san","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of San Marino and Netherlands":"The surface area of San Marino (61) plus that of Netherlands (41526) is 41587."}}},
{"id":"n-9e03ce2d","guard":[["hasAny",["area","cameroon","gabon","makes","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Cameroon plus the surface area of Gabon makes what":"The surface area of Cameroon (475442) plus that of Gabon (267668) is 743110."}}},
{"id":"n-9e7603d7","guard":[["hasAny",["albania","area","hong","kong","makes","plus","surface"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Albania plus the surface area of Hong Kong makes what":"The surface area of Albania (28748) plus that of Hong Kong (1075) is 29823."}}},
{"id":"n-9fa4b258","guard":[["hasAny",["area","gabon","iraq","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Gabon and Iraq":"The surface area of Gabon (267668) plus that of Iraq (438317) is 705985."}}},
{"id":"n-a28cf422","guard":[["hasAny",["add","area","bahamas","laos","surface"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Bahamas to the surface area of Laos":"The surface area of Bahamas (13878) plus that of Laos (236800) is 250678."}}},
{"id":"n-a2cef37d","guard":[["hasAny",["area","cocos","guinea","islands","keeling","makes","plus","surface"]],["has","guinea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Guinea plus the surface area of Cocos (Keeling) Islands makes what":"The surface area of Guinea (245857) plus that of Cocos (Keeling) Islands (14) is 245871."}}},
{"id":"n-a304f65f","guard":[["hasAny",["area","canada","laos","makes","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Laos plus the surface area of Canada makes what":"The surface area of Laos (236800) plus that of Canada (9970610) is 10207410."}}},
{"id":"n-a3b1a65e","guard":[["hasAny",["antilles","area","honduras","netherlands","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Netherlands Antilles and Honduras":"The surface area of Netherlands Antilles (800) plus that of Honduras (112088) is 112888."}}},
{"id":"n-a3d42cc5","guard":[["hasAny",["area","british","islands","makes","mariana","northern","plus","surface","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of British Virgin Islands plus the surface area of Northern Mariana Islands makes what":"The surface area of British Virgin Islands (151) plus that of Northern Mariana Islands (464) is 615."}}},
{"id":"n-a58ef8ca","guard":[["hasAny",["area","chile","sum","surface","switzerland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Chile and Switzerland":"The surface area of Chile (756626) plus that of Switzerland (41284) is 797910."}}},
{"id":"n-a5fa472f","guard":[["hasAny",["kingdom","singapore"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Singapore to the surface area of United Kingdom":"The surface area of Singapore (618) plus that of United Kingdom (242900) is 243518."}}},
{"id":"n-a6a43d6a","guard":[["hasAny",["american","area","benin","samoa","sum","surface"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of American Samoa and Benin":"The surface area of American Samoa (199) plus that of Benin (112622) is 112821."}}},
{"id":"n-a8742fd4","guard":[["hasAny",["area","japan","makes","malta","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Japan plus the surface area of Malta makes what":"The surface area of Japan (377829) plus that of Malta (316) is 378145."}}},
{"id":"n-aa04de87","guard":[["hasAny",["add","area","djibouti","estonia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Djibouti to the surface area of Estonia":"The surface area of Djibouti (23200) plus that of Estonia (45227) is 68427."}}},
{"id":"n-abdc2ccd","guard":[["hasAny",["area","nicaragua","sum","surface","uzbekistan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Uzbekistan and Nicaragua":"The surface area of Uzbekistan (447400) plus that of Nicaragua (130000) is 577400."}}},
{"id":"n-ac6bcb79","guard":[["hasAny",["equatorial","serbia"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Equatorial Guinea to the surface area of Serbia":"The surface area of Equatorial Guinea (28051) plus that of Serbia (88361) is 116412."}}},
{"id":"n-adb5c806","guard":[["has","namibia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Namibia to the surface area of Guinea":"The surface area of Namibia (824292) plus that of Guinea (245857) is 1070149."}}},
{"id":"n-ae766c6c","guard":[["hasAny",["djibouti","sum"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Holy See (Vatican City State) and Djibouti":"The surface area of Holy See (Vatican City State) (0.4) plus that of Djibouti (23200) is 23200.4."}}},
{"id":"n-b2393819","guard":[["hasAny",["area","ghana","sum","surface","ukraine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Ukraine and Ghana":"The surface area of Ukraine (603700) plus that of Ghana (238533) is 842233."}}},
{"id":"n-b2b745a7","guard":[["hasAny",["american","area","cook","islands","makes","plus","samoa","surface"]],["has","plus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Cook Islands plus the surface area of American Samoa makes what":"The surface area of Cook Islands (236) plus that of American Samoa (199) is 435."}}},
{"id":"n-b332fae0","guard":[["hasAny",["lesotho","niue"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Lesotho plus the surface area of Niue makes what":"The surface area of Lesotho (30355) plus that of Niue (260) is 30615."}}},
{"id":"n-b3405d27","guard":[["hasAny",["area","comoros","finland","sum","surface"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Comoros and Finland":"The surface area of Comoros (1862) plus that of Finland (338145) is 340007."}}},
{"id":"n-b3a79f8d","guard":[["hasAny",["add","area","grenada","kitts","nevis","saint","surface"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Grenada to the surface area of Saint Kitts and Nevis":"The surface area of Grenada (344) plus that of Saint Kitts and Nevis (261) is 605."}}},
{"id":"n-b625682e","guard":[["hasAny",["add","area","kuwait","surface","thailand"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Thailand to the surface area of Kuwait":"The surface area of Thailand (513115) plus that of Kuwait (17818) is 530933."}}},
{"id":"n-b6ad0670","guard":[["hasAny",["andorra","area","singapore","sum","surface"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Andorra and Singapore":"The surface area of Andorra (468) plus that of Singapore (618) is 1086."}}},
{"id":"n-b702a91b","guard":[["hasAny",["area","cocos","islands","keeling","korea","north","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Cocos (Keeling) Islands and North Korea":"The surface area of Cocos (Keeling) Islands (14) plus that of North Korea (120538) is 120552."}}},
{"id":"n-b9018591","guard":[["hasAny",["add","area","finland","qatar","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Finland to the surface area of Qatar":"The surface area of Finland (338145) plus that of Qatar (11000) is 349145."}}},
{"id":"n-ba57ae8f","guard":[["hasAny",["area","bangladesh","portugal","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Bangladesh and Portugal":"The surface area of Bangladesh (143998) plus that of Portugal (91982) is 235980."}}},
{"id":"n-ba986770","guard":[["hasAny",["area","barbados","makes","mali","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Barbados plus the surface area of Mali makes what":"The surface area of Barbados (430) plus that of Mali (1240192) is 1240622."}}},
{"id":"n-bc66e2d0","guard":[["hasAny",["japan","malta"]],["has","japan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Japan plus the surface area of Malta makes what":"The surface area of Japan (377829) plus that of Malta (316) is 378145."}}},
{"id":"n-bde79775","guard":[["hasAny",["add","area","chad","cook","islands","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Chad to the surface area of Cook Islands":"The surface area of Chad (1284000) plus that of Cook Islands (236) is 1284236."}}},
{"id":"n-c0e4abfa","guard":[["hasAny",["add","area","cameroon","reunion","surface"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Reunion to the surface area of Cameroon":"The surface area of Reunion (2510) plus that of Cameroon (475442) is 477952."}}},
{"id":"n-c136d825","guard":[["hasAny",["add","area","djibouti","estonia","surface"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Djibouti to the surface area of Estonia":"The surface area of Djibouti (23200) plus that of Estonia (45227) is 68427."}}},
{"id":"n-c144230e","guard":[["hasAny",["andorra","brunei"]],["has","plus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Brunei plus the surface area of Andorra makes what":"The surface area of Brunei (5765) plus that of Andorra (468) is 6233."}}},
{"id":"n-c28f7bb6","guard":[["hasAny",["add","area","lebanon","rwanda","surface"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Rwanda to the surface area of Lebanon":"The surface area of Rwanda (26338) plus that of Lebanon (10400) is 36738."}}},
{"id":"n-c4088dae","guard":[["hasAny",["area","comoros","finland","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Comoros and Finland":"The surface area of Comoros (1862) plus that of Finland (338145) is 340007."}}},
{"id":"n-c4210907","guard":[["hasAny",["canada","laos"]],["has","laos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Laos plus the surface area of Canada makes what":"The surface area of Laos (236800) plus that of Canada (9970610) is 10207410."}}},
{"id":"n-c53c663d","guard":[["hasAny",["add","area","madagascar","surface","tanzania"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Tanzania to the surface area of Madagascar":"The surface area of Tanzania (883749) plus that of Madagascar (587041) is 1470790."}}},
{"id":"n-c6378301","guard":[["hasAny",["chile","makes","plus"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Svalbard and Jan Mayen plus the surface area of Chile makes what":"The surface area of Svalbard and Jan Mayen (62422) plus that of Chile (756626) is 819048."}}},
{"id":"n-c8039cf3","guard":[["hasAny",["angola","area","slovenia","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Angola and Slovenia":"The surface area of Angola (1246700) plus that of Slovenia (20256) is 1266956."}}},
{"id":"n-c8bfecf0","guard":[["hasAny",["angola","area","slovenia","sum","surface"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Angola and Slovenia":"The surface area of Angola (1246700) plus that of Slovenia (20256) is 1266956."}}},
{"id":"n-c974b5e5","guard":[["hasAny",["add","area","gibraltar","korea","north","surface"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of North Korea to the surface area of Gibraltar":"The surface area of North Korea (120538) plus that of Gibraltar (6) is 120544."}}},
{"id":"n-c99bdffd","guard":[["hasAny",["gibraltar","ukraine"]],["has","gibraltar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Gibraltar plus the surface area of Ukraine makes what":"The surface area of Gibraltar (6) plus that of Ukraine (603700) is 603706."}}},
{"id":"n-cfd15950","guard":[["hasAny",["add","area","surface","switzerland","taiwan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Switzerland to the surface area of Taiwan":"The surface area of Switzerland (41284) plus that of Taiwan (36188) is 77472."}}},
{"id":"n-d10028ba","guard":[["hasAny",["add","area","benin","japan","surface"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Benin to the surface area of Japan":"The surface area of Benin (112622) plus that of Japan (377829) is 490451."}}},
{"id":"n-d3cda336","guard":[["hasAny",["add","area","brazil","croatia","surface"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Croatia to the surface area of Brazil":"The surface area of Croatia (56538) plus that of Brazil (8547403) is 8603941."}}},
{"id":"n-d5210df6","guard":[["hasAny",["area","british","islands","makes","mariana","northern","plus","surface","virgin"]],["has","british"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of British Virgin Islands plus the surface area of Northern Mariana Islands makes what":"The surface area of British Virgin Islands (151) plus that of Northern Mariana Islands (464) is 615."}}},
{"id":"n-d70e175a","guard":[["hasAny",["add","area","iraq","jan","mayen","surface","svalbard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Iraq to the surface area of Svalbard and Jan Mayen":"The surface area of Iraq (438317) plus that of Svalbard and Jan Mayen (62422) is 500739."}}},
{"id":"n-da0935a0","guard":[["hasAny",["add","area","aruba","lesotho","surface"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Aruba to the surface area of Lesotho":"The surface area of Aruba (193) plus that of Lesotho (30355) is 30548."}}},
{"id":"n-dc42140a","guard":[["hasAny",["area","aruba","puerto","rico","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Puerto Rico and Aruba":"The surface area of Puerto Rico (8875) plus that of Aruba (193) is 9068."}}},
{"id":"n-e198d253","guard":[["hasAny",["area","guinea","makes","nepal","new","papua","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Papua New Guinea plus the surface area of Nepal makes what":"The surface area of Papua New Guinea (462840) plus that of Nepal (147181) is 610021."}}},
{"id":"n-e20809ea","guard":[["hasAny",["add","area","burundi","honduras","surface"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Honduras to the surface area of Burundi":"The surface area of Honduras (112088) plus that of Burundi (27834) is 139922."}}},
{"id":"n-e6338db7","guard":[["hasAny",["add","area","bahamas","laos","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Bahamas to the surface area of Laos":"The surface area of Bahamas (13878) plus that of Laos (236800) is 250678."}}},
{"id":"n-e693c886","guard":[["hasAny",["add","area","costa","nicaragua","rica","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Nicaragua to the surface area of Costa Rica":"The surface area of Nicaragua (130000) plus that of Costa Rica (51100) is 181100."}}},
{"id":"n-ea80f1c2","guard":[["hasAny",["area","kiribati","lebanon","makes","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Lebanon plus the surface area of Kiribati makes what":"The surface area of Lebanon (10400) plus that of Kiribati (726) is 11126."}}},
{"id":"n-ec7e9d14","guard":[["hasAny",["area","canada","sum","surface","tanzania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Canada and Tanzania":"The surface area of Canada (9970610) plus that of Tanzania (883749) is 10854359."}}},
{"id":"n-ee7d452c","guard":[["hasAny",["kiribati","sum"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Kiribati and United States":"The surface area of Kiribati (726) plus that of United States (9363520) is 9364246."}}},
{"id":"n-ef9717dc","guard":[["hasAny",["add","area","surface","tokelau","zambia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Tokelau to the surface area of Zambia":"The surface area of Tokelau (12) plus that of Zambia (752618) is 752630."}}},
{"id":"n-f0f88728","guard":[["hasAny",["add","area","slovenia","somalia","surface"]],["has","add"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Slovenia to the surface area of Somalia":"The surface area of Slovenia (20256) plus that of Somalia (637657) is 657913."}}},
{"id":"n-f14eb2cb","guard":[["hasAny",["add","area","grenada","kitts","nevis","saint","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Grenada to the surface area of Saint Kitts and Nevis":"The surface area of Grenada (344) plus that of Saint Kitts and Nevis (261) is 605."}}},
{"id":"n-f229bbfd","guard":[["hasAny",["makes","nepal","plus"]],["has","surface"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of Papua New Guinea plus the surface area of Nepal makes what":"The surface area of Papua New Guinea (462840) plus that of Nepal (147181) is 610021."}}},
{"id":"n-f3d5448b","guard":[["hasAny",["area","lesotho","makes","niue","plus","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the surface area of Lesotho plus the surface area of Niue makes what":"The surface area of Lesotho (30355) plus that of Niue (260) is 30615."}}},
{"id":"n-f3d5ff0d","guard":[["hasAny",["area","kazakhstan","sum","surface","thailand"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Kazakhstan and Thailand":"The surface area of Kazakhstan (2724900) plus that of Thailand (513115) is 3238015."}}},
{"id":"n-f65e80b3","guard":[["hasAny",["add","area","equatorial","guinea","serbia","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Equatorial Guinea to the surface area of Serbia":"The surface area of Equatorial Guinea (28051) plus that of Serbia (88361) is 116412."}}},
{"id":"n-f72b952e","guard":[["hasAny",["add","area","benin","japan","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Benin to the surface area of Japan":"The surface area of Benin (112622) plus that of Japan (377829) is 490451."}}},
{"id":"n-f7fb7454","guard":[["hasAny",["area","equatorial","guinea","hong","kong","sum","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the surface area of Hong Kong and Equatorial Guinea":"The surface area of Hong Kong (1075) plus that of Equatorial Guinea (28051) is 29126."}}},
{"id":"n-fadca6e2","guard":[["hasAny",["add","albania","area","fiji","islands","surface"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the surface area of Fiji Islands to the surface area of Albania":"The surface area of Fiji Islands (18274) plus that of Albania (28748) is 47022."}}},
{"id":"n-fc146f76","guard":[["hasAny",["albania","fiji"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"add the surface area of Fiji Islands to the surface area of Albania":"The surface area of Fiji Islands (18274) plus that of Albania (28748) is 47022."}}},
{"id":"n-ff4e4a66","guard":[["hasAny",["antilles","area","caledonia","makes","netherlands","new","plus","surface"]],["has","plus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"the surface area of New Caledonia plus the surface area of Netherlands Antilles makes what":"The surface area of New Caledonia (18575) plus that of Netherlands Antilles (800) is 19375."}}},
{"id":"n-3553a2c2","guard":[["hasAny",["element","item number","longest","longest one","longest word","maldives","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," area of ",{"slot":1}," (118484) plus that of ",{"slot":2}," (298) is 118782."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3e4379af","guard":[["hasAny",["comoros","element","item number","longest","longest one","longest word","nth","position"]],["has","sum"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Comoros (1862) plus that of ",{"slot":2}," (338145) is 340007."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-a7876465","guard":[["hasAny",["element","item number","longest","longest one","longest word","maldives","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Malawi (118484) plus that of ",{"slot":2}," (298) is 118782."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ed3c2ed8","guard":[["hasAny",["comoros","element","item number","longest","longest one","longest word","nth","position"]],["has","sum"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1862) plus that of Finland (338145) is 340007."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ed9b432e","guard":[["hasAny",["element","item number","longest","longest one","longest word","maldives","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," (118484) plus that of ",{"slot":2}," (298) is 118782."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fd861000","guard":[["hasAny",["comoros","element","item number","longest","longest one","longest word","nth","position"]],["has","sum"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," area of ",{"slot":1}," (1862) plus that of ",{"slot":2}," (338145) is 340007."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-4d6bdacf","guard":[["hasAny",["element","item number","maldives","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (118484) plus that of Maldives (298) is 118782."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-66ad57d3","guard":[["hasAny",["comoros","element","item number","nth","position"]],["has","sum"]],"pyramid":["render.template",{"lit":["The surface ",{"slot":0}," of ",{"slot":1}," (1862) plus that of ",{"slot":2}," (338145) is 340007."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-cfa2b71a","guard":[["hasAny",["comoros","element","item number","longest","longest one","longest word","nth","position"]],["has","sum"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1862) plus that of ",{"slot":3}," (338145) is 340007."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-3227ffec","guard":[["hasAny",["comoros","element","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","sum"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1862) plus that of ",{"slot":3}," (338145) is 340007."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-58194f90","guard":[["hasAny",["capitalise","capitalize","capitalize each word","comoros","element","item number","longest","longest one","longest word","nth","position","title case"]],["has","sum"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1862) plus that of ",{"slot":3}," (338145) is 340007."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-71cd9cdd","guard":[["hasAny",["element","item number","maldives","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (118484) plus that of ",{"slot":3}," (298) is 118782."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-8c9b43ae","guard":[["hasAny",["comoros","element","item number","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]],["has","sum"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1862) plus that of ",{"slot":3}," (338145) is 340007."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8eb78d01","guard":[["hasAny",["all caps","capital letters","capitals","comoros","element","item number","longest","longest one","longest word","nth","position","upper case","uppercase"]],["has","sum"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1862) plus that of ",{"slot":3}," (338145) is 340007."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-0315d618","guard":[["hasAny",["comoros","each word","element","item number","longest","longest one","longest word","nth","position","split into words"]],["has","sum"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1862) plus that of ",{"slot":3}," (338145) is 340007."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0d271ea4","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","portugal","position"]],["has","add"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (91982) plus that of ",{"slot":3}," (2166090) is 2258072."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-14e6042a","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","ukraine"]],["has","gibraltar"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (6) ",{"slot":3}," that of Ukraine (603700) is 603706."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1c0b8d91","guard":[["hasAny",["element","item number","longest","longest one","longest word","martinique","nth","position"]],["has","surface"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1102) plus that of ",{"slot":3}," Caledonia (18575) is 19677."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-2a27c65d","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","tanzania"]],["has","add"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (883749) plus that of ",{"slot":3}," (587041) is 1470790."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2bfbff9b","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","switzerland"]],["has","add"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (41284) plus that of ",{"slot":3}," (36188) is 77472."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-355caf84","guard":[["hasAny",["element","gabon","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (475442) ",{"slot":3}," that of Gabon (267668) is 743110."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-37e50c4e","guard":[["hasAny",["element","item number","longest","longest one","longest word","nicaragua","nth","position"]],["has","add"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (130000) plus that of ",{"slot":3}," Rica (51100) is 181100."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-43560e76","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","russia"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (17075400) plus that of ",{"slot":3}," (1267000) is 18342400."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-4abd3b8d","guard":[["hasAny",["comoros","element","item number","longest","longest one","longest word","nth","position"]],["has","sum"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1862) plus that of ",{"slot":3}," (338145) is 340007."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-67ee2e22","guard":[["hasAny",["chad","element","item number","longest","longest one","longest word","nth","position"]],["has","add"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1284000) plus that of ",{"slot":3}," Islands (236) is 1284236."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-6df0849e","guard":[["hasAny",["element","ghana","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (238533) plus that of ",{"slot":3}," (103000) is 341533."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-6e8a6f03","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","tokelau"]],["has","add"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (12) plus that of ",{"slot":3}," (752618) is 752630."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-6f5c0060","guard":[["hasAny",["element","invert case","item number","maldives","nth","position","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (118484) plus that of ",{"slot":3}," (298) is 118782."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7806df06","guard":[["hasAny",["comoros","element","item number","longest","longest one","longest word","nth","position"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1862) plus that of ",{"slot":3}," (338145) is 340007."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-800fd2b4","guard":[["hasAny",["element","item number","longest","longest one","longest word","namibia","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (824292) plus that of ",{"slot":3}," (245857) is 1070149."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-8252e7cd","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","singapore"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (618) plus that of ",{"slot":3}," Kingdom (242900) is 243518."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-88a60f91","guard":[["hasAny",["canada","element","item number","longest","longest one","longest word","nth","position"]],["has","laos"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (236800) ",{"slot":3}," that of Canada (9970610) is 10207410."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8e440d2f","guard":[["hasAny",["element","grenada","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (344) plus that of ",{"slot":3}," Kitts and Nevis (261) is 605."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-903d521d","guard":[["hasAny",["element","item number","longest","longest one","longest word","maldives","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (118484) plus that of ",{"slot":3}," (298) is 118782."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-99cc2c4e","guard":[["hasAny",["element","iraq","item number","longest","longest one","longest word","nth","position"]],["has","add"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (438317) plus that of ",{"slot":3}," and Jan Mayen (62422) is 500739."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9a288203","guard":[["hasAny",["element","item number","libya","longest","longest one","longest word","nth","position"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1267000) ",{"slot":3}," that of Libya (1759540) is 3026540."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a1cbea69","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","uzbekistan"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (587041) ",{"slot":3}," that of Uzbekistan (447400) is 1034441."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-acc26c0d","guard":[["hasAny",["croatia","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (56538) plus that of ",{"slot":3}," (8547403) is 8603941."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-ad707d48","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","thailand"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (513115) plus that of ",{"slot":3}," (17818) is 530933."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-b0f72cb5","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","slovenia"]],["has","add"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (20256) plus that of ",{"slot":3}," (637657) is 657913."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-b389c92f","guard":[["hasAny",["element","item number","longest","longest one","longest word","maldives","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (118484) plus that of ",{"slot":3}," (298) is 118782."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-baf80152","guard":[["hasAny",["element","item number","longest","longest one","longest word","malta","nth","position"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (377829) ",{"slot":3}," that of Malta (316) is 378145."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bc7f4b67","guard":[["hasAny",["bangladesh","element","item number","longest","longest one","longest word","nth","position"]],["has","zambia"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (752618) plus that of ",{"slot":3}," (143998) is 896616."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-be663c0a","guard":[["hasAny",["element","finland","item number","longest","longest one","longest word","nth","position"]],["has","surface"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (338145) plus that of ",{"slot":3}," (11000) is 349145."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-c3b9bac6","guard":[["hasAny",["element","item number","lower case","lowercase","maldives","nth","position","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (118484) plus that of ",{"slot":3}," (298) is 118782."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c5e6cbcb","guard":[["hasAny",["element","ethiopia","item number","longest","longest one","longest word","nth","position"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (2166090) ",{"slot":3}," that of Ethiopia (1104300) is 3270390."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c8c981f6","guard":[["hasAny",["andorra","element","item number","longest","longest one","longest word","nth","position"]],["has","brunei"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (5765) ",{"slot":3}," that of Andorra (468) is 6233."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c9b42c80","guard":[["hasAny",["comoros","each word","element","item number","longest","longest one","longest word","nth","position","split into words"]],["has","sum"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1862) plus that of ",{"slot":3}," (338145) is 340007."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cf84b9ad","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","maldives","nth","position","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (118484) plus that of ",{"slot":3}," (298) is 118782."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-d0d0f6cd","guard":[["hasAny",["element","item number","longest","longest one","longest word","niue","nth","position"]],["has","lesotho"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (30355) ",{"slot":3}," that of Niue (260) is 30615."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d86f5270","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","uganda"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (241038) plus that of ",{"slot":3}," Virgin Islands (151) is 241189."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-df19d14a","guard":[["hasAny",["angola","element","item number","longest","longest one","longest word","nth","position"]],["has","taiwan"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (36188) ",{"slot":3}," that of Angola (1246700) is 1282888."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-df38f6a1","guard":[["hasAny",["comoros","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1862) plus that of ",{"slot":3}," (338145) is 340007."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-e8d316ac","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","panama","position"]],["has","bulgaria"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (110994) ",{"slot":3}," that of Panama (75517) is 186511."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ed372a5b","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","reunion"]],["has","add"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (2510) plus that of ",{"slot":3}," (475442) is 477952."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ed54715d","guard":[["hasAny",["element","item number","longest","longest one","longest word","mali","nth","position"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (430) ",{"slot":3}," that of Mali (1240192) is 1240622."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":6}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f6f9cb66","guard":[["hasAny",["element","item number","longest","longest one","longest word","malawi","nth","position"]],["has","somalia"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (637657) ",{"slot":3}," that of Malawi (118484) is 756141."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":6}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ff46e64d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","maldives","nth","position","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (118484) plus that of ",{"slot":3}," (298) is 118782."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0f81fbb6","guard":[["hasAny",["each word","element","item number","maldives","nth","position","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (118484) plus that of ",{"slot":3}," (298) is 118782."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-303b5de4","guard":[["hasAny",["dominican","element","item number","nth","position"]],["has","of"]],"pyramid":["render.template",{"lit":["The surface area of ",{"slot":0}," ",{"slot":1}," and ",{"slot":2}," (261) plus that of ",{"slot":3}," Republic (48511) is 48772."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":14}]],"mem":null},
{"id":"n-61bca95c","guard":[["hasAny",["element","item number","maldives","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (118484) plus that of ",{"slot":3}," (298) is 118782."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":12}]],"mem":null},
{"id":"n-c5132209","guard":[["hasAny",["comoros","element","item number","nth","position"]],["has","sum"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (1862) plus that of ",{"slot":3}," (338145) is 340007."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-c74eeb45","guard":[["hasAny",["element","item number","maldives","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," (118484) plus that of ",{"slot":3}," (298) is 118782."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"the surface area of Iceland plus the surface area of French Guiana makes what","expect":{"contains":["193000"],"notRefusal":true}},{"q":"what is the sum of the surface area of Netherlands Antilles and Honduras","expect":{"contains":["112888"],"notRefusal":true}},{"q":"add the surface area of Hungary to the surface area of Papua New Guinea","expect":{"contains":["555870"],"notRefusal":true}},{"q":"add the surface area of Thailand to the surface area of Kuwait","expect":{"contains":["530933"],"notRefusal":true}},{"q":"what is the sum of the surface area of French Southern territories and Fiji Islands","expect":{"contains":["26054"],"notRefusal":true}},{"q":"add the surface area of Tanzania to the surface area of Madagascar","expect":{"contains":["1470790"],"notRefusal":true}},{"q":"the surface area of Madagascar plus the surface area of Uzbekistan makes what","expect":{"contains":["1034441"],"notRefusal":true}},{"q":"add the surface area of North Korea to the surface area of Gibraltar","expect":{"contains":["120544"],"notRefusal":true}},{"q":"what is the sum of the surface area of Nepal and Russia","expect":{"contains":["17222581"],"notRefusal":true}},{"q":"what is the sum of the surface area of Kazakhstan and Thailand","expect":{"contains":["3238015"],"notRefusal":true}},{"q":"the surface area of Somalia plus the surface area of Malawi makes what","expect":{"contains":["756141"],"notRefusal":true}},{"q":"add the surface area of Djibouti to the surface area of Estonia","expect":{"contains":["68427"],"notRefusal":true}},{"q":"what is the sum of the surface area of Gabon and Iraq","expect":{"contains":["705985"],"notRefusal":true}},{"q":"what is the sum of the surface area of Turkmenistan and Tokelau","expect":{"contains":["488112"],"notRefusal":true}},{"q":"what is the sum of the surface area of French Guiana and Hungary","expect":{"contains":["183030"],"notRefusal":true}},{"q":"what is the sum of the surface area of Malawi and Maldives","expect":{"contains":["118782"],"notRefusal":true}},{"q":"the surface area of New Caledonia plus the surface area of Netherlands Antilles makes what","expect":{"contains":["19375"],"notRefusal":true}},{"q":"add the surface area of Tokelau to the surface area of Zambia","expect":{"contains":["752630"],"notRefusal":true}},{"q":"what is the sum of the surface area of Holy See (Vatican City State) and Djibouti","expect":{"contains":["23200.4"],"notRefusal":true}},{"q":"what is the sum of the surface area of Canada and Tanzania","expect":{"contains":["10854359"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
