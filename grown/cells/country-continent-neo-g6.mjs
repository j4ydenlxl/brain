// country-continent-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"country-continent-neo-g6","class":"country-continent","generation":6,"lane":"neo","grownFrom":["name the continent of Qatar","which continent is East Timor in","name the continent of Libya","name the continent of Indonesia","on what continent is Netherlands","name the continent of Zimbabwe","name the continent of Cameroon","on what continent is Eritrea","name the continent of Angola","which continent is Yemen in","which continent is Mozambique in","on what continent is Somalia","name the continent of Myanmar","on what continent is Netherlands Antilles","which continent is Senegal in","name the continent of Costa Rica","which continent is Brunei in","on what continent is Slovakia","which continent is Tanzania in","name the continent of Lebanon"],"version":1});

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
{"id":"n-6a654bad","guard":[["has","continent"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Qatar":"Qatar is in Asia.","which continent is East Timor in":"East Timor is in Asia.","name the continent of Libya":"Libya is in Africa.","name the continent of Indonesia":"Indonesia is in Asia.","on what continent is Netherlands":"Netherlands is in Europe.","name the continent of Zimbabwe":"Zimbabwe is in Africa.","name the continent of Cameroon":"Cameroon is in Africa.","on what continent is Eritrea":"Eritrea is in Africa.","name the continent of Angola":"Angola is in Africa.","which continent is Yemen in":"Yemen is in Asia.","which continent is Mozambique in":"Mozambique is in Africa.","on what continent is Somalia":"Somalia is in Africa.","name the continent of Myanmar":"Myanmar is in Asia.","on what continent is Netherlands Antilles":"Netherlands Antilles is in North America.","which continent is Senegal in":"Senegal is in Africa.","name the continent of Costa Rica":"Costa Rica is in North America.","which continent is Brunei in":"Brunei is in Asia.","on what continent is Slovakia":"Slovakia is in Europe.","which continent is Tanzania in":"Tanzania is in Africa.","name the continent of Lebanon":"Lebanon is in Asia.","on what continent is Slovenia":"Slovenia is in Europe.","on what continent is Jordan":"Jordan is in Asia.","on what continent is Albania":"Albania is in Europe.","which continent is Czech Republic in":"Czech Republic is in Europe.","which continent is Heard Island and McDonald Islands in":"Heard Island and McDonald Islands is in Antarctica.","on what continent is Seychelles":"Seychelles is in Africa.","on what continent is Western Sahara":"Western Sahara is in Africa.","name the continent of Macao":"Macao is in Asia.","which continent is Palestine in":"Palestine is in Asia.","on what continent is Australia":"Australia is in Oceania.","name the continent of Wales":"Wales is in Europe.","name the continent of Tokelau":"Tokelau is in Oceania.","on what continent is Svalbard and Jan Mayen":"Svalbard and Jan Mayen is in Europe.","which continent is Liechtenstein in":"Liechtenstein is in Europe.","on what continent is Fiji Islands":"Fiji Islands is in Oceania.","which continent is Austria in":"Austria is in Europe.","on what continent is Hong Kong":"Hong Kong is in Asia.","on what continent is England":"England is in Europe.","on what continent is Bouvet Island":"Bouvet Island is in Antarctica.","which continent is North Macedonia in":"North Macedonia is in Europe.","which continent is Nigeria in":"Nigeria is in Africa.","name the continent of Benin":"Benin is in Africa.","which continent is Saudi Arabia in":"Saudi Arabia is in Asia.","name the continent of Mauritius":"Mauritius is in Africa.","on what continent is Kazakhstan":"Kazakhstan is in Asia.","name the continent of Bhutan":"Bhutan is in Asia.","name the continent of Latvia":"Latvia is in Europe.","on what continent is France":"France is in Europe.","which continent is North Korea in":"North Korea is in Asia.","which continent is Chad in":"Chad is in Africa.","on what continent is Holy See (Vatican City State)":"Holy See (Vatican City State) is in Europe.","which continent is Liberia in":"Liberia is in Africa.","which continent is Uruguay in":"Uruguay is in South America.","which continent is Falkland Islands in":"Falkland Islands is in South America.","which continent is Cuba in":"Cuba is in North America.","name the continent of Kuwait":"Kuwait is in Asia.","on what continent is Mauritania":"Mauritania is in Africa.","on what continent is Haiti":"Haiti is in North America.","which continent is Sweden in":"Sweden is in Europe.","which continent is Georgia in":"Georgia is in Asia.","name the continent of Solomon Islands":"Solomon Islands is in Oceania.","which continent is Serbia in":"Serbia is in Europe.","on what continent is Suriname":"Suriname is in South America.","on what continent is Afghanistan":"Afghanistan is in Asia.","name the continent of Syria":"Syria is in Asia.","which continent is Burundi in":"Burundi is in Africa.","name the continent of Sudan":"Sudan is in Africa.","name the continent of Montenegro":"Montenegro is in Europe.","which continent is Bolivia in":"Bolivia is in South America.","on what continent is Moldova":"Moldova is in Europe.","which continent is Bahrain in":"Bahrain is in Asia.","on what continent is Reunion":"Reunion is in Africa.","name the continent of Lithuania":"Lithuania is in Europe.","name the continent of Aruba":"Aruba is in North America.","name the continent of Northern Mariana Islands":"Northern Mariana Islands is in Oceania.","name the continent of Pitcairn":"Pitcairn is in Oceania.","on what continent is Turkey":"Turkey is in Asia.","which continent is Gabon in":"Gabon is in Africa.","name the continent of Northern Ireland":"Northern Ireland is in Europe.","on what continent is Cambodia":"Cambodia is in Asia.","name the continent of Germany":"Germany is in Europe.","on what continent is Grenada":"Grenada is in North America.","which continent is Kiribati in":"Kiribati is in Oceania.","on what continent is Botswana":"Botswana is in Africa.","on what continent is The Democratic Republic of Congo":"The Democratic Republic of Congo is in Africa.","name the continent of Guinea-Bissau":"Guinea-Bissau is in Africa.","which continent is San Marino in":"San Marino is in Europe.","which continent is Maldives in":"Maldives is in Asia.","on what continent is New Caledonia":"New Caledonia is in Oceania.","which continent is Panama in":"Panama is in North America.","on what continent is Montserrat":"Montserrat is in North America.","name the continent of Paraguay":"Paraguay is in South America.","name the continent of Samoa":"Samoa is in Oceania.","which continent is Norway in":"Norway is in Europe.","name the continent of Niue":"Niue is in Oceania.","name the continent of French Southern territories":"French Southern territories is in Antarctica.","on what continent is Italy":"Italy is in Europe.","name the continent of Monaco":"Monaco is in Europe.","which continent is Micronesia, Federated States of in":"Micronesia, Federated States of is in Oceania.","which continent is United States in":"United States is in North America."}}},
{"id":"n-a12b72f3","guard":[["has","continent"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Qatar":"Qatar is in Asia.","which continent is East Timor in":"East Timor is in Asia.","name the continent of Libya":"Libya is in Africa.","name the continent of Indonesia":"Indonesia is in Asia.","on what continent is Netherlands":"Netherlands is in Europe.","name the continent of Zimbabwe":"Zimbabwe is in Africa.","name the continent of Cameroon":"Cameroon is in Africa.","on what continent is Eritrea":"Eritrea is in Africa.","name the continent of Angola":"Angola is in Africa.","which continent is Yemen in":"Yemen is in Asia.","which continent is Mozambique in":"Mozambique is in Africa.","on what continent is Somalia":"Somalia is in Africa.","name the continent of Myanmar":"Myanmar is in Asia.","on what continent is Netherlands Antilles":"Netherlands Antilles is in North America.","which continent is Senegal in":"Senegal is in Africa.","name the continent of Costa Rica":"Costa Rica is in North America.","which continent is Brunei in":"Brunei is in Asia.","on what continent is Slovakia":"Slovakia is in Europe.","which continent is Tanzania in":"Tanzania is in Africa.","name the continent of Lebanon":"Lebanon is in Asia.","on what continent is Slovenia":"Slovenia is in Europe.","on what continent is Jordan":"Jordan is in Asia.","on what continent is Albania":"Albania is in Europe.","which continent is Czech Republic in":"Czech Republic is in Europe.","which continent is Heard Island and McDonald Islands in":"Heard Island and McDonald Islands is in Antarctica.","on what continent is Seychelles":"Seychelles is in Africa.","on what continent is Western Sahara":"Western Sahara is in Africa.","name the continent of Macao":"Macao is in Asia.","which continent is Palestine in":"Palestine is in Asia.","on what continent is Australia":"Australia is in Oceania.","name the continent of Wales":"Wales is in Europe.","name the continent of Tokelau":"Tokelau is in Oceania.","on what continent is Svalbard and Jan Mayen":"Svalbard and Jan Mayen is in Europe.","which continent is Liechtenstein in":"Liechtenstein is in Europe.","on what continent is Fiji Islands":"Fiji Islands is in Oceania.","which continent is Austria in":"Austria is in Europe.","on what continent is Hong Kong":"Hong Kong is in Asia.","on what continent is England":"England is in Europe.","on what continent is Bouvet Island":"Bouvet Island is in Antarctica.","which continent is North Macedonia in":"North Macedonia is in Europe.","which continent is Nigeria in":"Nigeria is in Africa.","name the continent of Benin":"Benin is in Africa.","which continent is Saudi Arabia in":"Saudi Arabia is in Asia.","name the continent of Mauritius":"Mauritius is in Africa.","on what continent is Kazakhstan":"Kazakhstan is in Asia.","name the continent of Bhutan":"Bhutan is in Asia.","name the continent of Latvia":"Latvia is in Europe.","on what continent is France":"France is in Europe.","which continent is North Korea in":"North Korea is in Asia.","which continent is Chad in":"Chad is in Africa.","on what continent is Holy See (Vatican City State)":"Holy See (Vatican City State) is in Europe.","which continent is Liberia in":"Liberia is in Africa.","which continent is Uruguay in":"Uruguay is in South America.","which continent is Falkland Islands in":"Falkland Islands is in South America.","which continent is Cuba in":"Cuba is in North America.","name the continent of Kuwait":"Kuwait is in Asia.","on what continent is Mauritania":"Mauritania is in Africa.","on what continent is Haiti":"Haiti is in North America.","which continent is Sweden in":"Sweden is in Europe.","which continent is Georgia in":"Georgia is in Asia.","name the continent of Solomon Islands":"Solomon Islands is in Oceania.","which continent is Serbia in":"Serbia is in Europe.","on what continent is Suriname":"Suriname is in South America.","on what continent is Afghanistan":"Afghanistan is in Asia.","name the continent of Syria":"Syria is in Asia.","which continent is Burundi in":"Burundi is in Africa.","name the continent of Sudan":"Sudan is in Africa.","name the continent of Montenegro":"Montenegro is in Europe.","which continent is Bolivia in":"Bolivia is in South America.","on what continent is Moldova":"Moldova is in Europe.","which continent is Bahrain in":"Bahrain is in Asia.","on what continent is Reunion":"Reunion is in Africa.","name the continent of Lithuania":"Lithuania is in Europe.","name the continent of Aruba":"Aruba is in North America.","name the continent of Northern Mariana Islands":"Northern Mariana Islands is in Oceania.","name the continent of Pitcairn":"Pitcairn is in Oceania.","on what continent is Turkey":"Turkey is in Asia.","which continent is Gabon in":"Gabon is in Africa.","name the continent of Northern Ireland":"Northern Ireland is in Europe.","on what continent is Cambodia":"Cambodia is in Asia.","name the continent of Germany":"Germany is in Europe.","on what continent is Grenada":"Grenada is in North America.","which continent is Kiribati in":"Kiribati is in Oceania.","on what continent is Botswana":"Botswana is in Africa.","on what continent is The Democratic Republic of Congo":"The Democratic Republic of Congo is in Africa.","name the continent of Guinea-Bissau":"Guinea-Bissau is in Africa.","which continent is San Marino in":"San Marino is in Europe.","which continent is Maldives in":"Maldives is in Asia.","on what continent is New Caledonia":"New Caledonia is in Oceania.","which continent is Panama in":"Panama is in North America.","on what continent is Montserrat":"Montserrat is in North America.","name the continent of Paraguay":"Paraguay is in South America.","name the continent of Samoa":"Samoa is in Oceania.","which continent is Norway in":"Norway is in Europe.","name the continent of Niue":"Niue is in Oceania.","name the continent of French Southern territories":"French Southern territories is in Antarctica.","on what continent is Italy":"Italy is in Europe.","name the continent of Monaco":"Monaco is in Europe.","which continent is Micronesia, Federated States of in":"Micronesia, Federated States of is in Oceania.","which continent is United States in":"United States is in North America."}}},
{"id":"n-4503a935","guard":[["has","continent"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"continent"}]]],"mem":{"table":{"of Qatar":"Qatar is in Asia.","is East Timor in":"East Timor is in Asia.","of Libya":"Libya is in Africa.","of Indonesia":"Indonesia is in Asia.","is Netherlands":"Netherlands is in Europe.","of Zimbabwe":"Zimbabwe is in Africa.","of Cameroon":"Cameroon is in Africa.","is Eritrea":"Eritrea is in Africa.","of Angola":"Angola is in Africa.","is Yemen in":"Yemen is in Asia.","is Mozambique in":"Mozambique is in Africa.","is Somalia":"Somalia is in Africa.","of Myanmar":"Myanmar is in Asia.","is Netherlands Antilles":"Netherlands Antilles is in North America.","is Senegal in":"Senegal is in Africa.","of Costa Rica":"Costa Rica is in North America.","is Brunei in":"Brunei is in Asia.","is Slovakia":"Slovakia is in Europe.","is Tanzania in":"Tanzania is in Africa.","of Lebanon":"Lebanon is in Asia.","is Slovenia":"Slovenia is in Europe.","is Jordan":"Jordan is in Asia.","is Albania":"Albania is in Europe.","is Czech Republic in":"Czech Republic is in Europe.","is Heard Island and McDonald Islands in":"Heard Island and McDonald Islands is in Antarctica.","is Seychelles":"Seychelles is in Africa.","is Western Sahara":"Western Sahara is in Africa.","of Macao":"Macao is in Asia.","is Palestine in":"Palestine is in Asia.","is Australia":"Australia is in Oceania.","of Wales":"Wales is in Europe.","of Tokelau":"Tokelau is in Oceania.","is Svalbard and Jan Mayen":"Svalbard and Jan Mayen is in Europe.","is Liechtenstein in":"Liechtenstein is in Europe.","is Fiji Islands":"Fiji Islands is in Oceania.","is Austria in":"Austria is in Europe.","is Hong Kong":"Hong Kong is in Asia.","is England":"England is in Europe.","is Bouvet Island":"Bouvet Island is in Antarctica.","is North Macedonia in":"North Macedonia is in Europe.","is Nigeria in":"Nigeria is in Africa.","of Benin":"Benin is in Africa.","is Saudi Arabia in":"Saudi Arabia is in Asia.","of Mauritius":"Mauritius is in Africa.","is Kazakhstan":"Kazakhstan is in Asia.","of Bhutan":"Bhutan is in Asia.","of Latvia":"Latvia is in Europe.","is France":"France is in Europe.","is North Korea in":"North Korea is in Asia.","is Chad in":"Chad is in Africa.","is Holy See (Vatican City State)":"Holy See (Vatican City State) is in Europe.","is Liberia in":"Liberia is in Africa.","is Uruguay in":"Uruguay is in South America.","is Falkland Islands in":"Falkland Islands is in South America.","is Cuba in":"Cuba is in North America.","of Kuwait":"Kuwait is in Asia.","is Mauritania":"Mauritania is in Africa.","is Haiti":"Haiti is in North America.","is Sweden in":"Sweden is in Europe.","is Georgia in":"Georgia is in Asia.","of Solomon Islands":"Solomon Islands is in Oceania.","is Serbia in":"Serbia is in Europe.","is Suriname":"Suriname is in South America.","is Afghanistan":"Afghanistan is in Asia.","of Syria":"Syria is in Asia.","is Burundi in":"Burundi is in Africa.","of Sudan":"Sudan is in Africa.","of Montenegro":"Montenegro is in Europe.","is Bolivia in":"Bolivia is in South America.","is Moldova":"Moldova is in Europe.","is Bahrain in":"Bahrain is in Asia.","is Reunion":"Reunion is in Africa.","of Lithuania":"Lithuania is in Europe.","of Aruba":"Aruba is in North America.","of Northern Mariana Islands":"Northern Mariana Islands is in Oceania.","of Pitcairn":"Pitcairn is in Oceania.","is Turkey":"Turkey is in Asia.","is Gabon in":"Gabon is in Africa.","of Northern Ireland":"Northern Ireland is in Europe.","is Cambodia":"Cambodia is in Asia.","of Germany":"Germany is in Europe.","is Grenada":"Grenada is in North America.","is Kiribati in":"Kiribati is in Oceania.","is Botswana":"Botswana is in Africa.","is The Democratic Republic of Congo":"The Democratic Republic of Congo is in Africa.","of Guinea-Bissau":"Guinea-Bissau is in Africa.","is San Marino in":"San Marino is in Europe.","is Maldives in":"Maldives is in Asia.","is New Caledonia":"New Caledonia is in Oceania.","is Panama in":"Panama is in North America.","is Montserrat":"Montserrat is in North America.","of Paraguay":"Paraguay is in South America.","of Samoa":"Samoa is in Oceania.","is Norway in":"Norway is in Europe.","of Niue":"Niue is in Oceania.","of French Southern territories":"French Southern territories is in Antarctica.","is Italy":"Italy is in Europe.","of Monaco":"Monaco is in Europe.","is Micronesia, Federated States of in":"Micronesia, Federated States of is in Oceania.","is United States in":"United States is in North America."}}},
{"id":"n-27f22159","guard":[["has","continent"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"East Timor in":"East Timor is in Asia.","Netherlands":"Netherlands is in Europe.","Eritrea":"Eritrea is in Africa.","Yemen in":"Yemen is in Asia.","Mozambique in":"Mozambique is in Africa.","Somalia":"Somalia is in Africa.","Netherlands Antilles":"Netherlands Antilles is in North America.","Senegal in":"Senegal is in Africa.","Brunei in":"Brunei is in Asia.","Slovakia":"Slovakia is in Europe.","Tanzania in":"Tanzania is in Africa.","Slovenia":"Slovenia is in Europe.","Jordan":"Jordan is in Asia.","Albania":"Albania is in Europe.","Czech Republic in":"Czech Republic is in Europe.","Heard Island and McDonald Islands in":"Heard Island and McDonald Islands is in Antarctica.","Seychelles":"Seychelles is in Africa.","Western Sahara":"Western Sahara is in Africa.","Palestine in":"Palestine is in Asia.","Australia":"Australia is in Oceania.","Svalbard and Jan Mayen":"Svalbard and Jan Mayen is in Europe.","Liechtenstein in":"Liechtenstein is in Europe.","Fiji Islands":"Fiji Islands is in Oceania.","Austria in":"Austria is in Europe.","Hong Kong":"Hong Kong is in Asia.","England":"England is in Europe.","Bouvet Island":"Bouvet Island is in Antarctica.","North Macedonia in":"North Macedonia is in Europe.","Nigeria in":"Nigeria is in Africa.","Saudi Arabia in":"Saudi Arabia is in Asia.","Kazakhstan":"Kazakhstan is in Asia.","France":"France is in Europe.","North Korea in":"North Korea is in Asia.","Chad in":"Chad is in Africa.","Holy See (Vatican City State)":"Holy See (Vatican City State) is in Europe.","Liberia in":"Liberia is in Africa.","Uruguay in":"Uruguay is in South America.","Falkland Islands in":"Falkland Islands is in South America.","Cuba in":"Cuba is in North America.","Mauritania":"Mauritania is in Africa.","Haiti":"Haiti is in North America.","Sweden in":"Sweden is in Europe.","Georgia in":"Georgia is in Asia.","Serbia in":"Serbia is in Europe.","Suriname":"Suriname is in South America.","Afghanistan":"Afghanistan is in Asia.","Burundi in":"Burundi is in Africa.","Bolivia in":"Bolivia is in South America.","Moldova":"Moldova is in Europe.","Bahrain in":"Bahrain is in Asia.","Reunion":"Reunion is in Africa.","Turkey":"Turkey is in Asia.","Gabon in":"Gabon is in Africa.","Cambodia":"Cambodia is in Asia.","Grenada":"Grenada is in North America.","Kiribati in":"Kiribati is in Oceania.","Botswana":"Botswana is in Africa.","The Democratic Republic of Congo":"The Democratic Republic of Congo is in Africa.","San Marino in":"San Marino is in Europe.","Maldives in":"Maldives is in Asia.","New Caledonia":"New Caledonia is in Oceania.","Panama in":"Panama is in North America.","Montserrat":"Montserrat is in North America.","Norway in":"Norway is in Europe.","Italy":"Italy is in Europe.","Micronesia, Federated States of in":"Micronesia, Federated States of is in Oceania.","United States in":"United States is in North America."}}},
{"id":"n-9da687d8","guard":[["has","continent"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"in"}]]],"mem":{"table":{"which continent is East Timor":"East Timor is in Asia.","which continent is Yemen":"Yemen is in Asia.","which continent is Mozambique":"Mozambique is in Africa.","which continent is Senegal":"Senegal is in Africa.","which continent is Brunei":"Brunei is in Asia.","which continent is Tanzania":"Tanzania is in Africa.","which continent is Czech Republic":"Czech Republic is in Europe.","which continent is Heard Island and McDonald Islands":"Heard Island and McDonald Islands is in Antarctica.","which continent is Palestine":"Palestine is in Asia.","which continent is Liechtenstein":"Liechtenstein is in Europe.","which continent is Austria":"Austria is in Europe.","which continent is North Macedonia":"North Macedonia is in Europe.","which continent is Nigeria":"Nigeria is in Africa.","which continent is Saudi Arabia":"Saudi Arabia is in Asia.","which continent is North Korea":"North Korea is in Asia.","which continent is Chad":"Chad is in Africa.","which continent is Liberia":"Liberia is in Africa.","which continent is Uruguay":"Uruguay is in South America.","which continent is Falkland Islands":"Falkland Islands is in South America.","which continent is Cuba":"Cuba is in North America.","which continent is Sweden":"Sweden is in Europe.","which continent is Georgia":"Georgia is in Asia.","which continent is Serbia":"Serbia is in Europe.","which continent is Burundi":"Burundi is in Africa.","which continent is Bolivia":"Bolivia is in South America.","which continent is Bahrain":"Bahrain is in Asia.","which continent is Gabon":"Gabon is in Africa.","which continent is Kiribati":"Kiribati is in Oceania.","which continent is San Marino":"San Marino is in Europe.","which continent is Maldives":"Maldives is in Asia.","which continent is Panama":"Panama is in North America.","which continent is Norway":"Norway is in Europe.","which continent is Micronesia, Federated States of":"Micronesia, Federated States of is in Oceania.","which continent is United States":"United States is in North America."}}},
{"id":"n-ce67f557","guard":[["has","continent"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"on"}]]],"mem":{"table":{"what continent is Netherlands":"Netherlands is in Europe.","what continent is Eritrea":"Eritrea is in Africa.","what continent is Somalia":"Somalia is in Africa.","what continent is Netherlands Antilles":"Netherlands Antilles is in North America.","what continent is Slovakia":"Slovakia is in Europe.","what continent is Slovenia":"Slovenia is in Europe.","what continent is Jordan":"Jordan is in Asia.","what continent is Albania":"Albania is in Europe.","what continent is Seychelles":"Seychelles is in Africa.","what continent is Western Sahara":"Western Sahara is in Africa.","what continent is Australia":"Australia is in Oceania.","what continent is Svalbard and Jan Mayen":"Svalbard and Jan Mayen is in Europe.","what continent is Fiji Islands":"Fiji Islands is in Oceania.","what continent is Hong Kong":"Hong Kong is in Asia.","what continent is England":"England is in Europe.","what continent is Bouvet Island":"Bouvet Island is in Antarctica.","what continent is Kazakhstan":"Kazakhstan is in Asia.","what continent is France":"France is in Europe.","what continent is Holy See (Vatican City State)":"Holy See (Vatican City State) is in Europe.","what continent is Mauritania":"Mauritania is in Africa.","what continent is Haiti":"Haiti is in North America.","what continent is Suriname":"Suriname is in South America.","what continent is Afghanistan":"Afghanistan is in Asia.","what continent is Moldova":"Moldova is in Europe.","what continent is Reunion":"Reunion is in Africa.","what continent is Turkey":"Turkey is in Asia.","what continent is Cambodia":"Cambodia is in Asia.","what continent is Grenada":"Grenada is in North America.","what continent is Botswana":"Botswana is in Africa.","what continent is The Democratic Republic of Congo":"The Democratic Republic of Congo is in Africa.","what continent is New Caledonia":"New Caledonia is in Oceania.","what continent is Montserrat":"Montserrat is in North America.","what continent is Italy":"Italy is in Europe."}}},
{"id":"n-dd908f3b","guard":[["hasAny",["albania","austria","city","czech","england","france","germany","ireland","italy","jan","latvia","liechtenstein","lithuania","macedonia","marino","moldova","monaco","montenegro","normalise","normalize","norway","serbia","simplify the text","slovakia","slovenia","sweden","wales"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Europe."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-1e95bb8c","guard":[["hasAny",["angola","benin","botswana","burundi","cameroon","chad","congo","eritrea","gabon","liberia","libya","mauritania","mauritius","mozambique","nigeria","normalise","normalize","reunion","sahara","senegal","seychelles","simplify the text","somalia","sudan","tanzania","zimbabwe"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Africa."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-ab0c9405","guard":[["hasAny",["afghanistan","arabia","bahrain","bhutan","brunei","cambodia","east","georgia","hong","indonesia","jordan","kazakhstan","korea","kuwait","lebanon","macao","maldives","myanmar","normalise","normalize","palestine","qatar","simplify the text","syria","turkey","yemen"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Asia."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-ad745ec2","guard":[["hasAny",["albania","austria","city","czech","delete","england","france","italy","jan","liechtenstein","macedonia","marino","moldova","norway","remove","serbia","slovakia","slovenia","strip out","sweden","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"europe"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-c3d57dde","guard":[["hasAny",["albania","austria","city","czech","delete","england","france","italy","jan","liechtenstein","macedonia","marino","moldova","norway","remove","serbia","slovakia","slovenia","strip out","sweden","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"Europe"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-f05ced9b","guard":[["hasAny",["albania","city","england","france","germany","ireland","italy","jan","latvia","lithuania","moldova","monaco","montenegro","slovakia","slovenia","wales"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Europe."]},["sense.lastWord"]],"mem":null},
{"id":"n-3188e8dc","guard":[["hasAny",["albania","city","england","france","germany","ireland","italy","jan","latvia","lithuania","lower case","lowercase","moldova","monaco","montenegro","slovakia","slovenia","small letters","wales"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Europe."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c2eb8b3a","guard":[["hasAny",["albania","all caps","capital letters","capitals","city","england","france","germany","ireland","italy","jan","latvia","lithuania","moldova","monaco","montenegro","slovakia","slovenia","upper case","uppercase","wales"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Europe."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-dd8091f1","guard":[["hasAny",["albania","city","england","france","germany","invert case","ireland","italy","jan","latvia","lithuania","moldova","monaco","montenegro","slovakia","slovenia","swap case","toggle case","wales"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Europe."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f8dad670","guard":[["hasAny",["albania","capitalise","capitalize","capitalize each word","city","england","france","germany","ireland","italy","jan","latvia","lithuania","moldova","monaco","montenegro","slovakia","slovenia","title case","wales"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Europe."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-16d0741c","guard":[["hasAny",["albania","czech","element","england","france","germany","italy","item number","latvia","lithuania","macedonia","marino","moldova","monaco","montenegro","nth","position","slovakia","slovenia","wales"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8b4fc20a","guard":[["hasAny",["botswana","burundi","chad","congo","delete","eritrea","gabon","liberia","mauritania","mozambique","nigeria","remove","reunion","sahara","senegal","seychelles","somalia","strip out","tanzania","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"africa"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-b29b8a5f","guard":[["hasAny",["albania","city","each word","england","france","germany","ireland","italy","jan","latvia","lithuania","moldova","monaco","montenegro","slovakia","slovenia","split into words","wales"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Europe."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b82e437a","guard":[["hasAny",["botswana","burundi","chad","congo","delete","eritrea","gabon","liberia","mauritania","mozambique","nigeria","remove","reunion","sahara","senegal","seychelles","somalia","strip out","tanzania","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"Africa"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-bbbd0566","guard":[["hasAny",["afghanistan","arabia","bhutan","cambodia","east","element","indonesia","item number","jordan","kazakhstan","korea","kuwait","lebanon","macao","myanmar","nth","position","qatar","syria","turkey"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d105896f","guard":[["hasAny",["albania","city","each word","england","france","germany","ireland","italy","jan","latvia","lithuania","moldova","monaco","montenegro","slovakia","slovenia","split into words","wales"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Europe."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d9aa175e","guard":[["hasAny",["angola","benin","botswana","cameroon","congo","eritrea","libya","mauritania","mauritius","reunion","sahara","seychelles","somalia","sudan","zimbabwe"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-2755a2fd","guard":[["hasAny",["angola","benin","botswana","cameroon","capitalise","capitalize","capitalize each word","congo","eritrea","libya","mauritania","mauritius","reunion","sahara","seychelles","somalia","sudan","title case","zimbabwe"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Africa."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5caea1b5","guard":[["hasAny",["all caps","angola","benin","botswana","cameroon","capital letters","capitals","congo","eritrea","libya","mauritania","mauritius","reunion","sahara","seychelles","somalia","sudan","upper case","uppercase","zimbabwe"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Africa."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f7ed37f5","guard":[["hasAny",["angola","benin","botswana","cameroon","congo","eritrea","invert case","libya","mauritania","mauritius","reunion","sahara","seychelles","somalia","sudan","swap case","toggle case","zimbabwe"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Africa."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-fe7ee40e","guard":[["hasAny",["angola","benin","botswana","cameroon","congo","eritrea","libya","lower case","lowercase","mauritania","mauritius","reunion","sahara","seychelles","small letters","somalia","sudan","zimbabwe"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Africa."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-42971b9c","guard":[["hasAny",["afghanistan","arabia","bahrain","brunei","cambodia","delete","east","georgia","hong","jordan","kazakhstan","korea","maldives","palestine","remove","strip out","turkey","without","yemen"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"Asia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-63ef899b","guard":[["hasAny",["angola","benin","botswana","cameroon","congo","each word","eritrea","libya","mauritania","mauritius","reunion","sahara","seychelles","somalia","split into words","sudan","zimbabwe"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Africa."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a7403062","guard":[["hasAny",["angola","benin","botswana","cameroon","congo","each word","eritrea","libya","mauritania","mauritius","reunion","sahara","seychelles","somalia","split into words","sudan","zimbabwe"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Africa."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e8cb3245","guard":[["hasAny",["afghanistan","arabia","bahrain","brunei","cambodia","delete","east","georgia","hong","jordan","kazakhstan","korea","maldives","palestine","remove","strip out","turkey","without","yemen"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"asia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-33841142","guard":[["hasAny",["afghanistan","bhutan","cambodia","hong","indonesia","jordan","kazakhstan","kuwait","lebanon","macao","myanmar","qatar","syria","turkey"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Asia."]},["sense.lastWord"]],"mem":null},
{"id":"n-64a9f75b","guard":[["hasAny",["afghanistan","bhutan","cambodia","capitalise","capitalize","capitalize each word","hong","indonesia","jordan","kazakhstan","kuwait","lebanon","macao","myanmar","qatar","syria","title case","turkey"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Asia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-78790730","guard":[["hasAny",["afghanistan","bhutan","cambodia","hong","indonesia","jordan","kazakhstan","kuwait","lebanon","lower case","lowercase","macao","myanmar","qatar","small letters","syria","turkey"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Asia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9cd1e70b","guard":[["hasAny",["afghanistan","all caps","bhutan","cambodia","capital letters","capitals","hong","indonesia","jordan","kazakhstan","kuwait","lebanon","macao","myanmar","qatar","syria","turkey","upper case","uppercase"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Asia."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f1632a8f","guard":[["hasAny",["afghanistan","bhutan","cambodia","hong","indonesia","invert case","jordan","kazakhstan","kuwait","lebanon","macao","myanmar","qatar","swap case","syria","toggle case","turkey"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Asia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3ee9a207","guard":[["hasAny",["botswana","burundi","chad","element","eritrea","gabon","item number","liberia","mauritania","mozambique","nigeria","nth","position","reunion","senegal","seychelles","somalia","tanzania"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Africa."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-573dd4af","guard":[["hasAny",["angola","benin","botswana","cameroon","element","eritrea","guineabissau","item number","libya","mauritania","mauritius","nth","position","reunion","seychelles","somalia","sudan","zimbabwe"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Africa."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6865002a","guard":[["hasAny",["afghanistan","bhutan","cambodia","each word","hong","indonesia","jordan","kazakhstan","kuwait","lebanon","macao","myanmar","qatar","split into words","syria","turkey"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Asia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e493c9e2","guard":[["hasAny",["afghanistan","bhutan","cambodia","each word","hong","indonesia","jordan","kazakhstan","kuwait","lebanon","macao","myanmar","qatar","split into words","syria","turkey"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Asia."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f3c3d38c","guard":[["hasAny",["botswana","burundi","chad","congo","eritrea","gabon","liberia","nigeria","reunion","sahara","senegal","shortest","shortest one","shortest word","somalia","tanzania"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Africa."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-31f6d8a1","guard":[["hasAny",["albania","austria","element","england","france","italy","item number","liechtenstein","moldova","norway","nth","position","serbia","slovakia","slovenia","sweden"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Europe."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cab7203a","guard":[["hasAny",["albania","austria","england","france","italy","moldova","norway","serbia","shortest","shortest one","shortest word","slovakia","slovenia","sweden"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Europe."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-924cccd7","guard":[["hasAny",["afghanistan","bahrain","brunei","cambodia","element","georgia","item number","jordan","kazakhstan","maldives","nth","palestine","position","turkey","yemen"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Asia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d563aeb4","guard":[["hasAny",["australia","caledonia","federated","fiji","kiribati","mariana","niue","normalise","normalize","pitcairn","samoa","simplify the text","solomon","tokelau"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oceania."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2dddcd98","guard":[["hasAny",["australia","caledonia","fiji","mariana","niue","pitcairn","samoa","solomon","tokelau"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oceania."]},["sense.lastWord"]],"mem":null},
{"id":"n-89cbcb45","guard":[["hasAny",["australia","caledonia","capitalise","capitalize","capitalize each word","fiji","mariana","niue","pitcairn","samoa","solomon","title case","tokelau"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oceania."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c789bebe","guard":[["hasAny",["australia","caledonia","fiji","invert case","mariana","niue","pitcairn","samoa","solomon","swap case","toggle case","tokelau"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oceania."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c9a7e84a","guard":[["hasAny",["australia","caledonia","fiji","lower case","lowercase","mariana","niue","pitcairn","samoa","small letters","solomon","tokelau"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oceania."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e0f4bd4c","guard":[["hasAny",["all caps","australia","caledonia","capital letters","capitals","fiji","mariana","niue","pitcairn","samoa","solomon","tokelau","upper case","uppercase"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oceania."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-2e429ca7","guard":[["hasAny",["arabia","bahrain","brunei","delete","east","georgia","korea","maldives","palestine","remove","strip out","without","yemen"]]],"pyramid":["render.str",["transform.remove",{"lit":"Asia"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-7ab67e7f","guard":[["hasAny",["albania","city","delete","england","france","italy","jan","moldova","remove","slovakia","slovenia","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Europe"},["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-858c01e6","guard":[["hasAny",["albania","city","delete","england","france","italy","jan","moldova","remove","slovakia","slovenia","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"europe"},["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-87b367fc","guard":[["hasAny",["australia","caledonia","each word","fiji","mariana","niue","pitcairn","samoa","solomon","split into words","tokelau"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oceania."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-af8760f2","guard":[["hasAny",["angola","benin","cameroon","congo","delete","guineabissau","libya","mauritius","remove","strip out","sudan","without","zimbabwe"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"africa"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-b2ef5d11","guard":[["hasAny",["angola","benin","cameroon","congo","delete","guineabissau","libya","mauritius","remove","strip out","sudan","without","zimbabwe"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"Africa"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-e33d66d1","guard":[["hasAny",["australia","caledonia","each word","fiji","mariana","niue","pitcairn","samoa","solomon","split into words","tokelau"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oceania."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f79ecbd0","guard":[["hasAny",["arabia","bahrain","brunei","delete","east","georgia","korea","maldives","palestine","remove","strip out","without","yemen"]]],"pyramid":["render.str",["transform.remove",{"lit":"asia"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-39320e89","guard":[["hasAny",["bahrain","brunei","cambodia","georgia","jordan","maldives","shortest","shortest one","shortest word","turkey","yemen"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Asia."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-12a7d4f8","guard":[["hasAny",["botswana","congo","delete","eritrea","mauritania","remove","reunion","sahara","seychelles","somalia","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Africa"},["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-16284e32","guard":[["hasAny",["austria","czech","delete","liechtenstein","macedonia","marino","norway","remove","serbia","strip out","sweden","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"europe"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-2315883e","guard":[["hasAny",["burundi","chad","element","gabon","item number","liberia","mozambique","nigeria","nth","position","senegal","tanzania"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Africa."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-35c380e8","guard":[["hasAny",["austria","czech","delete","liechtenstein","macedonia","marino","norway","remove","serbia","strip out","sweden","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Europe"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-4a84b9b3","guard":[["hasAny",["bhutan","delete","indonesia","kuwait","lebanon","macao","myanmar","qatar","remove","strip out","syria","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"asia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-55ee566f","guard":[["hasAny",["botswana","congo","delete","eritrea","mauritania","remove","reunion","sahara","seychelles","somalia","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"africa"},["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-78ebfbd9","guard":[["hasAny",["bhutan","delete","indonesia","kuwait","lebanon","macao","myanmar","qatar","remove","strip out","syria","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"Asia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-7c02d77a","guard":[["hasAny",["burundi","chad","delete","gabon","liberia","mozambique","nigeria","remove","senegal","strip out","tanzania","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Africa"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-848b698d","guard":[["hasAny",["burundi","chad","delete","gabon","liberia","mozambique","nigeria","remove","senegal","strip out","tanzania","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"africa"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-41cdba43","guard":[["hasAny",["delete","germany","ireland","latvia","lithuania","monaco","montenegro","remove","strip out","wales","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"Europe"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-63a50fb3","guard":[["hasAny",["antilles","cuba","delete","grenada","haiti","montserrat","panama","remove","strip out","united","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-93b404dd","guard":[["hasAny",["delete","federated","islands","niue","pitcairn","remove","samoa","strip out","tokelau","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"Oceania"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-c97e7969","guard":[["hasAny",["delete","germany","ireland","latvia","lithuania","monaco","montenegro","remove","strip out","wales","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"europe"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-dd6e448d","guard":[["hasAny",["delete","federated","islands","niue","pitcairn","remove","samoa","strip out","tokelau","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"oceania"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-59a96d19","guard":[["hasAny",["antilles","aruba","costa","grenada","haiti","montserrat"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["sense.lastWord"]],"mem":null},
{"id":"n-3974e408","guard":[["hasAny",["antilles","aruba","costa","grenada","haiti","invert case","montserrat","swap case","toggle case"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-76ad5cd1","guard":[["hasAny",["all caps","antilles","aruba","capital letters","capitals","costa","grenada","haiti","montserrat","upper case","uppercase"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-beeaeab6","guard":[["hasAny",["antilles","aruba","capitalise","capitalize","capitalize each word","costa","grenada","haiti","montserrat","title case"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c14ac494","guard":[["hasAny",["antilles","aruba","costa","grenada","haiti","lower case","lowercase","montserrat","small letters"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8b76b3dc","guard":[["hasAny",["afghanistan","cambodia","delete","hong","jordan","kazakhstan","remove","strip out","turkey","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Asia"},["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-a5796017","guard":[["hasAny",["antilles","aruba","costa","each word","grenada","haiti","montserrat","split into words"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b3c3644f","guard":[["hasAny",["bahrain","brunei","element","georgia","item number","maldives","nth","palestine","position","yemen"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-d720987e","guard":[["hasAny",["antilles","aruba","costa","each word","grenada","haiti","montserrat","split into words"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f9dc4a28","guard":[["hasAny",["afghanistan","cambodia","delete","hong","jordan","kazakhstan","remove","strip out","turkey","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"asia"},["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-fe150bc4","guard":[["hasAny",["antilles","cuba","grenada","haiti","panama","shortest","shortest one","shortest word"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-12dcefd5","guard":[["hasAny",["cuba","element","grenada","haiti","item number","montserrat","nth","panama","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2a01ef4a","guard":[["hasAny",["australia","caledonia","delete","federated","fiji","kiribati","remove","strip out","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"oceania"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-77c079ac","guard":[["hasAny",["austria","element","item number","liechtenstein","norway","nth","position","serbia","sweden"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-85738ab6","guard":[["hasAny",["australia","element","item number","niue","nth","pitcairn","position","samoa","tokelau"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9e900a17","guard":[["hasAny",["bolivia","falkland","normalise","normalize","paraguay","simplify the text","suriname","uruguay"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-ec35a04e","guard":[["hasAny",["australia","caledonia","delete","federated","fiji","kiribati","remove","strip out","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"Oceania"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-b9c4cd14","guard":[["hasAny",["bolivia","falkland","shortest","shortest one","shortest word","suriname","uruguay"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bdf9e459","guard":[["hasAny",["guineabissau","longest","longest one","longest word","mauritania","mozambique","seychelles"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Africa."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1a232f28","guard":[["hasAny",["antilles","delete","grenada","haiti","montserrat","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-f5284cc5","guard":[["hasAny",["bolivia","delete","falkland","remove","strip out","suriname","uruguay","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-81137433","guard":[["hasAny",["czech","element","ireland","item number","macedonia","marino","normalise","normalize","nth","position","simplify the text"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-8f3e36b8","guard":[["hasAny",["arabia","east","element","hong","item number","korea","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fb0b9641","guard":[["hasAny",["arabia","east","element","hong","item number","korea","normalise","normalize","nth","position","simplify the text"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-0297a5ab","guard":[["hasAny",["bolivia","element","item number","nth","position","suriname","uruguay"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-435a2bca","guard":[["hasAny",["bolivia","delete","falkland","remove","strip out","uruguay","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-a1f67f12","guard":[["hasAny",["element","falkland","item number","nth","paraguay","position","suriname"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-dac4510e","guard":[["hasAny",["australia","caledonia","delete","fiji","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Oceania"},["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-f0f620c1","guard":[["hasAny",["australia","caledonia","delete","fiji","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"oceania"},["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-f29c3f44","guard":[["hasAny",["cuba","delete","panama","remove","strip out","united","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-bab5acf4","guard":[["hasAny",["caledonia","element","fiji","item number","nth","position","solomon"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-10bc69c8","guard":[["hasAny",["czech","element","item number","macedonia","marino","nth","position","shortest","shortest one","shortest word"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Europe."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4237c3a2","guard":[["hasAny",["all caps","caledonia","capital letters","capitals","element","fiji","item number","nth","position","solomon","upper case","uppercase"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-47a46244","guard":[["hasAny",["caledonia","capitalise","capitalize","capitalize each word","element","fiji","item number","nth","position","solomon","title case"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-79007fc1","guard":[["hasAny",["caledonia","element","fiji","item number","lower case","lowercase","nth","position","small letters","solomon"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-95a6b53a","guard":[["hasAny",["arabia","east","element","item number","korea","nth","position","shortest","shortest one","shortest word"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9632507e","guard":[["hasAny",["caledonia","element","fiji","invert case","item number","nth","position","solomon","swap case","toggle case"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-317ae626","guard":[["hasAny",["arabia","east","element","item number","korea","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-59c1ba4d","guard":[["hasAny",["caledonia","element","fiji","item number","normalise","normalize","nth","position","simplify the text","solomon"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-6eb855cd","guard":[["hasAny",["arabia","east","element","item number","korea","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b1d5ac3b","guard":[["hasAny",["czech","element","item number","macedonia","marino","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Europe."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b79bd24f","guard":[["hasAny",["czech","element","item number","macedonia","marino","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c960de64","guard":[["hasAny",["czech","element","item number","macedonia","marino","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Europe."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d9efee1a","guard":[["hasAny",["caledonia","each word","element","fiji","item number","nth","position","solomon","split into words"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e6acb9db","guard":[["hasAny",["caledonia","element","fiji","item number","nth","position","solomon"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-ef80b8bd","guard":[["hasAny",["caledonia","each word","element","fiji","item number","nth","position","solomon","split into words"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-df23e33e","guard":[["hasAny",["paraguay","suriname"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["sense.lastWord"]],"mem":null},
{"id":"n-1ac9dc4c","guard":[["hasAny",["invert case","paraguay","suriname","swap case","toggle case"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1bf4ce47","guard":[["hasAny",["liechtenstein","longest","longest one","longest word","montenegro"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Europe."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-501cd93d","guard":[["hasAny",["all caps","capital letters","capitals","paraguay","suriname","upper case","uppercase"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-76b509b9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","paraguay","suriname","title case"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d7e53167","guard":[["hasAny",["lower case","lowercase","paraguay","small letters","suriname"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-12e0bc2c","guard":[["hasAny",["delete","federated","kiribati","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Oceania"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-1d7bce2e","guard":[["hasAny",["delete","federated","kiribati","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"oceania"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-35847837","guard":[["hasAny",["bolivia","element","item number","nth","position","uruguay"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-38d9474a","guard":[["hasAny",["element","fiji","item number","nth","position","solomon"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-545822f7","guard":[["hasAny",["australia","element","item number","kiribati","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oceania."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6158dec8","guard":[["hasAny",["caledonia","fiji","shortest","shortest one","shortest word"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oceania."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-701788f5","guard":[["hasAny",["delete","island","remove","strip out","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"Antarctica"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-950e47e7","guard":[["hasAny",["each word","paraguay","split into words","suriname"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a5e38822","guard":[["hasAny",["each word","paraguay","split into words","suriname"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d0ae37dc","guard":[["hasAny",["aruba","costa","delete","remove","strip out","without"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-e944f219","guard":[["hasAny",["cuba","element","item number","nth","panama","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-4c36ca5c","guard":[["hasAny",["antilles","costa","element","item number","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-6f00823b","guard":[["hasAny",["element","ireland","item number","jan","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-afb63e26","guard":[["hasAny",["caledonia","element","fiji","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oceania."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.lastWord"]],"mem":null},
{"id":"n-0f26b077","guard":[["hasAny",["antilles","costa","element","item number","lower case","lowercase","nth","position","small letters"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-63034bcf","guard":[["hasAny",["all caps","antilles","capital letters","capitals","costa","element","item number","nth","position","upper case","uppercase"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-7f87a0f2","guard":[["hasAny",["antilles","costa","element","invert case","item number","nth","position","swap case","toggle case"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b3696dbb","guard":[["hasAny",["antilles","capitalise","capitalize","capitalize each word","costa","element","item number","nth","position","title case"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-09e6837a","guard":[["hasAny",["antilles","costa","each word","element","item number","nth","position","split into words"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4cdb1d66","guard":[["hasAny",["antilles","costa","element","item number","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-ed17e118","guard":[["hasAny",["antilles","costa","each word","element","item number","nth","position","split into words"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-002f8446","guard":[["hasAny",["continent","uruguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Uruguay in":"Uruguay is in South America."}}},
{"id":"n-0121175b","guard":[["has","sudan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Sudan":"Sudan is in Africa."}}},
{"id":"n-0154d4c4","guard":[["hasAny",["bolivia","continent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Bolivia in":"Bolivia is in South America."}}},
{"id":"n-01da44ee","guard":[["hasAny",["continent","gabon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Gabon in":"Gabon is in Africa."}}},
{"id":"n-0268c125","guard":[["hasAny",["continent","moldova"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Moldova":"Moldova is in Europe."}}},
{"id":"n-027e3e6b","guard":[["hasAny",["continent","east","timor"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is East Timor in":"East Timor is in Asia."}}},
{"id":"n-055740e4","guard":[["hasAny",["continent","georgia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Georgia in":"Georgia is in Asia."}}},
{"id":"n-0594fad0","guard":[["hasAny",["continent","maldives"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Maldives in":"Maldives is in Asia."}}},
{"id":"n-05aa64dd","guard":[["hasAny",["bahrain","continent"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Bahrain in":"Bahrain is in Asia."}}},
{"id":"n-0675e0e6","guard":[["hasAny",["continent","czech","republic"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Czech Republic in":"Czech Republic is in Europe."}}},
{"id":"n-084644e0","guard":[["hasAny",["australia","continent"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Australia":"Australia is in Oceania."}}},
{"id":"n-09fbd364","guard":[["hasAny",["continent","palestine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Palestine in":"Palestine is in Asia."}}},
{"id":"n-0b77fd75","guard":[["hasAny",["continent","states","united"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is United States in":"United States is in North America."}}},
{"id":"n-0c258936","guard":[["hasAny",["continent","sahara","western"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Western Sahara":"Western Sahara is in Africa."}}},
{"id":"n-0c45b411","guard":[["hasAny",["continent","name","syria"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Syria":"Syria is in Asia."}}},
{"id":"n-0e26c13c","guard":[["hasAny",["continent","jan","mayen","svalbard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Svalbard and Jan Mayen":"Svalbard and Jan Mayen is in Europe."}}},
{"id":"n-0ec07ef8","guard":[["hasAny",["continent","myanmar","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Myanmar":"Myanmar is in Asia."}}},
{"id":"n-0f701a97","guard":[["hasAny",["continent","gabon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Gabon in":"Gabon is in Africa."}}},
{"id":"n-12587959","guard":[["hasAny",["continent","macedonia","north"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is North Macedonia in":"North Macedonia is in Europe."}}},
{"id":"n-12749e79","guard":[["has","kuwait"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Kuwait":"Kuwait is in Asia."}}},
{"id":"n-144d79ff","guard":[["hasAny",["continent","turkey"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Turkey":"Turkey is in Asia."}}},
{"id":"n-1555ad48","guard":[["hasAny",["continent","ireland","name","northern"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Northern Ireland":"Northern Ireland is in Europe."}}},
{"id":"n-15b461ab","guard":[["hasAny",["continent","kiribati"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Kiribati in":"Kiribati is in Oceania."}}},
{"id":"n-17bd619a","guard":[["has","mariana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Northern Mariana Islands":"Northern Mariana Islands is in Oceania."}}},
{"id":"n-1839619e","guard":[["hasAny",["continent","jordan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Jordan":"Jordan is in Asia."}}},
{"id":"n-1ac463af","guard":[["hasAny",["continent","name","tokelau"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Tokelau":"Tokelau is in Oceania."}}},
{"id":"n-1e56daec","guard":[["hasAny",["continent","nigeria"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Nigeria in":"Nigeria is in Africa."}}},
{"id":"n-2074422f","guard":[["hasAny",["continent","name","qatar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Qatar":"Qatar is in Asia."}}},
{"id":"n-2189e121","guard":[["hasAny",["continent","mauritius","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Mauritius":"Mauritius is in Africa."}}},
{"id":"n-2190c4e9","guard":[["hasAny",["continent","slovakia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Slovakia":"Slovakia is in Europe."}}},
{"id":"n-226e3727","guard":[["hasAny",["continent","norway"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Norway in":"Norway is in Europe."}}},
{"id":"n-228778bb","guard":[["hasAny",["continent","france"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is France":"France is in Europe."}}},
{"id":"n-24149741","guard":[["hasAny",["benin","continent","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Benin":"Benin is in Africa."}}},
{"id":"n-249c0ba1","guard":[["hasAny",["chad","continent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Chad in":"Chad is in Africa."}}},
{"id":"n-25fbbebc","guard":[["hasAny",["continent","kiribati"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Kiribati in":"Kiribati is in Oceania."}}},
{"id":"n-26c1f4c7","guard":[["hasAny",["continent","federated","micronesia","states"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Micronesia, Federated States of in":"Micronesia, Federated States of is in Oceania."}}},
{"id":"n-28494e74","guard":[["hasAny",["continent","costa","name","rica"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Costa Rica":"Costa Rica is in North America."}}},
{"id":"n-29d5fee8","guard":[["hasAny",["brunei","continent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Brunei in":"Brunei is in Asia."}}},
{"id":"n-2ae17029","guard":[["has","fiji"],["has","on"]],"pyramid":["render.template",{"lit":["Fiji ",{"slot":0}," is in Oceania."]},["sense.lastWord"]],"mem":null},
{"id":"n-2b9c9487","guard":[["has","antilles"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Netherlands Antilles":"Netherlands Antilles is in North America."}}},
{"id":"n-2bec36d6","guard":[["hasAny",["arabia","continent","saudi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Saudi Arabia in":"Saudi Arabia is in Asia."}}},
{"id":"n-2e446021","guard":[["hasAny",["cameroon","continent","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Cameroon":"Cameroon is in Africa."}}},
{"id":"n-2f171687","guard":[["has","syria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Syria":"Syria is in Asia."}}},
{"id":"n-2f249e2a","guard":[["hasAny",["continent","federated","micronesia","states"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Micronesia, Federated States of in":"Micronesia, Federated States of is in Oceania."}}},
{"id":"n-2f90109d","guard":[["hasAny",["continent","italy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Italy":"Italy is in Europe."}}},
{"id":"n-2fa57d4e","guard":[["has","benin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Benin":"Benin is in Africa."}}},
{"id":"n-300e576c","guard":[["hasAny",["continent","senegal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Senegal in":"Senegal is in Africa."}}},
{"id":"n-3041bd7d","guard":[["hasAny",["continent","mauritania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Mauritania":"Mauritania is in Africa."}}},
{"id":"n-31345981","guard":[["hasAny",["continent","name","pitcairn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Pitcairn":"Pitcairn is in Oceania."}}},
{"id":"n-33127eec","guard":[["hasAny",["continent","montserrat"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Montserrat":"Montserrat is in North America."}}},
{"id":"n-33245ca3","guard":[["has","paraguay"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Paraguay":"Paraguay is in South America."}}},
{"id":"n-33a49c3d","guard":[["hasAny",["continent","name","zimbabwe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Zimbabwe":"Zimbabwe is in Africa."}}},
{"id":"n-3623781d","guard":[["has","ireland"],["has","name"]],"pyramid":["render.template",{"lit":["Northern ",{"slot":0}," is in Europe."]},["sense.lastWord"]],"mem":null},
{"id":"n-3724e1b7","guard":[["has","myanmar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Myanmar":"Myanmar is in Asia."}}},
{"id":"n-3ad58aa7","guard":[["has","wales"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Wales":"Wales is in Europe."}}},
{"id":"n-3b5c860e","guard":[["hasAny",["continent","sweden"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Sweden in":"Sweden is in Europe."}}},
{"id":"n-3c6a2c30","guard":[["hasAny",["continent","hong","kong"]],["has","on"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Hong Kong":"Hong Kong is in Asia."}}},
{"id":"n-3d34a312","guard":[["has","macedonia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is North Macedonia in":"North Macedonia is in Europe."}}},
{"id":"n-3d4b051b","guard":[["hasAny",["continent","east","timor"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is East Timor in":"East Timor is in Asia."}}},
{"id":"n-3dd263dd","guard":[["hasAny",["congo","continent","democratic","republic"]],["has","on"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is The Democratic Republic of Congo":"The Democratic Republic of Congo is in Africa."}}},
{"id":"n-3dd987d8","guard":[["hasAny",["bouvet","continent","island"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Bouvet Island":"Bouvet Island is in Antarctica."}}},
{"id":"n-3e490117","guard":[["hasAny",["continent","jordan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Jordan":"Jordan is in Asia."}}},
{"id":"n-40d40ad0","guard":[["hasAny",["continent","liberia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Liberia in":"Liberia is in Africa."}}},
{"id":"n-41ad27b4","guard":[["hasAny",["continent","cuba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Cuba in":"Cuba is in North America."}}},
{"id":"n-41ce16ee","guard":[["hasAny",["continent","sweden"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Sweden in":"Sweden is in Europe."}}},
{"id":"n-41d8a6ae","guard":[["has","costa"],["has","name"]],"pyramid":["render.template",{"lit":["Costa ",{"slot":0}," is in North America."]},["sense.lastWord"]],"mem":null},
{"id":"n-4213adeb","guard":[["hasAny",["afghanistan","continent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Afghanistan":"Afghanistan is in Asia."}}},
{"id":"n-4840fe1b","guard":[["hasAny",["continent","georgia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Georgia in":"Georgia is in Asia."}}},
{"id":"n-48539c12","guard":[["hasAny",["continent","liberia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Liberia in":"Liberia is in Africa."}}},
{"id":"n-48a1ec1b","guard":[["hasAny",["continent","name","sudan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Sudan":"Sudan is in Africa."}}},
{"id":"n-49162639","guard":[["hasAny",["afghanistan","continent"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Afghanistan":"Afghanistan is in Asia."}}},
{"id":"n-4ba440be","guard":[["hasAny",["continent","korea","north"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is North Korea in":"North Korea is in Asia."}}},
{"id":"n-4c05c324","guard":[["hasAny",["continent","germany","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Germany":"Germany is in Europe."}}},
{"id":"n-4f07d0a5","guard":[["hasAny",["botswana","continent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Botswana":"Botswana is in Africa."}}},
{"id":"n-5081037c","guard":[["hasAny",["continent","serbia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Serbia in":"Serbia is in Europe."}}},
{"id":"n-5114d571","guard":[["hasAny",["caledonia","continent","new"]],["has","on"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is New Caledonia":"New Caledonia is in Oceania."}}},
{"id":"n-51c72889","guard":[["hasAny",["city","continent","holy","see","state","vatican"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Holy See (Vatican City State)":"Holy See (Vatican City State) is in Europe."}}},
{"id":"n-52b85e29","guard":[["has","niue"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Niue":"Niue is in Oceania."}}},
{"id":"n-546d4741","guard":[["hasAny",["continent","palestine"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Palestine in":"Palestine is in Asia."}}},
{"id":"n-54914197","guard":[["hasAny",["continent","french","name","southern","territories"]],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of French Southern territories":"French Southern territories is in Antarctica."}}},
{"id":"n-55efb454","guard":[["hasAny",["austria","continent"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Austria in":"Austria is in Europe."}}},
{"id":"n-58fd1953","guard":[["hasAny",["congo","continent","democratic","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is The Democratic Republic of Congo":"The Democratic Republic of Congo is in Africa."}}},
{"id":"n-595eaf29","guard":[["has","bhutan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Bhutan":"Bhutan is in Asia."}}},
{"id":"n-5b59e75e","guard":[["has","sahara"],["has","on"]],"pyramid":["render.template",{"lit":["Western ",{"slot":0}," is in Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-605fae4f","guard":[["hasAny",["albania","continent"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Albania":"Albania is in Europe."}}},
{"id":"n-60756ea4","guard":[["has","cameroon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Cameroon":"Cameroon is in Africa."}}},
{"id":"n-6194cb3d","guard":[["hasAny",["continent","cuba"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Cuba in":"Cuba is in North America."}}},
{"id":"n-6308b9e5","guard":[["hasAny",["continent","name","wales"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Wales":"Wales is in Europe."}}},
{"id":"n-630f16f3","guard":[["hasAny",["continent","tanzania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Tanzania in":"Tanzania is in Africa."}}},
{"id":"n-63a794c9","guard":[["hasAny",["continent","sahara","western"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Western Sahara":"Western Sahara is in Africa."}}},
{"id":"n-64124d48","guard":[["hasAny",["continent","nigeria"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Nigeria in":"Nigeria is in Africa."}}},
{"id":"n-6455e584","guard":[["hasAny",["continent","liechtenstein"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Liechtenstein in":"Liechtenstein is in Europe."}}},
{"id":"n-65768724","guard":[["has","solomon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Solomon Islands":"Solomon Islands is in Oceania."}}},
{"id":"n-65d4bb97","guard":[["hasAny",["continent","montenegro","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Montenegro":"Montenegro is in Europe."}}},
{"id":"n-665c6057","guard":[["hasAny",["continent","seychelles"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Seychelles":"Seychelles is in Africa."}}},
{"id":"n-68483e2c","guard":[["has","antilles"],["has","on"]],"pyramid":["render.template",{"lit":["Netherlands ",{"slot":0}," is in North America."]},["sense.lastWord"]],"mem":null},
{"id":"n-6a2a981a","guard":[["hasAny",["continent","name","niue"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Niue":"Niue is in Oceania."}}},
{"id":"n-6b6095b0","guard":[["hasAny",["continent","eritrea"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Eritrea":"Eritrea is in Africa."}}},
{"id":"n-6b931ce1","guard":[["hasAny",["aruba","continent","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Aruba":"Aruba is in North America."}}},
{"id":"n-6c458812","guard":[["hasAny",["bolivia","continent"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Bolivia in":"Bolivia is in South America."}}},
{"id":"n-6d4725e0","guard":[["has","indonesia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Indonesia":"Indonesia is in Asia."}}},
{"id":"n-6d764c5a","guard":[["has","fiji"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Fiji Islands":"Fiji Islands is in Oceania."}}},
{"id":"n-6dd9eda2","guard":[["has","mauritius"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Mauritius":"Mauritius is in Africa."}}},
{"id":"n-6e4ee871","guard":[["hasAny",["continent","yemen"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Yemen in":"Yemen is in Asia."}}},
{"id":"n-6faeb244","guard":[["hasAny",["bhutan","continent","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Bhutan":"Bhutan is in Asia."}}},
{"id":"n-7053019a","guard":[["hasAny",["continent","fiji","islands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Fiji Islands":"Fiji Islands is in Oceania."}}},
{"id":"n-70fe491f","guard":[["has","korea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is North Korea in":"North Korea is in Asia."}}},
{"id":"n-72bae6ce","guard":[["hasAny",["continent","name","paraguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Paraguay":"Paraguay is in South America."}}},
{"id":"n-731773db","guard":[["hasAny",["continent","kazakhstan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Kazakhstan":"Kazakhstan is in Asia."}}},
{"id":"n-73436fd3","guard":[["hasAny",["continent","czech","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Czech Republic in":"Czech Republic is in Europe."}}},
{"id":"n-735bb4d8","guard":[["hasAny",["continent","libya","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Libya":"Libya is in Africa."}}},
{"id":"n-74eb3d78","guard":[["hasAny",["continent","heard","island","islands","mcdonald"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Heard Island and McDonald Islands in":"Heard Island and McDonald Islands is in Antarctica."}}},
{"id":"n-75533d06","guard":[["hasAny",["continent","england"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is England":"England is in Europe."}}},
{"id":"n-7595db5b","guard":[["has","macao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Macao":"Macao is in Asia."}}},
{"id":"n-76850dc1","guard":[["hasAny",["continent","netherlands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Netherlands":"Netherlands is in Europe."}}},
{"id":"n-769b61bf","guard":[["hasAny",["continent","haiti"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Haiti":"Haiti is in North America."}}},
{"id":"n-77621f84","guard":[["hasAny",["continent","kuwait","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Kuwait":"Kuwait is in Asia."}}},
{"id":"n-7bef53b2","guard":[["hasAny",["continent","somalia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Somalia":"Somalia is in Africa."}}},
{"id":"n-809244a0","guard":[["hasAny",["cambodia","continent"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Cambodia":"Cambodia is in Asia."}}},
{"id":"n-81214e57","guard":[["has","zimbabwe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Zimbabwe":"Zimbabwe is in Africa."}}},
{"id":"n-8a24edec","guard":[["hasAny",["brunei","continent"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Brunei in":"Brunei is in Asia."}}},
{"id":"n-8b27081b","guard":[["has","lithuania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Lithuania":"Lithuania is in Europe."}}},
{"id":"n-8bde53ec","guard":[["has","ireland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Northern Ireland":"Northern Ireland is in Europe."}}},
{"id":"n-8c887555","guard":[["hasAny",["continent","grenada"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Grenada":"Grenada is in North America."}}},
{"id":"n-8ef68fc7","guard":[["has","guineabissau"],["has","name"]],"pyramid":["render.template",{"lit":["Guinea-",{"slot":0}," is in Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-90fff9a0","guard":[["has","lebanon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Lebanon":"Lebanon is in Asia."}}},
{"id":"n-91539113","guard":[["hasAny",["bahrain","continent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Bahrain in":"Bahrain is in Asia."}}},
{"id":"n-92956898","guard":[["hasAny",["continent","maldives"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Maldives in":"Maldives is in Asia."}}},
{"id":"n-92bbc60e","guard":[["hasAny",["continent","islands","name","solomon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Solomon Islands":"Solomon Islands is in Oceania."}}},
{"id":"n-965e014e","guard":[["hasAny",["continent","lithuania","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Lithuania":"Lithuania is in Europe."}}},
{"id":"n-97a50384","guard":[["hasAny",["angola","continent","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Angola":"Angola is in Africa."}}},
{"id":"n-97f8888f","guard":[["hasAny",["city","continent","holy","see","state","vatican"]],["has","on"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Holy See (Vatican City State)":"Holy See (Vatican City State) is in Europe."}}},
{"id":"n-982a4cc3","guard":[["has","qatar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Qatar":"Qatar is in Asia."}}},
{"id":"n-98f7e8a7","guard":[["hasAny",["continent","norway"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Norway in":"Norway is in Europe."}}},
{"id":"n-9b7aff06","guard":[["hasAny",["continent","eritrea"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Eritrea":"Eritrea is in Africa."}}},
{"id":"n-9d390638","guard":[["hasAny",["continent","slovenia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Slovenia":"Slovenia is in Europe."}}},
{"id":"n-9daa2147","guard":[["hasAny",["caledonia","continent","new"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is New Caledonia":"New Caledonia is in Oceania."}}},
{"id":"n-9de7586b","guard":[["hasAny",["continent","costa","name","rica"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Costa Rica":"Costa Rica is in North America."}}},
{"id":"n-9e447577","guard":[["hasAny",["continent","macao","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Macao":"Macao is in Asia."}}},
{"id":"n-9e6ed5b3","guard":[["hasAny",["continent","grenada"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Grenada":"Grenada is in North America."}}},
{"id":"n-9f8b7a52","guard":[["hasAny",["continent","marino","san"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is San Marino in":"San Marino is in Europe."}}},
{"id":"n-9f923bac","guard":[["hasAny",["continent","name","samoa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Samoa":"Samoa is in Oceania."}}},
{"id":"n-a0d2eca2","guard":[["hasAny",["continent","suriname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Suriname":"Suriname is in South America."}}},
{"id":"n-a3876b75","guard":[["hasAny",["continent","uruguay"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Uruguay in":"Uruguay is in South America."}}},
{"id":"n-a3e41da7","guard":[["hasAny",["continent","islands","mariana","name","northern"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Northern Mariana Islands":"Northern Mariana Islands is in Oceania."}}},
{"id":"n-a6915120","guard":[["hasAny",["continent","liechtenstein"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Liechtenstein in":"Liechtenstein is in Europe."}}},
{"id":"n-a76b8f36","guard":[["has","samoa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Samoa":"Samoa is in Oceania."}}},
{"id":"n-a7c8992c","guard":[["hasAny",["arabia","continent","saudi"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Saudi Arabia in":"Saudi Arabia is in Asia."}}},
{"id":"n-a7fcc8ee","guard":[["hasAny",["continent","jan","mayen","svalbard"]],["has","on"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Svalbard and Jan Mayen":"Svalbard and Jan Mayen is in Europe."}}},
{"id":"n-aabca9dc","guard":[["hasAny",["albania","continent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Albania":"Albania is in Europe."}}},
{"id":"n-ace04c04","guard":[["hasAny",["continent","england"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is England":"England is in Europe."}}},
{"id":"n-ae5f3fad","guard":[["has","pitcairn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Pitcairn":"Pitcairn is in Oceania."}}},
{"id":"n-afca55ee","guard":[["has","germany"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Germany":"Germany is in Europe."}}},
{"id":"n-b0c5662c","guard":[["hasAny",["continent","states","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is United States in":"United States is in North America."}}},
{"id":"n-b29f5cf5","guard":[["hasAny",["australia","continent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Australia":"Australia is in Oceania."}}},
{"id":"n-b359c056","guard":[["hasAny",["continent","indonesia","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Indonesia":"Indonesia is in Asia."}}},
{"id":"n-b4b3a948","guard":[["has","hong"],["has","on"]],"pyramid":["render.template",{"lit":["Hong ",{"slot":0}," is in Asia."]},["sense.lastWord"]],"mem":null},
{"id":"n-b5871af9","guard":[["has","latvia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Latvia":"Latvia is in Europe."}}},
{"id":"n-b9bdbf97","guard":[["hasAny",["continent","moldova"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Moldova":"Moldova is in Europe."}}},
{"id":"n-babe5fb4","guard":[["has","aruba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Aruba":"Aruba is in North America."}}},
{"id":"n-bb7dff93","guard":[["hasAny",["cambodia","continent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Cambodia":"Cambodia is in Asia."}}},
{"id":"n-bc15be48","guard":[["has","solomon"],["has","name"]],"pyramid":["render.template",{"lit":["Solomon ",{"slot":0}," is in Oceania."]},["sense.lastWord"]],"mem":null},
{"id":"n-bdc2ce80","guard":[["has","angola"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Angola":"Angola is in Africa."}}},
{"id":"n-be4b6844","guard":[["hasAny",["botswana","continent"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Botswana":"Botswana is in Africa."}}},
{"id":"n-bf2310e2","guard":[["hasAny",["continent","hong","kong"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Hong Kong":"Hong Kong is in Asia."}}},
{"id":"n-bf89936e","guard":[["hasAny",["burundi","continent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Burundi in":"Burundi is in Africa."}}},
{"id":"n-c12aab2f","guard":[["hasAny",["antilles","continent","netherlands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Netherlands Antilles":"Netherlands Antilles is in North America."}}},
{"id":"n-c25f9c27","guard":[["hasAny",["continent","heard","island","islands","mcdonald"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Heard Island and McDonald Islands in":"Heard Island and McDonald Islands is in Antarctica."}}},
{"id":"n-c36f8bd6","guard":[["hasAny",["continent","yemen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Yemen in":"Yemen is in Asia."}}},
{"id":"n-c393a42d","guard":[["hasAny",["continent","slovenia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Slovenia":"Slovenia is in Europe."}}},
{"id":"n-c3bc0c45","guard":[["has","libya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Libya":"Libya is in Africa."}}},
{"id":"n-c44c5e35","guard":[["hasAny",["continent","senegal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Senegal in":"Senegal is in Africa."}}},
{"id":"n-c5479b80","guard":[["hasAny",["continent","monaco","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Monaco":"Monaco is in Europe."}}},
{"id":"n-c5def63c","guard":[["hasAny",["continent","mozambique"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Mozambique in":"Mozambique is in Africa."}}},
{"id":"n-c6a73ee1","guard":[["has","tokelau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Tokelau":"Tokelau is in Oceania."}}},
{"id":"n-c9403055","guard":[["hasAny",["continent","french","name","southern","territories"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of French Southern territories":"French Southern territories is in Antarctica."}}},
{"id":"n-c9cab790","guard":[["has","guineabissau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Guinea-Bissau":"Guinea-Bissau is in Africa."}}},
{"id":"n-cb2ed607","guard":[["hasAny",["burundi","continent"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Burundi in":"Burundi is in Africa."}}},
{"id":"n-cbdc4d03","guard":[["hasAny",["continent","lebanon","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Lebanon":"Lebanon is in Asia."}}},
{"id":"n-cd3fc067","guard":[["has","bouvet"],["has","on"]],"pyramid":["render.template",{"lit":["Bouvet ",{"slot":0}," is in Antarctica."]},["sense.lastWord"]],"mem":null},
{"id":"n-cd55a3b0","guard":[["hasAny",["continent","guineabissau","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Guinea-Bissau":"Guinea-Bissau is in Africa."}}},
{"id":"n-cdab4910","guard":[["has","montenegro"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Montenegro":"Montenegro is in Europe."}}},
{"id":"n-d4652585","guard":[["hasAny",["continent","somalia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Somalia":"Somalia is in Africa."}}},
{"id":"n-d637d839","guard":[["hasAny",["continent","reunion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Reunion":"Reunion is in Africa."}}},
{"id":"n-d6c39304","guard":[["hasAny",["chad","continent"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Chad in":"Chad is in Africa."}}},
{"id":"n-d6e19cdb","guard":[["hasAny",["continent","kazakhstan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Kazakhstan":"Kazakhstan is in Asia."}}},
{"id":"n-d7455748","guard":[["hasAny",["continent","latvia","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the continent of Latvia":"Latvia is in Europe."}}},
{"id":"n-da7a2014","guard":[["hasAny",["continent","falkland","islands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Falkland Islands in":"Falkland Islands is in South America."}}},
{"id":"n-ddff92eb","guard":[["hasAny",["continent","italy"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Italy":"Italy is in Europe."}}},
{"id":"n-e1be39ba","guard":[["hasAny",["continent","mauritania"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Mauritania":"Mauritania is in Africa."}}},
{"id":"n-e35c6d8d","guard":[["has","falkland"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Falkland Islands in":"Falkland Islands is in South America."}}},
{"id":"n-e488a269","guard":[["hasAny",["continent","marino","san"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is San Marino in":"San Marino is in Europe."}}},
{"id":"n-e5582a1d","guard":[["hasAny",["continent","panama"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Panama in":"Panama is in North America."}}},
{"id":"n-e55b96be","guard":[["hasAny",["continent","tanzania"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Tanzania in":"Tanzania is in Africa."}}},
{"id":"n-e5a3dbe1","guard":[["hasAny",["continent","turkey"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Turkey":"Turkey is in Asia."}}},
{"id":"n-e5f14e5f","guard":[["has","monaco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the continent of Monaco":"Monaco is in Europe."}}},
{"id":"n-e867f452","guard":[["has","caledonia"],["has","on"]],"pyramid":["render.template",{"lit":["New ",{"slot":0}," is in Oceania."]},["sense.lastWord"]],"mem":null},
{"id":"n-e8e27133","guard":[["hasAny",["continent","montserrat"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Montserrat":"Montserrat is in North America."}}},
{"id":"n-eb0d9443","guard":[["hasAny",["continent","reunion"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Reunion":"Reunion is in Africa."}}},
{"id":"n-ef827447","guard":[["hasAny",["bouvet","continent","island"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Bouvet Island":"Bouvet Island is in Antarctica."}}},
{"id":"n-f03b449a","guard":[["hasAny",["continent","panama"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Panama in":"Panama is in North America."}}},
{"id":"n-f062657c","guard":[["hasAny",["continent","slovakia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Slovakia":"Slovakia is in Europe."}}},
{"id":"n-f1ba2acf","guard":[["hasAny",["continent","haiti"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Haiti":"Haiti is in North America."}}},
{"id":"n-f306c880","guard":[["hasAny",["continent","mozambique"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which continent is Mozambique in":"Mozambique is in Africa."}}},
{"id":"n-f3514459","guard":[["hasAny",["continent","france"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is France":"France is in Europe."}}},
{"id":"n-f35ce0eb","guard":[["hasAny",["continent","suriname"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"on what continent is Suriname":"Suriname is in South America."}}},
{"id":"n-f9f8ee47","guard":[["hasAny",["austria","continent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Austria in":"Austria is in Europe."}}},
{"id":"n-fc18a1ff","guard":[["hasAny",["continent","serbia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which continent is Serbia in":"Serbia is in Europe."}}},
{"id":"n-fcad6f6c","guard":[["hasAny",["continent","seychelles"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"on what continent is Seychelles":"Seychelles is in Africa."}}},
{"id":"n-1ef35812","guard":[["hasAny",["guineabissau","lower case","lowercase","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["Guinea-",{"slot":0}," is in Africa."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-59a5db72","guard":[["hasAny",["kiribati","shortest","shortest one","shortest word"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oceania."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-646ed6cd","guard":[["hasAny",["all caps","capital letters","capitals","guineabissau","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":["Guinea-",{"slot":0}," is in Africa."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-6af063ba","guard":[["hasAny",["capitalise","capitalize","capitalize each word","guineabissau","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["Guinea-",{"slot":0}," is in Africa."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bbaae445","guard":[["hasAny",["guineabissau","invert case","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":["Guinea-",{"slot":0}," is in Africa."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0394fe95","guard":[["hasAny",["antilles","longest","longest one","longest word"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in North America."]},["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-04edea86","guard":[["hasAny",["czech","element","item number","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":["Czech ",{"slot":0}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0504cd74","guard":[["hasAny",["antilles","element","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," Antilles is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0873dcc9","guard":[["hasAny",["element","falkland","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Falkland ",{"slot":0}," is in South America."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-14e3116e","guard":[["hasAny",["delete","french","remove","strip out","without"]],["has","continent"]],"pyramid":["render.str",["transform.remove",{"lit":"Antarctica"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-24808830","guard":[["hasAny",["east","element","item number","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":["East ",{"slot":0}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-29caa861","guard":[["hasAny",["delete","remove","strip out","suriname","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-2cce719c","guard":[["hasAny",["east","element","item number","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," Timor is in Asia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2f407fb1","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," Sahara is in Africa."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-30807f8f","guard":[["hasAny",["each word","guineabissau","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["Guinea-",{"slot":0}," is in Africa."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-38008da0","guard":[["hasAny",["delete","heard","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Antarctica"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-40d8047f","guard":[["hasAny",["element","item number","macedonia","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":["North ",{"slot":0}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4ea9ed1b","guard":[["hasAny",["czech","element","item number","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," Republic is in Europe."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4edf7edf","guard":[["hasAny",["guineabissau","normalise","normalize","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":["Guinea-",{"slot":0}," is in Africa."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-51e5d22c","guard":[["hasAny",["bouvet","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Antarctica"},["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-544d18ba","guard":[["hasAny",["each word","guineabissau","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["Guinea-",{"slot":0}," is in Africa."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-721d75d2","guard":[["hasAny",["element","item number","marino","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," Marino is in Europe."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-74a8d1c1","guard":[["hasAny",["costa","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Rica is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-77f786a1","guard":[["hasAny",["bouvet","element","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," Island is in Antarctica."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7bb33768","guard":[["hasAny",["element","hong","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," Kong is in Asia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-946b2c1d","guard":[["hasAny",["element","ireland","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Ireland is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-94fb3158","guard":[["hasAny",["element","item number","korea","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":["North ",{"slot":0}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9d3a6bb2","guard":[["hasAny",["delete","paraguay","remove","strip out","without"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-a2683a7a","guard":[["hasAny",["element","item number","macedonia","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," Macedonia is in Europe."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a456b7a7","guard":[["hasAny",["hong","shortest","shortest one","shortest word"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-aaf33ef2","guard":[["hasAny",["element","item number","kiribati","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-ac82bdb0","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":["Saudi ",{"slot":0}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d50999d5","guard":[["hasAny",["caledonia","element","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," Caledonia is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-dd680d04","guard":[["hasAny",["bouvet","shortest","shortest one","shortest word"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Antarctica."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-defd6aa4","guard":[["hasAny",["element","item number","marino","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":["San ",{"slot":0}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e40ff2cd","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," Arabia is in Asia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e4bfc381","guard":[["hasAny",["jan","shortest","shortest one","shortest word"]],["has","on"]],"pyramid":["render.template",{"lit":["Svalbard and ",{"slot":0}," ",{"slot":1}," is in Europe."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-f483db17","guard":[["hasAny",["element","item number","korea","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0}," Korea is in Asia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fe134bd4","guard":[["hasAny",["element","falkland","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands is in South America."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3e0d3e8b","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Northern ",{"slot":0}," ",{"slot":1}," is in Oceania."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-44453bae","guard":[["hasAny",["element","ireland","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-47afabed","guard":[["hasAny",["congo","element","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":["The Democratic ",{"slot":0}," of ",{"slot":1}," is in Africa."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-51813a51","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.lastWord"]],"mem":null},
{"id":"n-5b48bad9","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Jan ",{"slot":1}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-6180618b","guard":[["hasAny",["element","hong","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.lastWord"]],"mem":null},
{"id":"n-75f0bf3b","guard":[["hasAny",["bouvet","element","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Antarctica."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-8233410b","guard":[["hasAny",["costa","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-830f702c","guard":[["hasAny",["element","hong","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-a8bdf3ad","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Mariana ",{"slot":1}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-ab43177f","guard":[["hasAny",["antilles","element","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.lastWord"]],"mem":null},
{"id":"n-c6e8ac92","guard":[["hasAny",["congo","element","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," Republic of ",{"slot":1}," is in Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.lastWord"]],"mem":null},
{"id":"n-d167a4c2","guard":[["hasAny",["bouvet","element","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Antarctica."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.lastWord"]],"mem":null},
{"id":"n-ec9f95da","guard":[["hasAny",["element","item number","nth","position","solomon"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oceania."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-fdcfb00a","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-00347638","guard":[["hasAny",["element","federated","item number","nth","position","shortest","shortest one","shortest word"]],["has","continent"]],"pyramid":["render.template",{"lit":["Micronesia, ",{"slot":0}," ",{"slot":1}," of is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0e17adaf","guard":[["hasAny",["element","falkland","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in South America."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-141b4440","guard":[["hasAny",["element","federated","item number","nth","position","shortest","shortest one","shortest word"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0},", Federated ",{"slot":1}," of is in Oceania."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-185ba9a2","guard":[["hasAny",["element","hong","item number","lower case","lowercase","nth","position","small letters"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-18a13843","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","sahara","title case"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1d75606a","guard":[["hasAny",["all caps","capital letters","capitals","element","ireland","item number","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-250692d4","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","sahara","small letters"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-261e3070","guard":[["hasAny",["element","invert case","ireland","item number","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3c189b33","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","hong","item number","nth","position","title case"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3dc6e383","guard":[["hasAny",["element","ireland","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-42266aee","guard":[["hasAny",["element","hong","invert case","item number","nth","position","swap case","toggle case"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4d3e914c","guard":[["hasAny",["all caps","capital letters","capitals","element","hong","item number","nth","position","upper case","uppercase"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-4eeba9e9","guard":[["hasAny",["bouvet","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Antarctica."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-58270eaf","guard":[["hasAny",["bouvet","element","invert case","item number","nth","position","swap case","toggle case"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Antarctica."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8a841137","guard":[["hasAny",["bouvet","element","item number","lower case","lowercase","nth","position","small letters"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Antarctica."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-93addd8a","guard":[["hasAny",["element","item number","jan","nth","position","shortest","shortest one","shortest word"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," Mayen is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9d951a43","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","sahara","upper case","uppercase"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b52bfc43","guard":[["hasAny",["all caps","bouvet","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Antarctica."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c58f6358","guard":[["hasAny",["element","invert case","item number","nth","position","sahara","swap case","toggle case"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e78edd74","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","ireland","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-00c04c7b","guard":[["hasAny",["congo","element","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Congo is in Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-06918380","guard":[["hasAny",["element","falkland","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in South America."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-09120d4f","guard":[["hasAny",["element","ireland","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-19db1e67","guard":[["hasAny",["city","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","on"]],"pyramid":["render.template",{"lit":["Holy ",{"slot":0}," (",{"slot":1}," City ",{"slot":2},") is in Europe."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-3161d299","guard":[["hasAny",["element","item number","jan","nth","position","shortest","shortest one","shortest word"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Europe."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-3237a907","guard":[["hasAny",["congo","element","item number","longest","longest one","longest word","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is in Africa."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-430c94b1","guard":[["hasAny",["each word","element","item number","nth","position","sahara","split into words"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-44660994","guard":[["hasAny",["each word","element","hong","item number","nth","position","split into words"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4c279d73","guard":[["hasAny",["element","falkland","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in South America."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4cfd9f79","guard":[["hasAny",["bouvet","element","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Antarctica."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-503ac9af","guard":[["hasAny",["each word","element","item number","nth","position","sahara","split into words"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-512fdcc3","guard":[["hasAny",["bouvet","each word","element","item number","nth","position","split into words"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Antarctica."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-568eb96e","guard":[["hasAny",["city","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (Vatican City ",{"slot":2},") is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-6730732f","guard":[["hasAny",["each word","element","hong","item number","nth","position","split into words"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-82177180","guard":[["hasAny",["element","federated","item number","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," States of is in Oceania."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-82950a5a","guard":[["hasAny",["bouvet","each word","element","item number","nth","position","split into words"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Antarctica."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-985001a7","guard":[["hasAny",["element","item number","normalise","normalize","nth","position","sahara","simplify the text"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-98857fec","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-a4327206","guard":[["hasAny",["element","falkland","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in South America."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c92903e9","guard":[["hasAny",["bouvet","element","item number","normalise","normalize","nth","position","simplify the text"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Antarctica."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d7e7044b","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Islands is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-df22549e","guard":[["hasAny",["element","item number","jan","nth","position","shortest","shortest one","shortest word"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-e3ba7cfb","guard":[["hasAny",["element","hong","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Asia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-f4ed09ac","guard":[["hasAny",["each word","element","ireland","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fbb9f6d9","guard":[["hasAny",["each word","element","ireland","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0838643d","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","jan","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-5a5e6d9e","guard":[["hasAny",["city","element","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," See (",{"slot":1}," City ",{"slot":2},") is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-884c3cc9","guard":[["hasAny",["congo","element","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is in Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-8c2aec46","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-d3291c2c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","jan","nth","position","shortest","shortest one","shortest word","title case"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e7b3626b","guard":[["hasAny",["element","invert case","item number","jan","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e8e6eb1c","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Oceania."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-f115a79f","guard":[["hasAny",["element","item number","jan","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f2c0d7f3","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-fb609cc4","guard":[["hasAny",["element","federated","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," of is in Oceania."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-02393a87","guard":[["hasAny",["each word","element","item number","jan","nth","position","shortest","shortest one","shortest word","split into words"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-049000e1","guard":[["hasAny",["each word","element","item number","jan","nth","position","shortest","shortest one","shortest word","split into words"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-08cc5687","guard":[["hasAny",["element","federated","item number","nth","position","shortest","shortest one","shortest word"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," of is in Oceania."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2b825dcf","guard":[["hasAny",["city","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City State) is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-34788aa4","guard":[["hasAny",["element","item number","jan","nth","position","shortest","shortest one","shortest word"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-3d3b1401","guard":[["hasAny",["congo","element","invert case","item number","nth","position","swap case","toggle case"]],["has","on"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is in Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3da81358","guard":[["hasAny",["capitalise","capitalize","capitalize each word","congo","element","item number","nth","position","title case"]],["has","on"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is in Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5d29da7f","guard":[["hasAny",["all caps","capital letters","capitals","congo","element","item number","nth","position","upper case","uppercase"]],["has","on"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is in Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a34f8867","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","mariana","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a6c8b11c","guard":[["hasAny",["congo","element","item number","lower case","lowercase","nth","position","small letters"]],["has","on"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is in Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-bb31fd99","guard":[["hasAny",["element","item number","jan","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d24b0239","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","mariana","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d87cce98","guard":[["hasAny",["element","federated","item number","nth","position","shortest","shortest one","shortest word"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," of is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e51be943","guard":[["hasAny",["element","federated","item number","nth","position","shortest","shortest one","shortest word"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," of is in Oceania."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e651d254","guard":[["hasAny",["element","invert case","item number","mariana","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-eae886f9","guard":[["hasAny",["element","item number","lower case","lowercase","mariana","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-012bd3c9","guard":[["hasAny",["congo","each word","element","item number","nth","position","split into words"]],["has","on"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is in Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-09f00913","guard":[["hasAny",["city","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") is in Europe."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-0e1a7130","guard":[["hasAny",["element","item number","mariana","normalise","normalize","nth","position","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-1d65f53c","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-40c2ea4d","guard":[["hasAny",["element","heard","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and McDonald ",{"slot":2}," is in Antarctica."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-4177fbeb","guard":[["hasAny",["each word","element","item number","mariana","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4775ac8b","guard":[["hasAny",["element","heard","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Heard ",{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Antarctica."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-4c1b8c5b","guard":[["hasAny",["element","heard","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," Island and ",{"slot":1}," ",{"slot":2}," is in Antarctica."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-4e36e42b","guard":[["hasAny",["congo","element","item number","normalise","normalize","nth","position","simplify the text"]],["has","on"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is in Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-8d16cc01","guard":[["hasAny",["each word","element","item number","mariana","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Oceania."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a40495b5","guard":[["hasAny",["element","heard","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," Islands is in Antarctica."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b50bcff5","guard":[["hasAny",["congo","each word","element","item number","nth","position","split into words"]],["has","on"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is in Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c208a944","guard":[["hasAny",["congo","element","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is in Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-ce66e4d1","guard":[["hasAny",["element","federated","item number","nth","position"]],["has","continent"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," of is in Oceania."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d4fd37e4","guard":[["hasAny",["city","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-3c97a29d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","city","element","item number","nth","position","shortest","shortest one","shortest word","title case"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7af071e3","guard":[["hasAny",["city","element","item number","nth","position"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-83e4021d","guard":[["hasAny",["all caps","capital letters","capitals","city","element","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a2960429","guard":[["hasAny",["city","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e1d5b95b","guard":[["hasAny",["city","element","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0707c795","guard":[["hasAny",["city","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-09a579cb","guard":[["hasAny",["city","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-216d4431","guard":[["hasAny",["city","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-a078cf77","guard":[["hasAny",["city","element","item number","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text"]],["has","on"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," (",{"slot":2}," City ",{"slot":3},") is in Europe."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-a19fd5ba","guard":[["hasAny",["element","heard","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," ",{"slot":3}," is in Antarctica."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-41a7e4af","guard":[["hasAny",["element","heard","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," ",{"slot":3}," is in Antarctica."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-95eddd78","guard":[["hasAny",["element","heard","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," ",{"slot":3}," is in Antarctica."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e90cf3ea","guard":[["hasAny",["element","heard","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," ",{"slot":3}," is in Antarctica."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the continent of Qatar","expect":{"contains":["Asia"],"notRefusal":true}},{"q":"which continent is East Timor in","expect":{"contains":["Asia"],"notRefusal":true}},{"q":"name the continent of Libya","expect":{"contains":["Africa"],"notRefusal":true}},{"q":"name the continent of Indonesia","expect":{"contains":["Asia"],"notRefusal":true}},{"q":"on what continent is Netherlands","expect":{"contains":["Europe"],"notRefusal":true}},{"q":"name the continent of Zimbabwe","expect":{"contains":["Africa"],"notRefusal":true}},{"q":"name the continent of Cameroon","expect":{"contains":["Africa"],"notRefusal":true}},{"q":"on what continent is Eritrea","expect":{"contains":["Africa"],"notRefusal":true}},{"q":"name the continent of Angola","expect":{"contains":["Africa"],"notRefusal":true}},{"q":"which continent is Yemen in","expect":{"contains":["Asia"],"notRefusal":true}},{"q":"which continent is Mozambique in","expect":{"contains":["Africa"],"notRefusal":true}},{"q":"on what continent is Somalia","expect":{"contains":["Africa"],"notRefusal":true}},{"q":"name the continent of Myanmar","expect":{"contains":["Asia"],"notRefusal":true}},{"q":"on what continent is Netherlands Antilles","expect":{"contains":["North America"],"notRefusal":true}},{"q":"which continent is Senegal in","expect":{"contains":["Africa"],"notRefusal":true}},{"q":"name the continent of Costa Rica","expect":{"contains":["North America"],"notRefusal":true}},{"q":"which continent is Brunei in","expect":{"contains":["Asia"],"notRefusal":true}},{"q":"on what continent is Slovakia","expect":{"contains":["Europe"],"notRefusal":true}},{"q":"which continent is Tanzania in","expect":{"contains":["Africa"],"notRefusal":true}},{"q":"name the continent of Lebanon","expect":{"contains":["Asia"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
