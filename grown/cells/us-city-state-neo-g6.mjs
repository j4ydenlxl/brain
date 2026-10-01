// us-city-state-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"us-city-state-neo-g6","class":"us-city-state","generation":6,"lane":"neo","grownFrom":["name the state where Melbourne lies","in what state is the city Arden-Arcade","name the state where Castro Valley lies","which US state is Carmel in","which US state is Farmington Hills in","in what state is the city Antioch","name the state where Tyler lies","in what state is the city Hendersonville","which US state is Carson in","which US state is Denver in","in what state is the city St. Joseph","which US state is Milford in","which US state is Boynton Beach in","name the state where Dearborn lies","in what state is the city Oakland Park","which US state is Hammond in","name the state where Schaumburg lies","which US state is Lawton in","in what state is the city Springdale","in what state is the city Pensacola"],"version":1});

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
{"id":"n-e0818ba6","guard":[["has","state"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Melbourne lies":"Melbourne is in Florida.","in what state is the city Arden-Arcade":"Arden-Arcade is in California.","name the state where Castro Valley lies":"Castro Valley is in California.","which US state is Carmel in":"Carmel is in Indiana.","which US state is Farmington Hills in":"Farmington Hills is in Michigan.","in what state is the city Antioch":"Antioch is in California.","name the state where Tyler lies":"Tyler is in Texas.","in what state is the city Hendersonville":"Hendersonville is in Tennessee.","which US state is Carson in":"Carson is in California.","which US state is Denver in":"Denver is in Colorado.","in what state is the city St. Joseph":"St. Joseph is in Missouri.","which US state is Milford in":"Milford is in Connecticut.","which US state is Boynton Beach in":"Boynton Beach is in Florida.","name the state where Dearborn lies":"Dearborn is in Michigan.","in what state is the city Oakland Park":"Oakland Park is in Florida.","which US state is Hammond in":"Hammond is in Indiana.","name the state where Schaumburg lies":"Schaumburg is in Illinois.","which US state is Lawton in":"Lawton is in Oklahoma.","in what state is the city Springdale":"Springdale is in Arkansas.","in what state is the city Pensacola":"Pensacola is in Florida.","which US state is Ceres in":"Ceres is in California.","name the state where Casper lies":"Casper is in Wyoming.","name the state where Anaheim lies":"Anaheim is in California.","which US state is Gardena in":"Gardena is in California.","which US state is West Babylon in":"West Babylon is in New York.","in what state is the city Meriden":"Meriden is in Connecticut.","in what state is the city Kalamazoo":"Kalamazoo is in Michigan.","name the state where Passaic lies":"Passaic is in New Jersey.","in what state is the city Santa Monica":"Santa Monica is in California.","name the state where Wichita Falls lies":"Wichita Falls is in Texas.","in what state is the city Wauwatosa":"Wauwatosa is in Wisconsin.","which US state is Parker in":"Parker is in Colorado.","in what state is the city West Des Moines":"West Des Moines is in Iowa.","in what state is the city North Las Vegas":"North Las Vegas is in Nevada.","which US state is Rosemead in":"Rosemead is in California.","which US state is Valdosta in":"Valdosta is in Georgia.","name the state where Anchorage lies":"Anchorage is in Alaska.","in what state is the city Rio Rancho":"Rio Rancho is in New Mexico.","which US state is Yuba City in":"Yuba City is in California.","which US state is St. Peters in":"St. Peters is in Missouri.","in what state is the city Lowell":"Lowell is in Massachusetts.","name the state where Nashua lies":"Nashua is in New Hampshire.","which US state is Spring Hill in":"Spring Hill is in Florida.","in what state is the city Country Club":"Country Club is in Florida.","which US state is Burnsville in":"Burnsville is in Minnesota.","which US state is Buckeye in":"Buckeye is in Arizona.","name the state where Chattanooga lies":"Chattanooga is in Tennessee.","name the state where Birmingham lies":"Birmingham is in Alabama.","in what state is the city Sierra Vista":"Sierra Vista is in Arizona.","in what state is the city Huntington Park":"Huntington Park is in California.","name the state where Lynwood lies":"Lynwood is in California.","which US state is Dayton in":"Dayton is in Ohio.","name the state where Florin lies":"Florin is in California.","which US state is Bethesda in":"Bethesda is in Maryland.","in what state is the city Walnut Creek":"Walnut Creek is in California.","which US state is Janesville in":"Janesville is in Wisconsin.","in what state is the city Enterprise":"Enterprise is in Nevada.","which US state is Muncie in":"Muncie is in Indiana.","name the state where Palm Coast lies":"Palm Coast is in Florida.","name the state where Euclid lies":"Euclid is in Ohio.","in what state is the city Asheville":"Asheville is in North Carolina.","in what state is the city Hicksville":"Hicksville is in New York.","which US state is Hoffman Estates in":"Hoffman Estates is in Illinois.","name the state where Missouri City lies":"Missouri City is in Texas.","name the state where East Hartford lies":"East Hartford is in Connecticut.","in what state is the city Fall River":"Fall River is in Massachusetts.","which US state is Tonawanda in":"Tonawanda is in New York.","name the state where Corona lies":"Corona is in California.","which US state is East Lansing in":"East Lansing is in Michigan.","name the state where Waukesha lies":"Waukesha is in Wisconsin.","name the state where Somerville lies":"Somerville is in Massachusetts.","name the state where Rogers lies":"Rogers is in Arkansas.","name the state where Atlanta lies":"Atlanta is in Georgia.","name the state where Victoria lies":"Victoria is in Texas.","which US state is San Luis Obispo in":"San Luis Obispo is in California.","which US state is Redlands in":"Redlands is in California.","name the state where Macon-Bibb County lies":"Macon-Bibb County is in Georgia.","in what state is the city Kennewick":"Kennewick is in Washington.","which US state is Royal Oak in":"Royal Oak is in Michigan.","which US state is Vineland in":"Vineland is in New Jersey.","in what state is the city Arcadia":"Arcadia is in California.","in what state is the city Montgomery":"Montgomery is in Alabama.","in what state is the city Berkeley":"Berkeley is in California.","in what state is the city Midwest City":"Midwest City is in Oklahoma.","in what state is the city Raleigh":"Raleigh is in North Carolina.","name the state where Aloha lies":"Aloha is in Oregon.","name the state where Charlotte lies":"Charlotte is in North Carolina.","name the state where Jeffersonville lies":"Jeffersonville is in Indiana.","which US state is Port St. Lucie in":"Port St. Lucie is in Florida.","in what state is the city Blacksburg":"Blacksburg is in Virginia.","in what state is the city Frisco":"Frisco is in Texas.","in what state is the city Rochester Hills":"Rochester Hills is in Michigan.","which US state is Tallahassee in":"Tallahassee is in Florida.","name the state where Seattle lies":"Seattle is in Washington.","in what state is the city Paramount":"Paramount is in California.","which US state is Meridian in":"Meridian is in Idaho.","name the state where Waukegan lies":"Waukegan is in Illinois.","name the state where Greensboro lies":"Greensboro is in North Carolina.","name the state where Elkhart lies":"Elkhart is in Indiana."}}},
{"id":"n-84577003","guard":[["has","state"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"state"}]]],"mem":{"table":{"where Melbourne lies":"Melbourne is in Florida.","is the city Arden-Arcade":"Arden-Arcade is in California.","where Castro Valley lies":"Castro Valley is in California.","is Carmel in":"Carmel is in Indiana.","is Farmington Hills in":"Farmington Hills is in Michigan.","is the city Antioch":"Antioch is in California.","where Tyler lies":"Tyler is in Texas.","is the city Hendersonville":"Hendersonville is in Tennessee.","is Carson in":"Carson is in California.","is Denver in":"Denver is in Colorado.","is the city St. Joseph":"St. Joseph is in Missouri.","is Milford in":"Milford is in Connecticut.","is Boynton Beach in":"Boynton Beach is in Florida.","where Dearborn lies":"Dearborn is in Michigan.","is the city Oakland Park":"Oakland Park is in Florida.","is Hammond in":"Hammond is in Indiana.","where Schaumburg lies":"Schaumburg is in Illinois.","is Lawton in":"Lawton is in Oklahoma.","is the city Springdale":"Springdale is in Arkansas.","is the city Pensacola":"Pensacola is in Florida.","is Ceres in":"Ceres is in California.","where Casper lies":"Casper is in Wyoming.","where Anaheim lies":"Anaheim is in California.","is Gardena in":"Gardena is in California.","is West Babylon in":"West Babylon is in New York.","is the city Meriden":"Meriden is in Connecticut.","is the city Kalamazoo":"Kalamazoo is in Michigan.","where Passaic lies":"Passaic is in New Jersey.","is the city Santa Monica":"Santa Monica is in California.","where Wichita Falls lies":"Wichita Falls is in Texas.","is the city Wauwatosa":"Wauwatosa is in Wisconsin.","is Parker in":"Parker is in Colorado.","is the city West Des Moines":"West Des Moines is in Iowa.","is the city North Las Vegas":"North Las Vegas is in Nevada.","is Rosemead in":"Rosemead is in California.","is Valdosta in":"Valdosta is in Georgia.","where Anchorage lies":"Anchorage is in Alaska.","is the city Rio Rancho":"Rio Rancho is in New Mexico.","is Yuba City in":"Yuba City is in California.","is St. Peters in":"St. Peters is in Missouri.","is the city Lowell":"Lowell is in Massachusetts.","where Nashua lies":"Nashua is in New Hampshire.","is Spring Hill in":"Spring Hill is in Florida.","is the city Country Club":"Country Club is in Florida.","is Burnsville in":"Burnsville is in Minnesota.","is Buckeye in":"Buckeye is in Arizona.","where Chattanooga lies":"Chattanooga is in Tennessee.","where Birmingham lies":"Birmingham is in Alabama.","is the city Sierra Vista":"Sierra Vista is in Arizona.","is the city Huntington Park":"Huntington Park is in California.","where Lynwood lies":"Lynwood is in California.","is Dayton in":"Dayton is in Ohio.","where Florin lies":"Florin is in California.","is Bethesda in":"Bethesda is in Maryland.","is the city Walnut Creek":"Walnut Creek is in California.","is Janesville in":"Janesville is in Wisconsin.","is the city Enterprise":"Enterprise is in Nevada.","is Muncie in":"Muncie is in Indiana.","where Palm Coast lies":"Palm Coast is in Florida.","where Euclid lies":"Euclid is in Ohio.","is the city Asheville":"Asheville is in North Carolina.","is the city Hicksville":"Hicksville is in New York.","is Hoffman Estates in":"Hoffman Estates is in Illinois.","where Missouri City lies":"Missouri City is in Texas.","where East Hartford lies":"East Hartford is in Connecticut.","is the city Fall River":"Fall River is in Massachusetts.","is Tonawanda in":"Tonawanda is in New York.","where Corona lies":"Corona is in California.","is East Lansing in":"East Lansing is in Michigan.","where Waukesha lies":"Waukesha is in Wisconsin.","where Somerville lies":"Somerville is in Massachusetts.","where Rogers lies":"Rogers is in Arkansas.","where Atlanta lies":"Atlanta is in Georgia.","where Victoria lies":"Victoria is in Texas.","is San Luis Obispo in":"San Luis Obispo is in California.","is Redlands in":"Redlands is in California.","where Macon-Bibb County lies":"Macon-Bibb County is in Georgia.","is the city Kennewick":"Kennewick is in Washington.","is Royal Oak in":"Royal Oak is in Michigan.","is Vineland in":"Vineland is in New Jersey.","is the city Arcadia":"Arcadia is in California.","is the city Montgomery":"Montgomery is in Alabama.","is the city Berkeley":"Berkeley is in California.","is the city Midwest City":"Midwest City is in Oklahoma.","is the city Raleigh":"Raleigh is in North Carolina.","where Aloha lies":"Aloha is in Oregon.","where Charlotte lies":"Charlotte is in North Carolina.","where Jeffersonville lies":"Jeffersonville is in Indiana.","is Port St. Lucie in":"Port St. Lucie is in Florida.","is the city Blacksburg":"Blacksburg is in Virginia.","is the city Frisco":"Frisco is in Texas.","is the city Rochester Hills":"Rochester Hills is in Michigan.","is Tallahassee in":"Tallahassee is in Florida.","where Seattle lies":"Seattle is in Washington.","is the city Paramount":"Paramount is in California.","is Meridian in":"Meridian is in Idaho.","where Waukegan lies":"Waukegan is in Illinois.","where Greensboro lies":"Greensboro is in North Carolina.","where Elkhart lies":"Elkhart is in Indiana."}}},
{"id":"n-6a5c103b","guard":[["has","state"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the city Arden-Arcade":"Arden-Arcade is in California.","Carmel in":"Carmel is in Indiana.","Farmington Hills in":"Farmington Hills is in Michigan.","the city Antioch":"Antioch is in California.","the city Hendersonville":"Hendersonville is in Tennessee.","Carson in":"Carson is in California.","Denver in":"Denver is in Colorado.","the city St. Joseph":"St. Joseph is in Missouri.","Milford in":"Milford is in Connecticut.","Boynton Beach in":"Boynton Beach is in Florida.","the city Oakland Park":"Oakland Park is in Florida.","Hammond in":"Hammond is in Indiana.","Lawton in":"Lawton is in Oklahoma.","the city Springdale":"Springdale is in Arkansas.","the city Pensacola":"Pensacola is in Florida.","Ceres in":"Ceres is in California.","Gardena in":"Gardena is in California.","West Babylon in":"West Babylon is in New York.","the city Meriden":"Meriden is in Connecticut.","the city Kalamazoo":"Kalamazoo is in Michigan.","the city Santa Monica":"Santa Monica is in California.","the city Wauwatosa":"Wauwatosa is in Wisconsin.","Parker in":"Parker is in Colorado.","the city West Des Moines":"West Des Moines is in Iowa.","the city North Las Vegas":"North Las Vegas is in Nevada.","Rosemead in":"Rosemead is in California.","Valdosta in":"Valdosta is in Georgia.","the city Rio Rancho":"Rio Rancho is in New Mexico.","Yuba City in":"Yuba City is in California.","St. Peters in":"St. Peters is in Missouri.","the city Lowell":"Lowell is in Massachusetts.","Spring Hill in":"Spring Hill is in Florida.","the city Country Club":"Country Club is in Florida.","Burnsville in":"Burnsville is in Minnesota.","Buckeye in":"Buckeye is in Arizona.","the city Sierra Vista":"Sierra Vista is in Arizona.","the city Huntington Park":"Huntington Park is in California.","Dayton in":"Dayton is in Ohio.","Bethesda in":"Bethesda is in Maryland.","the city Walnut Creek":"Walnut Creek is in California.","Janesville in":"Janesville is in Wisconsin.","the city Enterprise":"Enterprise is in Nevada.","Muncie in":"Muncie is in Indiana.","the city Asheville":"Asheville is in North Carolina.","the city Hicksville":"Hicksville is in New York.","Hoffman Estates in":"Hoffman Estates is in Illinois.","the city Fall River":"Fall River is in Massachusetts.","Tonawanda in":"Tonawanda is in New York.","East Lansing in":"East Lansing is in Michigan.","San Luis Obispo in":"San Luis Obispo is in California.","Redlands in":"Redlands is in California.","the city Kennewick":"Kennewick is in Washington.","Royal Oak in":"Royal Oak is in Michigan.","Vineland in":"Vineland is in New Jersey.","the city Arcadia":"Arcadia is in California.","the city Montgomery":"Montgomery is in Alabama.","the city Berkeley":"Berkeley is in California.","the city Midwest City":"Midwest City is in Oklahoma.","the city Raleigh":"Raleigh is in North Carolina.","Port St. Lucie in":"Port St. Lucie is in Florida.","the city Blacksburg":"Blacksburg is in Virginia.","the city Frisco":"Frisco is in Texas.","the city Rochester Hills":"Rochester Hills is in Michigan.","Tallahassee in":"Tallahassee is in Florida.","the city Paramount":"Paramount is in California.","Meridian in":"Meridian is in Idaho."}}},
{"id":"n-81cfccdb","guard":[["has","state"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"in"}]]],"mem":{"table":{"which US state is Carmel":"Carmel is in Indiana.","which US state is Farmington Hills":"Farmington Hills is in Michigan.","which US state is Carson":"Carson is in California.","which US state is Denver":"Denver is in Colorado.","which US state is Milford":"Milford is in Connecticut.","which US state is Boynton Beach":"Boynton Beach is in Florida.","which US state is Hammond":"Hammond is in Indiana.","which US state is Lawton":"Lawton is in Oklahoma.","which US state is Ceres":"Ceres is in California.","which US state is Gardena":"Gardena is in California.","which US state is West Babylon":"West Babylon is in New York.","which US state is Parker":"Parker is in Colorado.","which US state is Rosemead":"Rosemead is in California.","which US state is Valdosta":"Valdosta is in Georgia.","which US state is Yuba City":"Yuba City is in California.","which US state is St. Peters":"St. Peters is in Missouri.","which US state is Spring Hill":"Spring Hill is in Florida.","which US state is Burnsville":"Burnsville is in Minnesota.","which US state is Buckeye":"Buckeye is in Arizona.","which US state is Dayton":"Dayton is in Ohio.","which US state is Bethesda":"Bethesda is in Maryland.","which US state is Janesville":"Janesville is in Wisconsin.","which US state is Muncie":"Muncie is in Indiana.","which US state is Hoffman Estates":"Hoffman Estates is in Illinois.","which US state is Tonawanda":"Tonawanda is in New York.","which US state is East Lansing":"East Lansing is in Michigan.","which US state is San Luis Obispo":"San Luis Obispo is in California.","which US state is Redlands":"Redlands is in California.","which US state is Royal Oak":"Royal Oak is in Michigan.","which US state is Vineland":"Vineland is in New Jersey.","which US state is Port St. Lucie":"Port St. Lucie is in Florida.","which US state is Tallahassee":"Tallahassee is in Florida.","which US state is Meridian":"Meridian is in Idaho."}}},
{"id":"n-e5038e5e","guard":[["has","city"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"in"}]]],"mem":{"table":{"what state is the city Arden-Arcade":"Arden-Arcade is in California.","what state is the city Antioch":"Antioch is in California.","what state is the city Hendersonville":"Hendersonville is in Tennessee.","what state is the city St. Joseph":"St. Joseph is in Missouri.","what state is the city Oakland Park":"Oakland Park is in Florida.","what state is the city Springdale":"Springdale is in Arkansas.","what state is the city Pensacola":"Pensacola is in Florida.","what state is the city Meriden":"Meriden is in Connecticut.","what state is the city Kalamazoo":"Kalamazoo is in Michigan.","what state is the city Santa Monica":"Santa Monica is in California.","what state is the city Wauwatosa":"Wauwatosa is in Wisconsin.","what state is the city West Des Moines":"West Des Moines is in Iowa.","what state is the city North Las Vegas":"North Las Vegas is in Nevada.","what state is the city Rio Rancho":"Rio Rancho is in New Mexico.","what state is the city Lowell":"Lowell is in Massachusetts.","what state is the city Country Club":"Country Club is in Florida.","what state is the city Sierra Vista":"Sierra Vista is in Arizona.","what state is the city Huntington Park":"Huntington Park is in California.","what state is the city Walnut Creek":"Walnut Creek is in California.","what state is the city Enterprise":"Enterprise is in Nevada.","what state is the city Asheville":"Asheville is in North Carolina.","what state is the city Hicksville":"Hicksville is in New York.","what state is the city Fall River":"Fall River is in Massachusetts.","what state is the city Kennewick":"Kennewick is in Washington.","what state is the city Arcadia":"Arcadia is in California.","what state is the city Montgomery":"Montgomery is in Alabama.","what state is the city Berkeley":"Berkeley is in California.","what state is the city Midwest City":"Midwest City is in Oklahoma.","what state is the city Raleigh":"Raleigh is in North Carolina.","what state is the city Blacksburg":"Blacksburg is in Virginia.","what state is the city Frisco":"Frisco is in Texas.","what state is the city Rochester Hills":"Rochester Hills is in Michigan.","what state is the city Paramount":"Paramount is in California."}}},
{"id":"n-1beb18c0","guard":[["hasAny",["anaheim","antioch","arcadia","ardenarcade","berkeley","carson","corona","florin","gardena","longest","longest one","longest word","luis","lynwood","monica","paramount","redlands","rosemead"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in California."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-92455b6f","guard":[["hasAny",["anaheim","antioch","arcadia","ardenarcade","berkeley","carson","corona","florin","gardena","longest","longest one","longest word","luis","lynwood","monica","paramount","redlands","rosemead"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in California."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-28600a8a","guard":[["hasAny",["antioch","arcadia","ardenarcade","berkeley","carson","ceres","creek","delete","gardena","huntington","luis","monica","paramount","redlands","remove","rosemead","strip out","without","yuba"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"california"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-6ce347fc","guard":[["hasAny",["antioch","arcadia","ardenarcade","berkeley","carson","ceres","creek","delete","gardena","huntington","luis","monica","paramount","redlands","remove","rosemead","strip out","without","yuba"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"California"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-7ffc1471","guard":[["hasAny",["antioch","arcadia","ardenarcade","berkeley","carson","ceres","count","gardena","how many","how many items","normalise","normalize","number of items","paramount","redlands","rosemead","simplify the text","yuba"]],["has","in"]],"pyramid":["render.str",["transform.norm",{"lit":"California"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-70f65a78","guard":[["hasAny",["anaheim","antioch","arcadia","ardenarcade","berkeley","corona","florin","item number","lynwood","nth","paramount","position","yuba"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in California."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-79d2ab39","guard":[["hasAny",["anaheim","carson","ceres","corona","florin","gardena","item number","lynwood","nth","position","redlands","rosemead"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in California."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-29e507ae","guard":[["hasAny",["antioch","arcadia","ardenarcade","berkeley","creek","delete","huntington","monica","paramount","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"california"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-39465786","guard":[["hasAny",["antioch","arcadia","ardenarcade","berkeley","creek","delete","huntington","monica","paramount","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"California"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-22304320","guard":[["hasAny",["antioch","arcadia","berkeley","creek","huntington","monica","paramount"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in California."]},["sense.lastWord"]],"mem":null},
{"id":"n-5a04a52b","guard":[["hasAny",["antioch","arcadia","berkeley","creek","huntington","lower case","lowercase","monica","paramount","small letters"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in California."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7ac8919e","guard":[["hasAny",["antioch","arcadia","berkeley","creek","huntington","invert case","monica","paramount","swap case","toggle case"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in California."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d431436d","guard":[["hasAny",["all caps","antioch","arcadia","berkeley","capital letters","capitals","creek","huntington","monica","paramount","upper case","uppercase"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in California."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f96253d3","guard":[["hasAny",["antioch","arcadia","berkeley","capitalise","capitalize","capitalize each word","creek","huntington","monica","paramount","title case"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in California."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-461b1414","guard":[["hasAny",["antioch","arcadia","berkeley","creek","each word","huntington","monica","paramount","split into words"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in California."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4dffa844","guard":[["hasAny",["carson","ceres","city","delete","gardena","luis","redlands","remove","rosemead","strip out","without"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"California"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-5afa0270","guard":[["hasAny",["carson","ceres","city","delete","gardena","luis","redlands","remove","rosemead","strip out","without"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"california"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-b8678489","guard":[["hasAny",["beach","club","delete","hill","lucie","oakland","pensacola","remove","strip out","tallahassee","without"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"florida"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-c0f4e00d","guard":[["hasAny",["beach","club","delete","hill","lucie","oakland","pensacola","remove","strip out","tallahassee","without"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"Florida"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-83a24cd0","guard":[["hasAny",["carson","creek","gardena","huntington","longest","longest one","longest word","luis","normalise","normalize","redlands","rosemead","simplify the text"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["aggregate.longest",["sense.words"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-31e9af56","guard":[["hasAny",["carmel","elkhart","hammond","jeffersonville","longest","longest one","longest word","muncie"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Indiana."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-366b0f3b","guard":[["hasAny",["carmel","elkhart","hammond","jeffersonville","longest","longest one","longest word","muncie"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Indiana."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-1cdb0381","guard":[["hasAny",["delete","east","hills","kalamazoo","oak","remove","strip out","without"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"michigan"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-5b6189b9","guard":[["hasAny",["carmel","delete","elkhart","hammond","jeffersonville","muncie","remove","strip out","without"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"indiana"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-6f76f98a","guard":[["hasAny",["carmel","elkhart","hammond","item number","jeffersonville","muncie","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Indiana."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9c2c38b4","guard":[["hasAny",["delete","east","hills","kalamazoo","oak","remove","strip out","without"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"Michigan"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-b0f603eb","guard":[["hasAny",["dearborn","farmington","item number","kalamazoo","lansing","nth","oak","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bd597d60","guard":[["hasAny",["carson","ceres","gardena","item number","nth","position","redlands","rosemead"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in California."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-17dca225","guard":[["hasAny",["castro","creek","huntington","item number","luis","monica","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-74e7b82c","guard":[["hasAny",["count","east","farmington","how many","how many items","kalamazoo","normalise","normalize","number of items","oak","simplify the text"]],["has","state"]],"pyramid":["render.str",["transform.norm",{"lit":"Michigan"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-d6948ec6","guard":[["hasAny",["beach","count","hill","how many","how many items","normalise","normalize","number of items","pensacola","simplify the text","tallahassee"]],["has","state"]],"pyramid":["render.str",["transform.norm",{"lit":"Florida"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-227fbbf0","guard":[["hasAny",["asheville","charlotte","delete","greensboro","raleigh","remove","strip out","without"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"North Carolina"},["sense.lastWord"]]],"mem":null},
{"id":"n-8f90d84d","guard":[["hasAny",["asheville","charlotte","greensboro","longest","longest one","longest word","raleigh"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North Carolina."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a9a7e2ee","guard":[["hasAny",["asheville","charlotte","greensboro","raleigh","separate by","split","split by"]],["has","state"]],"pyramid":["render.and",["transform.split",{"lit":"North Carolina"},["sense.lastWord"]]],"mem":null},
{"id":"n-cb085bbd","guard":[["hasAny",["asheville","charlotte","greensboro","raleigh","separate by","split","split by"]],["has","state"]],"pyramid":["render.list",["transform.split",{"lit":"North Carolina"},["sense.lastWord"]]],"mem":null},
{"id":"n-d18b7042","guard":[["hasAny",["asheville","charlotte","greensboro","longest","longest one","longest word","raleigh"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North Carolina."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-eb1f7bed","guard":[["hasAny",["asheville","charlotte","greensboro","raleigh","separate by","split","split by"]],["has","state"]],"pyramid":["render.lines",["transform.split",{"lit":"North Carolina"},["sense.lastWord"]]],"mem":null},
{"id":"n-08653dc9","guard":[["hasAny",["beach","delete","hill","lucie","remove","strip out","tallahassee","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"florida"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-1377f32d","guard":[["hasAny",["beach","delete","hill","lucie","remove","strip out","tallahassee","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Florida"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-54829757","guard":[["hasAny",["asheville","charlotte","greensboro","raleigh","separate by","shortest","shortest one","shortest word","split","split by"]],["has","state"]],"pyramid":["render.str",["aggregate.shortest",["transform.split",{"lit":"North Carolina"},["sense.lastWord"]]]],"mem":null},
{"id":"n-5e143019","guard":[["hasAny",["asheville","charlotte","greensboro","item number","nth","position","raleigh"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North Carolina."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-66ca5640","guard":[["hasAny",["beach","hill","item number","melbourne","nth","pensacola","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-70ead0cf","guard":[["hasAny",["asheville","charlotte","greensboro","longest","longest one","longest word","raleigh","separate by","split","split by"]],["has","state"]],"pyramid":["render.str",["aggregate.longest",["transform.split",{"lit":"North Carolina"},["sense.lastWord"]]]],"mem":null},
{"id":"n-7853d13d","guard":[["hasAny",["asheville","change to","charlotte","greensboro","raleigh","replace","substitute","swap"]],["has","state"]],"pyramid":["render.str",["transform.replace",{"lit":"North Carolina"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-7211d878","guard":[["hasAny",["club","coast","item number","lucie","nth","oakland","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6f58c452","guard":[["hasAny",["carmel","count","hammond","how many","how many items","muncie","normalise","normalize","number of items","simplify the text"]],["has","which"]],"pyramid":["render.str",["transform.norm",{"lit":"Indiana"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-375fe774","guard":[["hasAny",["club","oakland","pensacola"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["sense.lastWord"]],"mem":null},
{"id":"n-13c8b604","guard":[["hasAny",["babylon","hicksville","longest","longest one","longest word","tonawanda"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-269e26d7","guard":[["hasAny",["club","invert case","oakland","pensacola","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-32ec3a7d","guard":[["hasAny",["hartford","longest","longest one","longest word","meriden","milford"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3dc77dd1","guard":[["hasAny",["dearborn","kalamazoo","lansing","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8c8c1b50","guard":[["hasAny",["janesville","longest","longest one","longest word","waukesha","wauwatosa"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-8cc2a079","guard":[["hasAny",["dearborn","kalamazoo","lansing","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-931eed21","guard":[["hasAny",["club","lower case","lowercase","oakland","pensacola","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a67e0b8d","guard":[["hasAny",["all caps","capital letters","capitals","club","oakland","pensacola","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-af0c9242","guard":[["hasAny",["babylon","hicksville","longest","longest one","longest word","tonawanda"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-ba9a0c58","guard":[["hasAny",["hartford","longest","longest one","longest word","meriden","milford"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-bb80839f","guard":[["hasAny",["longest","longest one","longest word","melbourne","pensacola","tallahassee"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cc595ed6","guard":[["hasAny",["longest","longest one","longest word","melbourne","pensacola","tallahassee"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-e3ae47ca","guard":[["hasAny",["janesville","longest","longest one","longest word","waukesha","wauwatosa"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e9f52fd6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","club","oakland","pensacola","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-16392503","guard":[["hasAny",["estates","schaumburg","separate by","split","split by","waukegan"]],["has","state"]],"pyramid":["render.and",["transform.split",{"lit":"Illinois"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-16b48671","guard":[["hasAny",["delete","east","farmington","oak","remove","strip out","without"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"Michigan"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-1e94d96e","guard":[["hasAny",["estates","item number","nth","position","schaumburg","waukegan"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Illinois."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-23682857","guard":[["hasAny",["carmel","delete","hammond","muncie","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Indiana"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-4f6195b8","guard":[["hasAny",["frisco","item number","nth","position","tyler","victoria"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5cadb670","guard":[["hasAny",["club","delete","oakland","pensacola","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"florida"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-6d13cb0b","guard":[["hasAny",["delete","estates","remove","schaumburg","strip out","waukegan","without"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"Illinois"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-6d80b3f3","guard":[["hasAny",["club","each word","oakland","pensacola","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6f02554e","guard":[["hasAny",["carmel","hammond","item number","muncie","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Indiana."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-73b8d4b1","guard":[["hasAny",["delete","east","farmington","oak","remove","strip out","without"]],["has","us"]],"pyramid":["render.str",["transform.remove",{"lit":"michigan"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-7d09233e","guard":[["hasAny",["estates","schaumburg","separate by","split","split by","waukegan"]],["has","state"]],"pyramid":["render.lines",["transform.split",{"lit":"Illinois"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-82986363","guard":[["hasAny",["estates","schaumburg","separate by","split","split by","waukegan"]],["has","state"]],"pyramid":["render.list",["transform.split",{"lit":"Illinois"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-b6fa4df0","guard":[["hasAny",["carmel","delete","hammond","muncie","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"indiana"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-d4ca0bd4","guard":[["hasAny",["carmel","delete","hammond","muncie","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"indiana"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-e8b54fc1","guard":[["hasAny",["carmel","delete","hammond","muncie","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Indiana"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ef51ab0c","guard":[["hasAny",["club","delete","oakland","pensacola","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Florida"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-91254e16","guard":[["hasAny",["creek","huntington","item number","monica","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-0977c4f1","guard":[["hasAny",["club","longest","longest one","longest word","normalise","normalize","oakland","simplify the text","tallahassee"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.words"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-3084eff9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","creek","huntington","item number","monica","nth","position","title case"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6132f9aa","guard":[["hasAny",["castro","creek","huntington","item number","longest","longest one","longest word","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-66544bb3","guard":[["hasAny",["castro","creek","huntington","item number","longest","longest one","longest word","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9d2faad4","guard":[["hasAny",["creek","huntington","item number","lower case","lowercase","monica","nth","position","small letters"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-bbbb6f2d","guard":[["hasAny",["all caps","capital letters","capitals","creek","huntington","item number","monica","nth","position","upper case","uppercase"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c1491f8c","guard":[["hasAny",["creek","huntington","invert case","item number","monica","nth","position","swap case","toggle case"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1cdf3bcf","guard":[["hasAny",["farmington","item number","lansing","nth","oak","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-43fe9eb1","guard":[["hasAny",["creek","each word","huntington","item number","monica","nth","position","split into words"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5bf57e69","guard":[["hasAny",["creek","each word","huntington","item number","monica","nth","position","split into words"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cc86074e","guard":[["hasAny",["farmington","item number","lansing","nth","oak","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1632b049","guard":[["hasAny",["count","how many","how many items","meriden","milford","normalise","normalize","number of items","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":"Connecticut"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-163bde31","guard":[["hasAny",["kalamazoo","rochester"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["sense.lastWord"]],"mem":null},
{"id":"n-91f44bf1","guard":[["hasAny",["asheville","raleigh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North Carolina."]},["sense.lastWord"]],"mem":null},
{"id":"n-aa21354a","guard":[["hasAny",["fall","lowell"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Massachusetts."]},["sense.lastWord"]],"mem":null},
{"id":"n-dac2bc1a","guard":[["hasAny",["enterprise","las"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Nevada."]},["sense.lastWord"]],"mem":null},
{"id":"n-0643530e","guard":[["hasAny",["longest","longest one","longest word","passaic","vineland"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New Jersey."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-07d3f4ec","guard":[["hasAny",["asheville","capitalise","capitalize","capitalize each word","raleigh","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North Carolina."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-14fd5e7a","guard":[["hasAny",["delete","elkhart","jeffersonville","remove","strip out","without"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"indiana"},["sense.lastWord"]]],"mem":null},
{"id":"n-16de98ea","guard":[["hasAny",["schaumburg","separate by","split","split by","waukegan"]]],"pyramid":["render.list",["transform.split",{"lit":"Illinois"},["sense.lastWord"]]],"mem":null},
{"id":"n-185fc099","guard":[["hasAny",["longest","longest one","longest word","rogers","springdale"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arkansas."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2336b5b2","guard":[["hasAny",["asheville","invert case","raleigh","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North Carolina."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-24e2e7d3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","enterprise","las","title case"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Nevada."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2715ca83","guard":[["hasAny",["birmingham","longest","longest one","longest word","montgomery"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-27f5f9a3","guard":[["hasAny",["schaumburg","separate by","split","split by","waukegan"]]],"pyramid":["render.and",["transform.split",{"lit":"Illinois"},["sense.lastWord"]]],"mem":null},
{"id":"n-29ef8cb7","guard":[["hasAny",["atlanta","longest","longest one","longest word","valdosta"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Georgia."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-2a48c0ec","guard":[["hasAny",["kalamazoo","lower case","lowercase","rochester","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2ce256f3","guard":[["hasAny",["frisco","longest","longest one","longest word","victoria"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-342ff7cf","guard":[["hasAny",["delete","remove","schaumburg","strip out","waukegan","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Illinois"},["sense.lastWord"]]],"mem":null},
{"id":"n-3693b298","guard":[["hasAny",["chattanooga","hendersonville","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-486d529b","guard":[["hasAny",["chattanooga","hendersonville","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-4d8a4f52","guard":[["hasAny",["longest","longest one","longest word","schaumburg","waukegan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Illinois."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-50700aa5","guard":[["hasAny",["dayton","euclid","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ohio."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-5388675c","guard":[["hasAny",["fall","invert case","lowell","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Massachusetts."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-594e39d4","guard":[["hasAny",["kennewick","longest","longest one","longest word","seattle"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5cf62d6d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kalamazoo","rochester","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5fa0c6c7","guard":[["hasAny",["joseph","longest","longest one","longest word","peters"]],["has","in"]],"pyramid":["render.template",{"lit":["St. ",{"slot":0}," is in Missouri."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-61ab2506","guard":[["hasAny",["kennewick","longest","longest one","longest word","seattle"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-6ba9f1a1","guard":[["hasAny",["enterprise","las","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Nevada."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6c2a3a84","guard":[["hasAny",["all caps","asheville","capital letters","capitals","raleigh","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North Carolina."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-6f66ff3a","guard":[["hasAny",["hills","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," Hills is in Michigan."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6ffc4691","guard":[["hasAny",["schaumburg","separate by","split","split by","waukegan"]]],"pyramid":["render.lines",["transform.split",{"lit":"Illinois"},["sense.lastWord"]]],"mem":null},
{"id":"n-7d5ba580","guard":[["hasAny",["fall","lowell","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Massachusetts."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8530b33a","guard":[["hasAny",["atlanta","longest","longest one","longest word","valdosta"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Georgia."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8653e2de","guard":[["hasAny",["frisco","longest","longest one","longest word","victoria"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-89ea5892","guard":[["hasAny",["longest","longest one","longest word","schaumburg","waukegan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Illinois."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-8ff1e801","guard":[["hasAny",["dayton","euclid","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ohio."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-93690be1","guard":[["hasAny",["all caps","capital letters","capitals","fall","lowell","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Massachusetts."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-9c085c98","guard":[["hasAny",["invert case","kalamazoo","rochester","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9e203a1c","guard":[["hasAny",["all caps","capital letters","capitals","kalamazoo","rochester","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a222b1c8","guard":[["hasAny",["longest","longest one","longest word","rogers","springdale"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arkansas."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-a3ef2302","guard":[["hasAny",["denver","longest","longest one","longest word","parker"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Colorado."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a6478ec1","guard":[["hasAny",["asheville","lower case","lowercase","raleigh","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North Carolina."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-bf395022","guard":[["hasAny",["denver","longest","longest one","longest word","parker"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Colorado."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-c4a6ce22","guard":[["hasAny",["longest","longest one","longest word","passaic","vineland"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New Jersey."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-d2fc2817","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fall","lowell","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Massachusetts."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d6b8e1b3","guard":[["hasAny",["longest","longest one","longest word","lowell","somerville"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Massachusetts."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-de8277d2","guard":[["hasAny",["all caps","capital letters","capitals","enterprise","las","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Nevada."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-ebe207f8","guard":[["hasAny",["enterprise","invert case","las","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Nevada."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f30c1632","guard":[["hasAny",["longest","longest one","longest word","lowell","somerville"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Massachusetts."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f6234913","guard":[["hasAny",["birmingham","longest","longest one","longest word","montgomery"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-0a0255ee","guard":[["hasAny",["longest","longest one","longest word","schaumburg","separate by","split","split by","waukegan"]]],"pyramid":["render.str",["aggregate.longest",["transform.split",{"lit":"Illinois"},["sense.lastWord"]]]],"mem":null},
{"id":"n-0b31d539","guard":[["hasAny",["dayton","euclid","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ohio."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2116297f","guard":[["hasAny",["club","longest","longest one","longest word","oakland"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-2163236e","guard":[["hasAny",["item number","kennewick","nth","position","seattle"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2625793d","guard":[["hasAny",["charlotte","delete","greensboro","remove","strip out","without"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"North Carolina"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-35674459","guard":[["hasAny",["denver","item number","nth","parker","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Colorado."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3e523ccb","guard":[["hasAny",["elkhart","item number","jeffersonville","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Indiana."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-40eff79e","guard":[["hasAny",["chattanooga","hendersonville","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-42d50590","guard":[["hasAny",["delete","hills","kalamazoo","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"michigan"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-440c95e9","guard":[["hasAny",["delete","hills","kalamazoo","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Michigan"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-48011efa","guard":[["hasAny",["creek","huntington","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["aggregate.longest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-61a8c96a","guard":[["hasAny",["change to","elkhart","jeffersonville","replace","substitute","swap"]],["has","name"]],"pyramid":["render.str",["transform.replace",{"lit":"indiana"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-62f34809","guard":[["hasAny",["babylon","hicksville","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6581095b","guard":[["hasAny",["item number","nth","position","rogers","springdale"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arkansas."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-696f3dd7","guard":[["hasAny",["item number","nth","position","waukesha","wauwatosa"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6e9811cc","guard":[["hasAny",["change to","replace","schaumburg","substitute","swap","waukegan"]],["has","name"]],"pyramid":["render.str",["transform.replace",{"lit":"Illinois"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-7894f10e","guard":[["hasAny",["delete","fall","lowell","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Massachusetts"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-79d8ee9b","guard":[["hasAny",["item number","melbourne","nth","position","tallahassee"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8591e504","guard":[["hasAny",["each word","fall","lowell","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Massachusetts."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8686b733","guard":[["hasAny",["creek","huntington","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-8a7d2800","guard":[["hasAny",["delete","meriden","milford","remove","strip out","without"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"Connecticut"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-909bdb85","guard":[["hasAny",["each word","kalamazoo","rochester","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-95a4a8cf","guard":[["hasAny",["asheville","delete","raleigh","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"North Carolina"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-96add1e5","guard":[["hasAny",["each word","enterprise","las","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Nevada."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9c10717c","guard":[["hasAny",["item number","nth","position","tyler","victoria"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9e1ecf44","guard":[["hasAny",["club","longest","longest one","longest word","oakland"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-9f5a70da","guard":[["hasAny",["birmingham","item number","montgomery","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a67e1751","guard":[["hasAny",["item number","lawton","midwest","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oklahoma."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a775aa06","guard":[["hasAny",["atlanta","item number","nth","position","valdosta"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Georgia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b6f6e285","guard":[["hasAny",["item number","janesville","nth","position","waukesha"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b86c1fb8","guard":[["hasAny",["charlotte","greensboro","separate by","split","split by"]],["has","name"]],"pyramid":["render.list",["transform.split",{"lit":"North Carolina"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-bf3b5e9c","guard":[["hasAny",["asheville","delete","raleigh","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"North Carolina"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-c21b082d","guard":[["hasAny",["charlotte","greensboro","separate by","split","split by"]],["has","name"]],"pyramid":["render.lines",["transform.split",{"lit":"North Carolina"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-cb5e0a9b","guard":[["hasAny",["item number","nth","position","schaumburg","waukegan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Illinois."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d0e3c6fc","guard":[["hasAny",["denver","item number","nth","parker","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Colorado."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d27f82a7","guard":[["hasAny",["asheville","each word","raleigh","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North Carolina."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d400af45","guard":[["hasAny",["item number","nth","passaic","position","vineland"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New Jersey."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d7e3ae60","guard":[["hasAny",["delete","fall","lowell","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Massachusetts"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-e2a245ae","guard":[["hasAny",["item number","lowell","nth","position","somerville"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Massachusetts."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f2d5f4d1","guard":[["hasAny",["charlotte","greensboro","separate by","split","split by"]],["has","name"]],"pyramid":["render.and",["transform.split",{"lit":"North Carolina"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-f3e29625","guard":[["hasAny",["charlotte","greensboro","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North Carolina."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-00e55168","guard":[["hasAny",["creek","huntington","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2f291784","guard":[["hasAny",["creek","huntington","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6c32ad33","guard":[["hasAny",["club","item number","nth","oakland","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-76b4abb3","guard":[["hasAny",["joseph","longest","longest one","longest word","peters","shortest","shortest one","shortest word"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9832f3c6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","club","longest","longest one","longest word","oakland","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c2c480e9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","creek","huntington","longest","longest one","longest word","title case"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c9ae209f","guard":[["hasAny",["all caps","capital letters","capitals","creek","huntington","longest","longest one","longest word","upper case","uppercase"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-dfe686fa","guard":[["hasAny",["club","longest","longest one","longest word","lower case","lowercase","oakland","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e16405b1","guard":[["hasAny",["all caps","capital letters","capitals","club","longest","longest one","longest word","oakland","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f22b5aa6","guard":[["hasAny",["club","invert case","longest","longest one","longest word","oakland","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-22d1aac0","guard":[["hasAny",["buckeye","longest","longest one","longest word","normalise","normalize","sierra","simplify the text"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2890b542","guard":[["hasAny",["item number","longest","longest one","longest word","luis","monica","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-28d7472d","guard":[["hasAny",["item number","longest","longest one","longest word","luis","monica","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5e4a0924","guard":[["hasAny",["beach","hill","item number","longest","longest one","longest word","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-61d512bf","guard":[["hasAny",["creek","huntington","item number","longest","longest one","longest word","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-6209287f","guard":[["hasAny",["lawton","longest","longest one","longest word","midwest","normalise","normalize","simplify the text"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oklahoma."]},["aggregate.longest",["sense.words"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-758084ac","guard":[["hasAny",["creek","each word","huntington","longest","longest one","longest word","split into words"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9be94ee0","guard":[["hasAny",["beach","hill","item number","longest","longest one","longest word","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a78623f4","guard":[["hasAny",["falls","item number","longest","longest one","longest word","missouri","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Texas."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a9d80849","guard":[["hasAny",["club","item number","longest","longest one","longest word","nth","oakland","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-c74fb5b3","guard":[["hasAny",["lansing","longest","longest one","longest word","normalise","normalize","rochester","simplify the text"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["aggregate.longest",["sense.words"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d02861fc","guard":[["hasAny",["club","each word","longest","longest one","longest word","oakland","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d49119c8","guard":[["hasAny",["club","each word","longest","longest one","longest word","oakland","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e090c786","guard":[["hasAny",["creek","each word","huntington","longest","longest one","longest word","split into words"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f39e7324","guard":[["hasAny",["falls","item number","longest","longest one","longest word","missouri","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Texas."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2df0ba95","guard":[["hasAny",["beach","hill","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3fef752b","guard":[["hasAny",["falls","item number","missouri","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Texas."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bef22366","guard":[["hasAny",["falls","item number","missouri","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Texas."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-da64e1ec","guard":[["hasAny",["beach","hill","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1d91ab9f","guard":[["hasAny",["count","frisco","how many","how many items","normalise","normalize","number of items","simplify the text"]],["has","in"]],"pyramid":["render.str",["transform.norm",{"lit":"Texas"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-87d09c97","guard":[["hasAny",["count","how many","how many items","lowell","normalise","normalize","number of items","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":"Massachusetts"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-b7fe2fcb","guard":[["hasAny",["count","estates","how many","how many items","normalise","normalize","number of items","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":"Illinois"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-de0a7c75","guard":[["hasAny",["count","how many","how many items","normalise","normalize","number of items","simplify the text","valdosta"]]],"pyramid":["render.str",["transform.norm",{"lit":"Georgia"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-01871aca","guard":[["has","creek"],["has","in"]],"pyramid":["render.template",{"lit":["Walnut ",{"slot":0}," is in California."]},["sense.lastWord"]],"mem":null},
{"id":"n-0323a241","guard":[["hasAny",["farmington","hills","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Farmington Hills in":"Farmington Hills is in Michigan."}}},
{"id":"n-032f721c","guard":[["hasAny",["asheville","city","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Asheville":"Asheville is in North Carolina."}}},
{"id":"n-036b960a","guard":[["hasAny",["dayton","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Dayton in":"Dayton is in Ohio."}}},
{"id":"n-04d03691","guard":[["hasAny",["lies","name","somerville","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Somerville lies":"Somerville is in Massachusetts."}}},
{"id":"n-066bf37a","guard":[["hasAny",["lies","name","nashua","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Nashua lies":"Nashua is in New Hampshire."}}},
{"id":"n-06718f4d","guard":[["has","passaic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Passaic lies":"Passaic is in New Jersey."}}},
{"id":"n-069781d3","guard":[["hasAny",["denver","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Denver in":"Denver is in Colorado."}}},
{"id":"n-073165ae","guard":[["hasAny",["jeffersonville","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Jeffersonville lies":"Jeffersonville is in Indiana."}}},
{"id":"n-09308096","guard":[["has","aloha"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Aloha lies":"Aloha is in Oregon."}}},
{"id":"n-0a1ad0f0","guard":[["hasAny",["city","kalamazoo","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Kalamazoo":"Kalamazoo is in Michigan."}}},
{"id":"n-0c9b02aa","guard":[["has","sierra"],["has","state"]],"pyramid":["render.template",{"lit":["Sierra ",{"slot":0}," is in Arizona."]},["sense.lastWord"]],"mem":null},
{"id":"n-0d983b23","guard":[["hasAny",["luis","obispo","san","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is San Luis Obispo in":"San Luis Obispo is in California."}}},
{"id":"n-10028d40","guard":[["hasAny",["city","raleigh","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Raleigh":"Raleigh is in North Carolina."}}},
{"id":"n-11e05e23","guard":[["has","dearborn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Dearborn lies":"Dearborn is in Michigan."}}},
{"id":"n-12c8e760","guard":[["hasAny",["lawton","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Lawton in":"Lawton is in Oklahoma."}}},
{"id":"n-1398f259","guard":[["hasAny",["estates","hoffman","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Hoffman Estates in":"Hoffman Estates is in Illinois."}}},
{"id":"n-17f36f1f","guard":[["hasAny",["luis","obispo","san","state"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is San Luis Obispo in":"San Luis Obispo is in California."}}},
{"id":"n-1904f07b","guard":[["hasAny",["buckeye","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Buckeye in":"Buckeye is in Arizona."}}},
{"id":"n-19a7a87d","guard":[["has","meriden"],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["sense.lastWord"]],"mem":null},
{"id":"n-1a0385f0","guard":[["hasAny",["meridian","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Meridian in":"Meridian is in Idaho."}}},
{"id":"n-1b985319","guard":[["hasAny",["lies","name","passaic","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Passaic lies":"Passaic is in New Jersey."}}},
{"id":"n-1e2dad19","guard":[["has","kennewick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["sense.lastWord"]],"mem":null},
{"id":"n-1ec6e7b0","guard":[["hasAny",["bethesda","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Bethesda in":"Bethesda is in Maryland."}}},
{"id":"n-1ef99f02","guard":[["hasAny",["city","lowell","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Lowell":"Lowell is in Massachusetts."}}},
{"id":"n-209d0e8f","guard":[["hasAny",["city","club","country","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Country Club":"Country Club is in Florida."}}},
{"id":"n-21027644","guard":[["has","euclid"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Euclid lies":"Euclid is in Ohio."}}},
{"id":"n-211cf8fe","guard":[["hasAny",["charlotte","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Charlotte lies":"Charlotte is in North Carolina."}}},
{"id":"n-240a3ec1","guard":[["hasAny",["lies","name","seattle","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Seattle lies":"Seattle is in Washington."}}},
{"id":"n-2566f7c7","guard":[["hasAny",["county","maconbibb"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Macon-Bibb County lies":"Macon-Bibb County is in Georgia."}}},
{"id":"n-25a1f52e","guard":[["hasAny",["parker","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Parker in":"Parker is in Colorado."}}},
{"id":"n-25e13d68","guard":[["hasAny",["city","des","moines","state","west"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city West Des Moines":"West Des Moines is in Iowa."}}},
{"id":"n-26cb1d9d","guard":[["hasAny",["rosemead","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Rosemead in":"Rosemead is in California."}}},
{"id":"n-27bb6eaf","guard":[["has","asheville"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Asheville":"Asheville is in North Carolina."}}},
{"id":"n-2c3a15be","guard":[["hasAny",["redlands","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Redlands in":"Redlands is in California."}}},
{"id":"n-2d0f4372","guard":[["hasAny",["city","fall","river","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Fall River":"Fall River is in Massachusetts."}}},
{"id":"n-2e1a01f8","guard":[["has","nashua"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Nashua lies":"Nashua is in New Hampshire."}}},
{"id":"n-2e5804bf","guard":[["has","yuba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Yuba City in":"Yuba City is in California."}}},
{"id":"n-2e60cf98","guard":[["has","raleigh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Raleigh":"Raleigh is in North Carolina."}}},
{"id":"n-3028be4f","guard":[["hasAny",["city","montgomery","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Montgomery":"Montgomery is in Alabama."}}},
{"id":"n-318c8750","guard":[["hasAny",["state","valdosta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Valdosta in":"Valdosta is in Georgia."}}},
{"id":"n-31c01859","guard":[["hasAny",["burnsville","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Burnsville in":"Burnsville is in Minnesota."}}},
{"id":"n-34677027","guard":[["hasAny",["city","springdale","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Springdale":"Springdale is in Arkansas."}}},
{"id":"n-34d8e2e8","guard":[["has","wauwatosa"],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["sense.lastWord"]],"mem":null},
{"id":"n-34d95728","guard":[["hasAny",["city","sierra","state","vista"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Sierra Vista":"Sierra Vista is in Arizona."}}},
{"id":"n-35b66626","guard":[["hasAny",["casper","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Casper lies":"Casper is in Wyoming."}}},
{"id":"n-3649ecc8","guard":[["hasAny",["beach","boynton","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Boynton Beach in":"Boynton Beach is in Florida."}}},
{"id":"n-36b8dfd9","guard":[["hasAny",["state","vineland"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Vineland in":"Vineland is in New Jersey."}}},
{"id":"n-394cfdfe","guard":[["hasAny",["peters","st","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is St. Peters in":"St. Peters is in Missouri."}}},
{"id":"n-39ea02b8","guard":[["hasAny",["state","vineland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Vineland in":"Vineland is in New Jersey."}}},
{"id":"n-3aa99736","guard":[["hasAny",["florin","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Florin lies":"Florin is in California."}}},
{"id":"n-3b8aaafa","guard":[["has","midwest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Midwest City":"Midwest City is in Oklahoma."}}},
{"id":"n-4050fdd7","guard":[["hasAny",["janesville","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Janesville in":"Janesville is in Wisconsin."}}},
{"id":"n-418d2e10","guard":[["has","waukegan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Waukegan lies":"Waukegan is in Illinois."}}},
{"id":"n-41e44d30","guard":[["hasAny",["city","las","north","state","vegas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city North Las Vegas":"North Las Vegas is in Nevada."}}},
{"id":"n-441f880e","guard":[["hasAny",["lucie","port","st","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Port St. Lucie in":"Port St. Lucie is in Florida."}}},
{"id":"n-453d1f76","guard":[["hasAny",["farmington","hills","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Farmington Hills in":"Farmington Hills is in Michigan."}}},
{"id":"n-45876844","guard":[["has","hicksville"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Hicksville":"Hicksville is in New York."}}},
{"id":"n-46b855f1","guard":[["hasAny",["city","creek","state","walnut"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Walnut Creek":"Walnut Creek is in California."}}},
{"id":"n-472ba3a5","guard":[["has","hendersonville"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["sense.lastWord"]],"mem":null},
{"id":"n-47da409b","guard":[["hasAny",["anaheim","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Anaheim lies":"Anaheim is in California."}}},
{"id":"n-493ed08a","guard":[["hasAny",["city","oakland","park","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Oakland Park":"Oakland Park is in Florida."}}},
{"id":"n-4a24079c","guard":[["hasAny",["east","hartford"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where East Hartford lies":"East Hartford is in Connecticut."}}},
{"id":"n-4a5935be","guard":[["hasAny",["state","valdosta"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Valdosta in":"Valdosta is in Georgia."}}},
{"id":"n-4dd0ab69","guard":[["has","charlotte"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Charlotte lies":"Charlotte is in North Carolina."}}},
{"id":"n-4de18d71","guard":[["hasAny",["city","fall","river","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Fall River":"Fall River is in Massachusetts."}}},
{"id":"n-4e0b3723","guard":[["has","huntington"],["has","state"]],"pyramid":["render.template",{"lit":["Huntington ",{"slot":0}," is in California."]},["sense.lastWord"]],"mem":null},
{"id":"n-4f18e45d","guard":[["hasAny",["carmel","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Carmel in":"Carmel is in Indiana."}}},
{"id":"n-4f2c8d22","guard":[["hasAny",["corona","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Corona lies":"Corona is in California."}}},
{"id":"n-535211d7","guard":[["hasAny",["peters","st","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is St. Peters in":"St. Peters is in Missouri."}}},
{"id":"n-5431ef19","guard":[["hasAny",["city","hills","rochester","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Rochester Hills":"Rochester Hills is in Michigan."}}},
{"id":"n-550ffdf6","guard":[["hasAny",["east","lansing","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is East Lansing in":"East Lansing is in Michigan."}}},
{"id":"n-5594d3ec","guard":[["hasAny",["babylon","state","west"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is West Babylon in":"West Babylon is in New York."}}},
{"id":"n-57d81443","guard":[["hasAny",["dearborn","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Dearborn lies":"Dearborn is in Michigan."}}},
{"id":"n-583f1668","guard":[["has","hendersonville"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Hendersonville":"Hendersonville is in Tennessee."}}},
{"id":"n-58a49e2e","guard":[["hasAny",["state","tonawanda"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Tonawanda in":"Tonawanda is in New York."}}},
{"id":"n-58c0e894","guard":[["hasAny",["city","meriden","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Meriden":"Meriden is in Connecticut."}}},
{"id":"n-5929570a","guard":[["hasAny",["lawton","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Lawton in":"Lawton is in Oklahoma."}}},
{"id":"n-5c4650d1","guard":[["hasAny",["lies","name","state","waukesha"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Waukesha lies":"Waukesha is in Wisconsin."}}},
{"id":"n-5ec33de7","guard":[["has","lowell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Lowell":"Lowell is in Massachusetts."}}},
{"id":"n-601b3ff2","guard":[["hasAny",["parker","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Parker in":"Parker is in Colorado."}}},
{"id":"n-6063ed22","guard":[["hasAny",["east","hartford","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where East Hartford lies":"East Hartford is in Connecticut."}}},
{"id":"n-61202777","guard":[["hasAny",["city","club","country","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Country Club":"Country Club is in Florida."}}},
{"id":"n-61326bdc","guard":[["hasAny",["dayton","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Dayton in":"Dayton is in Ohio."}}},
{"id":"n-61eff546","guard":[["hasAny",["elkhart","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Elkhart lies":"Elkhart is in Indiana."}}},
{"id":"n-63323d67","guard":[["has","oakland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Oakland Park":"Oakland Park is in Florida."}}},
{"id":"n-64aeac63","guard":[["hasAny",["hill","spring","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Spring Hill in":"Spring Hill is in Florida."}}},
{"id":"n-658526cf","guard":[["has","melbourne"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Melbourne lies":"Melbourne is in Florida."}}},
{"id":"n-6938509e","guard":[["hasAny",["carson","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Carson in":"Carson is in California."}}},
{"id":"n-69b107be","guard":[["hasAny",["anchorage","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Anchorage lies":"Anchorage is in Alaska."}}},
{"id":"n-69b90363","guard":[["hasAny",["city","missouri"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Missouri City lies":"Missouri City is in Texas."}}},
{"id":"n-6a94a532","guard":[["hasAny",["east","lansing","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is East Lansing in":"East Lansing is in Michigan."}}},
{"id":"n-6ae78c45","guard":[["hasAny",["hammond","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Hammond in":"Hammond is in Indiana."}}},
{"id":"n-6cfb82b5","guard":[["hasAny",["muncie","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Muncie in":"Muncie is in Indiana."}}},
{"id":"n-6d968251","guard":[["hasAny",["carson","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Carson in":"Carson is in California."}}},
{"id":"n-6daa42c5","guard":[["hasAny",["city","midwest","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Midwest City":"Midwest City is in Oklahoma."}}},
{"id":"n-6dcb98ba","guard":[["hasAny",["estates","hoffman","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Hoffman Estates in":"Hoffman Estates is in Illinois."}}},
{"id":"n-6e3981eb","guard":[["hasAny",["coast","palm"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Palm Coast lies":"Palm Coast is in Florida."}}},
{"id":"n-6ef45d08","guard":[["hasAny",["burnsville","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Burnsville in":"Burnsville is in Minnesota."}}},
{"id":"n-71b98bae","guard":[["hasAny",["castro","valley"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Castro Valley lies":"Castro Valley is in California."}}},
{"id":"n-72feeda0","guard":[["hasAny",["antioch","city","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Antioch":"Antioch is in California."}}},
{"id":"n-7367aca1","guard":[["hasAny",["state","tallahassee"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Tallahassee in":"Tallahassee is in Florida."}}},
{"id":"n-76148cdc","guard":[["has","florin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Florin lies":"Florin is in California."}}},
{"id":"n-775e9e43","guard":[["has","seattle"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Seattle lies":"Seattle is in Washington."}}},
{"id":"n-78b3f8e5","guard":[["has","berkeley"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Berkeley":"Berkeley is in California."}}},
{"id":"n-7adc4cd8","guard":[["hasAny",["city","hicksville","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Hicksville":"Hicksville is in New York."}}},
{"id":"n-7c3e7f15","guard":[["has","meriden"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Meriden":"Meriden is in Connecticut."}}},
{"id":"n-7c840a6f","guard":[["hasAny",["city","frisco","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Frisco":"Frisco is in Texas."}}},
{"id":"n-7db00bc0","guard":[["has","pensacola"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Pensacola":"Pensacola is in Florida."}}},
{"id":"n-7f11ed03","guard":[["has","casper"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Casper lies":"Casper is in Wyoming."}}},
{"id":"n-7fe35109","guard":[["has","oakland"]],"pyramid":["render.template",{"lit":["Oakland ",{"slot":0}," is in Florida."]},["sense.lastWord"]],"mem":null},
{"id":"n-8258b539","guard":[["hasAny",["lies","melbourne","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Melbourne lies":"Melbourne is in Florida."}}},
{"id":"n-8323330f","guard":[["hasAny",["lies","name","state","tyler"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Tyler lies":"Tyler is in Texas."}}},
{"id":"n-84803bef","guard":[["has","kalamazoo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Kalamazoo":"Kalamazoo is in Michigan."}}},
{"id":"n-86ae7f6a","guard":[["hasAny",["oak","royal","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Royal Oak in":"Royal Oak is in Michigan."}}},
{"id":"n-877ee401","guard":[["hasAny",["city","lies","missouri","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Missouri City lies":"Missouri City is in Texas."}}},
{"id":"n-8991c111","guard":[["hasAny",["state","tonawanda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Tonawanda in":"Tonawanda is in New York."}}},
{"id":"n-8aa3a447","guard":[["hasAny",["bethesda","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Bethesda in":"Bethesda is in Maryland."}}},
{"id":"n-8aaea3a7","guard":[["has","antioch"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Antioch":"Antioch is in California."}}},
{"id":"n-8c4f61e6","guard":[["hasAny",["lies","name","state","waukegan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Waukegan lies":"Waukegan is in Illinois."}}},
{"id":"n-8cfca75b","guard":[["hasAny",["redlands","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Redlands in":"Redlands is in California."}}},
{"id":"n-8e72e44a","guard":[["hasAny",["state","tallahassee"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Tallahassee in":"Tallahassee is in Florida."}}},
{"id":"n-9202bf39","guard":[["hasAny",["janesville","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Janesville in":"Janesville is in Wisconsin."}}},
{"id":"n-924a64bf","guard":[["hasAny",["city","joseph","st","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city St. Joseph":"St. Joseph is in Missouri."}}},
{"id":"n-93f9d512","guard":[["hasAny",["milford","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Milford in":"Milford is in Connecticut."}}},
{"id":"n-9505debb","guard":[["has","chattanooga"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Chattanooga lies":"Chattanooga is in Tennessee."}}},
{"id":"n-97141eff","guard":[["hasAny",["beach","boynton","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Boynton Beach in":"Boynton Beach is in Florida."}}},
{"id":"n-996fb4ac","guard":[["has","tyler"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Tyler lies":"Tyler is in Texas."}}},
{"id":"n-9990e8ed","guard":[["hasAny",["muncie","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Muncie in":"Muncie is in Indiana."}}},
{"id":"n-99a1cdab","guard":[["has","frisco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Frisco":"Frisco is in Texas."}}},
{"id":"n-99c4f2a5","guard":[["hasAny",["lucie","port","st","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Port St. Lucie in":"Port St. Lucie is in Florida."}}},
{"id":"n-9a226b78","guard":[["has","ardenarcade"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Arden-Arcade":"Arden-Arcade is in California."}}},
{"id":"n-9ac373e0","guard":[["has","victoria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Victoria lies":"Victoria is in Texas."}}},
{"id":"n-9add1e0a","guard":[["has","springdale"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arkansas."]},["sense.lastWord"]],"mem":null},
{"id":"n-9dc54bc7","guard":[["has","greensboro"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Greensboro lies":"Greensboro is in North Carolina."}}},
{"id":"n-9e50a8cf","guard":[["hasAny",["city","des","moines","state","west"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city West Des Moines":"West Des Moines is in Iowa."}}},
{"id":"n-a01159f7","guard":[["has","paramount"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Paramount":"Paramount is in California."}}},
{"id":"n-a018c7ca","guard":[["hasAny",["aloha","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Aloha lies":"Aloha is in Oregon."}}},
{"id":"n-a01a0aa7","guard":[["hasAny",["falls","wichita"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Wichita Falls lies":"Wichita Falls is in Texas."}}},
{"id":"n-a243858c","guard":[["hasAny",["rosemead","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Rosemead in":"Rosemead is in California."}}},
{"id":"n-a452cf0f","guard":[["hasAny",["city","las","north","state","vegas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city North Las Vegas":"North Las Vegas is in Nevada."}}},
{"id":"n-a617b108","guard":[["hasAny",["castro","lies","name","state","valley"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Castro Valley lies":"Castro Valley is in California."}}},
{"id":"n-a634dd13","guard":[["hasAny",["gardena","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Gardena in":"Gardena is in California."}}},
{"id":"n-a6cd237a","guard":[["hasAny",["chattanooga","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Chattanooga lies":"Chattanooga is in Tennessee."}}},
{"id":"n-a8defeab","guard":[["hasAny",["city","joseph","st","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city St. Joseph":"St. Joseph is in Missouri."}}},
{"id":"n-a97aa43a","guard":[["hasAny",["city","rancho","rio","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Rio Rancho":"Rio Rancho is in New Mexico."}}},
{"id":"n-aac7d082","guard":[["has","kennewick"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Kennewick":"Kennewick is in Washington."}}},
{"id":"n-ad2176b8","guard":[["hasAny",["city","hendersonville","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Hendersonville":"Hendersonville is in Tennessee."}}},
{"id":"n-ae4dad8d","guard":[["hasAny",["city","monica","santa","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Santa Monica":"Santa Monica is in California."}}},
{"id":"n-ae6d59cf","guard":[["hasAny",["ardenarcade","city","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Arden-Arcade":"Arden-Arcade is in California."}}},
{"id":"n-afb5ff48","guard":[["has","jeffersonville"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Jeffersonville lies":"Jeffersonville is in Indiana."}}},
{"id":"n-b0315df1","guard":[["has","somerville"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Somerville lies":"Somerville is in Massachusetts."}}},
{"id":"n-b167e668","guard":[["has","lynwood"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Lynwood lies":"Lynwood is in California."}}},
{"id":"n-b16ae2da","guard":[["has","blacksburg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["sense.lastWord"]],"mem":null},
{"id":"n-b275ac34","guard":[["hasAny",["hammond","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Hammond in":"Hammond is in Indiana."}}},
{"id":"n-b4226a8f","guard":[["hasAny",["arcadia","city","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Arcadia":"Arcadia is in California."}}},
{"id":"n-b4ee41dd","guard":[["has","huntington"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Huntington Park":"Huntington Park is in California."}}},
{"id":"n-b8fb56d9","guard":[["hasAny",["city","paramount","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Paramount":"Paramount is in California."}}},
{"id":"n-bb889940","guard":[["hasAny",["carmel","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Carmel in":"Carmel is in Indiana."}}},
{"id":"n-bbf386e5","guard":[["hasAny",["oak","royal","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Royal Oak in":"Royal Oak is in Michigan."}}},
{"id":"n-bc150aca","guard":[["hasAny",["atlanta","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Atlanta lies":"Atlanta is in Georgia."}}},
{"id":"n-bc311ab8","guard":[["hasAny",["ceres","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Ceres in":"Ceres is in California."}}},
{"id":"n-be862bec","guard":[["hasAny",["babylon","state","west"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is West Babylon in":"West Babylon is in New York."}}},
{"id":"n-bf4910c2","guard":[["hasAny",["birmingham","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Birmingham lies":"Birmingham is in Alabama."}}},
{"id":"n-bf538713","guard":[["has","montgomery"],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["sense.lastWord"]],"mem":null},
{"id":"n-c1a3e505","guard":[["has","corona"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Corona lies":"Corona is in California."}}},
{"id":"n-c1e6a2ba","guard":[["hasAny",["denver","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Denver in":"Denver is in Colorado."}}},
{"id":"n-c34327ed","guard":[["hasAny",["lies","name","rogers","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Rogers lies":"Rogers is in Arkansas."}}},
{"id":"n-c4c4ede3","guard":[["hasAny",["lies","name","schaumburg","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Schaumburg lies":"Schaumburg is in Illinois."}}},
{"id":"n-c5a82ce1","guard":[["hasAny",["ceres","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Ceres in":"Ceres is in California."}}},
{"id":"n-c7985d42","guard":[["hasAny",["greensboro","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Greensboro lies":"Greensboro is in North Carolina."}}},
{"id":"n-c79f8e5a","guard":[["has","arcadia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Arcadia":"Arcadia is in California."}}},
{"id":"n-cc08498e","guard":[["has","schaumburg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Schaumburg lies":"Schaumburg is in Illinois."}}},
{"id":"n-ccfcfe87","guard":[["hasAny",["euclid","lies","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Euclid lies":"Euclid is in Ohio."}}},
{"id":"n-cd2daa27","guard":[["hasAny",["city","pensacola","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Pensacola":"Pensacola is in Florida."}}},
{"id":"n-cd55f430","guard":[["has","rogers"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Rogers lies":"Rogers is in Arkansas."}}},
{"id":"n-cda35e09","guard":[["hasAny",["milford","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Milford in":"Milford is in Connecticut."}}},
{"id":"n-cdd10fa9","guard":[["hasAny",["falls","lies","name","state","wichita"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Wichita Falls lies":"Wichita Falls is in Texas."}}},
{"id":"n-d08bbcde","guard":[["hasAny",["berkeley","city","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Berkeley":"Berkeley is in California."}}},
{"id":"n-d1f5c1d4","guard":[["hasAny",["city","monica","santa","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Santa Monica":"Santa Monica is in California."}}},
{"id":"n-d2abecd2","guard":[["has","elkhart"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Elkhart lies":"Elkhart is in Indiana."}}},
{"id":"n-d6ec4720","guard":[["hasAny",["city","creek","state","walnut"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Walnut Creek":"Walnut Creek is in California."}}},
{"id":"n-d86e9e5d","guard":[["has","hicksville"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["sense.lastWord"]],"mem":null},
{"id":"n-d9d776ed","guard":[["hasAny",["city","rancho","rio","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Rio Rancho":"Rio Rancho is in New Mexico."}}},
{"id":"n-dccc7612","guard":[["has","club"],["has","in"]],"pyramid":["render.template",{"lit":["Country ",{"slot":0}," is in Florida."]},["sense.lastWord"]],"mem":null},
{"id":"n-dce1dfec","guard":[["hasAny",["city","state","yuba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which US state is Yuba City in":"Yuba City is in California."}}},
{"id":"n-dd5dd6e6","guard":[["has","fall"]],"pyramid":["render.template",{"lit":["Fall ",{"slot":0}," is in Massachusetts."]},["sense.lastWord"]],"mem":null},
{"id":"n-dd774665","guard":[["hasAny",["county","lies","maconbibb","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Macon-Bibb County lies":"Macon-Bibb County is in Georgia."}}},
{"id":"n-df7f9fb4","guard":[["has","montgomery"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Montgomery":"Montgomery is in Alabama."}}},
{"id":"n-dfb7e1f4","guard":[["hasAny",["city","state","wauwatosa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Wauwatosa":"Wauwatosa is in Wisconsin."}}},
{"id":"n-e0405f83","guard":[["hasAny",["blacksburg","city","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Blacksburg":"Blacksburg is in Virginia."}}},
{"id":"n-e11d201d","guard":[["hasAny",["city","huntington","park","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Huntington Park":"Huntington Park is in California."}}},
{"id":"n-e33014c5","guard":[["has","ardenarcade"]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["sense.lastWord"]],"mem":null},
{"id":"n-e34781b3","guard":[["hasAny",["buckeye","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Buckeye in":"Buckeye is in Arizona."}}},
{"id":"n-e3a6a5d1","guard":[["hasAny",["gardena","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Gardena in":"Gardena is in California."}}},
{"id":"n-e74ea1e9","guard":[["hasAny",["meridian","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Meridian in":"Meridian is in Idaho."}}},
{"id":"n-e82192f2","guard":[["hasAny",["city","kennewick","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Kennewick":"Kennewick is in Washington."}}},
{"id":"n-ecc7037c","guard":[["has","enterprise"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Enterprise":"Enterprise is in Nevada."}}},
{"id":"n-ed0d0a53","guard":[["has","springdale"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Springdale":"Springdale is in Arkansas."}}},
{"id":"n-ee2be443","guard":[["has","anaheim"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Anaheim lies":"Anaheim is in California."}}},
{"id":"n-ef037eeb","guard":[["has","wauwatosa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Wauwatosa":"Wauwatosa is in Wisconsin."}}},
{"id":"n-ef60565b","guard":[["has","atlanta"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Atlanta lies":"Atlanta is in Georgia."}}},
{"id":"n-ef8ddb12","guard":[["hasAny",["hill","spring","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which US state is Spring Hill in":"Spring Hill is in Florida."}}},
{"id":"n-ef9564cc","guard":[["hasAny",["lies","lynwood","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Lynwood lies":"Lynwood is in California."}}},
{"id":"n-effe0e30","guard":[["has","waukesha"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Waukesha lies":"Waukesha is in Wisconsin."}}},
{"id":"n-f1637948","guard":[["has","frisco"],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["sense.lastWord"]],"mem":null},
{"id":"n-f1c600af","guard":[["hasAny",["city","enterprise","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Enterprise":"Enterprise is in Nevada."}}},
{"id":"n-f42aefa2","guard":[["hasAny",["city","hills","rochester","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state is the city Rochester Hills":"Rochester Hills is in Michigan."}}},
{"id":"n-f73fb3e3","guard":[["has","rochester"],["has","in"]],"pyramid":["render.template",{"lit":["Rochester ",{"slot":0}," is in Michigan."]},["sense.lastWord"]],"mem":null},
{"id":"n-f7d337e9","guard":[["has","blacksburg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state is the city Blacksburg":"Blacksburg is in Virginia."}}},
{"id":"n-fb19fb4a","guard":[["hasAny",["lies","name","state","victoria"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Victoria lies":"Victoria is in Texas."}}},
{"id":"n-fbf8ee16","guard":[["has","anchorage"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Anchorage lies":"Anchorage is in Alaska."}}},
{"id":"n-fc446253","guard":[["has","birmingham"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state where Birmingham lies":"Birmingham is in Alabama."}}},
{"id":"n-fcd0a268","guard":[["hasAny",["coast","lies","name","palm","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state where Palm Coast lies":"Palm Coast is in Florida."}}},
{"id":"n-00ae84e0","guard":[["hasAny",["longest","longest one","longest word","midwest"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," City is in Oklahoma."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0461772a","guard":[["hasAny",["invert case","springdale","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arkansas."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0e63ba71","guard":[["hasAny",["ardenarcade","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-171a6df1","guard":[["hasAny",["lower case","lowercase","montgomery","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1d0ea40c","guard":[["hasAny",["lawton","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oklahoma."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1e160cd5","guard":[["hasAny",["blacksburg","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1e7e154e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hicksville","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1ec57b9c","guard":[["hasAny",["anchorage","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alaska."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-1fad2a2f","guard":[["hasAny",["all caps","capital letters","capitals","hicksville","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-21f0a11e","guard":[["hasAny",["creek","longest","longest one","longest word"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," Creek is in California."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2833204d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","meriden","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-289fbde7","guard":[["hasAny",["longest","longest one","longest word","rancho"]],["has","in"]],"pyramid":["render.template",{"lit":["Rio ",{"slot":0}," is in New Mexico."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2fc02fc0","guard":[["hasAny",["ardenarcade","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-300d8c34","guard":[["hasAny",["huntington","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," Park is in California."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-30d32c44","guard":[["hasAny",["blacksburg","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3229cc65","guard":[["hasAny",["all caps","capital letters","capitals","upper case","uppercase","wauwatosa"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-33355aec","guard":[["hasAny",["longest","longest one","longest word","missouri"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," City is in Texas."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-34da7fea","guard":[["hasAny",["buckeye","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arizona."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3536086c","guard":[["hasAny",["all caps","blacksburg","capital letters","capitals","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-36af3778","guard":[["hasAny",["lawton","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oklahoma."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-3932ec16","guard":[["hasAny",["lower case","lowercase","meriden","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3a96557a","guard":[["hasAny",["longest","longest one","longest word","monica"]]],"pyramid":["render.template",{"lit":["Santa ",{"slot":0}," is in California."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3aca3800","guard":[["hasAny",["babylon","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["West ",{"slot":0}," is in New York."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3bb3157b","guard":[["hasAny",["hendersonville","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-42d02eee","guard":[["hasAny",["all caps","ardenarcade","capital letters","capitals","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-436f217b","guard":[["hasAny",["frisco","invert case","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-45adfaa6","guard":[["hasAny",["invert case","meriden","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-46050a7b","guard":[["hasAny",["blacksburg","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-50408d05","guard":[["hasAny",["beach","longest","longest one","longest word"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," Beach is in Florida."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-54b375fa","guard":[["hasAny",["bethesda","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Maryland."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-5c9d326c","guard":[["hasAny",["lansing","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["East ",{"slot":0}," is in Michigan."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5da1fe17","guard":[["hasAny",["capitalise","capitalize","capitalize each word","montgomery","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5ec874e5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kennewick","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-66262f44","guard":[["hasAny",["falls","longest","longest one","longest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Falls is in Texas."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-678744b9","guard":[["hasAny",["longest","longest one","longest word","meridian"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Idaho."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-739b9987","guard":[["hasAny",["lower case","lowercase","small letters","wauwatosa"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7aa49c52","guard":[["hasAny",["invert case","kennewick","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7fa1158f","guard":[["hasAny",["estates","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Estates is in Illinois."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-83e7f8e2","guard":[["hasAny",["hicksville","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-875fcdc1","guard":[["hasAny",["blacksburg","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-8aa19063","guard":[["hasAny",["lower case","lowercase","small letters","springdale"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arkansas."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-90f1e7fc","guard":[["hasAny",["all caps","capital letters","capitals","hendersonville","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-92241bb6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","wauwatosa"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-922fc8ff","guard":[["hasAny",["longest","longest one","longest word","sierra"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," Vista is in Arizona."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9254684a","guard":[["hasAny",["hicksville","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-926c74e9","guard":[["hasAny",["enterprise","longest","longest one","longest word"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Nevada."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-98d9a874","guard":[["hasAny",["kennewick","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9a39eba4","guard":[["hasAny",["bethesda","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Maryland."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a5dd937f","guard":[["hasAny",["hill","longest","longest one","longest word"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," Hill is in Florida."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a7394391","guard":[["hasAny",["frisco","lower case","lowercase","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a7686543","guard":[["hasAny",["invert case","swap case","toggle case","wauwatosa"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a880b9e5","guard":[["hasAny",["buckeye","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arizona."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-a8e55813","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hendersonville","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a9d3a143","guard":[["hasAny",["capitalise","capitalize","capitalize each word","frisco","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ae053a20","guard":[["hasAny",["all caps","capital letters","capitals","kennewick","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-ae23ec93","guard":[["hasAny",["casper","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wyoming."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-ae5d2bd5","guard":[["hasAny",["invert case","montgomery","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b1aa2690","guard":[["hasAny",["all caps","capital letters","capitals","springdale","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arkansas."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b3e64f28","guard":[["hasAny",["burnsville","longest","longest one","longest word"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Minnesota."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b47ca34f","guard":[["hasAny",["all caps","capital letters","capitals","meriden","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-baa66527","guard":[["hasAny",["casper","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wyoming."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-be4858ab","guard":[["hasAny",["burnsville","longest","longest one","longest word"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Minnesota."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-c84027c7","guard":[["hasAny",["enterprise","longest","longest one","longest word"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Nevada."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c949cdee","guard":[["hasAny",["all caps","capital letters","capitals","frisco","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-ce825310","guard":[["hasAny",["longest","longest one","longest word","oakland"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Park is in Florida."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cf845ec0","guard":[["hasAny",["all caps","capital letters","capitals","montgomery","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-d51bdbf0","guard":[["hasAny",["longest","longest one","longest word","meridian"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Idaho."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d842da00","guard":[["hasAny",["anchorage","longest","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alaska."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d851c1ce","guard":[["hasAny",["longest","longest one","longest word","nashua"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New Hampshire."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-dec76954","guard":[["hasAny",["capitalise","capitalize","capitalize each word","springdale","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arkansas."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e362a8d5","guard":[["hasAny",["hendersonville","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ead47c52","guard":[["hasAny",["hartford","longest","longest one","longest word"]],["has","name"]],"pyramid":["render.template",{"lit":["East ",{"slot":0}," is in Connecticut."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f13d9566","guard":[["hasAny",["club","longest","longest one","longest word"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," Club is in Florida."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f4d736ee","guard":[["hasAny",["blacksburg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f5d8a525","guard":[["hasAny",["ardenarcade","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f6d7cc1c","guard":[["hasAny",["castro","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Valley is in California."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fbb01285","guard":[["hasAny",["longest","longest one","longest word","nashua"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New Hampshire."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-00b3f999","guard":[["hasAny",["babylon","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Babylon is in New York."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-04ef7cb5","guard":[["hasAny",["buckeye","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arizona."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0976998d","guard":[["hasAny",["item number","lansing","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Lansing is in Michigan."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-13b0825e","guard":[["hasAny",["blacksburg","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1b270623","guard":[["hasAny",["item number","nth","position","tallahassee"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Florida."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1dbbb26c","guard":[["hasAny",["anchorage","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alaska."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1df13112","guard":[["hasAny",["item number","janesville","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1ef48ada","guard":[["hasAny",["bethesda","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Maryland."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1f5d9240","guard":[["hasAny",["item number","nth","position","yuba"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," City is in California."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-230a9cc7","guard":[["hasAny",["delete","meriden","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Connecticut"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-2a980302","guard":[["hasAny",["longest","longest one","longest word","sierra"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-2f01303a","guard":[["hasAny",["ardenarcade","each word","split into words"]]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-30786d00","guard":[["hasAny",["item number","nth","position","rancho"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," Rancho is in New Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3b0dbcb0","guard":[["hasAny",["item number","meridian","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Idaho."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3c8241b9","guard":[["hasAny",["longest","longest one","longest word","rochester"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-416b6951","guard":[["hasAny",["item number","nth","position","rogers"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arkansas."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-41a2f1e7","guard":[["hasAny",["dayton","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ohio."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-42caae87","guard":[["hasAny",["item number","nth","oak","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," Oak is in Michigan."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-43ee87b3","guard":[["hasAny",["burnsville","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Minnesota."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-44acfe41","guard":[["hasAny",["atlanta","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Georgia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-48768f8c","guard":[["hasAny",["item number","lawton","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oklahoma."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4c552deb","guard":[["hasAny",["casper","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wyoming."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4fc32075","guard":[["hasAny",["longest","longest one","longest word","rochester"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["aggregate.longest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-5e915445","guard":[["hasAny",["birmingham","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-60d8a5e0","guard":[["hasAny",["county","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Macon-Bibb ",{"slot":0}," is in Georgia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6169b233","guard":[["hasAny",["ardenarcade","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-66889325","guard":[["hasAny",["enterprise","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Nevada."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6b87816e","guard":[["hasAny",["item number","nth","peters","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},". Peters is in Missouri."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6dc1b0b7","guard":[["hasAny",["item number","nashua","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New Hampshire."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6f6be03e","guard":[["hasAny",["each word","split into words","springdale"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arkansas."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-71a5e337","guard":[["hasAny",["burnsville","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Minnesota."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-73dd54f4","guard":[["hasAny",["coast","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":["Palm ",{"slot":0}," is in Florida."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-743eac29","guard":[["hasAny",["longest","longest one","longest word","sierra"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-75a34ad0","guard":[["hasAny",["each word","kennewick","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-78080c44","guard":[["hasAny",["item number","nth","position","seattle"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Washington."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-79928cbc","guard":[["hasAny",["falls","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Wichita ",{"slot":0}," is in Texas."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7fcce956","guard":[["hasAny",["item number","nth","position","yuba"]],["has","us"]],"pyramid":["render.template",{"lit":["Yuba ",{"slot":0}," is in California."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-83c2febf","guard":[["hasAny",["item number","joseph","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},". Joseph is in Missouri."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8876ade3","guard":[["hasAny",["each word","montgomery","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alabama."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8ac42db6","guard":[["hasAny",["delete","frisco","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Texas"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-8c8add9d","guard":[["hasAny",["delete","frisco","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Texas"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-8f1bf320","guard":[["hasAny",["aloha","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oregon."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9172af64","guard":[["hasAny",["delete","remove","strip out","valdosta","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Georgia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-9498ef4d","guard":[["hasAny",["item number","nth","position","vineland"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New Jersey."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-961ded71","guard":[["hasAny",["farmington","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Farmington ",{"slot":0}," is in Michigan."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-96f1a79d","guard":[["hasAny",["longest","longest one","longest word","midwest"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oklahoma."]},["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-971d45be","guard":[["hasAny",["delete","milford","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Connecticut"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-9bff0761","guard":[["hasAny",["delete","estates","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Illinois"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-9eb7bd90","guard":[["hasAny",["anchorage","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Alaska."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9f1444c1","guard":[["hasAny",["item number","milford","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a0081275","guard":[["hasAny",["coast","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," Coast is in Florida."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a304de17","guard":[["hasAny",["item number","missouri","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Missouri ",{"slot":0}," is in Texas."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a95af5f3","guard":[["hasAny",["item number","midwest","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Midwest ",{"slot":0}," is in Oklahoma."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-ada001c8","guard":[["hasAny",["item number","nth","position","tonawanda"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-aef2f2c0","guard":[["hasAny",["bethesda","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Maryland."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b0bfad3f","guard":[["hasAny",["item number","meriden","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b5143735","guard":[["hasAny",["dearborn","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Michigan."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b638d5ee","guard":[["hasAny",["each word","meriden","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b8b43dc9","guard":[["hasAny",["item number","monica","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Monica is in California."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bb7c5df6","guard":[["hasAny",["hartford","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Hartford is in Connecticut."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-be214f1e","guard":[["hasAny",["each word","hendersonville","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bf71d624","guard":[["hasAny",["item number","meridian","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Idaho."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-bf928e2a","guard":[["hasAny",["each word","split into words","wauwatosa"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wisconsin."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c49d3d32","guard":[["hasAny",["item number","nth","position","valdosta"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Georgia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c7820a47","guard":[["hasAny",["item number","nashua","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New Hampshire."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-cb6c2fd8","guard":[["hasAny",["ardenarcade","each word","split into words"]]],"pyramid":["render.template",{"lit":["Arden-",{"slot":0}," is in California."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cbceb20c","guard":[["hasAny",["delete","estates","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Illinois"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-d046976c","guard":[["hasAny",["item number","nth","position","tonawanda"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d08a5465","guard":[["hasAny",["hill","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":["Spring ",{"slot":0}," is in Florida."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d4148925","guard":[["hasAny",["casper","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Wyoming."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d4a0c6d0","guard":[["hasAny",["item number","milford","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Connecticut."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d7770660","guard":[["hasAny",["buckeye","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Arizona."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d9375a66","guard":[["hasAny",["castro","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Castro ",{"slot":0}," is in California."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dc8f027c","guard":[["hasAny",["blacksburg","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Virginia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-df23ce76","guard":[["hasAny",["each word","frisco","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Texas."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e137cf03","guard":[["hasAny",["beach","item number","nth","position"]],["has","us"]],"pyramid":["render.template",{"lit":["Boynton ",{"slot":0}," is in Florida."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e1bb52b8","guard":[["hasAny",["item number","nth","passaic","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New Jersey."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e41efc7e","guard":[["hasAny",["aloha","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Oregon."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e6aded3c","guard":[["hasAny",["each word","hicksville","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in New York."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ee2815ee","guard":[["hasAny",["euclid","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Ohio."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-eeebc6b8","guard":[["hasAny",["chattanooga","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Tennessee."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f2680145","guard":[["hasAny",["fall","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," River is in Massachusetts."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f5359e0b","guard":[["hasAny",["delete","remove","strip out","valdosta","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Georgia"},["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-f53d6fa8","guard":[["hasAny",["item number","nth","position","somerville"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Massachusetts."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f758b613","guard":[["hasAny",["estates","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Hoffman ",{"slot":0}," is in Illinois."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fc3ebd35","guard":[["hasAny",["item number","nth","oak","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Royal ",{"slot":0}," is in Michigan."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-13c040d5","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","rochester","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-18e4c896","guard":[["hasAny",["hill","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-235ce18a","guard":[["hasAny",["item number","las","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," Las ",{"slot":1}," is in Nevada."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-2bb3d324","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","rochester","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-32d5c816","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","midwest","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oklahoma."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-4e7c07da","guard":[["hasAny",["babylon","longest","longest one","longest word","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New York."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5041ea8b","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","sierra","small letters"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5de0be82","guard":[["hasAny",["item number","nth","position","sierra"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-68fd2f80","guard":[["hasAny",["invert case","longest","longest one","longest word","sierra","swap case","toggle case"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7516a987","guard":[["hasAny",["item number","las","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["North ",{"slot":0}," ",{"slot":1}," is in Nevada."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-7d14b327","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","sierra","title case"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8bf38ab9","guard":[["hasAny",["lansing","longest","longest one","longest word","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b2f63c28","guard":[["hasAny",["item number","joseph","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-b7df3afe","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","midwest","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oklahoma."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ba34ce4f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","midwest","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oklahoma."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c03f814e","guard":[["hasAny",["invert case","longest","longest one","longest word","rochester","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c12cbf97","guard":[["hasAny",["invert case","longest","longest one","longest word","midwest","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oklahoma."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e82b9e91","guard":[["hasAny",["fall","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Massachusetts."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-ebf44d6f","guard":[["hasAny",["item number","nth","position","rochester"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-f93e8add","guard":[["hasAny",["item number","nth","position","rancho"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-fe1820cb","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","sierra","upper case","uppercase"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-fe34c964","guard":[["hasAny",["longest","longest one","longest word","rancho","shortest","shortest one","shortest word"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New Mexico."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ff819b80","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","rochester","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0064bb42","guard":[["hasAny",["item number","longest","longest one","longest word","midwest","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oklahoma."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-105b5966","guard":[["hasAny",["hartford","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Connecticut."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-11e5650a","guard":[["hasAny",["item number","longest","longest one","longest word","nth","peters","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-162208be","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fall","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Massachusetts."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1b258633","guard":[["hasAny",["each word","longest","longest one","longest word","midwest","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oklahoma."]},["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1c2ce938","guard":[["hasAny",["estates","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Illinois."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-329328c3","guard":[["hasAny",["hartford","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Connecticut."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3413a13f","guard":[["hasAny",["fall","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Massachusetts."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-386ee0c0","guard":[["hasAny",["each word","longest","longest one","longest word","rochester","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3c58b337","guard":[["hasAny",["des","item number","longest","longest one","longest word","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," Des ",{"slot":1}," is in Iowa."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3e949492","guard":[["hasAny",["all caps","capital letters","capitals","item number","joseph","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3f17fea0","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yuba"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3fe8bfcd","guard":[["hasAny",["all caps","capital letters","capitals","fall","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Massachusetts."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-40b42dab","guard":[["hasAny",["item number","lansing","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-45210f65","guard":[["hasAny",["invert case","item number","nth","position","rancho","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-54616fa6","guard":[["hasAny",["item number","longest","longest one","longest word","nth","peters","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-57b0eb50","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","rancho","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-5a64f371","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","rancho"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5f941078","guard":[["hasAny",["item number","joseph","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-62a630b4","guard":[["hasAny",["item number","lansing","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-65f808eb","guard":[["hasAny",["estates","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Illinois."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-67efd7c6","guard":[["hasAny",["farmington","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6bf3426c","guard":[["hasAny",["item number","longest","longest one","longest word","luis","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," Luis ",{"slot":1}," is in California."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6cac84cb","guard":[["hasAny",["item number","longest","longest one","longest word","nth","peters","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-7b336b17","guard":[["hasAny",["invert case","item number","joseph","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8a0478f5","guard":[["hasAny",["each word","longest","longest one","longest word","rochester","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8f0a77ae","guard":[["hasAny",["fall","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Massachusetts."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-950a35f0","guard":[["hasAny",["des","item number","longest","longest one","longest word","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["West ",{"slot":0}," ",{"slot":1}," is in Iowa."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9cbb0cca","guard":[["hasAny",["each word","longest","longest one","longest word","sierra","split into words"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9ebca9e0","guard":[["hasAny",["item number","longest","longest one","longest word","midwest","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oklahoma."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a8968ed8","guard":[["hasAny",["babylon","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New York."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-abde0269","guard":[["hasAny",["item number","nth","oak","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ace2c9dd","guard":[["hasAny",["hartford","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Connecticut."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-b1da0b9c","guard":[["hasAny",["each word","longest","longest one","longest word","sierra","split into words"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b3039f68","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","rancho"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-b3fc4dd2","guard":[["hasAny",["each word","longest","longest one","longest word","midwest","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oklahoma."]},["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b64fb170","guard":[["hasAny",["farmington","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c5984de0","guard":[["hasAny",["babylon","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New York."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c741c13e","guard":[["hasAny",["item number","lansing","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-c7c79512","guard":[["hasAny",["item number","lower case","lowercase","nth","position","rancho","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-db221408","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","rochester"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Michigan."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-dd5d8a7c","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","sierra"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Arizona."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-dfd5d116","guard":[["hasAny",["item number","joseph","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e25a4f3f","guard":[["hasAny",["item number","longest","longest one","longest word","luis","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["San ",{"slot":0}," ",{"slot":1}," is in California."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e685106e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","rancho","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-eb7b489f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","joseph","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f9052765","guard":[["hasAny",["item number","joseph","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-ff42336a","guard":[["hasAny",["babylon","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New York."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-06e12246","guard":[["hasAny",["coast","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Florida."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-10583b3f","guard":[["hasAny",["fall","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Massachusetts."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-1449e4d3","guard":[["hasAny",["item number","las","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Vegas is in Nevada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2735940c","guard":[["hasAny",["each word","item number","joseph","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3047bcbf","guard":[["hasAny",["item number","nth","position","yuba"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-440ac612","guard":[["hasAny",["each word","item number","nth","position","rancho","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4c7d87a0","guard":[["hasAny",["item number","nth","peters","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5f6c7577","guard":[["hasAny",["item number","lucie","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1},". Lucie is in Florida."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-61acca05","guard":[["hasAny",["item number","nth","position","yuba"]],["has","us"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-620846ac","guard":[["hasAny",["estates","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Illinois."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-658fcb67","guard":[["hasAny",["each word","fall","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Massachusetts."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6fa5bec7","guard":[["hasAny",["each word","item number","joseph","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0},". ",{"slot":1}," is in Missouri."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-713b7ba6","guard":[["hasAny",["des","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Moines is in Iowa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7f3a8ff6","guard":[["hasAny",["each word","item number","nth","position","rancho","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New Mexico."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-89d43ddc","guard":[["hasAny",["item number","las","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Nevada."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-8c7b1bb5","guard":[["hasAny",["item number","lucie","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," St. ",{"slot":1}," is in Florida."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8f5b75d4","guard":[["hasAny",["each word","fall","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Massachusetts."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9f97584c","guard":[["hasAny",["castro","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in California."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a00fd027","guard":[["hasAny",["item number","lucie","nth","position"]]],"pyramid":["render.template",{"lit":["Port ",{"slot":0},". ",{"slot":1}," is in Florida."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a3e56bc8","guard":[["hasAny",["fall","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Massachusetts."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-af4c20fd","guard":[["hasAny",["babylon","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in New York."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b4778bf5","guard":[["hasAny",["estates","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Illinois."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c22dcd10","guard":[["hasAny",["east","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Connecticut."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c2e524ba","guard":[["hasAny",["item number","luis","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Obispo is in California."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ceec4381","guard":[["hasAny",["item number","midwest","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Oklahoma."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1ca16326","guard":[["hasAny",["item number","longest","longest one","longest word","luis","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in California."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-5a2b3b1e","guard":[["hasAny",["des","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Iowa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-60851d92","guard":[["hasAny",["item number","las","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Nevada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-7c306ccd","guard":[["hasAny",["des","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Iowa."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-08ff97f3","guard":[["hasAny",["item number","longest","longest one","longest word","luis","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in California."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0c5486cf","guard":[["hasAny",["des","invert case","item number","nth","position","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Iowa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2a1cd639","guard":[["hasAny",["item number","lucie","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1},". ",{"slot":2}," is in Florida."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-36c4a957","guard":[["hasAny",["item number","longest","longest one","longest word","luis","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in California."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-6fa774cd","guard":[["hasAny",["des","item number","longest","longest one","longest word","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Iowa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-8358d3e8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","las","nth","position","title case"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Nevada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9552e62f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","des","item number","nth","position","title case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Iowa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b5215ec2","guard":[["hasAny",["invert case","item number","las","nth","position","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Nevada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-cae6e3c0","guard":[["hasAny",["des","item number","lower case","lowercase","nth","position","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Iowa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d1573d1c","guard":[["hasAny",["all caps","capital letters","capitals","des","item number","nth","position","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Iowa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e1e82d8c","guard":[["hasAny",["des","item number","longest","longest one","longest word","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Iowa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e5bd6902","guard":[["hasAny",["item number","longest","longest one","longest word","luis","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in California."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-efeef1bb","guard":[["hasAny",["all caps","capital letters","capitals","item number","las","nth","position","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Nevada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f4b35ff4","guard":[["hasAny",["item number","las","lower case","lowercase","nth","position","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Nevada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-07f4326c","guard":[["hasAny",["des","each word","item number","nth","position","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Iowa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-237e3efa","guard":[["hasAny",["item number","las","normalise","normalize","nth","position","simplify the text"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Nevada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2db82dd5","guard":[["hasAny",["item number","luis","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in California."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4f4bacdb","guard":[["hasAny",["each word","item number","las","nth","position","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Nevada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7602d9ea","guard":[["hasAny",["des","each word","item number","nth","position","split into words"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Iowa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-988c1b71","guard":[["hasAny",["each word","item number","las","nth","position","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Nevada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9f11f6db","guard":[["hasAny",["item number","lucie","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1},". ",{"slot":2}," is in Florida."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a2fec475","guard":[["hasAny",["item number","las","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Nevada."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-dfcb483c","guard":[["hasAny",["item number","lucie","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1},". ",{"slot":2}," is in Florida."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the state where Melbourne lies","expect":{"contains":["Florida"],"notRefusal":true}},{"q":"in what state is the city Arden-Arcade","expect":{"contains":["California"],"notRefusal":true}},{"q":"name the state where Castro Valley lies","expect":{"contains":["California"],"notRefusal":true}},{"q":"which US state is Carmel in","expect":{"contains":["Indiana"],"notRefusal":true}},{"q":"which US state is Farmington Hills in","expect":{"contains":["Michigan"],"notRefusal":true}},{"q":"in what state is the city Antioch","expect":{"contains":["California"],"notRefusal":true}},{"q":"name the state where Tyler lies","expect":{"contains":["Texas"],"notRefusal":true}},{"q":"in what state is the city Hendersonville","expect":{"contains":["Tennessee"],"notRefusal":true}},{"q":"which US state is Carson in","expect":{"contains":["California"],"notRefusal":true}},{"q":"which US state is Denver in","expect":{"contains":["Colorado"],"notRefusal":true}},{"q":"in what state is the city St. Joseph","expect":{"contains":["Missouri"],"notRefusal":true}},{"q":"which US state is Milford in","expect":{"contains":["Connecticut"],"notRefusal":true}},{"q":"which US state is Boynton Beach in","expect":{"contains":["Florida"],"notRefusal":true}},{"q":"name the state where Dearborn lies","expect":{"contains":["Michigan"],"notRefusal":true}},{"q":"in what state is the city Oakland Park","expect":{"contains":["Florida"],"notRefusal":true}},{"q":"which US state is Hammond in","expect":{"contains":["Indiana"],"notRefusal":true}},{"q":"name the state where Schaumburg lies","expect":{"contains":["Illinois"],"notRefusal":true}},{"q":"which US state is Lawton in","expect":{"contains":["Oklahoma"],"notRefusal":true}},{"q":"in what state is the city Springdale","expect":{"contains":["Arkansas"],"notRefusal":true}},{"q":"in what state is the city Pensacola","expect":{"contains":["Florida"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
