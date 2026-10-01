// language-extension-neo-g6-2.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"language-extension-neo-g6-2","class":"language-extension","generation":6,"lane":"neo","grownFrom":["which extension do DataWeave files have","which extension do Jison files have","which extension do Literate Haskell files have","what file extension does Elm use","give the file extension of Omgrofl source files","what file extension does Clarion use","give the file extension of Xtend source files","what file extension does FreeMarker use","which extension do Futhark files have","which extension do Odin files have","what file extension does Stan use","give the file extension of wisp source files","give the file extension of Slash source files","what file extension does KakouneScript use","what file extension does GAML use","what file extension does HolyC use","what file extension does Frege use","what file extension does SaltStack use","give the file extension of Harbour source files","give the file extension of Gentoo Eclass source files"],"version":1});

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
{"id":"n-481c0ae6","guard":[["has","extension"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl","which extension do Jison files have":".jison","which extension do Literate Haskell files have":".lhs","what file extension does Elm use":".elm","give the file extension of Omgrofl source files":".omgrofl","what file extension does Clarion use":".clw","give the file extension of Xtend source files":".xtend","what file extension does FreeMarker use":".ftl","which extension do Futhark files have":".fut","which extension do Odin files have":".odin","what file extension does Stan use":".stan","give the file extension of wisp source files":".wisp","give the file extension of Slash source files":".sl","what file extension does KakouneScript use":".kak","what file extension does GAML use":".gaml","what file extension does HolyC use":".hc","what file extension does Frege use":".fr","what file extension does SaltStack use":".sls","give the file extension of Harbour source files":".hb","give the file extension of Gentoo Eclass source files":".eclass","which extension do Cool files have":".cl","what file extension does Macaulay2 use":".m2","what file extension does AspectJ use":".aj","what file extension does SmPL use":".cocci","give the file extension of nesC source files":".nc","what file extension does Eiffel use":".e","which extension do Puppet files have":".pp","what file extension does ABAP use":".abap","give the file extension of ColdFusion CFC source files":".cfc","which extension do Charity files have":".ch","give the file extension of Volt source files":".volt","give the file extension of Gentoo Ebuild source files":".ebuild","which extension do Dafny files have":".dfy","give the file extension of Jasmin source files":".j","give the file extension of Self source files":".self","give the file extension of Wollok source files":".wlk","give the file extension of GAMS source files":".gms","what file extension does PureScript use":".purs","give the file extension of SWIG source files":".i","give the file extension of ActionScript source files":".as","what file extension does Game Maker Language use":".gml","what file extension does GCC Machine Description use":".md","give the file extension of V source files":".v","give the file extension of VBScript source files":".vbs","what file extension does Bluespec use":".bsv","which extension do DM files have":".dm","which extension do Parrot files have":".parrot","give the file extension of Qt Script source files":".qs","what file extension does ANTLR use":".g4","which extension do Xonsh files have":".xsh","what file extension does Glyph use":".glf","what file extension does RobotFramework use":".robot","which extension do Isabelle files have":".thy","which extension do BASIC files have":".bas","give the file extension of Beef source files":".bf","give the file extension of Fluent source files":".ftl","give the file extension of Genie source files":".gs","what file extension does ObjectScript use":".cls","what file extension does Boogie use":".bpl","what file extension does CUE use":".cue","give the file extension of Redcode source files":".cw","what file extension does Zig use":".zig","which extension do Befunge files have":".befunge","which extension do Opal files have":".opal","which extension do Ragel files have":".rl","which extension do Apex files have":".cls","which extension do Propeller Spin files have":".spin","what file extension does Factor use":".factor","what file extension does Papyrus use":".psc","give the file extension of Hy source files":".hy","which extension do mcfunction files have":".mcfunction","which extension do Dogescript files have":".djs","give the file extension of X10 source files":".x10","which extension do Fennel files have":".fnl","what file extension does Cap'n Proto use":".capnp","which extension do Brightscript files have":".brs","which extension do Filebench WML files have":".f","which extension do Nu files have":".nu","give the file extension of Agda source files":".agda","which extension do MoonScript files have":".moon","what file extension does PogoScript use":".pogo","which extension do XS files have":".xs","which extension do Moocode files have":".moo","what file extension does Oz use":".oz","give the file extension of Csound Score source files":".sco","what file extension does Zephir use":".zep","give the file extension of OpenQASM source files":".qasm","which extension do mIRC Script files have":".mrc","which extension do Oxygene files have":".oxygene","give the file extension of ShaderLab source files":".shader","what file extension does Pan use":".pan","give the file extension of ECLiPSe source files":".ecl","which extension do Solidity files have":".sol","give the file extension of DTrace source files":".d","give the file extension of Click source files":".click","what file extension does Grammatical Framework use":".gf","which extension do SAS files have":".sas","which extension do Cycript files have":".cy","what file extension does 4D use":".4dm","give the file extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-66185941","guard":[["has","extension"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl","which extension do Jison files have":".jison","which extension do Literate Haskell files have":".lhs","what file extension does Elm use":".elm","give the file extension of Omgrofl source files":".omgrofl","what file extension does Clarion use":".clw","give the file extension of Xtend source files":".xtend","what file extension does FreeMarker use":".ftl","which extension do Futhark files have":".fut","which extension do Odin files have":".odin","what file extension does Stan use":".stan","give the file extension of wisp source files":".wisp","give the file extension of Slash source files":".sl","what file extension does KakouneScript use":".kak","what file extension does GAML use":".gaml","what file extension does HolyC use":".hc","what file extension does Frege use":".fr","what file extension does SaltStack use":".sls","give the file extension of Harbour source files":".hb","give the file extension of Gentoo Eclass source files":".eclass","which extension do Cool files have":".cl","what file extension does Macaulay2 use":".m2","what file extension does AspectJ use":".aj","what file extension does SmPL use":".cocci","give the file extension of nesC source files":".nc","what file extension does Eiffel use":".e","which extension do Puppet files have":".pp","what file extension does ABAP use":".abap","give the file extension of ColdFusion CFC source files":".cfc","which extension do Charity files have":".ch","give the file extension of Volt source files":".volt","give the file extension of Gentoo Ebuild source files":".ebuild","which extension do Dafny files have":".dfy","give the file extension of Jasmin source files":".j","give the file extension of Self source files":".self","give the file extension of Wollok source files":".wlk","give the file extension of GAMS source files":".gms","what file extension does PureScript use":".purs","give the file extension of SWIG source files":".i","give the file extension of ActionScript source files":".as","what file extension does Game Maker Language use":".gml","what file extension does GCC Machine Description use":".md","give the file extension of V source files":".v","give the file extension of VBScript source files":".vbs","what file extension does Bluespec use":".bsv","which extension do DM files have":".dm","which extension do Parrot files have":".parrot","give the file extension of Qt Script source files":".qs","what file extension does ANTLR use":".g4","which extension do Xonsh files have":".xsh","what file extension does Glyph use":".glf","what file extension does RobotFramework use":".robot","which extension do Isabelle files have":".thy","which extension do BASIC files have":".bas","give the file extension of Beef source files":".bf","give the file extension of Fluent source files":".ftl","give the file extension of Genie source files":".gs","what file extension does ObjectScript use":".cls","what file extension does Boogie use":".bpl","what file extension does CUE use":".cue","give the file extension of Redcode source files":".cw","what file extension does Zig use":".zig","which extension do Befunge files have":".befunge","which extension do Opal files have":".opal","which extension do Ragel files have":".rl","which extension do Apex files have":".cls","which extension do Propeller Spin files have":".spin","what file extension does Factor use":".factor","what file extension does Papyrus use":".psc","give the file extension of Hy source files":".hy","which extension do mcfunction files have":".mcfunction","which extension do Dogescript files have":".djs","give the file extension of X10 source files":".x10","which extension do Fennel files have":".fnl","what file extension does Cap'n Proto use":".capnp","which extension do Brightscript files have":".brs","which extension do Filebench WML files have":".f","which extension do Nu files have":".nu","give the file extension of Agda source files":".agda","which extension do MoonScript files have":".moon","what file extension does PogoScript use":".pogo","which extension do XS files have":".xs","which extension do Moocode files have":".moo","what file extension does Oz use":".oz","give the file extension of Csound Score source files":".sco","what file extension does Zephir use":".zep","give the file extension of OpenQASM source files":".qasm","which extension do mIRC Script files have":".mrc","which extension do Oxygene files have":".oxygene","give the file extension of ShaderLab source files":".shader","what file extension does Pan use":".pan","give the file extension of ECLiPSe source files":".ecl","which extension do Solidity files have":".sol","give the file extension of DTrace source files":".d","give the file extension of Click source files":".click","what file extension does Grammatical Framework use":".gf","which extension do SAS files have":".sas","which extension do Cycript files have":".cy","what file extension does 4D use":".4dm","give the file extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-6b454d56","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl","which extension do Jison files have":".jison","which extension do Literate Haskell files have":".lhs","what file extension does Elm use":".elm","give the file extension of Omgrofl source files":".omgrofl","what file extension does Clarion use":".clw","give the file extension of Xtend source files":".xtend","what file extension does FreeMarker use":".ftl","which extension do Futhark files have":".fut","which extension do Odin files have":".odin","what file extension does Stan use":".stan","give the file extension of wisp source files":".wisp","give the file extension of Slash source files":".sl","what file extension does KakouneScript use":".kak","what file extension does GAML use":".gaml","what file extension does HolyC use":".hc","what file extension does Frege use":".fr","what file extension does SaltStack use":".sls","give the file extension of Harbour source files":".hb","give the file extension of Gentoo Eclass source files":".eclass","which extension do Cool files have":".cl","what file extension does Macaulay2 use":".m2","what file extension does AspectJ use":".aj","what file extension does SmPL use":".cocci","give the file extension of nesC source files":".nc","what file extension does Eiffel use":".e","which extension do Puppet files have":".pp","what file extension does ABAP use":".abap","give the file extension of ColdFusion CFC source files":".cfc","which extension do Charity files have":".ch","give the file extension of Volt source files":".volt","give the file extension of Gentoo Ebuild source files":".ebuild","which extension do Dafny files have":".dfy","give the file extension of Jasmin source files":".j","give the file extension of Self source files":".self","give the file extension of Wollok source files":".wlk","give the file extension of GAMS source files":".gms","what file extension does PureScript use":".purs","give the file extension of SWIG source files":".i","give the file extension of ActionScript source files":".as","what file extension does Game Maker Language use":".gml","what file extension does GCC Machine Description use":".md","give the file extension of V source files":".v","give the file extension of VBScript source files":".vbs","what file extension does Bluespec use":".bsv","which extension do DM files have":".dm","which extension do Parrot files have":".parrot","give the file extension of Qt Script source files":".qs","what file extension does ANTLR use":".g4","which extension do Xonsh files have":".xsh","what file extension does Glyph use":".glf","what file extension does RobotFramework use":".robot","which extension do Isabelle files have":".thy","which extension do BASIC files have":".bas","give the file extension of Beef source files":".bf","give the file extension of Fluent source files":".ftl","give the file extension of Genie source files":".gs","what file extension does ObjectScript use":".cls","what file extension does Boogie use":".bpl","what file extension does CUE use":".cue","give the file extension of Redcode source files":".cw","what file extension does Zig use":".zig","which extension do Befunge files have":".befunge","which extension do Opal files have":".opal","which extension do Ragel files have":".rl","which extension do Apex files have":".cls","which extension do Propeller Spin files have":".spin","what file extension does Factor use":".factor","what file extension does Papyrus use":".psc","give the file extension of Hy source files":".hy","which extension do mcfunction files have":".mcfunction","which extension do Dogescript files have":".djs","give the file extension of X10 source files":".x10","which extension do Fennel files have":".fnl","what file extension does Cap'n Proto use":".capnp","which extension do Brightscript files have":".brs","which extension do Filebench WML files have":".f","which extension do Nu files have":".nu","give the file extension of Agda source files":".agda","which extension do MoonScript files have":".moon","what file extension does PogoScript use":".pogo","which extension do XS files have":".xs","which extension do Moocode files have":".moo","what file extension does Oz use":".oz","give the file extension of Csound Score source files":".sco","what file extension does Zephir use":".zep","give the file extension of OpenQASM source files":".qasm","which extension do mIRC Script files have":".mrc","which extension do Oxygene files have":".oxygene","give the file extension of ShaderLab source files":".shader","what file extension does Pan use":".pan","give the file extension of ECLiPSe source files":".ecl","which extension do Solidity files have":".sol","give the file extension of DTrace source files":".d","give the file extension of Click source files":".click","what file extension does Grammatical Framework use":".gf","which extension do SAS files have":".sas","which extension do Cycript files have":".cy","what file extension does 4D use":".4dm","give the file extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-c7d5e11c","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl","which extension do Jison files have":".jison","which extension do Literate Haskell files have":".lhs","what file extension does Elm use":".elm","give the file extension of Omgrofl source files":".omgrofl","what file extension does Clarion use":".clw","give the file extension of Xtend source files":".xtend","what file extension does FreeMarker use":".ftl","which extension do Futhark files have":".fut","which extension do Odin files have":".odin","what file extension does Stan use":".stan","give the file extension of wisp source files":".wisp","give the file extension of Slash source files":".sl","what file extension does KakouneScript use":".kak","what file extension does GAML use":".gaml","what file extension does HolyC use":".hc","what file extension does Frege use":".fr","what file extension does SaltStack use":".sls","give the file extension of Harbour source files":".hb","give the file extension of Gentoo Eclass source files":".eclass","which extension do Cool files have":".cl","what file extension does Macaulay2 use":".m2","what file extension does AspectJ use":".aj","what file extension does SmPL use":".cocci","give the file extension of nesC source files":".nc","what file extension does Eiffel use":".e","which extension do Puppet files have":".pp","what file extension does ABAP use":".abap","give the file extension of ColdFusion CFC source files":".cfc","which extension do Charity files have":".ch","give the file extension of Volt source files":".volt","give the file extension of Gentoo Ebuild source files":".ebuild","which extension do Dafny files have":".dfy","give the file extension of Jasmin source files":".j","give the file extension of Self source files":".self","give the file extension of Wollok source files":".wlk","give the file extension of GAMS source files":".gms","what file extension does PureScript use":".purs","give the file extension of SWIG source files":".i","give the file extension of ActionScript source files":".as","what file extension does Game Maker Language use":".gml","what file extension does GCC Machine Description use":".md","give the file extension of V source files":".v","give the file extension of VBScript source files":".vbs","what file extension does Bluespec use":".bsv","which extension do DM files have":".dm","which extension do Parrot files have":".parrot","give the file extension of Qt Script source files":".qs","what file extension does ANTLR use":".g4","which extension do Xonsh files have":".xsh","what file extension does Glyph use":".glf","what file extension does RobotFramework use":".robot","which extension do Isabelle files have":".thy","which extension do BASIC files have":".bas","give the file extension of Beef source files":".bf","give the file extension of Fluent source files":".ftl","give the file extension of Genie source files":".gs","what file extension does ObjectScript use":".cls","what file extension does Boogie use":".bpl","what file extension does CUE use":".cue","give the file extension of Redcode source files":".cw","what file extension does Zig use":".zig","which extension do Befunge files have":".befunge","which extension do Opal files have":".opal","which extension do Ragel files have":".rl","which extension do Apex files have":".cls","which extension do Propeller Spin files have":".spin","what file extension does Factor use":".factor","what file extension does Papyrus use":".psc","give the file extension of Hy source files":".hy","which extension do mcfunction files have":".mcfunction","which extension do Dogescript files have":".djs","give the file extension of X10 source files":".x10","which extension do Fennel files have":".fnl","what file extension does Cap'n Proto use":".capnp","which extension do Brightscript files have":".brs","which extension do Filebench WML files have":".f","which extension do Nu files have":".nu","give the file extension of Agda source files":".agda","which extension do MoonScript files have":".moon","what file extension does PogoScript use":".pogo","which extension do XS files have":".xs","which extension do Moocode files have":".moo","what file extension does Oz use":".oz","give the file extension of Csound Score source files":".sco","what file extension does Zephir use":".zep","give the file extension of OpenQASM source files":".qasm","which extension do mIRC Script files have":".mrc","which extension do Oxygene files have":".oxygene","give the file extension of ShaderLab source files":".shader","what file extension does Pan use":".pan","give the file extension of ECLiPSe source files":".ecl","which extension do Solidity files have":".sol","give the file extension of DTrace source files":".d","give the file extension of Click source files":".click","what file extension does Grammatical Framework use":".gf","which extension do SAS files have":".sas","which extension do Cycript files have":".cy","what file extension does 4D use":".4dm","give the file extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-1291efbe","guard":[["has","extension"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"extension"}]]],"mem":{"table":{"do DataWeave files have":".dwl","do Jison files have":".jison","do Literate Haskell files have":".lhs","does Elm use":".elm","of Omgrofl source files":".omgrofl","does Clarion use":".clw","of Xtend source files":".xtend","does FreeMarker use":".ftl","do Futhark files have":".fut","do Odin files have":".odin","does Stan use":".stan","of wisp source files":".wisp","of Slash source files":".sl","does KakouneScript use":".kak","does GAML use":".gaml","does HolyC use":".hc","does Frege use":".fr","does SaltStack use":".sls","of Harbour source files":".hb","of Gentoo Eclass source files":".eclass","do Cool files have":".cl","does Macaulay2 use":".m2","does AspectJ use":".aj","does SmPL use":".cocci","of nesC source files":".nc","does Eiffel use":".e","do Puppet files have":".pp","does ABAP use":".abap","of ColdFusion CFC source files":".cfc","do Charity files have":".ch","of Volt source files":".volt","of Gentoo Ebuild source files":".ebuild","do Dafny files have":".dfy","of Jasmin source files":".j","of Self source files":".self","of Wollok source files":".wlk","of GAMS source files":".gms","does PureScript use":".purs","of SWIG source files":".i","of ActionScript source files":".as","does Game Maker Language use":".gml","does GCC Machine Description use":".md","of V source files":".v","of VBScript source files":".vbs","does Bluespec use":".bsv","do DM files have":".dm","do Parrot files have":".parrot","of Qt Script source files":".qs","does ANTLR use":".g4","do Xonsh files have":".xsh","does Glyph use":".glf","does RobotFramework use":".robot","do Isabelle files have":".thy","do BASIC files have":".bas","of Beef source files":".bf","of Fluent source files":".ftl","of Genie source files":".gs","does ObjectScript use":".cls","does Boogie use":".bpl","does CUE use":".cue","of Redcode source files":".cw","does Zig use":".zig","do Befunge files have":".befunge","do Opal files have":".opal","do Ragel files have":".rl","do Apex files have":".cls","do Propeller Spin files have":".spin","does Factor use":".factor","does Papyrus use":".psc","of Hy source files":".hy","do mcfunction files have":".mcfunction","do Dogescript files have":".djs","of X10 source files":".x10","do Fennel files have":".fnl","does Cap'n Proto use":".capnp","do Brightscript files have":".brs","do Filebench WML files have":".f","do Nu files have":".nu","of Agda source files":".agda","do MoonScript files have":".moon","does PogoScript use":".pogo","do XS files have":".xs","do Moocode files have":".moo","does Oz use":".oz","of Csound Score source files":".sco","does Zephir use":".zep","of OpenQASM source files":".qasm","do mIRC Script files have":".mrc","do Oxygene files have":".oxygene","of ShaderLab source files":".shader","does Pan use":".pan","of ECLiPSe source files":".ecl","do Solidity files have":".sol","of DTrace source files":".d","of Click source files":".click","does Grammatical Framework use":".gf","do SAS files have":".sas","do Cycript files have":".cy","does 4D use":".4dm","of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-1f3cbaa0","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"extension"}]]],"mem":{"table":{"do DataWeave files have":".dwl","do Jison files have":".jison","do Literate Haskell files have":".lhs","does Elm use":".elm","of Omgrofl source files":".omgrofl","does Clarion use":".clw","of Xtend source files":".xtend","does FreeMarker use":".ftl","do Futhark files have":".fut","do Odin files have":".odin","does Stan use":".stan","of wisp source files":".wisp","of Slash source files":".sl","does KakouneScript use":".kak","does GAML use":".gaml","does HolyC use":".hc","does Frege use":".fr","does SaltStack use":".sls","of Harbour source files":".hb","of Gentoo Eclass source files":".eclass","do Cool files have":".cl","does Macaulay2 use":".m2","does AspectJ use":".aj","does SmPL use":".cocci","of nesC source files":".nc","does Eiffel use":".e","do Puppet files have":".pp","does ABAP use":".abap","of ColdFusion CFC source files":".cfc","do Charity files have":".ch","of Volt source files":".volt","of Gentoo Ebuild source files":".ebuild","do Dafny files have":".dfy","of Jasmin source files":".j","of Self source files":".self","of Wollok source files":".wlk","of GAMS source files":".gms","does PureScript use":".purs","of SWIG source files":".i","of ActionScript source files":".as","does Game Maker Language use":".gml","does GCC Machine Description use":".md","of V source files":".v","of VBScript source files":".vbs","does Bluespec use":".bsv","do DM files have":".dm","do Parrot files have":".parrot","of Qt Script source files":".qs","does ANTLR use":".g4","do Xonsh files have":".xsh","does Glyph use":".glf","does RobotFramework use":".robot","do Isabelle files have":".thy","do BASIC files have":".bas","of Beef source files":".bf","of Fluent source files":".ftl","of Genie source files":".gs","does ObjectScript use":".cls","does Boogie use":".bpl","does CUE use":".cue","of Redcode source files":".cw","does Zig use":".zig","do Befunge files have":".befunge","do Opal files have":".opal","do Ragel files have":".rl","do Apex files have":".cls","do Propeller Spin files have":".spin","does Factor use":".factor","does Papyrus use":".psc","of Hy source files":".hy","do mcfunction files have":".mcfunction","do Dogescript files have":".djs","of X10 source files":".x10","do Fennel files have":".fnl","does Cap'n Proto use":".capnp","do Brightscript files have":".brs","do Filebench WML files have":".f","do Nu files have":".nu","of Agda source files":".agda","do MoonScript files have":".moon","does PogoScript use":".pogo","do XS files have":".xs","do Moocode files have":".moo","does Oz use":".oz","of Csound Score source files":".sco","does Zephir use":".zep","of OpenQASM source files":".qasm","do mIRC Script files have":".mrc","do Oxygene files have":".oxygene","of ShaderLab source files":".shader","does Pan use":".pan","of ECLiPSe source files":".ecl","do Solidity files have":".sol","of DTrace source files":".d","of Click source files":".click","does Grammatical Framework use":".gf","do SAS files have":".sas","do Cycript files have":".cy","does 4D use":".4dm","of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-61df6826","guard":[],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"extension"}]]],"mem":{"table":{"do DataWeave files have":".dwl","do Jison files have":".jison","do Literate Haskell files have":".lhs","does Elm use":".elm","of Omgrofl source files":".omgrofl","does Clarion use":".clw","of Xtend source files":".xtend","does FreeMarker use":".ftl","do Futhark files have":".fut","do Odin files have":".odin","does Stan use":".stan","of wisp source files":".wisp","of Slash source files":".sl","does KakouneScript use":".kak","does GAML use":".gaml","does HolyC use":".hc","does Frege use":".fr","does SaltStack use":".sls","of Harbour source files":".hb","of Gentoo Eclass source files":".eclass","do Cool files have":".cl","does Macaulay2 use":".m2","does AspectJ use":".aj","does SmPL use":".cocci","of nesC source files":".nc","does Eiffel use":".e","do Puppet files have":".pp","does ABAP use":".abap","of ColdFusion CFC source files":".cfc","do Charity files have":".ch","of Volt source files":".volt","of Gentoo Ebuild source files":".ebuild","do Dafny files have":".dfy","of Jasmin source files":".j","of Self source files":".self","of Wollok source files":".wlk","of GAMS source files":".gms","does PureScript use":".purs","of SWIG source files":".i","of ActionScript source files":".as","does Game Maker Language use":".gml","does GCC Machine Description use":".md","of V source files":".v","of VBScript source files":".vbs","does Bluespec use":".bsv","do DM files have":".dm","do Parrot files have":".parrot","of Qt Script source files":".qs","does ANTLR use":".g4","do Xonsh files have":".xsh","does Glyph use":".glf","does RobotFramework use":".robot","do Isabelle files have":".thy","do BASIC files have":".bas","of Beef source files":".bf","of Fluent source files":".ftl","of Genie source files":".gs","does ObjectScript use":".cls","does Boogie use":".bpl","does CUE use":".cue","of Redcode source files":".cw","does Zig use":".zig","do Befunge files have":".befunge","do Opal files have":".opal","do Ragel files have":".rl","do Apex files have":".cls","do Propeller Spin files have":".spin","does Factor use":".factor","does Papyrus use":".psc","of Hy source files":".hy","do mcfunction files have":".mcfunction","do Dogescript files have":".djs","of X10 source files":".x10","do Fennel files have":".fnl","does Cap'n Proto use":".capnp","do Brightscript files have":".brs","do Filebench WML files have":".f","do Nu files have":".nu","of Agda source files":".agda","do MoonScript files have":".moon","does PogoScript use":".pogo","do XS files have":".xs","do Moocode files have":".moo","does Oz use":".oz","of Csound Score source files":".sco","does Zephir use":".zep","of OpenQASM source files":".qasm","do mIRC Script files have":".mrc","do Oxygene files have":".oxygene","of ShaderLab source files":".shader","does Pan use":".pan","of ECLiPSe source files":".ecl","do Solidity files have":".sol","of DTrace source files":".d","of Click source files":".click","does Grammatical Framework use":".gf","do SAS files have":".sas","do Cycript files have":".cy","does 4D use":".4dm","of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-d3a04f98","guard":[["has","extension"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"extension"}]]],"mem":{"table":{"do DataWeave files have":".dwl","do Jison files have":".jison","do Literate Haskell files have":".lhs","does Elm use":".elm","of Omgrofl source files":".omgrofl","does Clarion use":".clw","of Xtend source files":".xtend","does FreeMarker use":".ftl","do Futhark files have":".fut","do Odin files have":".odin","does Stan use":".stan","of wisp source files":".wisp","of Slash source files":".sl","does KakouneScript use":".kak","does GAML use":".gaml","does HolyC use":".hc","does Frege use":".fr","does SaltStack use":".sls","of Harbour source files":".hb","of Gentoo Eclass source files":".eclass","do Cool files have":".cl","does Macaulay2 use":".m2","does AspectJ use":".aj","does SmPL use":".cocci","of nesC source files":".nc","does Eiffel use":".e","do Puppet files have":".pp","does ABAP use":".abap","of ColdFusion CFC source files":".cfc","do Charity files have":".ch","of Volt source files":".volt","of Gentoo Ebuild source files":".ebuild","do Dafny files have":".dfy","of Jasmin source files":".j","of Self source files":".self","of Wollok source files":".wlk","of GAMS source files":".gms","does PureScript use":".purs","of SWIG source files":".i","of ActionScript source files":".as","does Game Maker Language use":".gml","does GCC Machine Description use":".md","of V source files":".v","of VBScript source files":".vbs","does Bluespec use":".bsv","do DM files have":".dm","do Parrot files have":".parrot","of Qt Script source files":".qs","does ANTLR use":".g4","do Xonsh files have":".xsh","does Glyph use":".glf","does RobotFramework use":".robot","do Isabelle files have":".thy","do BASIC files have":".bas","of Beef source files":".bf","of Fluent source files":".ftl","of Genie source files":".gs","does ObjectScript use":".cls","does Boogie use":".bpl","does CUE use":".cue","of Redcode source files":".cw","does Zig use":".zig","do Befunge files have":".befunge","do Opal files have":".opal","do Ragel files have":".rl","do Apex files have":".cls","do Propeller Spin files have":".spin","does Factor use":".factor","does Papyrus use":".psc","of Hy source files":".hy","do mcfunction files have":".mcfunction","do Dogescript files have":".djs","of X10 source files":".x10","do Fennel files have":".fnl","does Cap'n Proto use":".capnp","do Brightscript files have":".brs","do Filebench WML files have":".f","do Nu files have":".nu","of Agda source files":".agda","do MoonScript files have":".moon","does PogoScript use":".pogo","do XS files have":".xs","do Moocode files have":".moo","does Oz use":".oz","of Csound Score source files":".sco","does Zephir use":".zep","of OpenQASM source files":".qasm","do mIRC Script files have":".mrc","do Oxygene files have":".oxygene","of ShaderLab source files":".shader","does Pan use":".pan","of ECLiPSe source files":".ecl","do Solidity files have":".sol","of DTrace source files":".d","of Click source files":".click","does Grammatical Framework use":".gf","do SAS files have":".sas","do Cycript files have":".cy","does 4D use":".4dm","of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-12f8ff0a","guard":[["hasAny",["abap","actionscript","agda","antlr","aspectj","beef","bluespec","boogie","capn","cfc","clarion","click","csound","cue","description","dtrace","eclipse","eiffel","elm","factor","fluent","framework","freemarker","frege","game","gaml","gams","genie","gentoo","glyph","harbour","have","holyc","hy","jasmin","javascripterb","kakounescript","nesc","objectscript","omgrofl","openqasm","oz","pan","papyrus","pogoscript","purescript","redcode","robotframework","saltstack","script","self","shaderlab","slash","smpl","stan","swig","v","vbscript","volt","wisp","wollok","xtend","zephir","zig"]],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl","which extension do Jison files have":".jison","which extension do Literate Haskell files have":".lhs","what file extension does Elm use":".elm","give the file extension of Omgrofl source files":".omgrofl","what file extension does Clarion use":".clw","give the file extension of Xtend source files":".xtend","what file extension does FreeMarker use":".ftl","which extension do Futhark files have":".fut","which extension do Odin files have":".odin","what file extension does Stan use":".stan","give the file extension of wisp source files":".wisp","give the file extension of Slash source files":".sl","what file extension does KakouneScript use":".kak","what file extension does GAML use":".gaml","what file extension does HolyC use":".hc","what file extension does Frege use":".fr","what file extension does SaltStack use":".sls","give the file extension of Harbour source files":".hb","give the file extension of Gentoo Eclass source files":".eclass","which extension do Cool files have":".cl","what file extension does AspectJ use":".aj","what file extension does SmPL use":".cocci","give the file extension of nesC source files":".nc","what file extension does Eiffel use":".e","which extension do Puppet files have":".pp","what file extension does ABAP use":".abap","give the file extension of ColdFusion CFC source files":".cfc","which extension do Charity files have":".ch","give the file extension of Volt source files":".volt","give the file extension of Gentoo Ebuild source files":".ebuild","which extension do Dafny files have":".dfy","give the file extension of Jasmin source files":".j","give the file extension of Self source files":".self","give the file extension of Wollok source files":".wlk","give the file extension of GAMS source files":".gms","what file extension does PureScript use":".purs","give the file extension of SWIG source files":".i","give the file extension of ActionScript source files":".as","what file extension does Game Maker Language use":".gml","what file extension does GCC Machine Description use":".md","give the file extension of V source files":".v","give the file extension of VBScript source files":".vbs","what file extension does Bluespec use":".bsv","which extension do DM files have":".dm","which extension do Parrot files have":".parrot","give the file extension of Qt Script source files":".qs","what file extension does ANTLR use":".g4","which extension do Xonsh files have":".xsh","what file extension does Glyph use":".glf","what file extension does RobotFramework use":".robot","which extension do Isabelle files have":".thy","which extension do BASIC files have":".bas","give the file extension of Beef source files":".bf","give the file extension of Fluent source files":".ftl","give the file extension of Genie source files":".gs","what file extension does ObjectScript use":".cls","what file extension does Boogie use":".bpl","what file extension does CUE use":".cue","give the file extension of Redcode source files":".cw","what file extension does Zig use":".zig","which extension do Befunge files have":".befunge","which extension do Opal files have":".opal","which extension do Ragel files have":".rl","which extension do Apex files have":".cls","which extension do Propeller Spin files have":".spin","what file extension does Factor use":".factor","what file extension does Papyrus use":".psc","give the file extension of Hy source files":".hy","which extension do mcfunction files have":".mcfunction","which extension do Dogescript files have":".djs","which extension do Fennel files have":".fnl","what file extension does Cap'n Proto use":".capnp","which extension do Brightscript files have":".brs","which extension do Filebench WML files have":".f","which extension do Nu files have":".nu","give the file extension of Agda source files":".agda","which extension do MoonScript files have":".moon","what file extension does PogoScript use":".pogo","which extension do XS files have":".xs","which extension do Moocode files have":".moo","what file extension does Oz use":".oz","give the file extension of Csound Score source files":".sco","what file extension does Zephir use":".zep","give the file extension of OpenQASM source files":".qasm","which extension do mIRC Script files have":".mrc","which extension do Oxygene files have":".oxygene","give the file extension of ShaderLab source files":".shader","what file extension does Pan use":".pan","give the file extension of ECLiPSe source files":".ecl","which extension do Solidity files have":".sol","give the file extension of DTrace source files":".d","give the file extension of Click source files":".click","what file extension does Grammatical Framework use":".gf","which extension do SAS files have":".sas","which extension do Cycript files have":".cy","give the file extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-32b09d03","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl","which extension do Jison files have":".jison","which extension do Literate Haskell files have":".lhs","what file extension does Elm use":".elm","give the file extension of Omgrofl source files":".omgrofl","what file extension does Clarion use":".clw","give the file extension of Xtend source files":".xtend","what file extension does FreeMarker use":".ftl","which extension do Futhark files have":".fut","which extension do Odin files have":".odin","what file extension does Stan use":".stan","give the file extension of wisp source files":".wisp","give the file extension of Slash source files":".sl","what file extension does KakouneScript use":".kak","what file extension does GAML use":".gaml","what file extension does HolyC use":".hc","what file extension does Frege use":".fr","what file extension does SaltStack use":".sls","give the file extension of Harbour source files":".hb","give the file extension of Gentoo Eclass source files":".eclass","which extension do Cool files have":".cl","what file extension does AspectJ use":".aj","what file extension does SmPL use":".cocci","give the file extension of nesC source files":".nc","what file extension does Eiffel use":".e","which extension do Puppet files have":".pp","what file extension does ABAP use":".abap","give the file extension of ColdFusion CFC source files":".cfc","which extension do Charity files have":".ch","give the file extension of Volt source files":".volt","give the file extension of Gentoo Ebuild source files":".ebuild","which extension do Dafny files have":".dfy","give the file extension of Jasmin source files":".j","give the file extension of Self source files":".self","give the file extension of Wollok source files":".wlk","give the file extension of GAMS source files":".gms","what file extension does PureScript use":".purs","give the file extension of SWIG source files":".i","give the file extension of ActionScript source files":".as","what file extension does Game Maker Language use":".gml","what file extension does GCC Machine Description use":".md","give the file extension of V source files":".v","give the file extension of VBScript source files":".vbs","what file extension does Bluespec use":".bsv","which extension do DM files have":".dm","which extension do Parrot files have":".parrot","give the file extension of Qt Script source files":".qs","what file extension does ANTLR use":".g4","which extension do Xonsh files have":".xsh","what file extension does Glyph use":".glf","what file extension does RobotFramework use":".robot","which extension do Isabelle files have":".thy","which extension do BASIC files have":".bas","give the file extension of Beef source files":".bf","give the file extension of Fluent source files":".ftl","give the file extension of Genie source files":".gs","what file extension does ObjectScript use":".cls","what file extension does Boogie use":".bpl","what file extension does CUE use":".cue","give the file extension of Redcode source files":".cw","what file extension does Zig use":".zig","which extension do Befunge files have":".befunge","which extension do Opal files have":".opal","which extension do Ragel files have":".rl","which extension do Apex files have":".cls","which extension do Propeller Spin files have":".spin","what file extension does Factor use":".factor","what file extension does Papyrus use":".psc","give the file extension of Hy source files":".hy","which extension do mcfunction files have":".mcfunction","which extension do Dogescript files have":".djs","which extension do Fennel files have":".fnl","what file extension does Cap'n Proto use":".capnp","which extension do Brightscript files have":".brs","which extension do Filebench WML files have":".f","which extension do Nu files have":".nu","give the file extension of Agda source files":".agda","which extension do MoonScript files have":".moon","what file extension does PogoScript use":".pogo","which extension do XS files have":".xs","which extension do Moocode files have":".moo","what file extension does Oz use":".oz","give the file extension of Csound Score source files":".sco","what file extension does Zephir use":".zep","give the file extension of OpenQASM source files":".qasm","which extension do mIRC Script files have":".mrc","which extension do Oxygene files have":".oxygene","give the file extension of ShaderLab source files":".shader","what file extension does Pan use":".pan","give the file extension of ECLiPSe source files":".ecl","which extension do Solidity files have":".sol","give the file extension of DTrace source files":".d","give the file extension of Click source files":".click","what file extension does Grammatical Framework use":".gf","which extension do SAS files have":".sas","which extension do Cycript files have":".cy","give the file extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-3ad07305","guard":[["hasAny",["abap","actionscript","agda","antlr","aspectj","beef","bluespec","boogie","capn","cfc","clarion","click","csound","cue","description","dtrace","eclipse","eiffel","elm","factor","fluent","framework","freemarker","frege","game","gaml","gams","genie","gentoo","glyph","harbour","have","holyc","hy","jasmin","javascripterb","kakounescript","nesc","objectscript","omgrofl","openqasm","oz","pan","papyrus","pogoscript","purescript","redcode","robotframework","saltstack","script","self","shaderlab","slash","smpl","stan","swig","v","vbscript","volt","wisp","wollok","xtend","zephir","zig"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl","which extension do Jison files have":".jison","which extension do Literate Haskell files have":".lhs","what file extension does Elm use":".elm","give the file extension of Omgrofl source files":".omgrofl","what file extension does Clarion use":".clw","give the file extension of Xtend source files":".xtend","what file extension does FreeMarker use":".ftl","which extension do Futhark files have":".fut","which extension do Odin files have":".odin","what file extension does Stan use":".stan","give the file extension of wisp source files":".wisp","give the file extension of Slash source files":".sl","what file extension does KakouneScript use":".kak","what file extension does GAML use":".gaml","what file extension does HolyC use":".hc","what file extension does Frege use":".fr","what file extension does SaltStack use":".sls","give the file extension of Harbour source files":".hb","give the file extension of Gentoo Eclass source files":".eclass","which extension do Cool files have":".cl","what file extension does AspectJ use":".aj","what file extension does SmPL use":".cocci","give the file extension of nesC source files":".nc","what file extension does Eiffel use":".e","which extension do Puppet files have":".pp","what file extension does ABAP use":".abap","give the file extension of ColdFusion CFC source files":".cfc","which extension do Charity files have":".ch","give the file extension of Volt source files":".volt","give the file extension of Gentoo Ebuild source files":".ebuild","which extension do Dafny files have":".dfy","give the file extension of Jasmin source files":".j","give the file extension of Self source files":".self","give the file extension of Wollok source files":".wlk","give the file extension of GAMS source files":".gms","what file extension does PureScript use":".purs","give the file extension of SWIG source files":".i","give the file extension of ActionScript source files":".as","what file extension does Game Maker Language use":".gml","what file extension does GCC Machine Description use":".md","give the file extension of V source files":".v","give the file extension of VBScript source files":".vbs","what file extension does Bluespec use":".bsv","which extension do DM files have":".dm","which extension do Parrot files have":".parrot","give the file extension of Qt Script source files":".qs","what file extension does ANTLR use":".g4","which extension do Xonsh files have":".xsh","what file extension does Glyph use":".glf","what file extension does RobotFramework use":".robot","which extension do Isabelle files have":".thy","which extension do BASIC files have":".bas","give the file extension of Beef source files":".bf","give the file extension of Fluent source files":".ftl","give the file extension of Genie source files":".gs","what file extension does ObjectScript use":".cls","what file extension does Boogie use":".bpl","what file extension does CUE use":".cue","give the file extension of Redcode source files":".cw","what file extension does Zig use":".zig","which extension do Befunge files have":".befunge","which extension do Opal files have":".opal","which extension do Ragel files have":".rl","which extension do Apex files have":".cls","which extension do Propeller Spin files have":".spin","what file extension does Factor use":".factor","what file extension does Papyrus use":".psc","give the file extension of Hy source files":".hy","which extension do mcfunction files have":".mcfunction","which extension do Dogescript files have":".djs","which extension do Fennel files have":".fnl","what file extension does Cap'n Proto use":".capnp","which extension do Brightscript files have":".brs","which extension do Filebench WML files have":".f","which extension do Nu files have":".nu","give the file extension of Agda source files":".agda","which extension do MoonScript files have":".moon","what file extension does PogoScript use":".pogo","which extension do XS files have":".xs","which extension do Moocode files have":".moo","what file extension does Oz use":".oz","give the file extension of Csound Score source files":".sco","what file extension does Zephir use":".zep","give the file extension of OpenQASM source files":".qasm","which extension do mIRC Script files have":".mrc","which extension do Oxygene files have":".oxygene","give the file extension of ShaderLab source files":".shader","what file extension does Pan use":".pan","give the file extension of ECLiPSe source files":".ecl","which extension do Solidity files have":".sol","give the file extension of DTrace source files":".d","give the file extension of Click source files":".click","what file extension does Grammatical Framework use":".gf","which extension do SAS files have":".sas","which extension do Cycript files have":".cy","give the file extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-f986d926","guard":[["hasAny",["abap","actionscript","agda","antlr","aspectj","beef","bluespec","boogie","capn","cfc","clarion","click","csound","cue","description","dtrace","eclipse","eiffel","elm","factor","fluent","framework","freemarker","frege","game","gaml","gams","genie","gentoo","glyph","harbour","have","holyc","hy","jasmin","javascripterb","kakounescript","nesc","objectscript","omgrofl","openqasm","oz","pan","papyrus","pogoscript","purescript","redcode","robotframework","saltstack","script","self","shaderlab","slash","smpl","stan","swig","v","vbscript","volt","wisp","wollok","xtend","zephir","zig"]],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl","which extension do Jison files have":".jison","which extension do Literate Haskell files have":".lhs","what file extension does Elm use":".elm","give the file extension of Omgrofl source files":".omgrofl","what file extension does Clarion use":".clw","give the file extension of Xtend source files":".xtend","what file extension does FreeMarker use":".ftl","which extension do Futhark files have":".fut","which extension do Odin files have":".odin","what file extension does Stan use":".stan","give the file extension of wisp source files":".wisp","give the file extension of Slash source files":".sl","what file extension does KakouneScript use":".kak","what file extension does GAML use":".gaml","what file extension does HolyC use":".hc","what file extension does Frege use":".fr","what file extension does SaltStack use":".sls","give the file extension of Harbour source files":".hb","give the file extension of Gentoo Eclass source files":".eclass","which extension do Cool files have":".cl","what file extension does AspectJ use":".aj","what file extension does SmPL use":".cocci","give the file extension of nesC source files":".nc","what file extension does Eiffel use":".e","which extension do Puppet files have":".pp","what file extension does ABAP use":".abap","give the file extension of ColdFusion CFC source files":".cfc","which extension do Charity files have":".ch","give the file extension of Volt source files":".volt","give the file extension of Gentoo Ebuild source files":".ebuild","which extension do Dafny files have":".dfy","give the file extension of Jasmin source files":".j","give the file extension of Self source files":".self","give the file extension of Wollok source files":".wlk","give the file extension of GAMS source files":".gms","what file extension does PureScript use":".purs","give the file extension of SWIG source files":".i","give the file extension of ActionScript source files":".as","what file extension does Game Maker Language use":".gml","what file extension does GCC Machine Description use":".md","give the file extension of V source files":".v","give the file extension of VBScript source files":".vbs","what file extension does Bluespec use":".bsv","which extension do DM files have":".dm","which extension do Parrot files have":".parrot","give the file extension of Qt Script source files":".qs","what file extension does ANTLR use":".g4","which extension do Xonsh files have":".xsh","what file extension does Glyph use":".glf","what file extension does RobotFramework use":".robot","which extension do Isabelle files have":".thy","which extension do BASIC files have":".bas","give the file extension of Beef source files":".bf","give the file extension of Fluent source files":".ftl","give the file extension of Genie source files":".gs","what file extension does ObjectScript use":".cls","what file extension does Boogie use":".bpl","what file extension does CUE use":".cue","give the file extension of Redcode source files":".cw","what file extension does Zig use":".zig","which extension do Befunge files have":".befunge","which extension do Opal files have":".opal","which extension do Ragel files have":".rl","which extension do Apex files have":".cls","which extension do Propeller Spin files have":".spin","what file extension does Factor use":".factor","what file extension does Papyrus use":".psc","give the file extension of Hy source files":".hy","which extension do mcfunction files have":".mcfunction","which extension do Dogescript files have":".djs","which extension do Fennel files have":".fnl","what file extension does Cap'n Proto use":".capnp","which extension do Brightscript files have":".brs","which extension do Filebench WML files have":".f","which extension do Nu files have":".nu","give the file extension of Agda source files":".agda","which extension do MoonScript files have":".moon","what file extension does PogoScript use":".pogo","which extension do XS files have":".xs","which extension do Moocode files have":".moo","what file extension does Oz use":".oz","give the file extension of Csound Score source files":".sco","what file extension does Zephir use":".zep","give the file extension of OpenQASM source files":".qasm","which extension do mIRC Script files have":".mrc","which extension do Oxygene files have":".oxygene","give the file extension of ShaderLab source files":".shader","what file extension does Pan use":".pan","give the file extension of ECLiPSe source files":".ecl","which extension do Solidity files have":".sol","give the file extension of DTrace source files":".d","give the file extension of Click source files":".click","what file extension does Grammatical Framework use":".gf","which extension do SAS files have":".sas","which extension do Cycript files have":".cy","give the file extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-4f22c6a0","guard":[["has","extension"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"file"}]]],"mem":{"table":{"extension does Elm use":".elm","extension of Omgrofl source files":".omgrofl","extension does Clarion use":".clw","extension of Xtend source files":".xtend","extension does FreeMarker use":".ftl","extension does Stan use":".stan","extension of wisp source files":".wisp","extension of Slash source files":".sl","extension does KakouneScript use":".kak","extension does GAML use":".gaml","extension does HolyC use":".hc","extension does Frege use":".fr","extension does SaltStack use":".sls","extension of Harbour source files":".hb","extension of Gentoo Eclass source files":".eclass","extension does Macaulay2 use":".m2","extension does AspectJ use":".aj","extension does SmPL use":".cocci","extension of nesC source files":".nc","extension does Eiffel use":".e","extension does ABAP use":".abap","extension of ColdFusion CFC source files":".cfc","extension of Volt source files":".volt","extension of Gentoo Ebuild source files":".ebuild","extension of Jasmin source files":".j","extension of Self source files":".self","extension of Wollok source files":".wlk","extension of GAMS source files":".gms","extension does PureScript use":".purs","extension of SWIG source files":".i","extension of ActionScript source files":".as","extension does Game Maker Language use":".gml","extension does GCC Machine Description use":".md","extension of V source files":".v","extension of VBScript source files":".vbs","extension does Bluespec use":".bsv","extension of Qt Script source files":".qs","extension does ANTLR use":".g4","extension does Glyph use":".glf","extension does RobotFramework use":".robot","extension of Beef source files":".bf","extension of Fluent source files":".ftl","extension of Genie source files":".gs","extension does ObjectScript use":".cls","extension does Boogie use":".bpl","extension does CUE use":".cue","extension of Redcode source files":".cw","extension does Zig use":".zig","extension does Factor use":".factor","extension does Papyrus use":".psc","extension of Hy source files":".hy","extension of X10 source files":".x10","extension does Cap'n Proto use":".capnp","extension of Agda source files":".agda","extension does PogoScript use":".pogo","extension does Oz use":".oz","extension of Csound Score source files":".sco","extension does Zephir use":".zep","extension of OpenQASM source files":".qasm","extension of ShaderLab source files":".shader","extension does Pan use":".pan","extension of ECLiPSe source files":".ecl","extension of DTrace source files":".d","extension of Click source files":".click","extension does Grammatical Framework use":".gf","extension does 4D use":".4dm","extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-834035cb","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"file"}]]],"mem":{"table":{"extension does Elm use":".elm","extension of Omgrofl source files":".omgrofl","extension does Clarion use":".clw","extension of Xtend source files":".xtend","extension does FreeMarker use":".ftl","extension does Stan use":".stan","extension of wisp source files":".wisp","extension of Slash source files":".sl","extension does KakouneScript use":".kak","extension does GAML use":".gaml","extension does HolyC use":".hc","extension does Frege use":".fr","extension does SaltStack use":".sls","extension of Harbour source files":".hb","extension of Gentoo Eclass source files":".eclass","extension does Macaulay2 use":".m2","extension does AspectJ use":".aj","extension does SmPL use":".cocci","extension of nesC source files":".nc","extension does Eiffel use":".e","extension does ABAP use":".abap","extension of ColdFusion CFC source files":".cfc","extension of Volt source files":".volt","extension of Gentoo Ebuild source files":".ebuild","extension of Jasmin source files":".j","extension of Self source files":".self","extension of Wollok source files":".wlk","extension of GAMS source files":".gms","extension does PureScript use":".purs","extension of SWIG source files":".i","extension of ActionScript source files":".as","extension does Game Maker Language use":".gml","extension does GCC Machine Description use":".md","extension of V source files":".v","extension of VBScript source files":".vbs","extension does Bluespec use":".bsv","extension of Qt Script source files":".qs","extension does ANTLR use":".g4","extension does Glyph use":".glf","extension does RobotFramework use":".robot","extension of Beef source files":".bf","extension of Fluent source files":".ftl","extension of Genie source files":".gs","extension does ObjectScript use":".cls","extension does Boogie use":".bpl","extension does CUE use":".cue","extension of Redcode source files":".cw","extension does Zig use":".zig","extension does Factor use":".factor","extension does Papyrus use":".psc","extension of Hy source files":".hy","extension of X10 source files":".x10","extension does Cap'n Proto use":".capnp","extension of Agda source files":".agda","extension does PogoScript use":".pogo","extension does Oz use":".oz","extension of Csound Score source files":".sco","extension does Zephir use":".zep","extension of OpenQASM source files":".qasm","extension of ShaderLab source files":".shader","extension does Pan use":".pan","extension of ECLiPSe source files":".ecl","extension of DTrace source files":".d","extension of Click source files":".click","extension does Grammatical Framework use":".gf","extension does 4D use":".4dm","extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-8e5fe10f","guard":[],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"file"}]]],"mem":{"table":{"extension does Elm use":".elm","extension of Omgrofl source files":".omgrofl","extension does Clarion use":".clw","extension of Xtend source files":".xtend","extension does FreeMarker use":".ftl","extension does Stan use":".stan","extension of wisp source files":".wisp","extension of Slash source files":".sl","extension does KakouneScript use":".kak","extension does GAML use":".gaml","extension does HolyC use":".hc","extension does Frege use":".fr","extension does SaltStack use":".sls","extension of Harbour source files":".hb","extension of Gentoo Eclass source files":".eclass","extension does Macaulay2 use":".m2","extension does AspectJ use":".aj","extension does SmPL use":".cocci","extension of nesC source files":".nc","extension does Eiffel use":".e","extension does ABAP use":".abap","extension of ColdFusion CFC source files":".cfc","extension of Volt source files":".volt","extension of Gentoo Ebuild source files":".ebuild","extension of Jasmin source files":".j","extension of Self source files":".self","extension of Wollok source files":".wlk","extension of GAMS source files":".gms","extension does PureScript use":".purs","extension of SWIG source files":".i","extension of ActionScript source files":".as","extension does Game Maker Language use":".gml","extension does GCC Machine Description use":".md","extension of V source files":".v","extension of VBScript source files":".vbs","extension does Bluespec use":".bsv","extension of Qt Script source files":".qs","extension does ANTLR use":".g4","extension does Glyph use":".glf","extension does RobotFramework use":".robot","extension of Beef source files":".bf","extension of Fluent source files":".ftl","extension of Genie source files":".gs","extension does ObjectScript use":".cls","extension does Boogie use":".bpl","extension does CUE use":".cue","extension of Redcode source files":".cw","extension does Zig use":".zig","extension does Factor use":".factor","extension does Papyrus use":".psc","extension of Hy source files":".hy","extension of X10 source files":".x10","extension does Cap'n Proto use":".capnp","extension of Agda source files":".agda","extension does PogoScript use":".pogo","extension does Oz use":".oz","extension of Csound Score source files":".sco","extension does Zephir use":".zep","extension of OpenQASM source files":".qasm","extension of ShaderLab source files":".shader","extension does Pan use":".pan","extension of ECLiPSe source files":".ecl","extension of DTrace source files":".d","extension of Click source files":".click","extension does Grammatical Framework use":".gf","extension does 4D use":".4dm","extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-b28fd68d","guard":[["has","extension"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"file"}]]],"mem":{"table":{"extension does Elm use":".elm","extension of Omgrofl source files":".omgrofl","extension does Clarion use":".clw","extension of Xtend source files":".xtend","extension does FreeMarker use":".ftl","extension does Stan use":".stan","extension of wisp source files":".wisp","extension of Slash source files":".sl","extension does KakouneScript use":".kak","extension does GAML use":".gaml","extension does HolyC use":".hc","extension does Frege use":".fr","extension does SaltStack use":".sls","extension of Harbour source files":".hb","extension of Gentoo Eclass source files":".eclass","extension does Macaulay2 use":".m2","extension does AspectJ use":".aj","extension does SmPL use":".cocci","extension of nesC source files":".nc","extension does Eiffel use":".e","extension does ABAP use":".abap","extension of ColdFusion CFC source files":".cfc","extension of Volt source files":".volt","extension of Gentoo Ebuild source files":".ebuild","extension of Jasmin source files":".j","extension of Self source files":".self","extension of Wollok source files":".wlk","extension of GAMS source files":".gms","extension does PureScript use":".purs","extension of SWIG source files":".i","extension of ActionScript source files":".as","extension does Game Maker Language use":".gml","extension does GCC Machine Description use":".md","extension of V source files":".v","extension of VBScript source files":".vbs","extension does Bluespec use":".bsv","extension of Qt Script source files":".qs","extension does ANTLR use":".g4","extension does Glyph use":".glf","extension does RobotFramework use":".robot","extension of Beef source files":".bf","extension of Fluent source files":".ftl","extension of Genie source files":".gs","extension does ObjectScript use":".cls","extension does Boogie use":".bpl","extension does CUE use":".cue","extension of Redcode source files":".cw","extension does Zig use":".zig","extension does Factor use":".factor","extension does Papyrus use":".psc","extension of Hy source files":".hy","extension of X10 source files":".x10","extension does Cap'n Proto use":".capnp","extension of Agda source files":".agda","extension does PogoScript use":".pogo","extension does Oz use":".oz","extension of Csound Score source files":".sco","extension does Zephir use":".zep","extension of OpenQASM source files":".qasm","extension of ShaderLab source files":".shader","extension does Pan use":".pan","extension of ECLiPSe source files":".ecl","extension of DTrace source files":".d","extension of Click source files":".click","extension does Grammatical Framework use":".gf","extension does 4D use":".4dm","extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-157f2bc5","guard":[],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"files"}]]],"mem":{"table":{"which extension do DataWeave":".dwl","which extension do Jison":".jison","which extension do Literate Haskell":".lhs","give the file extension of Omgrofl source":".omgrofl","give the file extension of Xtend source":".xtend","which extension do Futhark":".fut","which extension do Odin":".odin","give the file extension of wisp source":".wisp","give the file extension of Slash source":".sl","give the file extension of Harbour source":".hb","give the file extension of Gentoo Eclass source":".eclass","which extension do Cool":".cl","give the file extension of nesC source":".nc","which extension do Puppet":".pp","give the file extension of ColdFusion CFC source":".cfc","which extension do Charity":".ch","give the file extension of Volt source":".volt","give the file extension of Gentoo Ebuild source":".ebuild","which extension do Dafny":".dfy","give the file extension of Jasmin source":".j","give the file extension of Self source":".self","give the file extension of Wollok source":".wlk","give the file extension of GAMS source":".gms","give the file extension of SWIG source":".i","give the file extension of ActionScript source":".as","give the file extension of V source":".v","give the file extension of VBScript source":".vbs","which extension do DM":".dm","which extension do Parrot":".parrot","give the file extension of Qt Script source":".qs","which extension do Xonsh":".xsh","which extension do Isabelle":".thy","which extension do BASIC":".bas","give the file extension of Beef source":".bf","give the file extension of Fluent source":".ftl","give the file extension of Genie source":".gs","give the file extension of Redcode source":".cw","which extension do Befunge":".befunge","which extension do Opal":".opal","which extension do Ragel":".rl","which extension do Apex":".cls","which extension do Propeller Spin":".spin","give the file extension of Hy source":".hy","which extension do mcfunction":".mcfunction","which extension do Dogescript":".djs","give the file extension of X10 source":".x10","which extension do Fennel":".fnl","which extension do Brightscript":".brs","which extension do Filebench WML":".f","which extension do Nu":".nu","give the file extension of Agda source":".agda","which extension do MoonScript":".moon","which extension do XS":".xs","which extension do Moocode":".moo","give the file extension of Csound Score source":".sco","give the file extension of OpenQASM source":".qasm","which extension do mIRC Script":".mrc","which extension do Oxygene":".oxygene","give the file extension of ShaderLab source":".shader","give the file extension of ECLiPSe source":".ecl","which extension do Solidity":".sol","give the file extension of DTrace source":".d","give the file extension of Click source":".click","which extension do SAS":".sas","which extension do Cycript":".cy","give the file extension of JavaScript+ERB source":".js.erb"}}},
{"id":"n-52d5de94","guard":[["has","extension"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"files"}]]],"mem":{"table":{"which extension do DataWeave":".dwl","which extension do Jison":".jison","which extension do Literate Haskell":".lhs","give the file extension of Omgrofl source":".omgrofl","give the file extension of Xtend source":".xtend","which extension do Futhark":".fut","which extension do Odin":".odin","give the file extension of wisp source":".wisp","give the file extension of Slash source":".sl","give the file extension of Harbour source":".hb","give the file extension of Gentoo Eclass source":".eclass","which extension do Cool":".cl","give the file extension of nesC source":".nc","which extension do Puppet":".pp","give the file extension of ColdFusion CFC source":".cfc","which extension do Charity":".ch","give the file extension of Volt source":".volt","give the file extension of Gentoo Ebuild source":".ebuild","which extension do Dafny":".dfy","give the file extension of Jasmin source":".j","give the file extension of Self source":".self","give the file extension of Wollok source":".wlk","give the file extension of GAMS source":".gms","give the file extension of SWIG source":".i","give the file extension of ActionScript source":".as","give the file extension of V source":".v","give the file extension of VBScript source":".vbs","which extension do DM":".dm","which extension do Parrot":".parrot","give the file extension of Qt Script source":".qs","which extension do Xonsh":".xsh","which extension do Isabelle":".thy","which extension do BASIC":".bas","give the file extension of Beef source":".bf","give the file extension of Fluent source":".ftl","give the file extension of Genie source":".gs","give the file extension of Redcode source":".cw","which extension do Befunge":".befunge","which extension do Opal":".opal","which extension do Ragel":".rl","which extension do Apex":".cls","which extension do Propeller Spin":".spin","give the file extension of Hy source":".hy","which extension do mcfunction":".mcfunction","which extension do Dogescript":".djs","give the file extension of X10 source":".x10","which extension do Fennel":".fnl","which extension do Brightscript":".brs","which extension do Filebench WML":".f","which extension do Nu":".nu","give the file extension of Agda source":".agda","which extension do MoonScript":".moon","which extension do XS":".xs","which extension do Moocode":".moo","give the file extension of Csound Score source":".sco","give the file extension of OpenQASM source":".qasm","which extension do mIRC Script":".mrc","which extension do Oxygene":".oxygene","give the file extension of ShaderLab source":".shader","give the file extension of ECLiPSe source":".ecl","which extension do Solidity":".sol","give the file extension of DTrace source":".d","give the file extension of Click source":".click","which extension do SAS":".sas","which extension do Cycript":".cy","give the file extension of JavaScript+ERB source":".js.erb"}}},
{"id":"n-95e872ee","guard":[["has","extension"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"files"}]]],"mem":{"table":{"which extension do DataWeave":".dwl","which extension do Jison":".jison","which extension do Literate Haskell":".lhs","give the file extension of Omgrofl source":".omgrofl","give the file extension of Xtend source":".xtend","which extension do Futhark":".fut","which extension do Odin":".odin","give the file extension of wisp source":".wisp","give the file extension of Slash source":".sl","give the file extension of Harbour source":".hb","give the file extension of Gentoo Eclass source":".eclass","which extension do Cool":".cl","give the file extension of nesC source":".nc","which extension do Puppet":".pp","give the file extension of ColdFusion CFC source":".cfc","which extension do Charity":".ch","give the file extension of Volt source":".volt","give the file extension of Gentoo Ebuild source":".ebuild","which extension do Dafny":".dfy","give the file extension of Jasmin source":".j","give the file extension of Self source":".self","give the file extension of Wollok source":".wlk","give the file extension of GAMS source":".gms","give the file extension of SWIG source":".i","give the file extension of ActionScript source":".as","give the file extension of V source":".v","give the file extension of VBScript source":".vbs","which extension do DM":".dm","which extension do Parrot":".parrot","give the file extension of Qt Script source":".qs","which extension do Xonsh":".xsh","which extension do Isabelle":".thy","which extension do BASIC":".bas","give the file extension of Beef source":".bf","give the file extension of Fluent source":".ftl","give the file extension of Genie source":".gs","give the file extension of Redcode source":".cw","which extension do Befunge":".befunge","which extension do Opal":".opal","which extension do Ragel":".rl","which extension do Apex":".cls","which extension do Propeller Spin":".spin","give the file extension of Hy source":".hy","which extension do mcfunction":".mcfunction","which extension do Dogescript":".djs","give the file extension of X10 source":".x10","which extension do Fennel":".fnl","which extension do Brightscript":".brs","which extension do Filebench WML":".f","which extension do Nu":".nu","give the file extension of Agda source":".agda","which extension do MoonScript":".moon","which extension do XS":".xs","which extension do Moocode":".moo","give the file extension of Csound Score source":".sco","give the file extension of OpenQASM source":".qasm","which extension do mIRC Script":".mrc","which extension do Oxygene":".oxygene","give the file extension of ShaderLab source":".shader","give the file extension of ECLiPSe source":".ecl","which extension do Solidity":".sol","give the file extension of DTrace source":".d","give the file extension of Click source":".click","which extension do SAS":".sas","which extension do Cycript":".cy","give the file extension of JavaScript+ERB source":".js.erb"}}},
{"id":"n-fd6400f4","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"files"}]]],"mem":{"table":{"which extension do DataWeave":".dwl","which extension do Jison":".jison","which extension do Literate Haskell":".lhs","give the file extension of Omgrofl source":".omgrofl","give the file extension of Xtend source":".xtend","which extension do Futhark":".fut","which extension do Odin":".odin","give the file extension of wisp source":".wisp","give the file extension of Slash source":".sl","give the file extension of Harbour source":".hb","give the file extension of Gentoo Eclass source":".eclass","which extension do Cool":".cl","give the file extension of nesC source":".nc","which extension do Puppet":".pp","give the file extension of ColdFusion CFC source":".cfc","which extension do Charity":".ch","give the file extension of Volt source":".volt","give the file extension of Gentoo Ebuild source":".ebuild","which extension do Dafny":".dfy","give the file extension of Jasmin source":".j","give the file extension of Self source":".self","give the file extension of Wollok source":".wlk","give the file extension of GAMS source":".gms","give the file extension of SWIG source":".i","give the file extension of ActionScript source":".as","give the file extension of V source":".v","give the file extension of VBScript source":".vbs","which extension do DM":".dm","which extension do Parrot":".parrot","give the file extension of Qt Script source":".qs","which extension do Xonsh":".xsh","which extension do Isabelle":".thy","which extension do BASIC":".bas","give the file extension of Beef source":".bf","give the file extension of Fluent source":".ftl","give the file extension of Genie source":".gs","give the file extension of Redcode source":".cw","which extension do Befunge":".befunge","which extension do Opal":".opal","which extension do Ragel":".rl","which extension do Apex":".cls","which extension do Propeller Spin":".spin","give the file extension of Hy source":".hy","which extension do mcfunction":".mcfunction","which extension do Dogescript":".djs","give the file extension of X10 source":".x10","which extension do Fennel":".fnl","which extension do Brightscript":".brs","which extension do Filebench WML":".f","which extension do Nu":".nu","give the file extension of Agda source":".agda","which extension do MoonScript":".moon","which extension do XS":".xs","which extension do Moocode":".moo","give the file extension of Csound Score source":".sco","give the file extension of OpenQASM source":".qasm","which extension do mIRC Script":".mrc","which extension do Oxygene":".oxygene","give the file extension of ShaderLab source":".shader","give the file extension of ECLiPSe source":".ecl","which extension do Solidity":".sol","give the file extension of DTrace source":".d","give the file extension of Click source":".click","which extension do SAS":".sas","which extension do Cycript":".cy","give the file extension of JavaScript+ERB source":".js.erb"}}},
{"id":"n-2a369c9f","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"do DataWeave files have":".dwl","do Jison files have":".jison","do Literate Haskell files have":".lhs","does Elm use":".elm","of Omgrofl source files":".omgrofl","does Clarion use":".clw","of Xtend source files":".xtend","does FreeMarker use":".ftl","do Futhark files have":".fut","do Odin files have":".odin","does Stan use":".stan","of wisp source files":".wisp","of Slash source files":".sl","does KakouneScript use":".kak","does GAML use":".gaml","does HolyC use":".hc","does Frege use":".fr","does SaltStack use":".sls","of Harbour source files":".hb","of Gentoo Eclass source files":".eclass","do Cool files have":".cl","does Macaulay2 use":".m2","does AspectJ use":".aj","does SmPL use":".cocci","of nesC source files":".nc","does Eiffel use":".e","do Puppet files have":".pp","does ABAP use":".abap","of ColdFusion CFC source files":".cfc","do Charity files have":".ch","of Volt source files":".volt","of Gentoo Ebuild source files":".ebuild","do Dafny files have":".dfy","of Jasmin source files":".j","of Self source files":".self","of Wollok source files":".wlk","of GAMS source files":".gms","does PureScript use":".purs","of SWIG source files":".i","of ActionScript source files":".as","does Game Maker Language use":".gml","does GCC Machine Description use":".md","of V source files":".v","of VBScript source files":".vbs","does Bluespec use":".bsv","do DM files have":".dm","do Parrot files have":".parrot","of Qt Script source files":".qs","does ANTLR use":".g4","do Xonsh files have":".xsh","does Glyph use":".glf","does RobotFramework use":".robot","do Isabelle files have":".thy","do BASIC files have":".bas","of Beef source files":".bf","of Fluent source files":".ftl","of Genie source files":".gs","does ObjectScript use":".cls","does Boogie use":".bpl","does CUE use":".cue","of Redcode source files":".cw","does Zig use":".zig","do Befunge files have":".befunge","do Opal files have":".opal","do Ragel files have":".rl","do Apex files have":".cls","do Propeller Spin files have":".spin","does Factor use":".factor","does Papyrus use":".psc","of Hy source files":".hy","do mcfunction files have":".mcfunction","do Dogescript files have":".djs","of X10 source files":".x10","do Fennel files have":".fnl","does Cap'n Proto use":".capnp","do Brightscript files have":".brs","do Filebench WML files have":".f","do Nu files have":".nu","of Agda source files":".agda","do MoonScript files have":".moon","does PogoScript use":".pogo","do XS files have":".xs","do Moocode files have":".moo","does Oz use":".oz","of Csound Score source files":".sco","does Zephir use":".zep","of OpenQASM source files":".qasm","do mIRC Script files have":".mrc","do Oxygene files have":".oxygene","of ShaderLab source files":".shader","does Pan use":".pan","of ECLiPSe source files":".ecl","do Solidity files have":".sol","of DTrace source files":".d","of Click source files":".click","does Grammatical Framework use":".gf","do SAS files have":".sas","do Cycript files have":".cy","does 4D use":".4dm","of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-9a513fe3","guard":[["has","extension"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"Omgrofl source files":".omgrofl","Xtend source files":".xtend","wisp source files":".wisp","Slash source files":".sl","Harbour source files":".hb","Gentoo Eclass source files":".eclass","nesC source files":".nc","ColdFusion CFC source files":".cfc","Volt source files":".volt","Gentoo Ebuild source files":".ebuild","Jasmin source files":".j","Self source files":".self","Wollok source files":".wlk","GAMS source files":".gms","SWIG source files":".i","ActionScript source files":".as","V source files":".v","VBScript source files":".vbs","Qt Script source files":".qs","Beef source files":".bf","Fluent source files":".ftl","Genie source files":".gs","Redcode source files":".cw","Hy source files":".hy","X10 source files":".x10","Agda source files":".agda","Csound Score source files":".sco","OpenQASM source files":".qasm","ShaderLab source files":".shader","ECLiPSe source files":".ecl","DTrace source files":".d","Click source files":".click","JavaScript+ERB source files":".js.erb"}}},
{"id":"n-9ebf1b31","guard":[],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"Omgrofl source files":".omgrofl","Xtend source files":".xtend","wisp source files":".wisp","Slash source files":".sl","Harbour source files":".hb","Gentoo Eclass source files":".eclass","nesC source files":".nc","ColdFusion CFC source files":".cfc","Volt source files":".volt","Gentoo Ebuild source files":".ebuild","Jasmin source files":".j","Self source files":".self","Wollok source files":".wlk","GAMS source files":".gms","SWIG source files":".i","ActionScript source files":".as","V source files":".v","VBScript source files":".vbs","Qt Script source files":".qs","Beef source files":".bf","Fluent source files":".ftl","Genie source files":".gs","Redcode source files":".cw","Hy source files":".hy","X10 source files":".x10","Agda source files":".agda","Csound Score source files":".sco","OpenQASM source files":".qasm","ShaderLab source files":".shader","ECLiPSe source files":".ecl","DTrace source files":".d","Click source files":".click","JavaScript+ERB source files":".js.erb"}}},
{"id":"n-9eeb3446","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"Omgrofl source files":".omgrofl","Xtend source files":".xtend","wisp source files":".wisp","Slash source files":".sl","Harbour source files":".hb","Gentoo Eclass source files":".eclass","nesC source files":".nc","ColdFusion CFC source files":".cfc","Volt source files":".volt","Gentoo Ebuild source files":".ebuild","Jasmin source files":".j","Self source files":".self","Wollok source files":".wlk","GAMS source files":".gms","SWIG source files":".i","ActionScript source files":".as","V source files":".v","VBScript source files":".vbs","Qt Script source files":".qs","Beef source files":".bf","Fluent source files":".ftl","Genie source files":".gs","Redcode source files":".cw","Hy source files":".hy","X10 source files":".x10","Agda source files":".agda","Csound Score source files":".sco","OpenQASM source files":".qasm","ShaderLab source files":".shader","ECLiPSe source files":".ecl","DTrace source files":".d","Click source files":".click","JavaScript+ERB source files":".js.erb"}}},
{"id":"n-ad42a4e3","guard":[["has","extension"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"Omgrofl source files":".omgrofl","Xtend source files":".xtend","wisp source files":".wisp","Slash source files":".sl","Harbour source files":".hb","Gentoo Eclass source files":".eclass","nesC source files":".nc","ColdFusion CFC source files":".cfc","Volt source files":".volt","Gentoo Ebuild source files":".ebuild","Jasmin source files":".j","Self source files":".self","Wollok source files":".wlk","GAMS source files":".gms","SWIG source files":".i","ActionScript source files":".as","V source files":".v","VBScript source files":".vbs","Qt Script source files":".qs","Beef source files":".bf","Fluent source files":".ftl","Genie source files":".gs","Redcode source files":".cw","Hy source files":".hy","X10 source files":".x10","Agda source files":".agda","Csound Score source files":".sco","OpenQASM source files":".qasm","ShaderLab source files":".shader","ECLiPSe source files":".ecl","DTrace source files":".d","Click source files":".click","JavaScript+ERB source files":".js.erb"}}},
{"id":"n-806db526","guard":[["hasAny",["abap","agda","click","cue","elm","factor","gaml","hy","item number","nth","omgrofl","oz","pan","position","propeller","self","stan","v","volt","wisp","x10","xtend","zig"]],["has","extension"],["not",["quoted"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d550808a","guard":[["hasAny",["abap","agda","click","cue","elm","factor","gaml","hy","item number","nth","omgrofl","oz","pan","position","propeller","self","stan","v","volt","wisp","x10","xtend","zig"]],["has","extension"]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e1d118f4","guard":[["hasAny",["abap","agda","click","cue","elm","factor","gaml","hy","item number","nth","omgrofl","oz","pan","position","propeller","self","stan","v","volt","wisp","x10","xtend","zig"]],["has","extension"],["not",["colon"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-11e05b09","guard":[["hasAny",["cfc","cue","dm","elm","hy","nu","odin","opal","oz","pan","propeller","sas","shortest","shortest one","shortest word","v","x10","xs","zig"]],["has","extension"],["not",["colon"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f5c8dced","guard":[["hasAny",["cfc","cue","dm","elm","hy","nu","odin","opal","oz","pan","propeller","sas","shortest","shortest one","shortest word","v","x10","xs","zig"]],["has","extension"],["not",["quoted"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fabaa33b","guard":[["hasAny",["cfc","cue","dm","elm","hy","nu","odin","opal","oz","pan","propeller","sas","shortest","shortest one","shortest word","v","x10","xs","zig"]],["has","extension"]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-16240150","guard":[["hasAny",["befunge","dm","item number","jison","mcfunction","nth","nu","odin","opal","oxygene","parrot","position","sas","xs"]],["has","extension"]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-326dad6d","guard":[["hasAny",["befunge","dm","item number","jison","mcfunction","nth","nu","odin","opal","oxygene","parrot","position","sas","xs"]],["has","extension"]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-34fbd97f","guard":[["hasAny",["befunge","dm","item number","jison","mcfunction","nth","nu","odin","opal","oxygene","parrot","position","sas","xs"]],["has","extension"],["not",["colon"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-adb2e269","guard":[["hasAny",["befunge","dm","item number","jison","mcfunction","nth","nu","odin","opal","oxygene","parrot","position","sas","xs"]],["has","extension"],["not",["colon"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c61c858c","guard":[["hasAny",["befunge","dm","item number","jison","mcfunction","nth","nu","odin","opal","oxygene","parrot","position","sas","xs"]],["has","extension"],["not",["quoted"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-f90b9ea2","guard":[["hasAny",["befunge","dm","item number","jison","mcfunction","nth","nu","odin","opal","oxygene","parrot","position","sas","xs"]],["has","extension"],["not",["quoted"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-353a88b9","guard":[["hasAny",["agda","click","hy","item number","nth","omgrofl","position","self","v","volt","wisp","x10","xtend"]],["has","give"]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.words"],{"lit":6}]],"mem":null},
{"id":"n-39c9c0b7","guard":[["hasAny",["abap","cue","elm","factor","gaml","item number","nth","oz","pan","position","propeller","stan","zig"]],["has","extension"]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-76f46908","guard":[["hasAny",["abap","cue","elm","factor","gaml","item number","nth","oz","pan","position","propeller","stan","zig"]],["has","extension"],["not",["colon"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-cf421160","guard":[["hasAny",["abap","cue","elm","factor","gaml","item number","nth","oz","pan","position","propeller","stan","zig"]],["has","extension"],["not",["quoted"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2a9f2db9","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.numeral"]]],"mem":{"table":{"Macaulay2":".m2","X10":".x10","4D":".4dm"}}},
{"id":"n-33bbead3","guard":[["has","extension"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.numeral"]]],"mem":{"table":{"Macaulay2":".m2","X10":".x10","4D":".4dm"}}},
{"id":"n-a608a78f","guard":[["has","extension"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.numeral"]]],"mem":{"table":{"Macaulay2":".m2","X10":".x10","4D":".4dm"}}},
{"id":"n-daab658e","guard":[],"pyramid":["render.str",["memory.lookup",["sense.numeral"]]],"mem":{"table":{"Macaulay2":".m2","X10":".x10","4D":".4dm"}}},
{"id":"n-4e199a19","guard":[["hasAny",["cfc","gentoo","item number","nth","position"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ad0b5a79","guard":[["hasAny",["cfc","gentoo","item number","nth","position"]],["not",["quoted"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cb5be304","guard":[["hasAny",["cfc","gentoo","item number","nth","position"]],["not",["colon"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2290e5b2","guard":[["hasAny",["fluent","freemarker","normalise","normalize","simplify the text"]],["not",["colon"]]],"pyramid":["render.str",["transform.norm",{"lit":".ftl"},["sense.howMany"]]],"mem":null},
{"id":"n-2cbb07f4","guard":[["hasAny",["fluent","freemarker","normalise","normalize","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":".ftl"},["sense.howMany"]]],"mem":null},
{"id":"n-58b50d50","guard":[["hasAny",["apex","normalise","normalize","objectscript","simplify the text"]],["has","extension"]],"pyramid":["render.str",["transform.norm",{"lit":".cls"},["sense.howMany"]]],"mem":null},
{"id":"n-6f14d232","guard":[["hasAny",["fluent","freemarker","normalise","normalize","simplify the text"]],["not",["quoted"]]],"pyramid":["render.str",["transform.norm",{"lit":".ftl"},["sense.howMany"]]],"mem":null},
{"id":"n-0a34fa60","guard":[["hasAny",["delete","fluent","freemarker","remove","strip out","without"]],["not",["colon"]]],"pyramid":["render.str",["transform.remove",{"lit":".ftl"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-173adaff","guard":[["hasAny",["delete","fluent","freemarker","remove","strip out","without"]],["not",["quoted"]]],"pyramid":["render.str",["transform.remove",{"lit":".ftl"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-1afbd50f","guard":[["hasAny",["delete","fluent","freemarker","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":".ftl"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-6671842e","guard":[["hasAny",["delete","fluent","freemarker","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":".ftl"},["sense.after",{"lit":"extension"}]]],"mem":null},
{"id":"n-001528bb","guard":[["hasAny",["extension","file","files","genie","source"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Genie source files":".gs"}}},
{"id":"n-00221f73","guard":[["has","javascripterb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-0036ada6","guard":[["hasAny",["extension","file","files","self","source"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Self source files":".self"}}},
{"id":"n-0047703f","guard":[["has","eclipse"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of ECLiPSe source files":".ecl"}}},
{"id":"n-00a51bf9","guard":[["hasAny",["extension","factor","file","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Factor use":".factor"}}},
{"id":"n-00b6993a","guard":[["hasAny",["click","extension","file","files","source"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Click source files":".click"}}},
{"id":"n-00d90be8","guard":[["has","xonsh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Xonsh files have":".xsh"}}},
{"id":"n-00e9e68a","guard":[["hasAny",["extension","factor","file","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Factor use":".factor"}}},
{"id":"n-02357032","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Glyph use":".glf"}}},
{"id":"n-0296179c","guard":[["hasAny",["apex","extension","files","have"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Apex files have":".cls"}}},
{"id":"n-030b01dd","guard":[["has","oxygene"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Oxygene files have":".oxygene"}}},
{"id":"n-038bd8bc","guard":[["has","hy"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Hy source files":".hy"}}},
{"id":"n-04362988","guard":[["hasAny",["extension","files","have","oxygene"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Oxygene files have":".oxygene"}}},
{"id":"n-04d7c497","guard":[["hasAny",["dataweave","extension","files","have"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl"}}},
{"id":"n-050ee6e5","guard":[["hasAny",["cfc","coldfusion","extension","file","files","source"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ColdFusion CFC source files":".cfc"}}},
{"id":"n-0552b62b","guard":[["hasAny",["extension","file","pan","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Pan use":".pan"}}},
{"id":"n-05bfa117","guard":[["has","aspectj"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does AspectJ use":".aj"}}},
{"id":"n-078b64e6","guard":[["has","clarion"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Clarion use":".clw"}}},
{"id":"n-07decf3d","guard":[["hasAny",["extension","file","files","source","vbscript"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of VBScript source files":".vbs"}}},
{"id":"n-0a87f2d6","guard":[["hasAny",["extension","file","files","source","wollok"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Wollok source files":".wlk"}}},
{"id":"n-0a8b6f16","guard":[["hasAny",["qt","script"]],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Qt Script source files":".qs"}}},
{"id":"n-0d2c2f00","guard":[["hasAny",["4d","extension","file","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does 4D use":".4dm"}}},
{"id":"n-0d7824ce","guard":[["hasAny",["extension","file","papyrus","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Papyrus use":".psc"}}},
{"id":"n-0e272c21","guard":[["has","opal"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Opal files have":".opal"}}},
{"id":"n-0f1cb7e7","guard":[["has","description"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does GCC Machine Description use":".md"}}},
{"id":"n-0f86d608","guard":[["hasAny",["abap","extension","file","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ABAP use":".abap"}}},
{"id":"n-0f9a8efc","guard":[["has","clarion"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Clarion use":".clw"}}},
{"id":"n-0fbf037e","guard":[["has","parrot"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Parrot files have":".parrot"}}},
{"id":"n-10a621b0","guard":[["has","extension"],["nums>=",1]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl","which extension do Jison files have":".jison","which extension do Literate Haskell files have":".lhs","what file extension does Elm use":".elm","give the file extension of Omgrofl source files":".omgrofl","what file extension does Clarion use":".clw","give the file extension of Xtend source files":".xtend","what file extension does FreeMarker use":".ftl","which extension do Futhark files have":".fut","which extension do Odin files have":".odin","what file extension does Stan use":".stan","give the file extension of wisp source files":".wisp","give the file extension of Slash source files":".sl","what file extension does KakouneScript use":".kak","what file extension does GAML use":".gaml","what file extension does HolyC use":".hc","what file extension does Frege use":".fr","what file extension does SaltStack use":".sls","give the file extension of Harbour source files":".hb","give the file extension of Gentoo Eclass source files":".eclass","which extension do Cool files have":".cl","what file extension does Macaulay2 use":".m2","what file extension does AspectJ use":".aj","what file extension does SmPL use":".cocci","give the file extension of nesC source files":".nc","what file extension does Eiffel use":".e","which extension do Puppet files have":".pp","what file extension does ABAP use":".abap","give the file extension of ColdFusion CFC source files":".cfc","which extension do Charity files have":".ch","give the file extension of Volt source files":".volt","give the file extension of Gentoo Ebuild source files":".ebuild","which extension do Dafny files have":".dfy","give the file extension of Jasmin source files":".j","give the file extension of Self source files":".self","give the file extension of Wollok source files":".wlk","give the file extension of GAMS source files":".gms","what file extension does PureScript use":".purs","give the file extension of SWIG source files":".i","give the file extension of ActionScript source files":".as","what file extension does Game Maker Language use":".gml","what file extension does GCC Machine Description use":".md","give the file extension of V source files":".v","give the file extension of VBScript source files":".vbs","what file extension does Bluespec use":".bsv","which extension do DM files have":".dm","which extension do Parrot files have":".parrot","give the file extension of Qt Script source files":".qs","what file extension does ANTLR use":".g4","which extension do Xonsh files have":".xsh","what file extension does Glyph use":".glf","what file extension does RobotFramework use":".robot","which extension do Isabelle files have":".thy","which extension do BASIC files have":".bas","give the file extension of Beef source files":".bf","give the file extension of Fluent source files":".ftl","give the file extension of Genie source files":".gs","what file extension does ObjectScript use":".cls","what file extension does Boogie use":".bpl","what file extension does CUE use":".cue","give the file extension of Redcode source files":".cw","what file extension does Zig use":".zig","which extension do Befunge files have":".befunge","which extension do Opal files have":".opal","which extension do Ragel files have":".rl","which extension do Apex files have":".cls","which extension do Propeller Spin files have":".spin","what file extension does Factor use":".factor","what file extension does Papyrus use":".psc","give the file extension of Hy source files":".hy","which extension do mcfunction files have":".mcfunction","which extension do Dogescript files have":".djs","give the file extension of X10 source files":".x10","which extension do Fennel files have":".fnl","what file extension does Cap'n Proto use":".capnp","which extension do Brightscript files have":".brs","which extension do Filebench WML files have":".f","which extension do Nu files have":".nu","give the file extension of Agda source files":".agda","which extension do MoonScript files have":".moon","what file extension does PogoScript use":".pogo","which extension do XS files have":".xs","which extension do Moocode files have":".moo","what file extension does Oz use":".oz","give the file extension of Csound Score source files":".sco","what file extension does Zephir use":".zep","give the file extension of OpenQASM source files":".qasm","which extension do mIRC Script files have":".mrc","which extension do Oxygene files have":".oxygene","give the file extension of ShaderLab source files":".shader","what file extension does Pan use":".pan","give the file extension of ECLiPSe source files":".ecl","which extension do Solidity files have":".sol","give the file extension of DTrace source files":".d","give the file extension of Click source files":".click","what file extension does Grammatical Framework use":".gf","which extension do SAS files have":".sas","which extension do Cycript files have":".cy","what file extension does 4D use":".4dm","give the file extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-10d7d68a","guard":[["has","abap"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does ABAP use":".abap"}}},
{"id":"n-1159629f","guard":[["has","qt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Qt Script source files":".qs"}}},
{"id":"n-11c529c9","guard":[["hasAny",["extension","file","files","slash","source"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Slash source files":".sl"}}},
{"id":"n-127201a3","guard":[["hasAny",["eclipse","extension","file","files","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ECLiPSe source files":".ecl"}}},
{"id":"n-129595e3","guard":[["hasAny",["description","extension","file","gcc","machine","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does GCC Machine Description use":".md"}}},
{"id":"n-132b8a8e","guard":[["has","mirc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do mIRC Script files have":".mrc"}}},
{"id":"n-1336f6c1","guard":[["hasAny",["extension","file","use","zephir"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Zephir use":".zep"}}},
{"id":"n-13a8daec","guard":[["has","nu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Nu files have":".nu"}}},
{"id":"n-13b988a9","guard":[["has","isabelle"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Isabelle files have":".thy"}}},
{"id":"n-14475f85","guard":[["hasAny",["csound","extension","file","files","score","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Csound Score source files":".sco"}}},
{"id":"n-14558e92","guard":[["has","basic"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do BASIC files have":".bas"}}},
{"id":"n-146137f8","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Nu files have":".nu"}}},
{"id":"n-150c0560","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Futhark files have":".fut"}}},
{"id":"n-1580acc5","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Zephir use":".zep"}}},
{"id":"n-166e24a9","guard":[["hasAny",["extension","files","have","moocode"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Moocode files have":".moo"}}},
{"id":"n-185c7b6a","guard":[["hasAny",["extension","file","files","source","xtend"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Xtend source files":".xtend"}}},
{"id":"n-1870673f","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does GAML use":".gaml"}}},
{"id":"n-18e3325c","guard":[["has","ragel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Ragel files have":".rl"}}},
{"id":"n-1963c456","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do XS files have":".xs"}}},
{"id":"n-1a138262","guard":[["hasAny",["description","extension","file","gcc","machine","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does GCC Machine Description use":".md"}}},
{"id":"n-1a3578fb","guard":[["has","factor"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Factor use":".factor"}}},
{"id":"n-1a6b4f79","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do XS files have":".xs"}}},
{"id":"n-1b6a101d","guard":[["has","dtrace"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of DTrace source files":".d"}}},
{"id":"n-1bd93e5e","guard":[["hasAny",["extension","files","futhark","have"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Futhark files have":".fut"}}},
{"id":"n-1c2ac56f","guard":[["hasAny",["extension","file","files","qt","script","source"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Qt Script source files":".qs"}}},
{"id":"n-1c449c07","guard":[["has","objectscript"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does ObjectScript use":".cls"}}},
{"id":"n-1c6ca731","guard":[["has","ebuild"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Gentoo Ebuild source files":".ebuild"}}},
{"id":"n-1d0948da","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does PureScript use":".purs"}}},
{"id":"n-1d57db03","guard":[["hasAny",["extension","files","have","moocode"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Moocode files have":".moo"}}},
{"id":"n-1df32dfb","guard":[["hasAny",["extension","files","have","isabelle"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Isabelle files have":".thy"}}},
{"id":"n-1e058b65","guard":[["hasAny",["extension","file","use","zig"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Zig use":".zig"}}},
{"id":"n-1e5293ce","guard":[["hasAny",["extension","file","files","slash","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Slash source files":".sl"}}},
{"id":"n-1ea7c274","guard":[["hasAny",["extension","file","use","zephir"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Zephir use":".zep"}}},
{"id":"n-1f74ea5c","guard":[["has","harbour"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Harbour source files":".hb"}}},
{"id":"n-1f78377d","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does SaltStack use":".sls"}}},
{"id":"n-1fc7c3ae","guard":[["has","harbour"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Harbour source files":".hb"}}},
{"id":"n-1ff5869f","guard":[["hasAny",["aspectj","extension","file","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does AspectJ use":".aj"}}},
{"id":"n-2000a087","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Wollok source files":".wlk"}}},
{"id":"n-202a1ee2","guard":[["has","ragel"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Ragel files have":".rl"}}},
{"id":"n-20e1bb09","guard":[["hasAny",["extension","files","have","opal"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Opal files have":".opal"}}},
{"id":"n-223b3a72","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does 4D use":".4dm"}}},
{"id":"n-260e81d0","guard":[["has","robotframework"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does RobotFramework use":".robot"}}},
{"id":"n-27722e85","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Grammatical Framework use":".gf"}}},
{"id":"n-2774a39f","guard":[["has","sas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do SAS files have":".sas"}}},
{"id":"n-27980476","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Factor use":".factor"}}},
{"id":"n-27b90eaa","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does GCC Machine Description use":".md"}}},
{"id":"n-27babfcc","guard":[["has","eclipse"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of ECLiPSe source files":".ecl"}}},
{"id":"n-27dea4a2","guard":[["hasAny",["extension","files","have","ragel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Ragel files have":".rl"}}},
{"id":"n-290f3f13","guard":[["has","volt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Volt source files":".volt"}}},
{"id":"n-298f1332","guard":[["has","opal"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Opal files have":".opal"}}},
{"id":"n-2a1fef2c","guard":[["has","dataweave"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl"}}},
{"id":"n-2a7c15a9","guard":[["has","eiffel"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Eiffel use":".e"}}},
{"id":"n-2a7d380c","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of V source files":".v"}}},
{"id":"n-2ace4668","guard":[["hasAny",["extension","file","files","shaderlab","source"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ShaderLab source files":".shader"}}},
{"id":"n-2ad15952","guard":[["has","dataweave"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl"}}},
{"id":"n-2b544ded","guard":[["hasAny",["extension","file","pan","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Pan use":".pan"}}},
{"id":"n-2bb23ab7","guard":[["has","wisp"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of wisp source files":".wisp"}}},
{"id":"n-2c01d531","guard":[["hasAny",["click","extension","file","files","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Click source files":".click"}}},
{"id":"n-2c2f09da","guard":[["has","opal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Opal files have":".opal"}}},
{"id":"n-2cb088ae","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Self source files":".self"}}},
{"id":"n-2cddbed7","guard":[["has","fluent"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Fluent source files":".ftl"}}},
{"id":"n-2d05c3de","guard":[["hasAny",["extension","file","files","shaderlab","source"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ShaderLab source files":".shader"}}},
{"id":"n-2e173506","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does RobotFramework use":".robot"}}},
{"id":"n-2ea82da4","guard":[["has","genie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Genie source files":".gs"}}},
{"id":"n-2f6827a1","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Zephir use":".zep"}}},
{"id":"n-2f6c0ac3","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do SAS files have":".sas"}}},
{"id":"n-2fd44109","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Xtend source files":".xtend"}}},
{"id":"n-30348bba","guard":[["hasAny",["extension","file","files","slash","source"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Slash source files":".sl"}}},
{"id":"n-30e8e5a5","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Fennel files have":".fnl"}}},
{"id":"n-3137412a","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ECLiPSe source files":".ecl"}}},
{"id":"n-318e7626","guard":[["hasAny",["extension","files","futhark","have"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Futhark files have":".fut"}}},
{"id":"n-323ded9f","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ShaderLab source files":".shader"}}},
{"id":"n-32bc5929","guard":[["has","eclipse"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ECLiPSe source files":".ecl"}}},
{"id":"n-3323f92e","guard":[["has","xtend"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Xtend source files":".xtend"}}},
{"id":"n-33333f56","guard":[["has","cue"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does CUE use":".cue"}}},
{"id":"n-333a1174","guard":[["has","ebuild"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Gentoo Ebuild source files":".ebuild"}}},
{"id":"n-335f18e8","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Odin files have":".odin"}}},
{"id":"n-3361cf0e","guard":[["has","eiffel"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Eiffel use":".e"}}},
{"id":"n-3374502a","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Click source files":".click"}}},
{"id":"n-339a71be","guard":[["hasAny",["boogie","extension","file","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Boogie use":".bpl"}}},
{"id":"n-3422b566","guard":[["hasAny",["cfc","coldfusion","extension","file","files","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ColdFusion CFC source files":".cfc"}}},
{"id":"n-34ff6b4a","guard":[["has","dtrace"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of DTrace source files":".d"}}},
{"id":"n-352a326d","guard":[["hasAny",["extension","files","have","xs"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do XS files have":".xs"}}},
{"id":"n-36705ff4","guard":[["hasAny",["extension","file","smpl","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does SmPL use":".cocci"}}},
{"id":"n-367bc45a","guard":[["has","fluent"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Fluent source files":".ftl"}}},
{"id":"n-36a51471","guard":[["has","xtend"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Xtend source files":".xtend"}}},
{"id":"n-3719545e","guard":[["hasAny",["csound","score"]],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Csound Score source files":".sco"}}},
{"id":"n-37804c40","guard":[["hasAny",["propeller","spin"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Propeller Spin files have":".spin"}}},
{"id":"n-387ffe40","guard":[["has","moonscript"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do MoonScript files have":".moon"}}},
{"id":"n-38980277","guard":[["hasAny",["extension","file","files","source","volt"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Volt source files":".volt"}}},
{"id":"n-38b22082","guard":[["has","cue"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does CUE use":".cue"}}},
{"id":"n-38e23d76","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Omgrofl source files":".omgrofl"}}},
{"id":"n-38f4e643","guard":[["hasAny",["extension","files","have","odin"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Odin files have":".odin"}}},
{"id":"n-3927b05a","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Game Maker Language use":".gml"}}},
{"id":"n-39aa729a","guard":[["hasAny",["extension","file","holyc","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does HolyC use":".hc"}}},
{"id":"n-39c29708","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Nu files have":".nu"}}},
{"id":"n-3a80d381","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Genie source files":".gs"}}},
{"id":"n-3a8aeecf","guard":[["has","charity"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Charity files have":".ch"}}},
{"id":"n-3ab08b8f","guard":[["hasAny",["extension","files","have","ragel"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Ragel files have":".rl"}}},
{"id":"n-3af4874c","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ObjectScript use":".cls"}}},
{"id":"n-3b455319","guard":[["hasAny",["extension","file","files","jasmin","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Jasmin source files":".j"}}},
{"id":"n-3b90b515","guard":[["has","extension"],["nums>=",1]],"pyramid":["render.str",["memory.lookup",["sense.numeral"]]],"mem":{"table":{"Macaulay2":".m2","X10":".x10","4D":".4dm"}}},
{"id":"n-3bdc92e1","guard":[["has","moocode"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Moocode files have":".moo"}}},
{"id":"n-3be3b810","guard":[["hasAny",["extension","files","haskell","have","literate"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Literate Haskell files have":".lhs"}}},
{"id":"n-3d0f1a84","guard":[["has","freemarker"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does FreeMarker use":".ftl"}}},
{"id":"n-3d943417","guard":[["hasAny",["extension","file","game","language","maker","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Game Maker Language use":".gml"}}},
{"id":"n-3f9bc78c","guard":[["hasAny",["extension","file","files","qt","script","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Qt Script source files":".qs"}}},
{"id":"n-407b05a5","guard":[["hasAny",["extension","files","have","oxygene"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Oxygene files have":".oxygene"}}},
{"id":"n-40e72f10","guard":[["hasAny",["charity","extension","files","have"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Charity files have":".ch"}}},
{"id":"n-411547cb","guard":[["hasAny",["extension","files","have","odin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Odin files have":".odin"}}},
{"id":"n-442a2d31","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of VBScript source files":".vbs"}}},
{"id":"n-448aee39","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Papyrus use":".psc"}}},
{"id":"n-449a53a7","guard":[["hasAny",["extension","files","haskell","have","literate"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Literate Haskell files have":".lhs"}}},
{"id":"n-44d8990e","guard":[["has","gams"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of GAMS source files":".gms"}}},
{"id":"n-44e1f5b8","guard":[["hasAny",["extension","file","gaml","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does GAML use":".gaml"}}},
{"id":"n-45d7be07","guard":[["has","basic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do BASIC files have":".bas"}}},
{"id":"n-46b3d5e8","guard":[["hasAny",["extension","file","game","language","maker","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Game Maker Language use":".gml"}}},
{"id":"n-47acb9a6","guard":[["hasAny",["extension","files","have","opal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Opal files have":".opal"}}},
{"id":"n-48ac2c05","guard":[["has","abap"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does ABAP use":".abap"}}},
{"id":"n-48af6a24","guard":[["hasAny",["extension","file","gaml","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does GAML use":".gaml"}}},
{"id":"n-49f100d3","guard":[["hasAny",["basic","extension","files","have"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do BASIC files have":".bas"}}},
{"id":"n-4aff9786","guard":[["has","glyph"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Glyph use":".glf"}}},
{"id":"n-4b962e4e","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Jasmin source files":".j"}}},
{"id":"n-4bd7f888","guard":[["has","eclipse"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of ECLiPSe source files":".ecl"}}},
{"id":"n-4c290b29","guard":[["has","futhark"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Futhark files have":".fut"}}},
{"id":"n-4cd250ab","guard":[["has","dtrace"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of DTrace source files":".d"}}},
{"id":"n-4dda9a1e","guard":[["hasAny",["extension","file","files","source","volt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Volt source files":".volt"}}},
{"id":"n-4e7157b5","guard":[["hasAny",["extension","file","purescript","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does PureScript use":".purs"}}},
{"id":"n-4e8169ed","guard":[["has","aspectj"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does AspectJ use":".aj"}}},
{"id":"n-4ecbbd66","guard":[["has","openqasm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of OpenQASM source files":".qasm"}}},
{"id":"n-5236a5ad","guard":[["has","actionscript"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of ActionScript source files":".as"}}},
{"id":"n-52b26ab9","guard":[["hasAny",["framework","grammatical"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Grammatical Framework use":".gf"}}},
{"id":"n-52c843bc","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Pan use":".pan"}}},
{"id":"n-52eb1bd7","guard":[["has","smpl"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does SmPL use":".cocci"}}},
{"id":"n-530c8b9d","guard":[["has","basic"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do BASIC files have":".bas"}}},
{"id":"n-53450e21","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Futhark files have":".fut"}}},
{"id":"n-539d2679","guard":[["has","cycript"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Cycript files have":".cy"}}},
{"id":"n-539eb3ea","guard":[["has","abap"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ABAP use":".abap"}}},
{"id":"n-53b3e56e","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Zig use":".zig"}}},
{"id":"n-53f06e5e","guard":[["has","fluent"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Fluent source files":".ftl"}}},
{"id":"n-541c4dcc","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of V source files":".v"}}},
{"id":"n-54c02095","guard":[["has","isabelle"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Isabelle files have":".thy"}}},
{"id":"n-5516c944","guard":[["hasAny",["dataweave","extension","files","have"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl"}}},
{"id":"n-55f8f0b3","guard":[["hasAny",["extension","file","files","omgrofl","source"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Omgrofl source files":".omgrofl"}}},
{"id":"n-56432c52","guard":[["has","dtrace"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of DTrace source files":".d"}}},
{"id":"n-57714a5f","guard":[["has","robotframework"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does RobotFramework use":".robot"}}},
{"id":"n-58ccb4f8","guard":[["has","purescript"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does PureScript use":".purs"}}},
{"id":"n-5903c6a2","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does GAML use":".gaml"}}},
{"id":"n-592cf979","guard":[["hasAny",["extension","files","have","oxygene"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Oxygene files have":".oxygene"}}},
{"id":"n-59b4334b","guard":[["has","xtend"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Xtend source files":".xtend"}}},
{"id":"n-5a01b4d8","guard":[["has","haskell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Literate Haskell files have":".lhs"}}},
{"id":"n-5a3c8b04","guard":[["hasAny",["extension","files","have","xs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do XS files have":".xs"}}},
{"id":"n-5aebb7d7","guard":[["hasAny",["extension","files","have","nu"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Nu files have":".nu"}}},
{"id":"n-5b1093eb","guard":[["has","harbour"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Harbour source files":".hb"}}},
{"id":"n-5b3fa233","guard":[["hasAny",["apex","extension","files","have"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Apex files have":".cls"}}},
{"id":"n-5c2e73d8","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does FreeMarker use":".ftl"}}},
{"id":"n-5c4c4de8","guard":[["has","agda"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Agda source files":".agda"}}},
{"id":"n-5c90f059","guard":[["hasAny",["extension","file","files","self","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Self source files":".self"}}},
{"id":"n-5cd8e75e","guard":[["hasAny",["extension","file","use","zig"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Zig use":".zig"}}},
{"id":"n-5cdebfb3","guard":[["has","dogescript"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Dogescript files have":".djs"}}},
{"id":"n-5d9c75d8","guard":[["has","gams"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of GAMS source files":".gms"}}},
{"id":"n-5dfbd2e8","guard":[["hasAny",["csound","extension","file","files","score","source"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Csound Score source files":".sco"}}},
{"id":"n-5e3d149b","guard":[["hasAny",["extension","file","papyrus","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Papyrus use":".psc"}}},
{"id":"n-5e58c19b","guard":[["has","aspectj"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does AspectJ use":".aj"}}},
{"id":"n-5e7437b5","guard":[["has","agda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Agda source files":".agda"}}},
{"id":"n-5e80ed3f","guard":[["hasAny",["dataweave","extension","files","have"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl"}}},
{"id":"n-5e99ee19","guard":[["has","sas"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do SAS files have":".sas"}}},
{"id":"n-5eb9071a","guard":[["hasAny",["extension","file","papyrus","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Papyrus use":".psc"}}},
{"id":"n-5ed725a8","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Omgrofl source files":".omgrofl"}}},
{"id":"n-5f1c4ca0","guard":[["hasAny",["click","extension","file","files","source"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Click source files":".click"}}},
{"id":"n-5f59a65a","guard":[["hasAny",["extension","file","macaulay2","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Macaulay2 use":".m2"}}},
{"id":"n-5fdafb36","guard":[["has","holyc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does HolyC use":".hc"}}},
{"id":"n-607d0ad9","guard":[["hasAny",["extension","file","smpl","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does SmPL use":".cocci"}}},
{"id":"n-611d89fb","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Fluent source files":".ftl"}}},
{"id":"n-61660d2e","guard":[["hasAny",["framework","grammatical"]],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Grammatical Framework use":".gf"}}},
{"id":"n-6191a3ec","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Propeller Spin files have":".spin"}}},
{"id":"n-61bfcc2c","guard":[["hasAny",["extension","file","saltstack","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does SaltStack use":".sls"}}},
{"id":"n-62065863","guard":[["hasAny",["extension","files","have","moocode"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Moocode files have":".moo"}}},
{"id":"n-620ace10","guard":[["has","cycript"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Cycript files have":".cy"}}},
{"id":"n-621b9617","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Genie source files":".gs"}}},
{"id":"n-6224b91b","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Macaulay2 use":".m2"}}},
{"id":"n-62340749","guard":[["hasAny",["qt","script"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Qt Script source files":".qs"}}},
{"id":"n-6262c207","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do BASIC files have":".bas"}}},
{"id":"n-62bf87b2","guard":[["has","csound"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Csound Score source files":".sco"}}},
{"id":"n-630a40fa","guard":[["hasAny",["bluespec","extension","file","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Bluespec use":".bsv"}}},
{"id":"n-63454bf7","guard":[["hasAny",["extension","file","framework","grammatical","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Grammatical Framework use":".gf"}}},
{"id":"n-6354038b","guard":[["hasAny",["extension","file","macaulay2","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Macaulay2 use":".m2"}}},
{"id":"n-63f43a69","guard":[["has","eiffel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Eiffel use":".e"}}},
{"id":"n-642a8750","guard":[["hasAny",["basic","extension","files","have"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do BASIC files have":".bas"}}},
{"id":"n-64f0c189","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Pan use":".pan"}}},
{"id":"n-657502cc","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Opal files have":".opal"}}},
{"id":"n-6618ead7","guard":[["hasAny",["aspectj","extension","file","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does AspectJ use":".aj"}}},
{"id":"n-662ad5e8","guard":[["has","saltstack"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does SaltStack use":".sls"}}},
{"id":"n-6653e21f","guard":[["has","smpl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does SmPL use":".cocci"}}},
{"id":"n-67661af7","guard":[["has","4d"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does 4D use":".4dm"}}},
{"id":"n-67ba59d5","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Bluespec use":".bsv"}}},
{"id":"n-67c2f2eb","guard":[["hasAny",["qt","script"]],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Qt Script source files":".qs"}}},
{"id":"n-67cd5c53","guard":[["has","moonscript"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do MoonScript files have":".moon"}}},
{"id":"n-67f80bbb","guard":[["hasAny",["charity","extension","files","have"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Charity files have":".ch"}}},
{"id":"n-681d7b53","guard":[["has","glyph"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Glyph use":".glf"}}},
{"id":"n-68232e2c","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ShaderLab source files":".shader"}}},
{"id":"n-688641b6","guard":[["hasAny",["csound","score"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Csound Score source files":".sco"}}},
{"id":"n-68ed09df","guard":[["hasAny",["extension","file","use","zig"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Zig use":".zig"}}},
{"id":"n-69fdbcbe","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Zig use":".zig"}}},
{"id":"n-6a113a14","guard":[["hasAny",["extension","file","frege","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Frege use":".fr"}}},
{"id":"n-6a287cbd","guard":[["has","frege"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Frege use":".fr"}}},
{"id":"n-6a452ecc","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of X10 source files":".x10"}}},
{"id":"n-6acbd1c3","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Volt source files":".volt"}}},
{"id":"n-6ad81174","guard":[["has","click"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Click source files":".click"}}},
{"id":"n-6b2a7de1","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Xtend source files":".xtend"}}},
{"id":"n-6bb039ea","guard":[["hasAny",["framework","grammatical"]],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Grammatical Framework use":".gf"}}},
{"id":"n-6c01adb3","guard":[["has","cue"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does CUE use":".cue"}}},
{"id":"n-6c329a93","guard":[["has","x10"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of X10 source files":".x10"}}},
{"id":"n-6c503aa7","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does HolyC use":".hc"}}},
{"id":"n-6d1feb18","guard":[["hasAny",["extension","file","use","zephir"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Zephir use":".zep"}}},
{"id":"n-6d79fa0a","guard":[["hasAny",["extension","file","objectscript","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ObjectScript use":".cls"}}},
{"id":"n-6d849148","guard":[["has","openqasm"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of OpenQASM source files":".qasm"}}},
{"id":"n-6d98c779","guard":[["hasAny",["extension","file","files","source","vbscript"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of VBScript source files":".vbs"}}},
{"id":"n-6ddcdf16","guard":[["has","nu"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Nu files have":".nu"}}},
{"id":"n-6e628833","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Xonsh files have":".xsh"}}},
{"id":"n-7009d6e5","guard":[["hasAny",["4d","extension","file","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does 4D use":".4dm"}}},
{"id":"n-700bfacc","guard":[["hasAny",["extension","file","pan","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Pan use":".pan"}}},
{"id":"n-705c703c","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ColdFusion CFC source files":".cfc"}}},
{"id":"n-70a10510","guard":[["has","eclass"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Gentoo Eclass source files":".eclass"}}},
{"id":"n-723c08b3","guard":[["has","smpl"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does SmPL use":".cocci"}}},
{"id":"n-73074e40","guard":[["has","dogescript"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Dogescript files have":".djs"}}},
{"id":"n-735642fa","guard":[["hasAny",["extension","file","holyc","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does HolyC use":".hc"}}},
{"id":"n-73f3f499","guard":[["hasAny",["extension","file","files","source","wollok"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Wollok source files":".wlk"}}},
{"id":"n-74af8e28","guard":[["hasAny",["extension","file","files","shaderlab","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ShaderLab source files":".shader"}}},
{"id":"n-74e4dea4","guard":[["has","odin"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Odin files have":".odin"}}},
{"id":"n-757cea72","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Ragel files have":".rl"}}},
{"id":"n-7589aa52","guard":[["hasAny",["abap","extension","file","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ABAP use":".abap"}}},
{"id":"n-75f3447b","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ANTLR use":".g4"}}},
{"id":"n-761c0f05","guard":[["hasAny",["bluespec","extension","file","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Bluespec use":".bsv"}}},
{"id":"n-7634a3ad","guard":[["hasAny",["extension","file","files","source","v"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of V source files":".v"}}},
{"id":"n-77800444","guard":[["has","csound"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Csound Score source files":".sco"}}},
{"id":"n-79119ef3","guard":[["hasAny",["extension","file","objectscript","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ObjectScript use":".cls"}}},
{"id":"n-792c392c","guard":[["hasAny",["extension","file","files","fluent","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Fluent source files":".ftl"}}},
{"id":"n-79850f43","guard":[["hasAny",["extension","file","files","source","v"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of V source files":".v"}}},
{"id":"n-7a77820f","guard":[["hasAny",["antlr","extension","file","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ANTLR use":".g4"}}},
{"id":"n-7ac9ee85","guard":[["hasAny",["extension","file","files","source","xtend"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Xtend source files":".xtend"}}},
{"id":"n-7b2318eb","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Grammatical Framework use":".gf"}}},
{"id":"n-7bd0956e","guard":[["has","hy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Hy source files":".hy"}}},
{"id":"n-7bdb8f1b","guard":[["hasAny",["extension","file","files","source","x10"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of X10 source files":".x10"}}},
{"id":"n-7c41289a","guard":[["hasAny",["aspectj","extension","file","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does AspectJ use":".aj"}}},
{"id":"n-7c677515","guard":[["hasAny",["extension","file","files","source","v"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of V source files":".v"}}},
{"id":"n-7cb805b3","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Apex files have":".cls"}}},
{"id":"n-7cbfba14","guard":[["has","factor"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Factor use":".factor"}}},
{"id":"n-7d3bc84e","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Self source files":".self"}}},
{"id":"n-7dd68ab1","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Odin files have":".odin"}}},
{"id":"n-7ebed265","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ABAP use":".abap"}}},
{"id":"n-7f1e03d4","guard":[["hasAny",["csound","extension","file","files","score","source"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Csound Score source files":".sco"}}},
{"id":"n-80efcd1f","guard":[["has","v"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of V source files":".v"}}},
{"id":"n-81181873","guard":[["has","sas"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do SAS files have":".sas"}}},
{"id":"n-815ad720","guard":[["has","clarion"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Clarion use":".clw"}}},
{"id":"n-819d0686","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does AspectJ use":".aj"}}},
{"id":"n-81af6d80","guard":[["hasAny",["cfc","coldfusion","extension","file","files","source"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ColdFusion CFC source files":".cfc"}}},
{"id":"n-81b6e221","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Hy source files":".hy"}}},
{"id":"n-81e2b72e","guard":[["has","oxygene"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Oxygene files have":".oxygene"}}},
{"id":"n-829cf2a4","guard":[["has","volt"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Volt source files":".volt"}}},
{"id":"n-8347c297","guard":[["hasAny",["extension","file","files","omgrofl","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Omgrofl source files":".omgrofl"}}},
{"id":"n-838097d9","guard":[["has","robotframework"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does RobotFramework use":".robot"}}},
{"id":"n-840a77ab","guard":[["hasAny",["mirc","script"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do mIRC Script files have":".mrc"}}},
{"id":"n-843a4f71","guard":[["hasAny",["extension","file","frege","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Frege use":".fr"}}},
{"id":"n-84c3c934","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Wollok source files":".wlk"}}},
{"id":"n-84f4ed1b","guard":[["has","saltstack"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does SaltStack use":".sls"}}},
{"id":"n-854ead3d","guard":[["has","antlr"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ANTLR use":".g4"}}},
{"id":"n-855c5e08","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Moocode files have":".moo"}}},
{"id":"n-85650ff5","guard":[["has","odin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Odin files have":".odin"}}},
{"id":"n-85f0d8be","guard":[["hasAny",["extension","file","files","genie","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Genie source files":".gs"}}},
{"id":"n-866bfe2e","guard":[["has","frege"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Frege use":".fr"}}},
{"id":"n-86bc5fae","guard":[["has","gams"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of GAMS source files":".gms"}}},
{"id":"n-870e27df","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Oxygene files have":".oxygene"}}},
{"id":"n-8761d3a4","guard":[["hasAny",["extension","file","frege","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Frege use":".fr"}}},
{"id":"n-87a9e37f","guard":[["has","macaulay2"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Macaulay2 use":".m2"}}},
{"id":"n-87b47d9d","guard":[["has","eclass"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Gentoo Eclass source files":".eclass"}}},
{"id":"n-88254381","guard":[["has","fennel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Fennel files have":".fnl"}}},
{"id":"n-883aa0dd","guard":[["has","beef"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Beef source files":".bf"}}},
{"id":"n-89524f69","guard":[["has","genie"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Genie source files":".gs"}}},
{"id":"n-89a799c0","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Parrot files have":".parrot"}}},
{"id":"n-8a4433c5","guard":[["hasAny",["extension","files","have","odin"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Odin files have":".odin"}}},
{"id":"n-8b59a64f","guard":[["has","apex"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Apex files have":".cls"}}},
{"id":"n-8c407982","guard":[["hasAny",["extension","files","have","isabelle"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Isabelle files have":".thy"}}},
{"id":"n-8d101832","guard":[["hasAny",["boogie","extension","file","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Boogie use":".bpl"}}},
{"id":"n-8ddb64b1","guard":[["has","purescript"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does PureScript use":".purs"}}},
{"id":"n-8e03d785","guard":[["has","boogie"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Boogie use":".bpl"}}},
{"id":"n-8e4e9801","guard":[["hasAny",["extension","file","files","source","xtend"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Xtend source files":".xtend"}}},
{"id":"n-8f85276d","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Frege use":".fr"}}},
{"id":"n-8fbebc9f","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does SaltStack use":".sls"}}},
{"id":"n-918270a5","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does PureScript use":".purs"}}},
{"id":"n-91ab65fd","guard":[["hasAny",["extension","files","have","nu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Nu files have":".nu"}}},
{"id":"n-91c44be7","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does SmPL use":".cocci"}}},
{"id":"n-92999a64","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of VBScript source files":".vbs"}}},
{"id":"n-933081b7","guard":[["has","wisp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of wisp source files":".wisp"}}},
{"id":"n-93583182","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Slash source files":".sl"}}},
{"id":"n-93b3d534","guard":[["hasAny",["4d","extension","file","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does 4D use":".4dm"}}},
{"id":"n-94c6eafe","guard":[["hasAny",["ebuild","extension","file","files","gentoo","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Gentoo Ebuild source files":".ebuild"}}},
{"id":"n-951ff8ce","guard":[["hasAny",["extension","file","files","qt","script","source"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Qt Script source files":".qs"}}},
{"id":"n-95745b9f","guard":[["hasAny",["extension","file","files","fluent","source"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Fluent source files":".ftl"}}},
{"id":"n-96104a4c","guard":[["has","brightscript"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Brightscript files have":".brs"}}},
{"id":"n-963e4290","guard":[["has","isabelle"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Isabelle files have":".thy"}}},
{"id":"n-975b547e","guard":[["has","beef"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Beef source files":".bf"}}},
{"id":"n-98d0df8f","guard":[["hasAny",["charity","extension","files","have"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Charity files have":".ch"}}},
{"id":"n-99097a24","guard":[["has","fennel"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Fennel files have":".fnl"}}},
{"id":"n-9920d56b","guard":[["has","jison"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Jison files have":".jison"}}},
{"id":"n-992b1f15","guard":[["hasAny",["extension","files","have","sas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do SAS files have":".sas"}}},
{"id":"n-99724d3c","guard":[["has","dafny"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Dafny files have":".dfy"}}},
{"id":"n-99f1729d","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of GAMS source files":".gms"}}},
{"id":"n-9a760861","guard":[["hasAny",["extension","file","files","omgrofl","source"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Omgrofl source files":".omgrofl"}}},
{"id":"n-9c09f293","guard":[["has","futhark"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Futhark files have":".fut"}}},
{"id":"n-9c0afc01","guard":[["hasAny",["extension","files","have","mirc","script"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do mIRC Script files have":".mrc"}}},
{"id":"n-9c0caf22","guard":[["hasAny",["extension","files","have","propeller","spin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Propeller Spin files have":".spin"}}},
{"id":"n-9c969388","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do mIRC Script files have":".mrc"}}},
{"id":"n-9ca556b4","guard":[["has","wollok"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Wollok source files":".wlk"}}},
{"id":"n-9d538d4f","guard":[["hasAny",["extension","factor","file","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Factor use":".factor"}}},
{"id":"n-9d74240c","guard":[["has","oxygene"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Oxygene files have":".oxygene"}}},
{"id":"n-9db990c7","guard":[["hasAny",["dm","extension","files","have"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do DM files have":".dm"}}},
{"id":"n-9e14de7d","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Qt Script source files":".qs"}}},
{"id":"n-a051f81c","guard":[["has","self"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Self source files":".self"}}},
{"id":"n-a0d54454","guard":[["has","v"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of V source files":".v"}}},
{"id":"n-a1afaab7","guard":[["has","befunge"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Befunge files have":".befunge"}}},
{"id":"n-a1b43671","guard":[["hasAny",["filebench","wml"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Filebench WML files have":".f"}}},
{"id":"n-a1bcb910","guard":[["has","factor"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Factor use":".factor"}}},
{"id":"n-a215bacb","guard":[["hasAny",["extension","filebench","files","have","wml"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Filebench WML files have":".f"}}},
{"id":"n-a2b2d341","guard":[["has","stan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Stan use":".stan"}}},
{"id":"n-a3b9f83c","guard":[["hasAny",["description","extension","file","gcc","machine","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does GCC Machine Description use":".md"}}},
{"id":"n-a4215b6c","guard":[["hasAny",["antlr","extension","file","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ANTLR use":".g4"}}},
{"id":"n-a43f9df2","guard":[["hasAny",["csound","score"]],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Csound Score source files":".sco"}}},
{"id":"n-a4a3312c","guard":[["hasAny",["extension","file","robotframework","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does RobotFramework use":".robot"}}},
{"id":"n-a4bd53cf","guard":[["has","dm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do DM files have":".dm"}}},
{"id":"n-a6083c37","guard":[["hasAny",["extension","file","files","source","vbscript"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of VBScript source files":".vbs"}}},
{"id":"n-a62db451","guard":[["has","pan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Pan use":".pan"}}},
{"id":"n-a6e0bd90","guard":[["hasAny",["extension","files","have","opal"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Opal files have":".opal"}}},
{"id":"n-a6e729d2","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Macaulay2 use":".m2"}}},
{"id":"n-a75d04d1","guard":[["hasAny",["extension","file","files","source","wisp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of wisp source files":".wisp"}}},
{"id":"n-a775cbe5","guard":[["has","omgrofl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Omgrofl source files":".omgrofl"}}},
{"id":"n-a7e862d0","guard":[["hasAny",["bluespec","extension","file","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Bluespec use":".bsv"}}},
{"id":"n-a846dae0","guard":[["has","dogescript"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Dogescript files have":".djs"}}},
{"id":"n-a8d1ac75","guard":[["has","v"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of V source files":".v"}}},
{"id":"n-a8e81d0f","guard":[["hasAny",["befunge","extension","files","have"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Befunge files have":".befunge"}}},
{"id":"n-a966f75f","guard":[["has","freemarker"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does FreeMarker use":".ftl"}}},
{"id":"n-a97dce73","guard":[["has","pogoscript"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does PogoScript use":".pogo"}}},
{"id":"n-aa02962e","guard":[["has","clarion"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Clarion use":".clw"}}},
{"id":"n-aaaaae19","guard":[["hasAny",["extension","file","files","hy","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Hy source files":".hy"}}},
{"id":"n-ab1b4fac","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does SmPL use":".cocci"}}},
{"id":"n-ab795694","guard":[["hasAny",["extension","file","macaulay2","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Macaulay2 use":".m2"}}},
{"id":"n-ab8312e7","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of X10 source files":".x10"}}},
{"id":"n-ab96b198","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Literate Haskell files have":".lhs"}}},
{"id":"n-acded0ae","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does HolyC use":".hc"}}},
{"id":"n-ad94ca5f","guard":[["has","zephir"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Zephir use":".zep"}}},
{"id":"n-adca2c49","guard":[["hasAny",["capn","extension","file","proto","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Cap'n Proto use":".capnp"}}},
{"id":"n-ae27e5ae","guard":[["has","odin"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Odin files have":".odin"}}},
{"id":"n-ae64a6d9","guard":[["hasAny",["extension","files","have","moonscript"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do MoonScript files have":".moon"}}},
{"id":"n-af36858e","guard":[["hasAny",["extension","files","have","xs"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do XS files have":".xs"}}},
{"id":"n-af7928ff","guard":[["hasAny",["antlr","extension","file","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ANTLR use":".g4"}}},
{"id":"n-afbddadb","guard":[["hasAny",["extension","file","files","redcode","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Redcode source files":".cw"}}},
{"id":"n-b073510c","guard":[["hasAny",["extension","file","stan","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Stan use":".stan"}}},
{"id":"n-b1a0ae35","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Opal files have":".opal"}}},
{"id":"n-b1a18a05","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Moocode files have":".moo"}}},
{"id":"n-b2ad2925","guard":[["hasAny",["extension","files","have","jison"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Jison files have":".jison"}}},
{"id":"n-b2ebf213","guard":[["hasAny",["extension","file","smpl","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does SmPL use":".cocci"}}},
{"id":"n-b347d85b","guard":[["has","ebuild"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Gentoo Ebuild source files":".ebuild"}}},
{"id":"n-b350faf5","guard":[["hasAny",["basic","extension","files","have"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do BASIC files have":".bas"}}},
{"id":"n-b3520d8a","guard":[["hasAny",["brightscript","extension","files","have"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Brightscript files have":".brs"}}},
{"id":"n-b35e23a0","guard":[["hasAny",["extension","file","game","language","maker","use"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Game Maker Language use":".gml"}}},
{"id":"n-b3ddbbb6","guard":[["hasAny",["extension","file","objectscript","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ObjectScript use":".cls"}}},
{"id":"n-b494709f","guard":[["hasAny",["dogescript","extension","files","have"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Dogescript files have":".djs"}}},
{"id":"n-b4d21c76","guard":[["has","xonsh"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Xonsh files have":".xsh"}}},
{"id":"n-b4faf551","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Factor use":".factor"}}},
{"id":"n-b52ea17c","guard":[["hasAny",["mirc","script"]],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do mIRC Script files have":".mrc"}}},
{"id":"n-b575e49f","guard":[["has","actionscript"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of ActionScript source files":".as"}}},
{"id":"n-b58953cd","guard":[["hasAny",["extension","files","have","puppet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Puppet files have":".pp"}}},
{"id":"n-b592356f","guard":[["has","nu"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Nu files have":".nu"}}},
{"id":"n-b5af1b4d","guard":[["has","agda"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Agda source files":".agda"}}},
{"id":"n-b5f2b24a","guard":[["hasAny",["extension","files","have","isabelle"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Isabelle files have":".thy"}}},
{"id":"n-b64216e5","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Boogie use":".bpl"}}},
{"id":"n-b6634f5f","guard":[["has","zig"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Zig use":".zig"}}},
{"id":"n-b6c37aea","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Papyrus use":".psc"}}},
{"id":"n-b6e762a4","guard":[["hasAny",["dafny","extension","files","have"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Dafny files have":".dfy"}}},
{"id":"n-b7e31150","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Frege use":".fr"}}},
{"id":"n-b82bb504","guard":[["hasAny",["extension","file","framework","grammatical","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Grammatical Framework use":".gf"}}},
{"id":"n-b881978e","guard":[["has","cool"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Cool files have":".cl"}}},
{"id":"n-b9282842","guard":[["hasAny",["extension","fennel","files","have"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Fennel files have":".fnl"}}},
{"id":"n-b9531ca5","guard":[["hasAny",["extension","file","gaml","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does GAML use":".gaml"}}},
{"id":"n-b99423d1","guard":[["hasAny",["extension","file","pogoscript","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does PogoScript use":".pogo"}}},
{"id":"n-b9a814d5","guard":[["hasAny",["boogie","extension","file","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Boogie use":".bpl"}}},
{"id":"n-b9db9ecb","guard":[["hasAny",["propeller","spin"]],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Propeller Spin files have":".spin"}}},
{"id":"n-ba1d939b","guard":[["hasAny",["actionscript","extension","file","files","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ActionScript source files":".as"}}},
{"id":"n-ba9e3cdc","guard":[["hasAny",["eiffel","extension","file","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Eiffel use":".e"}}},
{"id":"n-bad1be20","guard":[["hasAny",["extension","files","have","nu"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Nu files have":".nu"}}},
{"id":"n-bb36a6dd","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Oxygene files have":".oxygene"}}},
{"id":"n-bc009b35","guard":[["has","javascripterb"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-bc051e75","guard":[["hasAny",["propeller","spin"]],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Propeller Spin files have":".spin"}}},
{"id":"n-bd4a2199","guard":[["has","vbscript"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of VBScript source files":".vbs"}}},
{"id":"n-be1803ca","guard":[["has","cycript"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Cycript files have":".cy"}}},
{"id":"n-be209ee0","guard":[["has","shaderlab"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of ShaderLab source files":".shader"}}},
{"id":"n-be336074","guard":[["has","framework"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Grammatical Framework use":".gf"}}},
{"id":"n-bea626e3","guard":[["hasAny",["extension","file","files","source","x10"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of X10 source files":".x10"}}},
{"id":"n-bed11a1a","guard":[["hasAny",["extension","file","files","harbour","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Harbour source files":".hb"}}},
{"id":"n-bfc83319","guard":[["has","charity"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Charity files have":".ch"}}},
{"id":"n-c12cd384","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Jasmin source files":".j"}}},
{"id":"n-c1432d1a","guard":[["has","redcode"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Redcode source files":".cw"}}},
{"id":"n-c1d2de20","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Charity files have":".ch"}}},
{"id":"n-c2075a85","guard":[["has","antlr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does ANTLR use":".g4"}}},
{"id":"n-c23a3836","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-c532eb69","guard":[["hasAny",["extension","file","files","source","swig"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of SWIG source files":".i"}}},
{"id":"n-c637ec9f","guard":[["has","dataweave"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl"}}},
{"id":"n-c65c4398","guard":[["has","dogescript"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Dogescript files have":".djs"}}},
{"id":"n-c703a0fc","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Fluent source files":".ftl"}}},
{"id":"n-c728eb6c","guard":[["hasAny",["eclipse","extension","file","files","source"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ECLiPSe source files":".ecl"}}},
{"id":"n-c7a7ddd1","guard":[["has","holyc"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does HolyC use":".hc"}}},
{"id":"n-c80b3ceb","guard":[["hasAny",["extension","file","oz","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Oz use":".oz"}}},
{"id":"n-c867d184","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Volt source files":".volt"}}},
{"id":"n-c8926b0d","guard":[["has","parrot"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Parrot files have":".parrot"}}},
{"id":"n-c8a97841","guard":[["has","objectscript"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does ObjectScript use":".cls"}}},
{"id":"n-c8b76139","guard":[["hasAny",["extension","file","freemarker","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does FreeMarker use":".ftl"}}},
{"id":"n-c94cab4a","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Isabelle files have":".thy"}}},
{"id":"n-ca09f876","guard":[["has","papyrus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Papyrus use":".psc"}}},
{"id":"n-ca0e6fba","guard":[["hasAny",["description","extension","file","gcc","machine","use"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does GCC Machine Description use":".md"}}},
{"id":"n-ca1bc9c0","guard":[["hasAny",["extension","files","have","mcfunction"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do mcfunction files have":".mcfunction"}}},
{"id":"n-caa29912","guard":[["hasAny",["extension","file","files","source","x10"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of X10 source files":".x10"}}},
{"id":"n-cb6599c8","guard":[["hasAny",["extension","file","purescript","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does PureScript use":".purs"}}},
{"id":"n-cccd03bc","guard":[["hasAny",["cool","extension","files","have"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Cool files have":".cl"}}},
{"id":"n-cd0d12c4","guard":[["hasAny",["agda","extension","file","files","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Agda source files":".agda"}}},
{"id":"n-cd48a0fb","guard":[["hasAny",["extension","file","purescript","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does PureScript use":".purs"}}},
{"id":"n-cd972c18","guard":[["has","beef"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Beef source files":".bf"}}},
{"id":"n-ce59ae6e","guard":[["has","solidity"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Solidity files have":".sol"}}},
{"id":"n-ce5bc004","guard":[["hasAny",["extension","file","saltstack","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does SaltStack use":".sls"}}},
{"id":"n-ceb858a6","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Ragel files have":".rl"}}},
{"id":"n-cef76ba2","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Isabelle files have":".thy"}}},
{"id":"n-cf7fbbf9","guard":[["has","boogie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Boogie use":".bpl"}}},
{"id":"n-cfba8682","guard":[["has","bluespec"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Bluespec use":".bsv"}}},
{"id":"n-cfe733f0","guard":[["hasAny",["extension","files","have","ragel"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Ragel files have":".rl"}}},
{"id":"n-d0d4e20c","guard":[["has","swig"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of SWIG source files":".i"}}},
{"id":"n-d0f9a6c8","guard":[["hasAny",["extension","file","files","self","source"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Self source files":".self"}}},
{"id":"n-d16c3c6b","guard":[["has","4d"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does 4D use":".4dm"}}},
{"id":"n-d362a5ca","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of OpenQASM source files":".qasm"}}},
{"id":"n-d40b03cc","guard":[["has","elm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Elm use":".elm"}}},
{"id":"n-d438879e","guard":[["has","gaml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does GAML use":".gaml"}}},
{"id":"n-d47af16d","guard":[["hasAny",["4d","extension","file","use"]],["nums>=",1]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does 4D use":".4dm"}}},
{"id":"n-d4b96c3c","guard":[["hasAny",["extension","files","have","xonsh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Xonsh files have":".xsh"}}},
{"id":"n-d4bcc54f","guard":[["hasAny",["extension","file","files","openqasm","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of OpenQASM source files":".qasm"}}},
{"id":"n-d53488d8","guard":[["has","puppet"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Puppet files have":".pp"}}},
{"id":"n-d574416e","guard":[["has","ebuild"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Gentoo Ebuild source files":".ebuild"}}},
{"id":"n-d57b85c5","guard":[["has","nesc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of nesC source files":".nc"}}},
{"id":"n-d5c02de1","guard":[["has","javascripterb"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-d5f382a2","guard":[["hasAny",["extension","files","have","solidity"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Solidity files have":".sol"}}},
{"id":"n-d6227601","guard":[["has","cycript"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Cycript files have":".cy"}}},
{"id":"n-d64e8f02","guard":[["has","futhark"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Futhark files have":".fut"}}},
{"id":"n-d6a4999d","guard":[["has","objectscript"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does ObjectScript use":".cls"}}},
{"id":"n-d7b03102","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do MoonScript files have":".moon"}}},
{"id":"n-d82359b6","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl"}}},
{"id":"n-d87457c5","guard":[["has","wisp"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of wisp source files":".wisp"}}},
{"id":"n-d99d314c","guard":[["has","actionscript"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ActionScript source files":".as"}}},
{"id":"n-d9db7fd0","guard":[["hasAny",["beef","extension","file","files","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Beef source files":".bf"}}},
{"id":"n-da5735d8","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Game Maker Language use":".gml"}}},
{"id":"n-da90ae1f","guard":[["has","mcfunction"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do mcfunction files have":".mcfunction"}}},
{"id":"n-db04eb23","guard":[["has","propeller"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Propeller Spin files have":".spin"}}},
{"id":"n-db0bcf86","guard":[["has","glyph"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Glyph use":".glf"}}},
{"id":"n-db8aa66b","guard":[["hasAny",["extension","file","files","gams","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of GAMS source files":".gms"}}},
{"id":"n-dc2ed8b0","guard":[["hasAny",["extension","file","holyc","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does HolyC use":".hc"}}},
{"id":"n-dc3c31be","guard":[["has","ragel"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Ragel files have":".rl"}}},
{"id":"n-dd4ffa1e","guard":[["has","xonsh"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Xonsh files have":".xsh"}}},
{"id":"n-de881c36","guard":[["has","eiffel"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Eiffel use":".e"}}},
{"id":"n-e01a3ebf","guard":[["has","beef"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Beef source files":".bf"}}},
{"id":"n-e01fbb1a","guard":[["has","openqasm"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of OpenQASM source files":".qasm"}}},
{"id":"n-e042e647","guard":[["has","parrot"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Parrot files have":".parrot"}}},
{"id":"n-e089b78e","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Harbour source files":".hb"}}},
{"id":"n-e09353a3","guard":[["has","kakounescript"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does KakouneScript use":".kak"}}},
{"id":"n-e164f2f1","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Csound Score source files":".sco"}}},
{"id":"n-e1732111","guard":[["has","moocode"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Moocode files have":".moo"}}},
{"id":"n-e1876b6f","guard":[["has","slash"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Slash source files":".sl"}}},
{"id":"n-e1c79755","guard":[["hasAny",["capn","proto"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Cap'n Proto use":".capnp"}}},
{"id":"n-e2b19982","guard":[["hasAny",["extension","file","framework","grammatical","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Grammatical Framework use":".gf"}}},
{"id":"n-e2c29268","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Literate Haskell files have":".lhs"}}},
{"id":"n-e3728f9d","guard":[["has","click"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Click source files":".click"}}},
{"id":"n-e4076f4d","guard":[["hasAny",["extension","file","files","javascripterb","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-e452e59b","guard":[["hasAny",["elm","extension","file","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Elm use":".elm"}}},
{"id":"n-e4612a0b","guard":[["hasAny",["extension","file","saltstack","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does SaltStack use":".sls"}}},
{"id":"n-e4c7a8e9","guard":[["has","eclass"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Gentoo Eclass source files":".eclass"}}},
{"id":"n-e527ba55","guard":[["has","volt"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Volt source files":".volt"}}},
{"id":"n-e589fbfe","guard":[["hasAny",["clarion","extension","file","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Clarion use":".clw"}}},
{"id":"n-e5ad6167","guard":[["has","cfc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of ColdFusion CFC source files":".cfc"}}},
{"id":"n-e5bc6cdd","guard":[["has","cfc"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ColdFusion CFC source files":".cfc"}}},
{"id":"n-e6c54d4b","guard":[["has","holyc"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does HolyC use":".hc"}}},
{"id":"n-e7246320","guard":[["hasAny",["haskell","literate"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Literate Haskell files have":".lhs"}}},
{"id":"n-e74bf6e5","guard":[["has","moonscript"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do MoonScript files have":".moon"}}},
{"id":"n-e7f253cd","guard":[["hasAny",["extension","file","files","fluent","source"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Fluent source files":".ftl"}}},
{"id":"n-e83555b5","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ObjectScript use":".cls"}}},
{"id":"n-e849fbba","guard":[["has","basic"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do BASIC files have":".bas"}}},
{"id":"n-e9090996","guard":[["has","abap"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does ABAP use":".abap"}}},
{"id":"n-e91c2d8b","guard":[["hasAny",["extension","files","futhark","have"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Futhark files have":".fut"}}},
{"id":"n-e9988345","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Slash source files":".sl"}}},
{"id":"n-e9fd2623","guard":[["hasAny",["eclipse","extension","file","files","source"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of ECLiPSe source files":".ecl"}}},
{"id":"n-eb730f91","guard":[["has","moocode"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Moocode files have":".moo"}}},
{"id":"n-ebc1bf06","guard":[["hasAny",["mirc","script"]],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do mIRC Script files have":".mrc"}}},
{"id":"n-ec515f1c","guard":[["has","jasmin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Jasmin source files":".j"}}},
{"id":"n-ec5c91b6","guard":[["has","frege"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Frege use":".fr"}}},
{"id":"n-ecd41c4a","guard":[["hasAny",["extension","files","have","parrot"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Parrot files have":".parrot"}}},
{"id":"n-ece7bb03","guard":[["has","fennel"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Fennel files have":".fnl"}}},
{"id":"n-ed61c94b","guard":[["has","cue"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does CUE use":".cue"}}},
{"id":"n-edbcc44d","guard":[["has","genie"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Genie source files":".gs"}}},
{"id":"n-eee5c365","guard":[["has","xs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do XS files have":".xs"}}},
{"id":"n-eee754e7","guard":[["has","aspectj"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does AspectJ use":".aj"}}},
{"id":"n-ef4effe9","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of wisp source files":".wisp"}}},
{"id":"n-f033ecbe","guard":[["hasAny",["extension","file","files","genie","source"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Genie source files":".gs"}}},
{"id":"n-f0341c59","guard":[["hasAny",["apex","extension","files","have"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Apex files have":".cls"}}},
{"id":"n-f0b581a0","guard":[["hasAny",["extension","files","haskell","have","literate"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Literate Haskell files have":".lhs"}}},
{"id":"n-f2779629","guard":[["hasAny",["extension","file","files","jasmin","source"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Jasmin source files":".j"}}},
{"id":"n-f28571e0","guard":[["has","saltstack"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does SaltStack use":".sls"}}},
{"id":"n-f409479c","guard":[["has","hy"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Hy source files":".hy"}}},
{"id":"n-f4e80465","guard":[["hasAny",["extension","file","files","source","wollok"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Wollok source files":".wlk"}}},
{"id":"n-f5055c1b","guard":[["hasAny",["eclass","extension","file","files","gentoo","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Gentoo Eclass source files":".eclass"}}},
{"id":"n-f5262bf1","guard":[["hasAny",["cfc","coldfusion"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of ColdFusion CFC source files":".cfc"}}},
{"id":"n-f5362042","guard":[["has","oz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Oz use":".oz"}}},
{"id":"n-f55baf1d","guard":[["hasAny",["extension","file","kakounescript","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does KakouneScript use":".kak"}}},
{"id":"n-f5eeba69","guard":[["has","purescript"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does PureScript use":".purs"}}},
{"id":"n-f7adac59","guard":[["has","eclass"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Gentoo Eclass source files":".eclass"}}},
{"id":"n-f866bd20","guard":[["has","actionscript"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of ActionScript source files":".as"}}},
{"id":"n-f8a84926","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Qt Script source files":".qs"}}},
{"id":"n-fa4a8a4f","guard":[["hasAny",["extension","file","files","source","volt"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Volt source files":".volt"}}},
{"id":"n-fa6beac1","guard":[["has","apex"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do Apex files have":".cls"}}},
{"id":"n-fc6eb42c","guard":[["hasAny",["extension","file","game","language","maker","use"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Game Maker Language use":".gml"}}},
{"id":"n-fcb6b243","guard":[["hasAny",["abap","extension","file","use"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does ABAP use":".abap"}}},
{"id":"n-fcb8df5c","guard":[["hasAny",["extension","file","files","nesc","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of nesC source files":".nc"}}},
{"id":"n-fcd8dbfa","guard":[["hasAny",["cycript","extension","files","have"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension do Cycript files have":".cy"}}},
{"id":"n-fcddd7cd","guard":[["hasAny",["dtrace","extension","file","files","source"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of DTrace source files":".d"}}},
{"id":"n-fce6b97a","guard":[["has","dataweave"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension do DataWeave files have":".dwl"}}},
{"id":"n-fcfc55f3","guard":[["hasAny",["cue","extension","file","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does CUE use":".cue"}}},
{"id":"n-fd79b676","guard":[["hasAny",["extension","file","glyph","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does Glyph use":".glf"}}},
{"id":"n-fdc796d4","guard":[["has","bluespec"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does Bluespec use":".bsv"}}},
{"id":"n-feeac4d4","guard":[["hasAny",["extension","file","files","jasmin","source"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the file extension of Jasmin source files":".j"}}},
{"id":"n-fef67959","guard":[["has","freemarker"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does FreeMarker use":".ftl"}}},
{"id":"n-ffeb796b","guard":[["has","agda"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the file extension of Agda source files":".agda"}}},
{"id":"n-190ae4b8","guard":[["hasAny",["longest","longest one","longest word","mcfunction"]]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-a44c1b68","guard":[["hasAny",["backwards","extension","first letters of the name","initials","mirror","reverse","reversed","spell backwards"]],["has","give"]],"pyramid":["render.str",["transform.reverse",["transform.initials",["sense.roman"]]]],"mem":null},
{"id":"n-b938555d","guard":[["hasAny",["extension","shortest","shortest one","shortest word"]],["has","oz"]],"pyramid":["render.template",{"lit":[".",{"slot":0}]},["aggregate.shortest",["sense.units"]]],"mem":null},
{"id":"n-bd7123f5","guard":[["has","extension"],["nums>=",1]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"file"}]]],"mem":{"table":{"extension does Elm use":".elm","extension of Omgrofl source files":".omgrofl","extension does Clarion use":".clw","extension of Xtend source files":".xtend","extension does FreeMarker use":".ftl","extension does Stan use":".stan","extension of wisp source files":".wisp","extension of Slash source files":".sl","extension does KakouneScript use":".kak","extension does GAML use":".gaml","extension does HolyC use":".hc","extension does Frege use":".fr","extension does SaltStack use":".sls","extension of Harbour source files":".hb","extension of Gentoo Eclass source files":".eclass","extension does Macaulay2 use":".m2","extension does AspectJ use":".aj","extension does SmPL use":".cocci","extension of nesC source files":".nc","extension does Eiffel use":".e","extension does ABAP use":".abap","extension of ColdFusion CFC source files":".cfc","extension of Volt source files":".volt","extension of Gentoo Ebuild source files":".ebuild","extension of Jasmin source files":".j","extension of Self source files":".self","extension of Wollok source files":".wlk","extension of GAMS source files":".gms","extension does PureScript use":".purs","extension of SWIG source files":".i","extension of ActionScript source files":".as","extension does Game Maker Language use":".gml","extension does GCC Machine Description use":".md","extension of V source files":".v","extension of VBScript source files":".vbs","extension does Bluespec use":".bsv","extension of Qt Script source files":".qs","extension does ANTLR use":".g4","extension does Glyph use":".glf","extension does RobotFramework use":".robot","extension of Beef source files":".bf","extension of Fluent source files":".ftl","extension of Genie source files":".gs","extension does ObjectScript use":".cls","extension does Boogie use":".bpl","extension does CUE use":".cue","extension of Redcode source files":".cw","extension does Zig use":".zig","extension does Factor use":".factor","extension does Papyrus use":".psc","extension of Hy source files":".hy","extension of X10 source files":".x10","extension does Cap'n Proto use":".capnp","extension of Agda source files":".agda","extension does PogoScript use":".pogo","extension does Oz use":".oz","extension of Csound Score source files":".sco","extension does Zephir use":".zep","extension of OpenQASM source files":".qasm","extension of ShaderLab source files":".shader","extension does Pan use":".pan","extension of ECLiPSe source files":".ecl","extension of DTrace source files":".d","extension of Click source files":".click","extension does Grammatical Framework use":".gf","extension does 4D use":".4dm","extension of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-c80fdd92","guard":[["has","extension"],["nums>=",1]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"extension"}]]],"mem":{"table":{"do DataWeave files have":".dwl","do Jison files have":".jison","do Literate Haskell files have":".lhs","does Elm use":".elm","of Omgrofl source files":".omgrofl","does Clarion use":".clw","of Xtend source files":".xtend","does FreeMarker use":".ftl","do Futhark files have":".fut","do Odin files have":".odin","does Stan use":".stan","of wisp source files":".wisp","of Slash source files":".sl","does KakouneScript use":".kak","does GAML use":".gaml","does HolyC use":".hc","does Frege use":".fr","does SaltStack use":".sls","of Harbour source files":".hb","of Gentoo Eclass source files":".eclass","do Cool files have":".cl","does Macaulay2 use":".m2","does AspectJ use":".aj","does SmPL use":".cocci","of nesC source files":".nc","does Eiffel use":".e","do Puppet files have":".pp","does ABAP use":".abap","of ColdFusion CFC source files":".cfc","do Charity files have":".ch","of Volt source files":".volt","of Gentoo Ebuild source files":".ebuild","do Dafny files have":".dfy","of Jasmin source files":".j","of Self source files":".self","of Wollok source files":".wlk","of GAMS source files":".gms","does PureScript use":".purs","of SWIG source files":".i","of ActionScript source files":".as","does Game Maker Language use":".gml","does GCC Machine Description use":".md","of V source files":".v","of VBScript source files":".vbs","does Bluespec use":".bsv","do DM files have":".dm","do Parrot files have":".parrot","of Qt Script source files":".qs","does ANTLR use":".g4","do Xonsh files have":".xsh","does Glyph use":".glf","does RobotFramework use":".robot","do Isabelle files have":".thy","do BASIC files have":".bas","of Beef source files":".bf","of Fluent source files":".ftl","of Genie source files":".gs","does ObjectScript use":".cls","does Boogie use":".bpl","does CUE use":".cue","of Redcode source files":".cw","does Zig use":".zig","do Befunge files have":".befunge","do Opal files have":".opal","do Ragel files have":".rl","do Apex files have":".cls","do Propeller Spin files have":".spin","does Factor use":".factor","does Papyrus use":".psc","of Hy source files":".hy","do mcfunction files have":".mcfunction","do Dogescript files have":".djs","of X10 source files":".x10","do Fennel files have":".fnl","does Cap'n Proto use":".capnp","do Brightscript files have":".brs","do Filebench WML files have":".f","do Nu files have":".nu","of Agda source files":".agda","do MoonScript files have":".moon","does PogoScript use":".pogo","do XS files have":".xs","do Moocode files have":".moo","does Oz use":".oz","of Csound Score source files":".sco","does Zephir use":".zep","of OpenQASM source files":".qasm","do mIRC Script files have":".mrc","do Oxygene files have":".oxygene","of ShaderLab source files":".shader","does Pan use":".pan","of ECLiPSe source files":".ecl","do Solidity files have":".sol","of DTrace source files":".d","of Click source files":".click","does Grammatical Framework use":".gf","do SAS files have":".sas","do Cycript files have":".cy","does 4D use":".4dm","of JavaScript+ERB source files":".js.erb"}}},
{"id":"n-438ccae8","guard":[["hasAny",["apex","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":".cls"},["sense.after",{"lit":"files"}]]],"mem":null},
{"id":"n-61195542","guard":[["hasAny",["delete","fluent","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":".ftl"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-9eb2f23b","guard":[["hasAny",["delete","objectscript","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":".cls"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-c6a669e8","guard":[["hasAny",["delete","fluent","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":".ftl"},["sense.before",{"lit":"files"}]]],"mem":null},
{"id":"n-e76f2c92","guard":[["hasAny",["apex","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":".cls"},["sense.before",{"lit":"files"}]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which extension do DataWeave files have","expect":{"equals":".dwl","notRefusal":true}},{"q":"which extension do Jison files have","expect":{"equals":".jison","notRefusal":true}},{"q":"which extension do Literate Haskell files have","expect":{"equals":".lhs","notRefusal":true}},{"q":"what file extension does Elm use","expect":{"equals":".elm","notRefusal":true}},{"q":"give the file extension of Omgrofl source files","expect":{"equals":".omgrofl","notRefusal":true}},{"q":"what file extension does Clarion use","expect":{"equals":".clw","notRefusal":true}},{"q":"give the file extension of Xtend source files","expect":{"equals":".xtend","notRefusal":true}},{"q":"what file extension does FreeMarker use","expect":{"equals":".ftl","notRefusal":true}},{"q":"which extension do Futhark files have","expect":{"equals":".fut","notRefusal":true}},{"q":"which extension do Odin files have","expect":{"equals":".odin","notRefusal":true}},{"q":"what file extension does Stan use","expect":{"equals":".stan","notRefusal":true}},{"q":"give the file extension of wisp source files","expect":{"equals":".wisp","notRefusal":true}},{"q":"give the file extension of Slash source files","expect":{"equals":".sl","notRefusal":true}},{"q":"what file extension does KakouneScript use","expect":{"equals":".kak","notRefusal":true}},{"q":"what file extension does GAML use","expect":{"equals":".gaml","notRefusal":true}},{"q":"what file extension does HolyC use","expect":{"equals":".hc","notRefusal":true}},{"q":"what file extension does Frege use","expect":{"equals":".fr","notRefusal":true}},{"q":"what file extension does SaltStack use","expect":{"equals":".sls","notRefusal":true}},{"q":"give the file extension of Harbour source files","expect":{"equals":".hb","notRefusal":true}},{"q":"give the file extension of Gentoo Eclass source files","expect":{"equals":".eclass","notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
