// emoji-name-shortcode-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"emoji-name-shortcode-neo-g6","class":"emoji-name-shortcode","generation":6,"lane":"neo","grownFrom":["which shortcode writes the shield emoji","give the GitHub shortcode for keyboard","what is the shortcode of the person kneeling emoji","give the GitHub shortcode for face with diagonal mouth","give the GitHub shortcode for flag: Sierra Leone","what is the shortcode of the deer emoji","which shortcode writes the red apple emoji","give the GitHub shortcode for frog","what is the shortcode of the flag: British Virgin Islands emoji","give the GitHub shortcode for crossed flags","give the GitHub shortcode for socks","which shortcode writes the globe showing Asia-Australia emoji","give the GitHub shortcode for family: man, woman, girl, boy","give the GitHub shortcode for Mrs. Claus","give the GitHub shortcode for tent","give the GitHub shortcode for flag: South Africa","give the GitHub shortcode for carousel horse","which shortcode writes the flag: England emoji","which shortcode writes the chart increasing with yen emoji","what is the shortcode of the sheaf of rice emoji"],"version":1});

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
{"id":"n-043196ef","guard":[["has","shortcode"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the shield emoji":"shield","give the GitHub shortcode for keyboard":"keyboard","what is the shortcode of the person kneeling emoji":"kneeling_person","give the GitHub shortcode for face with diagonal mouth":"face_with_diagonal_mouth","give the GitHub shortcode for flag: Sierra Leone":"sierra_leone","what is the shortcode of the deer emoji":"deer","which shortcode writes the red apple emoji":"apple","give the GitHub shortcode for frog":"frog","what is the shortcode of the flag: British Virgin Islands emoji":"british_virgin_islands","give the GitHub shortcode for crossed flags":"crossed_flags","give the GitHub shortcode for socks":"socks","which shortcode writes the globe showing Asia-Australia emoji":"earth_asia","give the GitHub shortcode for family: man, woman, girl, boy":"family_man_woman_girl_boy","give the GitHub shortcode for Mrs. Claus":"mrs_claus","give the GitHub shortcode for tent":"tent","give the GitHub shortcode for flag: South Africa":"south_africa","give the GitHub shortcode for carousel horse":"carousel_horse","which shortcode writes the flag: England emoji":"england","which shortcode writes the chart increasing with yen emoji":"chart","what is the shortcode of the sheaf of rice emoji":"ear_of_rice","give the GitHub shortcode for tropical drink":"tropical_drink","what is the shortcode of the index pointing at the viewer emoji":"index_pointing_at_the_viewer","what is the shortcode of the flag: St. Helena emoji":"st_helena","give the GitHub shortcode for office worker":"office_worker","which shortcode writes the palm down hand emoji":"palm_down_hand","which shortcode writes the flag: Réunion emoji":"reunion","what is the shortcode of the megaphone emoji":"mega","what is the shortcode of the fast down button emoji":"arrow_double_down","which shortcode writes the sled emoji":"sled","what is the shortcode of the speedboat emoji":"speedboat","give the GitHub shortcode for tulip":"tulip","give the GitHub shortcode for fire":"fire","which shortcode writes the trackball emoji":"trackball","which shortcode writes the women’s room emoji":"womens","what is the shortcode of the man: red hair emoji":"red_haired_man","which shortcode writes the person in steamy room emoji":"sauna_person","what is the shortcode of the flag: Hungary emoji":"hungary","what is the shortcode of the woman getting haircut emoji":"haircut_woman","what is the shortcode of the troll emoji":"troll","what is the shortcode of the framed picture emoji":"framed_picture","what is the shortcode of the snake emoji":"snake","what is the shortcode of the hook emoji":"hook","what is the shortcode of the woman facepalming emoji":"woman_facepalming","give the GitHub shortcode for blue square":"blue_square","give the GitHub shortcode for flag: Burkina Faso":"burkina_faso","which shortcode writes the snow-capped mountain emoji":"mountain_snow","what is the shortcode of the toothbrush emoji":"toothbrush","what is the shortcode of the flag: Monaco emoji":"monaco","which shortcode writes the man farmer emoji":"man_farmer","which shortcode writes the coffin emoji":"coffin","what is the shortcode of the pouting cat emoji":"pouting_cat","what is the shortcode of the safety pin emoji":"safety_pin","give the GitHub shortcode for flag: Svalbard & Jan Mayen":"svalbard_jan_mayen","give the GitHub shortcode for guide dog":"guide_dog","what is the shortcode of the face with tears of joy emoji":"joy","give the GitHub shortcode for person facepalming":"facepalm","what is the shortcode of the aerial tramway emoji":"aerial_tramway","which shortcode writes the hand with index finger and thumb crossed emoji":"hand_with_index_finger_and_thumb_crossed","give the GitHub shortcode for teddy bear":"teddy_bear","what is the shortcode of the woman: bald emoji":"bald_woman","give the GitHub shortcode for supervillain":"supervillain","give the GitHub shortcode for kaaba":"kaaba","give the GitHub shortcode for dagger":"dagger","what is the shortcode of the full moon face emoji":"full_moon_with_face","which shortcode writes the END arrow emoji":"end","which shortcode writes the flag: Paraguay emoji":"paraguay","what is the shortcode of the zombie emoji":"zombie","give the GitHub shortcode for relieved face":"relieved","which shortcode writes the thought balloon emoji":"thought_balloon","give the GitHub shortcode for baby bottle":"baby_bottle","which shortcode writes the ship emoji":"ship","give the GitHub shortcode for floppy disk":"floppy_disk","which shortcode writes the man construction worker emoji":"construction_worker_man","give the GitHub shortcode for mango":"mango","which shortcode writes the chopsticks emoji":"chopsticks","what is the shortcode of the mosque emoji":"mosque","give the GitHub shortcode for flag: Madagascar":"madagascar","what is the shortcode of the flag: Nepal emoji":"nepal","give the GitHub shortcode for fountain":"fountain","which shortcode writes the woman farmer emoji":"woman_farmer","which shortcode writes the inbox tray emoji":"inbox_tray","what is the shortcode of the roller coaster emoji":"roller_coaster","which shortcode writes the baby symbol emoji":"baby_symbol","what is the shortcode of the woman zombie emoji":"zombie_woman","which shortcode writes the check box with check emoji":"ballot_box_with_check","what is the shortcode of the flag: United Nations emoji":"united_nations","give the GitHub shortcode for no bicycles":"no_bicycles","which shortcode writes the handshake emoji":"handshake","what is the shortcode of the face with raised eyebrow emoji":"raised_eyebrow","which shortcode writes the man police officer emoji":"policeman","which shortcode writes the closed mailbox with lowered flag emoji":"mailbox_closed","which shortcode writes the fast reverse button emoji":"rewind","which shortcode writes the ninja emoji":"ninja","what is the shortcode of the person cartwheeling emoji":"cartwheeling","which shortcode writes the seedling emoji":"seedling","give the GitHub shortcode for flag: Turks & Caicos Islands":"turks_caicos_islands","which shortcode writes the woman mage emoji":"mage_woman","which shortcode writes the cherries emoji":"cherries","give the GitHub shortcode for flag: St. Pierre & Miquelon":"st_pierre_miquelon","what is the shortcode of the woman emoji":"woman"}}},
{"id":"n-4d7919e0","guard":[["has","shortcode"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"shortcode"}]]],"mem":{"table":{"writes the shield emoji":"shield","for keyboard":"keyboard","of the person kneeling emoji":"kneeling_person","for face with diagonal mouth":"face_with_diagonal_mouth","for flag: Sierra Leone":"sierra_leone","of the deer emoji":"deer","writes the red apple emoji":"apple","for frog":"frog","of the flag: British Virgin Islands emoji":"british_virgin_islands","for crossed flags":"crossed_flags","for socks":"socks","writes the globe showing Asia-Australia emoji":"earth_asia","for family: man, woman, girl, boy":"family_man_woman_girl_boy","for Mrs. Claus":"mrs_claus","for tent":"tent","for flag: South Africa":"south_africa","for carousel horse":"carousel_horse","writes the flag: England emoji":"england","writes the chart increasing with yen emoji":"chart","of the sheaf of rice emoji":"ear_of_rice","for tropical drink":"tropical_drink","of the index pointing at the viewer emoji":"index_pointing_at_the_viewer","of the flag: St. Helena emoji":"st_helena","for office worker":"office_worker","writes the palm down hand emoji":"palm_down_hand","writes the flag: Réunion emoji":"reunion","of the megaphone emoji":"mega","of the fast down button emoji":"arrow_double_down","writes the sled emoji":"sled","of the speedboat emoji":"speedboat","for tulip":"tulip","for fire":"fire","writes the trackball emoji":"trackball","writes the women’s room emoji":"womens","of the man: red hair emoji":"red_haired_man","writes the person in steamy room emoji":"sauna_person","of the flag: Hungary emoji":"hungary","of the woman getting haircut emoji":"haircut_woman","of the troll emoji":"troll","of the framed picture emoji":"framed_picture","of the snake emoji":"snake","of the hook emoji":"hook","of the woman facepalming emoji":"woman_facepalming","for blue square":"blue_square","for flag: Burkina Faso":"burkina_faso","writes the snow-capped mountain emoji":"mountain_snow","of the toothbrush emoji":"toothbrush","of the flag: Monaco emoji":"monaco","writes the man farmer emoji":"man_farmer","writes the coffin emoji":"coffin","of the pouting cat emoji":"pouting_cat","of the safety pin emoji":"safety_pin","for flag: Svalbard & Jan Mayen":"svalbard_jan_mayen","for guide dog":"guide_dog","of the face with tears of joy emoji":"joy","for person facepalming":"facepalm","of the aerial tramway emoji":"aerial_tramway","writes the hand with index finger and thumb crossed emoji":"hand_with_index_finger_and_thumb_crossed","for teddy bear":"teddy_bear","of the woman: bald emoji":"bald_woman","for supervillain":"supervillain","for kaaba":"kaaba","for dagger":"dagger","of the full moon face emoji":"full_moon_with_face","writes the END arrow emoji":"end","writes the flag: Paraguay emoji":"paraguay","of the zombie emoji":"zombie","for relieved face":"relieved","writes the thought balloon emoji":"thought_balloon","for baby bottle":"baby_bottle","writes the ship emoji":"ship","for floppy disk":"floppy_disk","writes the man construction worker emoji":"construction_worker_man","for mango":"mango","writes the chopsticks emoji":"chopsticks","of the mosque emoji":"mosque","for flag: Madagascar":"madagascar","of the flag: Nepal emoji":"nepal","for fountain":"fountain","writes the woman farmer emoji":"woman_farmer","writes the inbox tray emoji":"inbox_tray","of the roller coaster emoji":"roller_coaster","writes the baby symbol emoji":"baby_symbol","of the woman zombie emoji":"zombie_woman","writes the check box with check emoji":"ballot_box_with_check","of the flag: United Nations emoji":"united_nations","for no bicycles":"no_bicycles","writes the handshake emoji":"handshake","of the face with raised eyebrow emoji":"raised_eyebrow","writes the man police officer emoji":"policeman","writes the closed mailbox with lowered flag emoji":"mailbox_closed","writes the fast reverse button emoji":"rewind","writes the ninja emoji":"ninja","of the person cartwheeling emoji":"cartwheeling","writes the seedling emoji":"seedling","for flag: Turks & Caicos Islands":"turks_caicos_islands","writes the woman mage emoji":"mage_woman","writes the cherries emoji":"cherries","for flag: St. Pierre & Miquelon":"st_pierre_miquelon","of the woman emoji":"woman"}}},
{"id":"n-0d8be8c2","guard":[["has","emoji"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"emoji"}]]],"mem":{"table":{"which shortcode writes the shield":"shield","what is the shortcode of the person kneeling":"kneeling_person","what is the shortcode of the deer":"deer","which shortcode writes the red apple":"apple","what is the shortcode of the flag: British Virgin Islands":"british_virgin_islands","which shortcode writes the globe showing Asia-Australia":"earth_asia","which shortcode writes the flag: England":"england","which shortcode writes the chart increasing with yen":"chart","what is the shortcode of the sheaf of rice":"ear_of_rice","what is the shortcode of the index pointing at the viewer":"index_pointing_at_the_viewer","what is the shortcode of the flag: St. Helena":"st_helena","which shortcode writes the palm down hand":"palm_down_hand","which shortcode writes the flag: Réunion":"reunion","what is the shortcode of the megaphone":"mega","what is the shortcode of the fast down button":"arrow_double_down","which shortcode writes the sled":"sled","what is the shortcode of the speedboat":"speedboat","which shortcode writes the trackball":"trackball","which shortcode writes the women’s room":"womens","what is the shortcode of the man: red hair":"red_haired_man","which shortcode writes the person in steamy room":"sauna_person","what is the shortcode of the flag: Hungary":"hungary","what is the shortcode of the woman getting haircut":"haircut_woman","what is the shortcode of the troll":"troll","what is the shortcode of the framed picture":"framed_picture","what is the shortcode of the snake":"snake","what is the shortcode of the hook":"hook","what is the shortcode of the woman facepalming":"woman_facepalming","which shortcode writes the snow-capped mountain":"mountain_snow","what is the shortcode of the toothbrush":"toothbrush","what is the shortcode of the flag: Monaco":"monaco","which shortcode writes the man farmer":"man_farmer","which shortcode writes the coffin":"coffin","what is the shortcode of the pouting cat":"pouting_cat","what is the shortcode of the safety pin":"safety_pin","what is the shortcode of the face with tears of joy":"joy","what is the shortcode of the aerial tramway":"aerial_tramway","which shortcode writes the hand with index finger and thumb crossed":"hand_with_index_finger_and_thumb_crossed","what is the shortcode of the woman: bald":"bald_woman","what is the shortcode of the full moon face":"full_moon_with_face","which shortcode writes the END arrow":"end","which shortcode writes the flag: Paraguay":"paraguay","what is the shortcode of the zombie":"zombie","which shortcode writes the thought balloon":"thought_balloon","which shortcode writes the ship":"ship","which shortcode writes the man construction worker":"construction_worker_man","which shortcode writes the chopsticks":"chopsticks","what is the shortcode of the mosque":"mosque","what is the shortcode of the flag: Nepal":"nepal","which shortcode writes the woman farmer":"woman_farmer","which shortcode writes the inbox tray":"inbox_tray","what is the shortcode of the roller coaster":"roller_coaster","which shortcode writes the baby symbol":"baby_symbol","what is the shortcode of the woman zombie":"zombie_woman","which shortcode writes the check box with check":"ballot_box_with_check","what is the shortcode of the flag: United Nations":"united_nations","which shortcode writes the handshake":"handshake","what is the shortcode of the face with raised eyebrow":"raised_eyebrow","which shortcode writes the man police officer":"policeman","which shortcode writes the closed mailbox with lowered flag":"mailbox_closed","which shortcode writes the fast reverse button":"rewind","which shortcode writes the ninja":"ninja","what is the shortcode of the person cartwheeling":"cartwheeling","which shortcode writes the seedling":"seedling","which shortcode writes the woman mage":"mage_woman","which shortcode writes the cherries":"cherries","what is the shortcode of the woman":"woman"}}},
{"id":"n-5a63b418","guard":[["has","emoji"],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the person kneeling emoji":"kneeling_person","the deer emoji":"deer","the flag: British Virgin Islands emoji":"british_virgin_islands","the sheaf of rice emoji":"ear_of_rice","the index pointing at the viewer emoji":"index_pointing_at_the_viewer","the flag: St. Helena emoji":"st_helena","the megaphone emoji":"mega","the fast down button emoji":"arrow_double_down","the speedboat emoji":"speedboat","the man: red hair emoji":"red_haired_man","the flag: Hungary emoji":"hungary","the woman getting haircut emoji":"haircut_woman","the troll emoji":"troll","the framed picture emoji":"framed_picture","the snake emoji":"snake","the hook emoji":"hook","the woman facepalming emoji":"woman_facepalming","the toothbrush emoji":"toothbrush","the flag: Monaco emoji":"monaco","the pouting cat emoji":"pouting_cat","the safety pin emoji":"safety_pin","the face with tears of joy emoji":"joy","the aerial tramway emoji":"aerial_tramway","the woman: bald emoji":"bald_woman","the full moon face emoji":"full_moon_with_face","the zombie emoji":"zombie","the mosque emoji":"mosque","the flag: Nepal emoji":"nepal","the roller coaster emoji":"roller_coaster","the woman zombie emoji":"zombie_woman","the flag: United Nations emoji":"united_nations","the face with raised eyebrow emoji":"raised_eyebrow","the person cartwheeling emoji":"cartwheeling","the woman emoji":"woman"}}},
{"id":"n-f6863703","guard":[["has","emoji"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the shortcode of the person kneeling emoji":"kneeling_person","the shortcode of the deer emoji":"deer","the shortcode of the flag: British Virgin Islands emoji":"british_virgin_islands","the shortcode of the sheaf of rice emoji":"ear_of_rice","the shortcode of the index pointing at the viewer emoji":"index_pointing_at_the_viewer","the shortcode of the flag: St. Helena emoji":"st_helena","the shortcode of the megaphone emoji":"mega","the shortcode of the fast down button emoji":"arrow_double_down","the shortcode of the speedboat emoji":"speedboat","the shortcode of the man: red hair emoji":"red_haired_man","the shortcode of the flag: Hungary emoji":"hungary","the shortcode of the woman getting haircut emoji":"haircut_woman","the shortcode of the troll emoji":"troll","the shortcode of the framed picture emoji":"framed_picture","the shortcode of the snake emoji":"snake","the shortcode of the hook emoji":"hook","the shortcode of the woman facepalming emoji":"woman_facepalming","the shortcode of the toothbrush emoji":"toothbrush","the shortcode of the flag: Monaco emoji":"monaco","the shortcode of the pouting cat emoji":"pouting_cat","the shortcode of the safety pin emoji":"safety_pin","the shortcode of the face with tears of joy emoji":"joy","the shortcode of the aerial tramway emoji":"aerial_tramway","the shortcode of the woman: bald emoji":"bald_woman","the shortcode of the full moon face emoji":"full_moon_with_face","the shortcode of the zombie emoji":"zombie","the shortcode of the mosque emoji":"mosque","the shortcode of the flag: Nepal emoji":"nepal","the shortcode of the roller coaster emoji":"roller_coaster","the shortcode of the woman zombie emoji":"zombie_woman","the shortcode of the flag: United Nations emoji":"united_nations","the shortcode of the face with raised eyebrow emoji":"raised_eyebrow","the shortcode of the person cartwheeling emoji":"cartwheeling","the shortcode of the woman emoji":"woman"}}},
{"id":"n-79420943","guard":[["has","github"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"keyboard":"keyboard","face with diagonal mouth":"face_with_diagonal_mouth","flag: Sierra Leone":"sierra_leone","frog":"frog","crossed flags":"crossed_flags","socks":"socks","family: man, woman, girl, boy":"family_man_woman_girl_boy","Mrs. Claus":"mrs_claus","tent":"tent","flag: South Africa":"south_africa","carousel horse":"carousel_horse","tropical drink":"tropical_drink","office worker":"office_worker","tulip":"tulip","fire":"fire","blue square":"blue_square","flag: Burkina Faso":"burkina_faso","flag: Svalbard & Jan Mayen":"svalbard_jan_mayen","guide dog":"guide_dog","person facepalming":"facepalm","teddy bear":"teddy_bear","supervillain":"supervillain","kaaba":"kaaba","dagger":"dagger","relieved face":"relieved","baby bottle":"baby_bottle","floppy disk":"floppy_disk","mango":"mango","flag: Madagascar":"madagascar","fountain":"fountain","no bicycles":"no_bicycles","flag: Turks & Caicos Islands":"turks_caicos_islands","flag: St. Pierre & Miquelon":"st_pierre_miquelon"}}},
{"id":"n-d46da6cf","guard":[["hasAny",["arrow","cartwheeling","chart","cherries","chopsticks","coffin","dagger","fire","fountain","frog","handshake","hungary","item number","kaaba","keyboard","mango","monaco","nepal","ninja","nth","position","relieved","seedling","shield","ship","sled","socks","supervillain","tent","trackball","tulip","womens"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6298268b","guard":[["hasAny",["arrow","cartwheeling","chart","cherries","chopsticks","coffin","dagger","fire","fountain","frog","handshake","hungary","invert case","item number","kaaba","keyboard","mango","monaco","nepal","ninja","nth","position","relieved","seedling","shield","ship","sled","socks","supervillain","swap case","tent","toggle case","trackball","tulip","womens"]],["has","shortcode"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-66cbab43","guard":[["hasAny",["cartwheeling","cherries","chopsticks","dagger","each word","england","fire","fountain","frog","handshake","hungary","kaaba","keyboard","longest","longest one","longest word","madagascar","mango","monaco","mosque","nepal","paraguay","relieved","seedling","snake","socks","speedboat","split into words","supervillain","tent","toothbrush","trackball","troll","tulip","words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"shortcode"}]]]],"mem":null},
{"id":"n-b17e4765","guard":[["hasAny",["arrow","cartwheeling","chart","cherries","chopsticks","coffin","dagger","fire","fountain","frog","handshake","hungary","item number","kaaba","keyboard","mango","monaco","nepal","ninja","nth","position","relieved","seedling","shield","ship","sled","socks","supervillain","tent","trackball","tulip","womens"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f22e79ec","guard":[["hasAny",["arrow","capitalise","capitalize","capitalize each word","cartwheeling","chart","cherries","chopsticks","coffin","dagger","fire","fountain","frog","handshake","hungary","item number","kaaba","keyboard","mango","monaco","nepal","ninja","nth","position","relieved","seedling","shield","ship","sled","socks","supervillain","tent","title case","trackball","tulip","womens"]],["has","shortcode"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-283e1aea","guard":[["hasAny",["apple","backwards","cartwheeling","cherries","chopsticks","coffin","deer","england","handshake","hook","hungary","item number","joy","monaco","mosque","nepal","ninja","nth","paraguay","position","relieved","reverse order","reversed","seedling","shield","ship","sled","snake","speedboat","toothbrush","trackball","troll"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-8ff3af79","guard":[["hasAny",["apple","backwards","cartwheeling","cherries","chopsticks","coffin","deer","england","handshake","hook","hungary","item number","joy","monaco","mosque","nepal","ninja","nth","paraguay","position","relieved","reverse order","reversed","seedling","shield","ship","sled","snake","speedboat","toothbrush","trackball","troll"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":2}]],"mem":null},
{"id":"n-1157eca6","guard":[["hasAny",["cherries","chopsticks","coffin","dagger","fire","fountain","frog","half","half of","halve","handshake","item number","kaaba","keyboard","mango","ninja","nth","position","seedling","shield","ship","sled","socks","supervillain","tent","trackball","tulip"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["transform.half",["sense.wordCount"]]]],"mem":null},
{"id":"n-e07d69b0","guard":[["hasAny",["arrow","cartwheeling","chart","cherries","chopsticks","coffin","handshake","how many vowels","hungary","item number","kaaba","keyboard","madagascar","monaco","nepal","ninja","nth","number of vowels","position","seedling","shield","ship","sled","trackball","vowel count","womens"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-e9777ca5","guard":[["hasAny",["baby","balloon","bear","bicycles","blue","carousel","claus","disk","dog","drink","eyebrow","farmer","flags","helena","inbox","item number","nations","nth","office","position"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-476f7e19","guard":[["hasAny",["a to z","alphabetical","alphabetize","arrow","hungary","item number","joy","madagascar","monaco","nepal","nth","paraguay","position","relieved","sled","snake","socks","speedboat","supervillain","tent","toothbrush","trackball","troll","tulip"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":3}]],"mem":null},
{"id":"n-8ad9f39b","guard":[["hasAny",["dagger","each word","england","fire","fountain","frog","hungary","kaaba","keyboard","longest","longest one","longest word","madagascar","mango","monaco","nepal","paraguay","socks","split into words","supervillain","tent","tulip"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-6e639732","guard":[["hasAny",["arrow","cartwheeling","chart","cherries","chopsticks","coffin","handshake","how many vowels","item number","kaaba","keyboard","madagascar","ninja","nth","number of vowels","position","seedling","shield","ship","sled","trackball","vowel count","womens"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-7e539f9e","guard":[["hasAny",["arrow","chart","deer","fire","first n","frog","hook","joy","kaaba","mango","ninja","ship","shortest","shortest one","shortest word","sled","snake","socks","take","tent","troll","tulip"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-e6719a9d","guard":[["hasAny",["dagger","each word","england","fire","fountain","frog","hungary","item number","kaaba","keyboard","madagascar","mango","monaco","nepal","nth","paraguay","position","socks","split into words","supervillain","tent","tulip"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["transform.words",["sense.subject"]],{"lit":1}]],"mem":null},
{"id":"n-2412140d","guard":[["hasAny",["backwards","dagger","each word","england","fire","fountain","frog","hungary","kaaba","keyboard","longest","longest one","longest word","madagascar","mango","monaco","paraguay","reverse order","reversed","socks","split into words","supervillain","tent","tulip"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["transform.words",["sense.subject"]]]]],"mem":null},
{"id":"n-493fd3a8","guard":[["hasAny",["a to z","alphabetical","alphabetize","arrow","backwards","deer","fire","frog","hook","joy","kaaba","mango","ninja","reverse order","reversed","ship","shortest","shortest one","shortest word","sled","snake","socks","tent","troll","tulip"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["transform.sortStrs",["sense.content"]]]]],"mem":null},
{"id":"n-66567df2","guard":[["hasAny",["arrow","deer","fire","frog","hook","joy","kaaba","mango","ninja","ship","shortest","shortest one","shortest word","sled","snake","socks","tent","troll","tulip"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7af006da","guard":[["hasAny",["arrow","capitalise","capitalize","capitalize each word","deer","fire","frog","hook","joy","kaaba","mango","ninja","ship","shortest","shortest one","shortest word","sled","snake","socks","tent","title case","troll","tulip"]],["has","shortcode"]],"pyramid":["render.str",["transform.title",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-96d87850","guard":[["hasAny",["arrow","deer","fire","frog","hook","invert case","joy","kaaba","mango","ninja","ship","shortest","shortest one","shortest word","sled","snake","socks","swap case","tent","toggle case","troll","tulip"]],["has","shortcode"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-f675c106","guard":[["hasAny",["arrow","deer","fire","frog","hook","joy","kaaba","mango","ninja","ship","shortest","shortest one","shortest word","sled","snake","socks","tent","troll","tulip"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-33ec8ac2","guard":[["hasAny",["arrow","chart","deer","fire","first n","frog","hook","kaaba","mango","ninja","ship","shortest","shortest one","shortest word","sled","snake","socks","take","tent","troll","tulip"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-6a5c1e6a","guard":[["hasAny",["arrow","deer","fire","first n","frog","hook","joy","kaaba","mango","ninja","ship","shortest","shortest one","shortest word","sled","snake","socks","take","tent","troll","tulip"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":5}]]],"mem":null},
{"id":"n-0f3b3ea5","guard":[["hasAny",["arrow","backwards","dagger","deer","fire","frog","hook","joy","kaaba","mango","reverse order","reversed","ship","shortest","shortest one","shortest word","sled","socks","tent","tulip"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-13140619","guard":[["hasAny",["arrow","backwards","capitalise","capitalize","capitalize each word","dagger","deer","fire","frog","hook","joy","kaaba","mango","reverse order","reversed","ship","shortest","shortest one","shortest word","sled","socks","tent","title case","tulip"]],["has","shortcode"]],"pyramid":["render.str",["transform.title",["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]]],"mem":null},
{"id":"n-5e8d9c2d","guard":[["hasAny",["arrow","backwards","dagger","deer","fire","frog","hook","invert case","joy","kaaba","mango","reverse order","reversed","ship","shortest","shortest one","shortest word","sled","socks","swap case","tent","toggle case","tulip"]],["has","shortcode"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]]],"mem":null},
{"id":"n-ecb557a2","guard":[["hasAny",["arrow","backwards","dagger","deer","fire","frog","hook","joy","kaaba","mango","reverse order","reversed","ship","shortest","shortest one","shortest word","sled","socks","tent","tulip"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-4f0b9321","guard":[["hasAny",["a to z","alphabetical","alphabetize","arrow","dagger","deer","fire","frog","hook","joy","kaaba","mango","ship","shortest","shortest one","shortest word","sled","socks","tent","tulip"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.content"]]]],"mem":null},
{"id":"n-2ab83341","guard":[["hasAny",["arrow","chart","cherries","chopsticks","coffin","dagger","handshake","how many letters","item number","letter count","ninja","nth","number of letters","position","seedling","shield","ship","sled","trackball","womens"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.letters",["sense.subject"]]]],"mem":null},
{"id":"n-611078a2","guard":[["hasAny",["arrow","character count","chart","cherries","chopsticks","coffin","dagger","handshake","how many characters","item number","length","ninja","nth","number of characters","position","seedling","shield","ship","sled","trackball","womens"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.chars",["sense.subject"]]]],"mem":null},
{"id":"n-737c811d","guard":[["hasAny",["arrow","character count","chart","cherries","chopsticks","coffin","dagger","handshake","how many characters","item number","length","ninja","nth","number of characters","position","seedling","shield","ship","sled","trackball","womens"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-1124b285","guard":[["hasAny",["arrow","chart","cherries","chopsticks","coffin","handshake","item number","ninja","nth","position","seedling","shield","ship","sled","trackball","womens"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3205b8a3","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","nepal","shortest","shortest one","shortest word","socks","split into words","supervillain","tent","tulip"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-65444041","guard":[["hasAny",["arrow","chart","cherries","chopsticks","coffin","handshake","invert case","item number","ninja","nth","position","seedling","shield","ship","sled","swap case","toggle case","trackball","womens"]],["has","shortcode"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-94d7b7f5","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","longest","longest one","longest word","madagascar","mango","relieved","socks","split into words","supervillain","tent","tulip","words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-c43b33a2","guard":[["hasAny",["arrow","chart","cherries","chopsticks","coffin","handshake","item number","ninja","nth","position","seedling","shield","ship","sled","trackball","womens"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e441c156","guard":[["hasAny",["arrow","capitalise","capitalize","capitalize each word","chart","cherries","chopsticks","coffin","handshake","item number","ninja","nth","position","seedling","shield","ship","sled","title case","trackball","womens"]],["has","shortcode"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-afc50029","guard":[["hasAny",["backwards","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-c3ab7842","guard":[["hasAny",["backwards","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-d0e6ec63","guard":[["hasAny",["backwards","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-1581571c","guard":[["hasAny",["backwards","dagger","each word","fire","fountain","frog","invert case","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","swap case","tent","toggle case","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["transform.swapCase",["sense.subject"]]]]],"mem":null},
{"id":"n-2903d8a1","guard":[["hasAny",["a to z","alphabetical","alphabetize","backwards","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["transform.reverseStrs",["transform.sortStrs",["transform.words",["sense.subject"]]]]],"mem":null},
{"id":"n-300b8497","guard":[["hasAny",["backwards","dagger","each word","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","madagascar","mango","reverse order","reversed","small letters","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["transform.lower",["sense.subject"]]]]],"mem":null},
{"id":"n-3b410764","guard":[["hasAny",["all caps","backwards","capital letters","capitals","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","tent","tulip","upper case","uppercase"]],["has","github"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["transform.upper",["sense.subject"]]]]],"mem":null},
{"id":"n-47cc8326","guard":[["hasAny",["a to z","alphabetical","alphabetize","backwards","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.and",["transform.reverseStrs",["transform.sortStrs",["transform.words",["sense.subject"]]]]],"mem":null},
{"id":"n-4a015ee2","guard":[["hasAny",["backwards","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","shortest","shortest one","shortest word","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["transform.words",["sense.subject"]]]]],"mem":null},
{"id":"n-5a628910","guard":[["hasAny",["all caps","backwards","capital letters","capitals","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","tent","tulip","upper case","uppercase"]],["has","github"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["transform.upper",["sense.subject"]]]]],"mem":null},
{"id":"n-6fba32de","guard":[["hasAny",["backwards","capitalise","capitalize","capitalize each word","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","tent","title case","tulip"]],["has","github"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["transform.title",["sense.subject"]]]]],"mem":null},
{"id":"n-7141f582","guard":[["hasAny",["backwards","dagger","each word","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","madagascar","mango","reverse order","reversed","small letters","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["transform.lower",["sense.subject"]]]]],"mem":null},
{"id":"n-7630007a","guard":[["hasAny",["backwards","capitalise","capitalize","capitalize each word","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","tent","title case","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["transform.title",["sense.subject"]]]]],"mem":null},
{"id":"n-86895920","guard":[["hasAny",["backwards","capitalise","capitalize","capitalize each word","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","tent","title case","tulip"]],["has","github"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["transform.title",["sense.subject"]]]]],"mem":null},
{"id":"n-88fd5291","guard":[["hasAny",["backwards","capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","mirror","reversed","socks","spell backwards","supervillain","tent","title case","tulip"]],["has","github"]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["sense.lastWord"]]]]],"mem":null},
{"id":"n-9cba221e","guard":[["hasAny",["a to z","alphabetical","alphabetize","backwards","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.sortStrs",["transform.words",["sense.subject"]]]]],"mem":null},
{"id":"n-a14da0b0","guard":[["hasAny",["all caps","backwards","capital letters","capitals","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","tent","tulip","upper case","uppercase"]],["has","github"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["transform.upper",["sense.subject"]]]]],"mem":null},
{"id":"n-a6a65f3c","guard":[["hasAny",["backwards","dagger","each word","fire","fountain","frog","invert case","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","swap case","tent","toggle case","tulip"]],["has","github"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["transform.swapCase",["sense.subject"]]]]],"mem":null},
{"id":"n-b622e449","guard":[["hasAny",["backwards","dagger","each word","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","madagascar","mango","reverse order","reversed","small letters","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["transform.lower",["sense.subject"]]]]],"mem":null},
{"id":"n-b97546c3","guard":[["hasAny",["backwards","dagger","each word","fire","fountain","frog","invert case","kaaba","keyboard","madagascar","mango","reverse order","reversed","socks","split into words","supervillain","swap case","tent","toggle case","tulip"]],["has","github"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["transform.swapCase",["sense.subject"]]]]],"mem":null},
{"id":"n-fa241091","guard":[["hasAny",["backwards","capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","mirror","reversed","socks","spell backwards","supervillain","tent","title case","tulip"]],["has","github"]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["sense.subject"]]]]],"mem":null},
{"id":"n-6fe22d11","guard":[["hasAny",["backwards","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","separate by","socks","split","split by","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["transform.reverseStrs",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-80ea229e","guard":[["hasAny",["backwards","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","separate by","socks","split","split by","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.and",["transform.reverseStrs",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-a6da5419","guard":[["hasAny",["backwards","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","mirror","normalise","normalize","reversed","simplify the text","socks","spell backwards","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.reverse",["transform.norm",["transform.reverse",["sense.subject"]],{"lit":3}]]],"mem":null},
{"id":"n-d21e76cf","guard":[["hasAny",["backwards","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse order","reversed","separate by","socks","split","split by","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-0fbf69e2","guard":[["hasAny",["dagger","fire","fountain","frog","invert case","kaaba","keyboard","madagascar","mango","socks","supervillain","swap case","tent","toggle case","tulip"]],["has","github"]],"pyramid":["render.str",["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-22c6880f","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse the words","reverse word order","socks","supervillain","tent","tulip","words backwards"]],["has","github"]],"pyramid":["render.str",["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-253eaa07","guard":[["hasAny",["all caps","capital letters","capitals","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","supervillain","tent","tulip","upper case","uppercase"]],["has","github"]],"pyramid":["render.str",["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-2c14c6fe","guard":[["hasAny",["all caps","capital letters","capitals","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","supervillain","tent","tulip","upper case","uppercase"]],["has","github"]],"pyramid":["render.str",["transform.upper",["sense.subject"]]],"mem":null},
{"id":"n-8203c359","guard":[["hasAny",["dagger","fire","fountain","frog","invert case","kaaba","keyboard","madagascar","mango","socks","supervillain","swap case","tent","toggle case","tulip"]],["has","github"]],"pyramid":["render.str",["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-895385c8","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-a0541485","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","madagascar","mango","small letters","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a371c48b","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["transform.words",["sense.lastWord"]]],"mem":null},
{"id":"n-ab945ca0","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","madagascar","mango","small letters","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.lower",["sense.subject"]]],"mem":null},
{"id":"n-abdcd24b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","supervillain","tent","title case","tulip"]],["has","github"]],"pyramid":["render.str",["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c5ae5980","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.and",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-c7fe4963","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["sense.subject"]],"mem":null},
{"id":"n-ee45d441","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","supervillain","tent","title case","tulip"]],["has","github"]],"pyramid":["render.str",["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-f2aa0867","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-f2f56444","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-033045cb","guard":[["hasAny",["a to z","alphabetical","alphabetize","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-0567ae82","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","invert case","kaaba","keyboard","madagascar","mango","socks","supervillain","swap case","tent","title case","toggle case","tulip"]],["has","github"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-0ef23d68","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","title case","tulip"]],["has","github"]],"pyramid":["render.list",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-279e3112","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","title case","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-2845720c","guard":[["hasAny",["all caps","capital letters","capitals","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","tulip","upper case","uppercase"]],["has","github"]],"pyramid":["render.lines",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-288f5e3f","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],{"lit":1}]],"mem":null},
{"id":"n-2ea2c6f8","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","normalise","normalize","simplify the text","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":1}]],"mem":null},
{"id":"n-382f60e0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","invert case","kaaba","keyboard","madagascar","mango","socks","supervillain","swap case","tent","title case","toggle case","tulip"]],["has","github"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-41c71898","guard":[["hasAny",["a to z","alphabetical","alphabetize","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-46c636d6","guard":[["hasAny",["dagger","fire","fountain","frog","invert case","kaaba","keyboard","madagascar","mango","socks","supervillain","swap case","tent","toggle case","tulip"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-476808ae","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","normalise","normalize","simplify the text","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":3}]],"mem":null},
{"id":"n-49f79a39","guard":[["hasAny",["all caps","capital letters","capitals","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","tulip","upper case","uppercase"]],["has","github"]],"pyramid":["render.and",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-5800ce43","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse the words","reverse word order","socks","supervillain","tent","title case","tulip","words backwards"]],["has","github"]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-8fdccc7f","guard":[["hasAny",["all caps","capital letters","capitals","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","tulip","upper case","uppercase"]],["has","github"]],"pyramid":["render.list",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-95908ce7","guard":[["hasAny",["dagger","each word","fire","fountain","frog","invert case","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","swap case","tent","toggle case","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-963454f1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","supervillain","tent","title case","tulip"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9aa8d788","guard":[["hasAny",["all caps","capital letters","capitals","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","reverse the words","reverse word order","socks","supervillain","tent","tulip","upper case","uppercase","words backwards"]],["has","github"]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-a1ff55d0","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","madagascar","mango","reverse the words","reverse word order","small letters","socks","supervillain","tent","tulip","words backwards"]],["has","github"]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["sense.subject"]]]],"mem":null},
{"id":"n-af887ec2","guard":[["hasAny",["dagger","each word","fire","fountain","frog","invert case","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","swap case","tent","toggle case","tulip"]],["has","github"]],"pyramid":["render.list",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-b231a631","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","madagascar","mango","small letters","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-bca37a50","guard":[["hasAny",["all caps","capital letters","capitals","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","supervillain","tent","tulip","upper case","uppercase"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c5358ee2","guard":[["hasAny",["dagger","fire","fountain","frog","invert case","kaaba","keyboard","madagascar","mango","reverse the words","reverse word order","socks","supervillain","swap case","tent","toggle case","tulip","words backwards"]],["has","github"]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-c78c88db","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","title case","tulip"]],["has","github"]],"pyramid":["render.and",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-cad687e0","guard":[["hasAny",["a to z","alphabetical","alphabetize","dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-d8471236","guard":[["hasAny",["dagger","each word","fire","fountain","frog","invert case","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","swap case","tent","toggle case","tulip"]],["has","github"]],"pyramid":["render.and",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-e5f8bd58","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","madagascar","mango","small letters","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-edba320d","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","madagascar","mango","small letters","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-fd115705","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","madagascar","mango","small letters","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.and",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-05c91bc6","guard":[["hasAny",["alphabetize the letters","dagger","fire","fountain","frog","kaaba","keyboard","letters in order","madagascar","mango","separate by","socks","sort the letters","split","split by","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["transform.split",["sense.subject"],["transform.sortLetters",["sense.lastWord"]]]],"mem":null},
{"id":"n-0945a0dd","guard":[["hasAny",["dagger","fire","fountain","frog","how many words","kaaba","keyboard","madagascar","mango","number of words","socks","supervillain","tent","tulip","word count"]],["has","github"]],"pyramid":["render.lines",["iterate.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-0bf720cd","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","normalise","normalize","simplify the text","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.and",["transform.words",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-0cf0d04f","guard":[["hasAny",["dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","madagascar","mango","slice","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":10}]],"mem":null},
{"id":"n-0f869a09","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-19058ae3","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1a85c16b","guard":[["hasAny",["dagger","fire","fountain","frog","how many words","kaaba","keyboard","madagascar","mango","number of words","socks","supervillain","tent","tulip","word count"]],["has","github"]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-202bdd9a","guard":[["hasAny",["dagger","delete","fire","fountain","frog","kaaba","keyboard","madagascar","mango","remove","socks","strip out","supervillain","tent","tulip","without"]],["has","github"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-2511cf49","guard":[["hasAny",["copies","dagger","fire","fountain","frog","how many words","kaaba","keyboard","madagascar","mango","number of words","say it times","socks","supervillain","tent","tulip","word count"]],["has","github"]],"pyramid":["render.str",["transform.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-2d5c0dcc","guard":[["hasAny",["dagger","fire","fountain","frog","how many words","kaaba","keyboard","madagascar","mango","number of words","socks","supervillain","tent","tulip","word count"]],["has","github"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-2e38336a","guard":[["hasAny",["dagger","each word","fire","first n","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","take","tent","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":3}]],"mem":null},
{"id":"n-2eec79fa","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","separate by","socks","split","split by","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-355e9621","guard":[["hasAny",["alphabetize the letters","dagger","delete","fire","fountain","frog","kaaba","keyboard","letters in order","madagascar","mango","remove","socks","sort the letters","strip out","supervillain","tent","tulip","without"]],["has","github"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.sortLetters",["sense.lastWord"]]]],"mem":null},
{"id":"n-356bb617","guard":[["hasAny",["change to","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","replace","socks","substitute","supervillain","swap","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-368746cf","guard":[["hasAny",["dagger","digits backwards","digits reversed","fire","fountain","frog","item number","kaaba","keyboard","madagascar","mango","nth","position","reverse the digits","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-37980588","guard":[["hasAny",["dagger","each word","fire","first n","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","take","tent","tulip"]],["has","github"]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":3}]],"mem":null},
{"id":"n-3bd52dc0","guard":[["hasAny",["dagger","each word","fire","first n","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","take","tent","tulip"]],["has","github"]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":3}]],"mem":null},
{"id":"n-3d912c2d","guard":[["hasAny",["dagger","each word","fire","fountain","frog","item number","kaaba","keyboard","madagascar","mango","nth","position","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.nthStr",["transform.words",["sense.text"]],["sense.wordCount"]]],"mem":null},
{"id":"n-421f0171","guard":[["hasAny",["dagger","each word","fire","fountain","frog","join","joined with","kaaba","keyboard","madagascar","mango","separated by","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.join",["transform.words",["sense.subject"]],["sense.lastWord"]]],"mem":null},
{"id":"n-4a6916ae","guard":[["hasAny",["dagger","fire","fountain","frog","how many words","kaaba","keyboard","madagascar","mango","normalise","normalize","number of words","simplify the text","socks","supervillain","tent","tulip","word count"]],["has","github"]],"pyramid":["render.str",["transform.norm",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-577984eb","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","normalise","normalize","simplify the text","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.words",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-5aa61b1e","guard":[["hasAny",["dagger","each word","fire","first n","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","take","tent","tulip"]],["has","github"]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-647da041","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","normalise","normalize","simplify the text","socks","supervillain","tent","title case","tulip"]],["has","github"]],"pyramid":["render.str",["transform.title",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-64861ddb","guard":[["hasAny",["dagger","fire","fountain","frog","how many words","kaaba","keyboard","madagascar","mango","number of words","socks","supervillain","tent","tulip","word count"]],["has","github"]],"pyramid":["render.and",["iterate.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-6eac939c","guard":[["hasAny",["dagger","each word","fire","fountain","frog","join","joined with","kaaba","keyboard","madagascar","mango","separated by","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.join",["transform.words",["sense.subject"]],["sense.text"]]],"mem":null},
{"id":"n-72f0b680","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","normalise","normalize","reverse the words","reverse word order","simplify the text","socks","supervillain","tent","tulip","words backwards"]],["has","github"]],"pyramid":["render.str",["transform.norm",["transform.reverseWords",["sense.subject"]],{"lit":1}]],"mem":null},
{"id":"n-77e45ad3","guard":[["hasAny",["add the digits","dagger","digit sum","fire","fountain","frog","item number","kaaba","keyboard","madagascar","mango","nth","position","socks","sum of the digits","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-7a549884","guard":[["hasAny",["dagger","digit count","fire","fountain","frog","how many digits","kaaba","keyboard","madagascar","mango","number of digits","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.and",["iterate.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-8622d612","guard":[["hasAny",["dagger","each word","fire","fountain","frog","join","joined with","kaaba","keyboard","madagascar","mango","separated by","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.join",["transform.words",["sense.subject"]],["sense.subject"]]],"mem":null},
{"id":"n-87701973","guard":[["hasAny",["copies","dagger","digit count","fire","fountain","frog","how many digits","kaaba","keyboard","madagascar","mango","number of digits","say it times","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-88097077","guard":[["hasAny",["dagger","fire","fountain","frog","invert case","kaaba","keyboard","madagascar","mango","normalise","normalize","simplify the text","socks","supervillain","swap case","tent","toggle case","tulip"]],["has","github"]],"pyramid":["render.str",["transform.swapCase",["transform.norm",["sense.subject"],{"lit":1}]]],"mem":null},
{"id":"n-8b28a1c7","guard":[["hasAny",["dagger","fire","fountain","frog","how many words","kaaba","keyboard","madagascar","mango","number of words","socks","supervillain","tent","tulip","word count"]],["has","github"]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-8ea62378","guard":[["hasAny",["dagger","fire","fountain","frog","how many words","kaaba","keyboard","madagascar","mango","number of words","socks","supervillain","tent","tulip","word count"]],["has","github"]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-92466753","guard":[["hasAny",["copies","dagger","digit count","fire","fountain","frog","how many digits","kaaba","keyboard","madagascar","mango","number of digits","say it times","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-9c1c6f08","guard":[["hasAny",["dagger","fire","fountain","frog","invert case","kaaba","keyboard","madagascar","mango","normalise","normalize","simplify the text","socks","supervillain","swap case","tent","toggle case","tulip"]],["has","github"]],"pyramid":["render.str",["transform.swapCase",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-9f2a7066","guard":[["hasAny",["dagger","each word","fire","first n","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","take","tent","tulip"]],["has","github"]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-a61c059e","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","madagascar","mango","normalise","normalize","simplify the text","socks","split into words","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["transform.words",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-a97903f3","guard":[["hasAny",["dagger","digit count","fire","fountain","frog","how many digits","kaaba","keyboard","madagascar","mango","number of digits","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.lines",["iterate.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-aad94812","guard":[["hasAny",["dagger","digit count","fire","fountain","frog","how many digits","kaaba","keyboard","madagascar","mango","number of digits","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-b99dd873","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","separate by","socks","split","split by","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.and",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-c06fef58","guard":[["hasAny",["dagger","fire","fountain","frog","how many words","item number","kaaba","keyboard","madagascar","mango","nth","number of words","position","socks","supervillain","tent","tulip","word count"]],["has","github"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-c4a1cee3","guard":[["hasAny",["dagger","each word","fire","first n","fountain","frog","kaaba","keyboard","madagascar","mango","socks","split into words","supervillain","take","tent","tulip"]],["has","github"]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-c57db354","guard":[["hasAny",["dagger","distinct","fire","fountain","frog","item number","kaaba","keyboard","madagascar","mango","nth","position","remove duplicates","socks","supervillain","tent","tulip","unique","without repeats"]],["has","github"]],"pyramid":["render.str",["transform.nthStr",["transform.uniqueStrs",["sense.words"]],["sense.wordCount"]]],"mem":null},
{"id":"n-ca50bcbf","guard":[["hasAny",["dagger","delete","fire","fountain","frog","kaaba","keyboard","madagascar","mango","remove","socks","strip out","supervillain","tent","tulip","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-cdc938e2","guard":[["hasAny",["dagger","digit count","fire","fountain","frog","how many digits","kaaba","keyboard","madagascar","mango","number of digits","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-ce17a202","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","separate by","socks","split","split by","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-d3580416","guard":[["hasAny",["dagger","delete","fire","fountain","frog","kaaba","keyboard","madagascar","mango","remove","socks","strip out","supervillain","tent","tulip","without"]]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-d648e64d","guard":[["hasAny",["alphabetize the letters","dagger","delete","fire","fountain","frog","kaaba","keyboard","letters in order","madagascar","mango","remove","socks","sort the letters","strip out","supervillain","tent","tulip","without"]],["has","github"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["transform.sortLetters",["sense.lastWord"]]]],"mem":null},
{"id":"n-dd7464e1","guard":[["hasAny",["copies","dagger","fire","fountain","frog","how many words","kaaba","keyboard","madagascar","mango","number of words","say it times","socks","supervillain","tent","tulip","word count"]],["has","github"]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-edec5683","guard":[["hasAny",["arrow","chart","cherries","chopsticks","coffin","each word","handshake","item number","ninja","nth","position","seedling","shield","ship","sled","split into words","trackball"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["transform.words",["sense.text"]],{"lit":5}]],"mem":null},
{"id":"n-f0789d11","guard":[["hasAny",["dagger","fire","fountain","frog","how many words","kaaba","keyboard","madagascar","mango","normalise","normalize","number of words","simplify the text","socks","supervillain","tent","tulip","word count"]],["has","github"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-f76ca536","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","normalise","normalize","simplify the text","socks","supervillain","tent","title case","tulip"]],["has","github"]],"pyramid":["render.str",["transform.title",["transform.norm",["sense.subject"],{"lit":1}]]],"mem":null},
{"id":"n-f79ef562","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","normalise","normalize","reverse the words","reverse word order","simplify the text","socks","supervillain","tent","tulip","words backwards"]],["has","github"]],"pyramid":["render.str",["transform.reverseWords",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-f8d4c9c6","guard":[["hasAny",["dagger","digit count","fire","fountain","frog","how many digits","kaaba","keyboard","madagascar","mango","number of digits","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-fe58805a","guard":[["hasAny",["dagger","digit count","fire","fountain","frog","how many digits","kaaba","keyboard","madagascar","mango","number of digits","socks","supervillain","tent","tulip"]],["has","github"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-49395b50","guard":[["hasAny",["change to","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","replace","socks","substitute","supervillain","swap","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.wordAt",{"lit":2}],["sense.subject"]]],"mem":null},
{"id":"n-4ce310ac","guard":[["hasAny",["change to","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","replace","socks","substitute","supervillain","swap","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.wordAt",{"lit":2}],["sense.lastWord"]]],"mem":null},
{"id":"n-ba56def2","guard":[["hasAny",["change to","dagger","fire","fountain","frog","kaaba","keyboard","madagascar","mango","replace","socks","substitute","supervillain","swap","tent","tulip"]],["has","github"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.wordAt",{"lit":2}],["sense.text"]]],"mem":null},
{"id":"n-036ceabb","guard":[["hasAny",["backwards","dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","reverse","reverse order","reversed","socks","split into words","supervillain","tent","tulip","words"]]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-1fb1b8c2","guard":[["hasAny",["backwards","dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","reverse","reverse order","reversed","socks","split into words","supervillain","tent","tulip","words"]]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-91ec10d9","guard":[["hasAny",["backwards","dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","reverse","reverse order","reversed","socks","split into words","supervillain","tent","tulip","words"]]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-20bfb541","guard":[["hasAny",["backwards","dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","reverse order","reversed","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]]],"mem":null},
{"id":"n-3f684b66","guard":[["hasAny",["backwards","dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","reverse order","reversed","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.list",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]]],"mem":null},
{"id":"n-4d4a6baf","guard":[["hasAny",["backwards","dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","reverse order","reversed","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.list",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]]],"mem":null},
{"id":"n-53f0a7a0","guard":[["hasAny",["backwards","dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","reverse order","reversed","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-5e751e80","guard":[["hasAny",["backwards","dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","reverse order","reversed","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.and",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]]],"mem":null},
{"id":"n-635e7ae8","guard":[["hasAny",["backwards","dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","reverse order","reversed","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.and",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]]],"mem":null},
{"id":"n-6e08f6a2","guard":[["hasAny",["backwards","dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","reverse order","reversed","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]]],"mem":null},
{"id":"n-935cc096","guard":[["hasAny",["backwards","dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","reverse order","reversed","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.and",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-a9b75871","guard":[["hasAny",["backwards","capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","kaaba","keyboard","mango","mirror","reverse","reversed","socks","spell backwards","supervillain","tent","title case","tulip"]]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["sense.after",{"lit":"for"}]]]]],"mem":null},
{"id":"n-b74cf6df","guard":[["hasAny",["backwards","dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","reverse order","reversed","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.list",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-01f7f0a0","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","socks","split into words","supervillain","tent","tulip","words"]]],"pyramid":["render.list",["transform.words",["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-224e1c2c","guard":[["hasAny",["dagger","fire","fountain","frog","invert case","kaaba","keyboard","mango","socks","supervillain","swap case","tent","toggle case","tulip"]]],"pyramid":["render.str",["transform.swapCase",["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-3103b038","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","kaaba","keyboard","mango","socks","supervillain","tent","title case","tulip"]]],"pyramid":["render.str",["transform.title",["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-49501d50","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","mango","small letters","socks","supervillain","tent","tulip"]]],"pyramid":["render.str",["transform.lower",["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-da81333f","guard":[["hasAny",["all caps","capital letters","capitals","dagger","fire","fountain","frog","kaaba","keyboard","mango","socks","supervillain","tent","tulip","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-dea2267e","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","socks","split into words","supervillain","tent","tulip","words"]]],"pyramid":["render.and",["transform.words",["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-e12b352e","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","mango","reverse the words","reverse word order","socks","supervillain","tent","tulip","words backwards"]]],"pyramid":["render.str",["transform.reverseWords",["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-ee09a968","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","socks","split into words","supervillain","tent","tulip","words"]]],"pyramid":["render.lines",["transform.words",["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-053ad5c9","guard":[["hasAny",["dagger","each word","fire","fountain","frog","invert case","kaaba","keyboard","mango","socks","split into words","supervillain","swap case","tent","toggle case","tulip","words"]]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-0704de62","guard":[["hasAny",["abbreviate","acronym","dagger","delete","fire","fountain","frog","kaaba","keyboard","mango","remove","socks","strip out","supervillain","tent","tulip","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.acronym",["sense.lastWord"]]]],"mem":null},
{"id":"n-0ea486cd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","kaaba","keyboard","mango","separate by","socks","split","split by","supervillain","tent","title case","tulip"]],["has","give"]],"pyramid":["render.list",["transform.split",["sense.subject"],["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-18e11690","guard":[["hasAny",["abbreviate","acronym","dagger","fire","fountain","frog","kaaba","keyboard","mango","separate by","socks","split","split by","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.list",["transform.split",["sense.subject"],["transform.acronym",["sense.lastWord"]]]],"mem":null},
{"id":"n-196dcd74","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","delete","fire","fountain","frog","kaaba","keyboard","mango","remove","socks","strip out","supervillain","tent","title case","tulip","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["transform.title",["sense.subject"]],["sense.lastWord"]]],"mem":null},
{"id":"n-206d9bf2","guard":[["hasAny",["dagger","each word","fire","fountain","frog","invert case","kaaba","keyboard","mango","socks","split into words","supervillain","swap case","tent","toggle case","tulip","words"]]],"pyramid":["render.list",["transform.words",["transform.swapCase",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-24154c62","guard":[["hasAny",["abbreviate","acronym","dagger","fire","fountain","frog","kaaba","keyboard","mango","separate by","socks","split","split by","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.and",["transform.split",["sense.subject"],["transform.acronym",["sense.lastWord"]]]],"mem":null},
{"id":"n-2b48bc74","guard":[["hasAny",["a to z","alphabetical","alphabetize","apple","cartwheeling","chart","cherries","chopsticks","coffin","dagger","deer","fire","fountain","frog","item number","nth","position"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":1}]],"mem":null},
{"id":"n-2f434140","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","delete","fire","fountain","frog","kaaba","keyboard","mango","remove","socks","strip out","supervillain","tent","title case","tulip","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-342f80fe","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","delete","fire","fountain","frog","kaaba","keyboard","mango","remove","socks","strip out","supervillain","tent","title case","tulip","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["transform.title",["sense.subject"]],["sense.subject"]]],"mem":null},
{"id":"n-3d9106b2","guard":[["hasAny",["abbreviate","acronym","dagger","fire","fountain","frog","kaaba","keyboard","mango","separate by","socks","split","split by","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.lines",["transform.split",["sense.subject"],["transform.acronym",["sense.lastWord"]]]],"mem":null},
{"id":"n-3ef6f780","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","socks","split into words","supervillain","tent","title case","tulip","words"]]],"pyramid":["render.list",["transform.words",["transform.title",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-423844a3","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","mango","reverse the words","reverse word order","small letters","socks","supervillain","tent","tulip","words backwards"]]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-45093500","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","delete","fire","fountain","frog","kaaba","keyboard","mango","remove","socks","strip out","supervillain","tent","title case","tulip","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-514668da","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","delete","fire","fountain","frog","kaaba","keyboard","mango","remove","socks","strip out","supervillain","tent","title case","tulip","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["transform.title",["sense.lastWord"]],["sense.lastWord"]]],"mem":null},
{"id":"n-53b2b48d","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","shortest","shortest one","shortest word","socks","split into words","supervillain","tent","tulip","words"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-54b46768","guard":[["hasAny",["a to z","alphabetical","alphabetize","england","handshake","hook","item number","kaaba","keyboard","mango","mosque","ninja","nth","position","seedling","shield","ship"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-5564e7f5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","kaaba","keyboard","mango","separate by","socks","split","split by","supervillain","tent","title case","tulip"]],["has","give"]],"pyramid":["render.list",["transform.split",["transform.title",["sense.subject"]],["sense.lastWord"]]],"mem":null},
{"id":"n-564e3e1d","guard":[["hasAny",["dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]],"mem":null},
{"id":"n-58a51a06","guard":[["hasAny",["all caps","capital letters","capitals","dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","socks","split into words","supervillain","tent","tulip","upper case","uppercase","words"]]],"pyramid":["render.lines",["transform.words",["transform.upper",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-5b7004eb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","delete","fire","fountain","frog","kaaba","keyboard","mango","remove","socks","strip out","supervillain","tent","title case","tulip","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-5e5c6511","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","mango","socks","supervillain","tent","tulip"]]],"pyramid":["render.list",["iterate.repeat",["sense.after",{"lit":"for"}],{"lit":1}]],"mem":null},
{"id":"n-60943d98","guard":[["hasAny",["dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]],"mem":null},
{"id":"n-6753a11f","guard":[["hasAny",["dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]],"mem":null},
{"id":"n-6a2e1636","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","invert case","kaaba","keyboard","mango","socks","supervillain","swap case","tent","title case","toggle case","tulip"]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-6caf875a","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","mango","normalise","normalize","simplify the text","socks","supervillain","tent","tulip"]]],"pyramid":["render.str",["transform.norm",["sense.after",{"lit":"for"}],{"lit":2}]],"mem":null},
{"id":"n-6fd9113b","guard":[["hasAny",["all caps","capital letters","capitals","dagger","fire","fountain","frog","kaaba","keyboard","mango","reverse the words","reverse word order","socks","supervillain","tent","tulip","upper case","uppercase","words backwards"]]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-7c085db9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","socks","split into words","supervillain","tent","title case","tulip","words"]]],"pyramid":["render.lines",["transform.words",["transform.title",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-7dfebf3f","guard":[["hasAny",["count","github","how many","how many items","normalise","normalize","number of items","simplify the text"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-7ef6a15b","guard":[["hasAny",["dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-7f3fcf4e","guard":[["hasAny",["all caps","capital letters","capitals","dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","socks","split into words","supervillain","tent","tulip","upper case","uppercase","words"]]],"pyramid":["render.list",["transform.words",["transform.upper",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-82934401","guard":[["hasAny",["consonant count","deer","frog","hook","how many consonants","item number","mango","mosque","nth","number of consonants","position","snake","speedboat","tent","toothbrush","troll","tulip"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.consonants",["sense.subject"]]]],"mem":null},
{"id":"n-832e2c00","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","mango","normalise","normalize","simplify the text","socks","supervillain","tent","tulip"]]],"pyramid":["render.str",["transform.norm",["sense.after",{"lit":"for"}],{"lit":1}]],"mem":null},
{"id":"n-84e78550","guard":[["hasAny",["dagger","fire","fountain","frog","invert case","kaaba","keyboard","mango","reverse the words","reverse word order","socks","supervillain","swap case","tent","toggle case","tulip","words backwards"]]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-857f6aba","guard":[["hasAny",["dagger","delete","fire","fountain","frog","kaaba","keyboard","longest","longest one","longest word","madagascar","mango","remove","socks","strip out","tent","tulip","without"]],["has","github"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-8b7e5bb4","guard":[["hasAny",["dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]],"mem":null},
{"id":"n-8c1c3a85","guard":[["hasAny",["a to z","alphabetical","alphabetize","dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","socks","sort","split into words","supervillain","tent","tulip","words"]]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-93fa8732","guard":[["hasAny",["dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-976ac7db","guard":[["hasAny",["dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]],"mem":null},
{"id":"n-9d386d83","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","mango","small letters","socks","split into words","supervillain","tent","tulip","words"]]],"pyramid":["render.and",["transform.words",["transform.lower",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-9f67e0ee","guard":[["hasAny",["dagger","delete","fire","fountain","frog","kaaba","keyboard","longest","longest one","longest word","madagascar","mango","remove","socks","strip out","tent","tulip","without"]],["has","github"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-a0b7a8fd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","delete","fire","fountain","frog","kaaba","keyboard","mango","remove","socks","strip out","supervillain","tent","title case","tulip","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["transform.title",["sense.lastWord"]],["sense.subject"]]],"mem":null},
{"id":"n-ab210ca4","guard":[["hasAny",["abbreviate","acronym","dagger","delete","fire","fountain","frog","kaaba","keyboard","mango","remove","socks","strip out","supervillain","tent","tulip","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["transform.acronym",["sense.subject"]]]],"mem":null},
{"id":"n-b61f78bb","guard":[["hasAny",["abbreviate","acronym","dagger","delete","fire","fountain","frog","kaaba","keyboard","mango","remove","socks","strip out","supervillain","tent","tulip","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["transform.acronym",["sense.lastWord"]]]],"mem":null},
{"id":"n-b7792b4c","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","mango","small letters","socks","split into words","supervillain","tent","tulip","words"]]],"pyramid":["render.list",["transform.words",["transform.lower",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-c3b385d6","guard":[["hasAny",["dagger","each word","fire","fountain","frog","kaaba","keyboard","lower case","lowercase","mango","small letters","socks","split into words","supervillain","tent","tulip","words"]]],"pyramid":["render.lines",["transform.words",["transform.lower",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-c479652e","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","mango","normalise","normalize","simplify the text","socks","supervillain","tent","tulip"]]],"pyramid":["render.str",["transform.norm",["sense.after",{"lit":"shortcode"}],{"lit":3}]],"mem":null},
{"id":"n-c9c9b81c","guard":[["hasAny",["all caps","capital letters","capitals","dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","socks","split into words","supervillain","tent","tulip","upper case","uppercase","words"]]],"pyramid":["render.and",["transform.words",["transform.upper",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-caf5ebf6","guard":[["hasAny",["a to z","alphabetical","alphabetize","dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","socks","sort","split into words","supervillain","tent","tulip","words"]]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-cef467f9","guard":[["hasAny",["consonant count","deer","frog","hook","how many consonants","item number","mango","mosque","nth","number of consonants","position","snake","speedboat","tent","toothbrush","troll","tulip"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-d2129f2b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","fire","fountain","frog","kaaba","keyboard","mango","reverse the words","reverse word order","socks","supervillain","tent","title case","tulip","words backwards"]]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-e28e119e","guard":[["hasAny",["a to z","alphabetical","alphabetize","dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","socks","sort","split into words","supervillain","tent","tulip","words"]]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-e4b3aead","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","each word","fire","fountain","frog","kaaba","keyboard","mango","socks","split into words","supervillain","tent","title case","tulip","words"]]],"pyramid":["render.and",["transform.words",["transform.title",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-e681e064","guard":[["hasAny",["github","half","half of","halve","normalise","normalize","simplify the text"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["transform.half",["sense.wordCount"]]]],"mem":null},
{"id":"n-e6cb5eec","guard":[["hasAny",["abbreviate","acronym","dagger","delete","fire","fountain","frog","kaaba","keyboard","mango","remove","socks","strip out","supervillain","tent","tulip","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.acronym",["sense.subject"]]]],"mem":null},
{"id":"n-ecc888b8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dagger","delete","fire","fountain","frog","kaaba","keyboard","mango","remove","socks","strip out","supervillain","tent","title case","tulip","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-f0613378","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","mango","normalise","normalize","simplify the text","socks","supervillain","tent","tulip"]]],"pyramid":["render.str",["transform.norm",["sense.after",{"lit":"shortcode"}],{"lit":2}]],"mem":null},
{"id":"n-f31a334b","guard":[["hasAny",["dagger","fire","fountain","frog","kaaba","keyboard","mango","normalise","normalize","simplify the text","socks","supervillain","tent","tulip"]]],"pyramid":["render.str",["transform.norm",["sense.after",{"lit":"for"}],{"lit":3}]],"mem":null},
{"id":"n-f3a2fd9d","guard":[["hasAny",["dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]],"mem":null},
{"id":"n-f7abb541","guard":[["hasAny",["dagger","each word","fire","fountain","frog","invert case","kaaba","keyboard","mango","socks","split into words","supervillain","swap case","tent","toggle case","tulip","words"]]],"pyramid":["render.and",["transform.words",["transform.swapCase",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-ffca9e35","guard":[["hasAny",["dagger","fire","fountain","frog","from position","items from to","kaaba","keyboard","mango","slice","socks","supervillain","tent","tulip"]],["has","give"]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-196e2c38","guard":[["hasAny",["change to","dagger","fire","fountain","frog","kaaba","keyboard","mango","replace","socks","substitute","supervillain","swap","tent","tulip"]]],"pyramid":["render.str",["transform.replace",["sense.after",{"lit":"for"}],["sense.subject"],["sense.lastWord"]]],"mem":null},
{"id":"n-3d947def","guard":[["hasAny",["bear","bicycles","blue","bottle","carousel","claus","disk","dog","drink","flags","item number","nth","office","position"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-79841b65","guard":[["hasAny",["bear","bicycles","blue","bottle","carousel","claus","disk","dog","drink","flags","item number","nth","office","position"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.subject"]],"mem":null},
{"id":"n-b935b576","guard":[["hasAny",["change to","dagger","fire","fountain","frog","kaaba","keyboard","mango","replace","socks","substitute","supervillain","swap","tent","tulip"]]],"pyramid":["render.str",["transform.replace",["sense.after",{"lit":"for"}],["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-c36a399b","guard":[["hasAny",["change to","dagger","fire","fountain","frog","kaaba","keyboard","mango","replace","socks","substitute","supervillain","swap","tent","tulip"]]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-f7ba9703","guard":[["hasAny",["change to","dagger","fire","fountain","frog","kaaba","keyboard","mango","replace","socks","substitute","supervillain","swap","tent","tulip"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-6434eed2","guard":[["hasAny",["all caps","bear","bicycles","blue","bottle","capital letters","capitals","carousel","claus","disk","dog","drink","flags","item number","nth","office","position","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-82ec29bb","guard":[["hasAny",["bear","bicycles","blue","bottle","capitalise","capitalize","capitalize each word","carousel","claus","disk","dog","drink","flags","item number","nth","office","position","title case"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8eeaeb92","guard":[["hasAny",["bear","bicycles","blue","bottle","carousel","claus","disk","dog","drink","flags","item number","lower case","lowercase","nth","office","position","small letters"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-abf8495f","guard":[["hasAny",["bear","bicycles","blue","bottle","carousel","claus","disk","dog","drink","flags","invert case","item number","nth","office","position","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ccdb2c3d","guard":[["hasAny",["bear","bicycles","blue","bottle","carousel","claus","disk","dog","drink","each word","flags","item number","nth","office","position","split into words"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e3f6cccb","guard":[["hasAny",["bear","bicycles","blue","bottle","carousel","claus","disk","dog","drink","each word","flags","item number","nth","office","position","split into words"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-13983a25","guard":[["hasAny",["dagger","fire","frog","how many vowels","kaaba","keyboard","mango","normalise","normalize","number of vowels","simplify the text","socks","tent","tulip","vowel count"]],["has","give"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-33309f56","guard":[["hasAny",["dagger","fire","frog","how many vowels","kaaba","keyboard","mango","normalise","normalize","number of vowels","simplify the text","socks","tent","tulip","vowel count"]],["has","give"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-7f0433d3","guard":[["hasAny",["dagger","fire","frog","how many vowels","kaaba","keyboard","mango","normalise","normalize","number of vowels","simplify the text","socks","tent","tulip","vowel count"]],["has","give"]],"pyramid":["render.str",["transform.norm",["sense.subject"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-c509696a","guard":[["hasAny",["a to z","alphabetical","alphabetize","apple","cartwheeling","chart","cherries","chopsticks","coffin","dagger","deer","fire","item number","nth","position"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":1}]],"mem":null},
{"id":"n-f3820fac","guard":[["hasAny",["a to z","alphabetical","alphabetize","england","fountain","frog","handshake","hook","item number","ninja","nth","position","seedling","shield","ship"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":2}]],"mem":null},
{"id":"n-f59b7564","guard":[["hasAny",["cartwheeling","each word","hungary","longest","longest one","longest word","monaco","mosque","nepal","snake","speedboat","split into words","toothbrush","troll","words"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-00a8cec2","guard":[["hasAny",["backwards","cartwheeling","chopsticks","handshake","longest","longest one","longest word","madagascar","reverse order","reversed","speedboat","supervillain","toothbrush","trackball"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-7bfe1276","guard":[["hasAny",["backwards","cartwheeling","chopsticks","handshake","invert case","longest","longest one","longest word","madagascar","reverse order","reversed","speedboat","supervillain","swap case","toggle case","toothbrush","trackball"]],["has","shortcode"]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["transform.reverseStrs",["sense.words"]]]]],"mem":null},
{"id":"n-9131877f","guard":[["hasAny",["backwards","cartwheeling","chopsticks","handshake","longest","longest one","longest word","madagascar","reverse order","reversed","speedboat","supervillain","toothbrush","trackball"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["aggregate.longest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-92597cb6","guard":[["hasAny",["backwards","capitalise","capitalize","capitalize each word","cartwheeling","chopsticks","handshake","longest","longest one","longest word","madagascar","reverse order","reversed","speedboat","supervillain","title case","toothbrush","trackball"]],["has","shortcode"]],"pyramid":["render.str",["transform.title",["aggregate.longest",["transform.reverseStrs",["sense.words"]]]]],"mem":null},
{"id":"n-eabafc09","guard":[["hasAny",["backwards","cartwheeling","chopsticks","each word","handshake","longest","longest one","longest word","madagascar","reverse order","reversed","speedboat","split into words","supervillain","toothbrush","trackball"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["transform.words",["sense.text"]]]]],"mem":null},
{"id":"n-19359dec","guard":[["hasAny",["backwards","bear","carousel","disk","dog","drink","flags","inbox","item number","nth","office","position","reverse order","reversed","shortest","shortest one","shortest word"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-7c2ce5e1","guard":[["hasAny",["baby","bicycles","blue","claus","farmer","helena","item number","nth","position","shortest","shortest one","shortest word"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f480db69","guard":[["hasAny",["a to z","alphabetical","alphabetize","backwards","cartwheeling","chopsticks","longest","longest one","longest word","madagascar","reverse order","reversed","speedboat","supervillain","toothbrush","trackball"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["transform.sortStrs",["sense.words"]]]]],"mem":null},
{"id":"n-a160bdcd","guard":[["hasAny",["deer","hook","item number","mosque","nth","position","snake","speedboat","toothbrush","troll"]],["has","what"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0a044c29","guard":[["hasAny",["a to z","alphabetical","alphabetize","item number","joy","kaaba","keyboard","mango","monaco","nepal","nth","position","trackball"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":4}]],"mem":null},
{"id":"n-4bea5cef","guard":[["hasAny",["a to z","alphabetical","alphabetize","item number","madagascar","nth","position","relieved","snake","socks","speedboat","supervillain","tent"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":5}]],"mem":null},
{"id":"n-6056e941","guard":[["hasAny",["deer","hook","invert case","item number","mosque","nth","position","snake","speedboat","swap case","toggle case","toothbrush","troll"]],["has","what"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-76c3fdc8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","deer","hook","item number","mosque","nth","position","snake","speedboat","title case","toothbrush","troll"]],["has","what"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-bea50a9f","guard":[["hasAny",["deer","hook","item number","mosque","nth","position","snake","speedboat","toothbrush","troll"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7004f9c8","guard":[["hasAny",["bear","carousel","disk","dog","drink","flags","inbox","item number","nth","position","shortest","shortest one","shortest word"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4ede0aed","guard":[["hasAny",["baby","backwards","bicycles","blue","claus","helena","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["aggregate.shortest",["transform.reverseStrs",["sense.content"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4f2e604f","guard":[["hasAny",["a to z","alphabetical","alphabetize","cartwheeling","chopsticks","handshake","longest","longest one","longest word","madagascar","supervillain","toothbrush"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["sense.words"]]]],"mem":null},
{"id":"n-1c65d7bb","guard":[["hasAny",["england","hungary","lower case","lowercase","madagascar","monaco","nepal","paraguay","separate by","small letters","split","split by"]],["has","shortcode"]],"pyramid":["render.list",["transform.split",["transform.lower",["sense.subject"]],["sense.lastWord"]]],"mem":null},
{"id":"n-4322183d","guard":[["hasAny",["delete","england","hungary","lower case","lowercase","madagascar","monaco","nepal","paraguay","remove","small letters","strip out","without"]],["has","shortcode"]],"pyramid":["render.str",["transform.remove",["transform.lower",["sense.subject"]],["sense.lastWord"]]],"mem":null},
{"id":"n-4fe44e03","guard":[["hasAny",["delete","england","hungary","lower case","lowercase","madagascar","monaco","nepal","paraguay","remove","small letters","strip out","without"]],["has","shortcode"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["transform.lower",["sense.lastWord"]]]],"mem":null},
{"id":"n-a2310d69","guard":[["hasAny",["consonant count","fire","frog","how many consonants","kaaba","mango","normalise","normalize","number of consonants","simplify the text","tent","tulip"]],["has","give"]],"pyramid":["render.str",["transform.norm",["sense.subject"],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-a9762476","guard":[["hasAny",["england","hungary","lower case","lowercase","madagascar","monaco","nepal","paraguay","separate by","small letters","split","split by"]],["has","shortcode"]],"pyramid":["render.list",["transform.split",["sense.subject"],["transform.lower",["sense.lastWord"]]]],"mem":null},
{"id":"n-d33dcb51","guard":[["hasAny",["consonant count","fire","frog","how many consonants","kaaba","mango","normalise","normalize","number of consonants","simplify the text","tent","tulip"]],["has","give"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.consonants",["sense.subject"]]]],"mem":null},
{"id":"n-f2dc1efd","guard":[["hasAny",["consonant count","fire","frog","how many consonants","kaaba","mango","normalise","normalize","number of consonants","simplify the text","tent","tulip"]],["has","give"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-6d29d7f7","guard":[["hasAny",["cartwheeling","chopsticks","longest","longest one","longest word","madagascar","supervillain","toothbrush"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1c2cdf1f","guard":[["hasAny",["cartwheeling","chopsticks","longest","longest one","longest word","madagascar","supervillain","toothbrush"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4696601c","guard":[["hasAny",["cartwheeling","chopsticks","invert case","longest","longest one","longest word","madagascar","supervillain","swap case","toggle case","toothbrush"]],["has","shortcode"]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-6ec092c5","guard":[["hasAny",["england","hungary","monaco","nepal","paraguay","separate by","split","split by"]],["has","shortcode"]],"pyramid":["render.list",["transform.split",["sense.subject"],["sense.lastWord"]]],"mem":null},
{"id":"n-835b86b8","guard":[["hasAny",["delete","england","hungary","monaco","nepal","paraguay","remove","strip out","without"]],["has","shortcode"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.lastWord"]]],"mem":null},
{"id":"n-95c661b5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cartwheeling","chopsticks","longest","longest one","longest word","madagascar","supervillain","title case","toothbrush"]],["has","shortcode"]],"pyramid":["render.str",["transform.title",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-9bf00e62","guard":[["hasAny",["apple","england","item number","joy","madagascar","nth","paraguay","position"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fbebbb8b","guard":[["hasAny",["cartwheeling","chopsticks","each word","longest","longest one","longest word","madagascar","split into words","supervillain","toothbrush"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.text"]]]],"mem":null},
{"id":"n-01500b5d","guard":[["hasAny",["all caps","capital letters","capitals","delete","england","hungary","monaco","nepal","paraguay","remove","strip out","upper case","uppercase","without"]],["has","shortcode"]],"pyramid":["render.str",["transform.upper",["transform.remove",["sense.subject"],["sense.lastWord"]]]],"mem":null},
{"id":"n-06c16481","guard":[["hasAny",["cartwheeling","chart","divisor count","how many factors","hungary","item number","monaco","nepal","nth","number of divisors","position"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-09ecf3c6","guard":[["hasAny",["delete","england","hungary","longest","longest one","longest word","monaco","nepal","paraguay","remove","strip out","without"]],["has","shortcode"]],"pyramid":["render.str",["transform.remove",["aggregate.longest",["sense.list"]],["sense.lastWord"]]],"mem":null},
{"id":"n-1518fa03","guard":[["hasAny",["delete","england","hungary","monaco","nepal","paraguay","remove","shortest","shortest one","shortest word","strip out","without"]],["has","shortcode"]],"pyramid":["render.str",["transform.remove",["aggregate.shortest",["sense.list"]],["sense.lastWord"]]],"mem":null},
{"id":"n-380d982a","guard":[["hasAny",["delete","each word","england","hungary","monaco","nepal","paraguay","remove","split into words","strip out","without"]],["has","shortcode"]],"pyramid":["render.list",["transform.words",["transform.remove",["sense.subject"],["sense.lastWord"]]]],"mem":null},
{"id":"n-3cf0278e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","delete","england","hungary","monaco","nepal","paraguay","remove","strip out","title case","without"]],["has","shortcode"]],"pyramid":["render.str",["transform.title",["transform.remove",["sense.subject"],["sense.lastWord"]]]],"mem":null},
{"id":"n-3e0dbfed","guard":[["hasAny",["delete","england","hungary","monaco","nepal","paraguay","remove","reverse the words","reverse word order","strip out","without","words backwards"]],["has","shortcode"]],"pyramid":["render.str",["transform.reverseWords",["transform.remove",["sense.subject"],["sense.lastWord"]]]],"mem":null},
{"id":"n-449174da","guard":[["hasAny",["delete","each word","england","hungary","monaco","nepal","paraguay","remove","split into words","strip out","without"]],["has","shortcode"]],"pyramid":["render.lines",["transform.words",["transform.remove",["sense.subject"],["sense.lastWord"]]]],"mem":null},
{"id":"n-4f0ad3bc","guard":[["hasAny",["apple","england","item number","joy","madagascar","nth","paraguay","position"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-547fb3ef","guard":[["hasAny",["apple","england","invert case","item number","joy","madagascar","nth","paraguay","position","swap case","toggle case"]],["has","shortcode"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-5bd31694","guard":[["hasAny",["apple","capitalise","capitalize","capitalize each word","england","item number","joy","madagascar","nth","paraguay","position","title case"]],["has","shortcode"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-5be2911a","guard":[["hasAny",["england","hungary","longest","longest one","longest word","monaco","nepal","paraguay","separate by","split","split by"]],["has","shortcode"]],"pyramid":["render.list",["transform.split",["aggregate.longest",["sense.list"]],["sense.lastWord"]]],"mem":null},
{"id":"n-5c5cc8a1","guard":[["hasAny",["delete","england","hungary","lower case","lowercase","monaco","nepal","paraguay","remove","small letters","strip out","without"]],["has","shortcode"]],"pyramid":["render.str",["transform.lower",["transform.remove",["sense.subject"],["sense.lastWord"]]]],"mem":null},
{"id":"n-6eb09df7","guard":[["hasAny",["dagger","delete","fountain","keyboard","madagascar","remove","shortest","shortest one","shortest word","strip out","supervillain","without"]],["has","github"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-70f7a866","guard":[["hasAny",["a to z","alphabetical","alphabetize","arrow","hungary","item number","mosque","nth","paraguay","position","sled"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":3}]],"mem":null},
{"id":"n-72f8bf72","guard":[["hasAny",["cartwheeling","chopsticks","first n","longest","longest one","longest word","madagascar","supervillain","take","toothbrush"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-8e285560","guard":[["hasAny",["delete","england","hungary","invert case","monaco","nepal","paraguay","remove","strip out","swap case","toggle case","without"]],["has","shortcode"]],"pyramid":["render.str",["transform.swapCase",["transform.remove",["sense.subject"],["sense.lastWord"]]]],"mem":null},
{"id":"n-a51628ad","guard":[["hasAny",["england","hungary","monaco","nepal","paraguay","separate by","shortest","shortest one","shortest word","split","split by"]],["has","shortcode"]],"pyramid":["render.list",["transform.split",["aggregate.shortest",["sense.list"]],["sense.lastWord"]]],"mem":null},
{"id":"n-bd55eff9","guard":[["hasAny",["delete","england","hungary","monaco","nepal","paraguay","remove","reverse the words","reverse word order","strip out","without","words backwards"]],["has","shortcode"]],"pyramid":["render.str",["transform.remove",["transform.reverseWords",["sense.subject"]],["sense.lastWord"]]],"mem":null},
{"id":"n-d563a3ce","guard":[["hasAny",["dagger","delete","fountain","keyboard","madagascar","remove","shortest","shortest one","shortest word","strip out","supervillain","without"]],["has","github"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-db120000","guard":[["hasAny",["dagger","fountain","keyboard","madagascar","separate by","shortest","shortest one","shortest word","split","split by","supervillain"]],["has","github"]],"pyramid":["render.list",["transform.split",["sense.subject"],["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-db15c46b","guard":[["hasAny",["cartwheeling","chart","hungary","item number","monaco","nepal","nth","position","root of","sqrt","square root"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["compute.sqrt",["sense.wordCount"]]]],"mem":null},
{"id":"n-ec55af04","guard":[["hasAny",["dagger","fountain","keyboard","madagascar","separate by","shortest","shortest one","shortest word","split","split by","supervillain"]],["has","github"]],"pyramid":["render.lines",["transform.split",["sense.subject"],["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-eedcd90b","guard":[["hasAny",["dagger","fountain","keyboard","madagascar","separate by","shortest","shortest one","shortest word","split","split by","supervillain"]],["has","github"]],"pyramid":["render.and",["transform.split",["sense.subject"],["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-f3cabc83","guard":[["hasAny",["delete","each word","england","hungary","monaco","nepal","paraguay","remove","split into words","strip out","without"]],["has","shortcode"]],"pyramid":["render.and",["transform.words",["transform.remove",["sense.subject"],["sense.lastWord"]]]],"mem":null},
{"id":"n-75168f20","guard":[["hasAny",["england","hungary","monaco","nepal","paraguay","separate by","split","split by"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["render.and",["transform.split",["sense.subject"],["sense.lastWord"]]]],"mem":null},
{"id":"n-da471806","guard":[["hasAny",["england","hungary","monaco","nepal","paraguay","separate by","split","split by"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["render.list",["transform.split",["sense.subject"],["sense.lastWord"]]]],"mem":null},
{"id":"n-32bbf07e","guard":[["hasAny",["aerial","cat","coaster","framed","item number","nth","pin","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f6d44f74","guard":[["hasAny",["balloon","farmer","inbox","item number","nth","position","symbol"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3be4eff1","guard":[["hasAny",["cartwheeling","chopsticks","delete","longest","longest one","longest word","madagascar","remove","strip out","toothbrush","without"]],["has","shortcode"]],"pyramid":["render.str",["transform.remove",["aggregate.longest",["sense.words"]],["sense.lastWord"]]],"mem":null},
{"id":"n-bb751d7b","guard":[["hasAny",["cartwheeling","chopsticks","first n","longest","longest one","longest word","supervillain","take","toothbrush"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-fa5c5432","guard":[["hasAny",["backwards","bicycles","claus","helena","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["aggregate.shortest",["transform.reverseStrs",["sense.words"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0d10a11d","guard":[["hasAny",["frog","how many vowels","number of vowels","socks","tent","vowel count"]]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-0d3e27eb","guard":[["hasAny",["frog","how many vowels","number of vowels","socks","tent","vowel count"]]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-23c8cc80","guard":[["hasAny",["frog","how many vowels","number of vowels","socks","tent","vowel count"]]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-26634caf","guard":[["hasAny",["frog","how many vowels","number of vowels","socks","tent","vowel count"]]],"pyramid":["render.lines",["iterate.repeat",["sense.subject"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-5771ef0c","guard":[["hasAny",["frog","how many vowels","number of vowels","socks","tent","vowel count"]]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-6eb9f92d","guard":[["hasAny",["frog","how many vowels","number of vowels","socks","tent","vowel count"]]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-8b262375","guard":[["hasAny",["frog","how many vowels","number of vowels","socks","tent","vowel count"]]],"pyramid":["render.lines",["iterate.repeat",["sense.subject"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-9211b8fe","guard":[["hasAny",["copies","frog","how many vowels","number of vowels","say it times","socks","tent","vowel count"]]],"pyramid":["render.str",["transform.repeat",["sense.subject"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-92991292","guard":[["hasAny",["frog","how many vowels","number of vowels","socks","tent","vowel count"]]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-a2e7fa88","guard":[["hasAny",["copies","frog","how many vowels","number of vowels","say it times","socks","tent","vowel count"]]],"pyramid":["render.str",["transform.repeat",["sense.subject"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-ad9fcbe0","guard":[["hasAny",["frog","how many vowels","number of vowels","socks","tent","vowel count"]]],"pyramid":["render.and",["iterate.repeat",["sense.subject"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-cf6b886b","guard":[["hasAny",["frog","how many vowels","number of vowels","socks","tent","vowel count"]]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-e2c027bd","guard":[["hasAny",["copies","frog","how many vowels","number of vowels","say it times","socks","tent","vowel count"]]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-e8c5da38","guard":[["hasAny",["frog","how many vowels","number of vowels","socks","tent","vowel count"]]],"pyramid":["render.and",["iterate.repeat",["sense.subject"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-f07a76a2","guard":[["hasAny",["copies","frog","how many vowels","number of vowels","say it times","socks","tent","vowel count"]]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-f782c45e","guard":[["hasAny",["frog","how many vowels","number of vowels","socks","tent","vowel count"]]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-1c28169d","guard":[["hasAny",["africa","burkina","item number","leone","nth","position"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-14f14d8b","guard":[["hasAny",["africa","burkina","item number","leone","lower case","lowercase","nth","position","small letters"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-361eaa8a","guard":[["hasAny",["africa","all caps","burkina","capital letters","capitals","item number","leone","nth","position","upper case","uppercase"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-5d6d8aa3","guard":[["hasAny",["africa","burkina","capitalise","capitalize","capitalize each word","item number","leone","nth","position","title case"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-aa6c9807","guard":[["hasAny",["africa","burkina","invert case","item number","leone","nth","position","swap case","toggle case"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e133fc4b","guard":[["hasAny",["africa","burkina","leone","separate by","split","split by"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["render.list",["transform.split",["sense.subject"],["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-fb06c6ee","guard":[["hasAny",["africa","burkina","leone","separate by","split","split by"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["render.and",["transform.split",["sense.subject"],["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-658444a2","guard":[["hasAny",["africa","burkina","delete","item number","leone","nth","position","remove","strip out","without"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.remove",["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-b44ffd0d","guard":[["hasAny",["africa","burkina","each word","item number","leone","nth","position","split into words"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bd0c4eaa","guard":[["hasAny",["africa","burkina","each word","item number","leone","nth","position","split into words"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c64fb939","guard":[["hasAny",["africa","burkina","item number","leone","nth","position"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e69cca27","guard":[["hasAny",["caicos","item number","jan","miquelon","nth","position"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-1028e87a","guard":[["hasAny",["all caps","caicos","capital letters","capitals","item number","jan","miquelon","nth","position","upper case","uppercase"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3c135e3f","guard":[["hasAny",["caicos","item number","jan","lower case","lowercase","miquelon","nth","position","small letters"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-56e95fbf","guard":[["hasAny",["caicos","invert case","item number","jan","miquelon","nth","position","swap case","toggle case"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5c3c0068","guard":[["hasAny",["caicos","capitalise","capitalize","capitalize each word","item number","jan","miquelon","nth","position","title case"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a48b1478","guard":[["hasAny",["caicos","delete","item number","jan","miquelon","nth","position","remove","strip out","without"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.remove",["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-c2b629e2","guard":[["hasAny",["caicos","each word","item number","jan","miquelon","nth","position","split into words"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ca3b4da1","guard":[["hasAny",["caicos","each word","item number","jan","miquelon","nth","position","split into words"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5966be27","guard":[["hasAny",["caicos","item number","jan","miquelon","nth","position","separate by","split","split by"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.split",["sense.lastWord"],["sense.subject"]]]],"mem":null},
{"id":"n-3ff079d8","guard":[["hasAny",["alphabetize the letters","backwards","deer","joy","letters in order","reverse order","reversed","shortest","shortest one","shortest word","sort the letters"]]],"pyramid":["render.str",["transform.sortLetters",["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]]],"mem":null},
{"id":"n-53cc60cc","guard":[["hasAny",["arrow","backwards","item number","nth","position","reverse order","reversed","womens"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":3}]],"mem":null},
{"id":"n-54e75300","guard":[["hasAny",["alphabetize the letters","backwards","letters in order","mirror","reversed","shortest","shortest one","shortest word","sled","sort the letters","spell backwards","troll"]]],"pyramid":["render.str",["transform.reverse",["transform.sortLetters",["aggregate.shortest",["sense.content"]]]]],"mem":null},
{"id":"n-d547ee5a","guard":[["hasAny",["arrow","backwards","item number","nth","position","reverse order","reversed","womens"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":3}]],"mem":null},
{"id":"n-4846c637","guard":[["hasAny",["backwards","cat","item number","nth","pin","position","reverse order","reversed","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-08b2aa0f","guard":[["hasAny",["bald","mage","shortest","shortest one","shortest word"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_woman"]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7fe47760","guard":[["hasAny",["alphabetize the letters","deer","joy","letters in order","shortest","shortest one","shortest word","sort the letters"]]],"pyramid":["render.str",["transform.sortLetters",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-24d6cf9b","guard":[["hasAny",["farmer","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_farmer"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-678f6865","guard":[["hasAny",["baby","item number","nth","position"]],["has","shortcode"]],"pyramid":["render.template",{"lit":["baby_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ce287b3d","guard":[["hasAny",["arrow","how many items","item number","nth","number of items","position","womens"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-d9ef0d86","guard":[["hasAny",["cartwheeling","each word","longest","longest one","longest word","split into words","toothbrush","words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-e9ea9a22","guard":[["hasAny",["cat","item number","nth","pin","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4f60d33d","guard":[["hasAny",["bald","item number","kneeling","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bf2cb9bb","guard":[["hasAny",["closed","item number","mage","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-beeab24a","guard":[["hasAny",["british","item number","nth","palm","position"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-17869a34","guard":[["hasAny",["backwards","join","joined with","madagascar","mirror","reverse","reverse order","reversed","separated by","spell backwards"]],["has","give"]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["sense.list"]],["transform.reverse",["sense.lastWord"]]]],"mem":null},
{"id":"n-217db0a5","guard":[["hasAny",["backwards","join","joined with","madagascar","mirror","reverse","reverse order","reversed","separated by","spell backwards"]],["has","give"]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["sense.list"]],["transform.reverse",["sense.text"]]]],"mem":null},
{"id":"n-7dd07597","guard":[["hasAny",["backwards","join","joined with","madagascar","mirror","reverse","reverse order","reversed","separated by","spell backwards"]],["has","give"]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["sense.list"]],["transform.reverse",["sense.subject"]]]],"mem":null},
{"id":"n-249a6e7c","guard":[["hasAny",["backwards","madagascar","reverse","reverse order","reversed"]],["has","give"]],"pyramid":["render.lines",["transform.reverseStrs",["sense.list"]]],"mem":null},
{"id":"n-9fa0adbd","guard":[["hasAny",["backwards","madagascar","reverse","reverse order","reversed"]],["has","give"]],"pyramid":["render.and",["transform.reverseStrs",["sense.list"]]],"mem":null},
{"id":"n-ec977abc","guard":[["hasAny",["backwards","madagascar","reverse","reverse order","reversed"]],["has","give"]],"pyramid":["render.list",["transform.reverseStrs",["sense.list"]]],"mem":null},
{"id":"n-2f1248d1","guard":[["hasAny",["backwards","madagascar","reverse","reverse order","reversed","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-32c181b3","guard":[["hasAny",["arrow","backwards","reverse order","reversed","shortest","shortest one","shortest word"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-964d091e","guard":[["hasAny",["a to z","alphabetical","alphabetize","backwards","madagascar","reverse","reverse order","reversed"]],["has","give"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.sortStrs",["sense.list"]]]],"mem":null},
{"id":"n-b9efb56a","guard":[["hasAny",["a to z","alphabetical","alphabetize","backwards","madagascar","reverse","reverse order","reversed"]],["has","give"]],"pyramid":["render.list",["transform.reverseStrs",["transform.sortStrs",["sense.list"]]]],"mem":null},
{"id":"n-d9c330f0","guard":[["hasAny",["a to z","alphabetical","alphabetize","backwards","madagascar","reverse","reverse order","reversed"]],["has","give"]],"pyramid":["render.and",["transform.reverseStrs",["transform.sortStrs",["sense.list"]]]],"mem":null},
{"id":"n-065a9993","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.and",["transform.reverseStrs",["transform.takeStrs",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-0ed6f4a5","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.list",["transform.takeStrs",["transform.reverseStrs",["sense.list"]],{"lit":3}]],"mem":null},
{"id":"n-0ed96832","guard":[["hasAny",["backwards","join","joined with","madagascar","reverse","reverse order","reversed","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["sense.list"]],["sense.lastWord"]]],"mem":null},
{"id":"n-104b911e","guard":[["hasAny",["backwards","join","joined with","madagascar","mirror","reverse","reversed","separated by","spell backwards"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.reverse",["sense.text"]]]],"mem":null},
{"id":"n-1c313976","guard":[["hasAny",["backwards","reverse order","reversed","rice","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["ear_of_",{"slot":0}]},["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-25b4df6d","guard":[["hasAny",["backwards","each word","longest","longest one","longest word","madagascar","reverse","reverse order","reversed","split into words"]],["has","give"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["aggregate.longest",["sense.list"]]]]],"mem":null},
{"id":"n-2f14009a","guard":[["hasAny",["backwards","each word","madagascar","reverse","reverse order","reversed","shortest","shortest one","shortest word","split into words"]],["has","give"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["aggregate.shortest",["sense.list"]]]]],"mem":null},
{"id":"n-307e4103","guard":[["hasAny",["arrow","backwards","capitalise","capitalize","capitalize each word","reverse order","reversed","shortest","shortest one","shortest word","title case"]],["has","shortcode"]],"pyramid":["render.str",["transform.title",["aggregate.shortest",["transform.reverseStrs",["sense.words"]]]]],"mem":null},
{"id":"n-42b7c7ab","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.list",["transform.takeStrs",["transform.reverseStrs",["sense.list"]],{"lit":2}]],"mem":null},
{"id":"n-42b878c0","guard":[["hasAny",["backwards","each word","longest","longest one","longest word","madagascar","reverse","reverse order","reversed","split into words"]],["has","give"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["aggregate.longest",["sense.list"]]]]],"mem":null},
{"id":"n-442a3c07","guard":[["hasAny",["backwards","lower case","lowercase","madagascar","reverse","reverse order","reversed","shortest","shortest one","shortest word","small letters"]],["has","give"]],"pyramid":["render.str",["transform.lower",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]]],"mem":null},
{"id":"n-46df5c52","guard":[["hasAny",["arrow","backwards","invert case","reverse order","reversed","shortest","shortest one","shortest word","swap case","toggle case"]],["has","shortcode"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["transform.reverseStrs",["sense.words"]]]]],"mem":null},
{"id":"n-4e65a3bf","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.takeStrs",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-50b095ea","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.list",["transform.reverseStrs",["transform.takeStrs",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-5fbdcc04","guard":[["hasAny",["backwards","each word","madagascar","reverse","reverse order","reversed","shortest","shortest one","shortest word","split into words"]],["has","give"]],"pyramid":["render.list",["transform.words",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]]],"mem":null},
{"id":"n-6ca74324","guard":[["hasAny",["backwards","join","joined with","madagascar","mirror","reverse","reversed","separated by","spell backwards"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.reverse",["sense.lastWord"]]]],"mem":null},
{"id":"n-739a05d6","guard":[["hasAny",["backwards","each word","madagascar","reverse","reverse order","reversed","shortest","shortest one","shortest word","split into words"]],["has","give"]],"pyramid":["render.lines",["transform.words",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]]],"mem":null},
{"id":"n-78721140","guard":[["hasAny",["backwards","madagascar","reverse","reverse order","reverse the words","reverse word order","reversed","shortest","shortest one","shortest word","words backwards"]],["has","give"]],"pyramid":["render.str",["transform.reverseWords",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]]],"mem":null},
{"id":"n-78b6df8a","guard":[["hasAny",["backwards","join","joined with","madagascar","mirror","reverse","reversed","separated by","spell backwards"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.reverse",["sense.subject"]]]],"mem":null},
{"id":"n-884eb1c6","guard":[["hasAny",["backwards","each word","madagascar","reverse","reverse order","reversed","shortest","shortest one","shortest word","split into words"]],["has","give"]],"pyramid":["render.and",["transform.words",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]]],"mem":null},
{"id":"n-88da6afc","guard":[["hasAny",["alphabetize the letters","backwards","capitalise","capitalize","capitalize each word","letters in order","mirror","reversed","sort the letters","spell backwards","tent","title case"]]],"pyramid":["render.str",["transform.sortLetters",["transform.title",["transform.reverse",["sense.lastWord"]]]]],"mem":null},
{"id":"n-89c4bbba","guard":[["hasAny",["backwards","office","reverse order","reversed","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["office_",{"slot":0}]},["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-8e2fa03b","guard":[["hasAny",["alphabetize the letters","backwards","capitalise","capitalize","capitalize each word","letters in order","mirror","reversed","sort the letters","spell backwards","tent","title case"]]],"pyramid":["render.str",["transform.sortLetters",["transform.title",["transform.reverse",["sense.subject"]]]]],"mem":null},
{"id":"n-9683418a","guard":[["hasAny",["all caps","backwards","capital letters","capitals","madagascar","reverse","reverse order","reversed","shortest","shortest one","shortest word","upper case","uppercase"]],["has","give"]],"pyramid":["render.str",["transform.upper",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]]],"mem":null},
{"id":"n-9f8714b9","guard":[["hasAny",["backwards","each word","longest","longest one","longest word","madagascar","reverse","reverse order","reversed","split into words"]],["has","give"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["aggregate.longest",["sense.list"]]]]],"mem":null},
{"id":"n-a2f4449c","guard":[["hasAny",["backwards","join","joined with","madagascar","reverse","reverse order","reversed","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["sense.list"]],["sense.text"]]],"mem":null},
{"id":"n-b7b09770","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.and",["transform.reverseStrs",["transform.takeStrs",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-bcf9f1ea","guard":[["hasAny",["backwards","invert case","madagascar","reverse","reverse order","reversed","shortest","shortest one","shortest word","swap case","toggle case"]],["has","give"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]]],"mem":null},
{"id":"n-c20c8ac7","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.and",["transform.takeStrs",["transform.reverseStrs",["sense.list"]],{"lit":2}]],"mem":null},
{"id":"n-c493bad3","guard":[["hasAny",["arrow","backwards","reverse order","reversed","shortest","shortest one","shortest word"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["aggregate.shortest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-c8ace71e","guard":[["hasAny",["backwards","capitalise","capitalize","capitalize each word","madagascar","reverse","reverse order","reversed","shortest","shortest one","shortest word","title case"]],["has","give"]],"pyramid":["render.str",["transform.title",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]]],"mem":null},
{"id":"n-d22fa92a","guard":[["hasAny",["backwards","each word","madagascar","reverse","reverse order","reversed","shortest","shortest one","shortest word","split into words"]],["has","give"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["aggregate.shortest",["sense.list"]]]]],"mem":null},
{"id":"n-d78aec9a","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.list",["transform.reverseStrs",["transform.takeStrs",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-d8c8c6b0","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.takeStrs",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-d9a868e7","guard":[["hasAny",["backwards","each word","madagascar","reverse","reverse order","reversed","shortest","shortest one","shortest word","split into words"]],["has","give"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["aggregate.shortest",["sense.list"]]]]],"mem":null},
{"id":"n-da8f0080","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.lines",["transform.takeStrs",["transform.reverseStrs",["sense.list"]],{"lit":3}]],"mem":null},
{"id":"n-dfa6d33a","guard":[["hasAny",["arrow","backwards","each word","reverse order","reversed","shortest","shortest one","shortest word","split into words"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["transform.words",["sense.text"]]]]],"mem":null},
{"id":"n-e01e90b6","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.and",["transform.takeStrs",["transform.reverseStrs",["sense.list"]],{"lit":3}]],"mem":null},
{"id":"n-e7e05a30","guard":[["hasAny",["backwards","burkina","reverse order","reversed","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["burkina_",{"slot":0}]},["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-f75e54a3","guard":[["hasAny",["backwards","join","joined with","madagascar","reverse","reverse order","reversed","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["sense.list"]],["sense.subject"]]],"mem":null},
{"id":"n-fba94f1d","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.lines",["transform.takeStrs",["transform.reverseStrs",["sense.list"]],{"lit":2}]],"mem":null},
{"id":"n-3641d3f7","guard":[["hasAny",["backwards","from position","items from to","madagascar","reverse order","reversed","slice"]],["has","give"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]]],"mem":null},
{"id":"n-42d197e0","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.and",["transform.reverseStrs",["transform.takeStrs",["transform.reverseStrs",["sense.list"]],{"lit":3}]]],"mem":null},
{"id":"n-496ee658","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.takeStrs",["transform.reverseStrs",["sense.list"]],{"lit":2}]]],"mem":null},
{"id":"n-4efabe0d","guard":[["hasAny",["backwards","from position","items from to","madagascar","reverse order","reversed","slice"]],["has","give"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-505fa8a0","guard":[["hasAny",["backwards","join","joined with","madagascar","reverse","reverse order","reversed","separated by"]]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["sense.list"]],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-5bd7b9e4","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.takeStrs",["transform.reverseStrs",["sense.list"]],{"lit":3}]]],"mem":null},
{"id":"n-5f5a1e64","guard":[["hasAny",["backwards","join","joined with","madagascar","mirror","reverse","reversed","separated by","spell backwards"]]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.reverse",["sense.after",{"lit":"shortcode"}]]]],"mem":null},
{"id":"n-62da0a40","guard":[["hasAny",["backwards","join","joined with","madagascar","reverse","reverse order","reversed","separated by"]]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["sense.list"]],["sense.before",{"lit":"shortcode"}]]],"mem":null},
{"id":"n-6402e007","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.and",["transform.reverseStrs",["transform.takeStrs",["transform.reverseStrs",["sense.list"]],{"lit":2}]]],"mem":null},
{"id":"n-6e779dbb","guard":[["hasAny",["backwards","join","joined with","madagascar","mirror","reverse","reversed","separated by","spell backwards"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.reverse",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-7d2c78c0","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.list",["transform.reverseStrs",["transform.takeStrs",["transform.reverseStrs",["sense.list"]],{"lit":2}]]],"mem":null},
{"id":"n-7d757b08","guard":[["hasAny",["backwards","join","joined with","madagascar","reverse","reverse order","reversed","separated by"]]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["sense.list"]],["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-800a3ed1","guard":[["hasAny",["backwards","join","joined with","madagascar","reverse","reverse order","reversed","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["sense.list"]],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-8025864c","guard":[["hasAny",["backwards","join","joined with","madagascar","reverse","reverse order","reversed","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["sense.list"]],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-884aec95","guard":[["hasAny",["backwards","from position","items from to","madagascar","reverse order","reversed","slice"]],["has","give"]],"pyramid":["render.list",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-8bb4cf4e","guard":[["hasAny",["backwards","join","joined with","madagascar","reverse","reverse order","reversed","separated by"]]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["sense.list"]],["sense.after",{"lit":"shortcode"}]]],"mem":null},
{"id":"n-8c17505d","guard":[["hasAny",["backwards","join","joined with","madagascar","mirror","reverse","reversed","separated by","spell backwards"]]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.reverse",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-a1b38c03","guard":[["hasAny",["backwards","from position","items from to","madagascar","reverse order","reversed","slice"]],["has","give"]],"pyramid":["render.list",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]]],"mem":null},
{"id":"n-b7c406cc","guard":[["hasAny",["backwards","from position","items from to","madagascar","reverse order","reversed","slice"]],["has","give"]],"pyramid":["render.and",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]]],"mem":null},
{"id":"n-bbf8649c","guard":[["hasAny",["backwards","join","joined with","madagascar","mirror","reverse","reversed","separated by","spell backwards"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.reverse",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-e2f36534","guard":[["hasAny",["backwards","from position","items from to","madagascar","reverse order","reversed","slice"]],["has","give"]],"pyramid":["render.and",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-ea107760","guard":[["hasAny",["backwards","join","joined with","madagascar","mirror","reverse","reversed","separated by","spell backwards"]]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.reverse",["sense.before",{"lit":"shortcode"}]]]],"mem":null},
{"id":"n-eacadc7c","guard":[["hasAny",["backwards","join","joined with","madagascar","reverse","reverse order","reversed","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["transform.reverseStrs",["sense.list"]],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ec7f4c07","guard":[["hasAny",["backwards","join","joined with","madagascar","mirror","reverse","reversed","separated by","spell backwards"]]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.reverse",["sense.before",{"lit":"for"}]]]],"mem":null},
{"id":"n-f7a268a5","guard":[["hasAny",["backwards","join","joined with","madagascar","mirror","reverse","reversed","separated by","spell backwards"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.reverse",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-f8b00d98","guard":[["hasAny",["backwards","first n","madagascar","reverse","reverse order","reversed","take","top"]],["has","give"]],"pyramid":["render.list",["transform.reverseStrs",["transform.takeStrs",["transform.reverseStrs",["sense.list"]],{"lit":3}]]],"mem":null},
{"id":"n-41e7f268","guard":[["hasAny",["backwards","full","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_moon_with_",{"slot":1}]},["aggregate.shortest",["sense.content"]],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-7dd3487c","guard":[["hasAny",["backwards","hair","reverse order","reversed","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0},"_haired_",{"slot":1}]},["aggregate.shortest",["transform.reverseStrs",["sense.content"]]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-124a4f27","guard":[["hasAny",["backwards","burkina","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-2ea1c0a6","guard":[["hasAny",["backwards","full","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["full_",{"slot":0},"_with_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-4f7831cb","guard":[["hasAny",["backwards","item number","mage","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["aggregate.shortest",["transform.reverseStrs",["sense.content"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5b8de67e","guard":[["hasAny",["backwards","box","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["ballot_",{"slot":0},"_with_",{"slot":1}]},["aggregate.shortest",["transform.reverseStrs",["sense.content"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-96505667","guard":[["hasAny",["backwards","bald","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["aggregate.shortest",["transform.reverseStrs",["sense.content"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-96e78811","guard":[["hasAny",["backwards","box","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["ballot_",{"slot":0},"_with_",{"slot":1}]},["aggregate.shortest",["transform.reverseStrs",["sense.words"]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c5ddbe59","guard":[["hasAny",["backwards","item number","nth","palm","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["palm_",{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-cd8c13fb","guard":[["hasAny",["backwards","item number","nth","palm","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_down_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-3983e5e2","guard":[["hasAny",["backwards","burkina","reverse order","reversed","separate by","shortest","shortest one","shortest word","split","split by"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["render.and",["transform.split",["sense.subject"],["sense.lastWord"]]],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-49ce56c1","guard":[["hasAny",["backwards","burkina","reverse order","reversed","separate by","shortest","shortest one","shortest word","split","split by"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["render.list",["transform.split",["sense.subject"],["sense.lastWord"]]],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-4f283dbe","guard":[["hasAny",["backwards","item number","jan","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["transform.reverseStrs",["sense.words"]]],["sense.lastWord"]],"mem":null},
{"id":"n-5ebc1ce6","guard":[["hasAny",["backwards","item number","miquelon","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["transform.reverseStrs",["sense.words"]]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-646b176d","guard":[["hasAny",["backwards","diagonal","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["transform.reverseStrs",["sense.content"]]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-7e5c2120","guard":[["hasAny",["backwards","item number","miquelon","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["transform.reverseStrs",["sense.content"]]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-d60b56c9","guard":[["hasAny",["backwards","item number","jan","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]],["sense.lastWord"]],"mem":null},
{"id":"n-83861a5d","guard":[["hasAny",["backwards","item number","nth","palm","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-d7345120","guard":[["hasAny",["backwards","full","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_with_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-d7f6daf7","guard":[["hasAny",["backwards","boy","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["family_",{"slot":0},"_",{"slot":1},"_girl_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-fa7c3b32","guard":[["hasAny",["backwards","boy","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_woman_girl_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-28f595e3","guard":[["hasAny",["backwards","item number","nth","palm","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-4ae600b9","guard":[["hasAny",["backwards","construction","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-5403659a","guard":[["hasAny",["backwards","item number","nth","palm","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-5ad6bc19","guard":[["hasAny",["backwards","full","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_with_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-c43954e6","guard":[["hasAny",["backwards","construction","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-c576a992","guard":[["hasAny",["backwards","boy","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_man_",{"slot":1},"_girl_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-cf9b8df1","guard":[["hasAny",["backwards","construction","item number","longest","longest one","longest word","nth","position","reverse order","reversed"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.longest",["transform.reverseStrs",["sense.words"]]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-19d73a50","guard":[["hasAny",["backwards","boy","element","item number","longest","longest one","longest word","nth","position","reverse","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_",{"slot":3}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.list"]],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-82f866ca","guard":[["hasAny",["backwards","boy","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_",{"slot":3}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-8c7fd361","guard":[["hasAny",["backwards","boy","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_",{"slot":3}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-c3af58c2","guard":[["hasAny",["backwards","boy","element","item number","nth","position","reverse","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_",{"slot":3}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-50877cef","guard":[["hasAny",["backwards","crossed","element","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2},"_and_",{"slot":3},"_crossed"]},["aggregate.shortest",["transform.reverseStrs",["sense.content"]]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-e6c38f3b","guard":[["hasAny",["backwards","boy","item number","nth","position","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_",{"slot":3}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-53092513","guard":[["hasAny",["backwards","boy","element","first n","item number","nth","position","reverse","reverse order","reversed","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_",{"slot":3}]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-b32e2abe","guard":[["hasAny",["backwards","boy","element","first n","item number","nth","position","reverse","reverse order","reversed","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_",{"slot":3}]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-020d7187","guard":[["hasAny",["apple","red"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the red apple emoji":"apple"}}},
{"id":"n-02f49085","guard":[["hasAny",["getting","haircut"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the woman getting haircut emoji":"haircut_woman"}}},
{"id":"n-03b18123","guard":[["hasAny",["github","shortcode","tulip"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for tulip":"tulip"}}},
{"id":"n-03f01a9e","guard":[["has","africa"],["has","github"]],"pyramid":["render.template",{"lit":["south_",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-04e6c7a1","guard":[["hasAny",["github","kaaba","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for kaaba":"kaaba"}}},
{"id":"n-0906ecb0","guard":[["hasAny",["leone","sierra"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for flag: Sierra Leone":"sierra_leone"}}},
{"id":"n-0987c595","guard":[["hasAny",["crossed","flags","github","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for crossed flags":"crossed_flags"}}},
{"id":"n-09bb0557","guard":[["hasAny",["claus","github","mrs","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for Mrs. Claus":"mrs_claus"}}},
{"id":"n-0a43661b","guard":[["hasAny",["flag","github","jan","mayen","shortcode","svalbard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for flag: Svalbard & Jan Mayen":"svalbard_jan_mayen"}}},
{"id":"n-0a875130","guard":[["hasAny",["emoji","shield","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the shield emoji":"shield"}}},
{"id":"n-0bc9a939","guard":[["hasAny",["emoji","flag","monaco","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the flag: Monaco emoji":"monaco"}}},
{"id":"n-0df9262b","guard":[["hasAny",["emoji","farmer","man","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the man farmer emoji":"man_farmer"}}},
{"id":"n-0e95acda","guard":[["hasAny",["emoji","rice","sheaf","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the sheaf of rice emoji":"ear_of_rice"}}},
{"id":"n-0eb52888","guard":[["has","womens"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the women’s room emoji":"womens"}}},
{"id":"n-0f579eb9","guard":[["hasAny",["disk","floppy","github","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for floppy disk":"floppy_disk"}}},
{"id":"n-10c01fe9","guard":[["has","deer"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the deer emoji":"deer"}}},
{"id":"n-112e9fc4","guard":[["hasAny",["crossed","emoji","finger","hand","index","shortcode","thumb","writes"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the hand with index finger and thumb crossed emoji":"hand_with_index_finger_and_thumb_crossed"}}},
{"id":"n-115993aa","guard":[["has","shield"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the shield emoji":"shield"}}},
{"id":"n-11654f28","guard":[["hasAny",["emoji","mage","shortcode","woman","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the woman mage emoji":"mage_woman"}}},
{"id":"n-126bb19b","guard":[["hasAny",["flag","github","miquelon","pierre","shortcode","st"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for flag: St. Pierre & Miquelon":"st_pierre_miquelon"}}},
{"id":"n-12ace7eb","guard":[["hasAny",["down","emoji","hand","palm","shortcode","writes"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the palm down hand emoji":"palm_down_hand"}}},
{"id":"n-140d8392","guard":[["hasAny",["caicos","flag","github","islands","shortcode","turks"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for flag: Turks & Caicos Islands":"turks_caicos_islands"}}},
{"id":"n-1508b530","guard":[["hasAny",["blue","github","shortcode","square"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for blue square":"blue_square"}}},
{"id":"n-157440ca","guard":[["hasAny",["chopsticks","emoji","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the chopsticks emoji":"chopsticks"}}},
{"id":"n-17280ea3","guard":[["hasAny",["construction","emoji","man","shortcode","worker","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the man construction worker emoji":"construction_worker_man"}}},
{"id":"n-17ea8c05","guard":[["hasAny",["emoji","shortcode","trackball","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the trackball emoji":"trackball"}}},
{"id":"n-197dfb30","guard":[["has","nepal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the flag: Nepal emoji":"nepal"}}},
{"id":"n-19a440d3","guard":[["has","dagger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for dagger":"dagger"}}},
{"id":"n-1e6660dc","guard":[["hasAny",["drink","github","shortcode","tropical"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for tropical drink":"tropical_drink"}}},
{"id":"n-1e66d2cf","guard":[["has","seedling"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the seedling emoji":"seedling"}}},
{"id":"n-1ea5c94c","guard":[["hasAny",["fire","github","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for fire":"fire"}}},
{"id":"n-20c35e47","guard":[["hasAny",["asiaaustralia","emoji","globe","shortcode","showing","writes"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the globe showing Asia-Australia emoji":"earth_asia"}}},
{"id":"n-293f75d5","guard":[["hasAny",["mountain","snowcapped"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the snow-capped mountain emoji":"mountain_snow"}}},
{"id":"n-2b30ca8e","guard":[["has","hook"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the hook emoji":"hook"}}},
{"id":"n-2b4c0bfd","guard":[["hasAny",["emoji","hair","man","red","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the man: red hair emoji":"red_haired_man"}}},
{"id":"n-2df805b9","guard":[["has","snake"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the snake emoji":"snake"}}},
{"id":"n-32830a5d","guard":[["hasAny",["crossed","flags","github","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for crossed flags":"crossed_flags"}}},
{"id":"n-343f781c","guard":[["has","monaco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the flag: Monaco emoji":"monaco"}}},
{"id":"n-354e399f","guard":[["hasAny",["emoji","face","joy","shortcode","tears"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the face with tears of joy emoji":"joy"}}},
{"id":"n-36d7cc21","guard":[["has","chopsticks"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the chopsticks emoji":"chopsticks"}}},
{"id":"n-373cf1e6","guard":[["hasAny",["closed","lowered","mailbox"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the closed mailbox with lowered flag emoji":"mailbox_closed"}}},
{"id":"n-37f51496","guard":[["has","hungary"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the flag: Hungary emoji":"hungary"}}},
{"id":"n-38fa7a76","guard":[["has","ship"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the ship emoji":"ship"}}},
{"id":"n-396ac4f5","guard":[["hasAny",["construction","worker"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the man construction worker emoji":"construction_worker_man"}}},
{"id":"n-39e2ca34","guard":[["hasAny",["emoji","pin","safety","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the safety pin emoji":"safety_pin"}}},
{"id":"n-3dfc9f34","guard":[["hasAny",["deer","emoji","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the deer emoji":"deer"}}},
{"id":"n-3ef074b9","guard":[["has","réunion"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the flag: Réunion emoji":"reunion"}}},
{"id":"n-3f46b4f6","guard":[["hasAny",["github","shortcode","supervillain"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for supervillain":"supervillain"}}},
{"id":"n-402eca98","guard":[["hasAny",["emoji","handshake","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the handshake emoji":"handshake"}}},
{"id":"n-407cabd3","guard":[["hasAny",["burkina","faso","flag","github","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for flag: Burkina Faso":"burkina_faso"}}},
{"id":"n-41422cae","guard":[["hasAny",["emoji","seedling","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the seedling emoji":"seedling"}}},
{"id":"n-434c886e","guard":[["hasAny",["dog","github","guide","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for guide dog":"guide_dog"}}},
{"id":"n-43db548c","guard":[["hasAny",["emoji","flag","nations","shortcode","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the flag: United Nations emoji":"united_nations"}}},
{"id":"n-441149ab","guard":[["hasAny",["aerial","emoji","shortcode","tramway"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the aerial tramway emoji":"aerial_tramway"}}},
{"id":"n-441e62f8","guard":[["hasAny",["emoji","index","pointing","shortcode","viewer"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the index pointing at the viewer emoji":"index_pointing_at_the_viewer"}}},
{"id":"n-4428fa9a","guard":[["hasAny",["closed","emoji","flag","lowered","mailbox","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the closed mailbox with lowered flag emoji":"mailbox_closed"}}},
{"id":"n-44e45d93","guard":[["hasAny",["button","emoji","fast","reverse","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the fast reverse button emoji":"rewind"}}},
{"id":"n-46104a76","guard":[["has","bald"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the woman: bald emoji":"bald_woman"}}},
{"id":"n-476cd1b7","guard":[["has","madagascar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for flag: Madagascar":"madagascar"}}},
{"id":"n-4807a831","guard":[["hasAny",["face","github","relieved","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for relieved face":"relieved"}}},
{"id":"n-490a95f4","guard":[["hasAny",["emoji","ship","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the ship emoji":"ship"}}},
{"id":"n-4ac10612","guard":[["has","speedboat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the speedboat emoji":"speedboat"}}},
{"id":"n-4b2b40dd","guard":[["hasAny",["reverse","writes"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the fast reverse button emoji":"rewind"}}},
{"id":"n-4c300e2f","guard":[["hasAny",["emoji","index","pointing","shortcode","viewer"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the index pointing at the viewer emoji":"index_pointing_at_the_viewer"}}},
{"id":"n-4dc0c52d","guard":[["hasAny",["baby","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the baby symbol emoji":"baby_symbol"}}},
{"id":"n-4e70d8db","guard":[["has","toothbrush"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the toothbrush emoji":"toothbrush"}}},
{"id":"n-4f1dcdd2","guard":[["hasAny",["emoji","flag","helena","shortcode","st"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the flag: St. Helena emoji":"st_helena"}}},
{"id":"n-4f504f7a","guard":[["hasAny",["emoji","eyebrow","face","raised","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the face with raised eyebrow emoji":"raised_eyebrow"}}},
{"id":"n-4fd8c8f1","guard":[["hasAny",["cartwheeling","emoji","person","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the person cartwheeling emoji":"cartwheeling"}}},
{"id":"n-509008d6","guard":[["hasAny",["chart","emoji","increasing","shortcode","writes","yen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the chart increasing with yen emoji":"chart"}}},
{"id":"n-52168e60","guard":[["hasAny",["box","check","emoji","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the check box with check emoji":"ballot_box_with_check"}}},
{"id":"n-562ce930","guard":[["hasAny",["nations","united"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the flag: United Nations emoji":"united_nations"}}},
{"id":"n-56e6b66e","guard":[["has","mango"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for mango":"mango"}}},
{"id":"n-574c22ba","guard":[["has","trackball"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the trackball emoji":"trackball"}}},
{"id":"n-5849fbbd","guard":[["has","cherries"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the cherries emoji":"cherries"}}},
{"id":"n-58515acd","guard":[["hasAny",["github","office","shortcode","worker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for office worker":"office_worker"}}},
{"id":"n-590b518d","guard":[["hasAny",["drink","github","shortcode","tropical"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for tropical drink":"tropical_drink"}}},
{"id":"n-5bf1748c","guard":[["hasAny",["bicycles","github","no","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for no bicycles":"no_bicycles"}}},
{"id":"n-5ef95649","guard":[["hasAny",["emoji","face","full","moon","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the full moon face emoji":"full_moon_with_face"}}},
{"id":"n-627e4be1","guard":[["has","cartwheeling"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the person cartwheeling emoji":"cartwheeling"}}},
{"id":"n-64326668","guard":[["hasAny",["box","check"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the check box with check emoji":"ballot_box_with_check"}}},
{"id":"n-64646340","guard":[["hasAny",["button","down","emoji","fast","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the fast down button emoji":"arrow_double_down"}}},
{"id":"n-64a3e89d","guard":[["hasAny",["coaster","emoji","roller","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the roller coaster emoji":"roller_coaster"}}},
{"id":"n-668cef4d","guard":[["hasAny",["emoji","room","shortcode","womens","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the women’s room emoji":"womens"}}},
{"id":"n-6b15aff8","guard":[["hasAny",["frog","github","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for frog":"frog"}}},
{"id":"n-6bedabac","guard":[["hasAny",["claus","github","mrs","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for Mrs. Claus":"mrs_claus"}}},
{"id":"n-6d493fe1","guard":[["hasAny",["dog","github","guide","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for guide dog":"guide_dog"}}},
{"id":"n-6e26f12f","guard":[["hasAny",["balloon","thought"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the thought balloon emoji":"thought_balloon"}}},
{"id":"n-6fb406a2","guard":[["hasAny",["emoji","pin","safety","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the safety pin emoji":"safety_pin"}}},
{"id":"n-72d2b17c","guard":[["hasAny",["down","emoji","hand","palm","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the palm down hand emoji":"palm_down_hand"}}},
{"id":"n-73dbab0a","guard":[["has","tent"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for tent":"tent"}}},
{"id":"n-742bdc0c","guard":[["hasAny",["emoji","inbox","shortcode","tray","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the inbox tray emoji":"inbox_tray"}}},
{"id":"n-750f2e92","guard":[["hasAny",["emoji","shortcode","zombie"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the zombie emoji":"zombie"}}},
{"id":"n-75cdee0c","guard":[["hasAny",["emoji","england","flag","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the flag: England emoji":"england"}}},
{"id":"n-76e274b9","guard":[["has","tulip"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for tulip":"tulip"}}},
{"id":"n-7a3005a7","guard":[["hasAny",["a to z","alphabetical","alphabetize","madagascar"]],["has","give"]],"pyramid":["render.and",["transform.sortStrs",["sense.list"]]],"mem":null},
{"id":"n-7ab7e388","guard":[["hasAny",["british","emoji","flag","islands","shortcode","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the flag: British Virgin Islands emoji":"british_virgin_islands"}}},
{"id":"n-7ffc96b7","guard":[["hasAny",["fountain","github","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for fountain":"fountain"}}},
{"id":"n-8068bb71","guard":[["hasAny",["flag","github","leone","shortcode","sierra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for flag: Sierra Leone":"sierra_leone"}}},
{"id":"n-81c657e0","guard":[["hasAny",["emoji","kneeling","person","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the person kneeling emoji":"kneeling_person"}}},
{"id":"n-84cd9738","guard":[["hasAny",["boy","family","girl","github","man","shortcode","woman"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for family: man, woman, girl, boy":"family_man_woman_girl_boy"}}},
{"id":"n-85c7234d","guard":[["hasAny",["emoji","hook","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the hook emoji":"hook"}}},
{"id":"n-867804f1","guard":[["hasAny",["emoji","getting","haircut","shortcode","woman"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the woman getting haircut emoji":"haircut_woman"}}},
{"id":"n-872bc9aa","guard":[["hasAny",["emoji","face","full","moon","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the full moon face emoji":"full_moon_with_face"}}},
{"id":"n-89253d76","guard":[["hasAny",["carousel","github","horse","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for carousel horse":"carousel_horse"}}},
{"id":"n-896ad878","guard":[["has","fire"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for fire":"fire"}}},
{"id":"n-898ac0b7","guard":[["hasAny",["emoji","flag","nepal","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the flag: Nepal emoji":"nepal"}}},
{"id":"n-8b553732","guard":[["hasAny",["madagascar","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.str",["aggregate.shortest",["sense.list"]]],"mem":null},
{"id":"n-8ec0e54c","guard":[["has","down"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the fast down button emoji":"arrow_double_down"}}},
{"id":"n-90401410","guard":[["hasAny",["emoji","man","officer","police","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the man police officer emoji":"policeman"}}},
{"id":"n-9042b4b1","guard":[["hasAny",["emoji","framed","picture","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the framed picture emoji":"framed_picture"}}},
{"id":"n-95047af0","guard":[["hasAny",["emoji","mountain","shortcode","snowcapped","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the snow-capped mountain emoji":"mountain_snow"}}},
{"id":"n-963e0f5e","guard":[["hasAny",["emoji","hair","man","red","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the man: red hair emoji":"red_haired_man"}}},
{"id":"n-969da983","guard":[["has","supervillain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for supervillain":"supervillain"}}},
{"id":"n-9adc17ad","guard":[["has","facepalming"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the woman facepalming emoji":"woman_facepalming"}}},
{"id":"n-9cfe25ba","guard":[["hasAny",["africa","flag","github","shortcode","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for flag: South Africa":"south_africa"}}},
{"id":"n-9d2f13e4","guard":[["hasAny",["baby","bottle","github","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for baby bottle":"baby_bottle"}}},
{"id":"n-9e149ae8","guard":[["hasAny",["officer","police"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the man police officer emoji":"policeman"}}},
{"id":"n-9e1c1977","guard":[["has","handshake"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the handshake emoji":"handshake"}}},
{"id":"n-9eafc492","guard":[["hasAny",["bear","github","shortcode","teddy"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for teddy bear":"teddy_bear"}}},
{"id":"n-9f315362","guard":[["has","relieved"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for relieved face":"relieved"}}},
{"id":"n-9f957499","guard":[["hasAny",["inbox","tray"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the inbox tray emoji":"inbox_tray"}}},
{"id":"n-a086a458","guard":[["hasAny",["emoji","shortcode","woman"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the woman emoji":"woman"}}},
{"id":"n-a0bb11ab","guard":[["has","socks"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for socks":"socks"}}},
{"id":"n-a2b4f85d","guard":[["has","mage"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the woman mage emoji":"mage_woman"}}},
{"id":"n-a54af029","guard":[["hasAny",["dagger","github","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for dagger":"dagger"}}},
{"id":"n-a6c789ea","guard":[["hasAny",["emoji","shortcode","toothbrush"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the toothbrush emoji":"toothbrush"}}},
{"id":"n-a77a9767","guard":[["hasAny",["person","steamy"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the person in steamy room emoji":"sauna_person"}}},
{"id":"n-aacb860c","guard":[["hasAny",["emoji","farmer","shortcode","woman","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the woman farmer emoji":"woman_farmer"}}},
{"id":"n-af113f7a","guard":[["hasAny",["flag","github","miquelon","pierre","shortcode","st"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for flag: St. Pierre & Miquelon":"st_pierre_miquelon"}}},
{"id":"n-af12d65b","guard":[["has","leone"],["has","github"]],"pyramid":["render.template",{"lit":["sierra_",{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-b11b8e2b","guard":[["hasAny",["carousel","github","horse","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for carousel horse":"carousel_horse"}}},
{"id":"n-b40cbc61","guard":[["hasAny",["github","mango","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for mango":"mango"}}},
{"id":"n-b457c62c","guard":[["has","coffin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the coffin emoji":"coffin"}}},
{"id":"n-b600aa26","guard":[["hasAny",["emoji","eyebrow","face","raised","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the face with raised eyebrow emoji":"raised_eyebrow"}}},
{"id":"n-b67d5aa2","guard":[["hasAny",["arrow","emoji","end","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the END arrow emoji":"end"}}},
{"id":"n-b7be2349","guard":[["hasAny",["flag","github","madagascar","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for flag: Madagascar":"madagascar"}}},
{"id":"n-ba079b73","guard":[["hasAny",["crossed","emoji","finger","hand","index","shortcode","thumb","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the hand with index finger and thumb crossed emoji":"hand_with_index_finger_and_thumb_crossed"}}},
{"id":"n-baa08803","guard":[["has","kaaba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for kaaba":"kaaba"}}},
{"id":"n-bff1f5f3","guard":[["has","mosque"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the mosque emoji":"mosque"}}},
{"id":"n-c06ccfc5","guard":[["hasAny",["chart","emoji","increasing","shortcode","writes","yen"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the chart increasing with yen emoji":"chart"}}},
{"id":"n-c0c677fe","guard":[["has","keyboard"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for keyboard":"keyboard"}}},
{"id":"n-c12b9853","guard":[["hasAny",["baby","emoji","shortcode","symbol","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the baby symbol emoji":"baby_symbol"}}},
{"id":"n-c31deb53","guard":[["hasAny",["balloon","emoji","shortcode","thought","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the thought balloon emoji":"thought_balloon"}}},
{"id":"n-c3c205e2","guard":[["hasAny",["bear","github","shortcode","teddy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for teddy bear":"teddy_bear"}}},
{"id":"n-c541cf0f","guard":[["hasAny",["facepalming","github","person","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for person facepalming":"facepalm"}}},
{"id":"n-c7718f1e","guard":[["hasAny",["github","office","shortcode","worker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for office worker":"office_worker"}}},
{"id":"n-ca6a3938","guard":[["hasAny",["coffin","emoji","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the coffin emoji":"coffin"}}},
{"id":"n-cadee179","guard":[["hasAny",["emoji","face","joy","shortcode","tears"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the face with tears of joy emoji":"joy"}}},
{"id":"n-cbc8ddc9","guard":[["hasAny",["emoji","megaphone","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the megaphone emoji":"mega"}}},
{"id":"n-cbd696f8","guard":[["hasAny",["emoji","shortcode","woman","zombie"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the woman zombie emoji":"zombie_woman"}}},
{"id":"n-cc28bac3","guard":[["hasAny",["baby","bottle","github","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for baby bottle":"baby_bottle"}}},
{"id":"n-cd9efdf1","guard":[["has","england"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the flag: England emoji":"england"}}},
{"id":"n-cde65c3f","guard":[["hasAny",["cat","emoji","pouting","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the pouting cat emoji":"pouting_cat"}}},
{"id":"n-cf4d284c","guard":[["hasAny",["blue","github","shortcode","square"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for blue square":"blue_square"}}},
{"id":"n-d00e27eb","guard":[["hasAny",["arrow","end"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the END arrow emoji":"end"}}},
{"id":"n-d03d78fa","guard":[["hasAny",["a to z","alphabetical","alphabetize","madagascar"]],["has","give"]],"pyramid":["render.lines",["transform.sortStrs",["sense.list"]]],"mem":null},
{"id":"n-d07be380","guard":[["hasAny",["cat","emoji","pouting","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the pouting cat emoji":"pouting_cat"}}},
{"id":"n-d1c13c43","guard":[["hasAny",["emoji","rice","sheaf","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the sheaf of rice emoji":"ear_of_rice"}}},
{"id":"n-d4cab253","guard":[["hasAny",["emoji","framed","picture","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the framed picture emoji":"framed_picture"}}},
{"id":"n-d4e5f6e0","guard":[["hasAny",["emoji","shortcode","snake"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the snake emoji":"snake"}}},
{"id":"n-d4e9511c","guard":[["hasAny",["emoji","person","room","shortcode","steamy","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the person in steamy room emoji":"sauna_person"}}},
{"id":"n-d6aa343d","guard":[["hasAny",["a to z","alphabetical","alphabetize","madagascar"]],["has","give"]],"pyramid":["render.list",["transform.sortStrs",["sense.list"]]],"mem":null},
{"id":"n-d817c2b4","guard":[["hasAny",["disk","floppy","github","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for floppy disk":"floppy_disk"}}},
{"id":"n-d98bf9a3","guard":[["has","megaphone"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the megaphone emoji":"mega"}}},
{"id":"n-da0b997f","guard":[["hasAny",["cherries","emoji","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the cherries emoji":"cherries"}}},
{"id":"n-daa456f4","guard":[["hasAny",["emoji","shortcode","speedboat"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the speedboat emoji":"speedboat"}}},
{"id":"n-db244ca5","guard":[["hasAny",["emoji","mosque","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the mosque emoji":"mosque"}}},
{"id":"n-dbb1ead4","guard":[["hasAny",["emoji","ninja","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the ninja emoji":"ninja"}}},
{"id":"n-dd51ef0e","guard":[["hasAny",["apple","emoji","red","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the red apple emoji":"apple"}}},
{"id":"n-dd806c70","guard":[["hasAny",["africa","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for flag: South Africa":"south_africa"}}},
{"id":"n-ddf4a119","guard":[["has","kneeling"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the person kneeling emoji":"kneeling_person"}}},
{"id":"n-ded3be1d","guard":[["hasAny",["github","shortcode","socks"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for socks":"socks"}}},
{"id":"n-defda112","guard":[["hasAny",["emoji","flag","réunion","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the flag: Réunion emoji":"reunion"}}},
{"id":"n-dfa3574a","guard":[["has","ninja"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the ninja emoji":"ninja"}}},
{"id":"n-dfe3dcc9","guard":[["has","troll"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the troll emoji":"troll"}}},
{"id":"n-e02beea7","guard":[["hasAny",["aerial","emoji","shortcode","tramway"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the aerial tramway emoji":"aerial_tramway"}}},
{"id":"n-e3626754","guard":[["hasAny",["emoji","flag","paraguay","shortcode","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the flag: Paraguay emoji":"paraguay"}}},
{"id":"n-e373112f","guard":[["hasAny",["helena","st"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the flag: St. Helena emoji":"st_helena"}}},
{"id":"n-e79e2b45","guard":[["hasAny",["diagonal","face","github","mouth","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for face with diagonal mouth":"face_with_diagonal_mouth"}}},
{"id":"n-e83e187f","guard":[["hasAny",["emoji","shortcode","sled","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the sled emoji":"sled"}}},
{"id":"n-e8da52ef","guard":[["hasAny",["github","keyboard","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for keyboard":"keyboard"}}},
{"id":"n-ebdd908d","guard":[["hasAny",["github","shortcode","tent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for tent":"tent"}}},
{"id":"n-ec1074e2","guard":[["hasAny",["coaster","emoji","roller","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the roller coaster emoji":"roller_coaster"}}},
{"id":"n-ed03ae1f","guard":[["hasAny",["emoji","shortcode","troll"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the troll emoji":"troll"}}},
{"id":"n-ed64d319","guard":[["hasAny",["facepalming","github","person","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for person facepalming":"facepalm"}}},
{"id":"n-ee547de2","guard":[["has","paraguay"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the flag: Paraguay emoji":"paraguay"}}},
{"id":"n-f01b86d6","guard":[["hasAny",["caicos","flag","github","islands","shortcode","turks"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for flag: Turks & Caicos Islands":"turks_caicos_islands"}}},
{"id":"n-f1d8bfa6","guard":[["hasAny",["bicycles","github","no","shortcode"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for no bicycles":"no_bicycles"}}},
{"id":"n-f22350b9","guard":[["has","sled"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which shortcode writes the sled emoji":"sled"}}},
{"id":"n-f2b2b2ee","guard":[["hasAny",["emoji","flag","hungary","shortcode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the flag: Hungary emoji":"hungary"}}},
{"id":"n-f62dfbc3","guard":[["hasAny",["british","emoji","flag","islands","shortcode","virgin"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the shortcode of the flag: British Virgin Islands emoji":"british_virgin_islands"}}},
{"id":"n-f81ab01f","guard":[["hasAny",["bald","emoji","shortcode","woman"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the woman: bald emoji":"bald_woman"}}},
{"id":"n-f8d8fade","guard":[["hasAny",["diagonal","mouth"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for face with diagonal mouth":"face_with_diagonal_mouth"}}},
{"id":"n-f9465dc8","guard":[["has","frog"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for frog":"frog"}}},
{"id":"n-fd06174c","guard":[["hasAny",["burkina","faso"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for flag: Burkina Faso":"burkina_faso"}}},
{"id":"n-fd0b6c0f","guard":[["hasAny",["emoji","facepalming","shortcode","woman"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the shortcode of the woman facepalming emoji":"woman_facepalming"}}},
{"id":"n-fd8a4603","guard":[["hasAny",["flag","github","jan","mayen","shortcode","svalbard"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for flag: Svalbard & Jan Mayen":"svalbard_jan_mayen"}}},
{"id":"n-ff1512ac","guard":[["hasAny",["asiaaustralia","emoji","globe","shortcode","showing","writes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which shortcode writes the globe showing Asia-Australia emoji":"earth_asia"}}},
{"id":"n-ffa74479","guard":[["hasAny",["boy","family","girl","github","man","shortcode","woman"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for family: man, woman, girl, boy":"family_man_woman_girl_boy"}}},
{"id":"n-ffd8ffd9","guard":[["hasAny",["longest","longest one","longest word","madagascar"]],["has","give"]],"pyramid":["render.str",["aggregate.longest",["sense.list"]]],"mem":null},
{"id":"n-ffe98aef","guard":[["has","fountain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the GitHub shortcode for fountain":"fountain"}}},
{"id":"n-124aacfd","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","letters in order","sort the letters","tent","title case"]]],"pyramid":["render.str",["transform.sortLetters",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-154aa71f","guard":[["hasAny",["first n","madagascar","take","top"]],["has","give"]],"pyramid":["render.list",["transform.takeStrs",["sense.list"],{"lit":3}]],"mem":null},
{"id":"n-1ad961a2","guard":[["hasAny",["bear","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["teddy_",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-25538f71","guard":[["hasAny",["first n","madagascar","take","top"]],["has","give"]],"pyramid":["render.and",["transform.takeStrs",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-2df31aa8","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","madagascar","upper case","uppercase"]],["has","give"]],"pyramid":["render.str",["transform.upper",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-3212651a","guard":[["hasAny",["lower case","lowercase","madagascar","shortest","shortest one","shortest word","small letters"]],["has","give"]],"pyramid":["render.str",["transform.lower",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-45b72b30","guard":[["hasAny",["join","joined with","madagascar","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["sense.subject"]]],"mem":null},
{"id":"n-51ed54c6","guard":[["hasAny",["inbox","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["inbox_",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5958e73b","guard":[["hasAny",["dog","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["guide_",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5cb66cc0","guard":[["hasAny",["join","joined with","madagascar","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["sense.lastWord"]]],"mem":null},
{"id":"n-6665271f","guard":[["hasAny",["hair","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["red_haired_",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6a511d65","guard":[["hasAny",["carousel","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["carousel_",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-70a2d8b1","guard":[["hasAny",["first n","madagascar","take","top"]],["has","give"]],"pyramid":["render.lines",["transform.takeStrs",["sense.list"],{"lit":3}]],"mem":null},
{"id":"n-762314d4","guard":[["hasAny",["first n","madagascar","take","top"]],["has","give"]],"pyramid":["render.lines",["transform.takeStrs",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-76cfed09","guard":[["hasAny",["a to z","alphabetical","alphabetize","arrow","shortest","shortest one","shortest word"]],["has","shortcode"]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.words"]]]],"mem":null},
{"id":"n-7a7a5f21","guard":[["hasAny",["madagascar","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","give"]],"pyramid":["render.str",["transform.reverseWords",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-7b65a192","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","madagascar","small letters"]],["has","give"]],"pyramid":["render.str",["transform.lower",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-803aa87d","guard":[["hasAny",["flags","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["crossed_",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-80425889","guard":[["hasAny",["invert case","madagascar","shortest","shortest one","shortest word","swap case","toggle case"]],["has","give"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-81d22021","guard":[["hasAny",["invert case","longest","longest one","longest word","madagascar","swap case","toggle case"]],["has","give"]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-8858402b","guard":[["hasAny",["getting","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["haircut_",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-968eeb6f","guard":[["hasAny",["rice","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["ear_of_",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9b66d8da","guard":[["hasAny",["longest","longest one","longest word","madagascar","reverse the words","reverse word order","words backwards"]],["has","give"]],"pyramid":["render.str",["transform.reverseWords",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-a191b3c4","guard":[["hasAny",["each word","madagascar","shortest","shortest one","shortest word","split into words"]],["has","give"]],"pyramid":["render.and",["transform.words",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-abcdca71","guard":[["hasAny",["each word","madagascar","shortest","shortest one","shortest word","split into words"]],["has","give"]],"pyramid":["render.list",["transform.words",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-b028182c","guard":[["hasAny",["join","joined with","madagascar","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["sense.text"]]],"mem":null},
{"id":"n-b9b26697","guard":[["hasAny",["box","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["ballot_",{"slot":0},"_with_check"]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bd4f2442","guard":[["hasAny",["each word","longest","longest one","longest word","madagascar","split into words"]],["has","give"]],"pyramid":["render.lines",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-cabd9622","guard":[["hasAny",["capitalise","capitalize","capitalize each word","madagascar","shortest","shortest one","shortest word","title case"]],["has","give"]],"pyramid":["render.str",["transform.title",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-d690ecf1","guard":[["hasAny",["all caps","capital letters","capitals","madagascar","shortest","shortest one","shortest word","upper case","uppercase"]],["has","give"]],"pyramid":["render.str",["transform.upper",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-e2d5656a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","madagascar","title case"]],["has","give"]],"pyramid":["render.str",["transform.title",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-efcb4601","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","letters in order","sort the letters","tent","title case"]]],"pyramid":["render.str",["transform.sortLetters",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-f37cd6fb","guard":[["hasAny",["each word","longest","longest one","longest word","madagascar","split into words"]],["has","give"]],"pyramid":["render.list",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-f4081deb","guard":[["hasAny",["first n","madagascar","take","top"]],["has","give"]],"pyramid":["render.list",["transform.takeStrs",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-f47e7358","guard":[["hasAny",["disk","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["floppy_",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f88199b3","guard":[["hasAny",["drink","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["tropical_",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fb637bd6","guard":[["hasAny",["first n","madagascar","take","top"]],["has","give"]],"pyramid":["render.and",["transform.takeStrs",["sense.list"],{"lit":3}]],"mem":null},
{"id":"n-fc129788","guard":[["hasAny",["each word","longest","longest one","longest word","madagascar","split into words"]],["has","give"]],"pyramid":["render.and",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-fe0799e2","guard":[["hasAny",["each word","madagascar","shortest","shortest one","shortest word","split into words"]],["has","give"]],"pyramid":["render.lines",["transform.words",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-0015eb91","guard":[["hasAny",["item number","nth","position","steamy"]],["has","which"]],"pyramid":["render.template",{"lit":["sauna_",{"slot":0}]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-03da0b9b","guard":[["hasAny",["each word","join","joined with","madagascar","separated by","split into words"]],["has","give"]],"pyramid":["render.lines",["transform.words",["transform.join",["sense.list"],["sense.lastWord"]]]],"mem":null},
{"id":"n-0b1e63c8","guard":[["hasAny",["closed","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_closed"]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-13fc7872","guard":[["hasAny",["join","joined with","lower case","lowercase","madagascar","separated by","small letters"]],["has","give"]],"pyramid":["render.str",["transform.lower",["transform.join",["sense.list"],["sense.text"]]]],"mem":null},
{"id":"n-176903c4","guard":[["hasAny",["from position","items from to","madagascar","slice"]],["has","give"]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-1829507c","guard":[["hasAny",["delete","lower case","lowercase","madagascar","remove","small letters","strip out","without"]],["has","github"]],"pyramid":["render.str",["transform.remove",["transform.lower",["sense.lastWord"]],["sense.lastWord"]]],"mem":null},
{"id":"n-1a3566c1","guard":[["hasAny",["dog","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_dog"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1aec5ac9","guard":[["hasAny",["item number","nations","nth","position"]]],"pyramid":["render.template",{"lit":["united_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1af6eaa6","guard":[["hasAny",["first letters of the name","initials","join","joined with","madagascar","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.initials",["sense.lastWord"]]]],"mem":null},
{"id":"n-1bf1b64f","guard":[["hasAny",["item number","nth","pin","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_pin"]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1c9dae06","guard":[["hasAny",["join","joined with","madagascar","separated by"]]],"pyramid":["render.str",["transform.join",["sense.list"],["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-1fc3c123","guard":[["hasAny",["madagascar","normalise","normalize","shortest","shortest one","shortest word","simplify the text"]],["has","give"]],"pyramid":["render.str",["transform.norm",["aggregate.shortest",["sense.list"]],{"lit":1}]],"mem":null},
{"id":"n-2016ed1d","guard":[["hasAny",["item number","leone","nth","position"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_leone"]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-21037d64","guard":[["hasAny",["join","joined with","madagascar","no vowels","remove vowels","separated by","without vowels"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-22f79f92","guard":[["hasAny",["from position","items from to","madagascar","slice"]],["has","give"]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-23790aa0","guard":[["hasAny",["helena","item number","nth","position"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_helena"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-24f19635","guard":[["hasAny",["join","joined with","madagascar","separated by"]]],"pyramid":["render.str",["transform.join",["sense.list"],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-274678ae","guard":[["hasAny",["a to z","alphabetical","alphabetize","first n","madagascar","take","top"]],["has","give"]],"pyramid":["render.lines",["transform.takeStrs",["transform.sortStrs",["sense.list"]],{"lit":3}]],"mem":null},
{"id":"n-27ca78d7","guard":[["hasAny",["flags","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_flags"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-280f2848","guard":[["hasAny",["each word","join","joined with","madagascar","separated by","split into words"]],["has","give"]],"pyramid":["render.list",["transform.words",["transform.join",["sense.list"],["sense.text"]]]],"mem":null},
{"id":"n-28d14f38","guard":[["hasAny",["alphabetize the letters","join","joined with","letters in order","madagascar","separated by","sort the letters"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.sortLetters",["sense.subject"]]]],"mem":null},
{"id":"n-2a183086","guard":[["hasAny",["alphabetize the letters","join","joined with","letters in order","madagascar","separated by","sort the letters"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.sortLetters",["sense.text"]]]],"mem":null},
{"id":"n-2b2ba367","guard":[["hasAny",["delete","lower case","lowercase","madagascar","remove","small letters","strip out","without"]],["has","github"]],"pyramid":["render.str",["transform.remove",["transform.lower",["sense.lastWord"]],["sense.subject"]]],"mem":null},
{"id":"n-2e25f8db","guard":[["hasAny",["join","joined with","madagascar","reverse the words","reverse word order","separated by","words backwards"]],["has","give"]],"pyramid":["render.str",["transform.reverseWords",["transform.join",["sense.list"],["sense.lastWord"]]]],"mem":null},
{"id":"n-2eea4d8d","guard":[["hasAny",["helena","item number","nth","position"]],["has","shortcode"]],"pyramid":["render.template",{"lit":["st_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2f1f9015","guard":[["hasAny",["item number","nth","position","steamy"]],["has","which"]],"pyramid":["render.template",{"lit":["sauna_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2f6f1446","guard":[["hasAny",["madagascar","normalise","normalize","shortest","shortest one","shortest word","simplify the text"]],["has","give"]],"pyramid":["render.str",["transform.norm",["aggregate.shortest",["sense.list"]],{"lit":3}]],"mem":null},
{"id":"n-2fab3f96","guard":[["hasAny",["factorial","first n","madagascar","n factorial","take","top"]],["has","give"]],"pyramid":["render.lines",["transform.takeStrs",["sense.list"],["compute.factorial",["sense.wordCount"]]]],"mem":null},
{"id":"n-33c37bbf","guard":[["hasAny",["claus","item number","nth","position"]]],"pyramid":["render.template",{"lit":["mrs_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-34e524df","guard":[["hasAny",["join","joined with","madagascar","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-372e24d0","guard":[["hasAny",["closed","item number","nth","position"]]],"pyramid":["render.template",{"lit":["mailbox_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3ac5114d","guard":[["hasAny",["abbreviate","abbreviation","acronym","join","joined with","madagascar","separated by","short form"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.acronym",["sense.text"]]]],"mem":null},
{"id":"n-3ae80abb","guard":[["hasAny",["balloon","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_balloon"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3c37a209","guard":[["hasAny",["blue","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["blue_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3ca7874b","guard":[["hasAny",["a to z","alphabetical","alphabetize","join","joined with","madagascar","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["transform.sortStrs",["sense.list"]],["sense.subject"]]],"mem":null},
{"id":"n-3cb9fac0","guard":[["hasAny",["how many","how many items","madagascar","number of items"]],["has","give"]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.countStrs",["sense.list"]]]],"mem":null},
{"id":"n-3d87622f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","join","joined with","madagascar","separated by","title case"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-3dd50170","guard":[["hasAny",["alphabetize the letters","deer","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.str",["transform.sortLetters",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-3eb7434b","guard":[["hasAny",["a to z","alphabetical","alphabetize","item number","nth","position","tulip"]],["has","give"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],["sense.wordCount"]]],"mem":null},
{"id":"n-3fa60274","guard":[["hasAny",["join","joined with","longest","longest one","longest word","madagascar","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-4139c5ca","guard":[["hasAny",["abbreviate","abbreviation","acronym","join","joined with","madagascar","separated by","short form"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.acronym",["sense.subject"]]]],"mem":null},
{"id":"n-41543445","guard":[["hasAny",["bicycles","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_bicycles"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-41a1d1be","guard":[["hasAny",["all caps","capital letters","capitals","join","joined with","madagascar","separated by","upper case","uppercase"]],["has","give"]],"pyramid":["render.str",["transform.upper",["transform.join",["sense.list"],["sense.subject"]]]],"mem":null},
{"id":"n-42624f30","guard":[["hasAny",["bald","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0},"_woman"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-448b7310","guard":[["hasAny",["capitalise","capitalize","capitalize each word","join","joined with","madagascar","separated by","title case"]],["has","give"]],"pyramid":["render.str",["transform.title",["transform.join",["sense.list"],["sense.text"]]]],"mem":null},
{"id":"n-48f6ae2e","guard":[["hasAny",["inbox","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_tray"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-49263d95","guard":[["hasAny",["each word","join","joined with","madagascar","separated by","split into words"]],["has","give"]],"pyramid":["render.lines",["transform.words",["transform.join",["sense.list"],["sense.text"]]]],"mem":null},
{"id":"n-4c0cf1f7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","join","joined with","madagascar","separated by","title case"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-4cadddd9","guard":[["hasAny",["aerial","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_tramway"]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4fe5bb79","guard":[["hasAny",["all caps","capital letters","capitals","join","joined with","madagascar","separated by","upper case","uppercase"]],["has","give"]],"pyramid":["render.str",["transform.upper",["transform.join",["sense.list"],["sense.text"]]]],"mem":null},
{"id":"n-5389d980","guard":[["hasAny",["digit count","element","how many digits","item number","madagascar","nth","number of digits","position"]],["has","give"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-55294772","guard":[["hasAny",["join","joined with","madagascar","reverse the words","reverse word order","separated by","words backwards"]],["has","give"]],"pyramid":["render.str",["transform.reverseWords",["transform.join",["sense.list"],["sense.text"]]]],"mem":null},
{"id":"n-5649258f","guard":[["hasAny",["relieved","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["sense.after",{"lit":"for"}],["sense.lastWord"]]],"mem":null},
{"id":"n-565537c0","guard":[["hasAny",["drink","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_drink"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5aad4433","guard":[["hasAny",["from position","items from to","madagascar","slice"]],["has","give"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-5c7b48dc","guard":[["hasAny",["first letters of the name","initials","join","joined with","madagascar","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.initials",["sense.text"]]]],"mem":null},
{"id":"n-5d3d2d0c","guard":[["hasAny",["miquelon","shortest","shortest one","shortest word"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_pierre_",{"slot":1}]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-601bf618","guard":[["hasAny",["join","joined with","madagascar","separated by"]]],"pyramid":["render.str",["transform.join",["sense.list"],["sense.before",{"lit":"shortcode"}]]],"mem":null},
{"id":"n-6469a5df","guard":[["hasAny",["framed","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_picture"]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-64910215","guard":[["hasAny",["cat","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["pouting_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-68be40e1","guard":[["hasAny",["bottle","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_bottle"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-69e6bcee","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","letters in order","sort the letters","tent","title case"]]],"pyramid":["render.str",["transform.sortLetters",["transform.title",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-6a94cb4d","guard":[["hasAny",["invert case","join","joined with","madagascar","separated by","swap case","toggle case"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.swapCase",["sense.lastWord"]]]],"mem":null},
{"id":"n-6b8c909e","guard":[["hasAny",["join","joined with","madagascar","reverse the words","reverse word order","separated by","words backwards"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.reverseWords",["sense.subject"]]]],"mem":null},
{"id":"n-6db35d93","guard":[["hasAny",["factorial","first n","madagascar","n factorial","take","top"]],["has","give"]],"pyramid":["render.list",["transform.takeStrs",["sense.list"],["compute.factorial",["sense.wordCount"]]]],"mem":null},
{"id":"n-6ffa6ac2","guard":[["hasAny",["coaster","item number","nth","position"]]],"pyramid":["render.template",{"lit":["roller_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-75a5ce24","guard":[["hasAny",["a to z","alphabetical","alphabetize","join","joined with","madagascar","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["transform.sortStrs",["sense.list"]],["sense.lastWord"]]],"mem":null},
{"id":"n-760570e8","guard":[["hasAny",["coaster","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_coaster"]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-76eba980","guard":[["hasAny",["how many","how many items","madagascar","normalise","normalize","number of items","simplify the text"]],["has","give"]],"pyramid":["render.str",["transform.norm",["sense.subject"],["aggregate.countStrs",["sense.list"]]]],"mem":null},
{"id":"n-787f286f","guard":[["hasAny",["longest","longest one","longest word","madagascar","normalise","normalize","simplify the text"]],["has","give"]],"pyramid":["render.str",["transform.norm",["aggregate.longest",["sense.list"]],{"lit":3}]],"mem":null},
{"id":"n-78f9b9aa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","join","joined with","madagascar","separated by","title case"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.title",["sense.text"]]]],"mem":null},
{"id":"n-7b0772a7","guard":[["hasAny",["divisor count","how many divisors","how many factors","madagascar","normalise","normalize","number of divisors","simplify the text"]],["has","give"]],"pyramid":["render.str",["transform.norm",["sense.subject"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-7bbb9d54","guard":[["hasAny",["aerial","item number","nth","position"]]],"pyramid":["render.template",{"lit":["aerial_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7ca29844","guard":[["hasAny",["delete","madagascar","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-80ce24f3","guard":[["hasAny",["join","joined with","madagascar","no vowels","remove vowels","separated by","without vowels"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.noVowels",["sense.subject"]]]],"mem":null},
{"id":"n-82f6719d","guard":[["hasAny",["delete","relieved","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.after",{"lit":"for"}],["sense.subject"]]],"mem":null},
{"id":"n-847d257a","guard":[["hasAny",["item number","kneeling","nth","position"]]],"pyramid":["render.template",{"lit":["kneeling_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-87dbd018","guard":[["hasAny",["join","joined with","lower case","lowercase","madagascar","separated by","small letters"]],["has","give"]],"pyramid":["render.str",["transform.lower",["transform.join",["sense.list"],["sense.lastWord"]]]],"mem":null},
{"id":"n-892577da","guard":[["hasAny",["delete","lower case","lowercase","madagascar","remove","small letters","strip out","without"]],["has","github"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.lower",["sense.lastWord"]]]],"mem":null},
{"id":"n-8a6e9c19","guard":[["hasAny",["a to z","alphabetical","alphabetize","first n","madagascar","take","top"]],["has","give"]],"pyramid":["render.list",["transform.sortStrs",["transform.takeStrs",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-8bdeb20a","guard":[["hasAny",["join","joined with","madagascar","separated by","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-8e12a6d4","guard":[["hasAny",["bear","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_bear"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8ef92ae4","guard":[["hasAny",["how many","how many items","madagascar","number of items"]],["has","give"]],"pyramid":["render.and",["iterate.repeat",["sense.subject"],["aggregate.countStrs",["sense.list"]]]],"mem":null},
{"id":"n-8f08097b","guard":[["hasAny",["bicycles","item number","nth","position"]]],"pyramid":["render.template",{"lit":["no_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8f818fb5","guard":[["hasAny",["chopsticks","first n","longest","longest one","longest word","take"]]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-93af12d0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","join","joined with","madagascar","separated by","title case"]],["has","give"]],"pyramid":["render.str",["transform.title",["transform.join",["sense.list"],["sense.lastWord"]]]],"mem":null},
{"id":"n-9667916b","guard":[["hasAny",["from position","items from to","madagascar","slice"]],["has","give"]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-96e4bfcf","guard":[["hasAny",["divisor count","how many divisors","how many factors","madagascar","normalise","normalize","number of divisors","simplify the text"]],["has","give"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-970d7a55","guard":[["hasAny",["join","joined with","madagascar","no vowels","remove vowels","separated by","without vowels"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.noVowels",["sense.text"]]]],"mem":null},
{"id":"n-98104934","guard":[["hasAny",["copies","how many","how many items","madagascar","number of items","repeat","say it times"]],["has","give"]],"pyramid":["render.str",["transform.repeat",["sense.subject"],["aggregate.countStrs",["sense.list"]]]],"mem":null},
{"id":"n-9832df6a","guard":[["hasAny",["item number","nth","position","symbol"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_symbol"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9cbe83bb","guard":[["hasAny",["consonant count","how many consonants","item number","nth","number of consonants","paraguay","position"]],["has","shortcode"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.consonants",["sense.subject"]]]],"mem":null},
{"id":"n-9d655df2","guard":[["hasAny",["alphabetize the letters","item number","joy","letters in order","nth","position","sort the letters"]]],"pyramid":["render.str",["transform.sortLetters",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-9df66ad2","guard":[["hasAny",["invert case","join","joined with","madagascar","separated by","swap case","toggle case"]],["has","give"]],"pyramid":["render.str",["transform.swapCase",["transform.join",["sense.list"],["sense.text"]]]],"mem":null},
{"id":"n-9f5bf327","guard":[["hasAny",["each word","join","joined with","madagascar","separated by","split into words"]],["has","give"]],"pyramid":["render.and",["transform.words",["transform.join",["sense.list"],["sense.lastWord"]]]],"mem":null},
{"id":"n-a10358b1","guard":[["hasAny",["join","joined with","madagascar","month name","name of month","separated by","which month"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["compute.monthName",["sense.wordCount"]]]],"mem":null},
{"id":"n-a7157522","guard":[["hasAny",["how many","how many items","madagascar","number of items"]],["has","give"]],"pyramid":["render.lines",["iterate.repeat",["sense.subject"],["aggregate.countStrs",["sense.list"]]]],"mem":null},
{"id":"n-a8fdac87","guard":[["hasAny",["africa","item number","nth","position"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_africa"]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a8fdee7f","guard":[["hasAny",["eyebrow","item number","nth","position"]]],"pyramid":["render.template",{"lit":["raised_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a91de554","guard":[["hasAny",["join","joined with","madagascar","reverse the words","reverse word order","separated by","words backwards"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.reverseWords",["sense.text"]]]],"mem":null},
{"id":"n-aa82840c","guard":[["hasAny",["each word","join","joined with","madagascar","separated by","split into words"]],["has","give"]],"pyramid":["render.list",["transform.words",["transform.join",["sense.list"],["sense.subject"]]]],"mem":null},
{"id":"n-aae1f8f4","guard":[["hasAny",["all caps","capital letters","capitals","join","joined with","madagascar","separated by","upper case","uppercase"]],["has","give"]],"pyramid":["render.str",["transform.upper",["transform.join",["sense.list"],["sense.lastWord"]]]],"mem":null},
{"id":"n-ace7de17","guard":[["hasAny",["join","joined with","longest","longest one","longest word","madagascar","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-ad13f008","guard":[["hasAny",["capitalise","capitalize","capitalize each word","join","joined with","madagascar","separated by","title case"]],["has","give"]],"pyramid":["render.str",["transform.title",["transform.join",["sense.list"],["sense.subject"]]]],"mem":null},
{"id":"n-b0158062","guard":[["hasAny",["a to z","alphabetical","alphabetize","first n","madagascar","take","top"]],["has","give"]],"pyramid":["render.lines",["transform.sortStrs",["transform.takeStrs",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-b1eafdfc","guard":[["hasAny",["delete","relieved","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.after",{"lit":"for"}],["sense.lastWord"]]],"mem":null},
{"id":"n-b2543a94","guard":[["hasAny",["join","joined with","madagascar","separated by"]]],"pyramid":["render.str",["transform.join",["sense.list"],["sense.after",{"lit":"shortcode"}]]],"mem":null},
{"id":"n-b35496bb","guard":[["hasAny",["box","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ballot_box_with_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b725787d","guard":[["hasAny",["disk","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_disk"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bb0a79e1","guard":[["hasAny",["each word","join","joined with","madagascar","separated by","split into words"]],["has","give"]],"pyramid":["render.and",["transform.words",["transform.join",["sense.list"],["sense.subject"]]]],"mem":null},
{"id":"n-bbb39c1b","guard":[["hasAny",["item number","nth","office","position"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_worker"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bcb6a87d","guard":[["hasAny",["balloon","item number","nth","position"]]],"pyramid":["render.template",{"lit":["thought_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bcbf952c","guard":[["hasAny",["invert case","join","joined with","madagascar","separated by","swap case","toggle case"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.swapCase",["sense.text"]]]],"mem":null},
{"id":"n-c0148f20","guard":[["hasAny",["bald","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["bald_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c07be937","guard":[["hasAny",["each word","join","joined with","madagascar","separated by","split into words"]],["has","give"]],"pyramid":["render.list",["transform.words",["transform.join",["sense.list"],["sense.lastWord"]]]],"mem":null},
{"id":"n-c2cc9f6a","guard":[["hasAny",["join","joined with","lower case","lowercase","madagascar","separated by","small letters"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.lower",["sense.text"]]]],"mem":null},
{"id":"n-c52c6651","guard":[["hasAny",["factorial","first n","madagascar","n factorial","take","top"]],["has","give"]],"pyramid":["render.and",["transform.takeStrs",["sense.list"],["compute.factorial",["sense.wordCount"]]]],"mem":null},
{"id":"n-c6e7b9ce","guard":[["hasAny",["first letters of the name","initials","join","joined with","madagascar","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.initials",["sense.subject"]]]],"mem":null},
{"id":"n-c772ac4b","guard":[["hasAny",["hair","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0},"_haired_man"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c78c97a3","guard":[["hasAny",["element","flag","how many words","item number","nth","number of words","position","word count"]],["has","give"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-c7de6d33","guard":[["hasAny",["jan","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["svalbard_",{"slot":0},"_",{"slot":1}]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-cbb72276","guard":[["hasAny",["item number","nth","pin","position"]]],"pyramid":["render.template",{"lit":["safety_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ccc16059","guard":[["hasAny",["delete","madagascar","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-cd87ff54","guard":[["hasAny",["invert case","join","joined with","madagascar","separated by","swap case","toggle case"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-ced49a5f","guard":[["hasAny",["item number","mountain","nth","position"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_snow"]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cee56153","guard":[["hasAny",["a to z","alphabetical","alphabetize","first n","madagascar","take","top"]],["has","give"]],"pyramid":["render.list",["transform.takeStrs",["transform.sortStrs",["sense.list"]],{"lit":3}]],"mem":null},
{"id":"n-cf310363","guard":[["hasAny",["delete","lower case","lowercase","madagascar","remove","small letters","strip out","without"]],["has","github"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-cf52c5ea","guard":[["hasAny",["a to z","alphabetical","alphabetize","first n","madagascar","take","top"]],["has","give"]],"pyramid":["render.and",["transform.sortStrs",["transform.takeStrs",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-d09798f7","guard":[["hasAny",["how many","how many items","madagascar","number of items"]],["has","give"]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.countStrs",["sense.list"]]]],"mem":null},
{"id":"n-d209aba0","guard":[["hasAny",["cat","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0},"_cat"]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d3c1060c","guard":[["hasAny",["invert case","join","joined with","madagascar","separated by","swap case","toggle case"]],["has","give"]],"pyramid":["render.str",["transform.swapCase",["transform.join",["sense.list"],["sense.lastWord"]]]],"mem":null},
{"id":"n-d4b2e900","guard":[["hasAny",["first n","longest","longest one","longest word","take","toothbrush"]],["has","what"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-d64acbed","guard":[["hasAny",["a to z","alphabetical","alphabetize","first n","madagascar","take","top"]],["has","give"]],"pyramid":["render.and",["transform.takeStrs",["transform.sortStrs",["sense.list"]],{"lit":3}]],"mem":null},
{"id":"n-d6a07c06","guard":[["hasAny",["how many","how many items","madagascar","number of items"]],["has","give"]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.countStrs",["sense.list"]]]],"mem":null},
{"id":"n-d9086967","guard":[["hasAny",["abbreviate","abbreviation","acronym","join","joined with","madagascar","separated by","short form"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.acronym",["sense.lastWord"]]]],"mem":null},
{"id":"n-da9c35b4","guard":[["hasAny",["delete","lower case","lowercase","madagascar","remove","small letters","strip out","without"]],["has","github"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-dac21557","guard":[["hasAny",["join","joined with","madagascar","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-db98edbd","guard":[["hasAny",["claus","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_claus"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dbe34d17","guard":[["hasAny",["eyebrow","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_eyebrow"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dc17c55f","guard":[["hasAny",["how many","how many items","madagascar","number of items"]],["has","give"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],["aggregate.countStrs",["sense.list"]]]],"mem":null},
{"id":"n-df23e3c1","guard":[["hasAny",["join","joined with","madagascar","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-dfbf051b","guard":[["hasAny",["a to z","alphabetical","alphabetize","item number","nth","position","womens"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":4}]],"mem":null},
{"id":"n-e1301a90","guard":[["hasAny",["item number","kneeling","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_person"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e2de3af9","guard":[["hasAny",["from position","items from to","madagascar","slice"]],["has","give"]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-e429619f","guard":[["hasAny",["each word","join","joined with","madagascar","separated by","split into words"]],["has","give"]],"pyramid":["render.lines",["transform.words",["transform.join",["sense.list"],["sense.subject"]]]],"mem":null},
{"id":"n-e4b605fe","guard":[["hasAny",["join","joined with","madagascar","reverse the words","reverse word order","separated by","words backwards"]],["has","give"]],"pyramid":["render.str",["transform.reverseWords",["transform.join",["sense.list"],["sense.subject"]]]],"mem":null},
{"id":"n-e4e4c799","guard":[["hasAny",["item number","nations","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_nations"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e67bf282","guard":[["hasAny",["delete","lower case","lowercase","madagascar","remove","small letters","strip out","without"]],["has","github"]],"pyramid":["render.str",["transform.remove",["transform.lower",["sense.subject"]],["sense.subject"]]],"mem":null},
{"id":"n-ea4eacc9","guard":[["hasAny",["invert case","join","joined with","madagascar","separated by","swap case","toggle case"]],["has","give"]],"pyramid":["render.str",["transform.swapCase",["transform.join",["sense.list"],["sense.subject"]]]],"mem":null},
{"id":"n-ed2f3666","guard":[["hasAny",["burkina","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_faso"]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-eeaca98b","guard":[["hasAny",["a to z","alphabetical","alphabetize","join","joined with","madagascar","separated by"]],["has","give"]],"pyramid":["render.str",["transform.join",["transform.sortStrs",["sense.list"]],["sense.text"]]],"mem":null},
{"id":"n-eee7f4f6","guard":[["hasAny",["copies","how many","how many items","madagascar","number of items","repeat","say it times"]],["has","give"]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["aggregate.countStrs",["sense.list"]]]],"mem":null},
{"id":"n-f05ca548","guard":[["hasAny",["longest","longest one","longest word","madagascar","normalise","normalize","simplify the text"]],["has","give"]],"pyramid":["render.str",["transform.norm",["aggregate.longest",["sense.list"]],{"lit":1}]],"mem":null},
{"id":"n-f0f1f7c4","guard":[["hasAny",["blue","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_square"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f1555a0a","guard":[["hasAny",["item number","mage","nth","position"]]],"pyramid":["render.template",{"lit":["mage_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f2d832b0","guard":[["hasAny",["each word","join","joined with","madagascar","separated by","split into words"]],["has","give"]],"pyramid":["render.and",["transform.words",["transform.join",["sense.list"],["sense.text"]]]],"mem":null},
{"id":"n-f2db1540","guard":[["hasAny",["all caps","capital letters","capitals","join","joined with","madagascar","separated by","upper case","uppercase"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["transform.upper",["sense.text"]]]],"mem":null},
{"id":"n-f3e44bcf","guard":[["hasAny",["framed","item number","nth","position"]]],"pyramid":["render.template",{"lit":["framed_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f3f0bf7e","guard":[["hasAny",["item number","nth","position","rice"]],["has","what"]],"pyramid":["render.template",{"lit":["ear_of_",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f4df1f8e","guard":[["hasAny",["relieved","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["sense.after",{"lit":"for"}],["sense.subject"]]],"mem":null},
{"id":"n-f6f4a45c","guard":[["hasAny",["as a roman numeral","in roman numerals","join","joined with","madagascar","roman numeral","separated by","to roman"]],["has","give"]],"pyramid":["render.str",["transform.join",["sense.list"],["compute.toRoman",["sense.wordCount"]]]],"mem":null},
{"id":"n-f7f3edc0","guard":[["hasAny",["carousel","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_horse"]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f96ae364","guard":[["hasAny",["how many","how many items","madagascar","normalise","normalize","number of items","simplify the text"]],["has","give"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.countStrs",["sense.list"]]]],"mem":null},
{"id":"n-fd17f581","guard":[["hasAny",["from position","items from to","madagascar","slice"]],["has","give"]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-fe0c5754","guard":[["hasAny",["join","joined with","lower case","lowercase","madagascar","separated by","small letters"]],["has","give"]],"pyramid":["render.str",["transform.lower",["transform.join",["sense.list"],["sense.subject"]]]],"mem":null},
{"id":"n-282bd945","guard":[["hasAny",["diagonal","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_diagonal_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-4801b542","guard":[["hasAny",["change to","madagascar","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.after",{"lit":"for"}],["sense.text"]]],"mem":null},
{"id":"n-4d0dafc5","guard":[["hasAny",["caicos","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["turks_",{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-83a6a48c","guard":[["hasAny",["item number","miquelon","nth","position"]],["has","github"]],"pyramid":["render.template",{"lit":["st_",{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-94e0685b","guard":[["hasAny",["diagonal","item number","nth","position"]]],"pyramid":["render.template",{"lit":["face_with_",{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-b08e9870","guard":[["hasAny",["caicos","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_caicos_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-dcd1687c","guard":[["hasAny",["item number","jan","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_jan_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-e846dd9e","guard":[["hasAny",["change to","madagascar","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.after",{"lit":"for"}],["sense.text"]]],"mem":null},
{"id":"n-00aca76c","guard":[["hasAny",["bicycles","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-02334e59","guard":[["hasAny",["item number","mage","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1dada5ce","guard":[["hasAny",["bald","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2004af9b","guard":[["hasAny",["item number","mage","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2e351c1c","guard":[["hasAny",["item number","nth","pointing","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_at_the_viewer"]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4391dfd7","guard":[["hasAny",["item number","nth","pointing","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_pointing_at_the_",{"slot":1}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7f1c5e73","guard":[["hasAny",["inbox","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8a83cafb","guard":[["hasAny",["item number","miquelon","nth","position","shortest","shortest one","shortest word"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_miquelon"]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-a06811a2","guard":[["hasAny",["box","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["ballot_",{"slot":0},"_with_",{"slot":1}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b11a1ade","guard":[["hasAny",["getting","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c8bdb723","guard":[["hasAny",["hair","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0},"_haired_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cd33832e","guard":[["hasAny",["box","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["ballot_",{"slot":0},"_with_",{"slot":1}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ebefbc68","guard":[["hasAny",["item number","jan","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_mayen"]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fca5fb85","guard":[["hasAny",["box","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["ballot_",{"slot":0},"_with_",{"slot":1}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-fecabea7","guard":[["hasAny",["full","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_with_face"]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-034ba93c","guard":[["hasAny",["item number","miquelon","nth","position","shortest","shortest one","shortest word"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-139b1a29","guard":[["hasAny",["getting","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-27f3bd84","guard":[["hasAny",["british","item number","nth","position"]],["has","shortcode"]],"pyramid":["render.template",{"lit":["british_",{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-2aa1b838","guard":[["hasAny",["element","eyebrow","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-3d02452b","guard":[["hasAny",["item number","nth","pointing","position"]]],"pyramid":["render.template",{"lit":["index_",{"slot":0},"_at_the_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3e143226","guard":[["hasAny",["caicos","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_islands"]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-4212a0fb","guard":[["hasAny",["construction","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["construction_",{"slot":0},"_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5bd243b5","guard":[["hasAny",["hair","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0},"_haired_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7efddf3c","guard":[["hasAny",["construction","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},"_worker_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a5f5bfd0","guard":[["hasAny",["diagonal","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_mouth"]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c8ef02c3","guard":[["hasAny",["diagonal","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-d9863134","guard":[["hasAny",["british","item number","nth","position"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_virgin_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d996332f","guard":[["hasAny",["item number","miquelon","nth","position","shortest","shortest one","shortest word"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-da49b563","guard":[["hasAny",["construction","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_man"]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-dce29ade","guard":[["hasAny",["item number","nth","palm","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_hand"]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e85c209f","guard":[["hasAny",["british","item number","nth","position"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_islands"]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f32582fa","guard":[["hasAny",["box","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ballot_",{"slot":0},"_with_",{"slot":1}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f4cca7c1","guard":[["hasAny",["item number","jan","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-01da01da","guard":[["hasAny",["bald","item number","nth","position","separate by","split","split by"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["render.and",["transform.split",["sense.subject"],["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0e946e0c","guard":[["hasAny",["all caps","capital letters","capitals","item number","miquelon","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-2b7b8556","guard":[["hasAny",["item number","lower case","lowercase","miquelon","nth","position","shortest","shortest one","shortest word","small letters"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3f0cd7f0","guard":[["hasAny",["invert case","item number","miquelon","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3f20cfc3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","miquelon","nth","position","shortest","shortest one","shortest word","title case"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-46463bc2","guard":[["hasAny",["bald","item number","nth","position","separate by","split","split by"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1}]},["render.list",["transform.split",["sense.subject"],["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-636cda49","guard":[["hasAny",["diagonal","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-801b214e","guard":[["hasAny",["item number","jan","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8d5e51a0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","jan","nth","position","shortest","shortest one","shortest word","title case"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a3aecd01","guard":[["hasAny",["all caps","capital letters","capitals","item number","jan","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b099bfb6","guard":[["hasAny",["diagonal","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.subject"]],"mem":null},
{"id":"n-d56a1952","guard":[["hasAny",["invert case","item number","jan","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-36da801b","guard":[["hasAny",["each word","item number","miquelon","nth","position","shortest","shortest one","shortest word","split into words"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-49f62049","guard":[["hasAny",["full","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_with_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-58ff873e","guard":[["hasAny",["construction","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5de46066","guard":[["hasAny",["boy","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_boy"]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-6136bb44","guard":[["hasAny",["each word","item number","jan","nth","position","shortest","shortest one","shortest word","split into words"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6de4a0f3","guard":[["hasAny",["diagonal","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-74bd0673","guard":[["hasAny",["capitalise","capitalize","capitalize each word","diagonal","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-74c21ca7","guard":[["hasAny",["item number","nth","pointing","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_at_the_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-90a884c4","guard":[["hasAny",["diagonal","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a2c0f558","guard":[["hasAny",["construction","item number","longest","longest one","longest word","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bbcdaf40","guard":[["hasAny",["delete","item number","jan","nth","position","remove","shortest","shortest one","shortest word","strip out","without"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.remove",["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-bf5e1881","guard":[["hasAny",["all caps","capital letters","capitals","diagonal","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c05f0935","guard":[["hasAny",["each word","item number","miquelon","nth","position","shortest","shortest one","shortest word","split into words"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c25b3cbd","guard":[["hasAny",["diagonal","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.subject"]]],"mem":null},
{"id":"n-cb0a2284","guard":[["hasAny",["each word","item number","jan","nth","position","shortest","shortest one","shortest word","split into words"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f93fd3ad","guard":[["hasAny",["delete","item number","miquelon","nth","position","remove","shortest","shortest one","shortest word","strip out","without"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.remove",["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-05db995b","guard":[["hasAny",["british","element","item number","nth","position"]],["has","shortcode"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-0785542f","guard":[["hasAny",["item number","miquelon","nth","position","separate by","shortest","shortest one","shortest word","split","split by"]],["has","github"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.split",["sense.lastWord"],["sense.subject"]]]],"mem":null},
{"id":"n-0f2f28cc","guard":[["hasAny",["boy","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_",{"slot":3}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-1f7a9803","guard":[["hasAny",["crossed","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["hand_with_",{"slot":0},"_",{"slot":1},"_and_",{"slot":2},"_crossed"]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-2f47e79a","guard":[["hasAny",["construction","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-437ea3e9","guard":[["hasAny",["crossed","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_index_",{"slot":1},"_and_",{"slot":2},"_crossed"]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-504c3bb8","guard":[["hasAny",["crossed","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2},"_and_thumb_crossed"]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5f5d6b08","guard":[["hasAny",["diagonal","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8394a31b","guard":[["hasAny",["item number","jan","nth","position","separate by","shortest","shortest one","shortest word","split","split by"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["transform.split",["sense.lastWord"],["sense.subject"]]]],"mem":null},
{"id":"n-965f11c9","guard":[["hasAny",["diagonal","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-adb48585","guard":[["hasAny",["crossed","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_finger_and_",{"slot":2},"_crossed"]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-c2b652d9","guard":[["hasAny",["construction","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d09d2278","guard":[["hasAny",["item number","nth","pointing","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_at_the_",{"slot":2}]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3f2919e9","guard":[["hasAny",["all caps","boy","capital letters","capitals","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_",{"slot":3}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-47c1555f","guard":[["hasAny",["boy","capitalise","capitalize","capitalize each word","item number","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_",{"slot":3}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4cbb6d54","guard":[["hasAny",["boy","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_",{"slot":3}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9381a86c","guard":[["hasAny",["boy","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_",{"slot":3}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-412db421","guard":[["hasAny",["boy","each word","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_",{"slot":3}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e396cf33","guard":[["hasAny",["boy","each word","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_",{"slot":1},"_",{"slot":2},"_girl_",{"slot":3}]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e6612027","guard":[["hasAny",["crossed","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2},"_and_",{"slot":3},"_crossed"]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-8468f0e0","guard":[["hasAny",["crossed","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2},"_and_",{"slot":3},"_crossed"]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-a4625938","guard":[["hasAny",["crossed","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},"_with_",{"slot":1},"_",{"slot":2},"_and_",{"slot":3},"_crossed"]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which shortcode writes the shield emoji","expect":{"equals":"shield","notRefusal":true}},{"q":"give the GitHub shortcode for keyboard","expect":{"equals":"keyboard","notRefusal":true}},{"q":"what is the shortcode of the person kneeling emoji","expect":{"equals":"kneeling_person","notRefusal":true}},{"q":"give the GitHub shortcode for face with diagonal mouth","expect":{"equals":"face_with_diagonal_mouth","notRefusal":true}},{"q":"give the GitHub shortcode for flag: Sierra Leone","expect":{"equals":"sierra_leone","notRefusal":true}},{"q":"what is the shortcode of the deer emoji","expect":{"equals":"deer","notRefusal":true}},{"q":"which shortcode writes the red apple emoji","expect":{"equals":"apple","notRefusal":true}},{"q":"give the GitHub shortcode for frog","expect":{"equals":"frog","notRefusal":true}},{"q":"what is the shortcode of the flag: British Virgin Islands emoji","expect":{"equals":"british_virgin_islands","notRefusal":true}},{"q":"give the GitHub shortcode for crossed flags","expect":{"equals":"crossed_flags","notRefusal":true}},{"q":"give the GitHub shortcode for socks","expect":{"equals":"socks","notRefusal":true}},{"q":"which shortcode writes the globe showing Asia-Australia emoji","expect":{"equals":"earth_asia","notRefusal":true}},{"q":"give the GitHub shortcode for family: man, woman, girl, boy","expect":{"equals":"family_man_woman_girl_boy","notRefusal":true}},{"q":"give the GitHub shortcode for Mrs. Claus","expect":{"equals":"mrs_claus","notRefusal":true}},{"q":"give the GitHub shortcode for tent","expect":{"equals":"tent","notRefusal":true}},{"q":"give the GitHub shortcode for flag: South Africa","expect":{"equals":"south_africa","notRefusal":true}},{"q":"give the GitHub shortcode for carousel horse","expect":{"equals":"carousel_horse","notRefusal":true}},{"q":"which shortcode writes the flag: England emoji","expect":{"equals":"england","notRefusal":true}},{"q":"which shortcode writes the chart increasing with yen emoji","expect":{"equals":"chart","notRefusal":true}},{"q":"what is the shortcode of the sheaf of rice emoji","expect":{"equals":"ear_of_rice","notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
