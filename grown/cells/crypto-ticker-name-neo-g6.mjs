// crypto-ticker-name-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"crypto-ticker-name-neo-g6","class":"crypto-ticker-name","generation":6,"lane":"neo","grownFrom":["which cryptocurrency has the ticker CHIEF","which cryptocurrency has the ticker BODHI","which cryptocurrency has the ticker TAUR","which cryptocurrency has the ticker CNCT","what coin trades as PEFI","which cryptocurrency has the ticker PSPS","name the cryptocurrency with the symbol GSX","name the cryptocurrency with the symbol DISK","name the cryptocurrency with the symbol NWS","name the cryptocurrency with the symbol AFP","what coin trades as OGSP","which cryptocurrency has the ticker ARMS","what coin trades as KAYI","which cryptocurrency has the ticker YOP","which cryptocurrency has the ticker JMT","which cryptocurrency has the ticker KRL","name the cryptocurrency with the symbol MCD","what coin trades as VINU","what coin trades as CAVA","what coin trades as FAT"],"version":1});

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
{"id":"n-422e7517","guard":[["hasAny",["coin","cryptocurrency"]],["not",["has","is"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker CHIEF":"The ticker CHIEF is TheChiefCoin.","which cryptocurrency has the ticker BODHI":"The ticker BODHI is Bodhi Network.","which cryptocurrency has the ticker TAUR":"The ticker TAUR is Marnotaur.","which cryptocurrency has the ticker CNCT":"The ticker CNCT is CONNECT.","what coin trades as PEFI":"The ticker PEFI is Penguin Finance.","which cryptocurrency has the ticker PSPS":"The ticker PSPS is BobaCat.","name the cryptocurrency with the symbol GSX":"The ticker GSX is Gold Secured Currency.","name the cryptocurrency with the symbol DISK":"The ticker DISK is Dark Lisk.","name the cryptocurrency with the symbol NWS":"The ticker NWS is Nodewaves.","name the cryptocurrency with the symbol AFP":"The ticker AFP is Animal Farm Pigs.","what coin trades as OGSP":"The ticker OGSP is OriginSport.","which cryptocurrency has the ticker ARMS":"The ticker ARMS is 2Acoin.","what coin trades as KAYI":"The ticker KAYI is Kayı.","which cryptocurrency has the ticker YOP":"The ticker YOP is Yield Optimization Platform & Protocol.","which cryptocurrency has the ticker JMT":"The ticker JMT is JMTIME.","which cryptocurrency has the ticker KRL":"The ticker KRL is Kryll.","name the cryptocurrency with the symbol MCD":"The ticker MCD is CDbio.","what coin trades as VINU":"The ticker VINU is Vita Inu.","what coin trades as CAVA":"The ticker CAVA is Cavapoo.","what coin trades as FAT":"The ticker FAT is Fatcoin.","what coin trades as ARPA":"The ticker ARPA is ARPA Chain.","what coin trades as DIBBLE":"The ticker DIBBLE is Dibbles.","name the cryptocurrency with the symbol BIGHAN":"The ticker BIGHAN is BighanCoin.","name the cryptocurrency with the symbol FAKEAI":"The ticker FAKEAI is DeepFakeAI.","which cryptocurrency has the ticker ICSA":"The ticker ICSA is Icosa.","which cryptocurrency has the ticker VOY":"The ticker VOY is enVoy DeFi.","what coin trades as DATP":"The ticker DATP is Decentralized Asset Trading Platform.","name the cryptocurrency with the symbol MDR":"The ticker MDR is Mudra MDR.","what coin trades as KSM":"The ticker KSM is Kusama.","what coin trades as BDAY":"The ticker BDAY is Birthday Cake.","name the cryptocurrency with the symbol SMPL":"The ticker SMPL is SMPL Foundation.","which cryptocurrency has the ticker DRF":"The ticker DRF is Drife.","what coin trades as GAC":"The ticker GAC is Green Art Coin.","name the cryptocurrency with the symbol MODX":"The ticker MODX is MODEL-X-coin.","what coin trades as BEZ":"The ticker BEZ is Bezop.","which cryptocurrency has the ticker FANX":"The ticker FANX is FrontFanz.","what coin trades as ROOST":"The ticker ROOST is Roost Coin.","what coin trades as AIMS":"The ticker AIMS is HighCastle Token.","what coin trades as TELO":"The ticker TELO is Telo Meme Coin.","name the cryptocurrency with the symbol STRP":"The ticker STRP is Strips Finance.","name the cryptocurrency with the symbol DCIP":"The ticker DCIP is Decentralized Community Investment Protocol.","name the cryptocurrency with the symbol DAM":"The ticker DAM is Datamine.","which cryptocurrency has the ticker AIPE":"The ticker AIPE is AI Prediction Ecosystem.","name the cryptocurrency with the symbol CWV":"The ticker CWV is CryptoWave.","which cryptocurrency has the ticker NUA":"The ticker NUA is Neulaut Token.","which cryptocurrency has the ticker XVC":"The ticker XVC is Vcash.","what coin trades as OKLP":"The ticker OKLP is OkLetsPlay.","which cryptocurrency has the ticker TBANK":"The ticker TBANK is TaoBank.","name the cryptocurrency with the symbol MNS":"The ticker MNS is Monnos.","what coin trades as TAK":"The ticker TAK is TakCoin.","which cryptocurrency has the ticker CSS":"The ticker CSS is CoinSwap Token.","name the cryptocurrency with the symbol HGHG":"The ticker HGHG is HUGHUG Coin.","name the cryptocurrency with the symbol RBT":"The ticker RBT is Rabet.","name the cryptocurrency with the symbol XDN":"The ticker XDN is DigitalNote.","name the cryptocurrency with the symbol TIC":"The ticker TIC is TrueInvestmentCoin.","what coin trades as DIYAR":"The ticker DIYAR is Diyarbekirspor Token.","what coin trades as DON":"The ticker DON is Donnie Finance.","name the cryptocurrency with the symbol DSR":"The ticker DSR is Desire.","what coin trades as DXR":"The ticker DXR is DEXTER.","which cryptocurrency has the ticker NIFT":"The ticker NIFT is Niftify.","name the cryptocurrency with the symbol FIELD":"The ticker FIELD is Fieldcoin.","name the cryptocurrency with the symbol COQ":"The ticker COQ is Coq Inu.","name the cryptocurrency with the symbol WAND":"The ticker WAND is WandX.","which cryptocurrency has the ticker GOOD":"The ticker GOOD is Goodomy.","which cryptocurrency has the ticker OUR":"The ticker OUR is Our Pay.","what coin trades as XSD":"The ticker XSD is SounDAC.","what coin trades as BTCH":"The ticker BTCH is Bitcoin Hush.","what coin trades as KSC":"The ticker KSC is KStarCoin.","what coin trades as FUKU":"The ticker FUKU is Furukuru.","name the cryptocurrency with the symbol ASTRA":"The ticker ASTRA is Astra Protocol.","which cryptocurrency has the ticker AKA":"The ticker AKA is Akroma.","name the cryptocurrency with the symbol GOMD":"The ticker GOMD is GOMDori.","which cryptocurrency has the ticker TOKO":"The ticker TOKO is ToKoin.","which cryptocurrency has the ticker CXCELL":"The ticker CXCELL is CAPITAL X CELL.","name the cryptocurrency with the symbol CIPHC":"The ticker CIPHC is Cipher Core Token.","name the cryptocurrency with the symbol CPO":"The ticker CPO is Cryptopolis.","which cryptocurrency has the ticker TOTM":"The ticker TOTM is Totem.","what coin trades as CRD":"The ticker CRD is CRD Network.","which cryptocurrency has the ticker CVP":"The ticker CVP is PowerPool Concentrated Voting Power.","which cryptocurrency has the ticker IOP":"The ticker IOP is Internet of People.","what coin trades as GGS":"The ticker GGS is Gilgam.","what coin trades as BITCM":"The ticker BITCM is Bitcomo.","name the cryptocurrency with the symbol RINU":"The ticker RINU is Raichu Inu.","which cryptocurrency has the ticker EXTN":"The ticker EXTN is Extensive Coin."}}},
{"id":"n-49c8f804","guard":[["hasAny",["coin","cryptocurrency"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker CHIEF":"The ticker CHIEF is TheChiefCoin.","which cryptocurrency has the ticker BODHI":"The ticker BODHI is Bodhi Network.","which cryptocurrency has the ticker TAUR":"The ticker TAUR is Marnotaur.","which cryptocurrency has the ticker CNCT":"The ticker CNCT is CONNECT.","what coin trades as PEFI":"The ticker PEFI is Penguin Finance.","which cryptocurrency has the ticker PSPS":"The ticker PSPS is BobaCat.","name the cryptocurrency with the symbol GSX":"The ticker GSX is Gold Secured Currency.","name the cryptocurrency with the symbol DISK":"The ticker DISK is Dark Lisk.","name the cryptocurrency with the symbol NWS":"The ticker NWS is Nodewaves.","name the cryptocurrency with the symbol AFP":"The ticker AFP is Animal Farm Pigs.","what coin trades as OGSP":"The ticker OGSP is OriginSport.","which cryptocurrency has the ticker ARMS":"The ticker ARMS is 2Acoin.","what coin trades as KAYI":"The ticker KAYI is Kayı.","which cryptocurrency has the ticker YOP":"The ticker YOP is Yield Optimization Platform & Protocol.","which cryptocurrency has the ticker JMT":"The ticker JMT is JMTIME.","which cryptocurrency has the ticker KRL":"The ticker KRL is Kryll.","name the cryptocurrency with the symbol MCD":"The ticker MCD is CDbio.","what coin trades as VINU":"The ticker VINU is Vita Inu.","what coin trades as CAVA":"The ticker CAVA is Cavapoo.","what coin trades as FAT":"The ticker FAT is Fatcoin.","what coin trades as ARPA":"The ticker ARPA is ARPA Chain.","what coin trades as DIBBLE":"The ticker DIBBLE is Dibbles.","name the cryptocurrency with the symbol BIGHAN":"The ticker BIGHAN is BighanCoin.","name the cryptocurrency with the symbol FAKEAI":"The ticker FAKEAI is DeepFakeAI.","which cryptocurrency has the ticker ICSA":"The ticker ICSA is Icosa.","which cryptocurrency has the ticker VOY":"The ticker VOY is enVoy DeFi.","what coin trades as DATP":"The ticker DATP is Decentralized Asset Trading Platform.","name the cryptocurrency with the symbol MDR":"The ticker MDR is Mudra MDR.","what coin trades as KSM":"The ticker KSM is Kusama.","what coin trades as BDAY":"The ticker BDAY is Birthday Cake.","name the cryptocurrency with the symbol SMPL":"The ticker SMPL is SMPL Foundation.","which cryptocurrency has the ticker DRF":"The ticker DRF is Drife.","what coin trades as GAC":"The ticker GAC is Green Art Coin.","name the cryptocurrency with the symbol MODX":"The ticker MODX is MODEL-X-coin.","what coin trades as BEZ":"The ticker BEZ is Bezop.","which cryptocurrency has the ticker FANX":"The ticker FANX is FrontFanz.","what coin trades as ROOST":"The ticker ROOST is Roost Coin.","what coin trades as AIMS":"The ticker AIMS is HighCastle Token.","what coin trades as TELO":"The ticker TELO is Telo Meme Coin.","name the cryptocurrency with the symbol STRP":"The ticker STRP is Strips Finance.","name the cryptocurrency with the symbol DCIP":"The ticker DCIP is Decentralized Community Investment Protocol.","name the cryptocurrency with the symbol DAM":"The ticker DAM is Datamine.","which cryptocurrency has the ticker AIPE":"The ticker AIPE is AI Prediction Ecosystem.","name the cryptocurrency with the symbol CWV":"The ticker CWV is CryptoWave.","which cryptocurrency has the ticker NUA":"The ticker NUA is Neulaut Token.","which cryptocurrency has the ticker XVC":"The ticker XVC is Vcash.","what coin trades as OKLP":"The ticker OKLP is OkLetsPlay.","which cryptocurrency has the ticker TBANK":"The ticker TBANK is TaoBank.","name the cryptocurrency with the symbol MNS":"The ticker MNS is Monnos.","what coin trades as TAK":"The ticker TAK is TakCoin.","which cryptocurrency has the ticker CSS":"The ticker CSS is CoinSwap Token.","name the cryptocurrency with the symbol HGHG":"The ticker HGHG is HUGHUG Coin.","name the cryptocurrency with the symbol RBT":"The ticker RBT is Rabet.","name the cryptocurrency with the symbol XDN":"The ticker XDN is DigitalNote.","name the cryptocurrency with the symbol TIC":"The ticker TIC is TrueInvestmentCoin.","what coin trades as DIYAR":"The ticker DIYAR is Diyarbekirspor Token.","what coin trades as DON":"The ticker DON is Donnie Finance.","name the cryptocurrency with the symbol DSR":"The ticker DSR is Desire.","what coin trades as DXR":"The ticker DXR is DEXTER.","which cryptocurrency has the ticker NIFT":"The ticker NIFT is Niftify.","name the cryptocurrency with the symbol FIELD":"The ticker FIELD is Fieldcoin.","name the cryptocurrency with the symbol COQ":"The ticker COQ is Coq Inu.","name the cryptocurrency with the symbol WAND":"The ticker WAND is WandX.","which cryptocurrency has the ticker GOOD":"The ticker GOOD is Goodomy.","which cryptocurrency has the ticker OUR":"The ticker OUR is Our Pay.","what coin trades as XSD":"The ticker XSD is SounDAC.","what coin trades as BTCH":"The ticker BTCH is Bitcoin Hush.","what coin trades as KSC":"The ticker KSC is KStarCoin.","what coin trades as FUKU":"The ticker FUKU is Furukuru.","name the cryptocurrency with the symbol ASTRA":"The ticker ASTRA is Astra Protocol.","which cryptocurrency has the ticker AKA":"The ticker AKA is Akroma.","name the cryptocurrency with the symbol GOMD":"The ticker GOMD is GOMDori.","which cryptocurrency has the ticker TOKO":"The ticker TOKO is ToKoin.","which cryptocurrency has the ticker CXCELL":"The ticker CXCELL is CAPITAL X CELL.","name the cryptocurrency with the symbol CIPHC":"The ticker CIPHC is Cipher Core Token.","name the cryptocurrency with the symbol CPO":"The ticker CPO is Cryptopolis.","which cryptocurrency has the ticker TOTM":"The ticker TOTM is Totem.","what coin trades as CRD":"The ticker CRD is CRD Network.","which cryptocurrency has the ticker CVP":"The ticker CVP is PowerPool Concentrated Voting Power.","which cryptocurrency has the ticker IOP":"The ticker IOP is Internet of People.","what coin trades as GGS":"The ticker GGS is Gilgam.","what coin trades as BITCM":"The ticker BITCM is Bitcomo.","name the cryptocurrency with the symbol RINU":"The ticker RINU is Raichu Inu.","which cryptocurrency has the ticker EXTN":"The ticker EXTN is Extensive Coin."}}},
{"id":"n-97426d83","guard":[["has","cryptocurrency"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"cryptocurrency"}]]],"mem":{"table":{"has the ticker CHIEF":"The ticker CHIEF is TheChiefCoin.","has the ticker BODHI":"The ticker BODHI is Bodhi Network.","has the ticker TAUR":"The ticker TAUR is Marnotaur.","has the ticker CNCT":"The ticker CNCT is CONNECT.","has the ticker PSPS":"The ticker PSPS is BobaCat.","with the symbol GSX":"The ticker GSX is Gold Secured Currency.","with the symbol DISK":"The ticker DISK is Dark Lisk.","with the symbol NWS":"The ticker NWS is Nodewaves.","with the symbol AFP":"The ticker AFP is Animal Farm Pigs.","has the ticker ARMS":"The ticker ARMS is 2Acoin.","has the ticker YOP":"The ticker YOP is Yield Optimization Platform & Protocol.","has the ticker JMT":"The ticker JMT is JMTIME.","has the ticker KRL":"The ticker KRL is Kryll.","with the symbol MCD":"The ticker MCD is CDbio.","with the symbol BIGHAN":"The ticker BIGHAN is BighanCoin.","with the symbol FAKEAI":"The ticker FAKEAI is DeepFakeAI.","has the ticker ICSA":"The ticker ICSA is Icosa.","has the ticker VOY":"The ticker VOY is enVoy DeFi.","with the symbol MDR":"The ticker MDR is Mudra MDR.","with the symbol SMPL":"The ticker SMPL is SMPL Foundation.","has the ticker DRF":"The ticker DRF is Drife.","with the symbol MODX":"The ticker MODX is MODEL-X-coin.","has the ticker FANX":"The ticker FANX is FrontFanz.","with the symbol STRP":"The ticker STRP is Strips Finance.","with the symbol DCIP":"The ticker DCIP is Decentralized Community Investment Protocol.","with the symbol DAM":"The ticker DAM is Datamine.","has the ticker AIPE":"The ticker AIPE is AI Prediction Ecosystem.","with the symbol CWV":"The ticker CWV is CryptoWave.","has the ticker NUA":"The ticker NUA is Neulaut Token.","has the ticker XVC":"The ticker XVC is Vcash.","has the ticker TBANK":"The ticker TBANK is TaoBank.","with the symbol MNS":"The ticker MNS is Monnos.","has the ticker CSS":"The ticker CSS is CoinSwap Token.","with the symbol HGHG":"The ticker HGHG is HUGHUG Coin.","with the symbol RBT":"The ticker RBT is Rabet.","with the symbol XDN":"The ticker XDN is DigitalNote.","with the symbol TIC":"The ticker TIC is TrueInvestmentCoin.","with the symbol DSR":"The ticker DSR is Desire.","has the ticker NIFT":"The ticker NIFT is Niftify.","with the symbol FIELD":"The ticker FIELD is Fieldcoin.","with the symbol COQ":"The ticker COQ is Coq Inu.","with the symbol WAND":"The ticker WAND is WandX.","has the ticker GOOD":"The ticker GOOD is Goodomy.","has the ticker OUR":"The ticker OUR is Our Pay.","with the symbol ASTRA":"The ticker ASTRA is Astra Protocol.","has the ticker AKA":"The ticker AKA is Akroma.","with the symbol GOMD":"The ticker GOMD is GOMDori.","has the ticker TOKO":"The ticker TOKO is ToKoin.","has the ticker CXCELL":"The ticker CXCELL is CAPITAL X CELL.","with the symbol CIPHC":"The ticker CIPHC is Cipher Core Token.","with the symbol CPO":"The ticker CPO is Cryptopolis.","has the ticker TOTM":"The ticker TOTM is Totem.","has the ticker CVP":"The ticker CVP is PowerPool Concentrated Voting Power.","has the ticker IOP":"The ticker IOP is Internet of People.","with the symbol RINU":"The ticker RINU is Raichu Inu.","has the ticker EXTN":"The ticker EXTN is Extensive Coin."}}},
{"id":"n-64c49dff","guard":[["hasAny",["bodhi","crd"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-95cac960","guard":[["hasAny",["bodhi","capitalise","capitalize","capitalize each word","crd","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ac5b525a","guard":[["hasAny",["append","combine","concatenate","fat","put together","tak"]]],"pyramid":["render.str",["transform.concat",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-beb78ac3","guard":[["hasAny",["bodhi","crd","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3b90f021","guard":[["hasAny",["bodhi","crd","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-7c54c5b6","guard":[["hasAny",["bodhi","capitalise","capitalize","capitalize each word","crd","lower case","lowercase","small letters","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-98cd61f7","guard":[["hasAny",["bodhi","crd","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-abd4264c","guard":[["hasAny",["bodhi","crd","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-baf65566","guard":[["hasAny",["bodhi","crd","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0befa630","guard":[["hasAny",["bodhi","crd","each word","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0c3b1502","guard":[["hasAny",["bodhi","crd","lower case","lowercase","normalise","normalize","simplify the text","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ed4e8efb","guard":[["hasAny",["bodhi","crd","each word","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0162095e","guard":[["hasAny",["aipe","cryptocurrency","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker AIPE":"The ticker AIPE is AI Prediction Ecosystem."}}},
{"id":"n-03eeedf9","guard":[["has","btch"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as BTCH":"The ticker BTCH is Bitcoin Hush."}}},
{"id":"n-040eb404","guard":[["has","dcip"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Community Investment Protocol."]},["sense.lastWord"]],"mem":null},
{"id":"n-0570ee51","guard":[["hasAny",["afp","cryptocurrency","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol AFP":"The ticker AFP is Animal Farm Pigs."}}},
{"id":"n-065f8868","guard":[["has","taur"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker TAUR":"The ticker TAUR is Marnotaur."}}},
{"id":"n-0664f2ad","guard":[["has","aka"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker AKA":"The ticker AKA is Akroma."}}},
{"id":"n-067f410b","guard":[["hasAny",["aims","coin","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as AIMS":"The ticker AIMS is HighCastle Token."}}},
{"id":"n-0816215a","guard":[["hasAny",["bodhi","cryptocurrency","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker BODHI":"The ticker BODHI is Bodhi Network."}}},
{"id":"n-086c50ce","guard":[["has","datp"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Asset Trading Platform."]},["sense.lastWord"]],"mem":null},
{"id":"n-088d965e","guard":[["has","diyar"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Diyarbekirspor Token."]},["sense.lastWord"]],"mem":null},
{"id":"n-0991b223","guard":[["hasAny",["cryptocurrency","has","jmt","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker JMT":"The ticker JMT is JMTIME."}}},
{"id":"n-0a72896e","guard":[["has","oklp"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OkLetsPlay."]},["sense.lastWord"]],"mem":null},
{"id":"n-0aa0d1d7","guard":[["has","telo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as TELO":"The ticker TELO is Telo Meme Coin."}}},
{"id":"n-0b36d1b6","guard":[["has","ogsp"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OriginSport."]},["sense.lastWord"]],"mem":null},
{"id":"n-0cc4e19d","guard":[["hasAny",["cryptocurrency","has","krl","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker KRL":"The ticker KRL is Kryll."}}},
{"id":"n-0cd05d29","guard":[["hasAny",["cryptocurrency","has","ticker","voy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker VOY":"The ticker VOY is enVoy DeFi."}}},
{"id":"n-0db90a6f","guard":[["has","pefi"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Penguin Finance."]},["sense.lastWord"]],"mem":null},
{"id":"n-0f7556f3","guard":[["has","bighan"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is BighanCoin."]},["sense.lastWord"]],"mem":null},
{"id":"n-104ae663","guard":[["hasAny",["coin","pefi","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as PEFI":"The ticker PEFI is Penguin Finance."}}},
{"id":"n-10cbe5ba","guard":[["has","drf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker DRF":"The ticker DRF is Drife."}}},
{"id":"n-138cbb13","guard":[["hasAny",["cryptocurrency","css","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker CSS":"The ticker CSS is CoinSwap Token."}}},
{"id":"n-147dfcf9","guard":[["has","nws"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol NWS":"The ticker NWS is Nodewaves."}}},
{"id":"n-1553e0f1","guard":[["has","iop"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Internet of People."]},["sense.lastWord"]],"mem":null},
{"id":"n-156ef80b","guard":[["has","btch"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcoin Hush."]},["sense.lastWord"]],"mem":null},
{"id":"n-15aa1376","guard":[["has","ksc"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is KStarCoin."]},["sense.lastWord"]],"mem":null},
{"id":"n-15f3c2d0","guard":[["hasAny",["coin","gac","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as GAC":"The ticker GAC is Green Art Coin."}}},
{"id":"n-1685cb09","guard":[["hasAny",["cryptocurrency","has","ticker","totm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker TOTM":"The ticker TOTM is Totem."}}},
{"id":"n-18b1d359","guard":[["has","aipe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker AIPE":"The ticker AIPE is AI Prediction Ecosystem."}}},
{"id":"n-1a00a18a","guard":[["hasAny",["coin","trades","vinu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as VINU":"The ticker VINU is Vita Inu."}}},
{"id":"n-1aba07cc","guard":[["has","arpa"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ARPA Chain."]},["sense.lastWord"]],"mem":null},
{"id":"n-1b0e5791","guard":[["has","dxr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as DXR":"The ticker DXR is DEXTER."}}},
{"id":"n-1c4aa687","guard":[["has","datp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as DATP":"The ticker DATP is Decentralized Asset Trading Platform."}}},
{"id":"n-1e5fbbcd","guard":[["has","icsa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker ICSA":"The ticker ICSA is Icosa."}}},
{"id":"n-1f85f341","guard":[["hasAny",["astra","cryptocurrency","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol ASTRA":"The ticker ASTRA is Astra Protocol."}}},
{"id":"n-24371fc5","guard":[["hasAny",["cryptocurrency","name","symbol","xdn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol XDN":"The ticker XDN is DigitalNote."}}},
{"id":"n-253cfa2b","guard":[["hasAny",["coin","fat","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as FAT":"The ticker FAT is Fatcoin."}}},
{"id":"n-26302be3","guard":[["has","gomd"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is GOMDori."]},["sense.lastWord"]],"mem":null},
{"id":"n-278eb715","guard":[["has","taur"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Marnotaur."]},["sense.lastWord"]],"mem":null},
{"id":"n-27d096d1","guard":[["has","arms"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is 2Acoin."]},["sense.lastWord"]],"mem":null},
{"id":"n-288e2997","guard":[["has","tbank"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker TBANK":"The ticker TBANK is TaoBank."}}},
{"id":"n-296db3ec","guard":[["has","crd"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CRD Network."]},["sense.lastWord"]],"mem":null},
{"id":"n-2a40bfa0","guard":[["has","ksc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as KSC":"The ticker KSC is KStarCoin."}}},
{"id":"n-2c44268c","guard":[["has","tak"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as TAK":"The ticker TAK is TakCoin."}}},
{"id":"n-2e20f38e","guard":[["hasAny",["cava","coin","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as CAVA":"The ticker CAVA is Cavapoo."}}},
{"id":"n-310ea48c","guard":[["hasAny",["cryptocurrency","has","taur","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker TAUR":"The ticker TAUR is Marnotaur."}}},
{"id":"n-31b7b655","guard":[["has","fat"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fatcoin."]},["sense.lastWord"]],"mem":null},
{"id":"n-321145ec","guard":[["has","bitcm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as BITCM":"The ticker BITCM is Bitcomo."}}},
{"id":"n-32bf6613","guard":[["has","tic"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TrueInvestmentCoin."]},["sense.lastWord"]],"mem":null},
{"id":"n-33a0c10d","guard":[["has","fakeai"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DeepFakeAI."]},["sense.lastWord"]],"mem":null},
{"id":"n-33a5071b","guard":[["has","dam"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datamine."]},["sense.lastWord"]],"mem":null},
{"id":"n-33fe9354","guard":[["has","vinu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as VINU":"The ticker VINU is Vita Inu."}}},
{"id":"n-3432bd2e","guard":[["hasAny",["coq","cryptocurrency","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol COQ":"The ticker COQ is Coq Inu."}}},
{"id":"n-35bef3b6","guard":[["hasAny",["coin","ksm","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as KSM":"The ticker KSM is Kusama."}}},
{"id":"n-35f6e2f4","guard":[["has","ciphc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol CIPHC":"The ticker CIPHC is Cipher Core Token."}}},
{"id":"n-38fbb9cf","guard":[["hasAny",["cryptocurrency","has","ticker","xvc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker XVC":"The ticker XVC is Vcash."}}},
{"id":"n-398d11be","guard":[["hasAny",["cryptocurrency","drf","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker DRF":"The ticker DRF is Drife."}}},
{"id":"n-3a84d929","guard":[["has","hghg"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HUGHUG Coin."]},["sense.lastWord"]],"mem":null},
{"id":"n-3b5e0dcc","guard":[["hasAny",["coin","fuku","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as FUKU":"The ticker FUKU is Furukuru."}}},
{"id":"n-3c341d7c","guard":[["has","smpl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol SMPL":"The ticker SMPL is SMPL Foundation."}}},
{"id":"n-3c5a0923","guard":[["has","fanx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker FANX":"The ticker FANX is FrontFanz."}}},
{"id":"n-3d99babd","guard":[["has","xvc"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Vcash."]},["sense.lastWord"]],"mem":null},
{"id":"n-3f228c52","guard":[["has","cwv"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CryptoWave."]},["sense.lastWord"]],"mem":null},
{"id":"n-40588688","guard":[["has","xsd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as XSD":"The ticker XSD is SounDAC."}}},
{"id":"n-407f85f8","guard":[["hasAny",["coin","telo","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as TELO":"The ticker TELO is Telo Meme Coin."}}},
{"id":"n-4603a9c0","guard":[["has","hghg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol HGHG":"The ticker HGHG is HUGHUG Coin."}}},
{"id":"n-48f728e6","guard":[["has","cwv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol CWV":"The ticker CWV is CryptoWave."}}},
{"id":"n-4b3fc21c","guard":[["hasAny",["chief","cryptocurrency","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker CHIEF":"The ticker CHIEF is TheChiefCoin."}}},
{"id":"n-4c70c3a9","guard":[["has","fanx"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is FrontFanz."]},["sense.lastWord"]],"mem":null},
{"id":"n-4df2d646","guard":[["has","kayi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as KAYI":"The ticker KAYI is Kayı."}}},
{"id":"n-4df83fda","guard":[["hasAny",["cryptocurrency","hghg","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol HGHG":"The ticker HGHG is HUGHUG Coin."}}},
{"id":"n-525b9a03","guard":[["has","xdn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol XDN":"The ticker XDN is DigitalNote."}}},
{"id":"n-526fb32d","guard":[["has","rbt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol RBT":"The ticker RBT is Rabet."}}},
{"id":"n-545fbcc9","guard":[["has","extn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker EXTN":"The ticker EXTN is Extensive Coin."}}},
{"id":"n-55a44087","guard":[["hasAny",["cryptocurrency","has","psps","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker PSPS":"The ticker PSPS is BobaCat."}}},
{"id":"n-5771504e","guard":[["has","ogsp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as OGSP":"The ticker OGSP is OriginSport."}}},
{"id":"n-57c995af","guard":[["hasAny",["coin","datp","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as DATP":"The ticker DATP is Decentralized Asset Trading Platform."}}},
{"id":"n-58908d3a","guard":[["has","cpo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol CPO":"The ticker CPO is Cryptopolis."}}},
{"id":"n-58aba027","guard":[["hasAny",["cpo","cryptocurrency","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol CPO":"The ticker CPO is Cryptopolis."}}},
{"id":"n-5b6e8f98","guard":[["has","nift"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker NIFT":"The ticker NIFT is Niftify."}}},
{"id":"n-5ba2c469","guard":[["hasAny",["cryptocurrency","name","nws","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol NWS":"The ticker NWS is Nodewaves."}}},
{"id":"n-5d9a981e","guard":[["hasAny",["cryptocurrency","name","strp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol STRP":"The ticker STRP is Strips Finance."}}},
{"id":"n-5de3238b","guard":[["hasAny",["aka","cryptocurrency","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker AKA":"The ticker AKA is Akroma."}}},
{"id":"n-5f24846a","guard":[["has","yop"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Yield Optimization Platform & Protocol."]},["sense.lastWord"]],"mem":null},
{"id":"n-5fc22ab8","guard":[["hasAny",["cryptocurrency","name","symbol","tic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol TIC":"The ticker TIC is TrueInvestmentCoin."}}},
{"id":"n-5fda0573","guard":[["hasAny",["bez","coin","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as BEZ":"The ticker BEZ is Bezop."}}},
{"id":"n-60707fcf","guard":[["has","dsr"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Desire."]},["sense.lastWord"]],"mem":null},
{"id":"n-61c1635d","guard":[["has","cava"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cavapoo."]},["sense.lastWord"]],"mem":null},
{"id":"n-624e42e2","guard":[["hasAny",["cryptocurrency","dsr","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol DSR":"The ticker DSR is Desire."}}},
{"id":"n-644f2e79","guard":[["has","dxr"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DEXTER."]},["sense.lastWord"]],"mem":null},
{"id":"n-679f583c","guard":[["hasAny",["cryptocurrency","disk","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol DISK":"The ticker DISK is Dark Lisk."}}},
{"id":"n-67d430eb","guard":[["has","ksm"],["has","coin"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kusama."]},["sense.lastWord"]],"mem":null},
{"id":"n-6acee53c","guard":[["has","pefi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as PEFI":"The ticker PEFI is Penguin Finance."}}},
{"id":"n-6c31e867","guard":[["hasAny",["cryptocurrency","mdr","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol MDR":"The ticker MDR is Mudra MDR."}}},
{"id":"n-6ca73e0f","guard":[["has","don"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as DON":"The ticker DON is Donnie Finance."}}},
{"id":"n-6dc814b8","guard":[["hasAny",["cryptocurrency","name","rinu","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol RINU":"The ticker RINU is Raichu Inu."}}},
{"id":"n-6ea0b27e","guard":[["hasAny",["coin","ggs","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as GGS":"The ticker GGS is Gilgam."}}},
{"id":"n-6f6d4e57","guard":[["has","chief"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker CHIEF":"The ticker CHIEF is TheChiefCoin."}}},
{"id":"n-6f9e7741","guard":[["hasAny",["cryptocurrency","extn","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker EXTN":"The ticker EXTN is Extensive Coin."}}},
{"id":"n-7066483e","guard":[["has","dam"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol DAM":"The ticker DAM is Datamine."}}},
{"id":"n-70738a7a","guard":[["has","jmt"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is JMTIME."]},["sense.lastWord"]],"mem":null},
{"id":"n-7081418d","guard":[["hasAny",["cnct","cryptocurrency","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker CNCT":"The ticker CNCT is CONNECT."}}},
{"id":"n-7139c13c","guard":[["hasAny",["cryptocurrency","dcip","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol DCIP":"The ticker DCIP is Decentralized Community Investment Protocol."}}},
{"id":"n-71bd48f8","guard":[["hasAny",["arpa","coin","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as ARPA":"The ticker ARPA is ARPA Chain."}}},
{"id":"n-727edcc4","guard":[["hasAny",["coin","ogsp","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as OGSP":"The ticker OGSP is OriginSport."}}},
{"id":"n-72c41f5c","guard":[["hasAny",["cryptocurrency","name","rbt","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol RBT":"The ticker RBT is Rabet."}}},
{"id":"n-7340ee38","guard":[["has","strp"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Strips Finance."]},["sense.lastWord"]],"mem":null},
{"id":"n-734384da","guard":[["has","aka"],["has","which"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Akroma."]},["sense.lastWord"]],"mem":null},
{"id":"n-739f03c5","guard":[["has","nift"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Niftify."]},["sense.lastWord"]],"mem":null},
{"id":"n-73af174a","guard":[["has","bday"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as BDAY":"The ticker BDAY is Birthday Cake."}}},
{"id":"n-74260c80","guard":[["hasAny",["cryptocurrency","mns","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol MNS":"The ticker MNS is Monnos."}}},
{"id":"n-747f7b33","guard":[["has","mns"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol MNS":"The ticker MNS is Monnos."}}},
{"id":"n-75dc6980","guard":[["has","cxcell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker CXCELL":"The ticker CXCELL is CAPITAL X CELL."}}},
{"id":"n-767bce84","guard":[["has","rinu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol RINU":"The ticker RINU is Raichu Inu."}}},
{"id":"n-7835a889","guard":[["hasAny",["cryptocurrency","has","icsa","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker ICSA":"The ticker ICSA is Icosa."}}},
{"id":"n-790c89ae","guard":[["has","tbank"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TaoBank."]},["sense.lastWord"]],"mem":null},
{"id":"n-7929df71","guard":[["hasAny",["bday","coin","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as BDAY":"The ticker BDAY is Birthday Cake."}}},
{"id":"n-7b2650b8","guard":[["has","cvp"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is PowerPool Concentrated Voting Power."]},["sense.lastWord"]],"mem":null},
{"id":"n-7c012e7d","guard":[["has","icsa"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Icosa."]},["sense.lastWord"]],"mem":null},
{"id":"n-7cf39204","guard":[["has","gac"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art Coin."]},["sense.lastWord"]],"mem":null},
{"id":"n-7f792e4e","guard":[["has","afp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol AFP":"The ticker AFP is Animal Farm Pigs."}}},
{"id":"n-800cb43e","guard":[["hasAny",["cryptocurrency","field","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol FIELD":"The ticker FIELD is Fieldcoin."}}},
{"id":"n-8150bea6","guard":[["hasAny",["btch","coin","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as BTCH":"The ticker BTCH is Bitcoin Hush."}}},
{"id":"n-81598f76","guard":[["has","wand"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is WandX."]},["sense.lastWord"]],"mem":null},
{"id":"n-84f159c0","guard":[["has","cnct"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CONNECT."]},["sense.lastWord"]],"mem":null},
{"id":"n-8562846c","guard":[["has","kayi"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kayı."]},["sense.lastWord"]],"mem":null},
{"id":"n-859ad304","guard":[["has","smpl"],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is SMPL Foundation."]},["sense.lastWord"]],"mem":null},
{"id":"n-85a73b02","guard":[["hasAny",["coin","don","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as DON":"The ticker DON is Donnie Finance."}}},
{"id":"n-8676ec6a","guard":[["hasAny",["arms","cryptocurrency","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker ARMS":"The ticker ARMS is 2Acoin."}}},
{"id":"n-8832644a","guard":[["has","gsx"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gold Secured Currency."]},["sense.lastWord"]],"mem":null},
{"id":"n-8a45f876","guard":[["has","rinu"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Raichu Inu."]},["sense.lastWord"]],"mem":null},
{"id":"n-8abd7c01","guard":[["has","xvc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker XVC":"The ticker XVC is Vcash."}}},
{"id":"n-8e21d346","guard":[["has","mcd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol MCD":"The ticker MCD is CDbio."}}},
{"id":"n-8f8016a1","guard":[["hasAny",["cryptocurrency","has","tbank","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker TBANK":"The ticker TBANK is TaoBank."}}},
{"id":"n-8f9d98f0","guard":[["has","ggs"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilgam."]},["sense.lastWord"]],"mem":null},
{"id":"n-907586a2","guard":[["hasAny",["cryptocurrency","has","ticker","yop"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker YOP":"The ticker YOP is Yield Optimization Platform & Protocol."}}},
{"id":"n-9206a44b","guard":[["has","yop"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker YOP":"The ticker YOP is Yield Optimization Platform & Protocol."}}},
{"id":"n-93216439","guard":[["has","gomd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol GOMD":"The ticker GOMD is GOMDori."}}},
{"id":"n-9321ff43","guard":[["has","mdr"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra MDR."]},["sense.lastWord"]],"mem":null},
{"id":"n-93fd41df","guard":[["has","css"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker CSS":"The ticker CSS is CoinSwap Token."}}},
{"id":"n-9453e92c","guard":[["hasAny",["ciphc","cryptocurrency","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol CIPHC":"The ticker CIPHC is Cipher Core Token."}}},
{"id":"n-9534d970","guard":[["has","dibble"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dibbles."]},["sense.lastWord"]],"mem":null},
{"id":"n-95acd740","guard":[["hasAny",["bighan","cryptocurrency","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol BIGHAN":"The ticker BIGHAN is BighanCoin."}}},
{"id":"n-95bff3b9","guard":[["has","chief"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TheChiefCoin."]},["sense.lastWord"]],"mem":null},
{"id":"n-95e4fe69","guard":[["has","xdn"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DigitalNote."]},["sense.lastWord"]],"mem":null},
{"id":"n-97762c35","guard":[["has","disk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol DISK":"The ticker DISK is Dark Lisk."}}},
{"id":"n-989b70bb","guard":[["has","roost"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as ROOST":"The ticker ROOST is Roost Coin."}}},
{"id":"n-991807b1","guard":[["hasAny",["coin","tak","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as TAK":"The ticker TAK is TakCoin."}}},
{"id":"n-998bafa6","guard":[["has","dsr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol DSR":"The ticker DSR is Desire."}}},
{"id":"n-9ba922c2","guard":[["hasAny",["coin","oklp","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as OKLP":"The ticker OKLP is OkLetsPlay."}}},
{"id":"n-9c086c31","guard":[["has","field"],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fieldcoin."]},["sense.lastWord"]],"mem":null},
{"id":"n-a05bdc2a","guard":[["has","nua"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker NUA":"The ticker NUA is Neulaut Token."}}},
{"id":"n-a09c84c1","guard":[["has","gsx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol GSX":"The ticker GSX is Gold Secured Currency."}}},
{"id":"n-a0a26db6","guard":[["has","krl"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kryll."]},["sense.lastWord"]],"mem":null},
{"id":"n-a276a082","guard":[["has","drf"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Drife."]},["sense.lastWord"]],"mem":null},
{"id":"n-a2e9ca0b","guard":[["has","nua"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Neulaut Token."]},["sense.lastWord"]],"mem":null},
{"id":"n-a632518f","guard":[["hasAny",["cryptocurrency","cxcell","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker CXCELL":"The ticker CXCELL is CAPITAL X CELL."}}},
{"id":"n-a8d3f73a","guard":[["hasAny",["cryptocurrency","gsx","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol GSX":"The ticker GSX is Gold Secured Currency."}}},
{"id":"n-a9fc4017","guard":[["hasAny",["cryptocurrency","fakeai","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol FAKEAI":"The ticker FAKEAI is DeepFakeAI."}}},
{"id":"n-ac165cbc","guard":[["hasAny",["cryptocurrency","good","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker GOOD":"The ticker GOOD is Goodomy."}}},
{"id":"n-ad941b54","guard":[["hasAny",["coin","crd","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as CRD":"The ticker CRD is CRD Network."}}},
{"id":"n-af64a892","guard":[["has","ggs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as GGS":"The ticker GGS is Gilgam."}}},
{"id":"n-b0a3e3ad","guard":[["has","aipe"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is AI Prediction Ecosystem."]},["sense.lastWord"]],"mem":null},
{"id":"n-b4b2618a","guard":[["has","bez"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as BEZ":"The ticker BEZ is Bezop."}}},
{"id":"n-b5776cb4","guard":[["has","oklp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as OKLP":"The ticker OKLP is OkLetsPlay."}}},
{"id":"n-b57b1e56","guard":[["has","fakeai"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol FAKEAI":"The ticker FAKEAI is DeepFakeAI."}}},
{"id":"n-b57faf3a","guard":[["has","ksm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as KSM":"The ticker KSM is Kusama."}}},
{"id":"n-b65f0f2e","guard":[["has","good"],["has","which"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Goodomy."]},["sense.lastWord"]],"mem":null},
{"id":"n-b7ed0930","guard":[["hasAny",["coin","trades","xsd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as XSD":"The ticker XSD is SounDAC."}}},
{"id":"n-b9ec100d","guard":[["has","bez"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bezop."]},["sense.lastWord"]],"mem":null},
{"id":"n-babedd35","guard":[["has","tak"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TakCoin."]},["sense.lastWord"]],"mem":null},
{"id":"n-bb4bbf33","guard":[["has","totm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker TOTM":"The ticker TOTM is Totem."}}},
{"id":"n-bb70f879","guard":[["has","cpo"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cryptopolis."]},["sense.lastWord"]],"mem":null},
{"id":"n-bc012544","guard":[["hasAny",["coin","diyar","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as DIYAR":"The ticker DIYAR is Diyarbekirspor Token."}}},
{"id":"n-bc2a8bbc","guard":[["has","mdr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol MDR":"The ticker MDR is Mudra MDR."}}},
{"id":"n-bc9bb560","guard":[["has","diyar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as DIYAR":"The ticker DIYAR is Diyarbekirspor Token."}}},
{"id":"n-be916f9c","guard":[["has","aims"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HighCastle Token."]},["sense.lastWord"]],"mem":null},
{"id":"n-bedc6ab5","guard":[["has","toko"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker TOKO":"The ticker TOKO is ToKoin."}}},
{"id":"n-bfe9da6a","guard":[["has","jmt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker JMT":"The ticker JMT is JMTIME."}}},
{"id":"n-c062e9e1","guard":[["has","bday"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Birthday Cake."]},["sense.lastWord"]],"mem":null},
{"id":"n-c0e879ca","guard":[["hasAny",["cryptocurrency","has","iop","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker IOP":"The ticker IOP is Internet of People."}}},
{"id":"n-c2a37db4","guard":[["has","dibble"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as DIBBLE":"The ticker DIBBLE is Dibbles."}}},
{"id":"n-c3ec36b7","guard":[["hasAny",["cryptocurrency","name","symbol","wand"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol WAND":"The ticker WAND is WandX."}}},
{"id":"n-c58c1bc7","guard":[["has","astra"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol ASTRA":"The ticker ASTRA is Astra Protocol."}}},
{"id":"n-c79d8872","guard":[["has","good"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker GOOD":"The ticker GOOD is Goodomy."}}},
{"id":"n-c7ca9e84","guard":[["has","cnct"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker CNCT":"The ticker CNCT is CONNECT."}}},
{"id":"n-c9360d95","guard":[["has","toko"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ToKoin."]},["sense.lastWord"]],"mem":null},
{"id":"n-c9d1aed9","guard":[["has","extn"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Extensive Coin."]},["sense.lastWord"]],"mem":null},
{"id":"n-ca0032df","guard":[["hasAny",["cryptocurrency","fanx","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker FANX":"The ticker FANX is FrontFanz."}}},
{"id":"n-ca7bba2a","guard":[["has","fat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as FAT":"The ticker FAT is Fatcoin."}}},
{"id":"n-cab6d8fa","guard":[["has","coq"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Coq Inu."]},["sense.lastWord"]],"mem":null},
{"id":"n-caf23374","guard":[["hasAny",["coin","dxr","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as DXR":"The ticker DXR is DEXTER."}}},
{"id":"n-d0024321","guard":[["hasAny",["cryptocurrency","has","nift","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker NIFT":"The ticker NIFT is Niftify."}}},
{"id":"n-d0a1f36b","guard":[["has","nws"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nodewaves."]},["sense.lastWord"]],"mem":null},
{"id":"n-d39ca367","guard":[["has","css"],["has","which"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CoinSwap Token."]},["sense.lastWord"]],"mem":null},
{"id":"n-d506ba2b","guard":[["hasAny",["cryptocurrency","has","ticker","toko"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker TOKO":"The ticker TOKO is ToKoin."}}},
{"id":"n-d709b306","guard":[["hasAny",["cryptocurrency","gomd","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol GOMD":"The ticker GOMD is GOMDori."}}},
{"id":"n-d820d130","guard":[["hasAny",["cryptocurrency","name","smpl","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol SMPL":"The ticker SMPL is SMPL Foundation."}}},
{"id":"n-d8c29dbf","guard":[["has","field"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol FIELD":"The ticker FIELD is Fieldcoin."}}},
{"id":"n-da00b98e","guard":[["has","crd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as CRD":"The ticker CRD is CRD Network."}}},
{"id":"n-da70f76e","guard":[["has","iop"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker IOP":"The ticker IOP is Internet of People."}}},
{"id":"n-da81f8bf","guard":[["has","voy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker VOY":"The ticker VOY is enVoy DeFi."}}},
{"id":"n-dbf2c471","guard":[["hasAny",["cryptocurrency","dam","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol DAM":"The ticker DAM is Datamine."}}},
{"id":"n-dc215a8d","guard":[["has","mns"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Monnos."]},["sense.lastWord"]],"mem":null},
{"id":"n-dcfa2244","guard":[["has","totm"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Totem."]},["sense.lastWord"]],"mem":null},
{"id":"n-dd424d1c","guard":[["hasAny",["coin","dibble","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as DIBBLE":"The ticker DIBBLE is Dibbles."}}},
{"id":"n-de772182","guard":[["has","arpa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as ARPA":"The ticker ARPA is ARPA Chain."}}},
{"id":"n-de99b95a","guard":[["has","strp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol STRP":"The ticker STRP is Strips Finance."}}},
{"id":"n-df88ca01","guard":[["has","fuku"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Furukuru."]},["sense.lastWord"]],"mem":null},
{"id":"n-e032f2b7","guard":[["has","afp"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Animal Farm Pigs."]},["sense.lastWord"]],"mem":null},
{"id":"n-e05474ef","guard":[["has","fuku"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as FUKU":"The ticker FUKU is Furukuru."}}},
{"id":"n-e219214a","guard":[["has","xsd"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is SounDAC."]},["sense.lastWord"]],"mem":null},
{"id":"n-e2b62c2e","guard":[["has","modx"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is MODEL-X-coin."]},["sense.lastWord"]],"mem":null},
{"id":"n-e2f10f78","guard":[["has","disk"],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dark Lisk."]},["sense.lastWord"]],"mem":null},
{"id":"n-e3095a14","guard":[["hasAny",["cryptocurrency","cwv","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol CWV":"The ticker CWV is CryptoWave."}}},
{"id":"n-e48418c9","guard":[["hasAny",["cryptocurrency","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker OUR":"The ticker OUR is Our Pay."}}},
{"id":"n-e5a336ac","guard":[["has","vinu"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Vita Inu."]},["sense.lastWord"]],"mem":null},
{"id":"n-e6ff4d26","guard":[["hasAny",["cryptocurrency","modx","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol MODX":"The ticker MODX is MODEL-X-coin."}}},
{"id":"n-e913b477","guard":[["has","don"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Donnie Finance."]},["sense.lastWord"]],"mem":null},
{"id":"n-e92df941","guard":[["has","cxcell"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CAPITAL X CELL."]},["sense.lastWord"]],"mem":null},
{"id":"n-e941e705","guard":[["hasAny",["bitcm","coin","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as BITCM":"The ticker BITCM is Bitcomo."}}},
{"id":"n-e9b3539e","guard":[["has","cvp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker CVP":"The ticker CVP is PowerPool Concentrated Voting Power."}}},
{"id":"n-ea32c906","guard":[["has","dcip"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol DCIP":"The ticker DCIP is Decentralized Community Investment Protocol."}}},
{"id":"n-eaf7acee","guard":[["has","krl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker KRL":"The ticker KRL is Kryll."}}},
{"id":"n-eb27501b","guard":[["has","ciphc"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cipher Core Token."]},["sense.lastWord"]],"mem":null},
{"id":"n-edfc0cf9","guard":[["has","bighan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol BIGHAN":"The ticker BIGHAN is BighanCoin."}}},
{"id":"n-eecaedfb","guard":[["has","bitcm"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcomo."]},["sense.lastWord"]],"mem":null},
{"id":"n-ef216916","guard":[["has","voy"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is enVoy DeFi."]},["sense.lastWord"]],"mem":null},
{"id":"n-f0bcdf40","guard":[["hasAny",["coin","kayi","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as KAYI":"The ticker KAYI is Kayı."}}},
{"id":"n-f0be7f1f","guard":[["has","rbt"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Rabet."]},["sense.lastWord"]],"mem":null},
{"id":"n-f0f8f317","guard":[["hasAny",["cryptocurrency","has","nua","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker NUA":"The ticker NUA is Neulaut Token."}}},
{"id":"n-f1a81da2","guard":[["has","mcd"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CDbio."]},["sense.lastWord"]],"mem":null},
{"id":"n-f37e23bd","guard":[["has","psps"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker PSPS":"The ticker PSPS is BobaCat."}}},
{"id":"n-f3ad394a","guard":[["has","cava"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as CAVA":"The ticker CAVA is Cavapoo."}}},
{"id":"n-f4cb7066","guard":[["has","coq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol COQ":"The ticker COQ is Coq Inu."}}},
{"id":"n-f5cee4c0","guard":[["has","psps"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is BobaCat."]},["sense.lastWord"]],"mem":null},
{"id":"n-f5eceb93","guard":[["has","tic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol TIC":"The ticker TIC is TrueInvestmentCoin."}}},
{"id":"n-f6c24e66","guard":[["hasAny",["cryptocurrency","mcd","name","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol MCD":"The ticker MCD is CDbio."}}},
{"id":"n-f769c7e0","guard":[["has","wand"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol WAND":"The ticker WAND is WandX."}}},
{"id":"n-f76c2e57","guard":[["hasAny",["cryptocurrency","cvp","has","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker CVP":"The ticker CVP is PowerPool Concentrated Voting Power."}}},
{"id":"n-f7ae9dcb","guard":[["hasAny",["coin","roost","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as ROOST":"The ticker ROOST is Roost Coin."}}},
{"id":"n-f7e83f4d","guard":[["has","arms"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker ARMS":"The ticker ARMS is 2Acoin."}}},
{"id":"n-f974b5bf","guard":[["has","modx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the cryptocurrency with the symbol MODX":"The ticker MODX is MODEL-X-coin."}}},
{"id":"n-f986e16d","guard":[["has","aims"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as AIMS":"The ticker AIMS is HighCastle Token."}}},
{"id":"n-f9d4145d","guard":[["has","astra"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Astra Protocol."]},["sense.lastWord"]],"mem":null},
{"id":"n-fa7a5fe7","guard":[["hasAny",["coin","ksc","trades"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what coin trades as KSC":"The ticker KSC is KStarCoin."}}},
{"id":"n-fa9de45f","guard":[["has","bodhi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which cryptocurrency has the ticker BODHI":"The ticker BODHI is Bodhi Network."}}},
{"id":"n-fb9e1b8d","guard":[["has","gac"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what coin trades as GAC":"The ticker GAC is Green Art Coin."}}},
{"id":"n-004e1899","guard":[["hasAny",["dxr","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DEXTER."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-029dc7f2","guard":[["hasAny",["afp","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Animal Farm Pigs."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-03ab4ca3","guard":[["hasAny",["cwv","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CryptoWave."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-056e7b6c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tic","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TrueInvestmentCoin."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-058eda5c","guard":[["hasAny",["ksc","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is KStarCoin."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-071abb4f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ogsp","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OriginSport."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0887049c","guard":[["hasAny",["field","lower case","lowercase","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fieldcoin."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-09c4c7a6","guard":[["hasAny",["bitcm","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcomo."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0c82b0eb","guard":[["hasAny",["gsx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gold Secured Currency."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0d77a236","guard":[["hasAny",["dxr","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DEXTER."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0db126fe","guard":[["hasAny",["no vowels","nws","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nodewaves."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-0e76ea23","guard":[["hasAny",["no vowels","rbt","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Rabet."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-0f54de73","guard":[["hasAny",["lower case","lowercase","mdr","small letters"]]],"pyramid":["render.template",{"lit":["The ticker MDR is Mudra ",{"slot":0},"."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-13d1f9ee","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xdn"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DigitalNote."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-14e1be14","guard":[["hasAny",["dsr","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Desire."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-175d7ca5","guard":[["hasAny",["lower case","lowercase","mcd","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CDbio."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-178c8524","guard":[["has","astra"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Protocol."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-17a34c54","guard":[["hasAny",["lower case","lowercase","ogsp","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OriginSport."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-197066bf","guard":[["hasAny",["dam","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datamine."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-20b6ec0f","guard":[["hasAny",["mns","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Monnos."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-210e369d","guard":[["hasAny",["afp","alphabetize the letters","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Animal Farm Pigs."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-21367063","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dibble","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dibbles."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-21cbc616","guard":[["hasAny",["rbt","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Rabet."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-23e53544","guard":[["hasAny",["cpo","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cryptopolis."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-26d6a2c1","guard":[["hasAny",["btch","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcoin Hush."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-274f9bca","guard":[["hasAny",["hghg","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HUGHUG Coin."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-2fe7ed67","guard":[["hasAny",["shortest","shortest one","shortest word","xsd"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is SounDAC."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-312eebab","guard":[["hasAny",["nws","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nodewaves."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-32eaeef2","guard":[["hasAny",["aims","alphabetize the letters","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HighCastle Token."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-32f94e9a","guard":[["hasAny",["mcd","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CDbio."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-33491b0a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","don","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Donnie Finance."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-33540840","guard":[["hasAny",["hghg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HUGHUG Coin."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-33fff9ff","guard":[["hasAny",["shortest","shortest one","shortest word","tak"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TakCoin."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-348b3d24","guard":[["hasAny",["ggs","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilgam."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-37906d07","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cpo","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cryptopolis."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3c80c9d5","guard":[["hasAny",["afp","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Animal Farm Pigs."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3d25ca19","guard":[["hasAny",["lower case","lowercase","rbt","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Rabet."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3e2fddaf","guard":[["hasAny",["shortest","shortest one","shortest word","tic"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TrueInvestmentCoin."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3eb7ecd2","guard":[["hasAny",["cwv","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CryptoWave."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-3fdbd64e","guard":[["has","coq"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-3fe791c1","guard":[["hasAny",["lower case","lowercase","oklp","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OkLetsPlay."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-415ee45d","guard":[["hasAny",["lower case","lowercase","small letters","tic"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TrueInvestmentCoin."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-453f8a38","guard":[["hasAny",["lower case","lowercase","small letters","strp"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Strips Finance."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4552b05b","guard":[["hasAny",["gomd","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is GOMDori."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4df56c17","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dcip","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Community Investment Protocol."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-531969bd","guard":[["hasAny",["bday","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Birthday Cake."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5511e5a2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mcd","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CDbio."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-552cdc5e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ksm","title case"]],["has","coin"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kusama."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-55aee137","guard":[["hasAny",["lower case","lowercase","rinu","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Raichu Inu."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-587fe264","guard":[["hasAny",["capitalise","capitalize","capitalize each word","field","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fieldcoin."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-59950be5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fakeai","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DeepFakeAI."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5a3aa46b","guard":[["has","mdr"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-5cf6e676","guard":[["hasAny",["ggs","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilgam."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5f07aca5","guard":[["hasAny",["bitcm","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcomo."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-634b6725","guard":[["hasAny",["cpo","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cryptopolis."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-640987d8","guard":[["hasAny",["don","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Donnie Finance."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6701bd34","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tak","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TakCoin."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-67326c6e","guard":[["hasAny",["no vowels","remove vowels","strp","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Strips Finance."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-67a9f9de","guard":[["hasAny",["bez","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bezop."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-691354b5","guard":[["hasAny",["fat","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fatcoin."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6c104efa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fuku","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Furukuru."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6ca6d77e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xsd"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is SounDAC."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6f673457","guard":[["hasAny",["don","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Donnie Finance."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-70f6f1fb","guard":[["hasAny",["bday","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Birthday Cake."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-76b9a22e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gomd","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is GOMDori."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-78119d92","guard":[["hasAny",["crd","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker CRD is ",{"slot":0}," Network."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-78816316","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fat","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fatcoin."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7a23000c","guard":[["hasAny",["lower case","lowercase","nws","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nodewaves."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7a3af2e4","guard":[["hasAny",["disk","lower case","lowercase","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dark Lisk."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7bccde09","guard":[["hasAny",["ksc","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is KStarCoin."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7e7154be","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gsx","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gold Secured Currency."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-80002c68","guard":[["hasAny",["aims","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HighCastle Token."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-80541b3e","guard":[["hasAny",["lower case","lowercase","small letters","tak"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TakCoin."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-809d0b66","guard":[["hasAny",["kayi","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kayı."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-81d118d7","guard":[["hasAny",["fuku","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Furukuru."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-81fdc9d5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dam","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datamine."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-82931a8b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rinu","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Raichu Inu."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-85296a2e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nws","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nodewaves."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-89e56ad8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cava","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cavapoo."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8b705d23","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rbt","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Rabet."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8d43f9ad","guard":[["hasAny",["datp","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Asset Trading Platform."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8d93386d","guard":[["hasAny",["bez","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bezop."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-90286e1e","guard":[["hasAny",["lower case","lowercase","mns","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Monnos."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-912f942a","guard":[["hasAny",["gsx","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gold Secured Currency."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-99127a5d","guard":[["hasAny",["ksm","shortest","shortest one","shortest word"]],["has","coin"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kusama."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9b2e2b29","guard":[["hasAny",["mcd","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CDbio."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a265f748","guard":[["hasAny",["cwv","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CryptoWave."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a2dc2170","guard":[["hasAny",["capitalise","capitalize","capitalize each word","disk","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dark Lisk."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a59e8e2d","guard":[["hasAny",["fat","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fatcoin."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a5db48ed","guard":[["hasAny",["capitalise","capitalize","capitalize each word","datp","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Asset Trading Platform."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a666027a","guard":[["hasAny",["diyar","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Diyarbekirspor Token."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ab4883cb","guard":[["hasAny",["afp","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Animal Farm Pigs."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ad322a95","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mns","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Monnos."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-af3ed1d9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","oklp","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OkLetsPlay."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-af4b1b91","guard":[["hasAny",["bighan","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is BighanCoin."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b0935fb7","guard":[["hasAny",["dsr","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Desire."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-b13de2a3","guard":[["hasAny",["dam","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datamine."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b20a1461","guard":[["hasAny",["lower case","lowercase","modx","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is MODEL-X-coin."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b24c4691","guard":[["hasAny",["lower case","lowercase","small letters","xdn"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DigitalNote."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b38d977e","guard":[["hasAny",["gsx","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gold Secured Currency."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b47e67a7","guard":[["hasAny",["cava","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cavapoo."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b5942615","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ggs","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilgam."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bbb654e1","guard":[["hasAny",["dsr","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Desire."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bc347c58","guard":[["hasAny",["coq","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker COQ is ",{"slot":0}," Inu."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-bd0316b0","guard":[["hasAny",["bighan","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is BighanCoin."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-bd6f0109","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pefi","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Penguin Finance."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-be858f71","guard":[["hasAny",["shortest","shortest one","shortest word","xdn"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DigitalNote."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-beb9f1ca","guard":[["hasAny",["capitalise","capitalize","capitalize each word","modx","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is MODEL-X-coin."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c129ba0f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hghg","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HUGHUG Coin."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c293fb65","guard":[["hasAny",["fakeai","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DeepFakeAI."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c465a6eb","guard":[["hasAny",["lower case","lowercase","pefi","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Penguin Finance."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c830e188","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ciphc","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cipher Core Token."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c8bf6633","guard":[["hasAny",["btch","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcoin Hush."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-c9b507bc","guard":[["hasAny",["ksm","lower case","lowercase","small letters"]],["has","coin"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kusama."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ca47c762","guard":[["hasAny",["capitalise","capitalize","capitalize each word","strp","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Strips Finance."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cfc0c82c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kayi","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kayı."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d24a70fe","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dxr","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DEXTER."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d2b66def","guard":[["hasAny",["astra","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ASTRA is ",{"slot":0}," Protocol."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d4625ae3","guard":[["hasAny",["dcip","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Community Investment Protocol."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d49ed494","guard":[["hasAny",["btch","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcoin Hush."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d776e2da","guard":[["hasAny",["bez","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bezop."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d9b71b1e","guard":[["hasAny",["lower case","lowercase","small letters","smpl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker SMPL is ",{"slot":0}," Foundation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-de647976","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dsr","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Desire."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-dffda88d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vinu"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Vita Inu."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e12c7ed1","guard":[["has","gac"]],"pyramid":["render.template",{"lit":["The ticker GAC is Green Art ",{"slot":0},"."]},["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e6b84119","guard":[["hasAny",["lower case","lowercase","small letters","wand"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is WandX."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e87bbe02","guard":[["has","arpa"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-ebc3f00a","guard":[["hasAny",["ciphc","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cipher Core Token."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ebf1229d","guard":[["hasAny",["lower case","lowercase","small letters","xsd"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is SounDAC."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-efbfe318","guard":[["has","smpl"],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-f2621eea","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cwv","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CryptoWave."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f6ea8883","guard":[["hasAny",["capitalise","capitalize","capitalize each word","diyar","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Diyarbekirspor Token."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f704b29d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","wand"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is WandX."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f77d47d4","guard":[["hasAny",["lower case","lowercase","small letters","vinu"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Vita Inu."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f852412d","guard":[["hasAny",["arpa","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ARPA is ",{"slot":0}," Chain."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f9f173c4","guard":[["hasAny",["dibble","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dibbles."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-fb6cc9b2","guard":[["hasAny",["no vowels","remove vowels","without vowels","xdn"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DigitalNote."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-fe08ff5b","guard":[["hasAny",["aims","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HighCastle Token."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-fe2924a7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ksc","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is KStarCoin."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fe4a64a6","guard":[["hasAny",["mns","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Monnos."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-00d256bb","guard":[["hasAny",["item number","nth","oklp","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OkLetsPlay."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0160695a","guard":[["hasAny",["fanx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," FANX is FrontFanz."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-03372811","guard":[["hasAny",["arms","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ARMS is 2Acoin."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0395e3f7","guard":[["hasAny",["icsa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ICSA is Icosa."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-04842d4a","guard":[["hasAny",["each word","fat","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fatcoin."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-04c65c77","guard":[["hasAny",["ggs","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilgam."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-055f4e90","guard":[["hasAny",["each word","rbt","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Rabet."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-059f3bc0","guard":[["hasAny",["fat","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fatcoin."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-06bb676e","guard":[["hasAny",["lower case","lowercase","roost","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Coin."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-073a1953","guard":[["hasAny",["each word","split into words","wand"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is WandX."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-07633e5f","guard":[["hasAny",["bitcm","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcomo."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-08dcc570","guard":[["hasAny",["cava","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cavapoo."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0ad7e9b4","guard":[["hasAny",["shortest","shortest one","shortest word","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Telo Meme ",{"slot":1},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0b17e8ed","guard":[["hasAny",["each word","mcd","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CDbio."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0b3dd2d2","guard":[["hasAny",["item number","jmt","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," JMT is JMTIME."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0c69c023","guard":[["hasAny",["diyar","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Diyarbekirspor Token."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0cd93080","guard":[["hasAny",["ksc","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is KStarCoin."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-0e7b4d86","guard":[["hasAny",["bday","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Birthday Cake."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0e840a74","guard":[["hasAny",["normalise","normalize","ogsp","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OriginSport."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-0e906bb4","guard":[["hasAny",["dxr","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DEXTER."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-101aa79a","guard":[["hasAny",["normalise","normalize","simplify the text","xsd"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is SounDAC."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-117f3051","guard":[["hasAny",["normalise","normalize","simplify the text","tak"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TakCoin."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-12e2f6a0","guard":[["hasAny",["normalise","normalize","simplify the text","wand"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is WandX."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-140dca68","guard":[["hasAny",["bighan","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is BighanCoin."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-14231f64","guard":[["hasAny",["each word","split into words","tak"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TakCoin."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-14e9da1c","guard":[["hasAny",["dxr","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DEXTER."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-15a8572a","guard":[["hasAny",["each word","ogsp","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OriginSport."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-16544768","guard":[["hasAny",["disk","each word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dark Lisk."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-16dc1fb7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","smpl","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-172c2f0c","guard":[["has","gac"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-1731e87d","guard":[["hasAny",["item number","nth","position","yop"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," YOP is Yield Optimization Platform & Protocol."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-17ead54c","guard":[["hasAny",["normalise","normalize","oklp","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OkLetsPlay."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-18a1033a","guard":[["hasAny",["mdr","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-18cd3f42","guard":[["hasAny",["item number","nth","position","tbank"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TBANK is TaoBank."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-193a7fed","guard":[["hasAny",["ciphc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cipher Core Token."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-195fa0de","guard":[["hasAny",["bez","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bezop."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1a615463","guard":[["hasAny",["item number","nth","our","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," OUR is Our Pay."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1bd846cf","guard":[["hasAny",["normalise","normalize","simplify the text","strp"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Strips Finance."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-1cfd4760","guard":[["hasAny",["each word","field","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fieldcoin."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1d727c53","guard":[["hasAny",["don","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Donnie Finance."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1e25b792","guard":[["hasAny",["chief","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CHIEF is TheChiefCoin."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1f94dcc7","guard":[["hasAny",["gomd","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is GOMDori."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-203e38ae","guard":[["hasAny",["item number","nth","position","tak"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TakCoin."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-218eea5e","guard":[["hasAny",["lower case","lowercase","small letters","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme Coin."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-24690349","guard":[["hasAny",["each word","oklp","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OkLetsPlay."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-26588fe9","guard":[["hasAny",["item number","nth","ogsp","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OriginSport."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-27c817b6","guard":[["hasAny",["each word","split into words","strp"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Strips Finance."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-29c21a15","guard":[["hasAny",["item number","nth","position","wand"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is WandX."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2ac1c8a0","guard":[["hasAny",["aims","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HighCastle Token."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2b6a1493","guard":[["hasAny",["fakeai","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DeepFakeAI."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2eb87fdc","guard":[["hasAny",["ciphc","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cipher Core Token."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2f22751a","guard":[["hasAny",["ggs","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilgam."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2f49b813","guard":[["hasAny",["each word","rinu","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Raichu Inu."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-312f796f","guard":[["hasAny",["cava","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cavapoo."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-31e2cda1","guard":[["hasAny",["item number","nth","position","strp"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Strips Finance."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-32b5dcc7","guard":[["hasAny",["each word","fakeai","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DeepFakeAI."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-32d2c787","guard":[["hasAny",["each word","ksc","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is KStarCoin."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-33baffd8","guard":[["hasAny",["each word","gsx","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gold Secured Currency."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-33cf6d76","guard":[["hasAny",["disk","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dark Lisk."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-341d3710","guard":[["hasAny",["bighan","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is BighanCoin."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-381aa007","guard":[["hasAny",["item number","ksc","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is KStarCoin."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-38224902","guard":[["hasAny",["item number","nth","position","rinu"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Raichu Inu."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-38473613","guard":[["hasAny",["item number","krl","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KRL is Kryll."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3899c1b8","guard":[["hasAny",["dsr","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Desire."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-38cc7cec","guard":[["hasAny",["datp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Asset Trading Platform."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-394ae7f6","guard":[["hasAny",["item number","nth","position","vinu"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Vita Inu."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3a3217c0","guard":[["hasAny",["cava","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cavapoo."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-3aca4bb5","guard":[["hasAny",["each word","gomd","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is GOMDori."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3b278dd3","guard":[["hasAny",["datp","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Asset Trading Platform."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-3b883bb3","guard":[["hasAny",["each word","rinu","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Raichu Inu."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3c13fc96","guard":[["hasAny",["each word","nws","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nodewaves."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3dbd30fa","guard":[["hasAny",["each word","split into words","tic"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TrueInvestmentCoin."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3e3ffc38","guard":[["hasAny",["item number","nth","our","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," OUR is Our Pay."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3e4589c7","guard":[["hasAny",["field","normalise","normalize","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fieldcoin."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-4017a028","guard":[["hasAny",["dcip","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Community Investment Protocol."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-40489052","guard":[["hasAny",["each word","mns","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Monnos."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4060f788","guard":[["hasAny",["each word","ggs","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilgam."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-410f3737","guard":[["hasAny",["normalise","normalize","simplify the text","tic"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TrueInvestmentCoin."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-42290efe","guard":[["hasAny",["item number","nth","position","taur"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TAUR is Marnotaur."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-44666f78","guard":[["hasAny",["each word","hghg","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HUGHUG Coin."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-462830a0","guard":[["hasAny",["item number","nth","position","xvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," XVC is Vcash."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4750f130","guard":[["hasAny",["item number","ksc","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is KStarCoin."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-48c220bb","guard":[["hasAny",["ggs","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilgam."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-48eb78dd","guard":[["hasAny",["item number","kayi","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kayı."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-49047048","guard":[["hasAny",["each word","ksm","split into words"]],["has","coin"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kusama."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4cc2f9a5","guard":[["hasAny",["cwv","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CryptoWave."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-4d906202","guard":[["hasAny",["dam","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datamine."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4e0c4f62","guard":[["hasAny",["kayi","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kayı."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-4ec015ca","guard":[["hasAny",["capitalise","capitalize","capitalize each word","coq","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4f62e995","guard":[["hasAny",["each word","split into words","xdn"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DigitalNote."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4f79dad0","guard":[["hasAny",["dam","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datamine."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-50511158","guard":[["hasAny",["diyar","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Diyarbekirspor Token."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-513f7d47","guard":[["hasAny",["item number","nth","oklp","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OkLetsPlay."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-51bc58c2","guard":[["hasAny",["dxr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DEXTER."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-52b6e15c","guard":[["hasAny",["btch","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcoin Hush."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-54a22056","guard":[["hasAny",["cwv","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CryptoWave."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-554a1ddb","guard":[["hasAny",["each word","split into words","xdn"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DigitalNote."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-560e8cbf","guard":[["hasAny",["each word","split into words","wand"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is WandX."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-56193c38","guard":[["hasAny",["dibble","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dibbles."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5662da06","guard":[["hasAny",["bez","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bezop."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-57fd62b5","guard":[["hasAny",["normalise","normalize","simplify the text","xdn"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DigitalNote."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5816777b","guard":[["hasAny",["mcd","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CDbio."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-58a23cce","guard":[["hasAny",["bday","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Birthday Cake."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-599560d9","guard":[["hasAny",["each word","fat","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fatcoin."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5b172f3f","guard":[["hasAny",["cnct","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CNCT is CONNECT."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5c3277d8","guard":[["hasAny",["datp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Asset Trading Platform."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5d3bd9b5","guard":[["hasAny",["mdr","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["sense.lastWord"],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-61bf4817","guard":[["hasAny",["dibble","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dibbles."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-62091a0f","guard":[["hasAny",["item number","nth","position","tic"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TrueInvestmentCoin."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-62da66be","guard":[["hasAny",["item number","ksm","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kusama."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-63934b32","guard":[["hasAny",["field","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fieldcoin."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-644604a0","guard":[["hasAny",["fat","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fatcoin."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6574f375","guard":[["hasAny",["bitcm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcomo."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6591b94e","guard":[["hasAny",["bday","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Birthday Cake."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-66933bbe","guard":[["hasAny",["diyar","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Diyarbekirspor Token."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-67806597","guard":[["hasAny",["don","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Donnie Finance."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6829c8d3","guard":[["hasAny",["fat","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fatcoin."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-68fe1029","guard":[["hasAny",["item number","nth","pefi","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Penguin Finance."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-69e61748","guard":[["hasAny",["dam","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datamine."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6b2d0e4c","guard":[["hasAny",["hghg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HUGHUG Coin."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6b7089e1","guard":[["hasAny",["dsr","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Desire."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6ba84b9f","guard":[["hasAny",["item number","nth","position","rbt"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Rabet."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6c76fcf3","guard":[["hasAny",["cvp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CVP is PowerPool Concentrated Voting Power."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6e539877","guard":[["hasAny",["fuku","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Furukuru."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6f92fee1","guard":[["hasAny",["each word","fuku","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Furukuru."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-70b4955c","guard":[["hasAny",["bitcm","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcomo."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-70c2af79","guard":[["hasAny",["item number","nth","position","vinu"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Vita Inu."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7260e653","guard":[["hasAny",["item number","nth","position","voy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VOY is enVoy DeFi."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-747d77e3","guard":[["hasAny",["drf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," DRF is Drife."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-75e40e53","guard":[["hasAny",["btch","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcoin Hush."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-77c5505e","guard":[["hasAny",["modx","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is MODEL-X-coin."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-7808d87c","guard":[["hasAny",["gomd","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is GOMDori."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-79f97722","guard":[["hasAny",["each word","pefi","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Penguin Finance."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7c2cc414","guard":[["hasAny",["dcip","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Community Investment Protocol."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7c3100fe","guard":[["hasAny",["cava","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cavapoo."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7c80306f","guard":[["hasAny",["item number","nth","nws","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nodewaves."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7dc720be","guard":[["hasAny",["item number","nth","position","xdn"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DigitalNote."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7e0e9574","guard":[["hasAny",["dibble","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dibbles."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7e4f1039","guard":[["hasAny",["astra","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Protocol."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7ec54ca4","guard":[["hasAny",["each word","ksc","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is KStarCoin."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7f279803","guard":[["hasAny",["afp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Animal Farm Pigs."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-81686d98","guard":[["hasAny",["each word","field","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Fieldcoin."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8557fe36","guard":[["hasAny",["ksm","normalise","normalize","simplify the text"]],["has","coin"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kusama."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-85c8ecbd","guard":[["hasAny",["normalise","normalize","nws","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nodewaves."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-85f6560c","guard":[["hasAny",["bez","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bezop."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-86313cff","guard":[["hasAny",["item number","nth","position","tak"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TakCoin."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-870ecdab","guard":[["hasAny",["fuku","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Furukuru."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-889b871d","guard":[["hasAny",["each word","fuku","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Furukuru."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8948199c","guard":[["hasAny",["each word","split into words","tic"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TrueInvestmentCoin."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8a7e3226","guard":[["hasAny",["item number","nth","pefi","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Penguin Finance."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8c33d06c","guard":[["hasAny",["lower case","lowercase","small letters","smpl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8e6989cd","guard":[["hasAny",["dcip","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Community Investment Protocol."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8f812252","guard":[["hasAny",["no vowels","remove vowels","smpl","without vowels"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["sense.lastWord"],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-923ec2c2","guard":[["hasAny",["arpa","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-927277da","guard":[["hasAny",["dam","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Datamine."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9429caf1","guard":[["hasAny",["each word","nws","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Nodewaves."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-96d676e2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mdr","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9704fdd2","guard":[["hasAny",["btch","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcoin Hush."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-97e3b1e7","guard":[["hasAny",["normalise","normalize","rbt","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Rabet."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-98028a79","guard":[["hasAny",["bez","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bezop."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-986fc60c","guard":[["hasAny",["normalise","normalize","rinu","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Raichu Inu."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-98808d69","guard":[["hasAny",["each word","split into words","vinu"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Vita Inu."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-99704f3b","guard":[["hasAny",["item number","mns","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Monnos."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9a397872","guard":[["hasAny",["aims","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HighCastle Token."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9a61be9e","guard":[["hasAny",["each word","split into words","xsd"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is SounDAC."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9a7b1327","guard":[["hasAny",["dibble","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dibbles."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9c2bb2de","guard":[["hasAny",["normalise","normalize","simplify the text","vinu"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Vita Inu."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-9d46f542","guard":[["hasAny",["each word","gsx","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gold Secured Currency."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a10ea229","guard":[["hasAny",["cwv","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CryptoWave."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a30fff66","guard":[["hasAny",["each word","split into words","vinu"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Vita Inu."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a3503cce","guard":[["hasAny",["bighan","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is BighanCoin."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a4bb9e29","guard":[["hasAny",["alphabetize the letters","coq","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["sense.lastWord"],["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-a4d54c36","guard":[["hasAny",["afp","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Animal Farm Pigs."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a60545d5","guard":[["hasAny",["each word","modx","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is MODEL-X-coin."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a83c3080","guard":[["hasAny",["mns","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Monnos."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-a9e4702a","guard":[["hasAny",["item number","nth","position","xsd"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is SounDAC."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a9fac396","guard":[["hasAny",["afp","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Animal Farm Pigs."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aa71e0c5","guard":[["hasAny",["cpo","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cryptopolis."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aad81060","guard":[["hasAny",["arpa","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ab1a4875","guard":[["hasAny",["bighan","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is BighanCoin."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ac98985c","guard":[["hasAny",["disk","each word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dark Lisk."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-adc0c6f5","guard":[["hasAny",["aims","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HighCastle Token."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-adc2ba91","guard":[["hasAny",["datp","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Asset Trading Platform."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-af110c22","guard":[["hasAny",["each word","hghg","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HUGHUG Coin."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b2592b3d","guard":[["hasAny",["don","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Donnie Finance."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b5781a4e","guard":[["hasAny",["don","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Donnie Finance."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-b65fd084","guard":[["hasAny",["cxcell","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CXCELL is CAPITAL X CELL."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b6e66c11","guard":[["hasAny",["afp","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Animal Farm Pigs."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-b736cf28","guard":[["hasAny",["bez","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bezop."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-b8439b8f","guard":[["hasAny",["bday","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Birthday Cake."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ba0535c1","guard":[["hasAny",["each word","mcd","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CDbio."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ba4ec095","guard":[["hasAny",["css","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CSS is CoinSwap Token."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-baa19bca","guard":[["hasAny",["diyar","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Diyarbekirspor Token."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bb6984c6","guard":[["hasAny",["dxr","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DEXTER."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bdde26af","guard":[["hasAny",["each word","mns","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Monnos."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bf01189b","guard":[["hasAny",["item number","nth","position","totm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TOTM is Totem."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c149254a","guard":[["hasAny",["btch","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcoin Hush."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c196796b","guard":[["hasAny",["coq","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c2864b90","guard":[["hasAny",["cpo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cryptopolis."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c427e1fe","guard":[["hasAny",["crd","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c4332f03","guard":[["hasAny",["bitcm","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcomo."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c5862123","guard":[["hasAny",["iop","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IOP is Internet of People."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c6e80e7f","guard":[["hasAny",["dxr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DEXTER."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c77e22ab","guard":[["hasAny",["item number","nth","position","toko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TOKO is ToKoin."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c7b19d4c","guard":[["hasAny",["each word","fakeai","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DeepFakeAI."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c8aa0ac1","guard":[["hasAny",["astra","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Protocol."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c8daa5bf","guard":[["hasAny",["each word","split into words","tak"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is TakCoin."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cb53ace2","guard":[["hasAny",["don","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Donnie Finance."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cd252264","guard":[["hasAny",["each word","ksm","split into words"]],["has","coin"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kusama."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cdb00df0","guard":[["hasAny",["each word","split into words","strp"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Strips Finance."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cdcea445","guard":[["hasAny",["dcip","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Community Investment Protocol."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ce07dd4c","guard":[["hasAny",["each word","pefi","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Penguin Finance."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ce7822f3","guard":[["hasAny",["each word","kayi","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kayı."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cf4184bb","guard":[["hasAny",["roost","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Roost ",{"slot":1},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d0c871ca","guard":[["hasAny",["fakeai","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is DeepFakeAI."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d7e552e0","guard":[["hasAny",["each word","kayi","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kayı."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d97efa8c","guard":[["hasAny",["item number","mcd","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CDbio."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-da514540","guard":[["hasAny",["item number","nth","ogsp","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OriginSport."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-da711dc9","guard":[["hasAny",["item number","nth","position","xsd"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is SounDAC."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dc4cc53c","guard":[["hasAny",["each word","ggs","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gilgam."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dc66984b","guard":[["hasAny",["cpo","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cryptopolis."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e0cdc679","guard":[["hasAny",["cava","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cavapoo."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e13e292c","guard":[["hasAny",["each word","rbt","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Rabet."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e1645468","guard":[["hasAny",["gsx","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gold Secured Currency."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e165449b","guard":[["hasAny",["item number","nth","nua","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NUA is Neulaut Token."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e37bc64e","guard":[["hasAny",["ciphc","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cipher Core Token."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e5705755","guard":[["hasAny",["each word","gomd","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is GOMDori."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e6648709","guard":[["hasAny",["dsr","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Desire."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e6943e1e","guard":[["hasAny",["cwv","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is CryptoWave."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e9e8ea8b","guard":[["hasAny",["item number","modx","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is MODEL-X-coin."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ea7ade06","guard":[["hasAny",["each word","modx","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is MODEL-X-coin."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ea8e5820","guard":[["hasAny",["ciphc","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cipher Core Token."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-eabb0109","guard":[["hasAny",["each word","oklp","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OkLetsPlay."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ebd9f8c0","guard":[["hasAny",["item number","nift","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NIFT is Niftify."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ec7d3a8a","guard":[["hasAny",["good","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GOOD is Goodomy."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ecf5c581","guard":[["hasAny",["each word","split into words","xsd"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is SounDAC."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-edda1703","guard":[["hasAny",["dibble","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dibbles."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ef2bee7c","guard":[["hasAny",["lower case","lowercase","mdr","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ef5c1537","guard":[["hasAny",["datp","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Decentralized Asset Trading Platform."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f07c1d15","guard":[["hasAny",["cpo","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Cryptopolis."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f2879ff0","guard":[["hasAny",["aims","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HighCastle Token."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f2964822","guard":[["hasAny",["item number","kayi","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kayı."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f2ef6a89","guard":[["hasAny",["coq","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f39ef39e","guard":[["hasAny",["aipe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AIPE is AI Prediction Ecosystem."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f55d1268","guard":[["hasAny",["normalise","normalize","pefi","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Penguin Finance."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-f5b5b375","guard":[["hasAny",["diyar","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Diyarbekirspor Token."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f5d10223","guard":[["hasAny",["bitcm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcomo."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f76b390a","guard":[["hasAny",["hghg","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HUGHUG Coin."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-f7740aef","guard":[["hasAny",["aka","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AKA is Akroma."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f7aa68dd","guard":[["hasAny",["fuku","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Furukuru."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-f7d46ecf","guard":[["hasAny",["item number","nth","position","psps"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PSPS is BobaCat."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f7e2409d","guard":[["hasAny",["each word","ogsp","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is OriginSport."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f80ec193","guard":[["hasAny",["item number","ksm","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Kusama."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f95570a8","guard":[["hasAny",["bday","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Birthday Cake."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-fa235158","guard":[["hasAny",["aims","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is HighCastle Token."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-faf53bfa","guard":[["hasAny",["btch","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Bitcoin Hush."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fb405545","guard":[["hasAny",["disk","normalise","normalize","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Dark Lisk."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-fc8d723c","guard":[["hasAny",["gsx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Gold Secured Currency."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fcfb46f7","guard":[["hasAny",["extn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," EXTN is Extensive Coin."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-fe97aff6","guard":[["hasAny",["dsr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Desire."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-055974fb","guard":[["hasAny",["fanx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is FrontFanz."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-07c3cbc6","guard":[["hasAny",["fanx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is FrontFanz."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-088c80c8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gac","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0aa02a2a","guard":[["hasAny",["arms","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 2Acoin."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-0ac062a3","guard":[["hasAny",["drf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Drife."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-0d2e7745","guard":[["hasAny",["coq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0fc89dd9","guard":[["hasAny",["css","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CoinSwap Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-11005e18","guard":[["hasAny",["iop","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Internet of People."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-11d6bd39","guard":[["hasAny",["item number","nth","nua","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Neulaut Token."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-1ae9e7b1","guard":[["hasAny",["item number","nth","position","toko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ToKoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-27a9cfbe","guard":[["hasAny",["good","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Goodomy."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-28f475a3","guard":[["hasAny",["item number","nth","position","totm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Totem."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-2a9a5135","guard":[["hasAny",["astra","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Protocol."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2af17cf3","guard":[["hasAny",["coq","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2c93376e","guard":[["hasAny",["item number","nth","position","voy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is enVoy DeFi."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-2d084d69","guard":[["hasAny",["coq","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2d706f4a","guard":[["hasAny",["coq","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2d7cf3c7","guard":[["hasAny",["normalise","normalize","simplify the text","smpl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-30668a98","guard":[["hasAny",["astra","capitalise","capitalize","capitalize each word","lower case","lowercase","small letters","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Protocol."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-337e9157","guard":[["hasAny",["roost","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["sense.lastWord"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3622daf0","guard":[["hasAny",["item number","nth","nua","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Neulaut Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-39ae0e4f","guard":[["hasAny",["item number","nth","position","taur"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marnotaur."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-3ad24b48","guard":[["hasAny",["item number","krl","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kryll."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-4103e5a8","guard":[["hasAny",["item number","nth","position","voy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is enVoy DeFi."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-446bcb14","guard":[["hasAny",["gac","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4b790993","guard":[["hasAny",["each word","mdr","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4e6a6633","guard":[["hasAny",["iop","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Internet of People."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-59540a20","guard":[["hasAny",["cxcell","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CAPITAL X CELL."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-5e70aed4","guard":[["hasAny",["arms","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 2Acoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-61b4cde6","guard":[["hasAny",["item number","nth","position","tbank"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TaoBank."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-6543c3a0","guard":[["hasAny",["lower case","lowercase","small letters","smpl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-65be0c1e","guard":[["hasAny",["astra","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Protocol."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6891b073","guard":[["hasAny",["lower case","lowercase","mdr","no vowels","remove vowels","small letters","without vowels"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["transform.noVowels",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6a7614da","guard":[["hasAny",["extn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Extensive Coin."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-6b5260b3","guard":[["hasAny",["arpa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6bf5fbf8","guard":[["hasAny",["alphabetize the letters","coq","letters in order","lower case","lowercase","small letters","sort the letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["transform.sortLetters",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6d0848c0","guard":[["hasAny",["item number","nth","position","xvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Vcash."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-6dfa3bd9","guard":[["hasAny",["arpa","capitalise","capitalize","capitalize each word","lower case","lowercase","small letters","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-75674c43","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gac","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-787fd451","guard":[["hasAny",["icsa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Icosa."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-78d9911e","guard":[["hasAny",["aka","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Akroma."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-7b6ae740","guard":[["hasAny",["arpa","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-7c1b5fac","guard":[["hasAny",["item number","nth","position","toko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ToKoin."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-7c3cae31","guard":[["hasAny",["chief","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TheChiefCoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-7c92584e","guard":[["hasAny",["arpa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7fe0acbc","guard":[["hasAny",["crd","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-810c1d37","guard":[["hasAny",["extn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Extensive Coin."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-81fbe217","guard":[["hasAny",["each word","smpl","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-83f6c5c4","guard":[["hasAny",["item number","nth","position","tbank"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TaoBank."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-8416a612","guard":[["hasAny",["item number","nift","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Niftify."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-84e4b4e4","guard":[["hasAny",["lower case","lowercase","mdr","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-85e64974","guard":[["hasAny",["good","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Goodomy."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-8768a09c","guard":[["hasAny",["bodhi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bodhi Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-8ae4a1db","guard":[["hasAny",["gac","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-8d74465a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lower case","lowercase","mdr","small letters","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-902e9481","guard":[["hasAny",["lower case","lowercase","shortest","shortest one","shortest word","small letters","telo"]]],"pyramid":["render.template",{"lit":["The ticker TELO is ",{"slot":0}," Meme ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9301759a","guard":[["hasAny",["arpa","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-94feeeaf","guard":[["hasAny",["crd","lower case","lowercase","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9788dbae","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lower case","lowercase","small letters","smpl","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-987c1902","guard":[["hasAny",["capitalise","capitalize","capitalize each word","coq","lower case","lowercase","small letters","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9aadcab8","guard":[["hasAny",["item number","jmt","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is JMTIME."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-9dd14156","guard":[["hasAny",["item number","nth","position","psps"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BobaCat."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-9fde6666","guard":[["hasAny",["gac","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a1fdcaf1","guard":[["hasAny",["item number","nift","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Niftify."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-a2e5a723","guard":[["hasAny",["css","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CoinSwap Token."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-a668fd06","guard":[["hasAny",["coq","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-a7729fea","guard":[["hasAny",["astra","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Protocol."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-adbc3d33","guard":[["hasAny",["cxcell","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CAPITAL X CELL."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-aeff9958","guard":[["hasAny",["cnct","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CONNECT."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-afc15112","guard":[["hasAny",["shortest","shortest one","shortest word","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["sense.lastWord"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b3860dfa","guard":[["hasAny",["astra","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Protocol."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-b7173dd3","guard":[["hasAny",["cnct","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CONNECT."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-b7a5aeeb","guard":[["hasAny",["lower case","lowercase","mdr","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b8cc85f1","guard":[["hasAny",["item number","nth","position","smpl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b9472eab","guard":[["hasAny",["item number","krl","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kryll."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-bebb13ec","guard":[["hasAny",["aka","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Akroma."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-c2e21b9c","guard":[["hasAny",["icsa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Icosa."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-c529da1b","guard":[["hasAny",["arpa","each word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c5dd0e17","guard":[["hasAny",["aipe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is AI Prediction Ecosystem."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-c779385d","guard":[["hasAny",["item number","nth","position","totm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Totem."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-c8fb3ca3","guard":[["hasAny",["each word","mdr","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cab02147","guard":[["hasAny",["astra","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Protocol."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cb387564","guard":[["hasAny",["each word","smpl","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d69f148b","guard":[["hasAny",["item number","nth","position","yop"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Yield Optimization Platform & Protocol."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-d9b451ba","guard":[["hasAny",["arpa","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-dbbbebad","guard":[["hasAny",["item number","nth","position","yop"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Yield Optimization Platform & Protocol."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-dd5851a0","guard":[["hasAny",["lower case","lowercase","roost","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ROOST is ",{"slot":0}," ",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e318ded0","guard":[["hasAny",["cvp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PowerPool Concentrated Voting Power."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-e376e96c","guard":[["hasAny",["item number","mdr","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e532bf72","guard":[["hasAny",["drf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Drife."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-e58c2c2c","guard":[["hasAny",["gac","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e6ef0d03","guard":[["hasAny",["item number","nth","position","taur"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marnotaur."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-e84708e4","guard":[["hasAny",["lower case","lowercase","no vowels","remove vowels","small letters","smpl","without vowels"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["transform.noVowels",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e8936854","guard":[["hasAny",["item number","nth","position","xvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Vcash."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-e92df334","guard":[["hasAny",["item number","jmt","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is JMTIME."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-ee7df9ae","guard":[["hasAny",["mdr","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-eea340d0","guard":[["hasAny",["cvp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PowerPool Concentrated Voting Power."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-f3efb97d","guard":[["hasAny",["chief","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TheChiefCoin."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-f60ff42c","guard":[["hasAny",["crd","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fb014864","guard":[["hasAny",["item number","nth","position","psps"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BobaCat."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-fccd9cc4","guard":[["hasAny",["coq","lower case","lowercase","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-fcd55f4e","guard":[["hasAny",["aipe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is AI Prediction Ecosystem."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-003600b6","guard":[["hasAny",["arpa","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-007f75a3","guard":[["hasAny",["each word","lower case","lowercase","mdr","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-009a430b","guard":[["hasAny",["css","item number","no vowels","nth","position","remove vowels","without vowels"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CoinSwap Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-03d4fdd8","guard":[["hasAny",["each word","lower case","lowercase","mdr","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-06c3c596","guard":[["hasAny",["lower case","lowercase","mdr","normalise","normalize","simplify the text","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-08761286","guard":[["hasAny",["fanx","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is FrontFanz."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-08c6fe45","guard":[["hasAny",["arpa","lower case","lowercase","normalise","normalize","simplify the text","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-08cdec1d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","krl","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kryll."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0d1ac831","guard":[["hasAny",["coq","each word","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-13086db1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cnct","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CONNECT."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1460cde5","guard":[["hasAny",["lower case","lowercase","shortest","shortest one","shortest word","small letters","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1766a6e6","guard":[["hasAny",["each word","gac","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-1a897838","guard":[["hasAny",["item number","krl","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kryll."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1e016ac9","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","taur"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marnotaur."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-21d8e679","guard":[["hasAny",["arpa","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-240092ca","guard":[["hasAny",["lower case","lowercase","roost","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-255b12c0","guard":[["hasAny",["chief","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TheChiefCoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2566d34c","guard":[["hasAny",["cvp","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PowerPool Concentrated Voting Power."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-28c12769","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","xvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Vcash."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-29d635c4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","toko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ToKoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2bc6d0bc","guard":[["hasAny",["each word","lower case","lowercase","small letters","smpl","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2bf9b316","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","psps","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BobaCat."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-30271626","guard":[["hasAny",["cvp","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PowerPool Concentrated Voting Power."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-33573584","guard":[["hasAny",["gac","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-35519401","guard":[["hasAny",["cnct","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CONNECT."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-382df059","guard":[["hasAny",["css","item number","lower case","lowercase","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CoinSwap Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3ccd2af8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fanx","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is FrontFanz."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3cf5f073","guard":[["hasAny",["extn","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Extensive Coin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3ead6e7e","guard":[["hasAny",["first n","gac","take"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-402b99e5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","drf","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Drife."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4084dbff","guard":[["hasAny",["coq","lower case","lowercase","normalise","normalize","simplify the text","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-46bbc8a8","guard":[["hasAny",["arms","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 2Acoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4b23e6d9","guard":[["hasAny",["aipe","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is AI Prediction Ecosystem."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4d5e774e","guard":[["hasAny",["item number","krl","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kryll."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-54c1758a","guard":[["hasAny",["aka","item number","lower case","lowercase","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Akroma."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5a6bf8b5","guard":[["hasAny",["item number","no vowels","nth","position","psps","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BobaCat."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-5ce104ac","guard":[["hasAny",["each word","gac","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-65f82d3d","guard":[["hasAny",["good","item number","lower case","lowercase","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Goodomy."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6699d9a9","guard":[["hasAny",["drf","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Drife."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-674fe83e","guard":[["hasAny",["astra","each word","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Protocol."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6a8817dd","guard":[["hasAny",["icsa","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Icosa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6a917fe9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","xvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Vcash."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-71d0a537","guard":[["hasAny",["capitalise","capitalize","capitalize each word","shortest","shortest one","shortest word","telo","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["transform.title",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-74eaf327","guard":[["hasAny",["alphabetize the letters","css","item number","letters in order","nth","position","sort the letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CoinSwap Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-75cb4f7f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nift","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Niftify."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-765ce39d","guard":[["hasAny",["item number","jmt","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is JMTIME."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-7bd48711","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","nua","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Neulaut Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7d6b214c","guard":[["hasAny",["item number","lower case","lowercase","mdr","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Mudra ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7d84b49c","guard":[["hasAny",["cxcell","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CAPITAL X CELL."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7f428ad6","guard":[["hasAny",["crd","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7fae1fa2","guard":[["hasAny",["item number","jmt","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is JMTIME."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-803018a0","guard":[["hasAny",["item number","lower case","lowercase","nth","nua","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Neulaut Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8032b288","guard":[["hasAny",["aipe","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is AI Prediction Ecosystem."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-80f9b85f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","yop"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Yield Optimization Platform & Protocol."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8144daed","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","totm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Totem."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9124969e","guard":[["hasAny",["lower case","lowercase","roost","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9399c646","guard":[["hasAny",["each word","gac","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-952eee5a","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","voy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is enVoy DeFi."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9a0526a1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cvp","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PowerPool Concentrated Voting Power."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9ab6e595","guard":[["hasAny",["lower case","lowercase","small letters","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9b3f9cd8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cxcell","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CAPITAL X CELL."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9ccfd98d","guard":[["hasAny",["aka","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Akroma."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a162f108","guard":[["hasAny",["each word","lower case","lowercase","small letters","smpl","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a297042e","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","without vowels","xvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Vcash."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-a902c1fa","guard":[["hasAny",["drf","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Drife."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-abb5fa46","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","tbank","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TaoBank."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-abc6eff2","guard":[["hasAny",["crd","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Network."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b02076d7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","extn","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Extensive Coin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b6d2f8a5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","good","item number","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Goodomy."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b709da8b","guard":[["hasAny",["astra","lower case","lowercase","normalise","normalize","simplify the text","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Protocol."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b8ac3175","guard":[["hasAny",["astra","each word","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Protocol."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b8fb4870","guard":[["hasAny",["alphabetize the letters","item number","jmt","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is JMTIME."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-ba79e725","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","smpl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-bc7e1c22","guard":[["hasAny",["astra","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Protocol."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-caac3983","guard":[["hasAny",["arpa","each word","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cca01bda","guard":[["hasAny",["gac","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-cfd97571","guard":[["hasAny",["bodhi","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BODHI is ",{"slot":1}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d1dc7426","guard":[["hasAny",["iop","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Internet of People."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d3c28b35","guard":[["hasAny",["alphabetize the letters","iop","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Internet of People."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-d89b7e40","guard":[["hasAny",["each word","gac","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d912afe7","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","tbank"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TaoBank."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d9a253be","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","totm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Totem."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-dbc83bf3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","taur","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marnotaur."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-dd4cb2aa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","chief","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TheChiefCoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-deea322b","guard":[["hasAny",["bodhi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-e2b59992","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","jmt","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is JMTIME."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e3a58297","guard":[["hasAny",["capitalise","capitalize","capitalize each word","roost","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.title",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e6c7638f","guard":[["hasAny",["arms","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 2Acoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e80f07f9","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","toko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ToKoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-eb701d0c","guard":[["hasAny",["arpa","each word","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Chain."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ec3de19d","guard":[["hasAny",["item number","lower case","lowercase","nth","position","psps","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BobaCat."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ed6f7b7f","guard":[["hasAny",["coq","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-edf3a10a","guard":[["hasAny",["lower case","lowercase","normalise","normalize","simplify the text","small letters","smpl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Foundation."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-eec22390","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","voy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is enVoy DeFi."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-eef06883","guard":[["hasAny",["gac","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-effde9b0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","css","item number","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CoinSwap Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f320ba1e","guard":[["hasAny",["item number","lower case","lowercase","nift","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Niftify."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f52ab46e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","icsa","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Icosa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f54227a2","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","yop"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Yield Optimization Platform & Protocol."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f87ad4aa","guard":[["hasAny",["first n","gac","take"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is Green Art ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-f911a77f","guard":[["hasAny",["cnct","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CONNECT."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-f9338231","guard":[["hasAny",["capitalise","capitalize","capitalize each word","iop","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Internet of People."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f9a69cc7","guard":[["hasAny",["coq","each word","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Inu."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-00d21fc5","guard":[["hasAny",["item number","nift","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Niftify."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-010ae12f","guard":[["hasAny",["aka","each word","item number","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Akroma."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-03137d5c","guard":[["hasAny",["each word","item number","nth","position","split into words","yop"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Yield Optimization Platform & Protocol."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-04ff5fa2","guard":[["hasAny",["arms","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 2Acoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0901aba0","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0ab47997","guard":[["hasAny",["each word","item number","krl","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kryll."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-14145492","guard":[["hasAny",["item number","nth","nua","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Neulaut Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-165adcd5","guard":[["hasAny",["each word","item number","nth","position","split into words","totm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Totem."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1802a9a7","guard":[["hasAny",["item number","nth","position","tbank"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TaoBank."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1a5e5b3a","guard":[["hasAny",["item number","jmt","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is JMTIME."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1abe7ca2","guard":[["hasAny",["each word","item number","nth","nua","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Neulaut Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1b08b4dd","guard":[["hasAny",["item number","jmt","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is JMTIME."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-1b9ff339","guard":[["hasAny",["aipe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is AI Prediction Ecosystem."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1eef341f","guard":[["hasAny",["each word","item number","nth","nua","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Neulaut Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2083df34","guard":[["hasAny",["fanx","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is FrontFanz."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2193de18","guard":[["hasAny",["each word","item number","nth","position","split into words","xvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Vcash."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2bafd9be","guard":[["hasAny",["item number","krl","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kryll."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2bb2eaa8","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2c5a55fa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lower case","lowercase","roost","shortest","shortest one","shortest word","small letters","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-30f8e8fc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lower case","lowercase","shortest","shortest one","shortest word","small letters","telo","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-35f8bb8e","guard":[["hasAny",["aka","each word","item number","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Akroma."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-39d42eca","guard":[["hasAny",["item number","nth","position","voy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is enVoy DeFi."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-39e9cefd","guard":[["hasAny",["css","each word","item number","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CoinSwap Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3a75610d","guard":[["hasAny",["cvp","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PowerPool Concentrated Voting Power."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3ea4d173","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","totm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Totem."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-3f1c81e8","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","taur"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marnotaur."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-3fc8f505","guard":[["hasAny",["drf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Drife."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4064cd20","guard":[["hasAny",["cxcell","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CAPITAL X CELL."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-43c92a93","guard":[["hasAny",["each word","item number","nth","position","split into words","tbank"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TaoBank."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-469c273c","guard":[["hasAny",["each word","extn","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Extensive Coin."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-46f75211","guard":[["hasAny",["each word","item number","jmt","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is JMTIME."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4bfb81fd","guard":[["hasAny",["extn","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Extensive Coin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-4e367ad9","guard":[["hasAny",["aipe","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is AI Prediction Ecosystem."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5016c879","guard":[["hasAny",["cxcell","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CAPITAL X CELL."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-51cd9a80","guard":[["hasAny",["cnct","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CONNECT."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-529615ee","guard":[["hasAny",["lower case","lowercase","shortest","shortest one","shortest word","small letters","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5314d429","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","toko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ToKoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5401fd98","guard":[["hasAny",["cnct","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CONNECT."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5682365b","guard":[["hasAny",["each word","item number","krl","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kryll."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-571d4a0a","guard":[["hasAny",["item number","krl","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kryll."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-572c52cd","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","yop"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Yield Optimization Platform & Protocol."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5785da8e","guard":[["hasAny",["item number","nth","position","taur"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marnotaur."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5883c973","guard":[["hasAny",["lower case","lowercase","roost","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5946f9b8","guard":[["hasAny",["cnct","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CONNECT."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5a3d9c14","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-5b2fc5cc","guard":[["hasAny",["each word","good","item number","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Goodomy."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5d6d37e0","guard":[["hasAny",["cxcell","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CAPITAL X CELL."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-5f7332e7","guard":[["hasAny",["arms","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 2Acoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-6704d515","guard":[["hasAny",["invert case","lower case","lowercase","roost","small letters","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-677388ac","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","tbank"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TaoBank."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-68e1273c","guard":[["hasAny",["item number","nth","position","psps"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BobaCat."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-68f2cc2e","guard":[["hasAny",["good","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Goodomy."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-692dbf3d","guard":[["hasAny",["each word","icsa","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Icosa."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-69def832","guard":[["hasAny",["icsa","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Icosa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-6ad8e1b2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lower case","lowercase","small letters","telo","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-6cf03cfc","guard":[["hasAny",["css","item number","normalise","normalize","nth","position","simplify the text"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CoinSwap Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-6d93620a","guard":[["hasAny",["chief","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TheChiefCoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-758139a2","guard":[["hasAny",["each word","item number","nth","position","split into words","yop"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Yield Optimization Platform & Protocol."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-761bcac2","guard":[["hasAny",["each word","shortest","shortest one","shortest word","split into words","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-76c33d2d","guard":[["hasAny",["drf","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Drife."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-77d5a3fa","guard":[["hasAny",["chief","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TheChiefCoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7ebf2a58","guard":[["hasAny",["each word","item number","nift","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Niftify."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-852bc828","guard":[["hasAny",["item number","nth","position","roost","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-85f48947","guard":[["hasAny",["normalise","normalize","roost","shortest","shortest one","shortest word","simplify the text"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-865baa9d","guard":[["hasAny",["bodhi","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-86a97365","guard":[["hasAny",["bodhi","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8a52dd70","guard":[["hasAny",["each word","roost","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8aa90377","guard":[["hasAny",["item number","nth","position","xvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Vcash."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8b84c1a0","guard":[["hasAny",["each word","icsa","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Icosa."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8c293d83","guard":[["hasAny",["iop","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Internet of People."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8d2b6e22","guard":[["hasAny",["aipe","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is AI Prediction Ecosystem."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8d83e3d1","guard":[["hasAny",["each word","item number","nth","position","split into words","voy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is enVoy DeFi."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9029de6f","guard":[["hasAny",["chief","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TheChiefCoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-9684a7af","guard":[["hasAny",["drf","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Drife."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-99ae6b3d","guard":[["hasAny",["good","item number","normalise","normalize","nth","position","simplify the text"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Goodomy."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-9a0e0865","guard":[["hasAny",["each word","iop","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Internet of People."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9b47c5bc","guard":[["hasAny",["cnct","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CONNECT."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9c5c32f6","guard":[["hasAny",["item number","nth","position","totm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Totem."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9dbbc27d","guard":[["hasAny",["aka","item number","normalise","normalize","nth","position","simplify the text"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Akroma."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-9fea830d","guard":[["hasAny",["item number","nth","position","yop"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Yield Optimization Platform & Protocol."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a028354d","guard":[["hasAny",["each word","item number","nth","position","split into words","toko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ToKoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a0e7bd1d","guard":[["hasAny",["iop","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Internet of People."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-a13a3473","guard":[["hasAny",["icsa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Icosa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a32603b9","guard":[["hasAny",["each word","item number","nth","position","split into words","toko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ToKoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a3609209","guard":[["hasAny",["invert case","lower case","lowercase","small letters","swap case","telo","toggle case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a3aa2cf1","guard":[["hasAny",["each word","item number","nth","position","split into words","tbank"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TaoBank."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a49eaf09","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lower case","lowercase","roost","small letters","title case"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a4eb973f","guard":[["hasAny",["each word","good","item number","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Goodomy."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a5ba340f","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a7d7a9a6","guard":[["hasAny",["each word","item number","nift","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Niftify."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-aaae67d5","guard":[["hasAny",["fanx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is FrontFanz."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ac4a87c0","guard":[["hasAny",["item number","normalise","normalize","nth","position","psps","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BobaCat."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-b323c81e","guard":[["hasAny",["chief","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TheChiefCoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b98bd1e8","guard":[["hasAny",["each word","item number","nth","position","split into words","xvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Vcash."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b99db157","guard":[["hasAny",["extn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Extensive Coin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ba069668","guard":[["hasAny",["each word","fanx","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is FrontFanz."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ba774c7e","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","voy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is enVoy DeFi."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-ba7f91c8","guard":[["hasAny",["item number","nift","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Niftify."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-bfaf4893","guard":[["hasAny",["each word","item number","nth","position","split into words","taur"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marnotaur."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c392b53a","guard":[["hasAny",["bodhi","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Network."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c930b4b8","guard":[["hasAny",["item number","lower case","lowercase","nth","position","roost","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-c9f21ade","guard":[["hasAny",["item number","normalise","normalize","nth","nua","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Neulaut Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-cb84f1fe","guard":[["hasAny",["each word","fanx","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is FrontFanz."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ce29e32a","guard":[["hasAny",["each word","item number","jmt","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is JMTIME."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ced2f598","guard":[["hasAny",["cvp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PowerPool Concentrated Voting Power."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cfbc184b","guard":[["hasAny",["arms","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 2Acoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d135b64c","guard":[["hasAny",["css","each word","item number","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CoinSwap Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d1b16f63","guard":[["hasAny",["cvp","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PowerPool Concentrated Voting Power."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d36f9fc1","guard":[["hasAny",["each word","iop","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Internet of People."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d533480b","guard":[["hasAny",["drf","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Drife."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d83c850f","guard":[["hasAny",["cvp","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is PowerPool Concentrated Voting Power."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d8cd26ab","guard":[["hasAny",["arms","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 2Acoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dd255914","guard":[["hasAny",["aka","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Akroma."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-de1f305b","guard":[["hasAny",["each word","roost","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dec9a95b","guard":[["hasAny",["each word","item number","nth","position","split into words","totm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Totem."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-defca1ce","guard":[["hasAny",["normalise","normalize","shortest","shortest one","shortest word","simplify the text","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e1863423","guard":[["hasAny",["aipe","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is AI Prediction Ecosystem."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-e4337282","guard":[["hasAny",["item number","nth","position","toko"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ToKoin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e851bfee","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","xvc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Vcash."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-ea282154","guard":[["hasAny",["each word","item number","nth","position","split into words","taur"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Marnotaur."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ea7d3b05","guard":[["hasAny",["each word","extn","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Extensive Coin."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f1013c02","guard":[["hasAny",["cxcell","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CAPITAL X CELL."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f2d29113","guard":[["hasAny",["each word","item number","nth","position","split into words","voy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is enVoy DeFi."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f420cc48","guard":[["hasAny",["css","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CoinSwap Token."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f55be757","guard":[["hasAny",["each word","item number","nth","position","psps","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BobaCat."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f7c0b42f","guard":[["hasAny",["item number","nth","position","roost","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ff25da53","guard":[["hasAny",["each word","item number","nth","position","psps","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is BobaCat."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-19a50eca","guard":[["hasAny",["first n","lower case","lowercase","roost","small letters","take"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-2a02cf6e","guard":[["hasAny",["first n","lower case","lowercase","small letters","take","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-2a38aa5f","guard":[["hasAny",["item number","lower case","lowercase","nth","position","roost","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-318f9a16","guard":[["hasAny",["bodhi","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-45b97730","guard":[["hasAny",["each word","lower case","lowercase","small letters","split into words","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-4e0dea0c","guard":[["hasAny",["item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-62cc70e0","guard":[["hasAny",["first n","lower case","lowercase","roost","small letters","take"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-67d62810","guard":[["hasAny",["lower case","lowercase","normalise","normalize","shortest","shortest one","shortest word","simplify the text","small letters","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6c173497","guard":[["hasAny",["bodhi","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6c97b009","guard":[["hasAny",["bodhi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-71e9e168","guard":[["hasAny",["first n","lower case","lowercase","small letters","take","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-90b645b2","guard":[["hasAny",["lower case","lowercase","normalise","normalize","roost","shortest","shortest one","shortest word","simplify the text","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["transform.norm",["sense.lastWord"],{"lit":2}],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9177445c","guard":[["hasAny",["each word","lower case","lowercase","shortest","shortest one","shortest word","small letters","split into words","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a2f48429","guard":[["hasAny",["item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-aad11185","guard":[["hasAny",["each word","lower case","lowercase","roost","shortest","shortest one","shortest word","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ae18202d","guard":[["hasAny",["each word","lower case","lowercase","shortest","shortest one","shortest word","small letters","split into words","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b3ed1311","guard":[["hasAny",["item number","lower case","lowercase","nth","position","roost","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b4ad485c","guard":[["hasAny",["bodhi","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-be60edec","guard":[["hasAny",["each word","lower case","lowercase","roost","shortest","shortest one","shortest word","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c7002731","guard":[["hasAny",["bodhi","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d9b65393","guard":[["hasAny",["each word","lower case","lowercase","small letters","split into words","telo"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," Meme ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-dbfacc7d","guard":[["hasAny",["each word","lower case","lowercase","roost","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-e02995ee","guard":[["hasAny",["each word","lower case","lowercase","roost","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ticker ",{"slot":0}," is ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-f1fbd771","guard":[["hasAny",["bodhi","capitalise","capitalize","capitalize each word","item number","lower case","lowercase","nth","position","small letters","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2a45c627","guard":[["hasAny",["bodhi","item number","lower case","lowercase","normalise","normalize","nth","position","simplify the text","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3248efbb","guard":[["hasAny",["bodhi","each word","item number","lower case","lowercase","nth","position","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-62c615d1","guard":[["hasAny",["bodhi","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f6e209fb","guard":[["hasAny",["bodhi","each word","item number","lower case","lowercase","nth","position","small letters","split into words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," Network."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which cryptocurrency has the ticker CHIEF","expect":{"contains":["TheChiefCoin"],"notRefusal":true}},{"q":"which cryptocurrency has the ticker BODHI","expect":{"contains":["Bodhi Network"],"notRefusal":true}},{"q":"which cryptocurrency has the ticker TAUR","expect":{"contains":["Marnotaur"],"notRefusal":true}},{"q":"which cryptocurrency has the ticker CNCT","expect":{"contains":["CONNECT"],"notRefusal":true}},{"q":"what coin trades as PEFI","expect":{"contains":["Penguin Finance"],"notRefusal":true}},{"q":"which cryptocurrency has the ticker PSPS","expect":{"contains":["BobaCat"],"notRefusal":true}},{"q":"name the cryptocurrency with the symbol GSX","expect":{"contains":["Gold Secured Currency"],"notRefusal":true}},{"q":"name the cryptocurrency with the symbol DISK","expect":{"contains":["Dark Lisk"],"notRefusal":true}},{"q":"name the cryptocurrency with the symbol NWS","expect":{"contains":["Nodewaves"],"notRefusal":true}},{"q":"name the cryptocurrency with the symbol AFP","expect":{"contains":["Animal Farm Pigs"],"notRefusal":true}},{"q":"what coin trades as OGSP","expect":{"contains":["OriginSport"],"notRefusal":true}},{"q":"which cryptocurrency has the ticker ARMS","expect":{"contains":["2Acoin"],"notRefusal":true}},{"q":"what coin trades as KAYI","expect":{"contains":["Kayı"],"notRefusal":true}},{"q":"which cryptocurrency has the ticker YOP","expect":{"contains":["Yield Optimization Platform & Protocol"],"notRefusal":true}},{"q":"which cryptocurrency has the ticker JMT","expect":{"contains":["JMTIME"],"notRefusal":true}},{"q":"which cryptocurrency has the ticker KRL","expect":{"contains":["Kryll"],"notRefusal":true}},{"q":"name the cryptocurrency with the symbol MCD","expect":{"contains":["CDbio"],"notRefusal":true}},{"q":"what coin trades as VINU","expect":{"contains":["Vita Inu"],"notRefusal":true}},{"q":"what coin trades as CAVA","expect":{"contains":["Cavapoo"],"notRefusal":true}},{"q":"what coin trades as FAT","expect":{"contains":["Fatcoin"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
