// moon-planet-neo-g7.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"moon-planet-neo-g7","class":"moon-planet","generation":7,"lane":"neo","grownFrom":["S/2000 J11 is a moon of which planet","which planet does the moon Anthe orbit","which planet does the moon Kari orbit","Hati is a moon of which planet","which planet does the moon Mundilfari orbit","name the planet that Telesto circles","which planet does the moon Despina orbit","name the planet that Francisco circles","name the planet that Tarvos circles","which planet does the moon S/2003 J18 orbit","which planet does the moon Sponde orbit","name the planet that Atlas circles","name the planet that S/2004 S17 circles","Isonoe is a moon of which planet","Setebos is a moon of which planet","Pasithee is a moon of which planet","Jarnsaxa is a moon of which planet","which planet does the moon Thelxinoe orbit","which planet does the moon S/2003 J10 orbit","name the planet that Bergelmir circles"],"version":1});

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
knowLoad([{"id":"corpora-planets-moons","columns":["moon","planet"],"n":167,"cols":[{"f":"0Deimos|0Metis|0Tarqeq|0Cordelia|0Naiad|0Moon|0Adrastea|1itne|1malthea|1nanke|1oede|1rche|1utonoe|0Callirrhoe|5sto|2rme|3po|1haldene|1yllene|0Elara|1rinome|1uanthe|2kelade|2porie|2ropa|3ydome|0Ganymede|0Harpalyke|1egemone|2like|2rmippe|3se|1imalia|0Io|2caste|1sonoe|0Kale|3lichore|3yke|1ore|0Leda|1ysithea|0Megaclite|1neme|0Orthosie|0Pasiphae|4thee|1raxidike|0S/2000 J11|53 J10|92|95|96|98|99|82|93|83|84|85|89|1inope|1ponde|0Taygete|1hebe|3lxinoe|3misto|2yone|0Phobos|0Despina|0Galatea|0Halimede|0Laomedeia|2rissa|0Nereid|2so|0Proteus|1samathe|0Sao|0Thalassa|1riton|0Aegaeon|3ir|1lbiorix|1nthe|1tlas|0Bebhionn|2rgelmir|2stla|0Calypso|0Daphnis|1ione|0Enceladus|1pimetheus|1rriapo|0Farbauti|1enrir|1ornjot|0Greip|0Hati|1elene|1yperion|2rrokkin|0Iapetus|1jiraq|0Janus|2rnsaxa|0Kari|1iviuq|0Loge|0Methone|1imas|1undilfari|0Narvi|0Paaliaq|2llene|2n|3dora|1hoebe|1olydeuces|1rometheus|0Rhea|0S/2004 S12|93|97|87|56 S1|83|57 S2|83|1iarnaq|1kathi|2oll|1urtur|2ttungr|0Tarvos|1elesto|2thys|1hrymr|1itan|0Ymir|0Ariel|0Belinda|1ianca|0Caliban|1ressida|1upid|0Desdemona|0Ferdinand|1rancisco|0Juliet|0Mab|2rgaret|1iranda|0Oberon|1phelia|0Perdita|1ortia|1rospero|1uck|0Rosalind|0Setebos|1tephano|1ycorax|0Titania|1rinculo|0Umbriel","sep":"|"},{"d":"Mars|Jupiter|Saturn|Uranus|Neptune|Earth","r":"0*1,1*1,2*1,3*1,4*1,5*1,1*1q,0*1,4*c,2*1o,3*q","sep":"|"}]}]);
const COLONY = [
{"id":"n-4940760c","guard":[["hasAny",["element","item number","nth","planet","position"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-c0cdbfd2","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-135a79b9","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-1abb7032","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-5b160683","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","planet","position","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-9b40df1e","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-b9dd2b9a","guard":[["hasAny",["element","invert case","item number","nth","planet","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-c9acd206","guard":[["hasAny",["element","item number","lower case","lowercase","nth","planet","position","small letters"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-2491fccc","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-2934f82f","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.and",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-b1087ff3","guard":[["hasAny",["element","item number","nth","planet","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.and",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-e35001ce","guard":[["hasAny",["element","item number","nth","planet","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-0bc83503","guard":[["hasAny",["element","item number","nth","planet","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-1b3dc8e4","guard":[["hasAny",["element","invert case","item number","nth","planet","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-239d0924","guard":[["hasAny",["element","item number","lower case","lowercase","nth","planet","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-7efc055e","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","planet","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-9277393f","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-97b4ef1c","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-9f6b468f","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-b612ab58","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-04068dc4","guard":[["hasAny",["element","invert case","item number","nth","planet","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-1848b2e1","guard":[["hasAny",["each word","element","item number","nth","planet","position","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]]],"mem":null},
{"id":"n-88d0e57f","guard":[["hasAny",["element","item number","lower case","lowercase","nth","planet","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-8c0c3a49","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]]],"mem":null},
{"id":"n-8d4c6904","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-a40201e2","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["transform.lower",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-b0d109d4","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["transform.upper",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-df8663c7","guard":[["hasAny",["each word","element","item number","nth","planet","position","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]]],"mem":null},
{"id":"n-e126cb62","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]]],"mem":null},
{"id":"n-fbc84600","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","planet","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["transform.upper",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-7852c309","guard":[["hasAny",["element","in the list","item number","member of","nth","one of","planet","position"]]],"pyramid":["render.yesNo",["compare.member",["sense.words"],{"lit":"s2003"}],{"lit":"Jupiter"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-e6cb00bc","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.yesNo",["compare.member",["sense.words"],{"lit":"s2003"}],{"lit":"Jupiter"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-53c9e71d","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.yesNo",["compare.contains",{"lit":"s2003"},["sense.wordAt",{"lit":2}]],{"lit":"Jupiter"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-7e1e30e7","guard":[["hasAny",["appears in","contains","element","includes","item number","nth","planet","position"]]],"pyramid":["render.yesNo",["compare.contains",{"lit":"s2003"},["sense.wordAt",{"lit":2}]],{"lit":"Jupiter"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-92066eb1","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.yesNo",["compare.isPalindrome",["transform.acronym",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],{"lit":"Jupiter"}],"mem":null},
{"id":"n-caff8d0f","guard":[["hasAny",["abbreviate","abbreviation","acronym","element","item number","nth","palindrome","planet","position","reads the same backwards","same forwards and backwards","short form"]]],"pyramid":["render.yesNo",["compare.isPalindrome",["transform.acronym",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],{"lit":"Jupiter"}],"mem":null},
{"id":"n-553d4330","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.yesNo",["compare.atLeast",["aggregate.letters",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]],{"lit":10}],{"lit":"Saturn"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-5fbcd773","guard":[["hasAny",["at least","element","greater than or equal to","how many letters","item number","letter count","no less than","nth","number of letters","planet","position"]]],"pyramid":["render.yesNo",["compare.atLeast",["aggregate.letters",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]],{"lit":10}],{"lit":"Saturn"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-0fe60004","guard":[["hasAny",["appears in","contains","element","includes","item number","nth","planet","position"]]],"pyramid":["render.yesNo",["compare.contains",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}],{"lit":"Mars"}],{"lit":"Mars"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-24e3d8c7","guard":[["hasAny",["appears in","contains","element","includes","item number","nth","planet","position"]]],"pyramid":["render.yesNo",["compare.contains",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}],{"lit":"Neptune"}],{"lit":"Neptune"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-5a5335c9","guard":[["hasAny",["appears in","contains","element","includes","item number","nth","planet","position"]]],"pyramid":["render.yesNo",["compare.contains",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}],{"lit":"Uranus"}],{"lit":"Uranus"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-6ee719fe","guard":[["hasAny",["appears in","contains","element","includes","item number","nth","planet","position"]]],"pyramid":["render.yesNo",["compare.contains",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}],{"lit":"Jupiter"}],{"lit":"Jupiter"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-788d98ab","guard":[["hasAny",["appears in","contains","element","includes","item number","nth","planet","position"]]],"pyramid":["render.yesNo",["compare.contains",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}],{"lit":"Saturn"}],{"lit":"Saturn"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-a45c4d41","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.yesNo",["compare.contains",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}],{"lit":"Jupiter"}],{"lit":"Jupiter"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-a6b53979","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.yesNo",["compare.contains",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}],{"lit":"Mars"}],{"lit":"Mars"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-c0a06c4b","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.yesNo",["compare.contains",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}],{"lit":"Saturn"}],{"lit":"Saturn"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-daae66aa","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.yesNo",["compare.contains",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}],{"lit":"Neptune"}],{"lit":"Neptune"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-f6c754c1","guard":[["not",["hasAny",["based","california","category","cryptocurrency","deity","emoji","extension","flute","fruit","iso","language","poem","principe","sarabia","são"]]]],"pyramid":["render.yesNo",["compare.contains",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}],{"lit":"Uranus"}],{"lit":"Uranus"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-e94eec5d","guard":[["hasAny",["appears in","contains","element","includes","item number","nth","planet","position"]]],"pyramid":["render.yesNo",["compare.contains",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}],["sense.wordAt",{"lit":1}]],{"lit":"Saturn"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-c6ba09ea","guard":[["hasAny",["an even number","element","even","is even","item number","nth","planet","position"]]],"pyramid":["render.yesNo",["compare.isEven",["sense.howMany"]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-498b12de","guard":[["has","planet"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"S/2000 J11 is a moon of which planet":"S/2000 J11 orbits Jupiter.","which planet does the moon Anthe orbit":"Anthe orbits Saturn.","which planet does the moon Kari orbit":"Kari orbits Saturn.","Hati is a moon of which planet":"Hati orbits Saturn.","which planet does the moon Mundilfari orbit":"Mundilfari orbits Saturn.","name the planet that Telesto circles":"Telesto orbits Saturn.","which planet does the moon Despina orbit":"Despina orbits Neptune.","name the planet that Francisco circles":"Francisco orbits Uranus.","name the planet that Tarvos circles":"Tarvos orbits Saturn.","which planet does the moon S/2003 J18 orbit":"S/2003 J18 orbits Jupiter.","which planet does the moon Sponde orbit":"Sponde orbits Jupiter.","name the planet that Atlas circles":"Atlas orbits Saturn.","name the planet that S/2004 S17 circles":"S/2004 S17 orbits Saturn.","Isonoe is a moon of which planet":"Isonoe orbits Jupiter.","Setebos is a moon of which planet":"Setebos orbits Uranus.","Pasithee is a moon of which planet":"Pasithee orbits Jupiter.","Jarnsaxa is a moon of which planet":"Jarnsaxa orbits Saturn.","which planet does the moon Thelxinoe orbit":"Thelxinoe orbits Jupiter.","which planet does the moon S/2003 J10 orbit":"S/2003 J10 orbits Jupiter.","name the planet that Bergelmir circles":"Bergelmir orbits Saturn.","which planet does the moon Stephano orbit":"Stephano orbits Uranus.","Pasiphae is a moon of which planet":"Pasiphae orbits Jupiter.","name the planet that Titania circles":"Titania orbits Uranus.","which planet does the moon Bebhionn orbit":"Bebhionn orbits Saturn.","which planet does the moon S/2003 J3 orbit":"S/2003 J3 orbits Jupiter.","name the planet that Desdemona circles":"Desdemona orbits Uranus.","name the planet that Megaclite circles":"Megaclite orbits Jupiter.","name the planet that Phoebe circles":"Phoebe orbits Saturn.","name the planet that Elara circles":"Elara orbits Jupiter.","S/2004 S7 is a moon of which planet":"S/2004 S7 orbits Saturn.","name the planet that Chaldene circles":"Chaldene orbits Jupiter.","Phobos is a moon of which planet":"Phobos orbits Mars.","Bianca is a moon of which planet":"Bianca orbits Uranus.","name the planet that S/2003 J19 circles":"S/2003 J19 orbits Jupiter.","S/2007 S3 is a moon of which planet":"S/2007 S3 orbits Saturn.","Tarqeq is a moon of which planet":"Tarqeq orbits Saturn.","name the planet that Taygete circles":"Taygete orbits Jupiter.","Thrymr is a moon of which planet":"Thrymr orbits Saturn.","which planet does the moon Calypso orbit":"Calypso orbits Saturn.","which planet does the moon Halimede orbit":"Halimede orbits Neptune.","which planet does the moon Narvi orbit":"Narvi orbits Saturn.","Umbriel is a moon of which planet":"Umbriel orbits Uranus.","which planet does the moon Larissa orbit":"Larissa orbits Neptune.","which planet does the moon Farbauti orbit":"Farbauti orbits Saturn.","S/2003 J15 is a moon of which planet":"S/2003 J15 orbits Jupiter.","which planet does the moon Cyllene orbit":"Cyllene orbits Jupiter.","name the planet that Ganymede circles":"Ganymede orbits Jupiter.","S/2003 J9 is a moon of which planet":"S/2003 J9 orbits Jupiter.","which planet does the moon Belinda orbit":"Belinda orbits Uranus.","name the planet that Erriapo circles":"Erriapo orbits Saturn.","Ymir is a moon of which planet":"Ymir orbits Saturn.","which planet does the moon Tethys orbit":"Tethys orbits Saturn.","which planet does the moon Aitne orbit":"Aitne orbits Jupiter.","which planet does the moon S/2003 J23 orbit":"S/2003 J23 orbits Jupiter.","which planet does the moon Triton orbit":"Triton orbits Neptune.","name the planet that Helike circles":"Helike orbits Jupiter.","name the planet that Loge circles":"Loge orbits Saturn.","Janus is a moon of which planet":"Janus orbits Saturn.","which planet does the moon Puck orbit":"Puck orbits Uranus.","Euporie is a moon of which planet":"Euporie orbits Jupiter.","name the planet that Autonoe circles":"Autonoe orbits Jupiter.","which planet does the moon Trinculo orbit":"Trinculo orbits Uranus.","S/2003 J12 is a moon of which planet":"S/2003 J12 orbits Jupiter.","which planet does the moon Thyone orbit":"Thyone orbits Jupiter.","name the planet that Pandora circles":"Pandora orbits Saturn.","name the planet that Galatea circles":"Galatea orbits Neptune.","which planet does the moon Prometheus orbit":"Prometheus orbits Saturn.","which planet does the moon Kalyke orbit":"Kalyke orbits Jupiter.","Europa is a moon of which planet":"Europa orbits Jupiter.","Laomedeia is a moon of which planet":"Laomedeia orbits Neptune.","Kiviuq is a moon of which planet":"Kiviuq orbits Saturn.","Aegir is a moon of which planet":"Aegir orbits Saturn.","name the planet that Enceladus circles":"Enceladus orbits Saturn.","name the planet that Aoede circles":"Aoede orbits Jupiter.","S/2006 S1 is a moon of which planet":"S/2006 S1 orbits Saturn.","Harpalyke is a moon of which planet":"Harpalyke orbits Jupiter.","Mab is a moon of which planet":"Mab orbits Uranus.","name the planet that Bestla circles":"Bestla orbits Saturn.","Prospero is a moon of which planet":"Prospero orbits Uranus.","name the planet that Proteus circles":"Proteus orbits Neptune.","which planet does the moon Helene orbit":"Helene orbits Saturn.","Themisto is a moon of which planet":"Themisto orbits Jupiter.","which planet does the moon Carme orbit":"Carme orbits Jupiter.","name the planet that Sycorax circles":"Sycorax orbits Uranus.","name the planet that Cupid circles":"Cupid orbits Uranus.","name the planet that Suttungr circles":"Suttungr orbits Saturn.","name the planet that Praxidike circles":"Praxidike orbits Jupiter.","name the planet that Perdita circles":"Perdita orbits Uranus.","which planet does the moon Kore orbit":"Kore orbits Jupiter.","which planet does the moon Margaret orbit":"Margaret orbits Uranus.","which planet does the moon Orthosie orbit":"Orthosie orbits Jupiter.","which planet does the moon Polydeuces orbit":"Polydeuces orbits Saturn.","name the planet that Ferdinand circles":"Ferdinand orbits Uranus.","name the planet that Eukelade circles":"Eukelade orbits Jupiter.","Naiad is a moon of which planet":"Naiad orbits Neptune.","name the planet that Amalthea circles":"Amalthea orbits Jupiter.","which planet does the moon Rosalind orbit":"Rosalind orbits Uranus.","Thalassa is a moon of which planet":"Thalassa orbits Neptune.","Daphnis is a moon of which planet":"Daphnis orbits Saturn.","Deimos is a moon of which planet":"Deimos orbits Mars."}}},
{"id":"n-f9fed1c6","guard":[["hasAny",["aegir","aitne","amalthea","anthe","aoede","atlas","autonoe","bebhionn","belinda","bergelmir","bestla","bianca","calypso","carme","chaldene","cupid","cyllene","daphnis","deimos","desdemona","despina","elara","element","enceladus","erriapo","eukelade","euporie","europa","farbauti","ferdinand","francisco","galatea","ganymede","halimede","harpalyke","hati","helene","helike","isonoe","item number","janus","jarnsaxa","kalyke","kari","kiviuq","kore","laomedeia","larissa","loge","mab","margaret","megaclite","mundilfari","naiad","narvi","nth","orthosie","pandora","pasiphae","pasithee","perdita","phobos","phoebe","polydeuces","position","praxidike","prometheus","prospero","proteus","puck","reverse the words","reverse word order","rosalind","setebos","sponde","stephano","suttungr","sycorax","tarqeq","tarvos","taygete","telesto","tethys","thalassa","thelxinoe","themisto","thrymr","thyone","titania","trinculo","triton","umbriel","words backwards","ymir"]],["has","planet"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-06fec28b","guard":[["hasAny",["aegir","aitne","amalthea","anthe","aoede","atlas","autonoe","bebhionn","belinda","bergelmir","bestla","bianca","calypso","carme","chaldene","cupid","cyllene","daphnis","deimos","desdemona","despina","each word","elara","element","enceladus","erriapo","eukelade","euporie","europa","farbauti","ferdinand","francisco","galatea","ganymede","halimede","harpalyke","hati","helene","helike","isonoe","item number","janus","jarnsaxa","kalyke","kari","kiviuq","kore","laomedeia","larissa","loge","mab","margaret","megaclite","mundilfari","naiad","narvi","nth","orthosie","pandora","pasiphae","pasithee","perdita","phobos","phoebe","polydeuces","position","praxidike","prometheus","prospero","proteus","puck","rosalind","setebos","split into words","sponde","stephano","suttungr","sycorax","tarqeq","tarvos","taygete","telesto","tethys","thalassa","thelxinoe","themisto","thrymr","thyone","titania","trinculo","triton","umbriel","words","ymir"]],["has","planet"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.and",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-7cd7c570","guard":[["hasAny",["aegir","aitne","amalthea","anthe","aoede","atlas","autonoe","bebhionn","belinda","bergelmir","bestla","bianca","calypso","carme","chaldene","cupid","cyllene","daphnis","deimos","desdemona","despina","each word","elara","element","enceladus","erriapo","eukelade","euporie","europa","farbauti","ferdinand","francisco","galatea","ganymede","halimede","harpalyke","hati","helene","helike","isonoe","item number","janus","jarnsaxa","kalyke","kari","kiviuq","kore","laomedeia","larissa","loge","mab","margaret","megaclite","mundilfari","naiad","narvi","nth","orthosie","pandora","pasiphae","pasithee","perdita","phobos","phoebe","polydeuces","position","praxidike","prometheus","prospero","proteus","puck","rosalind","setebos","split into words","sponde","stephano","suttungr","sycorax","tarqeq","tarvos","taygete","telesto","tethys","thalassa","thelxinoe","themisto","thrymr","thyone","titania","trinculo","triton","umbriel","words","ymir"]],["has","planet"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["transform.words",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-88cb535f","guard":[["hasAny",["a leap year","element","how many vowels","is a leap year","item number","leap year","nth","number of vowels","planet","position","vowel count"]]],"pyramid":["render.yesNo",["compare.isLeap",["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-6d80f8aa","guard":[["hasAny",["appears in","contains","element","has","includes","item number","nth","planet","position"]]],"pyramid":["render.yesNo",["compare.contains",["sense.after",{"lit":"planet"}],["sense.wordAt",{"lit":3}]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-42ee3caf","guard":[["hasAny",["appears in","contains","element","has","includes","item number","moon","nth","position"]],["has","which"]],"pyramid":["render.yesNo",["compare.contains",["sense.after",{"lit":"moon"}],["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-16c1f14c","guard":[["has","planet"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"planet"}]]],"mem":{"table":{"does the moon Anthe orbit":"Anthe orbits Saturn.","does the moon Kari orbit":"Kari orbits Saturn.","does the moon Mundilfari orbit":"Mundilfari orbits Saturn.","that Telesto circles":"Telesto orbits Saturn.","does the moon Despina orbit":"Despina orbits Neptune.","that Francisco circles":"Francisco orbits Uranus.","that Tarvos circles":"Tarvos orbits Saturn.","does the moon S/2003 J18 orbit":"S/2003 J18 orbits Jupiter.","does the moon Sponde orbit":"Sponde orbits Jupiter.","that Atlas circles":"Atlas orbits Saturn.","that S/2004 S17 circles":"S/2004 S17 orbits Saturn.","does the moon Thelxinoe orbit":"Thelxinoe orbits Jupiter.","does the moon S/2003 J10 orbit":"S/2003 J10 orbits Jupiter.","that Bergelmir circles":"Bergelmir orbits Saturn.","does the moon Stephano orbit":"Stephano orbits Uranus.","that Titania circles":"Titania orbits Uranus.","does the moon Bebhionn orbit":"Bebhionn orbits Saturn.","does the moon S/2003 J3 orbit":"S/2003 J3 orbits Jupiter.","that Desdemona circles":"Desdemona orbits Uranus.","that Megaclite circles":"Megaclite orbits Jupiter.","that Phoebe circles":"Phoebe orbits Saturn.","that Elara circles":"Elara orbits Jupiter.","that Chaldene circles":"Chaldene orbits Jupiter.","that S/2003 J19 circles":"S/2003 J19 orbits Jupiter.","that Taygete circles":"Taygete orbits Jupiter.","does the moon Calypso orbit":"Calypso orbits Saturn.","does the moon Halimede orbit":"Halimede orbits Neptune.","does the moon Narvi orbit":"Narvi orbits Saturn.","does the moon Larissa orbit":"Larissa orbits Neptune.","does the moon Farbauti orbit":"Farbauti orbits Saturn.","does the moon Cyllene orbit":"Cyllene orbits Jupiter.","that Ganymede circles":"Ganymede orbits Jupiter.","does the moon Belinda orbit":"Belinda orbits Uranus.","that Erriapo circles":"Erriapo orbits Saturn.","does the moon Tethys orbit":"Tethys orbits Saturn.","does the moon Aitne orbit":"Aitne orbits Jupiter.","does the moon S/2003 J23 orbit":"S/2003 J23 orbits Jupiter.","does the moon Triton orbit":"Triton orbits Neptune.","that Helike circles":"Helike orbits Jupiter.","that Loge circles":"Loge orbits Saturn.","does the moon Puck orbit":"Puck orbits Uranus.","that Autonoe circles":"Autonoe orbits Jupiter.","does the moon Trinculo orbit":"Trinculo orbits Uranus.","does the moon Thyone orbit":"Thyone orbits Jupiter.","that Pandora circles":"Pandora orbits Saturn.","that Galatea circles":"Galatea orbits Neptune.","does the moon Prometheus orbit":"Prometheus orbits Saturn.","does the moon Kalyke orbit":"Kalyke orbits Jupiter.","that Enceladus circles":"Enceladus orbits Saturn.","that Aoede circles":"Aoede orbits Jupiter.","that Bestla circles":"Bestla orbits Saturn.","that Proteus circles":"Proteus orbits Neptune.","does the moon Helene orbit":"Helene orbits Saturn.","does the moon Carme orbit":"Carme orbits Jupiter.","that Sycorax circles":"Sycorax orbits Uranus.","that Cupid circles":"Cupid orbits Uranus.","that Suttungr circles":"Suttungr orbits Saturn.","that Praxidike circles":"Praxidike orbits Jupiter.","that Perdita circles":"Perdita orbits Uranus.","does the moon Kore orbit":"Kore orbits Jupiter.","does the moon Margaret orbit":"Margaret orbits Uranus.","does the moon Orthosie orbit":"Orthosie orbits Jupiter.","does the moon Polydeuces orbit":"Polydeuces orbits Saturn.","that Ferdinand circles":"Ferdinand orbits Uranus.","that Eukelade circles":"Eukelade orbits Jupiter.","that Amalthea circles":"Amalthea orbits Jupiter.","does the moon Rosalind orbit":"Rosalind orbits Uranus."}}},
{"id":"n-f96d552f","guard":[["hasAny",["an even number","element","even","half","half of","halve","is even","item number","nth","planet","position"]]],"pyramid":["render.yesNo",["compare.isEven",["transform.half",["sense.wordCount"]]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-55e6a2a7","guard":[["hasAny",["aitne","amalthea","aoede","autonoe","carme","chaldene","cyllene","elara","eukelade","euporie","europa","ganymede","harpalyke","helike","isonoe","j11","kalyke","kore","megaclite","orthosie","pasiphae","pasithee","praxidike","s2003","sponde","taygete","thelxinoe","themisto","thyone"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Jupiter."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]]],"mem":null},
{"id":"n-c4d0db7f","guard":[["hasAny",["aegir","anthe","atlas","bebhionn","bergelmir","bestla","calypso","daphnis","enceladus","erriapo","farbauti","hati","helene","janus","jarnsaxa","kari","kiviuq","loge","mundilfari","narvi","pandora","phoebe","polydeuces","prometheus","s1","s2004","s2007","suttungr","tarqeq","tarvos","telesto","tethys","thrymr","ymir"]],["has","planet"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Saturn."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]]],"mem":null},
{"id":"n-55b8b0bc","guard":[["hasAny",["element","item number","moon","nth","position"]],["has","a"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["sense.before",{"lit":"is"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-13dba256","guard":[["hasAny",["element","invert case","item number","moon","nth","position","swap case","toggle case"]],["has","a"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["transform.swapCase",["sense.before",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-274dcf01","guard":[["hasAny",["element","item number","lower case","lowercase","moon","nth","position","small letters"]],["has","a"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["transform.lower",["sense.before",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-5381a34f","guard":[["hasAny",["element","in the list","item number","member of","moon","nth","one of","position"]],["has","a"]],"pyramid":["render.yesNo",["compare.member",["sense.words"],["sense.before",{"lit":"is"}]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-b3712b5d","guard":[["has","moon"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"of"}]]],"mem":{"table":{"S/2000 J11 is a moon":"S/2000 J11 orbits Jupiter.","Hati is a moon":"Hati orbits Saturn.","Isonoe is a moon":"Isonoe orbits Jupiter.","Setebos is a moon":"Setebos orbits Uranus.","Pasithee is a moon":"Pasithee orbits Jupiter.","Jarnsaxa is a moon":"Jarnsaxa orbits Saturn.","Pasiphae is a moon":"Pasiphae orbits Jupiter.","S/2004 S7 is a moon":"S/2004 S7 orbits Saturn.","Phobos is a moon":"Phobos orbits Mars.","Bianca is a moon":"Bianca orbits Uranus.","S/2007 S3 is a moon":"S/2007 S3 orbits Saturn.","Tarqeq is a moon":"Tarqeq orbits Saturn.","Thrymr is a moon":"Thrymr orbits Saturn.","Umbriel is a moon":"Umbriel orbits Uranus.","S/2003 J15 is a moon":"S/2003 J15 orbits Jupiter.","S/2003 J9 is a moon":"S/2003 J9 orbits Jupiter.","Ymir is a moon":"Ymir orbits Saturn.","Janus is a moon":"Janus orbits Saturn.","Euporie is a moon":"Euporie orbits Jupiter.","S/2003 J12 is a moon":"S/2003 J12 orbits Jupiter.","Europa is a moon":"Europa orbits Jupiter.","Laomedeia is a moon":"Laomedeia orbits Neptune.","Kiviuq is a moon":"Kiviuq orbits Saturn.","Aegir is a moon":"Aegir orbits Saturn.","S/2006 S1 is a moon":"S/2006 S1 orbits Saturn.","Harpalyke is a moon":"Harpalyke orbits Jupiter.","Mab is a moon":"Mab orbits Uranus.","Prospero is a moon":"Prospero orbits Uranus.","Themisto is a moon":"Themisto orbits Jupiter.","Naiad is a moon":"Naiad orbits Neptune.","Thalassa is a moon":"Thalassa orbits Neptune.","Daphnis is a moon":"Daphnis orbits Saturn.","Deimos is a moon":"Deimos orbits Mars."}}},
{"id":"n-ed7e1278","guard":[["has","moon"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"is"}]]],"mem":{"table":{"S/2000 J11":"S/2000 J11 orbits Jupiter.","Hati":"Hati orbits Saturn.","Isonoe":"Isonoe orbits Jupiter.","Setebos":"Setebos orbits Uranus.","Pasithee":"Pasithee orbits Jupiter.","Jarnsaxa":"Jarnsaxa orbits Saturn.","Pasiphae":"Pasiphae orbits Jupiter.","S/2004 S7":"S/2004 S7 orbits Saturn.","Phobos":"Phobos orbits Mars.","Bianca":"Bianca orbits Uranus.","S/2007 S3":"S/2007 S3 orbits Saturn.","Tarqeq":"Tarqeq orbits Saturn.","Thrymr":"Thrymr orbits Saturn.","Umbriel":"Umbriel orbits Uranus.","S/2003 J15":"S/2003 J15 orbits Jupiter.","S/2003 J9":"S/2003 J9 orbits Jupiter.","Ymir":"Ymir orbits Saturn.","Janus":"Janus orbits Saturn.","Euporie":"Euporie orbits Jupiter.","S/2003 J12":"S/2003 J12 orbits Jupiter.","Europa":"Europa orbits Jupiter.","Laomedeia":"Laomedeia orbits Neptune.","Kiviuq":"Kiviuq orbits Saturn.","Aegir":"Aegir orbits Saturn.","S/2006 S1":"S/2006 S1 orbits Saturn.","Harpalyke":"Harpalyke orbits Jupiter.","Mab":"Mab orbits Uranus.","Prospero":"Prospero orbits Uranus.","Themisto":"Themisto orbits Jupiter.","Naiad":"Naiad orbits Neptune.","Thalassa":"Thalassa orbits Neptune.","Daphnis":"Daphnis orbits Saturn.","Deimos":"Deimos orbits Mars."}}},
{"id":"n-d13b939e","guard":[["hasAny",["anthe","atlas","bebhionn","bergelmir","bestla","calypso","enceladus","erriapo","farbauti","helene","item number","kari","loge","mundilfari","narvi","nth","pandora","phoebe","polydeuces","position","prometheus","suttungr","tarvos","telesto","tethys"]],["has","planet"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Saturn."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ec1e888c","guard":[["hasAny",["aitne","amalthea","aoede","autonoe","carme","chaldene","cyllene","elara","eukelade","ganymede","helike","item number","kalyke","kore","megaclite","nth","orthosie","position","praxidike","sponde","taygete","thelxinoe","thyone"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Jupiter."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2847506c","guard":[["hasAny",["belinda","bianca","cupid","desdemona","ferdinand","francisco","mab","margaret","perdita","prospero","puck","rosalind","setebos","stephano","sycorax","titania","trinculo","umbriel"]],["has","planet"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Uranus."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]]],"mem":null},
{"id":"n-b6ee121f","guard":[["hasAny",["amalthea","autonoe","chaldene","cyllene","eukelade","euporie","europa","ganymede","harpalyke","isonoe","longest","longest one","longest word","megaclite","orthosie","pasiphae","pasithee","praxidike","taygete","thelxinoe","themisto"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Jupiter."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a69e9743","guard":[["hasAny",["bebhionn","bergelmir","calypso","daphnis","enceladus","erriapo","farbauti","jarnsaxa","kiviuq","longest","longest one","longest word","mundilfari","pandora","polydeuces","prometheus","suttungr","tarqeq","telesto","thrymr"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Saturn."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d0136c73","guard":[["hasAny",["belinda","bianca","desdemona","ferdinand","francisco","longest","longest one","longest word","margaret","perdita","prospero","rosalind","setebos","stephano","sycorax","titania","trinculo","umbriel"]],["has","planet"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Uranus."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-01f39bbd","guard":[["hasAny",["element","item number","j11","no vowels","nth","position","remove vowels","s1","s2003","s2004","s2007","thrymr","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["transform.noVowels",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-50e75b14","guard":[["hasAny",["element","item number","nth","planet","position"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}],["sense.howMany"]]],"mem":null},
{"id":"n-be070d6c","guard":[["hasAny",["a prime number","element","is prime","item number","nth","planet","position","prime","prime number"]]],"pyramid":["render.yesNo",["compare.isPrime",["sense.first"]],{"lit":"Jupiter"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-f364685f","guard":[["hasAny",["element","item number","nth","planet","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],["sense.howMany"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-fbc56a56","guard":[["hasAny",["element","item number","nth","planet","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],["sense.howMany"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-165f1d5d","guard":[["hasAny",["at least","element","greater than or equal to","item number","no less than","nth","planet","position"]]],"pyramid":["render.yesNo",["compare.atLeast",{"lit":2004},["sense.first"]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],{"lit":"Saturn"}],"mem":null},
{"id":"n-2217378f","guard":[["hasAny",["coprime","element","item number","nth","planet","position","relatively prime","share no factor"]]],"pyramid":["render.yesNo",["compare.coprime",["sense.first"],{"lit":3}],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],{"lit":"Saturn"}],"mem":null},
{"id":"n-90a57d06","guard":[["hasAny",["divides","divisible by","element","evenly divisible","item number","multiple of","nth","planet","position"]]],"pyramid":["render.yesNo",["compare.divisible",["sense.first"],{"lit":12}],{"lit":"Saturn"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-b2f8f5cc","guard":[["hasAny",["coprime","element","fib","fibonacci","fibonacci number","item number","nth","planet","position","relatively prime","share no factor"]]],"pyramid":["render.yesNo",["compare.coprime",["sense.first"],["compute.fibonacci",["sense.wordCount"]]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],{"lit":"Saturn"}],"mem":null},
{"id":"n-6aff55a4","guard":[["hasAny",["an even number","element","even","is even","item number","nth","planet","position"]]],"pyramid":["render.yesNo",["compare.isEven",["sense.first"]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-5d391423","guard":[["hasAny",["belinda","cupid","desdemona","ferdinand","francisco","item number","margaret","nth","perdita","position","puck","rosalind","stephano","sycorax","titania","trinculo"]],["has","planet"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Uranus."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-66b2184b","guard":[["hasAny",["at least","greater than or equal to","no less than","planet"]]],"pyramid":["render.yesNo",["compare.atLeast",["sense.first"],{"lit":2004}],{"lit":"Saturn"},{"lit":"Jupiter"}],"mem":null},
{"id":"n-c4431f95","guard":[["hasAny",["aegir","daphnis","hati","janus","jarnsaxa","kiviuq","s1","s2004","s2007","tarqeq","thrymr","ymir"]],["has","moon"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Saturn."]},["sense.before",{"lit":"is"}]],"mem":null},
{"id":"n-6777c2c4","guard":[["hasAny",["aegir","all caps","capital letters","capitals","daphnis","hati","janus","jarnsaxa","kiviuq","s1","s2004","s2007","tarqeq","thrymr","upper case","uppercase","ymir"]],["has","moon"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Saturn."]},["transform.upper",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-9972ca8e","guard":[["hasAny",["aegir","daphnis","hati","janus","jarnsaxa","kiviuq","lower case","lowercase","s1","s2004","s2007","small letters","tarqeq","thrymr","ymir"]],["has","moon"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Saturn."]},["transform.lower",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-a536b354","guard":[["hasAny",["aegir","daphnis","hati","invert case","janus","jarnsaxa","kiviuq","s1","s2004","s2007","swap case","tarqeq","thrymr","toggle case","ymir"]],["has","moon"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Saturn."]},["transform.swapCase",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-119b6025","guard":[["hasAny",["appears in","contains","element","has","includes","item number","moon","nth","position"]]],"pyramid":["render.yesNo",["compare.contains",["sense.after",{"lit":"moon"}],["sense.numeral"]],{"lit":"Jupiter"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-17d7b483","guard":[["hasAny",["coprime","element","half","half of","halve","item number","moon","nth","position","relatively prime","share no factor"]]],"pyramid":["render.yesNo",["compare.coprime",["sense.first"],["transform.half",["sense.wordCount"]]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-f003f7ca","guard":[["hasAny",["euporie","europa","harpalyke","isonoe","j11","pasiphae","pasithee","s2003","themisto"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Jupiter."]},["sense.before",{"lit":"is"}]],"mem":null},
{"id":"n-10e2c942","guard":[["hasAny",["atlas","bergelmir","bestla","enceladus","erriapo","item number","loge","nth","pandora","phoebe","position","suttungr","tarvos","telesto"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Saturn."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-18b4f4ff","guard":[["hasAny",["euporie","europa","harpalyke","isonoe","j11","lower case","lowercase","pasiphae","pasithee","s2003","small letters","themisto"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Jupiter."]},["transform.lower",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-1f57ee81","guard":[["hasAny",["all caps","capital letters","capitals","euporie","europa","harpalyke","isonoe","j11","pasiphae","pasithee","s2003","themisto","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Jupiter."]},["transform.upper",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-5543b56b","guard":[["hasAny",["euporie","europa","harpalyke","invert case","isonoe","j11","pasiphae","pasithee","s2003","swap case","themisto","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Jupiter."]},["transform.swapCase",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-61e0ad74","guard":[["hasAny",["amalthea","aoede","autonoe","chaldene","elara","eukelade","ganymede","helike","item number","megaclite","nth","position","praxidike","taygete"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Jupiter."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2f43cb59","guard":[["hasAny",["a leap year","binomial coefficient","choose","combinations","is a leap year","leap year","n choose k","planet","ways to choose"]]],"pyramid":["render.yesNo",["compare.isLeap",["compute.choose",["sense.first"],{"lit":2003}]],{"lit":"Saturn"},{"lit":"Jupiter"}],"mem":null},
{"id":"n-30ab5d88","guard":[["hasAny",["despina","galatea","halimede","laomedeia","larissa","naiad","proteus","thalassa","triton"]],["has","planet"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Neptune."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]]],"mem":null},
{"id":"n-05ec460b","guard":[["hasAny",["j11","s2003"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"Jupiter"},["sense.howMany"]]],"mem":null},
{"id":"n-4d81a8ce","guard":[["hasAny",["aegir","daphnis","hati","janus","jarnsaxa","kiviuq","tarqeq","thrymr","ymir"]],["has","moon"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Saturn."]},["sense.wordAt",{"lit":1}]],"mem":null},
{"id":"n-6ff1cd7c","guard":[["hasAny",["j11","s2003"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"jupiter"},["sense.howMany"]]],"mem":null},
{"id":"n-0b527e57","guard":[["hasAny",["aegir","capitalise","capitalize","capitalize each word","daphnis","hati","janus","jarnsaxa","kiviuq","tarqeq","thrymr","title case","ymir"]],["has","moon"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Saturn."]},["transform.title",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-111ac305","guard":[["hasAny",["aegir","daphnis","hati","janus","jarnsaxa","kiviuq","lower case","lowercase","small letters","tarqeq","thrymr","ymir"]],["has","moon"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Saturn."]},["transform.lower",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-712d7dbe","guard":[["hasAny",["aegir","all caps","capital letters","capitals","daphnis","hati","janus","jarnsaxa","kiviuq","tarqeq","thrymr","upper case","uppercase","ymir"]],["has","moon"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Saturn."]},["transform.upper",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-813573ac","guard":[["hasAny",["j11","s2003","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," ",{"slot":1}," orbits Jupiter."]},["sense.numeral"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9b7b40d1","guard":[["hasAny",["aegir","daphnis","hati","invert case","janus","jarnsaxa","kiviuq","swap case","tarqeq","thrymr","toggle case","ymir"]],["has","moon"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Saturn."]},["transform.swapCase",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-2cd89fa3","guard":[["hasAny",["j11","s2003","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," ",{"slot":1}," orbits Jupiter."]},["render.number",["sense.first"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-44952478","guard":[["hasAny",["j11","s2003","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," ",{"slot":1}," orbits Jupiter."]},["render.listNums",["sense.numbers"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4b950b9e","guard":[["hasAny",["as text","as words","j11","s2003","shortest","shortest one","shortest word","written out"]]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," ",{"slot":1}," orbits Jupiter."]},["render.list",["transform.asText",["sense.numbers"]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8c833b1f","guard":[["hasAny",["as text","as words","j11","s2003","shortest","shortest one","shortest word","written out"]]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," ",{"slot":1}," orbits Jupiter."]},["render.and",["transform.asText",["sense.numbers"]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-299f7353","guard":[["hasAny",["diagonal","hypotenuse","j11","pythagoras","pythagorean","s2003","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," ",{"slot":1}," orbits Jupiter."]},["render.number",["compute.hypot",["sense.first"],["sense.wordCount"]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a37759d8","guard":[["hasAny",["diagonal","hypotenuse","j11","pythagoras","pythagorean","s2003","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," ",{"slot":1}," orbits Jupiter."]},["render.number",["compute.hypot",["sense.first"],["sense.howMany"]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a4ed79e0","guard":[["hasAny",["diagonal","hypotenuse","j11","pythagoras","pythagorean","s2003","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," ",{"slot":1}," orbits Jupiter."]},["render.number",["compute.hypot",["sense.first"],{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-497d863f","guard":[["hasAny",["s2003","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["S/2003 ",{"slot":0}," orbits Jupiter."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7be5f461","guard":[["hasAny",["despina","galatea","halimede","laomedeia","larissa","longest","longest one","longest word","proteus","thalassa"]],["has","planet"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Neptune."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-90fc4649","guard":[["hasAny",["euporie","europa","harpalyke","isonoe","pasiphae","pasithee","themisto"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Jupiter."]},["sense.wordAt",{"lit":1}]],"mem":null},
{"id":"n-5baa5633","guard":[["hasAny",["cupid","desdemona","ferdinand","francisco","item number","nth","perdita","position","sycorax","titania"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Uranus."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8745d162","guard":[["hasAny",["capitalise","capitalize","capitalize each word","euporie","europa","harpalyke","isonoe","pasiphae","pasithee","themisto","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Jupiter."]},["transform.title",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-92a938c9","guard":[["hasAny",["euporie","europa","harpalyke","isonoe","lower case","lowercase","pasiphae","pasithee","small letters","themisto"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Jupiter."]},["transform.lower",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-ef1151a6","guard":[["hasAny",["euporie","europa","harpalyke","invert case","isonoe","pasiphae","pasithee","swap case","themisto","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Jupiter."]},["transform.swapCase",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-4eff1964","guard":[["hasAny",["despina","galatea","halimede","item number","larissa","nth","position","proteus","triton"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Neptune."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-40d477ee","guard":[["hasAny",["bianca","mab","prospero","setebos","umbriel"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Uranus."]},["sense.before",{"lit":"is"}]],"mem":null},
{"id":"n-ac081584","guard":[["hasAny",["bianca","mab","prospero","setebos","umbriel"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Uranus."]},["sense.wordAt",{"lit":1}]],"mem":null},
{"id":"n-460200eb","guard":[["hasAny",["bianca","invert case","mab","prospero","setebos","swap case","toggle case","umbriel"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Uranus."]},["transform.swapCase",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-58fbb16a","guard":[["hasAny",["bianca","invert case","mab","prospero","setebos","swap case","toggle case","umbriel"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Uranus."]},["transform.swapCase",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-68dc9e27","guard":[["hasAny",["all caps","bianca","capital letters","capitals","mab","prospero","setebos","umbriel","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Uranus."]},["transform.upper",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-6bfbe956","guard":[["hasAny",["bianca","capitalise","capitalize","capitalize each word","mab","prospero","setebos","title case","umbriel"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Uranus."]},["transform.title",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-84c40ce2","guard":[["hasAny",["all caps","bianca","capital letters","capitals","mab","prospero","setebos","umbriel","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Uranus."]},["transform.upper",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-b5bc836b","guard":[["hasAny",["bianca","lower case","lowercase","mab","prospero","setebos","small letters","umbriel"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Uranus."]},["transform.lower",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-b79e52dc","guard":[["hasAny",["bianca","lower case","lowercase","mab","prospero","setebos","small letters","umbriel"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Uranus."]},["transform.lower",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-e63fd3f3","guard":[["hasAny",["item number","j19","nth","orbit","position"]]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," ",{"slot":1}," orbits Jupiter."]},["render.listNums",["sense.numbers"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-17936440","guard":[["hasAny",["delete","element","item number","nth","planet","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}],["sense.unit"]]],"mem":null},
{"id":"n-5ff78047","guard":[["hasAny",["coprime","element","half","half of","halve","item number","nth","planet","position","relatively prime","share no factor"]]],"pyramid":["render.yesNo",["compare.coprime",["sense.wordCount"],["transform.half",["sense.first"]]],{"lit":"Saturn"},["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-f1a96a70","guard":[["hasAny",["coprime","element","half","half of","halve","item number","nth","planet","position","relatively prime","share no factor"]]],"pyramid":["render.yesNo",["compare.coprime",{"lit":3},["transform.half",["sense.first"]]],["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],{"lit":"Saturn"}],"mem":null},
{"id":"n-070ccfc4","guard":[["hasAny",["s1","s2004","s2007"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"Saturn"},["sense.howMany"]]],"mem":null},
{"id":"n-440615e1","guard":[["hasAny",["s1","s2004","s2007"]]],"pyramid":["render.list",["iterate.repeat",{"lit":"saturn"},["sense.howMany"]]],"mem":null},
{"id":"n-9632c240","guard":[["hasAny",["delete","planet","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Saturn"},["sense.unit"]]],"mem":null},
{"id":"n-2c10a585","guard":[["hasAny",["no vowels","remove vowels","s1","s2004","s2007","thrymr","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Saturn."]},["transform.noVowels",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-350afc6c","guard":[["hasAny",["j11","no vowels","remove vowels","s2003","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Jupiter."]},["transform.noVowels",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-557168b7","guard":[["hasAny",["planet","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"/",{"slot":1}," ",{"slot":2}," orbits Saturn."]},["sense.unit"],["sense.numeral"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a3c08f01","guard":[["hasAny",["s1","s2004","s2007","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," ",{"slot":1}," orbits Saturn."]},["render.listNums",["sense.numbers"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-02d46663","guard":[["hasAny",["planet","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"/",{"slot":1}," ",{"slot":2}," orbits Saturn."]},["sense.unit"],["render.listNums",["sense.numbers"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-33f92c9a","guard":[["hasAny",["planet","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"/",{"slot":1}," ",{"slot":2}," orbits Saturn."]},["sense.unit"],["render.number",["sense.first"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-253bd90d","guard":[["hasAny",["as text","as words","planet","shortest","shortest one","shortest word","written out"]]],"pyramid":["render.template",{"lit":[{"slot":0},"/",{"slot":1}," ",{"slot":2}," orbits Saturn."]},["sense.unit"],["render.list",["transform.asText",["sense.numbers"]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-37d624e4","guard":[["hasAny",["planet","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"/",{"slot":1}," ",{"slot":2}," orbits Saturn."]},["render.list",["sense.units"]],["render.listNums",["sense.numbers"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7cca1937","guard":[["hasAny",["as text","as words","planet","shortest","shortest one","shortest word","written out"]]],"pyramid":["render.template",{"lit":[{"slot":0},"/",{"slot":1}," ",{"slot":2}," orbits Saturn."]},["sense.unit"],["render.and",["transform.asText",["sense.numbers"]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a6b517ee","guard":[["hasAny",["planet","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"/",{"slot":1}," ",{"slot":2}," orbits Saturn."]},["render.and",["sense.units"]],["render.listNums",["sense.numbers"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cb7b01ad","guard":[["hasAny",["abbreviate","abbreviation","acronym","planet","short form","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"/",{"slot":1}," ",{"slot":2}," orbits Saturn."]},["transform.acronym",["sense.unit"]],["render.listNums",["sense.numbers"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4df87ec0","guard":[["hasAny",["diagonal","hypotenuse","planet","pythagoras","pythagorean","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"/",{"slot":1}," ",{"slot":2}," orbits Saturn."]},["sense.unit"],["render.number",["compute.hypot",["sense.first"],["sense.howMany"]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d687ffea","guard":[["hasAny",["diagonal","hypotenuse","planet","pythagoras","pythagorean","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"/",{"slot":1}," ",{"slot":2}," orbits Saturn."]},["sense.unit"],["render.number",["compute.hypot",["sense.first"],{"lit":2}]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f1647c8c","guard":[["hasAny",["diagonal","hypotenuse","planet","pythagoras","pythagorean","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"/",{"slot":1}," ",{"slot":2}," orbits Saturn."]},["sense.unit"],["render.number",["compute.hypot",["sense.first"],["sense.wordCount"]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-715e9352","guard":[["hasAny",["laomedeia","naiad","thalassa"]],["has","is"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Neptune."]},["sense.wordAt",{"lit":1}]],"mem":null},
{"id":"n-a5614502","guard":[["hasAny",["laomedeia","naiad","thalassa"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Neptune."]},["sense.before",{"lit":"is"}]],"mem":null},
{"id":"n-06fa654d","guard":[["hasAny",["invert case","laomedeia","naiad","swap case","thalassa","toggle case"]],["has","is"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Neptune."]},["transform.swapCase",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-0e165765","guard":[["hasAny",["laomedeia","lower case","lowercase","naiad","small letters","thalassa"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Neptune."]},["transform.lower",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-49e61dde","guard":[["hasAny",["all caps","capital letters","capitals","laomedeia","naiad","thalassa","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Neptune."]},["transform.upper",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-8d4f6a6d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","laomedeia","naiad","thalassa","title case"]],["has","is"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Neptune."]},["transform.title",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-affa1281","guard":[["hasAny",["laomedeia","lower case","lowercase","naiad","small letters","thalassa"]],["has","is"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Neptune."]},["transform.lower",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-d4555a84","guard":[["hasAny",["invert case","laomedeia","naiad","swap case","thalassa","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Neptune."]},["transform.swapCase",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-dd9a25b2","guard":[["hasAny",["all caps","capital letters","capitals","laomedeia","naiad","thalassa","upper case","uppercase"]],["has","is"]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Neptune."]},["transform.upper",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-da53c34b","guard":[["hasAny",["deimos","phobos"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Mars."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]]],"mem":null},
{"id":"n-756e1808","guard":[["hasAny",["alphabetize the letters","deimos","element","item number","letters in order","nth","phobos","position","sort the letters"]]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-5b0fd9c3","guard":[["hasAny",["alphabetize the letters","deimos","element","item number","letters in order","nth","phobos","position","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits ",{"slot":1},"."]},["render.list",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}]],["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]]],"mem":null},
{"id":"n-2f3e2c5b","guard":[["hasAny",["deimos","phobos"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Mars."]},["sense.before",{"lit":"is"}]],"mem":null},
{"id":"n-5777301b","guard":[["hasAny",["deimos","phobos"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Mars."]},["sense.wordAt",{"lit":1}]],"mem":null},
{"id":"n-5b14a498","guard":[["hasAny",["deimos","longest","longest one","longest word","phobos"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Mars."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0f75095c","guard":[["hasAny",["deimos","lower case","lowercase","phobos","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Mars."]},["transform.lower",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-1f6e3b3a","guard":[["hasAny",["all caps","capital letters","capitals","deimos","phobos","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Mars."]},["transform.upper",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-31c22f69","guard":[["hasAny",["deimos","invert case","phobos","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Mars."]},["transform.swapCase",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-48252ab0","guard":[["hasAny",["deimos","invert case","phobos","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Mars."]},["transform.swapCase",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-76068bab","guard":[["hasAny",["galatea","item number","nth","position","proteus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Neptune."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-cdea4737","guard":[["hasAny",["s2004","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"/2004 ",{"slot":1}," orbits Saturn."]},["sense.unit"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d224d902","guard":[["hasAny",["capitalise","capitalize","capitalize each word","deimos","phobos","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Mars."]},["transform.title",["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-f61d1213","guard":[["hasAny",["deimos","lower case","lowercase","phobos","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," orbits Mars."]},["transform.lower",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-046cfda9","guard":[["hasAny",["element","item number","kiviuq","nth","position"]]],"pyramid":["render.template",{"lit":["Kiviuq orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-07215377","guard":[["hasAny",["element","hati","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Hati orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-0ad8cd98","guard":[["hasAny",["element","item number","kore","nth","position"]]],"pyramid":["render.template",{"lit":["Kore orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-0c23c7b4","guard":[["hasAny",["element","item number","mab","nth","position"]]],"pyramid":["render.template",{"lit":["Mab orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-134e4aa7","guard":[["hasAny",["element","item number","nth","pandora","position"]]],"pyramid":["render.template",{"lit":["Pandora orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-16bec66d","guard":[["hasAny",["cyllene","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Cyllene orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-178d6b46","guard":[["hasAny",["element","item number","nth","position","s1"]]],"pyramid":["render.template",{"lit":["S/2006 S1 orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-1af056fe","guard":[["hasAny",["carme","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Carme orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-1b08d7ee","guard":[["hasAny",["element","item number","narvi","nth","position"]]],"pyramid":["render.template",{"lit":["Narvi orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-1bee9b1a","guard":[["hasAny",["element","item number","naiad","nth","position"]]],"pyramid":["render.template",{"lit":["Naiad orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-217bb3d6","guard":[["hasAny",["element","item number","laomedeia","nth","position"]]],"pyramid":["render.template",{"lit":["Laomedeia orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-25d799ba","guard":[["hasAny",["bergelmir","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Bergelmir orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-25fa12aa","guard":[["hasAny",["element","isonoe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Isonoe orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-2a9b7ad3","guard":[["hasAny",["element","item number","nth","position","themisto"]]],"pyramid":["render.template",{"lit":["Themisto orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-2dad4fd8","guard":[["hasAny",["aoede","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Aoede orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-324a601b","guard":[["hasAny",["element","item number","margaret","nth","position"]]],"pyramid":["render.template",{"lit":["Margaret orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-3ab6c409","guard":[["hasAny",["element","item number","nth","position","praxidike"]]],"pyramid":["render.template",{"lit":["Praxidike orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-3c5fdcc4","guard":[["hasAny",["element","item number","megaclite","nth","position"]]],"pyramid":["render.template",{"lit":["Megaclite orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-3cd4fa32","guard":[["hasAny",["element","europa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Europa orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-3ea9facf","guard":[["hasAny",["element","helene","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Helene orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-40c643be","guard":[["hasAny",["element","item number","nth","position","tarvos"]]],"pyramid":["render.template",{"lit":["Tarvos orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-42f8db98","guard":[["hasAny",["element","item number","nth","position","prometheus"]]],"pyramid":["render.template",{"lit":["Prometheus orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-4359f82e","guard":[["hasAny",["element","item number","j3","nth","position"]]],"pyramid":["render.template",{"lit":["S/2003 J3 orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-4a43fda9","guard":[["hasAny",["element","item number","nth","position","setebos"]]],"pyramid":["render.template",{"lit":["Setebos orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-4c58ab01","guard":[["hasAny",["element","item number","j23","nth","position"]]],"pyramid":["render.template",{"lit":["S/2003 J23 orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-4fe8683c","guard":[["hasAny",["element","item number","j19","nth","position"]]],"pyramid":["render.template",{"lit":["S/2003 J19 orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-53a6aac5","guard":[["hasAny",["element","item number","nth","position","trinculo"]]],"pyramid":["render.template",{"lit":["Trinculo orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-54f77b51","guard":[["hasAny",["element","item number","nth","position","tethys"]]],"pyramid":["render.template",{"lit":["Tethys orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-552f5fad","guard":[["hasAny",["element","item number","nth","phoebe","position"]]],"pyramid":["render.template",{"lit":["Phoebe orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-56ffd24e","guard":[["hasAny",["element","farbauti","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Farbauti orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-58bad5bc","guard":[["hasAny",["element","item number","nth","position","thalassa"]],["has","is"]],"pyramid":["render.template",{"lit":["Thalassa orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-59b5882a","guard":[["hasAny",["aitne","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Aitne orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-5a6608e8","guard":[["hasAny",["element","harpalyke","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Harpalyke orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-5e15c623","guard":[["hasAny",["element","item number","larissa","nth","position"]]],"pyramid":["render.template",{"lit":["Larissa orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-5e1e1d95","guard":[["hasAny",["element","item number","nth","position","taygete"]]],"pyramid":["render.template",{"lit":["Taygete orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-6018041f","guard":[["hasAny",["element","helike","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Helike orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-60abd62d","guard":[["hasAny",["elara","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Elara orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-61270dab","guard":[["hasAny",["element","item number","nth","position","sponde"]]],"pyramid":["render.template",{"lit":["Sponde orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-69efbeb9","guard":[["hasAny",["element","enceladus","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Enceladus orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-6ac1c7a1","guard":[["hasAny",["element","item number","nth","position","ymir"]]],"pyramid":["render.template",{"lit":["Ymir orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-6bcf9740","guard":[["hasAny",["anthe","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Anthe orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-6cfa51ac","guard":[["hasAny",["element","item number","nth","pasithee","position"]]],"pyramid":["render.template",{"lit":["Pasithee orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-6d8017b7","guard":[["hasAny",["element","ganymede","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Ganymede orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-6f554068","guard":[["hasAny",["element","item number","j18","nth","position"]]],"pyramid":["render.template",{"lit":["S/2003 J18 orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-72c5bef5","guard":[["hasAny",["element","item number","nth","position","telesto"]]],"pyramid":["render.template",{"lit":["Telesto orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-733b0b6a","guard":[["hasAny",["element","ferdinand","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Ferdinand orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-739164a1","guard":[["hasAny",["bestla","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Bestla orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-74099aef","guard":[["hasAny",["autonoe","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Autonoe orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-77404017","guard":[["hasAny",["element","item number","nth","phobos","position"]]],"pyramid":["render.template",{"lit":["Phobos orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-7b187baa","guard":[["hasAny",["element","halimede","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Halimede orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-7c0655d8","guard":[["hasAny",["element","item number","janus","nth","position"]],["has","moon"]],"pyramid":["render.template",{"lit":["Janus orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-7fefdb87","guard":[["hasAny",["element","item number","nth","position","thelxinoe"]]],"pyramid":["render.template",{"lit":["Thelxinoe orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-833b6f86","guard":[["hasAny",["element","item number","nth","perdita","position"]]],"pyramid":["render.template",{"lit":["Perdita orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-848d8ef5","guard":[["hasAny",["element","eukelade","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Eukelade orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-852eef5e","guard":[["hasAny",["element","item number","kari","nth","position"]]],"pyramid":["render.template",{"lit":["Kari orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-8608187a","guard":[["hasAny",["element","item number","j11","nth","position"]]],"pyramid":["render.template",{"lit":["S/2000 J11 orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-894694a3","guard":[["hasAny",["element","item number","nth","polydeuces","position"]]],"pyramid":["render.template",{"lit":["Polydeuces orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-8b028a2c","guard":[["hasAny",["element","item number","nth","position","s7"]]],"pyramid":["render.template",{"lit":["S/2004 S7 orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-8bf54a4b","guard":[["hasAny",["amalthea","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Amalthea orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-8f13fc4e","guard":[["hasAny",["element","item number","nth","position","suttungr"]]],"pyramid":["render.template",{"lit":["Suttungr orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-8f421ba8","guard":[["hasAny",["calypso","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Calypso orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-8f6560e8","guard":[["hasAny",["bebhionn","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Bebhionn orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-8ff6b013","guard":[["hasAny",["element","euporie","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Euporie orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-9481eb4e","guard":[["hasAny",["element","item number","nth","orthosie","position"]]],"pyramid":["render.template",{"lit":["Orthosie orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-9c39bd08","guard":[["hasAny",["element","item number","j10","nth","position"]]],"pyramid":["render.template",{"lit":["S/2003 J10 orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-9fab8f52","guard":[["hasAny",["element","item number","nth","position","sycorax"]]],"pyramid":["render.template",{"lit":["Sycorax orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-a565a315","guard":[["hasAny",["element","item number","kalyke","nth","position"]]],"pyramid":["render.template",{"lit":["Kalyke orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-a641b6e5","guard":[["hasAny",["element","item number","nth","position","puck"]]],"pyramid":["render.template",{"lit":["Puck orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-a6e7b3ec","guard":[["hasAny",["element","item number","nth","position","proteus"]]],"pyramid":["render.template",{"lit":["Proteus orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-a85ca46e","guard":[["hasAny",["desdemona","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Desdemona orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-aed660cd","guard":[["hasAny",["element","item number","nth","position","tarqeq"]]],"pyramid":["render.template",{"lit":["Tarqeq orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-b2416071","guard":[["hasAny",["element","item number","nth","position","thrymr"]]],"pyramid":["render.template",{"lit":["Thrymr orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-b7d386ec","guard":[["hasAny",["element","erriapo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Erriapo orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-b8e4a28c","guard":[["hasAny",["cupid","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Cupid orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-bfd1a70a","guard":[["hasAny",["bianca","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Bianca orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-bfd4fd33","guard":[["hasAny",["element","item number","nth","position","stephano"]]],"pyramid":["render.template",{"lit":["Stephano orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-c1e40389","guard":[["hasAny",["element","item number","j12","nth","position"]]],"pyramid":["render.template",{"lit":["S/2003 J12 orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-c439adab","guard":[["hasAny",["aegir","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Aegir orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-c554cc7e","guard":[["hasAny",["despina","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Despina orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-c646b729","guard":[["hasAny",["belinda","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Belinda orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-c9a71fbd","guard":[["hasAny",["element","item number","nth","position","rosalind"]]],"pyramid":["render.template",{"lit":["Rosalind orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-c9c69869","guard":[["hasAny",["element","item number","loge","nth","position"]]],"pyramid":["render.template",{"lit":["Loge orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-cbe70859","guard":[["hasAny",["element","galatea","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Galatea orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-cd2fa8d4","guard":[["hasAny",["element","item number","nth","position","triton"]]],"pyramid":["render.template",{"lit":["Triton orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-cd372812","guard":[["hasAny",["element","item number","jarnsaxa","nth","position"]]],"pyramid":["render.template",{"lit":["Jarnsaxa orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-d0618aba","guard":[["hasAny",["element","item number","mundilfari","nth","position"]]],"pyramid":["render.template",{"lit":["Mundilfari orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-d4011761","guard":[["hasAny",["element","item number","nth","position","thyone"]]],"pyramid":["render.template",{"lit":["Thyone orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-d8a7ffc5","guard":[["hasAny",["element","item number","j15","nth","position"]]],"pyramid":["render.template",{"lit":["S/2003 J15 orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-dbda353b","guard":[["hasAny",["atlas","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Atlas orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-df46df43","guard":[["hasAny",["element","item number","nth","pasiphae","position"]]],"pyramid":["render.template",{"lit":["Pasiphae orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-e1c7d49b","guard":[["hasAny",["daphnis","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Daphnis orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-e2fbfa20","guard":[["hasAny",["element","item number","nth","position","umbriel"]]],"pyramid":["render.template",{"lit":["Umbriel orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-e94c8d87","guard":[["hasAny",["element","item number","nth","position","titania"]]],"pyramid":["render.template",{"lit":["Titania orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-ecd2cc13","guard":[["hasAny",["element","francisco","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Francisco orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-f051bb92","guard":[["hasAny",["element","item number","nth","position","s17"]]],"pyramid":["render.template",{"lit":["S/2004 S17 orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-f153301d","guard":[["hasAny",["element","item number","nth","position","s2007"]]],"pyramid":["render.template",{"lit":["S/2007 S3 orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-f1ed5b6f","guard":[["hasAny",["deimos","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Deimos orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-f39ca0c5","guard":[["hasAny",["chaldene","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Chaldene orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-f6962418","guard":[["hasAny",["element","item number","nth","position","prospero"]]],"pyramid":["render.template",{"lit":["Prospero orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-fb9dccf5","guard":[["hasAny",["element","item number","j9","nth","position"]]],"pyramid":["render.template",{"lit":["S/2003 J9 orbits ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-planets-moons"},{"lit":"moon"}],{"lit":1}],{"lit":"corpora-planets-moons"},{"lit":"moon"},{"lit":"planet"}]],"mem":null},
{"id":"n-014c2d10","guard":[["hasAny",["janus","moon","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Janus is a moon of which planet":"Janus orbits Saturn."}}},
{"id":"n-07594628","guard":[["hasAny",["moon","planet","s2004","s7"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"S/2004 S7 is a moon of which planet":"S/2004 S7 orbits Saturn."}}},
{"id":"n-07e501c5","guard":[["hasAny",["moon","orbit","orthosie","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Orthosie orbit":"Orthosie orbits Jupiter."}}},
{"id":"n-0bf83c70","guard":[["hasAny",["helene","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Helene orbit":"Helene orbits Saturn."}}},
{"id":"n-0d6077b9","guard":[["hasAny",["europa","moon","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Europa is a moon of which planet":"Europa orbits Jupiter."}}},
{"id":"n-0d630aa1","guard":[["hasAny",["moon","narvi","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Narvi orbit":"Narvi orbits Saturn."}}},
{"id":"n-0d67ff7f","guard":[["hasAny",["bianca","moon","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Bianca is a moon of which planet":"Bianca orbits Uranus."}}},
{"id":"n-0e14f68c","guard":[["hasAny",["farbauti","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Farbauti orbit":"Farbauti orbits Saturn."}}},
{"id":"n-10c47f9c","guard":[["hasAny",["circles","erriapo","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Erriapo circles":"Erriapo orbits Saturn."}}},
{"id":"n-15099542","guard":[["hasAny",["isonoe","moon","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Isonoe is a moon of which planet":"Isonoe orbits Jupiter."}}},
{"id":"n-156ac88e","guard":[["hasAny",["circles","galatea","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Galatea circles":"Galatea orbits Neptune."}}},
{"id":"n-17ef0410","guard":[["hasAny",["moon","planet","ymir"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Ymir is a moon of which planet":"Ymir orbits Saturn."}}},
{"id":"n-1b47f906","guard":[["hasAny",["moon","pasithee","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Pasithee is a moon of which planet":"Pasithee orbits Jupiter."}}},
{"id":"n-1e8a29b1","guard":[["hasAny",["circles","name","planet","proteus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Proteus circles":"Proteus orbits Neptune."}}},
{"id":"n-210c9579","guard":[["hasAny",["circles","ferdinand","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Ferdinand circles":"Ferdinand orbits Uranus."}}},
{"id":"n-218053dc","guard":[["hasAny",["aegir","moon","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Aegir is a moon of which planet":"Aegir orbits Saturn."}}},
{"id":"n-22aa8e9a","guard":[["hasAny",["circles","name","pandora","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Pandora circles":"Pandora orbits Saturn."}}},
{"id":"n-25948609","guard":[["hasAny",["moon","orbit","planet","polydeuces"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Polydeuces orbit":"Polydeuces orbits Saturn."}}},
{"id":"n-2762922c","guard":[["hasAny",["moon","orbit","planet","puck"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Puck orbit":"Puck orbits Uranus."}}},
{"id":"n-297a6f6e","guard":[["hasAny",["circles","name","perdita","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Perdita circles":"Perdita orbits Uranus."}}},
{"id":"n-2ae406aa","guard":[["hasAny",["circles","enceladus","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Enceladus circles":"Enceladus orbits Saturn."}}},
{"id":"n-2b0b6ce6","guard":[["hasAny",["moon","orbit","planet","rosalind"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Rosalind orbit":"Rosalind orbits Uranus."}}},
{"id":"n-2c0f2484","guard":[["hasAny",["moon","planet","thalassa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Thalassa is a moon of which planet":"Thalassa orbits Neptune."}}},
{"id":"n-2c4c4f8c","guard":[["hasAny",["halimede","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Halimede orbit":"Halimede orbits Neptune."}}},
{"id":"n-2cb2c4a7","guard":[["hasAny",["moon","orbit","planet","stephano"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Stephano orbit":"Stephano orbits Uranus."}}},
{"id":"n-2f4b5f5c","guard":[["hasAny",["kore","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Kore orbit":"Kore orbits Jupiter."}}},
{"id":"n-32718403","guard":[["hasAny",["bergelmir","circles","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Bergelmir circles":"Bergelmir orbits Saturn."}}},
{"id":"n-35b81c8b","guard":[["hasAny",["circles","name","planet","s17","s2004"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that S/2004 S17 circles":"S/2004 S17 orbits Saturn."}}},
{"id":"n-37eaf3b9","guard":[["hasAny",["circles","name","phoebe","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Phoebe circles":"Phoebe orbits Saturn."}}},
{"id":"n-37ef8e0f","guard":[["hasAny",["j11","moon","planet","s2000"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"S/2000 J11 is a moon of which planet":"S/2000 J11 orbits Jupiter."}}},
{"id":"n-3c8951c8","guard":[["hasAny",["moon","planet","themisto"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Themisto is a moon of which planet":"Themisto orbits Jupiter."}}},
{"id":"n-3cadec12","guard":[["hasAny",["anthe","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Anthe orbit":"Anthe orbits Saturn."}}},
{"id":"n-3d9203bc","guard":[["hasAny",["moon","orbit","planet","trinculo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Trinculo orbit":"Trinculo orbits Uranus."}}},
{"id":"n-3ec494ea","guard":[["hasAny",["moon","planet","prospero"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Prospero is a moon of which planet":"Prospero orbits Uranus."}}},
{"id":"n-43d577ea","guard":[["hasAny",["aitne","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Aitne orbit":"Aitne orbits Jupiter."}}},
{"id":"n-4c70d2c1","guard":[["hasAny",["kiviuq","moon","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Kiviuq is a moon of which planet":"Kiviuq orbits Saturn."}}},
{"id":"n-4d8238ba","guard":[["hasAny",["chaldene","circles","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Chaldene circles":"Chaldene orbits Jupiter."}}},
{"id":"n-5254dc9f","guard":[["hasAny",["cyllene","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Cyllene orbit":"Cyllene orbits Jupiter."}}},
{"id":"n-5451b7cc","guard":[["hasAny",["circles","eukelade","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Eukelade circles":"Eukelade orbits Jupiter."}}},
{"id":"n-54826da9","guard":[["hasAny",["circles","helike","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Helike circles":"Helike orbits Jupiter."}}},
{"id":"n-54cd7e5d","guard":[["hasAny",["jarnsaxa","moon","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Jarnsaxa is a moon of which planet":"Jarnsaxa orbits Saturn."}}},
{"id":"n-56c56f9e","guard":[["hasAny",["larissa","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Larissa orbit":"Larissa orbits Neptune."}}},
{"id":"n-578be841","guard":[["hasAny",["kari","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Kari orbit":"Kari orbits Saturn."}}},
{"id":"n-58946819","guard":[["hasAny",["j15","moon","planet","s2003"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"S/2003 J15 is a moon of which planet":"S/2003 J15 orbits Jupiter."}}},
{"id":"n-5af876ac","guard":[["hasAny",["j9","moon","planet","s2003"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"S/2003 J9 is a moon of which planet":"S/2003 J9 orbits Jupiter."}}},
{"id":"n-5e2a5760","guard":[["hasAny",["j23","moon","orbit","planet","s2003"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon S/2003 J23 orbit":"S/2003 J23 orbits Jupiter."}}},
{"id":"n-5e2e852b","guard":[["hasAny",["mab","moon","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Mab is a moon of which planet":"Mab orbits Uranus."}}},
{"id":"n-617deffe","guard":[["hasAny",["moon","planet","s1","s2006"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"S/2006 S1 is a moon of which planet":"S/2006 S1 orbits Saturn."}}},
{"id":"n-63b124df","guard":[["hasAny",["daphnis","moon","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Daphnis is a moon of which planet":"Daphnis orbits Saturn."}}},
{"id":"n-64be7f78","guard":[["hasAny",["kalyke","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Kalyke orbit":"Kalyke orbits Jupiter."}}},
{"id":"n-6583b121","guard":[["hasAny",["circles","name","planet","praxidike"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Praxidike circles":"Praxidike orbits Jupiter."}}},
{"id":"n-66e48484","guard":[["hasAny",["circles","name","planet","suttungr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Suttungr circles":"Suttungr orbits Saturn."}}},
{"id":"n-69c5c57a","guard":[["hasAny",["laomedeia","moon","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Laomedeia is a moon of which planet":"Laomedeia orbits Neptune."}}},
{"id":"n-6f3b4716","guard":[["hasAny",["moon","mundilfari","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Mundilfari orbit":"Mundilfari orbits Saturn."}}},
{"id":"n-7284c113","guard":[["hasAny",["moon","planet","thrymr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Thrymr is a moon of which planet":"Thrymr orbits Saturn."}}},
{"id":"n-73b81f9a","guard":[["hasAny",["j3","moon","orbit","planet","s2003"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon S/2003 J3 orbit":"S/2003 J3 orbits Jupiter."}}},
{"id":"n-74b08eca","guard":[["hasAny",["j10","moon","orbit","planet","s2003"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon S/2003 J10 orbit":"S/2003 J10 orbits Jupiter."}}},
{"id":"n-78b8ae9f","guard":[["hasAny",["moon","orbit","planet","sponde"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Sponde orbit":"Sponde orbits Jupiter."}}},
{"id":"n-78c22eb7","guard":[["hasAny",["moon","phobos","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Phobos is a moon of which planet":"Phobos orbits Mars."}}},
{"id":"n-79f02c40","guard":[["hasAny",["bebhionn","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Bebhionn orbit":"Bebhionn orbits Saturn."}}},
{"id":"n-7a00b307","guard":[["hasAny",["circles","megaclite","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Megaclite circles":"Megaclite orbits Jupiter."}}},
{"id":"n-8269cedb","guard":[["hasAny",["amalthea","circles","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Amalthea circles":"Amalthea orbits Jupiter."}}},
{"id":"n-86443cee","guard":[["hasAny",["moon","orbit","planet","thelxinoe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Thelxinoe orbit":"Thelxinoe orbits Jupiter."}}},
{"id":"n-8860cbb7","guard":[["hasAny",["euporie","moon","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Euporie is a moon of which planet":"Euporie orbits Jupiter."}}},
{"id":"n-88f5e500","guard":[["hasAny",["circles","loge","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Loge circles":"Loge orbits Saturn."}}},
{"id":"n-94eb50c5","guard":[["hasAny",["margaret","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Margaret orbit":"Margaret orbits Uranus."}}},
{"id":"n-97ea849f","guard":[["hasAny",["moon","planet","umbriel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Umbriel is a moon of which planet":"Umbriel orbits Uranus."}}},
{"id":"n-a1a8ab6e","guard":[["hasAny",["deimos","moon","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Deimos is a moon of which planet":"Deimos orbits Mars."}}},
{"id":"n-a2236931","guard":[["hasAny",["moon","pasiphae","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Pasiphae is a moon of which planet":"Pasiphae orbits Jupiter."}}},
{"id":"n-a4ea4123","guard":[["hasAny",["carme","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Carme orbit":"Carme orbits Jupiter."}}},
{"id":"n-aac6100c","guard":[["hasAny",["harpalyke","moon","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Harpalyke is a moon of which planet":"Harpalyke orbits Jupiter."}}},
{"id":"n-ab1faf23","guard":[["hasAny",["circles","desdemona","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Desdemona circles":"Desdemona orbits Uranus."}}},
{"id":"n-abb2d09b","guard":[["hasAny",["autonoe","circles","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Autonoe circles":"Autonoe orbits Jupiter."}}},
{"id":"n-ac51883d","guard":[["hasAny",["hati","moon","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Hati is a moon of which planet":"Hati orbits Saturn."}}},
{"id":"n-ae86efbc","guard":[["hasAny",["atlas","circles","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Atlas circles":"Atlas orbits Saturn."}}},
{"id":"n-af53a32f","guard":[["hasAny",["circles","j19","name","planet","s2003"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that S/2003 J19 circles":"S/2003 J19 orbits Jupiter."}}},
{"id":"n-b124f480","guard":[["hasAny",["moon","orbit","planet","tethys"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Tethys orbit":"Tethys orbits Saturn."}}},
{"id":"n-b45f3a6e","guard":[["hasAny",["circles","francisco","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Francisco circles":"Francisco orbits Uranus."}}},
{"id":"n-b8cb88b4","guard":[["hasAny",["circles","name","planet","tarvos"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Tarvos circles":"Tarvos orbits Saturn."}}},
{"id":"n-c981388d","guard":[["hasAny",["despina","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Despina orbit":"Despina orbits Neptune."}}},
{"id":"n-cf2ee494","guard":[["hasAny",["circles","cupid","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Cupid circles":"Cupid orbits Uranus."}}},
{"id":"n-d1ca2a68","guard":[["hasAny",["moon","naiad","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Naiad is a moon of which planet":"Naiad orbits Neptune."}}},
{"id":"n-d2438bbf","guard":[["hasAny",["moon","orbit","planet","thyone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Thyone orbit":"Thyone orbits Jupiter."}}},
{"id":"n-d262e291","guard":[["hasAny",["moon","planet","tarqeq"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Tarqeq is a moon of which planet":"Tarqeq orbits Saturn."}}},
{"id":"n-d312f81a","guard":[["hasAny",["circles","name","planet","sycorax"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Sycorax circles":"Sycorax orbits Uranus."}}},
{"id":"n-d36a4575","guard":[["hasAny",["circles","ganymede","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Ganymede circles":"Ganymede orbits Jupiter."}}},
{"id":"n-d761ca96","guard":[["hasAny",["circles","name","planet","titania"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Titania circles":"Titania orbits Uranus."}}},
{"id":"n-d83d1931","guard":[["hasAny",["j12","moon","planet","s2003"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"S/2003 J12 is a moon of which planet":"S/2003 J12 orbits Jupiter."}}},
{"id":"n-d8df84a7","guard":[["hasAny",["moon","orbit","planet","triton"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Triton orbit":"Triton orbits Neptune."}}},
{"id":"n-db84ac62","guard":[["hasAny",["circles","name","planet","taygete"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Taygete circles":"Taygete orbits Jupiter."}}},
{"id":"n-de5c5704","guard":[["hasAny",["moon","orbit","planet","prometheus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Prometheus orbit":"Prometheus orbits Saturn."}}},
{"id":"n-e5efa8a9","guard":[["hasAny",["circles","elara","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Elara circles":"Elara orbits Jupiter."}}},
{"id":"n-e6c03ba0","guard":[["hasAny",["belinda","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Belinda orbit":"Belinda orbits Uranus."}}},
{"id":"n-eaceadda","guard":[["hasAny",["circles","name","planet","telesto"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Telesto circles":"Telesto orbits Saturn."}}},
{"id":"n-ecd56c31","guard":[["hasAny",["moon","planet","s2007","s3"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"S/2007 S3 is a moon of which planet":"S/2007 S3 orbits Saturn."}}},
{"id":"n-f059f66e","guard":[["hasAny",["calypso","moon","orbit","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon Calypso orbit":"Calypso orbits Saturn."}}},
{"id":"n-f6f78c63","guard":[["hasAny",["j18","moon","orbit","planet","s2003"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which planet does the moon S/2003 J18 orbit":"S/2003 J18 orbits Jupiter."}}},
{"id":"n-f8452a81","guard":[["hasAny",["bestla","circles","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Bestla circles":"Bestla orbits Saturn."}}},
{"id":"n-fb9d800d","guard":[["hasAny",["moon","planet","setebos"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"Setebos is a moon of which planet":"Setebos orbits Uranus."}}},
{"id":"n-fbed4a1e","guard":[["hasAny",["aoede","circles","name","planet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the planet that Aoede circles":"Aoede orbits Jupiter."}}},
{"id":"n-08964432","guard":[["has","j19"]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," J19 orbits Jupiter."]},["render.listNums",["sense.numbers"]]],"mem":null},
{"id":"n-28e00883","guard":[["has","j10"]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," J10 orbits Jupiter."]},["render.listNums",["sense.numbers"]]],"mem":null},
{"id":"n-4419af49","guard":[["has","j3"]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," J3 orbits Jupiter."]},["render.listNums",["sense.numbers"]]],"mem":null},
{"id":"n-49d2cdcb","guard":[["has","j18"]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," J18 orbits Jupiter."]},["render.listNums",["sense.numbers"]]],"mem":null},
{"id":"n-50a27150","guard":[["has","j23"]],"pyramid":["render.template",{"lit":["S/",{"slot":0}," J23 orbits Jupiter."]},["render.listNums",["sense.numbers"]]],"mem":null},
{"id":"n-53ef132d","guard":[["has","circles"]],"pyramid":["render.template",{"lit":[{"slot":0},"/",{"slot":1}," S17 orbits Saturn."]},["sense.unit"],["render.listNums",["sense.numbers"]]],"mem":null},
{"id":"n-73b1f309","guard":[["hasAny",["circles","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"/",{"slot":1}," ",{"slot":2}," orbits Saturn."]},["sense.unit"],["render.listNums",["sense.numbers"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dce9c6b9","guard":[["hasAny",["aegir","aitne","amalthea","anthe","aoede","atlas","autonoe","bebhionn","belinda","bergelmir","bestla","bianca","calypso","carme","chaldene","cupid","cyllene","daphnis","deimos","desdemona","despina","elara","enceladus","erriapo","eukelade","euporie","europa","farbauti","ferdinand","francisco","galatea","ganymede","halimede","harpalyke","hati","helene","helike","isonoe","janus","jarnsaxa","kalyke","kari","kiviuq","kore","laomedeia","larissa","loge","mab","margaret","megaclite","mundilfari","naiad","narvi","orthosie","pandora","pasiphae","pasithee","perdita","phobos","phoebe","polydeuces","praxidike","prometheus","prospero","proteus","puck","rosalind","setebos","sponde","stephano","suttungr","sycorax","tarqeq","tarvos","taygete","telesto","tethys","thalassa","thelxinoe","themisto","thrymr","thyone","titania","trinculo","triton","umbriel","ymir"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Anthe orbit":"Anthe orbits Saturn.","which planet does the moon Kari orbit":"Kari orbits Saturn.","Hati is a moon of which planet":"Hati orbits Saturn.","which planet does the moon Mundilfari orbit":"Mundilfari orbits Saturn.","name the planet that Telesto circles":"Telesto orbits Saturn.","which planet does the moon Despina orbit":"Despina orbits Neptune.","name the planet that Francisco circles":"Francisco orbits Uranus.","name the planet that Tarvos circles":"Tarvos orbits Saturn.","which planet does the moon Sponde orbit":"Sponde orbits Jupiter.","name the planet that Atlas circles":"Atlas orbits Saturn.","Isonoe is a moon of which planet":"Isonoe orbits Jupiter.","Setebos is a moon of which planet":"Setebos orbits Uranus.","Pasithee is a moon of which planet":"Pasithee orbits Jupiter.","Jarnsaxa is a moon of which planet":"Jarnsaxa orbits Saturn.","which planet does the moon Thelxinoe orbit":"Thelxinoe orbits Jupiter.","name the planet that Bergelmir circles":"Bergelmir orbits Saturn.","which planet does the moon Stephano orbit":"Stephano orbits Uranus.","Pasiphae is a moon of which planet":"Pasiphae orbits Jupiter.","name the planet that Titania circles":"Titania orbits Uranus.","which planet does the moon Bebhionn orbit":"Bebhionn orbits Saturn.","name the planet that Desdemona circles":"Desdemona orbits Uranus.","name the planet that Megaclite circles":"Megaclite orbits Jupiter.","name the planet that Phoebe circles":"Phoebe orbits Saturn.","name the planet that Elara circles":"Elara orbits Jupiter.","name the planet that Chaldene circles":"Chaldene orbits Jupiter.","Phobos is a moon of which planet":"Phobos orbits Mars.","Bianca is a moon of which planet":"Bianca orbits Uranus.","Tarqeq is a moon of which planet":"Tarqeq orbits Saturn.","name the planet that Taygete circles":"Taygete orbits Jupiter.","Thrymr is a moon of which planet":"Thrymr orbits Saturn.","which planet does the moon Calypso orbit":"Calypso orbits Saturn.","which planet does the moon Halimede orbit":"Halimede orbits Neptune.","which planet does the moon Narvi orbit":"Narvi orbits Saturn.","Umbriel is a moon of which planet":"Umbriel orbits Uranus.","which planet does the moon Larissa orbit":"Larissa orbits Neptune.","which planet does the moon Farbauti orbit":"Farbauti orbits Saturn.","which planet does the moon Cyllene orbit":"Cyllene orbits Jupiter.","name the planet that Ganymede circles":"Ganymede orbits Jupiter.","which planet does the moon Belinda orbit":"Belinda orbits Uranus.","name the planet that Erriapo circles":"Erriapo orbits Saturn.","Ymir is a moon of which planet":"Ymir orbits Saturn.","which planet does the moon Tethys orbit":"Tethys orbits Saturn.","which planet does the moon Aitne orbit":"Aitne orbits Jupiter.","which planet does the moon Triton orbit":"Triton orbits Neptune.","name the planet that Helike circles":"Helike orbits Jupiter.","name the planet that Loge circles":"Loge orbits Saturn.","Janus is a moon of which planet":"Janus orbits Saturn.","which planet does the moon Puck orbit":"Puck orbits Uranus.","Euporie is a moon of which planet":"Euporie orbits Jupiter.","name the planet that Autonoe circles":"Autonoe orbits Jupiter.","which planet does the moon Trinculo orbit":"Trinculo orbits Uranus.","which planet does the moon Thyone orbit":"Thyone orbits Jupiter.","name the planet that Pandora circles":"Pandora orbits Saturn.","name the planet that Galatea circles":"Galatea orbits Neptune.","which planet does the moon Prometheus orbit":"Prometheus orbits Saturn.","which planet does the moon Kalyke orbit":"Kalyke orbits Jupiter.","Europa is a moon of which planet":"Europa orbits Jupiter.","Laomedeia is a moon of which planet":"Laomedeia orbits Neptune.","Kiviuq is a moon of which planet":"Kiviuq orbits Saturn.","Aegir is a moon of which planet":"Aegir orbits Saturn.","name the planet that Enceladus circles":"Enceladus orbits Saturn.","name the planet that Aoede circles":"Aoede orbits Jupiter.","Harpalyke is a moon of which planet":"Harpalyke orbits Jupiter.","Mab is a moon of which planet":"Mab orbits Uranus.","name the planet that Bestla circles":"Bestla orbits Saturn.","Prospero is a moon of which planet":"Prospero orbits Uranus.","name the planet that Proteus circles":"Proteus orbits Neptune.","which planet does the moon Helene orbit":"Helene orbits Saturn.","Themisto is a moon of which planet":"Themisto orbits Jupiter.","which planet does the moon Carme orbit":"Carme orbits Jupiter.","name the planet that Sycorax circles":"Sycorax orbits Uranus.","name the planet that Cupid circles":"Cupid orbits Uranus.","name the planet that Suttungr circles":"Suttungr orbits Saturn.","name the planet that Praxidike circles":"Praxidike orbits Jupiter.","name the planet that Perdita circles":"Perdita orbits Uranus.","which planet does the moon Kore orbit":"Kore orbits Jupiter.","which planet does the moon Margaret orbit":"Margaret orbits Uranus.","which planet does the moon Orthosie orbit":"Orthosie orbits Jupiter.","which planet does the moon Polydeuces orbit":"Polydeuces orbits Saturn.","name the planet that Ferdinand circles":"Ferdinand orbits Uranus.","name the planet that Eukelade circles":"Eukelade orbits Jupiter.","Naiad is a moon of which planet":"Naiad orbits Neptune.","name the planet that Amalthea circles":"Amalthea orbits Jupiter.","which planet does the moon Rosalind orbit":"Rosalind orbits Uranus.","Thalassa is a moon of which planet":"Thalassa orbits Neptune.","Daphnis is a moon of which planet":"Daphnis orbits Saturn.","Deimos is a moon of which planet":"Deimos orbits Mars."}}},
{"id":"n-065f6b4d","guard":[["has","desdemona"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Desdemona circles":"Desdemona orbits Uranus."}}},
{"id":"n-071dfce4","guard":[["has","phobos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Phobos is a moon of which planet":"Phobos orbits Mars."}}},
{"id":"n-0d12612b","guard":[["has","bianca"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Bianca is a moon of which planet":"Bianca orbits Uranus."}}},
{"id":"n-13579205","guard":[["has","pasithee"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Pasithee is a moon of which planet":"Pasithee orbits Jupiter."}}},
{"id":"n-172dc33c","guard":[["has","tarqeq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Tarqeq is a moon of which planet":"Tarqeq orbits Saturn."}}},
{"id":"n-1a0fdd9e","guard":[["has","helike"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Helike circles":"Helike orbits Jupiter."}}},
{"id":"n-1ad59998","guard":[["has","enceladus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Enceladus circles":"Enceladus orbits Saturn."}}},
{"id":"n-208df161","guard":[["has","calypso"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Calypso orbit":"Calypso orbits Saturn."}}},
{"id":"n-21bad58c","guard":[["has","kari"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Kari orbit":"Kari orbits Saturn."}}},
{"id":"n-223e7740","guard":[["has","atlas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Atlas circles":"Atlas orbits Saturn."}}},
{"id":"n-23fcedc8","guard":[["has","thelxinoe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Thelxinoe orbit":"Thelxinoe orbits Jupiter."}}},
{"id":"n-285d0dd1","guard":[["has","thalassa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Thalassa is a moon of which planet":"Thalassa orbits Neptune."}}},
{"id":"n-299053dd","guard":[["has","themisto"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Themisto is a moon of which planet":"Themisto orbits Jupiter."}}},
{"id":"n-2b85f884","guard":[["has","sycorax"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Sycorax circles":"Sycorax orbits Uranus."}}},
{"id":"n-2eaf883e","guard":[["has","janus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Janus is a moon of which planet":"Janus orbits Saturn."}}},
{"id":"n-3069876f","guard":[["has","belinda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Belinda orbit":"Belinda orbits Uranus."}}},
{"id":"n-317837e8","guard":[["has","taygete"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Taygete circles":"Taygete orbits Jupiter."}}},
{"id":"n-32ff595b","guard":[["has","galatea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Galatea circles":"Galatea orbits Neptune."}}},
{"id":"n-33c86cca","guard":[["has","chaldene"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Chaldene circles":"Chaldene orbits Jupiter."}}},
{"id":"n-375b4040","guard":[["has","telesto"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Telesto circles":"Telesto orbits Saturn."}}},
{"id":"n-3794f3e3","guard":[["has","loge"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Loge circles":"Loge orbits Saturn."}}},
{"id":"n-38314207","guard":[["has","cupid"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Cupid circles":"Cupid orbits Uranus."}}},
{"id":"n-38867734","guard":[["has","naiad"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Naiad is a moon of which planet":"Naiad orbits Neptune."}}},
{"id":"n-399f23d1","guard":[["has","prometheus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Prometheus orbit":"Prometheus orbits Saturn."}}},
{"id":"n-3af7f199","guard":[["has","daphnis"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Daphnis is a moon of which planet":"Daphnis orbits Saturn."}}},
{"id":"n-3d6e76c7","guard":[["has","kore"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Kore orbit":"Kore orbits Jupiter."}}},
{"id":"n-3ef5f044","guard":[["has","amalthea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Amalthea circles":"Amalthea orbits Jupiter."}}},
{"id":"n-44647adf","guard":[["has","bestla"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Bestla circles":"Bestla orbits Saturn."}}},
{"id":"n-4a682643","guard":[["has","autonoe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Autonoe circles":"Autonoe orbits Jupiter."}}},
{"id":"n-51af5e6e","guard":[["has","carme"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Carme orbit":"Carme orbits Jupiter."}}},
{"id":"n-51ba5d40","guard":[["has","polydeuces"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Polydeuces orbit":"Polydeuces orbits Saturn."}}},
{"id":"n-52288e7f","guard":[["has","erriapo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Erriapo circles":"Erriapo orbits Saturn."}}},
{"id":"n-54d8bbb9","guard":[["has","farbauti"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Farbauti orbit":"Farbauti orbits Saturn."}}},
{"id":"n-589c46f2","guard":[["has","mab"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Mab is a moon of which planet":"Mab orbits Uranus."}}},
{"id":"n-59255ce0","guard":[["has","proteus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Proteus circles":"Proteus orbits Neptune."}}},
{"id":"n-5ffd3942","guard":[["has","rosalind"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Rosalind orbit":"Rosalind orbits Uranus."}}},
{"id":"n-6034f0ac","guard":[["has","hati"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Hati is a moon of which planet":"Hati orbits Saturn."}}},
{"id":"n-63be6c9d","guard":[["has","ganymede"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Ganymede circles":"Ganymede orbits Jupiter."}}},
{"id":"n-640d142c","guard":[["has","ferdinand"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Ferdinand circles":"Ferdinand orbits Uranus."}}},
{"id":"n-65569690","guard":[["has","deimos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Deimos is a moon of which planet":"Deimos orbits Mars."}}},
{"id":"n-657d04d0","guard":[["has","thyone"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Thyone orbit":"Thyone orbits Jupiter."}}},
{"id":"n-663b1356","guard":[["has","setebos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Setebos is a moon of which planet":"Setebos orbits Uranus."}}},
{"id":"n-6b7f13f7","guard":[["has","aoede"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Aoede circles":"Aoede orbits Jupiter."}}},
{"id":"n-6bb34bfa","guard":[["has","pasiphae"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Pasiphae is a moon of which planet":"Pasiphae orbits Jupiter."}}},
{"id":"n-71136626","guard":[["has","europa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Europa is a moon of which planet":"Europa orbits Jupiter."}}},
{"id":"n-74bf47ea","guard":[["has","suttungr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Suttungr circles":"Suttungr orbits Saturn."}}},
{"id":"n-7570aa08","guard":[["has","praxidike"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Praxidike circles":"Praxidike orbits Jupiter."}}},
{"id":"n-784134f0","guard":[["has","narvi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Narvi orbit":"Narvi orbits Saturn."}}},
{"id":"n-7c7b7f5a","guard":[["has","megaclite"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Megaclite circles":"Megaclite orbits Jupiter."}}},
{"id":"n-7efb2b55","guard":[["has","larissa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Larissa orbit":"Larissa orbits Neptune."}}},
{"id":"n-815f29c8","guard":[["has","phoebe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Phoebe circles":"Phoebe orbits Saturn."}}},
{"id":"n-8177bafd","guard":[["has","bebhionn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Bebhionn orbit":"Bebhionn orbits Saturn."}}},
{"id":"n-817a431c","guard":[["has","cyllene"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Cyllene orbit":"Cyllene orbits Jupiter."}}},
{"id":"n-83dc3ca5","guard":[["has","aitne"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Aitne orbit":"Aitne orbits Jupiter."}}},
{"id":"n-88243543","guard":[["has","thrymr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Thrymr is a moon of which planet":"Thrymr orbits Saturn."}}},
{"id":"n-8a4d5787","guard":[["has","tethys"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Tethys orbit":"Tethys orbits Saturn."}}},
{"id":"n-8b4c9b1b","guard":[["has","kalyke"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Kalyke orbit":"Kalyke orbits Jupiter."}}},
{"id":"n-8e0a1da1","guard":[["has","bergelmir"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Bergelmir circles":"Bergelmir orbits Saturn."}}},
{"id":"n-9b3f0a7b","guard":[["has","isonoe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Isonoe is a moon of which planet":"Isonoe orbits Jupiter."}}},
{"id":"n-9c6dc7c0","guard":[["has","harpalyke"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Harpalyke is a moon of which planet":"Harpalyke orbits Jupiter."}}},
{"id":"n-a057ca68","guard":[["has","umbriel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Umbriel is a moon of which planet":"Umbriel orbits Uranus."}}},
{"id":"n-a264ae69","guard":[["has","margaret"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Margaret orbit":"Margaret orbits Uranus."}}},
{"id":"n-a5e50314","guard":[["has","trinculo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Trinculo orbit":"Trinculo orbits Uranus."}}},
{"id":"n-a664b57f","guard":[["has","stephano"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Stephano orbit":"Stephano orbits Uranus."}}},
{"id":"n-a7c11144","guard":[["has","laomedeia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Laomedeia is a moon of which planet":"Laomedeia orbits Neptune."}}},
{"id":"n-af5e5d67","guard":[["has","helene"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Helene orbit":"Helene orbits Saturn."}}},
{"id":"n-be5746c2","guard":[["has","tarvos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Tarvos circles":"Tarvos orbits Saturn."}}},
{"id":"n-c1b0edf6","guard":[["has","perdita"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Perdita circles":"Perdita orbits Uranus."}}},
{"id":"n-c4a58632","guard":[["has","eukelade"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Eukelade circles":"Eukelade orbits Jupiter."}}},
{"id":"n-d34de44e","guard":[["has","jarnsaxa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Jarnsaxa is a moon of which planet":"Jarnsaxa orbits Saturn."}}},
{"id":"n-d5724c70","guard":[["has","francisco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Francisco circles":"Francisco orbits Uranus."}}},
{"id":"n-d5faedc5","guard":[["has","elara"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Elara circles":"Elara orbits Jupiter."}}},
{"id":"n-d6a0b75c","guard":[["has","mundilfari"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Mundilfari orbit":"Mundilfari orbits Saturn."}}},
{"id":"n-da060f60","guard":[["has","kiviuq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Kiviuq is a moon of which planet":"Kiviuq orbits Saturn."}}},
{"id":"n-dcacc822","guard":[["has","ymir"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Ymir is a moon of which planet":"Ymir orbits Saturn."}}},
{"id":"n-de366c17","guard":[["has","sponde"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Sponde orbit":"Sponde orbits Jupiter."}}},
{"id":"n-de9bb575","guard":[["has","despina"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Despina orbit":"Despina orbits Neptune."}}},
{"id":"n-dfb8de74","guard":[["has","halimede"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Halimede orbit":"Halimede orbits Neptune."}}},
{"id":"n-e6c94f58","guard":[["has","triton"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Triton orbit":"Triton orbits Neptune."}}},
{"id":"n-e7c20d82","guard":[["has","prospero"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Prospero is a moon of which planet":"Prospero orbits Uranus."}}},
{"id":"n-e9c093a9","guard":[["has","orthosie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Orthosie orbit":"Orthosie orbits Jupiter."}}},
{"id":"n-f3596c5a","guard":[["has","puck"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Puck orbit":"Puck orbits Uranus."}}},
{"id":"n-f43c2e4e","guard":[["has","anthe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which planet does the moon Anthe orbit":"Anthe orbits Saturn."}}},
{"id":"n-f99e12b6","guard":[["has","euporie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Euporie is a moon of which planet":"Euporie orbits Jupiter."}}},
{"id":"n-facf5c0e","guard":[["has","pandora"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Pandora circles":"Pandora orbits Saturn."}}},
{"id":"n-fc104501","guard":[["has","titania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the planet that Titania circles":"Titania orbits Uranus."}}},
{"id":"n-fd176073","guard":[["has","aegir"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"Aegir is a moon of which planet":"Aegir orbits Saturn."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"S/2000 J11 is a moon of which planet","expect":{"contains":["Jupiter"],"notRefusal":true}},{"q":"which planet does the moon Anthe orbit","expect":{"contains":["Saturn"],"notRefusal":true}},{"q":"which planet does the moon Kari orbit","expect":{"contains":["Saturn"],"notRefusal":true}},{"q":"Hati is a moon of which planet","expect":{"contains":["Saturn"],"notRefusal":true}},{"q":"which planet does the moon Mundilfari orbit","expect":{"contains":["Saturn"],"notRefusal":true}},{"q":"name the planet that Telesto circles","expect":{"contains":["Saturn"],"notRefusal":true}},{"q":"which planet does the moon Despina orbit","expect":{"contains":["Neptune"],"notRefusal":true}},{"q":"name the planet that Francisco circles","expect":{"contains":["Uranus"],"notRefusal":true}},{"q":"name the planet that Tarvos circles","expect":{"contains":["Saturn"],"notRefusal":true}},{"q":"which planet does the moon S/2003 J18 orbit","expect":{"contains":["Jupiter"],"notRefusal":true}},{"q":"which planet does the moon Sponde orbit","expect":{"contains":["Jupiter"],"notRefusal":true}},{"q":"name the planet that Atlas circles","expect":{"contains":["Saturn"],"notRefusal":true}},{"q":"name the planet that S/2004 S17 circles","expect":{"contains":["Saturn"],"notRefusal":true}},{"q":"Isonoe is a moon of which planet","expect":{"contains":["Jupiter"],"notRefusal":true}},{"q":"Setebos is a moon of which planet","expect":{"contains":["Uranus"],"notRefusal":true}},{"q":"Pasithee is a moon of which planet","expect":{"contains":["Jupiter"],"notRefusal":true}},{"q":"Jarnsaxa is a moon of which planet","expect":{"contains":["Saturn"],"notRefusal":true}},{"q":"which planet does the moon Thelxinoe orbit","expect":{"contains":["Jupiter"],"notRefusal":true}},{"q":"which planet does the moon S/2003 J10 orbit","expect":{"contains":["Jupiter"],"notRefusal":true}},{"q":"name the planet that Bergelmir circles","expect":{"contains":["Saturn"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
