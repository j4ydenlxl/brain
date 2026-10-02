// tld-sponsor-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"tld-sponsor-neo-g6","class":"tld-sponsor","generation":6,"lane":"neo","grownFrom":["name the sponsoring body of .भारत","who sponsors the top-level domain .ee","who sponsors the top-level domain .tiaa","who sponsors the top-level domain ‏.امارات‎","who sponsors the top-level domain .seat","which organization runs the domain .pamperedchef","who sponsors the top-level domain .asda","name the sponsoring body of .marriott","name the sponsoring body of .express","who sponsors the top-level domain .xyz","name the sponsoring body of .bar","which organization runs the domain .surf","who sponsors the top-level domain .ye","who sponsors the top-level domain .sas","which organization runs the domain .ls","name the sponsoring body of .plumbing","which organization runs the domain .study","which organization runs the domain .sv","which organization runs the domain .hospital","which organization runs the domain .мон"],"version":1});

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
{"id":"n-2219ce8b","guard":[["hasAny",["body","domain"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .भारत":".भारत is sponsored by National Internet Exchange of India.","who sponsors the top-level domain .ee":".ee is sponsored by Eesti Interneti Sihtasutus (EIS).","who sponsors the top-level domain .tiaa":".tiaa is sponsored by Teachers Insurance and Annuity Association of America.","who sponsors the top-level domain ‏.امارات‎":"‏.امارات‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA).","who sponsors the top-level domain .seat":".seat is sponsored by SEAT, S.A. (Sociedad Unipersonal).","which organization runs the domain .pamperedchef":".pamperedchef is sponsored by Not assigned.","who sponsors the top-level domain .asda":".asda is sponsored by Asda Stores Limited.","name the sponsoring body of .marriott":".marriott is sponsored by Marriott Worldwide Corporation.","name the sponsoring body of .express":".express is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .xyz":".xyz is sponsored by XYZ.COM LLC.","name the sponsoring body of .bar":".bar is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable.","which organization runs the domain .surf":".surf is sponsored by Registry Services, LLC.","who sponsors the top-level domain .ye":".ye is sponsored by TeleYemen.","who sponsors the top-level domain .sas":".sas is sponsored by Research IP LLC.","which organization runs the domain .ls":".ls is sponsored by Lesotho Network Information Centre Proprietary (LSNIC).","name the sponsoring body of .plumbing":".plumbing is sponsored by Binky Moon, LLC.","which organization runs the domain .study":".study is sponsored by Registry Services, LLC.","which organization runs the domain .sv":".sv is sponsored by SVNet.","which organization runs the domain .hospital":".hospital is sponsored by Binky Moon, LLC.","which organization runs the domain .мон":".мон is sponsored by Datacom Co.,Ltd.","who sponsors the top-level domain .works":".works is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .vivo":".vivo is sponsored by Telefonica Brasil S.A..","which organization runs the domain .im":".im is sponsored by Isle of Man Government.","which organization runs the domain .juegos":".juegos is sponsored by Dog Beach, LLC.","which organization runs the domain .computer":".computer is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .theater":".theater is sponsored by Binky Moon, LLC.","name the sponsoring body of .lifeinsurance":".lifeinsurance is sponsored by American Council of Life Insurers.","name the sponsoring body of .ci":".ci is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI).","which organization runs the domain .spa":".spa is sponsored by Asia Spa and Wellness Promotion Council Limited.","who sponsors the top-level domain .pt":".pt is sponsored by Associação DNS.PT.","name the sponsoring body of .forsale":".forsale is sponsored by Dog Beach, LLC.","which organization runs the domain .art":".art is sponsored by UK Creative Ideas Limited.","name the sponsoring body of .estate":".estate is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .рус":".рус is sponsored by Rusnames Limited.","which organization runs the domain .deloitte":".deloitte is sponsored by Deloitte Touche Tohmatsu.","which organization runs the domain .rs":".rs is sponsored by Serbian National Internet Domain Registry (RNIDS).","who sponsors the top-level domain .sharp":".sharp is sponsored by Sharp Corporation.","who sponsors the top-level domain .la":".la is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications.","who sponsors the top-level domain .nikon":".nikon is sponsored by NIKON CORPORATION.","which organization runs the domain .book":".book is sponsored by Amazon Registry Services, Inc..","who sponsors the top-level domain .commbank":".commbank is sponsored by COMMONWEALTH BANK OF AUSTRALIA.","name the sponsoring body of .tv":".tv is sponsored by Ministry of Transport, Energy, Communications and Innovations.","who sponsors the top-level domain .avianca":".avianca is sponsored by Not assigned.","name the sponsoring body of .kred":".kred is sponsored by KredTLD Pty Ltd.","name the sponsoring body of .za":".za is sponsored by ZA Domain Name Authority.","which organization runs the domain .discover":".discover is sponsored by Discover Financial Services.","who sponsors the top-level domain .mk":".mk is sponsored by Macedonian Academic Research Network Skopje.","which organization runs the domain .mv":".mv is sponsored by Dhivehi Raajjeyge Gulhun PLC.","who sponsors the top-level domain .hyatt":".hyatt is sponsored by Hyatt GTLD, L.L.C..","name the sponsoring body of .hockey":".hockey is sponsored by Binky Moon, LLC.","which organization runs the domain .map":".map is sponsored by Charleston Road Registry Inc..","name the sponsoring body of .itau":".itau is sponsored by Itau Unibanco Holding S.A..","who sponsors the top-level domain .star":".star is sponsored by Star India Private Limited.","who sponsors the top-level domain .honeywell":".honeywell is sponsored by Not assigned.","name the sponsoring body of ‏.إختبار‎":"‏.إختبار‎ is sponsored by Not assigned.","name the sponsoring body of .fire":".fire is sponsored by Amazon Registry Services, Inc..","name the sponsoring body of .furniture":".furniture is sponsored by Binky Moon, LLC.","which organization runs the domain .clubmed":".clubmed is sponsored by Club Méditerranée S.A..","which organization runs the domain .iwc":".iwc is sponsored by Not assigned.","which organization runs the domain .coop":".coop is sponsored by DotCooperation LLC.","which organization runs the domain .tab":".tab is sponsored by Tabcorp Holdings Limited.","who sponsors the top-level domain .education":".education is sponsored by Binky Moon, LLC.","name the sponsoring body of .lacaixa":".lacaixa is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\".","which organization runs the domain .ryukyu":".ryukyu is sponsored by BRregistry, Inc..","which organization runs the domain .bauhaus":".bauhaus is sponsored by Werkhaus GmbH.","name the sponsoring body of .plus":".plus is sponsored by Binky Moon, LLC.","name the sponsoring body of .forum":".forum is sponsored by Fegistry, LLC.","who sponsors the top-level domain .kg":".kg is sponsored by AsiaInfo Telecommunication Enterprise.","which organization runs the domain .studio":".studio is sponsored by Dog Beach, LLC.","who sponsors the top-level domain .family":".family is sponsored by Dog Beach, LLC.","name the sponsoring body of .wanggou":".wanggou is sponsored by Amazon Registry Services, Inc..","who sponsors the top-level domain .repair":".repair is sponsored by Binky Moon, LLC.","name the sponsoring body of .mx":".mx is sponsored by NIC-Mexico ITESM - Campus Monterrey.","who sponsors the top-level domain .tw":".tw is sponsored by Taiwan Network Information Center (TWNIC).","which organization runs the domain .us":".us is sponsored by Registry Services, LLC.","name the sponsoring body of .voyage":".voyage is sponsored by Binky Moon, LLC.","name the sponsoring body of .diet":".diet is sponsored by XYZ.COM LLC.","who sponsors the top-level domain .goog":".goog is sponsored by Charleston Road Registry Inc..","name the sponsoring body of .परीक्षा":".परीक्षा is sponsored by Not assigned.","who sponsors the top-level domain .bugatti":".bugatti is sponsored by Not assigned.","who sponsors the top-level domain .su":".su is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS).","which organization runs the domain .boots":".boots is sponsored by Not assigned.","name the sponsoring body of .kiwi":".kiwi is sponsored by DOT KIWI LIMITED.","name the sponsoring body of .sale":".sale is sponsored by Dog Beach, LLC.","who sponsors the top-level domain .mtr":".mtr is sponsored by MTR Corporation Limited.","who sponsors the top-level domain .rip":".rip is sponsored by Dog Beach, LLC.","which organization runs the domain .toyota":".toyota is sponsored by TOYOTA MOTOR CORPORATION.","which organization runs the domain .cal":".cal is sponsored by Charleston Road Registry Inc..","name the sponsoring body of .yt":".yt is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.).","name the sponsoring body of ‏.الاردن‎":"‏.الاردن‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE).","who sponsors the top-level domain .sport":".sport is sponsored by SportAccord.","name the sponsoring body of .arab":".arab is sponsored by League of Arab States.","name the sponsoring body of .guru":".guru is sponsored by Binky Moon, LLC.","which organization runs the domain .rwe":".rwe is sponsored by RWE AG.","name the sponsoring body of .hgtv":".hgtv is sponsored by Not assigned.","who sponsors the top-level domain .supply":".supply is sponsored by Binky Moon, LLC.","name the sponsoring body of .poker":".poker is sponsored by Identity Digital Limited.","which organization runs the domain .fujixerox":".fujixerox is sponsored by Not assigned.","which organization runs the domain .yodobashi":".yodobashi is sponsored by YODOBASHI CAMERA CO.,LTD..","which organization runs the domain .photography":".photography is sponsored by Binky Moon, LLC."}}},
{"id":"n-b9db76c5","guard":[["hasAny",["art","bauhaus","body","book","boots","cal","clubmed","computer","coop","deloitte","discover","fujixerox","hospital","im","iwc","juegos","ls","map","mv","pamperedchef","photography","rs","rwe","ryukyu","spa","sponsors","studio","study","surf","sv","tab","toyota","yodobashi","мон"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .भारत":".भारत is sponsored by National Internet Exchange of India.","who sponsors the top-level domain .ee":".ee is sponsored by Eesti Interneti Sihtasutus (EIS).","who sponsors the top-level domain .tiaa":".tiaa is sponsored by Teachers Insurance and Annuity Association of America.","who sponsors the top-level domain ‏.امارات‎":"‏.امارات‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA).","who sponsors the top-level domain .seat":".seat is sponsored by SEAT, S.A. (Sociedad Unipersonal).","which organization runs the domain .pamperedchef":".pamperedchef is sponsored by Not assigned.","who sponsors the top-level domain .asda":".asda is sponsored by Asda Stores Limited.","name the sponsoring body of .marriott":".marriott is sponsored by Marriott Worldwide Corporation.","name the sponsoring body of .express":".express is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .xyz":".xyz is sponsored by XYZ.COM LLC.","name the sponsoring body of .bar":".bar is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable.","which organization runs the domain .surf":".surf is sponsored by Registry Services, LLC.","who sponsors the top-level domain .ye":".ye is sponsored by TeleYemen.","who sponsors the top-level domain .sas":".sas is sponsored by Research IP LLC.","which organization runs the domain .ls":".ls is sponsored by Lesotho Network Information Centre Proprietary (LSNIC).","name the sponsoring body of .plumbing":".plumbing is sponsored by Binky Moon, LLC.","which organization runs the domain .study":".study is sponsored by Registry Services, LLC.","which organization runs the domain .sv":".sv is sponsored by SVNet.","which organization runs the domain .hospital":".hospital is sponsored by Binky Moon, LLC.","which organization runs the domain .мон":".мон is sponsored by Datacom Co.,Ltd.","who sponsors the top-level domain .works":".works is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .vivo":".vivo is sponsored by Telefonica Brasil S.A..","which organization runs the domain .im":".im is sponsored by Isle of Man Government.","which organization runs the domain .juegos":".juegos is sponsored by Dog Beach, LLC.","which organization runs the domain .computer":".computer is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .theater":".theater is sponsored by Binky Moon, LLC.","name the sponsoring body of .lifeinsurance":".lifeinsurance is sponsored by American Council of Life Insurers.","name the sponsoring body of .ci":".ci is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI).","which organization runs the domain .spa":".spa is sponsored by Asia Spa and Wellness Promotion Council Limited.","who sponsors the top-level domain .pt":".pt is sponsored by Associação DNS.PT.","name the sponsoring body of .forsale":".forsale is sponsored by Dog Beach, LLC.","which organization runs the domain .art":".art is sponsored by UK Creative Ideas Limited.","name the sponsoring body of .estate":".estate is sponsored by Binky Moon, LLC.","who sponsors the top-level domain .рус":".рус is sponsored by Rusnames Limited.","which organization runs the domain .deloitte":".deloitte is sponsored by Deloitte Touche Tohmatsu.","which organization runs the domain .rs":".rs is sponsored by Serbian National Internet Domain Registry (RNIDS).","who sponsors the top-level domain .sharp":".sharp is sponsored by Sharp Corporation.","who sponsors the top-level domain .la":".la is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications.","who sponsors the top-level domain .nikon":".nikon is sponsored by NIKON CORPORATION.","which organization runs the domain .book":".book is sponsored by Amazon Registry Services, Inc..","who sponsors the top-level domain .commbank":".commbank is sponsored by COMMONWEALTH BANK OF AUSTRALIA.","name the sponsoring body of .tv":".tv is sponsored by Ministry of Transport, Energy, Communications and Innovations.","who sponsors the top-level domain .avianca":".avianca is sponsored by Not assigned.","name the sponsoring body of .kred":".kred is sponsored by KredTLD Pty Ltd.","name the sponsoring body of .za":".za is sponsored by ZA Domain Name Authority.","which organization runs the domain .discover":".discover is sponsored by Discover Financial Services.","who sponsors the top-level domain .mk":".mk is sponsored by Macedonian Academic Research Network Skopje.","which organization runs the domain .mv":".mv is sponsored by Dhivehi Raajjeyge Gulhun PLC.","who sponsors the top-level domain .hyatt":".hyatt is sponsored by Hyatt GTLD, L.L.C..","name the sponsoring body of .hockey":".hockey is sponsored by Binky Moon, LLC.","which organization runs the domain .map":".map is sponsored by Charleston Road Registry Inc..","name the sponsoring body of .itau":".itau is sponsored by Itau Unibanco Holding S.A..","who sponsors the top-level domain .star":".star is sponsored by Star India Private Limited.","who sponsors the top-level domain .honeywell":".honeywell is sponsored by Not assigned.","name the sponsoring body of ‏.إختبار‎":"‏.إختبار‎ is sponsored by Not assigned.","name the sponsoring body of .fire":".fire is sponsored by Amazon Registry Services, Inc..","name the sponsoring body of .furniture":".furniture is sponsored by Binky Moon, LLC.","which organization runs the domain .clubmed":".clubmed is sponsored by Club Méditerranée S.A..","which organization runs the domain .iwc":".iwc is sponsored by Not assigned.","which organization runs the domain .coop":".coop is sponsored by DotCooperation LLC.","which organization runs the domain .tab":".tab is sponsored by Tabcorp Holdings Limited.","who sponsors the top-level domain .education":".education is sponsored by Binky Moon, LLC.","name the sponsoring body of .lacaixa":".lacaixa is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\".","which organization runs the domain .ryukyu":".ryukyu is sponsored by BRregistry, Inc..","which organization runs the domain .bauhaus":".bauhaus is sponsored by Werkhaus GmbH.","name the sponsoring body of .plus":".plus is sponsored by Binky Moon, LLC.","name the sponsoring body of .forum":".forum is sponsored by Fegistry, LLC.","who sponsors the top-level domain .kg":".kg is sponsored by AsiaInfo Telecommunication Enterprise.","which organization runs the domain .studio":".studio is sponsored by Dog Beach, LLC.","who sponsors the top-level domain .family":".family is sponsored by Dog Beach, LLC.","name the sponsoring body of .wanggou":".wanggou is sponsored by Amazon Registry Services, Inc..","who sponsors the top-level domain .repair":".repair is sponsored by Binky Moon, LLC.","name the sponsoring body of .mx":".mx is sponsored by NIC-Mexico ITESM - Campus Monterrey.","who sponsors the top-level domain .tw":".tw is sponsored by Taiwan Network Information Center (TWNIC).","which organization runs the domain .us":".us is sponsored by Registry Services, LLC.","name the sponsoring body of .voyage":".voyage is sponsored by Binky Moon, LLC.","name the sponsoring body of .diet":".diet is sponsored by XYZ.COM LLC.","who sponsors the top-level domain .goog":".goog is sponsored by Charleston Road Registry Inc..","name the sponsoring body of .परीक्षा":".परीक्षा is sponsored by Not assigned.","who sponsors the top-level domain .bugatti":".bugatti is sponsored by Not assigned.","who sponsors the top-level domain .su":".su is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS).","which organization runs the domain .boots":".boots is sponsored by Not assigned.","name the sponsoring body of .kiwi":".kiwi is sponsored by DOT KIWI LIMITED.","name the sponsoring body of .sale":".sale is sponsored by Dog Beach, LLC.","who sponsors the top-level domain .mtr":".mtr is sponsored by MTR Corporation Limited.","who sponsors the top-level domain .rip":".rip is sponsored by Dog Beach, LLC.","which organization runs the domain .toyota":".toyota is sponsored by TOYOTA MOTOR CORPORATION.","which organization runs the domain .cal":".cal is sponsored by Charleston Road Registry Inc..","name the sponsoring body of .yt":".yt is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.).","name the sponsoring body of ‏.الاردن‎":"‏.الاردن‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE).","who sponsors the top-level domain .sport":".sport is sponsored by SportAccord.","name the sponsoring body of .arab":".arab is sponsored by League of Arab States.","name the sponsoring body of .guru":".guru is sponsored by Binky Moon, LLC.","which organization runs the domain .rwe":".rwe is sponsored by RWE AG.","name the sponsoring body of .hgtv":".hgtv is sponsored by Not assigned.","who sponsors the top-level domain .supply":".supply is sponsored by Binky Moon, LLC.","name the sponsoring body of .poker":".poker is sponsored by Identity Digital Limited.","which organization runs the domain .fujixerox":".fujixerox is sponsored by Not assigned.","which organization runs the domain .yodobashi":".yodobashi is sponsored by YODOBASHI CAMERA CO.,LTD..","which organization runs the domain .photography":".photography is sponsored by Binky Moon, LLC."}}},
{"id":"n-59c566b6","guard":[["hasAny",["computer","education","estate","express","furniture","guru","hockey","hospital","photography","plumbing","plus","repair","supply","theater","voyage","works"]],["words<=",6],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Binky Moon, LLC."]},["sense.lastWord"]],"mem":null},
{"id":"n-1a45e838","guard":[["hasAny",["capitalise","capitalize","capitalize each word","computer","education","estate","express","furniture","guru","hockey","hospital","photography","plumbing","plus","repair","supply","theater","title case","voyage","works"]],["words<=",6],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Binky Moon, LLC."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-331a7c8b","guard":[["hasAny",["computer","education","estate","express","furniture","guru","hockey","hospital","invert case","photography","plumbing","plus","repair","supply","swap case","theater","toggle case","voyage","works"]],["words<=",6],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Binky Moon, LLC."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-131ef16a","guard":[["hasAny",["computer","each word","education","estate","express","furniture","guru","hockey","hospital","photography","plumbing","plus","repair","split into words","supply","theater","voyage","works"]],["words<=",6],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Binky Moon, LLC."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2ac9f10f","guard":[["hasAny",["computer","education","estate","express","furniture","guru","hockey","hospital","item number","nth","photography","plumbing","plus","position","repair","supply","theater","voyage","works"]],["words<=",6]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Binky Moon, LLC."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-703d0242","guard":[["hasAny",["computer","education","estate","express","furniture","guru","hockey","hospital","normalise","normalize","photography","plumbing","plus","repair","simplify the text","supply","theater","voyage","works"]],["words<=",6],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Binky Moon, LLC."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-aa297979","guard":[["hasAny",["computer","each word","education","estate","express","furniture","guru","hockey","hospital","photography","plumbing","plus","repair","split into words","supply","theater","voyage","works"]],["words<=",6],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Binky Moon, LLC."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ef6ba606","guard":[["hasAny",["computer","education","estate","express","furniture","guru","hockey","hospital","item number","nth","photography","plumbing","plus","position","repair","supply","theater","voyage","works"]],["words<=",6],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Binky Moon, LLC."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-80a6e701","guard":[["hasAny",["avianca","boots","bugatti","fujixerox","hgtv","honeywell","item number","iwc","nth","pamperedchef","position","إختبار","परकष"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Not assigned."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a7617fac","guard":[["hasAny",["avianca","boots","bugatti","fujixerox","hgtv","honeywell","item number","iwc","nth","pamperedchef","position","إختبار","परकष"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Not assigned."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-c493a594","guard":[["hasAny",["avianca","boots","bugatti","fujixerox","hgtv","honeywell","item number","iwc","nth","pamperedchef","position","إختبار","परकष"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Not assigned."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e89fdec5","guard":[["hasAny",["avianca","boots","bugatti","fujixerox","hgtv","honeywell","item number","iwc","nth","pamperedchef","position","إختبار","परकष"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Not assigned."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-1d63e64d","guard":[["hasAny",["avianca","boots","bugatti","fujixerox","hgtv","honeywell","iwc","pamperedchef","إختبار"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Not assigned."]},["sense.lastWord"]],"mem":null},
{"id":"n-781f1c8f","guard":[["hasAny",["avianca","boots","bugatti","fujixerox","hgtv","honeywell","iwc","pamperedchef","إختبار"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Not assigned."]},["sense.lastWord"]],"mem":null},
{"id":"n-1a09012f","guard":[["hasAny",["avianca","boots","bugatti","fujixerox","hgtv","honeywell","invert case","iwc","pamperedchef","swap case","toggle case","إختبار"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Not assigned."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-259eb5f2","guard":[["hasAny",["avianca","boots","bugatti","fujixerox","hgtv","honeywell","invert case","iwc","pamperedchef","swap case","toggle case","إختبار"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Not assigned."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-28228070","guard":[["hasAny",["avianca","boots","bugatti","capitalise","capitalize","capitalize each word","fujixerox","hgtv","honeywell","iwc","pamperedchef","title case","إختبار"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Not assigned."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-971497ba","guard":[["hasAny",["avianca","boots","bugatti","capitalise","capitalize","capitalize each word","fujixerox","hgtv","honeywell","iwc","pamperedchef","title case","إختبار"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Not assigned."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-376f8833","guard":[["hasAny",["avianca","boots","bugatti","fujixerox","hgtv","honeywell","iwc","normalise","normalize","pamperedchef","simplify the text","إختبار"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Not assigned."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-547e0042","guard":[["hasAny",["avianca","boots","bugatti","fujixerox","hgtv","honeywell","iwc","normalise","normalize","pamperedchef","simplify the text","إختبار"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Not assigned."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-57aaca92","guard":[["hasAny",["avianca","boots","bugatti","each word","fujixerox","hgtv","honeywell","iwc","pamperedchef","split into words","إختبار"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Not assigned."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8d33b5b8","guard":[["hasAny",["avianca","boots","bugatti","each word","fujixerox","hgtv","honeywell","iwc","pamperedchef","split into words","إختبار"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Not assigned."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a91c350e","guard":[["hasAny",["avianca","boots","bugatti","each word","fujixerox","hgtv","honeywell","iwc","pamperedchef","split into words","إختبار"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Not assigned."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f8ab4811","guard":[["hasAny",["avianca","boots","bugatti","each word","fujixerox","hgtv","honeywell","iwc","pamperedchef","split into words","إختبار"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Not assigned."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-44ee9854","guard":[["hasAny",["delete","estate","express","furniture","guru","hockey","plumbing","plus","remove","strip out","voyage","without"]],["has","sponsoring"]],"pyramid":["render.str",["transform.remove",{"lit":"Binky Moon, LLC"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-640ae4fb","guard":[["hasAny",["computer","delete","education","hospital","photography","remove","repair","strip out","supply","theater","without","works"]],["words<=",6]],"pyramid":["render.str",["transform.remove",{"lit":"Binky Moon, LLC"},["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-1496a1f1","guard":[["hasAny",["each word","estate","express","furniture","guru","hockey","plumbing","plus","split into words","voyage","words"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Binky Moon, LLC."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-b8cfe3cf","guard":[["hasAny",["computer","each word","education","hospital","photography","repair","split into words","supply","theater","words","works"]],["words<=",6]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Binky Moon, LLC."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-5db6a5f7","guard":[["hasAny",["avianca","boots","bugatti","delete","fujixerox","honeywell","iwc","pamperedchef","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Not assigned"},["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-694a2a0f","guard":[["hasAny",["avianca","boots","bugatti","each word","fujixerox","honeywell","iwc","pamperedchef","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Not assigned."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-e75be51a","guard":[["hasAny",["family","forsale","juegos","rip","sale","studio"]],["not",["has","girl"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dog Beach, LLC."]},["sense.lastWord"]],"mem":null},
{"id":"n-42f9c1cf","guard":[["hasAny",["capitalise","capitalize","capitalize each word","family","forsale","juegos","rip","sale","studio","title case"]],["not",["has","girl"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dog Beach, LLC."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e6d998ba","guard":[["hasAny",["family","forsale","invert case","juegos","rip","sale","studio","swap case","toggle case"]],["not",["has","girl"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dog Beach, LLC."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1422b366","guard":[["hasAny",["each word","family","forsale","juegos","rip","sale","split into words","studio"]],["not",["has","girl"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dog Beach, LLC."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-31d90a0b","guard":[["hasAny",["each word","family","forsale","juegos","rip","sale","split into words","studio"]],["not",["has","girl"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dog Beach, LLC."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-48ce597d","guard":[["hasAny",["family","forsale","item number","juegos","nth","position","rip","sale","studio"]],["not",["has","girl"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dog Beach, LLC."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9547d9d8","guard":[["hasAny",["family","forsale","juegos","normalise","normalize","rip","sale","simplify the text","studio"]],["not",["has","girl"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dog Beach, LLC."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-f8940cc8","guard":[["hasAny",["family","forsale","item number","juegos","nth","position","rip","sale","studio"]],["not",["has","girl"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dog Beach, LLC."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-381f5b32","guard":[["hasAny",["delete","family","juegos","remove","rip","strip out","studio","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Dog Beach, LLC"},["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-a4c073cb","guard":[["hasAny",["each word","family","juegos","rip","split into words","studio","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dog Beach, LLC."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-02fe0e26","guard":[["hasAny",["study","surf","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["sense.lastWord"]],"mem":null},
{"id":"n-2fc34f34","guard":[["hasAny",["book","fire","wanggou"]],["has","the"],["not",["has","for"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Amazon Registry Services, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-93960593","guard":[["hasAny",["body","domain"]]],"pyramid":["render.str",["memory.lookup",["sense.roman"]]],"mem":{"table":{"ci":".ci is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI).","mv":".mv is sponsored by Dhivehi Raajjeyge Gulhun PLC.","mx":".mx is sponsored by NIC-Mexico ITESM - Campus Monterrey."}}},
{"id":"n-e77ae283","guard":[["hasAny",["cal","goog","map"]],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Charleston Road Registry Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-3388c478","guard":[["hasAny",["cal","goog","invert case","map","swap case","toggle case"]],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Charleston Road Registry Inc.."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-61f38a05","guard":[["hasAny",["book","capitalise","capitalize","capitalize each word","fire","title case","wanggou"]],["has","the"],["not",["has","for"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Amazon Registry Services, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-837d5f22","guard":[["hasAny",["capitalise","capitalize","capitalize each word","study","surf","title case","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9d6efda3","guard":[["hasAny",["invert case","study","surf","swap case","toggle case","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c9167616","guard":[["hasAny",["book","fire","invert case","swap case","toggle case","wanggou"]],["has","the"],["not",["has","for"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Amazon Registry Services, Inc.."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f1de168c","guard":[["hasAny",["cal","capitalise","capitalize","capitalize each word","goog","map","title case"]],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Charleston Road Registry Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0db5af28","guard":[["hasAny",["book","fire","item number","nth","position","wanggou"]],["has","the"],["not",["has","for"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Amazon Registry Services, Inc.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-25f6cda0","guard":[["hasAny",["normalise","normalize","simplify the text","study","surf","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2d3f3e6c","guard":[["hasAny",["cal","goog","item number","map","nth","position"]],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Charleston Road Registry Inc.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-48d21c67","guard":[["hasAny",["book","each word","fire","split into words","wanggou"]],["has","the"],["not",["has","for"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Amazon Registry Services, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5581ea67","guard":[["hasAny",["book","fire","normalise","normalize","simplify the text","wanggou"]],["has","the"],["not",["has","for"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Amazon Registry Services, Inc.."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5a30529f","guard":[["hasAny",["delete","hgtv","remove","strip out","without","إختبار","परकष"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"Not assigned"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-63667f02","guard":[["hasAny",["cal","each word","goog","map","split into words"]],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Charleston Road Registry Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7bf70a03","guard":[["hasAny",["book","each word","fire","split into words","wanggou"]],["has","the"],["not",["has","for"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Amazon Registry Services, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9f026548","guard":[["hasAny",["each word","split into words","study","surf","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a44ba106","guard":[["hasAny",["cal","goog","map","normalise","normalize","simplify the text"]],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Charleston Road Registry Inc.."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-b5124f61","guard":[["hasAny",["cal","each word","goog","map","split into words"]],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Charleston Road Registry Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bdabd918","guard":[["hasAny",["cal","delete","goog","map","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Charleston Road Registry Inc."},["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-e6364a92","guard":[["hasAny",["each word","split into words","study","surf","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ed26c21d","guard":[["hasAny",["book","fire","item number","nth","position","wanggou"]],["has","the"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Amazon Registry Services, Inc.."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f0a57eb1","guard":[["hasAny",["delete","remove","strip out","study","surf","us","without"]],["has","organization"]],"pyramid":["render.str",["transform.remove",{"lit":"Registry Services, LLC"},["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-f9222333","guard":[["hasAny",["item number","nth","position","study","surf","us"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-fc82f2df","guard":[["hasAny",["cal","goog","item number","map","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Charleston Road Registry Inc.."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-df7e45ab","guard":[["hasAny",["each word","split into words","study","surf","us","words"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-e4c611a2","guard":[["hasAny",["cal","each word","goog","map","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Charleston Road Registry Inc.."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-74642c7b","guard":[["hasAny",["diet","xyz"]],["not",["has","company"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by XYZ.COM LLC."]},["sense.lastWord"]],"mem":null},
{"id":"n-5877da66","guard":[["hasAny",["diet","invert case","swap case","toggle case","xyz"]],["not",["has","company"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by XYZ.COM LLC."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6c215f9e","guard":[["hasAny",["nikon","sharp"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-7ad2eec9","guard":[["hasAny",["nikon","sharp"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-872c0f69","guard":[["hasAny",["capitalise","capitalize","capitalize each word","diet","title case","xyz"]],["not",["has","company"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by XYZ.COM LLC."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-15b0af6c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nikon","sharp","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-38e5d0a2","guard":[["hasAny",["diet","normalise","normalize","simplify the text","xyz"]],["not",["has","company"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by XYZ.COM LLC."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5c6be88c","guard":[["hasAny",["invert case","nikon","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6bed5619","guard":[["hasAny",["diet","item number","nth","position","xyz"]],["not",["has","company"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by XYZ.COM LLC."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-744ebb3a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nikon","sharp","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-82f66a68","guard":[["hasAny",["delete","fire","remove","strip out","wanggou","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Amazon Registry Services, Inc."},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-bcb796a1","guard":[["hasAny",["invert case","nikon","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e4ba205c","guard":[["hasAny",["diet","each word","split into words","xyz"]],["not",["has","company"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by XYZ.COM LLC."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e6d760a2","guard":[["hasAny",["diet","each word","split into words","xyz"]],["not",["has","company"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by XYZ.COM LLC."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f54fbaf2","guard":[["hasAny",["diet","item number","nth","position","xyz"]],["not",["has","company"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by XYZ.COM LLC."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f6a13e91","guard":[["hasAny",["item number","nth","position","study","surf"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Registry Services, LLC."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fed21c2f","guard":[["hasAny",["delete","forsale","remove","sale","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Dog Beach, LLC"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-05252836","guard":[["hasAny",["item number","nikon","nth","position","sharp"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-060b2a24","guard":[["hasAny",["each word","nikon","sharp","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0edeb0d4","guard":[["hasAny",["item number","nikon","nth","position","sharp"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-20805872","guard":[["hasAny",["each word","forsale","sale","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dog Beach, LLC."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-3d2d442d","guard":[["hasAny",["each word","hgtv","split into words","words","إختبار"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Not assigned."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-561ef18d","guard":[["hasAny",["nikon","normalise","normalize","sharp","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5a2aba4a","guard":[["hasAny",["each word","hgtv","split into words","words","إختبار"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Not assigned."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-8dbe7f18","guard":[["hasAny",["each word","nikon","sharp","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-93b30a5f","guard":[["hasAny",["nikon","normalise","normalize","sharp","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-a23a5ae6","guard":[["hasAny",["each word","fire","split into words","wanggou","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Amazon Registry Services, Inc.."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-bd605fa0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","nikon","sharp","swap case","title case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c673b612","guard":[["hasAny",["item number","nikon","nth","position","sharp"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d253191f","guard":[["hasAny",["invert case","nikon","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-da716ee6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","nikon","sharp","swap case","title case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e525b512","guard":[["hasAny",["each word","nikon","sharp","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-eedbe251","guard":[["hasAny",["invert case","nikon","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f05dbbe4","guard":[["hasAny",["each word","nikon","sharp","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f92c3868","guard":[["hasAny",["item number","nikon","nth","position","sharp"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-05808a86","guard":[["hasAny",["each word","invert case","nikon","sharp","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0e7b9ef9","guard":[["hasAny",["each word","invert case","nikon","sharp","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1318b91a","guard":[["hasAny",["each word","invert case","nikon","sharp","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1567a0aa","guard":[["hasAny",["invert case","nikon","normalise","normalize","sharp","simplify the text","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-27dcca4f","guard":[["hasAny",["invert case","nikon","normalise","normalize","sharp","simplify the text","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3cc485ec","guard":[["hasAny",["each word","nikon","sharp","split into words","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-3e33a6ef","guard":[["hasAny",["each word","invert case","nikon","sharp","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6e83b218","guard":[["hasAny",["invert case","item number","nikon","nth","position","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9cd9d372","guard":[["hasAny",["invert case","item number","nikon","nth","position","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ba42e4c5","guard":[["hasAny",["invert case","item number","nikon","nth","position","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c30b65d2","guard":[["hasAny",["each word","nikon","sharp","split into words","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-fc3b1865","guard":[["hasAny",["invert case","item number","nikon","nth","position","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3b9c5221","guard":[["hasAny",["each word","invert case","nikon","sharp","split into words","swap case","toggle case","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6eb3f142","guard":[["hasAny",["each word","invert case","nikon","sharp","split into words","swap case","toggle case","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CORPORATION."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-00677578","guard":[["has","xyz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .xyz":".xyz is sponsored by XYZ.COM LLC."}}},
{"id":"n-02b2c8a7","guard":[["hasAny",["computer","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .computer":".computer is sponsored by Binky Moon, LLC."}}},
{"id":"n-0565e664","guard":[["hasAny",["domain","nikon","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .nikon":".nikon is sponsored by NIKON CORPORATION."}}},
{"id":"n-05ca27dc","guard":[["hasAny",["body","name","sponsoring","إختبار"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of ‏.إختبار‎":"‏.إختبار‎ is sponsored by Not assigned."}}},
{"id":"n-0610e456","guard":[["has","art"],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by UK Creative Ideas Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-071186c7","guard":[["has","परकष"],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["sense.lastWord"]],"mem":null},
{"id":"n-089316e3","guard":[["hasAny",["domain","sponsors","sport","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .sport":".sport is sponsored by SportAccord."}}},
{"id":"n-08bedc26","guard":[["has","sv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .sv":".sv is sponsored by SVNet."}}},
{"id":"n-098a13b4","guard":[["hasAny",["domain","ls","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .ls":".ls is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."}}},
{"id":"n-0b8fa0d9","guard":[["has","ci"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .ci":".ci is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI)."}}},
{"id":"n-0bc4ea2a","guard":[["has","coop"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .coop":".coop is sponsored by DotCooperation LLC."}}},
{"id":"n-0c2a548f","guard":[["hasAny",["domain","goog","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .goog":".goog is sponsored by Charleston Road Registry Inc.."}}},
{"id":"n-0d2660f0","guard":[["hasAny",["domain","organization","runs","мон"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .мон":".мон is sponsored by Datacom Co.,Ltd."}}},
{"id":"n-0d3e36a1","guard":[["hasAny",["domain","organization","pamperedchef","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .pamperedchef":".pamperedchef is sponsored by Not assigned."}}},
{"id":"n-0f231bec","guard":[["hasAny",["domain","hospital","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .hospital":".hospital is sponsored by Binky Moon, LLC."}}},
{"id":"n-0f675698","guard":[["has","art"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .art":".art is sponsored by UK Creative Ideas Limited."}}},
{"id":"n-0fe1dd13","guard":[["has","map"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .map":".map is sponsored by Charleston Road Registry Inc.."}}},
{"id":"n-1140c632","guard":[["hasAny",["body","estate","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .estate":".estate is sponsored by Binky Moon, LLC."}}},
{"id":"n-134888b5","guard":[["has","discover"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .discover":".discover is sponsored by Discover Financial Services."}}},
{"id":"n-1397f3b7","guard":[["hasAny",["body","lifeinsurance","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .lifeinsurance":".lifeinsurance is sponsored by American Council of Life Insurers."}}},
{"id":"n-13bac96e","guard":[["hasAny",["domain","sharp","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .sharp":".sharp is sponsored by Sharp Corporation."}}},
{"id":"n-1555aa72","guard":[["has","рус"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .рус":".рус is sponsored by Rusnames Limited."}}},
{"id":"n-15b83f8b","guard":[["hasAny",["body","name","sponsoring","tv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .tv":".tv is sponsored by Ministry of Transport, Energy, Communications and Innovations."}}},
{"id":"n-164c636e","guard":[["has","امارات"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain ‏.امارات‎":"‏.امارات‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."}}},
{"id":"n-171de3e9","guard":[["hasAny",["body","kiwi","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .kiwi":".kiwi is sponsored by DOT KIWI LIMITED."}}},
{"id":"n-172201a1","guard":[["has","su"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS)."]},["sense.lastWord"]],"mem":null},
{"id":"n-176ef2d9","guard":[["has","express"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .express":".express is sponsored by Binky Moon, LLC."}}},
{"id":"n-187a18c4","guard":[["has","hockey"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .hockey":".hockey is sponsored by Binky Moon, LLC."}}},
{"id":"n-1930f6fa","guard":[["hasAny",["domain","hyatt","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .hyatt":".hyatt is sponsored by Hyatt GTLD, L.L.C.."}}},
{"id":"n-1b391edd","guard":[["hasAny",["bauhaus","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .bauhaus":".bauhaus is sponsored by Werkhaus GmbH."}}},
{"id":"n-1b8ef012","guard":[["has","asda"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asda Stores Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-1c93b52d","guard":[["hasAny",["arab","body","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .arab":".arab is sponsored by League of Arab States."}}},
{"id":"n-1cc8103f","guard":[["hasAny",["avianca","domain","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .avianca":".avianca is sponsored by Not assigned."}}},
{"id":"n-1f68bc43","guard":[["has","repair"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .repair":".repair is sponsored by Binky Moon, LLC."}}},
{"id":"n-2035c998","guard":[["hasAny",["body","name","poker","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .poker":".poker is sponsored by Identity Digital Limited."}}},
{"id":"n-20af41e7","guard":[["has","wanggou"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .wanggou":".wanggou is sponsored by Amazon Registry Services, Inc.."}}},
{"id":"n-21b39c38","guard":[["has","marriott"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .marriott":".marriott is sponsored by Marriott Worldwide Corporation."}}},
{"id":"n-22287b7a","guard":[["has","الاردن"]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE)."]},["sense.lastWord"]],"mem":null},
{"id":"n-2231b095","guard":[["has","ee"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["sense.lastWord"]],"mem":null},
{"id":"n-22e097cc","guard":[["has","estate"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .estate":".estate is sponsored by Binky Moon, LLC."}}},
{"id":"n-27ac6821","guard":[["has","tab"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Tabcorp Holdings Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-283c97ee","guard":[["has","hospital"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .hospital":".hospital is sponsored by Binky Moon, LLC."}}},
{"id":"n-284b2e9c","guard":[["hasAny",["body","kred","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .kred":".kred is sponsored by KredTLD Pty Ltd."}}},
{"id":"n-2ab19597","guard":[["has","rwe"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by RWE AG."]},["sense.lastWord"]],"mem":null},
{"id":"n-2ae69ce4","guard":[["has","itau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .itau":".itau is sponsored by Itau Unibanco Holding S.A.."}}},
{"id":"n-2b52e260","guard":[["has","ye"],["has","who"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .ye":".ye is sponsored by TeleYemen."}}},
{"id":"n-2bc276dd","guard":[["has","ls"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."]},["sense.lastWord"]],"mem":null},
{"id":"n-2bf653e6","guard":[["has","tab"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .tab":".tab is sponsored by Tabcorp Holdings Limited."}}},
{"id":"n-2cbe390d","guard":[["has","pt"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.PT."]},["sense.lastWord"]],"mem":null},
{"id":"n-2db16a6c","guard":[["has","photography"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .photography":".photography is sponsored by Binky Moon, LLC."}}},
{"id":"n-2f7387f1","guard":[["has","hyatt"],["has","who"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .hyatt":".hyatt is sponsored by Hyatt GTLD, L.L.C.."}}},
{"id":"n-2f7818a7","guard":[["hasAny",["body","name","sponsoring","wanggou"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .wanggou":".wanggou is sponsored by Amazon Registry Services, Inc.."}}},
{"id":"n-30687fe7","guard":[["has","theater"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .theater":".theater is sponsored by Binky Moon, LLC."}}},
{"id":"n-307526c3","guard":[["hasAny",["body","name","plumbing","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .plumbing":".plumbing is sponsored by Binky Moon, LLC."}}},
{"id":"n-314ee40e","guard":[["has","diet"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .diet":".diet is sponsored by XYZ.COM LLC."}}},
{"id":"n-324a587b","guard":[["has","za"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ZA Domain Name Authority."]},["sense.lastWord"]],"mem":null},
{"id":"n-32bdae8b","guard":[["has","yodobashi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .yodobashi":".yodobashi is sponsored by YODOBASHI CAMERA CO.,LTD.."}}},
{"id":"n-332c54be","guard":[["hasAny",["discover","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .discover":".discover is sponsored by Discover Financial Services."}}},
{"id":"n-35cc6828","guard":[["hasAny",["body","express","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .express":".express is sponsored by Binky Moon, LLC."}}},
{"id":"n-36b2dc3e","guard":[["has","sas"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["sense.lastWord"]],"mem":null},
{"id":"n-3a81415c","guard":[["has","tiaa"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["sense.lastWord"]],"mem":null},
{"id":"n-3ac1d55f","guard":[["has","computer"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .computer":".computer is sponsored by Binky Moon, LLC."}}},
{"id":"n-3babf534","guard":[["hasAny",["domain","sponsors","star","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .star":".star is sponsored by Star India Private Limited."}}},
{"id":"n-3d383791","guard":[["has","surf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .surf":".surf is sponsored by Registry Services, LLC."}}},
{"id":"n-3d46a2e0","guard":[["hasAny",["body","forsale","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .forsale":".forsale is sponsored by Dog Beach, LLC."}}},
{"id":"n-3e5af22b","guard":[["has","voyage"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .voyage":".voyage is sponsored by Binky Moon, LLC."}}},
{"id":"n-4156cf3b","guard":[["has","star"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .star":".star is sponsored by Star India Private Limited."}}},
{"id":"n-42355289","guard":[["has","toyota"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .toyota":".toyota is sponsored by TOYOTA MOTOR CORPORATION."}}},
{"id":"n-4526c3b5","guard":[["hasAny",["domain","ee","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .ee":".ee is sponsored by Eesti Interneti Sihtasutus (EIS)."}}},
{"id":"n-470e6a69","guard":[["hasAny",["asda","domain","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .asda":".asda is sponsored by Asda Stores Limited."}}},
{"id":"n-47afdd8c","guard":[["has","bauhaus"],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["sense.lastWord"]],"mem":null},
{"id":"n-4815e2b5","guard":[["has","fire"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .fire":".fire is sponsored by Amazon Registry Services, Inc.."}}},
{"id":"n-48d6352f","guard":[["hasAny",["book","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .book":".book is sponsored by Amazon Registry Services, Inc.."}}},
{"id":"n-48d7fe0d","guard":[["has","ryukyu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .ryukyu":".ryukyu is sponsored by BRregistry, Inc.."}}},
{"id":"n-4a773b31","guard":[["has","mk"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["sense.lastWord"]],"mem":null},
{"id":"n-4a995f62","guard":[["has","juegos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .juegos":".juegos is sponsored by Dog Beach, LLC."}}},
{"id":"n-4aa7b315","guard":[["has","sharp"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Sharp Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-4ac04cb0","guard":[["has","tw"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["sense.lastWord"]],"mem":null},
{"id":"n-4ae31ce6","guard":[["has","परकष"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .परीक्षा":".परीक्षा is sponsored by Not assigned."}}},
{"id":"n-4bc682dc","guard":[["has","bar"],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable."]},["sense.lastWord"]],"mem":null},
{"id":"n-4be65c19","guard":[["hasAny",["body","name","sponsoring","za"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .za":".za is sponsored by ZA Domain Name Authority."}}},
{"id":"n-4befc7f5","guard":[["has","commbank"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["sense.lastWord"]],"mem":null},
{"id":"n-4d354f80","guard":[["has","kred"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["sense.lastWord"]],"mem":null},
{"id":"n-4f3baf14","guard":[["has","poker"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .poker":".poker is sponsored by Identity Digital Limited."}}},
{"id":"n-50d11d42","guard":[["hasAny",["domain","organization","runs","toyota"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .toyota":".toyota is sponsored by TOYOTA MOTOR CORPORATION."}}},
{"id":"n-544a091b","guard":[["hasAny",["domain","family","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .family":".family is sponsored by Dog Beach, LLC."}}},
{"id":"n-54d3641f","guard":[["has","goog"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .goog":".goog is sponsored by Charleston Road Registry Inc.."}}},
{"id":"n-54d7aded","guard":[["hasAny",["domain","sponsors","su","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .su":".su is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS)."}}},
{"id":"n-55d2cc69","guard":[["has","भरत"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .भारत":".भारत is sponsored by National Internet Exchange of India."}}},
{"id":"n-55fc6087","guard":[["hasAny",["body","diet","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .diet":".diet is sponsored by XYZ.COM LLC."}}},
{"id":"n-5799d3c7","guard":[["has","la"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["sense.lastWord"]],"mem":null},
{"id":"n-57ad6ed8","guard":[["has","nikon"],["has","who"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .nikon":".nikon is sponsored by NIKON CORPORATION."}}},
{"id":"n-585b5b5f","guard":[["has","plumbing"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .plumbing":".plumbing is sponsored by Binky Moon, LLC."}}},
{"id":"n-5a984bc9","guard":[["hasAny",["domain","sponsors","toplevel","xyz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .xyz":".xyz is sponsored by XYZ.COM LLC."}}},
{"id":"n-5b01315f","guard":[["hasAny",["domain","sponsors","toplevel","ye"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .ye":".ye is sponsored by TeleYemen."}}},
{"id":"n-5bede046","guard":[["has","spa"],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia Spa and Wellness Promotion Council Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-5c21fda0","guard":[["hasAny",["domain","pt","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .pt":".pt is sponsored by Associação DNS.PT."}}},
{"id":"n-5c551848","guard":[["has","iwc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .iwc":".iwc is sponsored by Not assigned."}}},
{"id":"n-5c99161b","guard":[["has","ci"],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI)."]},["sense.lastWord"]],"mem":null},
{"id":"n-5e29a38e","guard":[["has","arab"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .arab":".arab is sponsored by League of Arab States."}}},
{"id":"n-5ec56fe2","guard":[["has","ye"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["sense.lastWord"]],"mem":null},
{"id":"n-5f88990e","guard":[["has","boots"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .boots":".boots is sponsored by Not assigned."}}},
{"id":"n-6091847b","guard":[["hasAny",["domain","sponsors","toplevel","tw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .tw":".tw is sponsored by Taiwan Network Information Center (TWNIC)."}}},
{"id":"n-610aa11c","guard":[["hasAny",["body","marriott","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .marriott":".marriott is sponsored by Marriott Worldwide Corporation."}}},
{"id":"n-616d893d","guard":[["hasAny",["body","hockey","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .hockey":".hockey is sponsored by Binky Moon, LLC."}}},
{"id":"n-61d73f93","guard":[["hasAny",["domain","seat","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .seat":".seat is sponsored by SEAT, S.A. (Sociedad Unipersonal)."}}},
{"id":"n-62d415d8","guard":[["has","rs"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Serbian National Internet Domain Registry (RNIDS)."]},["sense.lastWord"]],"mem":null},
{"id":"n-64985dca","guard":[["hasAny",["domain","organization","runs","yodobashi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .yodobashi":".yodobashi is sponsored by YODOBASHI CAMERA CO.,LTD.."}}},
{"id":"n-660f32d1","guard":[["hasAny",["body","lacaixa","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .lacaixa":".lacaixa is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."}}},
{"id":"n-66171966","guard":[["has","lacaixa"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["sense.lastWord"]],"mem":null},
{"id":"n-6843dd65","guard":[["has","fujixerox"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .fujixerox":".fujixerox is sponsored by Not assigned."}}},
{"id":"n-68bce8a5","guard":[["hasAny",["domain","sponsors","toplevel","vivo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .vivo":".vivo is sponsored by Telefonica Brasil S.A.."}}},
{"id":"n-695d5e76","guard":[["has","yt"],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["sense.lastWord"]],"mem":null},
{"id":"n-69f6a315","guard":[["has","hyatt"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Hyatt GTLD, L.L.C.."]},["sense.lastWord"]],"mem":null},
{"id":"n-6e156bf9","guard":[["has","rip"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .rip":".rip is sponsored by Dog Beach, LLC."}}},
{"id":"n-6f2d0524","guard":[["hasAny",["domain","fujixerox","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .fujixerox":".fujixerox is sponsored by Not assigned."}}},
{"id":"n-6f386627","guard":[["hasAny",["deloitte","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .deloitte":".deloitte is sponsored by Deloitte Touche Tohmatsu."}}},
{"id":"n-6f84a66e","guard":[["hasAny",["domain","la","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .la":".la is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."}}},
{"id":"n-6fe14745","guard":[["has","lacaixa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .lacaixa":".lacaixa is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."}}},
{"id":"n-700ad76c","guard":[["hasAny",["body","name","sale","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .sale":".sale is sponsored by Dog Beach, LLC."}}},
{"id":"n-702ae9df","guard":[["hasAny",["domain","mtr","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .mtr":".mtr is sponsored by MTR Corporation Limited."}}},
{"id":"n-70cc973e","guard":[["hasAny",["body","name","sponsoring","voyage"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .voyage":".voyage is sponsored by Binky Moon, LLC."}}},
{"id":"n-714cc7bf","guard":[["hasAny",["body","furniture","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .furniture":".furniture is sponsored by Binky Moon, LLC."}}},
{"id":"n-7203071b","guard":[["has","lifeinsurance"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by American Council of Life Insurers."]},["sense.lastWord"]],"mem":null},
{"id":"n-72db3950","guard":[["has","coop"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DotCooperation LLC."]},["sense.lastWord"]],"mem":null},
{"id":"n-72e5337d","guard":[["has","ryukyu"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-7324762f","guard":[["hasAny",["art","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .art":".art is sponsored by UK Creative Ideas Limited."}}},
{"id":"n-745c2b38","guard":[["has","forum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .forum":".forum is sponsored by Fegistry, LLC."}}},
{"id":"n-7605349d","guard":[["has","rs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .rs":".rs is sponsored by Serbian National Internet Domain Registry (RNIDS)."}}},
{"id":"n-76b6b6fc","guard":[["has","itau"],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Itau Unibanco Holding S.A.."]},["sense.lastWord"]],"mem":null},
{"id":"n-76ec3a1f","guard":[["has","bar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .bar":".bar is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable."}}},
{"id":"n-78b654e0","guard":[["has","kg"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by AsiaInfo Telecommunication Enterprise."]},["sense.lastWord"]],"mem":null},
{"id":"n-78d15c71","guard":[["has","мон"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["sense.lastWord"]],"mem":null},
{"id":"n-790ee98f","guard":[["has","guru"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .guru":".guru is sponsored by Binky Moon, LLC."}}},
{"id":"n-797998dc","guard":[["has","forsale"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .forsale":".forsale is sponsored by Dog Beach, LLC."}}},
{"id":"n-7b8e47cb","guard":[["hasAny",["body","mx","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .mx":".mx is sponsored by NIC-Mexico ITESM - Campus Monterrey."}}},
{"id":"n-7c658398","guard":[["has","sport"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SportAccord."]},["sense.lastWord"]],"mem":null},
{"id":"n-7c8c87b0","guard":[["has","furniture"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .furniture":".furniture is sponsored by Binky Moon, LLC."}}},
{"id":"n-7cccb7bb","guard":[["has","avianca"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .avianca":".avianca is sponsored by Not assigned."}}},
{"id":"n-7f4cfd2c","guard":[["hasAny",["domain","organization","runs","tab"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .tab":".tab is sponsored by Tabcorp Holdings Limited."}}},
{"id":"n-80ef7896","guard":[["hasAny",["domain","organization","runs","rwe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .rwe":".rwe is sponsored by RWE AG."}}},
{"id":"n-81319bb1","guard":[["has","kred"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .kred":".kred is sponsored by KredTLD Pty Ltd."}}},
{"id":"n-82a16626","guard":[["has","mtr"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by MTR Corporation Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-8304a844","guard":[["hasAny",["domain","organization","runs","study"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .study":".study is sponsored by Registry Services, LLC."}}},
{"id":"n-83eef493","guard":[["has","rwe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .rwe":".rwe is sponsored by RWE AG."}}},
{"id":"n-8465bc26","guard":[["hasAny",["domain","organization","photography","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .photography":".photography is sponsored by Binky Moon, LLC."}}},
{"id":"n-8540b4c5","guard":[["has","star"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Star India Private Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-8647c231","guard":[["has","pamperedchef"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .pamperedchef":".pamperedchef is sponsored by Not assigned."}}},
{"id":"n-878895e5","guard":[["hasAny",["body","name","sponsoring","الاردن"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of ‏.الاردن‎":"‏.الاردن‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE)."}}},
{"id":"n-88793492","guard":[["has","forum"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fegistry, LLC."]},["sense.lastWord"]],"mem":null},
{"id":"n-89293bc6","guard":[["has","mv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .mv":".mv is sponsored by Dhivehi Raajjeyge Gulhun PLC."}}},
{"id":"n-8a385cfc","guard":[["hasAny",["domain","repair","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .repair":".repair is sponsored by Binky Moon, LLC."}}},
{"id":"n-8aefad5d","guard":[["has","lifeinsurance"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .lifeinsurance":".lifeinsurance is sponsored by American Council of Life Insurers."}}},
{"id":"n-8f3d35ca","guard":[["has","commbank"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .commbank":".commbank is sponsored by COMMONWEALTH BANK OF AUSTRALIA."}}},
{"id":"n-90c0e61b","guard":[["has","sale"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .sale":".sale is sponsored by Dog Beach, LLC."}}},
{"id":"n-91eebe18","guard":[["has","mx"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by NIC-Mexico ITESM - Campus Monterrey."]},["sense.lastWord"]],"mem":null},
{"id":"n-93888476","guard":[["has","bugatti"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .bugatti":".bugatti is sponsored by Not assigned."}}},
{"id":"n-971f8cd9","guard":[["has","marriott"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Marriott Worldwide Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-973034b7","guard":[["has","ls"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .ls":".ls is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."}}},
{"id":"n-9ba7b420","guard":[["hasAny",["bar","body","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .bar":".bar is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable."}}},
{"id":"n-9cb59448","guard":[["hasAny",["domain","organization","runs","surf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .surf":".surf is sponsored by Registry Services, LLC."}}},
{"id":"n-9e3a84eb","guard":[["hasAny",["domain","honeywell","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .honeywell":".honeywell is sponsored by Not assigned."}}},
{"id":"n-9e47e18c","guard":[["hasAny",["cal","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .cal":".cal is sponsored by Charleston Road Registry Inc.."}}},
{"id":"n-9f03a908","guard":[["hasAny",["domain","mk","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .mk":".mk is sponsored by Macedonian Academic Research Network Skopje."}}},
{"id":"n-a002738d","guard":[["has","امارات"]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["sense.lastWord"]],"mem":null},
{"id":"n-a021490d","guard":[["has","clubmed"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Club Méditerranée S.A.."]},["sense.lastWord"]],"mem":null},
{"id":"n-a0493cc7","guard":[["has","mtr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .mtr":".mtr is sponsored by MTR Corporation Limited."}}},
{"id":"n-a074fc93","guard":[["has","sv"],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SVNet."]},["sense.lastWord"]],"mem":null},
{"id":"n-a28513dd","guard":[["has","family"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .family":".family is sponsored by Dog Beach, LLC."}}},
{"id":"n-a29b00bb","guard":[["has","cal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .cal":".cal is sponsored by Charleston Road Registry Inc.."}}},
{"id":"n-a3b9817d","guard":[["hasAny",["domain","rip","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .rip":".rip is sponsored by Dog Beach, LLC."}}},
{"id":"n-a3e1b3e9","guard":[["hasAny",["domain","sponsors","supply","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .supply":".supply is sponsored by Binky Moon, LLC."}}},
{"id":"n-a647b559","guard":[["has","nikon"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by NIKON CORPORATION."]},["sense.lastWord"]],"mem":null},
{"id":"n-a80915ab","guard":[["hasAny",["domain","organization","runs","spa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .spa":".spa is sponsored by Asia Spa and Wellness Promotion Council Limited."}}},
{"id":"n-a8dcc56a","guard":[["has","deloitte"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .deloitte":".deloitte is sponsored by Deloitte Touche Tohmatsu."}}},
{"id":"n-a9e1bd34","guard":[["has","bauhaus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .bauhaus":".bauhaus is sponsored by Werkhaus GmbH."}}},
{"id":"n-af4dd05c","guard":[["hasAny",["domain","sponsors","toplevel","works"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .works":".works is sponsored by Binky Moon, LLC."}}},
{"id":"n-b069be52","guard":[["hasAny",["domain","organization","runs","ryukyu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .ryukyu":".ryukyu is sponsored by BRregistry, Inc.."}}},
{"id":"n-b0dc5e8d","guard":[["has","мон"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .мон":".мон is sponsored by Datacom Co.,Ltd."}}},
{"id":"n-b1d4e58d","guard":[["has","honeywell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .honeywell":".honeywell is sponsored by Not assigned."}}},
{"id":"n-b3fde3f9","guard":[["has","discover"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Discover Financial Services."]},["sense.lastWord"]],"mem":null},
{"id":"n-b47c1b30","guard":[["hasAny",["domain","organization","runs","sv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .sv":".sv is sponsored by SVNet."}}},
{"id":"n-b4bfb2df","guard":[["has","ee"],["has","who"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .ee":".ee is sponsored by Eesti Interneti Sihtasutus (EIS)."}}},
{"id":"n-b52a7e9f","guard":[["has","الاردن"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of ‏.الاردن‎":"‏.الاردن‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE)."}}},
{"id":"n-b5a5b7bf","guard":[["has","asda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .asda":".asda is sponsored by Asda Stores Limited."}}},
{"id":"n-b6026b7d","guard":[["has","kiwi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .kiwi":".kiwi is sponsored by DOT KIWI LIMITED."}}},
{"id":"n-b881db14","guard":[["hasAny",["body","hgtv","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .hgtv":".hgtv is sponsored by Not assigned."}}},
{"id":"n-b8bf3997","guard":[["has","education"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .education":".education is sponsored by Binky Moon, LLC."}}},
{"id":"n-b8c35203","guard":[["has","arab"],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of Arab States."]},["sense.lastWord"]],"mem":null},
{"id":"n-ba42cfeb","guard":[["has","tw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .tw":".tw is sponsored by Taiwan Network Information Center (TWNIC)."}}},
{"id":"n-bb33d4b9","guard":[["hasAny",["body","name","plus","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .plus":".plus is sponsored by Binky Moon, LLC."}}},
{"id":"n-bc84d1e9","guard":[["has","kg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .kg":".kg is sponsored by AsiaInfo Telecommunication Enterprise."}}},
{"id":"n-be69c17f","guard":[["hasAny",["domain","mv","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .mv":".mv is sponsored by Dhivehi Raajjeyge Gulhun PLC."}}},
{"id":"n-bf106d4b","guard":[["has","tiaa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .tiaa":".tiaa is sponsored by Teachers Insurance and Annuity Association of America."}}},
{"id":"n-bfb6ec4d","guard":[["has","pt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .pt":".pt is sponsored by Associação DNS.PT."}}},
{"id":"n-c013e94d","guard":[["has","sas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .sas":".sas is sponsored by Research IP LLC."}}},
{"id":"n-c09175ae","guard":[["has","mv"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["sense.lastWord"]],"mem":null},
{"id":"n-c0e8ba9b","guard":[["has","study"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .study":".study is sponsored by Registry Services, LLC."}}},
{"id":"n-c1abfd5f","guard":[["has","deloitte"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Deloitte Touche Tohmatsu."]},["sense.lastWord"]],"mem":null},
{"id":"n-c23fff19","guard":[["has","works"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .works":".works is sponsored by Binky Moon, LLC."}}},
{"id":"n-c50c88c1","guard":[["hasAny",["domain","sas","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .sas":".sas is sponsored by Research IP LLC."}}},
{"id":"n-c62484a5","guard":[["hasAny",["domain","juegos","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .juegos":".juegos is sponsored by Dog Beach, LLC."}}},
{"id":"n-c7b1df7a","guard":[["hasAny",["body","ci","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .ci":".ci is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI)."}}},
{"id":"n-c7ffba45","guard":[["hasAny",["domain","organization","runs","studio"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .studio":".studio is sponsored by Dog Beach, LLC."}}},
{"id":"n-c99f4dc9","guard":[["has","mx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .mx":".mx is sponsored by NIC-Mexico ITESM - Campus Monterrey."}}},
{"id":"n-c9c436d0","guard":[["has","toyota"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TOYOTA MOTOR CORPORATION."]},["sense.lastWord"]],"mem":null},
{"id":"n-cad8a088","guard":[["has","za"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .za":".za is sponsored by ZA Domain Name Authority."}}},
{"id":"n-cc3e32e2","guard":[["has","yt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .yt":".yt is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."}}},
{"id":"n-ccaf6e31","guard":[["hasAny",["body","name","sponsoring","भरत"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .भारत":".भारत is sponsored by National Internet Exchange of India."}}},
{"id":"n-cd5ba671","guard":[["has","рус"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-ce290896","guard":[["hasAny",["domain","kg","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .kg":".kg is sponsored by AsiaInfo Telecommunication Enterprise."}}},
{"id":"n-ce5e3635","guard":[["has","supply"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .supply":".supply is sponsored by Binky Moon, LLC."}}},
{"id":"n-d0b9a48c","guard":[["hasAny",["commbank","domain","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .commbank":".commbank is sponsored by COMMONWEALTH BANK OF AUSTRALIA."}}},
{"id":"n-d0ccbb8c","guard":[["has","la"],["has","who"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .la":".la is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."}}},
{"id":"n-d255425a","guard":[["hasAny",["domain","sponsors","theater","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .theater":".theater is sponsored by Binky Moon, LLC."}}},
{"id":"n-d31716e4","guard":[["has","tv"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["sense.lastWord"]],"mem":null},
{"id":"n-d414a90c","guard":[["hasAny",["coop","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .coop":".coop is sponsored by DotCooperation LLC."}}},
{"id":"n-d492ff47","guard":[["hasAny",["body","fire","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .fire":".fire is sponsored by Amazon Registry Services, Inc.."}}},
{"id":"n-d49a5fe9","guard":[["hasAny",["body","itau","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .itau":".itau is sponsored by Itau Unibanco Holding S.A.."}}},
{"id":"n-d56a5c0c","guard":[["has","vivo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .vivo":".vivo is sponsored by Telefonica Brasil S.A.."}}},
{"id":"n-d5c67a6d","guard":[["has","kiwi"],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT KIWI LIMITED."]},["sense.lastWord"]],"mem":null},
{"id":"n-d6ee1ab5","guard":[["hasAny",["boots","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .boots":".boots is sponsored by Not assigned."}}},
{"id":"n-daf97fcb","guard":[["hasAny",["bugatti","domain","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .bugatti":".bugatti is sponsored by Not assigned."}}},
{"id":"n-db1122e8","guard":[["hasAny",["domain","sponsors","toplevel","امارات"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain ‏.امارات‎":"‏.امارات‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."}}},
{"id":"n-dda4062b","guard":[["hasAny",["domain","map","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .map":".map is sponsored by Charleston Road Registry Inc.."}}},
{"id":"n-df86fb73","guard":[["has","poker"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Identity Digital Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-e13e8beb","guard":[["has","studio"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .studio":".studio is sponsored by Dog Beach, LLC."}}},
{"id":"n-e14adc6f","guard":[["hasAny",["domain","sponsors","toplevel","рус"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .рус":".рус is sponsored by Rusnames Limited."}}},
{"id":"n-e3266d30","guard":[["has","su"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .su":".su is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS)."}}},
{"id":"n-e39d6192","guard":[["has","sharp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .sharp":".sharp is sponsored by Sharp Corporation."}}},
{"id":"n-e431bab1","guard":[["hasAny",["body","forum","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .forum":".forum is sponsored by Fegistry, LLC."}}},
{"id":"n-e489c540","guard":[["has","إختبار"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of ‏.إختبار‎":"‏.إختبار‎ is sponsored by Not assigned."}}},
{"id":"n-e5130792","guard":[["hasAny",["domain","education","sponsors","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .education":".education is sponsored by Binky Moon, LLC."}}},
{"id":"n-ec0f602a","guard":[["has","hgtv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .hgtv":".hgtv is sponsored by Not assigned."}}},
{"id":"n-ec83b6c1","guard":[["has","tv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .tv":".tv is sponsored by Ministry of Transport, Energy, Communications and Innovations."}}},
{"id":"n-ed695786","guard":[["hasAny",["domain","sponsors","tiaa","toplevel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .tiaa":".tiaa is sponsored by Teachers Insurance and Annuity Association of America."}}},
{"id":"n-f09b3109","guard":[["has","spa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .spa":".spa is sponsored by Asia Spa and Wellness Promotion Council Limited."}}},
{"id":"n-f12ca27b","guard":[["hasAny",["body","name","sponsoring","परकष"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .परीक्षा":".परीक्षा is sponsored by Not assigned."}}},
{"id":"n-f5a69a0b","guard":[["hasAny",["body","name","sponsoring","yt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .yt":".yt is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."}}},
{"id":"n-f5bae580","guard":[["hasAny",["domain","iwc","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .iwc":".iwc is sponsored by Not assigned."}}},
{"id":"n-f60444f9","guard":[["has","clubmed"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .clubmed":".clubmed is sponsored by Club Méditerranée S.A.."}}},
{"id":"n-f7486410","guard":[["has","vivo"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Telefonica Brasil S.A.."]},["sense.lastWord"]],"mem":null},
{"id":"n-f8c33b32","guard":[["hasAny",["domain","organization","rs","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .rs":".rs is sponsored by Serbian National Internet Domain Registry (RNIDS)."}}},
{"id":"n-f9a5a346","guard":[["has","mk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .mk":".mk is sponsored by Macedonian Academic Research Network Skopje."}}},
{"id":"n-f9c424bc","guard":[["hasAny",["body","guru","name","sponsoring"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .guru":".guru is sponsored by Binky Moon, LLC."}}},
{"id":"n-faeb556c","guard":[["has","plus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the sponsoring body of .plus":".plus is sponsored by Binky Moon, LLC."}}},
{"id":"n-fb12499a","guard":[["has","yodobashi"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by YODOBASHI CAMERA CO.,LTD.."]},["sense.lastWord"]],"mem":null},
{"id":"n-fb690943","guard":[["has","seat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .seat":".seat is sponsored by SEAT, S.A. (Sociedad Unipersonal)."}}},
{"id":"n-fb6cf4e5","guard":[["has","book"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which organization runs the domain .book":".book is sponsored by Amazon Registry Services, Inc.."}}},
{"id":"n-fc0e2669","guard":[["has","sport"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"who sponsors the top-level domain .sport":".sport is sponsored by SportAccord."}}},
{"id":"n-fe462e50","guard":[["hasAny",["clubmed","domain","organization","runs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which organization runs the domain .clubmed":".clubmed is sponsored by Club Méditerranée S.A.."}}},
{"id":"n-ffff9c3a","guard":[["has","भरत"]],"pyramid":["render.template",{"lit":[".भा",{"slot":0}," is sponsored by National Internet Exchange of India."]},["sense.lastWord"]],"mem":null},
{"id":"n-03598e63","guard":[["hasAny",["invert case","su","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS)."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-03b4bb47","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ci","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-04ace8c5","guard":[["hasAny",["arab","invert case","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".arab is sponsored by League of ",{"slot":0}," States."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0553f143","guard":[["hasAny",["invert case","swap case","toggle case","tv"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-09f23b1f","guard":[["hasAny",["invert case","rwe","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".rwe is sponsored by ",{"slot":0}," AG."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0d905c82","guard":[["hasAny",["bauhaus","capitalise","capitalize","capitalize each word","title case"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0d99536f","guard":[["hasAny",["invert case","swap case","toggle case","tw"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0e5ad599","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","الاردن"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1120417c","guard":[["hasAny",["invert case","swap case","tiaa","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-11db6d14","guard":[["hasAny",["invert case","lacaixa","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1229e4f4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","poker","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Identity Digital Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-13a57e9c","guard":[["hasAny",["invert case","nikon","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".nikon is sponsored by ",{"slot":0}," CORPORATION."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-13ea9418","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tab","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Tabcorp Holdings Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-15b4c7d2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lifeinsurance","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by American Council of Life Insurers."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-17c8456e","guard":[["hasAny",["invert case","ls","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1ce00211","guard":[["has","toyota"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-1d4afaff","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","भरत"]]],"pyramid":["render.template",{"lit":[".भा",{"slot":0}," is sponsored by National Internet Exchange of India."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2265f039","guard":[["hasAny",["art","invert case","swap case","toggle case"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by UK Creative Ideas Limited."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-22c85f04","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mk","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2412e3b6","guard":[["has","asda"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-25f10d83","guard":[["has","itau"],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-25f918e5","guard":[["hasAny",["invert case","sas","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2ddb6426","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lacaixa","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2fe8cdd5","guard":[["hasAny",["ee","invert case","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-31af7d44","guard":[["has","hyatt"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-324422cd","guard":[["hasAny",["invert case","swap case","toggle case","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-36807664","guard":[["hasAny",["invert case","swap case","toggle case","рус"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3a61e2ef","guard":[["hasAny",["invert case","swap case","toggle case","toyota"]]],"pyramid":["render.template",{"lit":[".toyota is sponsored by ",{"slot":0}," MOTOR CORPORATION."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3aec56ad","guard":[["hasAny",["bar","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3c0ab75c","guard":[["has","kiwi"],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-41d67f29","guard":[["hasAny",["commbank","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4290e56e","guard":[["hasAny",["discover","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".discover is sponsored by ",{"slot":0}," Financial Services."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-434a44fa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","yt"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4357a212","guard":[["has","star"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-43a708b6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sas","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-43f1ffd5","guard":[["hasAny",["ci","invert case","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI)."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-456059a2","guard":[["hasAny",["ci","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI)."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-458900b3","guard":[["has","pt"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-45ce93bf","guard":[["has","spa"],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-45fe2c34","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sport","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SportAccord."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-492e35bc","guard":[["hasAny",["invert case","swap case","tab","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Tabcorp Holdings Limited."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-495448ef","guard":[["hasAny",["mx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by NIC-Mexico ITESM - Campus Monterrey."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-49bc9d5a","guard":[["hasAny",["no vowels","remove vowels","without vowels","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-4aabe940","guard":[["hasAny",["invert case","swap case","toggle case","امارات"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4d0ddd62","guard":[["hasAny",["invert case","lifeinsurance","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by American Council of Life Insurers."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4f4c487d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","forum","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fegistry, LLC."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5013ae19","guard":[["has","arab"],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-509151be","guard":[["has","za"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-5382090b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5578601d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","la","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-55b43998","guard":[["hasAny",["capitalise","capitalize","capitalize each word","coop","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DotCooperation LLC."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-56b7e976","guard":[["hasAny",["invert case","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".star is sponsored by ",{"slot":0}," India Private Limited."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-56ca20b2","guard":[["hasAny",["art","capitalise","capitalize","capitalize each word","title case"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by UK Creative Ideas Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-586752fd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","commbank","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-58a7a974","guard":[["hasAny",["coop","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DotCooperation LLC."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-593b5b9b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kred","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5ac2f437","guard":[["hasAny",["bauhaus","invert case","swap case","toggle case"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5ea8b7f7","guard":[["hasAny",["invert case","itau","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".itau is sponsored by ",{"slot":0}," Unibanco Holding S.A.."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5ecfd278","guard":[["hasAny",["bar","invert case","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-621e99e2","guard":[["has","mtr"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-640e2606","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ryukyu","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-64bfd0b6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ls","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6710806e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mv","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-68ec088f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-68f740e2","guard":[["hasAny",["invert case","la","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6bef3783","guard":[["hasAny",["alphabetize the letters","letters in order","sort the letters","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-6d7d8504","guard":[["hasAny",["invert case","pt","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".pt is sponsored by Associação DNS.",{"slot":0},"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-714e5037","guard":[["hasAny",["shortest","shortest one","shortest word","tv"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-757d816d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tv"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-757dd240","guard":[["hasAny",["invert case","kred","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7fda4340","guard":[["has","rwe"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-818251fa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","рус"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-818c7192","guard":[["hasAny",["invert case","swap case","toggle case","мон"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-82aa6ab5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clubmed","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Club Méditerranée S.A.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-85ee661d","guard":[["hasAny",["invert case","kg","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by AsiaInfo Telecommunication Enterprise."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-86791fff","guard":[["hasAny",["invert case","swap case","toggle case","الاردن"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE)."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-879402a5","guard":[["hasAny",["invert case","swap case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".yodobashi is sponsored by ",{"slot":0}," CAMERA CO.,LTD.."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8c120693","guard":[["has","deloitte"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-8c9d86d4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sv","title case"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SVNet."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8d2fd39d","guard":[["hasAny",["invert case","swap case","toggle case","za"]]],"pyramid":["render.template",{"lit":[".za is sponsored by ",{"slot":0}," Domain Name Authority."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8e86d27b","guard":[["has","marriott"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-8f87183b","guard":[["hasAny",["invert case","spa","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".spa is sponsored by Asia ",{"slot":0}," and Wellness Promotion Council Limited."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-970f4374","guard":[["hasAny",["forum","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fegistry, LLC."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9a41d4b6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","su","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9f65590c","guard":[["hasAny",["invert case","marriott","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".marriott is sponsored by ",{"slot":0}," Worldwide Corporation."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a4dd2681","guard":[["hasAny",["hyatt","invert case","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".hyatt is sponsored by ",{"slot":0}," GTLD, L.L.C.."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a69e0bbc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tw"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-af1dab58","guard":[["hasAny",["invert case","sport","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SportAccord."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b137d918","guard":[["has","xyz"],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-b24ed2a5","guard":[["hasAny",["invert case","mv","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b34d6c33","guard":[["hasAny",["invert case","swap case","toggle case","भरत"]]],"pyramid":["render.template",{"lit":[".भा",{"slot":0}," is sponsored by National Internet Exchange of India."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b4c824c3","guard":[["hasAny",["backwards","reversed","spell backwards","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["transform.reverse",["sense.lastWord"]]],"mem":null},
{"id":"n-b54b88eb","guard":[["hasAny",["invert case","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".xyz is sponsored by ",{"slot":0},".COM LLC."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b65e2bf6","guard":[["hasAny",["invert case","swap case","toggle case","yt"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b9661a48","guard":[["hasAny",["bar","capitalise","capitalize","capitalize each word","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bdbc7278","guard":[["hasAny",["invert case","swap case","toggle case","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c19b0781","guard":[["hasAny",["deloitte","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".deloitte is sponsored by ",{"slot":0}," Touche Tohmatsu."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c7b3b604","guard":[["hasAny",["invert case","mtr","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".mtr is sponsored by ",{"slot":0}," Corporation Limited."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c878adae","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","мон"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d0994299","guard":[["hasAny",["invert case","poker","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Identity Digital Limited."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d1d31ffd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ee","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d381d269","guard":[["hasAny",["clubmed","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Club Méditerranée S.A.."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d3d3cb61","guard":[["hasAny",["invert case","sv","swap case","toggle case"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SVNet."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-daa50e12","guard":[["hasAny",["invert case","ryukyu","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-dcd06e0c","guard":[["hasAny",["invert case","mx","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by NIC-Mexico ITESM - Campus Monterrey."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-de186760","guard":[["hasAny",["invert case","mk","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-df5d8d78","guard":[["has","discover"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-e6531b84","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rs","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Serbian National Internet Domain Registry (RNIDS)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e6f2ae2d","guard":[["has","yodobashi"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-e9eb4cef","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mx","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by NIC-Mexico ITESM - Campus Monterrey."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ed291a68","guard":[["hasAny",["invert case","rs","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Serbian National Internet Domain Registry (RNIDS)."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f22cff2c","guard":[["hasAny",["invert case","kiwi","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".kiwi is sponsored by DOT ",{"slot":0}," LIMITED."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f2947fe8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","امارات"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f403a90a","guard":[["hasAny",["no vowels","remove vowels","without vowels","भरत"]]],"pyramid":["render.template",{"lit":[".भा",{"slot":0}," is sponsored by National Internet Exchange of India."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-f84f1065","guard":[["hasAny",["invert case","sharp","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".sharp is sponsored by ",{"slot":0}," Corporation."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-fa8ce5d7","guard":[["hasAny",["shortest","shortest one","shortest word","yt"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fd30af64","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tiaa","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fda9d670","guard":[["hasAny",["asda","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".asda is sponsored by ",{"slot":0}," Stores Limited."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-fdd7dc3b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kg","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by AsiaInfo Telecommunication Enterprise."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0158f113","guard":[["hasAny",["item number","nth","position","tab"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Tabcorp Holdings Limited."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-02a45a60","guard":[["hasAny",["item number","nth","position","ryukyu"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-03593ad1","guard":[["hasAny",["normalise","normalize","simplify the text","yt"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-046592e1","guard":[["hasAny",["item number","nth","position","sv"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SVNet."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-04b95658","guard":[["hasAny",["each word","split into words","tab"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Tabcorp Holdings Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0bb0e3c3","guard":[["hasAny",["each word","split into words","рус"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0fc1f88d","guard":[["hasAny",["bar","each word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-127df36d","guard":[["hasAny",["normalise","normalize","sas","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-146e7394","guard":[["hasAny",["each word","la","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-16866867","guard":[["hasAny",["each word","split into words","भरत"]]],"pyramid":["render.template",{"lit":[".भा",{"slot":0}," is sponsored by National Internet Exchange of India."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-17b48648","guard":[["hasAny",["item number","mk","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-17fec1a6","guard":[["hasAny",["bar","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-18eef723","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1a4544bb","guard":[["hasAny",["item number","nth","poker","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Identity Digital Limited."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-1ac2828a","guard":[["hasAny",["item number","mx","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by NIC-Mexico ITESM - Campus Monterrey."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1c5a4fff","guard":[["hasAny",["each word","split into words","امارات"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1cf9dcce","guard":[["hasAny",["each word","mx","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by NIC-Mexico ITESM - Campus Monterrey."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-206982c0","guard":[["hasAny",["coop","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DotCooperation LLC."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2115602e","guard":[["hasAny",["delete","remove","strip out","without","xyz"]]],"pyramid":["render.str",["transform.remove",{"lit":"XYZ.COM LLC"},["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-2257725a","guard":[["hasAny",["commbank","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-23b40162","guard":[["hasAny",["book","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Amazon Registry Services, Inc."},["sense.after",{"lit":"domain"}]]],"mem":null},
{"id":"n-2412cc8f","guard":[["hasAny",["each word","split into words","yt"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-24574c3b","guard":[["hasAny",["item number","nth","position","sport"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SportAccord."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-24dd2be4","guard":[["hasAny",["each word","split into words","yt"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-26501f55","guard":[["hasAny",["commbank","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-269268bd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","itau","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-272b6149","guard":[["hasAny",["ls","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-27d4477f","guard":[["hasAny",["each word","kred","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-27d7c8b8","guard":[["hasAny",["discover","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-293b9922","guard":[["hasAny",["item number","mv","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2a1f5e1f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pt","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2ab2d5d2","guard":[["hasAny",["kg","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by AsiaInfo Telecommunication Enterprise."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2b7deefa","guard":[["hasAny",["item number","kred","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2c9bc5f5","guard":[["hasAny",["each word","split into words","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2f38971d","guard":[["hasAny",["item number","nth","position","sport"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SportAccord."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2f40eb62","guard":[["hasAny",["item number","nth","position","الاردن"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-2fe873b3","guard":[["hasAny",["ee","normalise","normalize","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-304fd0c6","guard":[["hasAny",["coop","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DotCooperation LLC."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-30a05947","guard":[["hasAny",["each word","poker","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Identity Digital Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-31571aae","guard":[["hasAny",["item number","la","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-328aeab1","guard":[["hasAny",["each word","split into words","الاردن"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-364ae9f6","guard":[["hasAny",["each word","ls","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-379cb89a","guard":[["hasAny",["ci","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-3a69e6e3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","discover","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3ae2183b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","star","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3d34edb9","guard":[["hasAny",["lacaixa","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-3dca0a18","guard":[["hasAny",["item number","nth","position","ryukyu"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-3e4b239f","guard":[["hasAny",["commbank","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3ed156fa","guard":[["hasAny",["each word","split into words","امارات"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3f6a34fd","guard":[["hasAny",["ci","each word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3f7039dd","guard":[["hasAny",["normalise","normalize","simplify the text","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-432afde2","guard":[["hasAny",["each word","mv","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4542dada","guard":[["hasAny",["each word","poker","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Identity Digital Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-48c29235","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mtr","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-497001d1","guard":[["hasAny",["invert case","spa","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-49d5c933","guard":[["hasAny",["item number","nth","position","рус"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-4a919b48","guard":[["hasAny",["art","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by UK Creative Ideas Limited."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4b73e6a4","guard":[["hasAny",["each word","ee","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4c900022","guard":[["hasAny",["invert case","mtr","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4f4f8775","guard":[["hasAny",["normalise","normalize","ryukyu","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-4f846749","guard":[["hasAny",["art","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by UK Creative Ideas Limited."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-500ee9cc","guard":[["hasAny",["art","normalise","normalize","simplify the text"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by UK Creative Ideas Limited."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-50a86e29","guard":[["hasAny",["commbank","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-52d08989","guard":[["hasAny",["invert case","swap case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-56082814","guard":[["hasAny",["item number","nth","position","tiaa"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5616ddd9","guard":[["hasAny",["each word","split into words","su"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-57519372","guard":[["hasAny",["each word","kred","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-58badf07","guard":[["hasAny",["normalise","normalize","simplify the text","tab"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Tabcorp Holdings Limited."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-59647340","guard":[["hasAny",["each word","sas","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5a7bebcd","guard":[["hasAny",["kred","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5c21f42b","guard":[["hasAny",["invert case","swap case","toggle case","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5cd683ca","guard":[["hasAny",["each word","split into words","sv"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SVNet."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5e07f17e","guard":[["hasAny",["each word","rs","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Serbian National Internet Domain Registry (RNIDS)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5edef768","guard":[["hasAny",["ee","item number","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-5f4e59fb","guard":[["hasAny",["each word","mk","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6093de1e","guard":[["hasAny",["clubmed","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Club Méditerranée S.A.."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-60d1e2e2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hyatt","title case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-614d74e5","guard":[["hasAny",["item number","nth","position","su"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-627f199a","guard":[["hasAny",["invert case","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-62815dfe","guard":[["hasAny",["each word","split into words","мон"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-64f46240","guard":[["hasAny",["item number","lifeinsurance","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by American Council of Life Insurers."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-65ee64ad","guard":[["hasAny",["item number","nth","position","yt"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-6918ce57","guard":[["hasAny",["art","each word","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by UK Creative Ideas Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-69a0afd7","guard":[["hasAny",["bauhaus","normalise","normalize","simplify the text"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-69a82b76","guard":[["hasAny",["each word","lifeinsurance","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by American Council of Life Insurers."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6a26547b","guard":[["hasAny",["item number","nth","position","su"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS)."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6a83c0cb","guard":[["hasAny",["ci","each word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6a8dc6d9","guard":[["hasAny",["coop","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DotCooperation LLC."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6aa31dfc","guard":[["hasAny",["ci","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI)."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6b83f3bc","guard":[["hasAny",["each word","ls","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6bb025cc","guard":[["hasAny",["arab","invert case","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6c68bfbb","guard":[["hasAny",["bar","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6c92a392","guard":[["hasAny",["item number","nth","position","рус"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6e31e7e2","guard":[["hasAny",["clubmed","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Club Méditerranée S.A.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-70afce3f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","spa","title case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-72739360","guard":[["hasAny",["item number","nth","position","tv"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-72eeb1b6","guard":[["hasAny",["item number","lifeinsurance","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by American Council of Life Insurers."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-736860f9","guard":[["hasAny",["each word","split into words","tw"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-754bc1e7","guard":[["hasAny",["shortest","shortest one","shortest word","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7979100d","guard":[["hasAny",["item number","nth","position","امارات"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-7bc6c14f","guard":[["hasAny",["each word","ee","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7bdaeb76","guard":[["hasAny",["clubmed","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Club Méditerranée S.A.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-7c408ce5","guard":[["hasAny",["each word","split into words","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7c92767f","guard":[["hasAny",["normalise","normalize","simplify the text","sport"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SportAccord."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-7d20a457","guard":[["hasAny",["bauhaus","each word","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7e008351","guard":[["hasAny",["item number","nth","position","امارات"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7e9065d8","guard":[["hasAny",["each word","ryukyu","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7ecc5601","guard":[["hasAny",["asda","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8182ae8d","guard":[["hasAny",["normalise","normalize","poker","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Identity Digital Limited."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-81baa82f","guard":[["hasAny",["normalise","normalize","rs","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Serbian National Internet Domain Registry (RNIDS)."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-829319e5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","marriott","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-82a20277","guard":[["hasAny",["each word","lifeinsurance","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by American Council of Life Insurers."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8428453a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kiwi","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-850f7dc0","guard":[["hasAny",["item number","nth","poker","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Identity Digital Limited."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-85b044e1","guard":[["hasAny",["item number","nth","position","tab"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Tabcorp Holdings Limited."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8630991d","guard":[["hasAny",["clubmed","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Club Méditerranée S.A.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-881ffba0","guard":[["hasAny",["invert case","itau","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8a94c51b","guard":[["hasAny",["item number","nth","position","الاردن"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE)."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8acbe498","guard":[["hasAny",["each word","kg","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by AsiaInfo Telecommunication Enterprise."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8bf8540d","guard":[["hasAny",["forum","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fegistry, LLC."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-91a23406","guard":[["hasAny",["normalise","normalize","simplify the text","tv"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-95b2bc8f","guard":[["hasAny",["ee","item number","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-961c584c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-97500efc","guard":[["hasAny",["each word","split into words","tab"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Tabcorp Holdings Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-990736c7","guard":[["hasAny",["each word","split into words","рус"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-99da4360","guard":[["hasAny",["normalise","normalize","simplify the text","tw"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-99f42ba4","guard":[["hasAny",["item number","nth","position","tiaa"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-9a0fc7ed","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","toyota"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9b364503","guard":[["hasAny",["each word","rs","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Serbian National Internet Domain Registry (RNIDS)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9b816784","guard":[["hasAny",["bauhaus","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9b850a91","guard":[["hasAny",["item number","ls","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9cb85abd","guard":[["hasAny",["item number","ls","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-9fa2b039","guard":[["hasAny",["each word","split into words","tv"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a2e673c1","guard":[["hasAny",["item number","nth","position","tw"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a513e5c3","guard":[["hasAny",["item number","mx","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by NIC-Mexico ITESM - Campus Monterrey."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-a7ad8805","guard":[["hasAny",["each word","split into words","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a7b49b9c","guard":[["hasAny",["each word","split into words","भरत"]]],"pyramid":["render.template",{"lit":[".भा",{"slot":0}," is sponsored by National Internet Exchange of India."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a8029787","guard":[["hasAny",["item number","lacaixa","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-a877642b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","deloitte","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-aae5b7cf","guard":[["hasAny",["invert case","kiwi","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-aae5d923","guard":[["hasAny",["each word","split into words","sport"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SportAccord."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ab6d69b4","guard":[["hasAny",["each word","sas","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ac694010","guard":[["hasAny",["item number","nth","position","rs"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Serbian National Internet Domain Registry (RNIDS)."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-aeddc2c6","guard":[["hasAny",["asda","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-aff6f37b","guard":[["hasAny",["ci","normalise","normalize","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Autorité de Régulation des Télécommunications/TIC de Côte d’lvoire (ARTCI)."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-b00cdd80","guard":[["hasAny",["item number","nth","position","мон"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-b12953cf","guard":[["hasAny",["item number","kg","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by AsiaInfo Telecommunication Enterprise."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b17558af","guard":[["hasAny",["item number","nth","position","sas"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-b22617da","guard":[["hasAny",["each word","la","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b31e47d3","guard":[["hasAny",["item number","kred","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-b712effa","guard":[["hasAny",["item number","kg","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by AsiaInfo Telecommunication Enterprise."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-b73d2519","guard":[["hasAny",["deloitte","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ba224ee9","guard":[["hasAny",["each word","split into words","tv"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bbc8a795","guard":[["hasAny",["invert case","pt","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bc52f74a","guard":[["hasAny",["arab","capitalise","capitalize","capitalize each word","title case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bd53bf19","guard":[["hasAny",["item number","lacaixa","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bd5ea081","guard":[["hasAny",["bar","normalise","normalize","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-bd6df9f1","guard":[["hasAny",["clubmed","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Club Méditerranée S.A.."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-be45a1b6","guard":[["hasAny",["each word","forum","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fegistry, LLC."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bee7ebb8","guard":[["hasAny",["item number","nth","position","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-bf4fbab2","guard":[["hasAny",["coop","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DotCooperation LLC."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-c21a5e4d","guard":[["hasAny",["item number","mv","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-c37c14e7","guard":[["hasAny",["normalise","normalize","simplify the text","su"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS)."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-c3eaa356","guard":[["hasAny",["invert case","marriott","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c3f1c564","guard":[["hasAny",["invert case","swap case","toggle case","toyota"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c5236969","guard":[["hasAny",["mv","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-c6aa351d","guard":[["hasAny",["each word","split into words","sv"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SVNet."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c8e3c09b","guard":[["hasAny",["commbank","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c92c903e","guard":[["hasAny",["mx","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by NIC-Mexico ITESM - Campus Monterrey."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-c9412773","guard":[["hasAny",["normalise","normalize","simplify the text","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-c9a589b1","guard":[["hasAny",["abbreviate","acronym","seat"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SEAT, ",{"slot":1},".A. (Sociedad Unipersonal)."]},["sense.lastWord"],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-ca8bf046","guard":[["hasAny",["item number","nth","position","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cab710af","guard":[["hasAny",["item number","nth","position","мон"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cb09fbad","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cd322212","guard":[["hasAny",["each word","ryukyu","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ce790598","guard":[["hasAny",["normalise","normalize","simplify the text","tiaa"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d0ba9a20","guard":[["hasAny",["normalise","normalize","simplify the text","рус"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d1e78011","guard":[["hasAny",["invert case","rwe","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d3a28e14","guard":[["hasAny",["each word","split into words","परकष"]],["has","name"]],"pyramid":["render.template",{"lit":[".परीक्",{"slot":0},"ा is sponsored by Not assigned."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d41980ba","guard":[["hasAny",["each word","split into words","tw"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d4965a32","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rwe","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d5f0cee4","guard":[["hasAny",["item number","nth","position","sas"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d876e96e","guard":[["hasAny",["each word","mx","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by NIC-Mexico ITESM - Campus Monterrey."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d983036f","guard":[["hasAny",["item number","nth","position","tw"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-dcf3041a","guard":[["hasAny",["item number","la","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-dd630594","guard":[["hasAny",["abbreviate","acronym","vivo"]]],"pyramid":["render.template",{"lit":[".vivo is sponsored by Telefonica Brasil ",{"slot":0},".A.."]},["transform.acronym",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-e179f3e3","guard":[["hasAny",["lifeinsurance","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by American Council of Life Insurers."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e24cc48c","guard":[["hasAny",["normalise","normalize","simplify the text","sv"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SVNet."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e250a766","guard":[["hasAny",["forum","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fegistry, LLC."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e3117a5d","guard":[["hasAny",["normalise","normalize","simplify the text","мон"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e3a36ef7","guard":[["hasAny",["la","normalise","normalize","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e3fd8632","guard":[["hasAny",["item number","mk","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e457e0dc","guard":[["hasAny",["each word","split into words","الاردن"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e4e33b95","guard":[["hasAny",["each word","kg","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by AsiaInfo Telecommunication Enterprise."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e510d9de","guard":[["hasAny",["normalise","normalize","simplify the text","الاردن"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE)."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e5647f42","guard":[["hasAny",["bauhaus","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-e64f2ab6","guard":[["hasAny",["each word","split into words","мон"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e68c62e0","guard":[["hasAny",["each word","lacaixa","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e6a7b73e","guard":[["hasAny",["hyatt","invert case","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e7d423c1","guard":[["hasAny",["delete","diet","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"XYZ.COM LLC"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-e83adc39","guard":[["hasAny",["normalise","normalize","simplify the text","امارات"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-ea8fb098","guard":[["hasAny",["each word","mk","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-eb0656c7","guard":[["hasAny",["forum","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fegistry, LLC."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-ec9361af","guard":[["hasAny",["each word","mv","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f1496e5f","guard":[["hasAny",["each word","forum","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fegistry, LLC."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f1a57352","guard":[["hasAny",["each word","split into words","su"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f2665eb0","guard":[["hasAny",["invert case","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f2a439bd","guard":[["hasAny",["item number","nth","position","sv"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SVNet."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f45d32c1","guard":[["hasAny",["item number","nth","position","rs"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Serbian National Internet Domain Registry (RNIDS)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-f5f13542","guard":[["hasAny",["each word","split into words","tiaa"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f6d89df5","guard":[["hasAny",["each word","split into words","sport"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SportAccord."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f75d1462","guard":[["hasAny",["each word","lacaixa","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f7b32e09","guard":[["hasAny",["normalise","normalize","simplify the text","भरत"]]],"pyramid":["render.template",{"lit":[".भा",{"slot":0}," is sponsored by National Internet Exchange of India."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-f861a8a3","guard":[["hasAny",["invert case","seat","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", S.A. (Sociedad Unipersonal)."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f8eb2939","guard":[["hasAny",["item number","nth","position","yt"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Association Française pour le Nommage Internet en Coopération (A.F.N.I.C.)."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f9b0812f","guard":[["hasAny",["mk","normalise","normalize","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-fa2079b2","guard":[["hasAny",["bar","each word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fb57144c","guard":[["hasAny",["item number","nth","position","tv"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Ministry of Transport, Energy, Communications and Innovations."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-fb8b7f74","guard":[["hasAny",["bauhaus","each word","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fc88a77d","guard":[["hasAny",["each word","split into words","tiaa"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fe1e8de2","guard":[["hasAny",["coop","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DotCooperation LLC."]},["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-ff164b9e","guard":[["hasAny",["art","each word","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by UK Creative Ideas Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-047f2ff7","guard":[["hasAny",["each word","split into words","tiaa","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Teachers Insurance and Annuity Association of America."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-04a2e80d","guard":[["hasAny",["hyatt","item number","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-0608df1f","guard":[["hasAny",["each word","ryukyu","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by BRregistry, Inc.."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-07631cc4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","swap case","title case","toggle case","toyota"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-094bd6f2","guard":[["hasAny",["each word","lifeinsurance","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by American Council of Life Insurers."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-0c1484ce","guard":[["hasAny",["item number","kiwi","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-0e6fa216","guard":[["hasAny",["item number","kiwi","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1339187e","guard":[["hasAny",["each word","split into words","star"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1360e161","guard":[["hasAny",["each word","pt","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1652ee5a","guard":[["hasAny",["item number","nth","position","toyota"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-16e4773a","guard":[["hasAny",["hyatt","invert case","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1820d387","guard":[["hasAny",["each word","split into words","toyota"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1a1fd589","guard":[["hasAny",["each word","mtr","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1adb665b","guard":[["hasAny",["deloitte","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1b9f237c","guard":[["hasAny",["each word","split into words","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1c14598c","guard":[["hasAny",["each word","hyatt","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1ce0d4a1","guard":[["hasAny",["each word","split into words","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1d71c37e","guard":[["hasAny",["asda","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1e5ddd88","guard":[["hasAny",["normalise","normalize","rwe","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-1e5ebaa3","guard":[["hasAny",["item number","nth","position","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1e7efc09","guard":[["hasAny",["deloitte","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-20517e03","guard":[["hasAny",["clubmed","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Club Méditerranée S.A.."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-244321ad","guard":[["hasAny",["discover","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-25c1f4ed","guard":[["hasAny",["each word","split into words","tab","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Tabcorp Holdings Limited."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-27ad35e6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","pt","swap case","title case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-27d55fe6","guard":[["hasAny",["item number","nth","position","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-304cacaa","guard":[["hasAny",["item number","nth","position","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-36d0fc2f","guard":[["hasAny",["abbreviate","acronym","vivo"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Telefonica Brasil ",{"slot":1},".A.."]},["sense.lastWord"],["transform.acronym",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-3a160d6e","guard":[["hasAny",["abbreviate","acronym","invert case","seat","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".seat is sponsored by ",{"slot":0},", ",{"slot":1},".A. (Sociedad Unipersonal)."]},["transform.swapCase",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-3a920d14","guard":[["hasAny",["item number","nth","position","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3afef0c0","guard":[["hasAny",["invert case","mtr","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3bcfd3cd","guard":[["hasAny",["each word","mtr","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3d8260a6","guard":[["hasAny",["kiwi","normalise","normalize","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-3e686b43","guard":[["hasAny",["discover","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3ef08197","guard":[["hasAny",["each word","kg","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by AsiaInfo Telecommunication Enterprise."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-40061307","guard":[["hasAny",["asda","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-40d95b4d","guard":[["hasAny",["each word","rwe","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-41b00558","guard":[["hasAny",["each word","split into words","star"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-42e09961","guard":[["hasAny",["each word","pt","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-43158e5a","guard":[["hasAny",["itau","normalise","normalize","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-43710010","guard":[["hasAny",["coop","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DotCooperation LLC."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-482b6a72","guard":[["hasAny",["invert case","spa","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-49a02ae1","guard":[["hasAny",["invert case","marriott","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4a006fb6","guard":[["hasAny",["each word","kiwi","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4a89a31d","guard":[["hasAny",["deloitte","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4cf80012","guard":[["hasAny",["abbreviate","acronym","seat"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["sense.lastWord"],["sense.lastWord"],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-4d98fc4c","guard":[["hasAny",["invert case","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-500dc565","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","swap case","title case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-50beb0d1","guard":[["hasAny",["each word","spa","split into words"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-535f4efb","guard":[["hasAny",["normalise","normalize","simplify the text","star"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5543375f","guard":[["hasAny",["each word","rs","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Serbian National Internet Domain Registry (RNIDS)."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-556f4166","guard":[["hasAny",["normalise","normalize","simplify the text","toyota"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5582196a","guard":[["hasAny",["each word","split into words","words","امارات"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Telecommunications and Digital Government Regulatory Authority (TDRA)."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-55a3eed7","guard":[["hasAny",["asda","capitalise","capitalize","capitalize each word","invert case","swap case","title case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-55ffa74f","guard":[["hasAny",["item number","nth","position","rwe"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-579fb390","guard":[["hasAny",["item number","marriott","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-58239195","guard":[["hasAny",["invert case","shortest","shortest one","shortest word","swap case","toggle case","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-596cee16","guard":[["hasAny",["item number","nth","position","spa"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-5d4f7645","guard":[["hasAny",["each word","split into words","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-63bac18d","guard":[["hasAny",["arab","invert case","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-63e31636","guard":[["hasAny",["each word","sas","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Research IP LLC."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-6bfffd05","guard":[["hasAny",["item number","nth","position","spa"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6dc153a8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","rwe","swap case","title case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6ec02513","guard":[["hasAny",["each word","itau","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6fe36e97","guard":[["hasAny",["invert case","pt","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-70bfac50","guard":[["hasAny",["each word","split into words","words","мон"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Datacom Co.,Ltd."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-712fb062","guard":[["hasAny",["itau","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-722da1e6","guard":[["hasAny",["each word","itau","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-730472c4","guard":[["hasAny",["itau","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7454d969","guard":[["hasAny",["book","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Amazon Registry Services, Inc.."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-74bc4def","guard":[["hasAny",["each word","lacaixa","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fundación Bancaria Caixa d'Estalvis i Pensions de Barcelona, \"la Caixa\"."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-75426c52","guard":[["hasAny",["normalise","normalize","simplify the text","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-759d3c99","guard":[["hasAny",["invert case","swap case","toggle case","toyota"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-77ce32d2","guard":[["hasAny",["each word","rwe","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-780eaa35","guard":[["hasAny",["arab","item number","nth","position"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-7898267d","guard":[["hasAny",["invert case","rwe","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7a79821a","guard":[["hasAny",["discover","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7ae235b3","guard":[["hasAny",["each word","split into words","words","الاردن"]]],"pyramid":["render.template",{"lit":["‏.",{"slot":0},"‎ is sponsored by Ministry of Digital Economy and Entrepreneurship (MoDEE)."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-7c5a9b13","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","swap case","title case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7c723b89","guard":[["hasAny",["normalise","normalize","simplify the text","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-7d0fd183","guard":[["hasAny",["item number","mtr","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-7d19d74d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","marriott","swap case","title case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7f910e67","guard":[["hasAny",["each word","split into words","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-804105f8","guard":[["hasAny",["discover","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-8206397c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","kiwi","swap case","title case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-832ee7a1","guard":[["hasAny",["each word","split into words","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-870e83c3","guard":[["hasAny",["asda","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-8d5e9118","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","swap case","title case","toggle case","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9016e98e","guard":[["hasAny",["item number","nth","position","rwe"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-91200934","guard":[["hasAny",["each word","mk","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Macedonian Academic Research Network Skopje."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-91bcc08a","guard":[["hasAny",["arab","normalise","normalize","simplify the text"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-949be647","guard":[["hasAny",["each word","split into words","words","ye"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by TeleYemen."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-97242b93","guard":[["hasAny",["hyatt","normalise","normalize","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-977cf48b","guard":[["hasAny",["each word","kiwi","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-99dd7238","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","spa","swap case","title case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9d7816e1","guard":[["hasAny",["bauhaus","each word","split into words","words"]],["has","which"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Werkhaus GmbH."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-9e5b53f1","guard":[["hasAny",["item number","nth","position","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-a00eb323","guard":[["hasAny",["each word","forum","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Fegistry, LLC."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-a2593298","guard":[["hasAny",["normalise","normalize","pt","simplify the text"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-a67d47ae","guard":[["hasAny",["each word","split into words","su","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Russian Institute for Development of Public Networks (ROSNIIROS)."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-a8f76cac","guard":[["hasAny",["capitalise","capitalize","capitalize each word","discover","invert case","swap case","title case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-aaeb32b1","guard":[["hasAny",["each word","split into words","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ac110a68","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hyatt","invert case","swap case","title case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b2964ba3","guard":[["hasAny",["discover","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b45e4f7c","guard":[["hasAny",["each word","ls","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lesotho Network Information Centre Proprietary (LSNIC)."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-b55acedd","guard":[["hasAny",["each word","mv","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Dhivehi Raajjeyge Gulhun PLC."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-b8d8e4a1","guard":[["hasAny",["each word","kred","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by KredTLD Pty Ltd."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-bad0a5ff","guard":[["hasAny",["invert case","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bcb30118","guard":[["hasAny",["marriott","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-bcf43898","guard":[["hasAny",["diet","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by XYZ.COM LLC."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-bdf3d4c5","guard":[["hasAny",["each word","poker","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Identity Digital Limited."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-bf9419aa","guard":[["hasAny",["each word","marriott","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c9021422","guard":[["hasAny",["each word","hyatt","split into words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cd273694","guard":[["hasAny",["each word","split into words","tw","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Taiwan Network Information Center (TWNIC)."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-ce08a3b7","guard":[["hasAny",["each word","split into words","toyota"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ce2f3720","guard":[["hasAny",["deloitte","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-ce3a780e","guard":[["hasAny",["art","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by UK Creative Ideas Limited."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-cfacc858","guard":[["hasAny",["item number","marriott","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cfba8a2e","guard":[["hasAny",["deloitte","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d0432716","guard":[["hasAny",["asda","each word","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d1f0e254","guard":[["hasAny",["arab","item number","nth","position"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d49ca372","guard":[["hasAny",["item number","nth","position","star"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-dc4b7bc5","guard":[["hasAny",["each word","split into words","sport","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SportAccord."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-debfcc9f","guard":[["hasAny",["normalise","normalize","simplify the text","spa"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e0aa7de6","guard":[["hasAny",["discover","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e0e5f9b8","guard":[["hasAny",["mtr","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e1a90dd7","guard":[["hasAny",["each word","la","split into words","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Lao National Internet Center (LANIC), Ministry of Technology and Communications."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-e1d1d53a","guard":[["hasAny",["each word","spa","split into words"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e1d567cc","guard":[["hasAny",["item number","nth","position","pt"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e2478f3e","guard":[["hasAny",["asda","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e261ed07","guard":[["hasAny",["hyatt","item number","nth","position"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e26458f8","guard":[["hasAny",["each word","split into words","sv","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by SVNet."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-e3dd6610","guard":[["hasAny",["capitalise","capitalize","capitalize each word","deloitte","invert case","swap case","title case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e8db3e6e","guard":[["hasAny",["invert case","swap case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-eb2d5007","guard":[["hasAny",["each word","marriott","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-eb32c6cb","guard":[["hasAny",["item number","nth","position","star"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-eb6b06ee","guard":[["hasAny",["arab","each word","split into words"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ed95e3bf","guard":[["hasAny",["arab","capitalise","capitalize","capitalize each word","invert case","swap case","title case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-eef0283e","guard":[["hasAny",["item number","mtr","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ef01ae6c","guard":[["hasAny",["item number","nth","position","pt"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-f0336f94","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","star","swap case","title case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f40c6d2b","guard":[["hasAny",["each word","split into words","words","рус"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Rusnames Limited."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-f466b069","guard":[["hasAny",["arab","each word","split into words"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f4b71f36","guard":[["hasAny",["commbank","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by COMMONWEALTH BANK OF AUSTRALIA."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-f5f98cd6","guard":[["hasAny",["each word","ee","split into words","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Eesti Interneti Sihtasutus (EIS)."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-f600195f","guard":[["hasAny",["normalise","normalize","simplify the text","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-f613d386","guard":[["hasAny",["item number","nth","position","toyota"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-f6819f53","guard":[["hasAny",["asda","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f713f5ef","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","itau","swap case","title case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f746d700","guard":[["hasAny",["invert case","itau","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f81a2995","guard":[["hasAny",["invert case","kiwi","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-fb16937a","guard":[["hasAny",["invert case","swap case","toggle case","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-fef7d7ae","guard":[["hasAny",["deloitte","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ffd61858","guard":[["hasAny",["capitalise","capitalize","capitalize each word","invert case","mtr","swap case","title case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ffed2014","guard":[["hasAny",["item number","nth","position","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-03d153f4","guard":[["hasAny",["invert case","mtr","normalise","normalize","simplify the text","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-054c8379","guard":[["hasAny",["each word","invert case","itau","split into words","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-05a0c738","guard":[["hasAny",["hyatt","invert case","item number","nth","position","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0aef8f93","guard":[["hasAny",["abbreviate","acronym","capitalise","capitalize","capitalize each word","seat","title case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["sense.lastWord"],["transform.title",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-0c7ef58a","guard":[["hasAny",["invert case","item number","nth","position","spa","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0efc8aa1","guard":[["hasAny",["invert case","itau","item number","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1a243b66","guard":[["hasAny",["each word","invert case","split into words","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-24413465","guard":[["hasAny",["invert case","normalise","normalize","simplify the text","spa","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2d539a17","guard":[["hasAny",["each word","hyatt","split into words","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-2d7c96f1","guard":[["hasAny",["invert case","item number","nth","position","spa","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2e137eb6","guard":[["hasAny",["abbreviate","acronym","capitalise","capitalize","capitalize each word","title case","vivo"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Telefonica Brasil ",{"slot":1},".A.."]},["transform.title",["sense.lastWord"]],["transform.acronym",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-2efffbf4","guard":[["hasAny",["each word","kiwi","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-3304f3eb","guard":[["hasAny",["each word","invert case","marriott","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3452c347","guard":[["hasAny",["invert case","itau","normalise","normalize","simplify the text","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-35ac6421","guard":[["hasAny",["deloitte","invert case","normalise","normalize","simplify the text","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-36b80a10","guard":[["hasAny",["discover","each word","invert case","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-372228e0","guard":[["hasAny",["invert case","item number","nth","position","rwe","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-37aa0d09","guard":[["hasAny",["each word","split into words","words","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-3afbc949","guard":[["hasAny",["invert case","item number","mtr","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3b18b46d","guard":[["hasAny",["invert case","marriott","normalise","normalize","simplify the text","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3c935c35","guard":[["hasAny",["asda","each word","invert case","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3f9b08a3","guard":[["hasAny",["deloitte","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-40193a47","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-418c0e30","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","toyota"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-42e85907","guard":[["hasAny",["arab","each word","split into words","words"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-459f413a","guard":[["hasAny",["arab","invert case","normalise","normalize","simplify the text","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4afa8205","guard":[["hasAny",["invert case","normalise","normalize","pt","simplify the text","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-54633983","guard":[["hasAny",["deloitte","each word","invert case","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-54c6f34c","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","toyota"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-559ed686","guard":[["hasAny",["invert case","kiwi","normalise","normalize","simplify the text","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-58038c7d","guard":[["hasAny",["each word","pt","split into words","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-5866497a","guard":[["hasAny",["asda","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5a76b12b","guard":[["hasAny",["invert case","normalise","normalize","rwe","simplify the text","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5adb07a6","guard":[["hasAny",["each word","invert case","mtr","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5b297b18","guard":[["hasAny",["deloitte","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-610107c7","guard":[["hasAny",["asda","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-615659a0","guard":[["hasAny",["hyatt","invert case","normalise","normalize","simplify the text","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-63633e2d","guard":[["hasAny",["hyatt","invert case","item number","nth","position","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6432b356","guard":[["hasAny",["each word","mtr","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-69058031","guard":[["hasAny",["each word","itau","split into words","words"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-6b63e859","guard":[["hasAny",["each word","invert case","itau","split into words","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-728439e0","guard":[["hasAny",["each word","invert case","marriott","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7489b0f6","guard":[["hasAny",["arab","invert case","item number","nth","position","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-74ae7c87","guard":[["hasAny",["deloitte","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-75e6ec4e","guard":[["hasAny",["invert case","item number","nth","position","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-766dd75e","guard":[["hasAny",["discover","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-778d9de2","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-77926c01","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","toyota"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-796323f9","guard":[["hasAny",["each word","spa","split into words","words"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-7b9217f3","guard":[["hasAny",["each word","invert case","rwe","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7e8dccb1","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","toyota"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-82010390","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8411c1d7","guard":[["hasAny",["deloitte","each word","invert case","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8590ba57","guard":[["hasAny",["invert case","item number","marriott","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8926683b","guard":[["hasAny",["each word","invert case","kiwi","split into words","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-893c14e2","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8c503c51","guard":[["hasAny",["abbreviate","acronym","invert case","seat","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-8d717933","guard":[["hasAny",["each word","split into words","star","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-902b0082","guard":[["hasAny",["invert case","normalise","normalize","simplify the text","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-93f1d812","guard":[["hasAny",["asda","invert case","normalise","normalize","simplify the text","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-94e01b62","guard":[["hasAny",["invert case","item number","kiwi","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-96f7bcfc","guard":[["hasAny",["arab","each word","invert case","split into words","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9ef30b68","guard":[["hasAny",["arab","invert case","item number","nth","position","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9f461fe7","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a58a8fbe","guard":[["hasAny",["arab","each word","invert case","split into words","swap case","toggle case"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a5c4fb62","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a790df0e","guard":[["hasAny",["discover","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ac1685a8","guard":[["hasAny",["each word","invert case","kiwi","split into words","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b11066c8","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b4707668","guard":[["hasAny",["each word","marriott","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-b4f1f50a","guard":[["hasAny",["each word","invert case","rwe","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b8a2f1f7","guard":[["hasAny",["each word","split into words","words","xyz"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-b9a7729a","guard":[["hasAny",["invert case","item number","nth","position","pt","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bc829681","guard":[["hasAny",["invert case","normalise","normalize","simplify the text","swap case","toggle case","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bf07a4f1","guard":[["hasAny",["each word","invert case","mtr","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bf88de77","guard":[["hasAny",["each word","rwe","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-c510310e","guard":[["hasAny",["invert case","normalise","normalize","simplify the text","swap case","toggle case","toyota"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c5600e6f","guard":[["hasAny",["each word","invert case","pt","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c9b8c67e","guard":[["hasAny",["each word","invert case","split into words","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c9cc8a24","guard":[["hasAny",["invert case","item number","nth","position","rwe","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ca9f37c5","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","za"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Domain Name Authority."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-cd0bdfeb","guard":[["hasAny",["discover","each word","invert case","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-cd4cdcca","guard":[["hasAny",["abbreviate","acronym","invert case","swap case","toggle case","vivo"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Telefonica Brasil ",{"slot":1},".A.."]},["transform.swapCase",["sense.lastWord"]],["transform.acronym",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-ce21f43e","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d55ae9a9","guard":[["hasAny",["invert case","item number","marriott","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d633cd61","guard":[["hasAny",["invert case","item number","nth","position","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d6828f90","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-da6c2361","guard":[["hasAny",["discover","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-db552405","guard":[["hasAny",["each word","hyatt","invert case","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-dc4f4e5e","guard":[["hasAny",["each word","hyatt","invert case","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-dd324688","guard":[["hasAny",["each word","invert case","spa","split into words","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e0cc2edd","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e4cd6ae1","guard":[["hasAny",["invert case","normalise","normalize","simplify the text","swap case","toggle case","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e54994ac","guard":[["hasAny",["invert case","item number","kiwi","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e5f45515","guard":[["hasAny",["each word","split into words","toyota","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-e6a1f13f","guard":[["hasAny",["invert case","item number","nth","position","pt","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e800d306","guard":[["hasAny",["each word","invert case","spa","split into words","swap case","toggle case"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e97dcf34","guard":[["hasAny",["asda","each word","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]]],"mem":null},
{"id":"n-ec8e6205","guard":[["hasAny",["invert case","itau","item number","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ed8102b7","guard":[["hasAny",["asda","each word","invert case","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f20c595d","guard":[["hasAny",["each word","invert case","pt","split into words","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f6761011","guard":[["hasAny",["invert case","normalise","normalize","simplify the text","star","swap case","toggle case"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f89c6930","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","xyz"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-fc7866ab","guard":[["hasAny",["invert case","item number","mtr","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ff5ed9fa","guard":[["hasAny",["discover","invert case","normalise","normalize","simplify the text","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-01973233","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","words","xyz"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},".COM LLC."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-037e1cc0","guard":[["hasAny",["abbreviate","acronym","each word","split into words","vivo"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Telefonica Brasil ",{"slot":1},".A.."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.acronym",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-15ba73a9","guard":[["hasAny",["abbreviate","acronym","invert case","seat","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["sense.lastWord"],["transform.swapCase",["sense.lastWord"]],["transform.acronym",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-15d730fb","guard":[["hasAny",["asda","each word","invert case","split into words","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Stores Limited."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2d8588cc","guard":[["hasAny",["each word","invert case","kiwi","split into words","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by DOT ",{"slot":1}," LIMITED."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3e3dd743","guard":[["hasAny",["abbreviate","acronym","normalise","normalize","seat","simplify the text"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-48834c9c","guard":[["hasAny",["abbreviate","acronym","each word","split into words","vivo"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Telefonica Brasil ",{"slot":1},".A.."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.acronym",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-495f36ad","guard":[["hasAny",["discover","each word","invert case","split into words","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Financial Services."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6edba0f3","guard":[["hasAny",["abbreviate","acronym","capitalise","capitalize","capitalize each word","invert case","seat","swap case","title case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["transform.title",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-760e5411","guard":[["hasAny",["abbreviate","acronym","each word","seat","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-7ff8e083","guard":[["hasAny",["each word","invert case","rwe","split into words","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," AG."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-87976ea8","guard":[["hasAny",["each word","invert case","marriott","split into words","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Worldwide Corporation."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-92485c2d","guard":[["hasAny",["each word","invert case","mtr","split into words","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Corporation Limited."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9a5acf6f","guard":[["hasAny",["arab","each word","invert case","split into words","swap case","toggle case","words"]],["has","sponsoring"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by League of ",{"slot":1}," States."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9bae074d","guard":[["hasAny",["abbreviate","acronym","normalise","normalize","simplify the text","vivo"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Telefonica Brasil ",{"slot":1},".A.."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.acronym",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-ae446745","guard":[["hasAny",["abbreviate","acronym","invert case","seat","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["transform.swapCase",["sense.lastWord"]],["transform.swapCase",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-af4d7c37","guard":[["hasAny",["abbreviate","acronym","item number","nth","position","vivo"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Telefonica Brasil ",{"slot":1},".A.."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.acronym",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-b381c3f1","guard":[["hasAny",["each word","hyatt","invert case","split into words","swap case","toggle case","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," GTLD, L.L.C.."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b4d1a04a","guard":[["hasAny",["abbreviate","acronym","item number","nth","position","seat"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-b6bb3452","guard":[["hasAny",["each word","invert case","itau","split into words","swap case","toggle case","words"]],["has","name"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Unibanco Holding S.A.."]},["render.list",["transform.words",["sense.after",{"lit":"of"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c5c9c841","guard":[["hasAny",["abbreviate","acronym","item number","nth","position","seat"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["sense.lastWord"],["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-d099eefd","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","toyota","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," MOTOR CORPORATION."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d20c70ba","guard":[["hasAny",["deloitte","each word","invert case","split into words","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," Touche Tohmatsu."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d84dd090","guard":[["hasAny",["abbreviate","acronym","item number","nth","position","vivo"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Telefonica Brasil ",{"slot":1},".A.."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.acronym",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-d9a6f830","guard":[["hasAny",["each word","invert case","pt","split into words","swap case","toggle case","words"]],["has","who"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Associação DNS.",{"slot":1},"."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d9ed02be","guard":[["hasAny",["each word","invert case","split into words","star","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," India Private Limited."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e405a544","guard":[["hasAny",["abbreviate","acronym","each word","seat","split into words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-e4cf97e4","guard":[["hasAny",["each word","invert case","spa","split into words","swap case","toggle case","words"]],["has","organization"]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Asia ",{"slot":1}," and Wellness Promotion Council Limited."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-eea3613b","guard":[["hasAny",["each word","invert case","split into words","swap case","toggle case","words","yodobashi"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1}," CAMERA CO.,LTD.."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4befba57","guard":[["hasAny",["abbreviate","acronym","each word","invert case","seat","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-710505f2","guard":[["hasAny",["abbreviate","abbreviation","acronym","each word","seat","short form","split into words","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["sense.lastWord"],["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-814e5e51","guard":[["hasAny",["abbreviate","acronym","invert case","item number","nth","position","seat","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.swapCase",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-a8df60e4","guard":[["hasAny",["abbreviate","acronym","invert case","item number","nth","position","seat","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-ce498181","guard":[["hasAny",["abbreviate","abbreviation","acronym","each word","short form","split into words","vivo","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by Telefonica Brasil ",{"slot":1},".A.."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.acronym",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-de015278","guard":[["hasAny",["abbreviate","acronym","each word","invert case","seat","split into words","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.swapCase",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-f0076791","guard":[["hasAny",["abbreviate","acronym","invert case","normalise","normalize","seat","simplify the text","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.swapCase",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null},
{"id":"n-3a0ee0b1","guard":[["hasAny",["abbreviate","abbreviation","acronym","each word","invert case","seat","short form","split into words","swap case","toggle case","words"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}," is sponsored by ",{"slot":1},", ",{"slot":2},".A. (Sociedad Unipersonal)."]},["render.list",["transform.words",["sense.after",{"lit":"domain"}]]],["transform.swapCase",["sense.lastWord"]],["transform.acronym",["sense.lastWord"]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the sponsoring body of .भारत","expect":{"contains":["National Internet Exchange of India"],"notRefusal":true}},{"q":"who sponsors the top-level domain .ee","expect":{"contains":["Eesti Interneti Sihtasutus (EIS)"],"notRefusal":true}},{"q":"who sponsors the top-level domain .tiaa","expect":{"contains":["Teachers Insurance and Annuity Association of America"],"notRefusal":true}},{"q":"who sponsors the top-level domain ‏.امارات‎","expect":{"contains":["Telecommunications and Digital Government Regulatory Authority (TDRA)"],"notRefusal":true}},{"q":"who sponsors the top-level domain .seat","expect":{"contains":["SEAT, S.A. (Sociedad Unipersonal)"],"notRefusal":true}},{"q":"which organization runs the domain .pamperedchef","expect":{"contains":["Not assigned"],"notRefusal":true}},{"q":"who sponsors the top-level domain .asda","expect":{"contains":["Asda Stores Limited"],"notRefusal":true}},{"q":"name the sponsoring body of .marriott","expect":{"contains":["Marriott Worldwide Corporation"],"notRefusal":true}},{"q":"name the sponsoring body of .express","expect":{"contains":["Binky Moon, LLC"],"notRefusal":true}},{"q":"who sponsors the top-level domain .xyz","expect":{"contains":["XYZ.COM LLC"],"notRefusal":true}},{"q":"name the sponsoring body of .bar","expect":{"contains":["Punto 2012 Sociedad Anonima Promotora de Inversion de Capital Variable"],"notRefusal":true}},{"q":"which organization runs the domain .surf","expect":{"contains":["Registry Services, LLC"],"notRefusal":true}},{"q":"who sponsors the top-level domain .ye","expect":{"contains":["TeleYemen"],"notRefusal":true}},{"q":"who sponsors the top-level domain .sas","expect":{"contains":["Research IP LLC"],"notRefusal":true}},{"q":"which organization runs the domain .ls","expect":{"contains":["Lesotho Network Information Centre Proprietary (LSNIC)"],"notRefusal":true}},{"q":"name the sponsoring body of .plumbing","expect":{"contains":["Binky Moon, LLC"],"notRefusal":true}},{"q":"which organization runs the domain .study","expect":{"contains":["Registry Services, LLC"],"notRefusal":true}},{"q":"which organization runs the domain .sv","expect":{"contains":["SVNet"],"notRefusal":true}},{"q":"which organization runs the domain .hospital","expect":{"contains":["Binky Moon, LLC"],"notRefusal":true}},{"q":"which organization runs the domain .мон","expect":{"contains":["Datacom Co.,Ltd"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
