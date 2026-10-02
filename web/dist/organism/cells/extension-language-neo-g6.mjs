// extension-language-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"extension-language-neo-g6","class":"extension-language","generation":6,"lane":"neo","grownFrom":["name the language of .ahkl files","name the language of .urs files","a file ending in .lmi holds which language","which programming language uses the file extension .hsc","name the language of .cc files","name the language of .zs files","name the language of .scpt files","a file ending in .cljx holds which language","name the language of .mkfile files","which programming language uses the file extension .sce","which programming language uses the file extension .orc","a file ending in .rbfrm holds which language","which programming language uses the file extension .asy","a file ending in .bi holds which language","name the language of .ik files","name the language of .wlt files","which programming language uses the file extension .6pm","name the language of .py files","a file ending in .tpl holds which language","name the language of .lvproj files"],"version":1});

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
{"id":"n-4f353446","guard":[["has","language"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .ahkl files":"A .ahkl file holds AutoHotkey.","name the language of .urs files":"A .urs file holds UrWeb.","a file ending in .lmi holds which language":"A .lmi file holds Python.","which programming language uses the file extension .hsc":"A .hsc file holds Haskell.","name the language of .cc files":"A .cc file holds C++.","name the language of .zs files":"A .zs file holds ZenScript.","name the language of .scpt files":"A .scpt file holds AppleScript.","a file ending in .cljx holds which language":"A .cljx file holds Clojure.","name the language of .mkfile files":"A .mkfile file holds Makefile.","which programming language uses the file extension .sce":"A .sce file holds Scilab.","which programming language uses the file extension .orc":"A .orc file holds Csound.","a file ending in .rbfrm holds which language":"A .rbfrm file holds REALbasic.","which programming language uses the file extension .asy":"A .asy file holds Asymptote.","a file ending in .bi holds which language":"A .bi file holds FreeBasic.","name the language of .ik files":"A .ik file holds Ioke.","name the language of .wlt files":"A .wlt file holds Mathematica.","which programming language uses the file extension .6pm":"A .6pm file holds Raku.","name the language of .py files":"A .py file holds Python.","a file ending in .tpl holds which language":"A .tpl file holds Smarty.","name the language of .lvproj files":"A .lvproj file holds LabVIEW.","a file ending in .escript holds which language":"A .escript file holds Erlang.","a file ending in .wl holds which language":"A .wl file holds Mathematica.","a file ending in .rl holds which language":"A .rl file holds Ragel.","name the language of .cbl files":"A .cbl file holds COBOL.","which programming language uses the file extension .yy":"A .yy file holds Yacc.","which programming language uses the file extension .nomad":"A .nomad file holds HCL.","which programming language uses the file extension .hx":"A .hx file holds Haxe.","a file ending in .lgt holds which language":"A .lgt file holds Logtalk.","which programming language uses the file extension .als":"A .als file holds Alloy.","name the language of .smk files":"A .smk file holds Python.","name the language of .jsm files":"A .jsm file holds JavaScript.","which programming language uses the file extension .pir":"A .pir file holds Parrot Internal Representation.","which programming language uses the file extension .yar":"A .yar file holds YARA.","a file ending in .podspec holds which language":"A .podspec file holds Ruby.","a file ending in .cljs holds which language":"A .cljs file holds Clojure.","which programming language uses the file extension .vark":"A .vark file holds Gosu.","a file ending in .cob holds which language":"A .cob file holds COBOL.","which programming language uses the file extension .pyx":"A .pyx file holds Cython.","which programming language uses the file extension .ihlp":"A .ihlp file holds Stata.","a file ending in .frx holds which language":"A .frx file holds VBA.","a file ending in .jl holds which language":"A .jl file holds Julia.","name the language of .lhs files":"A .lhs file holds Literate Haskell.","a file ending in .capnp holds which language":"A .capnp file holds Cap'n Proto.","a file ending in .fshader holds which language":"A .fshader file holds GLSL.","a file ending in .ny holds which language":"A .ny file holds Common Lisp.","which programming language uses the file extension .aj":"A .aj file holds AspectJ.","name the language of .asc files":"A .asc file holds AGS Script.","which programming language uses the file extension .chs":"A .chs file holds C2hs Haskell.","name the language of .rbx files":"A .rbx file holds Ruby.","which programming language uses the file extension .hic":"A .hic file holds Clojure.","a file ending in .ksh holds which language":"A .ksh file holds Shell.","a file ending in .fth holds which language":"A .fth file holds Forth.","a file ending in .jbuilder holds which language":"A .jbuilder file holds Ruby.","which programming language uses the file extension .bdy":"A .bdy file holds PLSQL.","which programming language uses the file extension .csh":"A .csh file holds Tcsh.","which programming language uses the file extension .pb":"A .pb file holds PureBasic.","which programming language uses the file extension .clj":"A .clj file holds Clojure.","which programming language uses the file extension .vhd":"A .vhd file holds VHDL.","a file ending in .hs-boot holds which language":"A .hs-boot file holds Haskell.","name the language of .xsh files":"A .xsh file holds Xonsh.","a file ending in .scm holds which language":"A .scm file holds Scheme.","a file ending in .kid holds which language":"A .kid file holds Genshi.","name the language of .moon files":"A .moon file holds MoonScript.","which programming language uses the file extension .ts":"A .ts file holds TypeScript.","name the language of .qasm files":"A .qasm file holds OpenQASM.","which programming language uses the file extension .gvy":"A .gvy file holds Groovy.","name the language of .nlogo files":"A .nlogo file holds NetLogo.","name the language of .cmd files":"A .cmd file holds Batchfile.","which programming language uses the file extension .fsx":"A .fsx file holds F#.","which programming language uses the file extension .kts":"A .kts file holds Kotlin.","a file ending in .pls holds which language":"A .pls file holds PLSQL.","name the language of .bmx files":"A .bmx file holds BlitzMax.","a file ending in .rktd holds which language":"A .rktd file holds Racket."}}},
{"id":"n-61cea8fd","guard":[["hasAny",["aj","als","asy","bdy","chs","clj","csh","ending","files","fsx","gvy","hic","hsc","hx","ihlp","kts","nomad","orc","pb","pir","pyx","sce","ts","vark","vhd","yar","yy"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .ahkl files":"A .ahkl file holds AutoHotkey.","name the language of .urs files":"A .urs file holds UrWeb.","a file ending in .lmi holds which language":"A .lmi file holds Python.","which programming language uses the file extension .hsc":"A .hsc file holds Haskell.","name the language of .cc files":"A .cc file holds C++.","name the language of .zs files":"A .zs file holds ZenScript.","name the language of .scpt files":"A .scpt file holds AppleScript.","a file ending in .cljx holds which language":"A .cljx file holds Clojure.","name the language of .mkfile files":"A .mkfile file holds Makefile.","which programming language uses the file extension .sce":"A .sce file holds Scilab.","which programming language uses the file extension .orc":"A .orc file holds Csound.","a file ending in .rbfrm holds which language":"A .rbfrm file holds REALbasic.","which programming language uses the file extension .asy":"A .asy file holds Asymptote.","a file ending in .bi holds which language":"A .bi file holds FreeBasic.","name the language of .ik files":"A .ik file holds Ioke.","name the language of .wlt files":"A .wlt file holds Mathematica.","name the language of .py files":"A .py file holds Python.","a file ending in .tpl holds which language":"A .tpl file holds Smarty.","name the language of .lvproj files":"A .lvproj file holds LabVIEW.","a file ending in .escript holds which language":"A .escript file holds Erlang.","a file ending in .wl holds which language":"A .wl file holds Mathematica.","a file ending in .rl holds which language":"A .rl file holds Ragel.","name the language of .cbl files":"A .cbl file holds COBOL.","which programming language uses the file extension .yy":"A .yy file holds Yacc.","which programming language uses the file extension .nomad":"A .nomad file holds HCL.","which programming language uses the file extension .hx":"A .hx file holds Haxe.","a file ending in .lgt holds which language":"A .lgt file holds Logtalk.","which programming language uses the file extension .als":"A .als file holds Alloy.","name the language of .smk files":"A .smk file holds Python.","name the language of .jsm files":"A .jsm file holds JavaScript.","which programming language uses the file extension .pir":"A .pir file holds Parrot Internal Representation.","which programming language uses the file extension .yar":"A .yar file holds YARA.","a file ending in .podspec holds which language":"A .podspec file holds Ruby.","a file ending in .cljs holds which language":"A .cljs file holds Clojure.","which programming language uses the file extension .vark":"A .vark file holds Gosu.","a file ending in .cob holds which language":"A .cob file holds COBOL.","which programming language uses the file extension .pyx":"A .pyx file holds Cython.","which programming language uses the file extension .ihlp":"A .ihlp file holds Stata.","a file ending in .frx holds which language":"A .frx file holds VBA.","a file ending in .jl holds which language":"A .jl file holds Julia.","name the language of .lhs files":"A .lhs file holds Literate Haskell.","a file ending in .capnp holds which language":"A .capnp file holds Cap'n Proto.","a file ending in .fshader holds which language":"A .fshader file holds GLSL.","a file ending in .ny holds which language":"A .ny file holds Common Lisp.","which programming language uses the file extension .aj":"A .aj file holds AspectJ.","name the language of .asc files":"A .asc file holds AGS Script.","which programming language uses the file extension .chs":"A .chs file holds C2hs Haskell.","name the language of .rbx files":"A .rbx file holds Ruby.","which programming language uses the file extension .hic":"A .hic file holds Clojure.","a file ending in .ksh holds which language":"A .ksh file holds Shell.","a file ending in .fth holds which language":"A .fth file holds Forth.","a file ending in .jbuilder holds which language":"A .jbuilder file holds Ruby.","which programming language uses the file extension .bdy":"A .bdy file holds PLSQL.","which programming language uses the file extension .csh":"A .csh file holds Tcsh.","which programming language uses the file extension .pb":"A .pb file holds PureBasic.","which programming language uses the file extension .clj":"A .clj file holds Clojure.","which programming language uses the file extension .vhd":"A .vhd file holds VHDL.","a file ending in .hs-boot holds which language":"A .hs-boot file holds Haskell.","name the language of .xsh files":"A .xsh file holds Xonsh.","a file ending in .scm holds which language":"A .scm file holds Scheme.","a file ending in .kid holds which language":"A .kid file holds Genshi.","name the language of .moon files":"A .moon file holds MoonScript.","which programming language uses the file extension .ts":"A .ts file holds TypeScript.","name the language of .qasm files":"A .qasm file holds OpenQASM.","which programming language uses the file extension .gvy":"A .gvy file holds Groovy.","name the language of .nlogo files":"A .nlogo file holds NetLogo.","name the language of .cmd files":"A .cmd file holds Batchfile.","which programming language uses the file extension .fsx":"A .fsx file holds F#.","which programming language uses the file extension .kts":"A .kts file holds Kotlin.","a file ending in .pls holds which language":"A .pls file holds PLSQL.","name the language of .bmx files":"A .bmx file holds BlitzMax.","a file ending in .rktd holds which language":"A .rktd file holds Racket."}}},
{"id":"n-2b3705ab","guard":[["has","language"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"language"}]]],"mem":{"table":{"of .ahkl files":"A .ahkl file holds AutoHotkey.","of .urs files":"A .urs file holds UrWeb.","uses the file extension .hsc":"A .hsc file holds Haskell.","of .cc files":"A .cc file holds C++.","of .zs files":"A .zs file holds ZenScript.","of .scpt files":"A .scpt file holds AppleScript.","of .mkfile files":"A .mkfile file holds Makefile.","uses the file extension .sce":"A .sce file holds Scilab.","uses the file extension .orc":"A .orc file holds Csound.","uses the file extension .asy":"A .asy file holds Asymptote.","of .ik files":"A .ik file holds Ioke.","of .wlt files":"A .wlt file holds Mathematica.","uses the file extension .6pm":"A .6pm file holds Raku.","of .py files":"A .py file holds Python.","of .lvproj files":"A .lvproj file holds LabVIEW.","of .cbl files":"A .cbl file holds COBOL.","uses the file extension .yy":"A .yy file holds Yacc.","uses the file extension .nomad":"A .nomad file holds HCL.","uses the file extension .hx":"A .hx file holds Haxe.","uses the file extension .als":"A .als file holds Alloy.","of .smk files":"A .smk file holds Python.","of .jsm files":"A .jsm file holds JavaScript.","uses the file extension .pir":"A .pir file holds Parrot Internal Representation.","uses the file extension .yar":"A .yar file holds YARA.","uses the file extension .vark":"A .vark file holds Gosu.","uses the file extension .pyx":"A .pyx file holds Cython.","uses the file extension .ihlp":"A .ihlp file holds Stata.","of .lhs files":"A .lhs file holds Literate Haskell.","uses the file extension .aj":"A .aj file holds AspectJ.","of .asc files":"A .asc file holds AGS Script.","uses the file extension .chs":"A .chs file holds C2hs Haskell.","of .rbx files":"A .rbx file holds Ruby.","uses the file extension .hic":"A .hic file holds Clojure.","uses the file extension .bdy":"A .bdy file holds PLSQL.","uses the file extension .csh":"A .csh file holds Tcsh.","uses the file extension .pb":"A .pb file holds PureBasic.","uses the file extension .clj":"A .clj file holds Clojure.","uses the file extension .vhd":"A .vhd file holds VHDL.","of .xsh files":"A .xsh file holds Xonsh.","of .moon files":"A .moon file holds MoonScript.","uses the file extension .ts":"A .ts file holds TypeScript.","of .qasm files":"A .qasm file holds OpenQASM.","uses the file extension .gvy":"A .gvy file holds Groovy.","of .nlogo files":"A .nlogo file holds NetLogo.","of .cmd files":"A .cmd file holds Batchfile.","uses the file extension .fsx":"A .fsx file holds F#.","uses the file extension .kts":"A .kts file holds Kotlin.","of .bmx files":"A .bmx file holds BlitzMax."}}},
{"id":"n-dee1acb0","guard":[["has","files"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{".ahkl files":"A .ahkl file holds AutoHotkey.",".urs files":"A .urs file holds UrWeb.",".cc files":"A .cc file holds C++.",".zs files":"A .zs file holds ZenScript.",".scpt files":"A .scpt file holds AppleScript.",".mkfile files":"A .mkfile file holds Makefile.",".ik files":"A .ik file holds Ioke.",".wlt files":"A .wlt file holds Mathematica.",".py files":"A .py file holds Python.",".lvproj files":"A .lvproj file holds LabVIEW.",".cbl files":"A .cbl file holds COBOL.",".smk files":"A .smk file holds Python.",".jsm files":"A .jsm file holds JavaScript.",".lhs files":"A .lhs file holds Literate Haskell.",".asc files":"A .asc file holds AGS Script.",".rbx files":"A .rbx file holds Ruby.",".xsh files":"A .xsh file holds Xonsh.",".moon files":"A .moon file holds MoonScript.",".qasm files":"A .qasm file holds OpenQASM.",".nlogo files":"A .nlogo file holds NetLogo.",".cmd files":"A .cmd file holds Batchfile.",".bmx files":"A .bmx file holds BlitzMax."}}},
{"id":"n-01a96761","guard":[["hasAny",["clj","cljs","cljx","delete","hic","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"clojure"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-de79a15b","guard":[["hasAny",["clj","cljs","cljx","delete","hic","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Clojure"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-ee71ec3b","guard":[["hasAny",["lmi","py","shortest","shortest one","shortest word","smk"]],["has","language"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Python."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5fbf441d","guard":[["hasAny",["item number","jbuilder","nth","podspec","position","rbx"]],["has","language"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Ruby."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6ff4d31e","guard":[["hasAny",["item number","lmi","nth","position","py","smk"]],["has","language"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Python."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-855e7c0e","guard":[["hasAny",["item number","jbuilder","nth","podspec","position","rbx"]],["has","language"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Ruby."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-92541ad6","guard":[["hasAny",["item number","lmi","nth","position","py","smk"]],["has","language"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Python."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-03d87c26","guard":[["hasAny",["shortest","shortest one","shortest word","wl","wlt"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Mathematica."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3953abba","guard":[["hasAny",["clj","hic","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Clojure."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3c4015d7","guard":[["hasAny",["bdy","pls","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds PLSQL."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bcbd8f80","guard":[["hasAny",["cbl","cob","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds COBOL."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1d567e14","guard":[["hasAny",["item number","nth","position","wl","wlt"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Mathematica."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-28773c82","guard":[["hasAny",["delete","py","remove","smk","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"python"},["sense.after",{"lit":"language"}]]],"mem":null},
{"id":"n-2f4ea159","guard":[["hasAny",["cbl","cob","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds COBOL."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-547aa67b","guard":[["hasAny",["delete","py","remove","smk","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"python"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-5531d958","guard":[["hasAny",["cljs","cljx","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"clojure"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-6066eb64","guard":[["hasAny",["delete","py","remove","smk","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Python"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-6caeafa0","guard":[["hasAny",["clj","delete","hic","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"clojure"},["sense.after",{"lit":"language"}]]],"mem":null},
{"id":"n-70d5f5c1","guard":[["hasAny",["delete","py","remove","smk","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Python"},["sense.after",{"lit":"language"}]]],"mem":null},
{"id":"n-9283c0ed","guard":[["hasAny",["delete","hsboot","hsc","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Haskell"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-93ac5505","guard":[["hasAny",["delete","jbuilder","podspec","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Ruby"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-94f1472a","guard":[["hasAny",["item number","nth","position","wl","wlt"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Mathematica."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9b43cfca","guard":[["hasAny",["cljs","cljx","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Clojure"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-9d571051","guard":[["hasAny",["delete","jbuilder","podspec","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"ruby"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-a6572c9a","guard":[["hasAny",["delete","jbuilder","podspec","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"ruby"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-b3e7ab3f","guard":[["hasAny",["clj","delete","hic","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Clojure"},["sense.after",{"lit":"language"}]]],"mem":null},
{"id":"n-ba7b28c9","guard":[["hasAny",["delete","jbuilder","podspec","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Ruby"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-bfc1326a","guard":[["hasAny",["delete","hsboot","hsc","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"haskell"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-dccdf0fe","guard":[["hasAny",["bdy","delete","pls","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"PLSQL"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-f5bf34f4","guard":[["hasAny",["cbl","cob","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds COBOL."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e0c0a609","guard":[["hasAny",["clj","hic","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Clojure."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-04572bfa","guard":[["hasAny",["clj","hic","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Clojure."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9732e08f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clj","hic","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Clojure."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a2b56b34","guard":[["hasAny",["clj","hic","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Clojure."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a2f36ba6","guard":[["hasAny",["cljs","cljx","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Clojure."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f7520186","guard":[["hasAny",["item number","jbuilder","nth","podspec","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Ruby."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-65966c44","guard":[["hasAny",["clj","each word","hic","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Clojure."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-71aa66bf","guard":[["hasAny",["cljs","cljx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Clojure."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9a3a6135","guard":[["hasAny",["clj","each word","hic","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Clojure."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-aa1e108a","guard":[["hasAny",["item number","jbuilder","nth","podspec","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Ruby."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0ce65870","guard":[["hasAny",["cljs","cljx","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Clojure."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-40f0d0ce","guard":[["hasAny",["item number","jbuilder","nth","podspec","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ruby."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-54025b36","guard":[["hasAny",["cljs","cljx","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Clojure."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-59349575","guard":[["hasAny",["cljs","cljx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Clojure."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a2c25d6b","guard":[["hasAny",["item number","jbuilder","nth","podspec","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ruby."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a7addaa5","guard":[["hasAny",["item number","jbuilder","nth","podspec","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ruby."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1d101c73","guard":[["hasAny",["cljs","cljx","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Clojure."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3569e8d6","guard":[["hasAny",["cljs","cljx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Clojure."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-60f19de5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cljs","cljx","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Clojure."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6e9ffdc5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","jbuilder","nth","podspec","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ruby."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6f69ff9a","guard":[["hasAny",["invert case","item number","jbuilder","nth","podspec","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ruby."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dcd98556","guard":[["hasAny",["item number","jbuilder","nth","podspec","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ruby."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1b70aee3","guard":[["hasAny",["first n","item number","jbuilder","nth","podspec","position","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ruby."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-49d18a2c","guard":[["hasAny",["cljs","cljx","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Clojure."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-79e87769","guard":[["hasAny",["each word","item number","jbuilder","nth","podspec","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ruby."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7e21021b","guard":[["hasAny",["cljs","cljx","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Clojure."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7e4e9b5b","guard":[["hasAny",["cljs","cljx","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Clojure."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-af6b42f9","guard":[["hasAny",["each word","item number","jbuilder","nth","podspec","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ruby."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e582782c","guard":[["hasAny",["cljs","cljx","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Clojure."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f1b2aa77","guard":[["hasAny",["first n","item number","jbuilder","nth","podspec","position","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ruby."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-05b72983","guard":[["has","als"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .als":"A .als file holds Alloy."}}},
{"id":"n-06fe25eb","guard":[["hasAny",["extension","file","language","programming","uses","vhd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .vhd":"A .vhd file holds VHDL."}}},
{"id":"n-07dfcd5a","guard":[["hasAny",["aj","extension","file","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .aj":"A .aj file holds AspectJ."}}},
{"id":"n-0936b176","guard":[["has","pls"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .pls holds which language":"A .pls file holds PLSQL."}}},
{"id":"n-09d76b5c","guard":[["has","jbuilder"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .jbuilder holds which language":"A .jbuilder file holds Ruby."}}},
{"id":"n-0aa68cd9","guard":[["hasAny",["files","language","name","scpt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .scpt files":"A .scpt file holds AppleScript."}}},
{"id":"n-0ed01ac1","guard":[["hasAny",["ending","file","holds","language","podspec"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .podspec holds which language":"A .podspec file holds Ruby."}}},
{"id":"n-0ef8d117","guard":[["has","cbl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .cbl files":"A .cbl file holds COBOL."}}},
{"id":"n-11957d90","guard":[["hasAny",["extension","file","ihlp","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .ihlp":"A .ihlp file holds Stata."}}},
{"id":"n-15ad07f4","guard":[["has","yar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .yar":"A .yar file holds YARA."}}},
{"id":"n-15c4426d","guard":[["has","zs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .zs files":"A .zs file holds ZenScript."}}},
{"id":"n-176610ce","guard":[["has","fth"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .fth holds which language":"A .fth file holds Forth."}}},
{"id":"n-181518d3","guard":[["hasAny",["files","ik","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .ik files":"A .ik file holds Ioke."}}},
{"id":"n-184ebc1d","guard":[["hasAny",["cljs","ending","file","holds","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .cljs holds which language":"A .cljs file holds Clojure."}}},
{"id":"n-1a1a2759","guard":[["has","rbfrm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .rbfrm holds which language":"A .rbfrm file holds REALbasic."}}},
{"id":"n-1b5f4c09","guard":[["hasAny",["bmx","files","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .bmx files":"A .bmx file holds BlitzMax."}}},
{"id":"n-1be8a708","guard":[["has","bmx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .bmx files":"A .bmx file holds BlitzMax."}}},
{"id":"n-1c4092fa","guard":[["hasAny",["ending","escript","file","holds","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .escript holds which language":"A .escript file holds Erlang."}}},
{"id":"n-1d678bcc","guard":[["has","frx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .frx holds which language":"A .frx file holds VBA."}}},
{"id":"n-1efbb4aa","guard":[["hasAny",["ending","file","holds","language","lmi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .lmi holds which language":"A .lmi file holds Python."}}},
{"id":"n-211548b8","guard":[["has","lhs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .lhs files":"A .lhs file holds Literate Haskell."}}},
{"id":"n-2653fe4a","guard":[["has","capnp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .capnp holds which language":"A .capnp file holds Cap'n Proto."}}},
{"id":"n-28d427a8","guard":[["hasAny",["files","language","moon","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .moon files":"A .moon file holds MoonScript."}}},
{"id":"n-28d69936","guard":[["hasAny",["extension","file","kts","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .kts":"A .kts file holds Kotlin."}}},
{"id":"n-290a6623","guard":[["hasAny",["extension","file","language","pb","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .pb":"A .pb file holds PureBasic."}}},
{"id":"n-2acfe4e9","guard":[["has","asy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .asy":"A .asy file holds Asymptote."}}},
{"id":"n-2b8b2bca","guard":[["hasAny",["files","language","name","py"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .py files":"A .py file holds Python."}}},
{"id":"n-2e2165ad","guard":[["hasAny",["files","language","mkfile","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .mkfile files":"A .mkfile file holds Makefile."}}},
{"id":"n-30c22d45","guard":[["hasAny",["files","language","name","nlogo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .nlogo files":"A .nlogo file holds NetLogo."}}},
{"id":"n-327ebda6","guard":[["has","ik"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .ik files":"A .ik file holds Ioke."}}},
{"id":"n-32e253ff","guard":[["hasAny",["cmd","files","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .cmd files":"A .cmd file holds Batchfile."}}},
{"id":"n-368dd73b","guard":[["hasAny",["extension","file","hsc","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .hsc":"A .hsc file holds Haskell."}}},
{"id":"n-36f1dca8","guard":[["hasAny",["ending","file","holds","language","lgt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .lgt holds which language":"A .lgt file holds Logtalk."}}},
{"id":"n-3cdc3aaf","guard":[["has","hic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .hic":"A .hic file holds Clojure."}}},
{"id":"n-3f68d8ef","guard":[["has","cmd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .cmd files":"A .cmd file holds Batchfile."}}},
{"id":"n-3fcee9a6","guard":[["has","smk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .smk files":"A .smk file holds Python."}}},
{"id":"n-45acddfc","guard":[["hasAny",["extension","file","language","pir","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .pir":"A .pir file holds Parrot Internal Representation."}}},
{"id":"n-49f9f874","guard":[["has","cc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .cc files":"A .cc file holds C++."}}},
{"id":"n-4a168069","guard":[["has","cljs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .cljs holds which language":"A .cljs file holds Clojure."}}},
{"id":"n-4b8d15ac","guard":[["has","cob"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .cob holds which language":"A .cob file holds COBOL."}}},
{"id":"n-4c41c0b4","guard":[["has","ahkl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .ahkl files":"A .ahkl file holds AutoHotkey."}}},
{"id":"n-53f89b28","guard":[["hasAny",["ending","file","holds","jbuilder","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .jbuilder holds which language":"A .jbuilder file holds Ruby."}}},
{"id":"n-5513b385","guard":[["has","bi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .bi holds which language":"A .bi file holds FreeBasic."}}},
{"id":"n-56be0db1","guard":[["hasAny",["files","language","name","smk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .smk files":"A .smk file holds Python."}}},
{"id":"n-5826dc5d","guard":[["hasAny",["files","language","name","xsh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .xsh files":"A .xsh file holds Xonsh."}}},
{"id":"n-59402f23","guard":[["hasAny",["ending","file","frx","holds","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .frx holds which language":"A .frx file holds VBA."}}},
{"id":"n-5b01ef62","guard":[["hasAny",["als","extension","file","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .als":"A .als file holds Alloy."}}},
{"id":"n-5c9ef1e4","guard":[["has","ihlp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .ihlp":"A .ihlp file holds Stata."}}},
{"id":"n-5d1a904e","guard":[["hasAny",["asy","extension","file","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .asy":"A .asy file holds Asymptote."}}},
{"id":"n-5fefeede","guard":[["has","scm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .scm holds which language":"A .scm file holds Scheme."}}},
{"id":"n-6040d7b9","guard":[["has","ihlp"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Stata."]},["sense.lastWord"]],"mem":null},
{"id":"n-6055e988","guard":[["has","rbx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .rbx files":"A .rbx file holds Ruby."}}},
{"id":"n-6151d72c","guard":[["hasAny",["bi","ending","file","holds","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .bi holds which language":"A .bi file holds FreeBasic."}}},
{"id":"n-62bd2c05","guard":[["hasAny",["clj","extension","file","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .clj":"A .clj file holds Clojure."}}},
{"id":"n-683c6439","guard":[["hasAny",["chs","extension","file","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .chs":"A .chs file holds C2hs Haskell."}}},
{"id":"n-6890a8b6","guard":[["has","lvproj"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .lvproj files":"A .lvproj file holds LabVIEW."}}},
{"id":"n-6c8ec65e","guard":[["has","wlt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .wlt files":"A .wlt file holds Mathematica."}}},
{"id":"n-6d25ff39","guard":[["hasAny",["ending","file","holds","kid","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .kid holds which language":"A .kid file holds Genshi."}}},
{"id":"n-6ff70f53","guard":[["hasAny",["extension","file","gvy","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .gvy":"A .gvy file holds Groovy."}}},
{"id":"n-702b1e1e","guard":[["has","yy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .yy":"A .yy file holds Yacc."}}},
{"id":"n-73c8a1b2","guard":[["has","moon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .moon files":"A .moon file holds MoonScript."}}},
{"id":"n-74b01438","guard":[["hasAny",["extension","file","fsx","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .fsx":"A .fsx file holds F#."}}},
{"id":"n-75227266","guard":[["hasAny",["extension","file","hic","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .hic":"A .hic file holds Clojure."}}},
{"id":"n-76944910","guard":[["has","ny"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .ny holds which language":"A .ny file holds Common Lisp."}}},
{"id":"n-77416950","guard":[["has","escript"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .escript holds which language":"A .escript file holds Erlang."}}},
{"id":"n-78f76522","guard":[["hasAny",["csh","extension","file","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .csh":"A .csh file holds Tcsh."}}},
{"id":"n-792af345","guard":[["has","fshader"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .fshader holds which language":"A .fshader file holds GLSL."}}},
{"id":"n-7a1589b6","guard":[["has","kid"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .kid holds which language":"A .kid file holds Genshi."}}},
{"id":"n-7a35a429","guard":[["has","pir"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .pir":"A .pir file holds Parrot Internal Representation."}}},
{"id":"n-7a3be2d8","guard":[["hasAny",["files","language","name","wlt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .wlt files":"A .wlt file holds Mathematica."}}},
{"id":"n-7ac7d75e","guard":[["has","lmi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .lmi holds which language":"A .lmi file holds Python."}}},
{"id":"n-7c65725a","guard":[["has","jsm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .jsm files":"A .jsm file holds JavaScript."}}},
{"id":"n-7ddfccc1","guard":[["has","chs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .chs":"A .chs file holds C2hs Haskell."}}},
{"id":"n-7e0ba630","guard":[["hasAny",["ending","file","holds","jl","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .jl holds which language":"A .jl file holds Julia."}}},
{"id":"n-7e477f80","guard":[["hasAny",["cbl","files","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .cbl files":"A .cbl file holds COBOL."}}},
{"id":"n-7f7b9bac","guard":[["hasAny",["cljx","ending","file","holds","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .cljx holds which language":"A .cljx file holds Clojure."}}},
{"id":"n-800c2295","guard":[["hasAny",["ending","file","holds","language","scm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .scm holds which language":"A .scm file holds Scheme."}}},
{"id":"n-82f000e3","guard":[["hasAny",["ending","file","holds","language","rl"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .rl holds which language":"A .rl file holds Ragel."}}},
{"id":"n-84859de4","guard":[["has","qasm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .qasm files":"A .qasm file holds OpenQASM."}}},
{"id":"n-8647a63a","guard":[["hasAny",["asc","files","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .asc files":"A .asc file holds AGS Script."}}},
{"id":"n-87a47037","guard":[["has","csh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .csh":"A .csh file holds Tcsh."}}},
{"id":"n-88a77ddb","guard":[["has","ts"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .ts":"A .ts file holds TypeScript."}}},
{"id":"n-8d3ba17f","guard":[["hasAny",["ending","file","holds","language","wl"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .wl holds which language":"A .wl file holds Mathematica."}}},
{"id":"n-8ea3ff94","guard":[["hasAny",["bdy","extension","file","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .bdy":"A .bdy file holds PLSQL."}}},
{"id":"n-8f116143","guard":[["has","orc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .orc":"A .orc file holds Csound."}}},
{"id":"n-8f713fc4","guard":[["has","ksh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .ksh holds which language":"A .ksh file holds Shell."}}},
{"id":"n-92a28c6d","guard":[["hasAny",["ending","file","holds","language","tpl"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .tpl holds which language":"A .tpl file holds Smarty."}}},
{"id":"n-92f3d7a2","guard":[["hasAny",["extension","file","language","programming","uses","yy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .yy":"A .yy file holds Yacc."}}},
{"id":"n-97265edd","guard":[["has","clj"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .clj":"A .clj file holds Clojure."}}},
{"id":"n-98a484f7","guard":[["has","vark"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .vark":"A .vark file holds Gosu."}}},
{"id":"n-997c5039","guard":[["has","urs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .urs files":"A .urs file holds UrWeb."}}},
{"id":"n-9b75677f","guard":[["hasAny",["files","language","lhs","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .lhs files":"A .lhs file holds Literate Haskell."}}},
{"id":"n-9c092a52","guard":[["hasAny",["extension","file","language","nomad","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .nomad":"A .nomad file holds HCL."}}},
{"id":"n-9fa1f62b","guard":[["has","nomad"],["has","programming"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds HCL."]},["sense.lastWord"]],"mem":null},
{"id":"n-9ff3a364","guard":[["has","vhd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .vhd":"A .vhd file holds VHDL."}}},
{"id":"n-a0e1664a","guard":[["hasAny",["ending","file","holds","language","ny"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .ny holds which language":"A .ny file holds Common Lisp."}}},
{"id":"n-a74e9d4f","guard":[["has","asc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .asc files":"A .asc file holds AGS Script."}}},
{"id":"n-a773b99f","guard":[["hasAny",["extension","file","hx","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .hx":"A .hx file holds Haxe."}}},
{"id":"n-a980615a","guard":[["hasAny",["files","jsm","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .jsm files":"A .jsm file holds JavaScript."}}},
{"id":"n-b067e95b","guard":[["hasAny",["extension","file","language","programming","uses","yar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .yar":"A .yar file holds YARA."}}},
{"id":"n-b1929ddd","guard":[["has","pyx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .pyx":"A .pyx file holds Cython."}}},
{"id":"n-b2754676","guard":[["has","vark"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Gosu."]},["sense.lastWord"]],"mem":null},
{"id":"n-b59999d9","guard":[["hasAny",["files","language","name","rbx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .rbx files":"A .rbx file holds Ruby."}}},
{"id":"n-b5f7002b","guard":[["has","bdy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .bdy":"A .bdy file holds PLSQL."}}},
{"id":"n-b729efa3","guard":[["hasAny",["files","language","lvproj","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .lvproj files":"A .lvproj file holds LabVIEW."}}},
{"id":"n-ba4e80fd","guard":[["has","rktd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .rktd holds which language":"A .rktd file holds Racket."}}},
{"id":"n-bb7952a7","guard":[["hasAny",["ending","file","holds","hsboot","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .hs-boot holds which language":"A .hs-boot file holds Haskell."}}},
{"id":"n-bba025b3","guard":[["has","gvy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .gvy":"A .gvy file holds Groovy."}}},
{"id":"n-bd0a03fa","guard":[["hasAny",["cc","files","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .cc files":"A .cc file holds C++."}}},
{"id":"n-bfaa08da","guard":[["has","nomad"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .nomad":"A .nomad file holds HCL."}}},
{"id":"n-c2028e4c","guard":[["has","hx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .hx":"A .hx file holds Haxe."}}},
{"id":"n-c27bd0b4","guard":[["has","hsboot"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .hs-boot holds which language":"A .hs-boot file holds Haskell."}}},
{"id":"n-c57e5ba3","guard":[["hasAny",["ending","file","holds","ksh","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .ksh holds which language":"A .ksh file holds Shell."}}},
{"id":"n-c6777556","guard":[["hasAny",["files","language","name","zs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .zs files":"A .zs file holds ZenScript."}}},
{"id":"n-c87d7e0a","guard":[["hasAny",["ending","file","holds","language","rktd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .rktd holds which language":"A .rktd file holds Racket."}}},
{"id":"n-c92bc02a","guard":[["has","wl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .wl holds which language":"A .wl file holds Mathematica."}}},
{"id":"n-c972469e","guard":[["hasAny",["extension","file","language","programming","pyx","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .pyx":"A .pyx file holds Cython."}}},
{"id":"n-c98d2e1c","guard":[["has","py"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .py files":"A .py file holds Python."}}},
{"id":"n-c9e695ea","guard":[["hasAny",["ahkl","files","language","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .ahkl files":"A .ahkl file holds AutoHotkey."}}},
{"id":"n-caa423c4","guard":[["has","fsx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .fsx":"A .fsx file holds F#."}}},
{"id":"n-cece9174","guard":[["hasAny",["cob","ending","file","holds","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .cob holds which language":"A .cob file holds COBOL."}}},
{"id":"n-d03ba948","guard":[["hasAny",["ending","file","fth","holds","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .fth holds which language":"A .fth file holds Forth."}}},
{"id":"n-d0bccc5c","guard":[["has","lgt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .lgt holds which language":"A .lgt file holds Logtalk."}}},
{"id":"n-d212d318","guard":[["has","kts"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .kts":"A .kts file holds Kotlin."}}},
{"id":"n-d61dace9","guard":[["hasAny",["files","language","name","urs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .urs files":"A .urs file holds UrWeb."}}},
{"id":"n-d78f867f","guard":[["hasAny",["6pm","extension","file","language","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .6pm":"A .6pm file holds Raku."}}},
{"id":"n-d7ca0b8e","guard":[["has","jl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .jl holds which language":"A .jl file holds Julia."}}},
{"id":"n-dc7b03fa","guard":[["has","scpt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .scpt files":"A .scpt file holds AppleScript."}}},
{"id":"n-dca85412","guard":[["has","podspec"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .podspec holds which language":"A .podspec file holds Ruby."}}},
{"id":"n-dcf0073d","guard":[["has","xsh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .xsh files":"A .xsh file holds Xonsh."}}},
{"id":"n-e09e5a46","guard":[["has","nlogo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .nlogo files":"A .nlogo file holds NetLogo."}}},
{"id":"n-e2c5e429","guard":[["has","rl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .rl holds which language":"A .rl file holds Ragel."}}},
{"id":"n-e3bbde95","guard":[["hasAny",["extension","file","language","programming","sce","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .sce":"A .sce file holds Scilab."}}},
{"id":"n-e43459d8","guard":[["hasAny",["ending","file","holds","language","rbfrm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .rbfrm holds which language":"A .rbfrm file holds REALbasic."}}},
{"id":"n-e85827f4","guard":[["has","mkfile"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the language of .mkfile files":"A .mkfile file holds Makefile."}}},
{"id":"n-e986fbea","guard":[["hasAny",["extension","file","language","orc","programming","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .orc":"A .orc file holds Csound."}}},
{"id":"n-e9ad7552","guard":[["has","sce"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .sce":"A .sce file holds Scilab."}}},
{"id":"n-eea8996c","guard":[["has","hsc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .hsc":"A .hsc file holds Haskell."}}},
{"id":"n-ef2899b8","guard":[["hasAny",["files","language","name","qasm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the language of .qasm files":"A .qasm file holds OpenQASM."}}},
{"id":"n-f67acf85","guard":[["hasAny",["capnp","ending","file","holds","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .capnp holds which language":"A .capnp file holds Cap'n Proto."}}},
{"id":"n-f78e5af5","guard":[["has","pb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .pb":"A .pb file holds PureBasic."}}},
{"id":"n-f9608703","guard":[["hasAny",["ending","file","holds","language","pls"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .pls holds which language":"A .pls file holds PLSQL."}}},
{"id":"n-f98e71c0","guard":[["hasAny",["extension","file","language","programming","ts","uses"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .ts":"A .ts file holds TypeScript."}}},
{"id":"n-fa1ec509","guard":[["has","tpl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .tpl holds which language":"A .tpl file holds Smarty."}}},
{"id":"n-fa2454a3","guard":[["has","cljx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"a file ending in .cljx holds which language":"A .cljx file holds Clojure."}}},
{"id":"n-fc2a8f57","guard":[["has","aj"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .aj":"A .aj file holds AspectJ."}}},
{"id":"n-fcd20a58","guard":[["hasAny",["extension","file","language","programming","uses","vark"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which programming language uses the file extension .vark":"A .vark file holds Gosu."}}},
{"id":"n-fce511c7","guard":[["hasAny",["ending","file","fshader","holds","language"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"a file ending in .fshader holds which language":"A .fshader file holds GLSL."}}},
{"id":"n-32c2ce37","guard":[["hasAny",["hsc","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Haskell."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-39195b51","guard":[["hasAny",["shortest","shortest one","shortest word","urs"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds UrWeb."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-39b9e6c6","guard":[["hasAny",["asc","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds AGS Script."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3a1d50ba","guard":[["hasAny",["orc","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Csound."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3f24ff61","guard":[["hasAny",["pb","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds PureBasic."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4054672f","guard":[["hasAny",["asy","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Asymptote."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-45a1f28b","guard":[["hasAny",["6pm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Raku."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4986d160","guard":[["hasAny",["hx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Haxe."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-58bb434f","guard":[["hasAny",["fsx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds F#."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5943808c","guard":[["hasAny",["rbx","shortest","shortest one","shortest word"]],["has","language"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Ruby."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5ba65a35","guard":[["hasAny",["cmd","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Batchfile."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6d8f00dd","guard":[["hasAny",["bmx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds BlitzMax."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7b584aad","guard":[["hasAny",["shortest","shortest one","shortest word","zs"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds ZenScript."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-822c6631","guard":[["hasAny",["kts","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Kotlin."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-856459f8","guard":[["hasAny",["pir","shortest","shortest one","shortest word"]],["has","programming"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Parrot Internal Representation."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8dd5e5a9","guard":[["hasAny",["ik","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Ioke."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-92dbd2b6","guard":[["hasAny",["gvy","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Groovy."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-94d8358a","guard":[["hasAny",["jsm","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds JavaScript."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9a5d1ae5","guard":[["hasAny",["cc","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds C++."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a6f07471","guard":[["hasAny",["pyx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Cython."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b38c82eb","guard":[["hasAny",["shortest","shortest one","shortest word","vhd"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds VHDL."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c9d343f0","guard":[["hasAny",["lhs","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Literate Haskell."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d49328d3","guard":[["hasAny",["shortest","shortest one","shortest word","xsh"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Xonsh."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-da8f0e07","guard":[["hasAny",["hsboot","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .hs-boot ",{"slot":0}," holds Haskell."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dd70da9e","guard":[["hasAny",["shortest","shortest one","shortest word","yy"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Yacc."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e70d6406","guard":[["hasAny",["shortest","shortest one","shortest word","ts"]],["has","which"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds TypeScript."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e81986aa","guard":[["hasAny",["als","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Alloy."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ecdf3274","guard":[["hasAny",["csh","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Tcsh."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-eeff9d8b","guard":[["hasAny",["shortest","shortest one","shortest word","yar"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds YARA."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f4cf170f","guard":[["hasAny",["sce","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Scilab."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f723611f","guard":[["hasAny",["aj","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds AspectJ."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ff6ba420","guard":[["hasAny",["chs","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds C2hs Haskell."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-00175073","guard":[["hasAny",["separate by","split","split by","wlt"]]],"pyramid":["render.lines",["transform.split",{"lit":"Mathematica"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-01a89c1b","guard":[["hasAny",["hsc","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"Haskell"},["sense.before",{"lit":"file"}]]],"mem":null},
{"id":"n-01e64bc8","guard":[["hasAny",["item number","nth","position","sce"]]],"pyramid":["render.template",{"lit":["A .sce ",{"slot":0}," holds Scilab."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-04ff53bf","guard":[["hasAny",["delete","rbx","remove","strip out","without"]],["has","language"]],"pyramid":["render.str",["transform.remove",{"lit":"Ruby"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-0dbd3166","guard":[["hasAny",["item number","nth","position","xsh"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Xonsh."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0edc0202","guard":[["hasAny",["hsc","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"Haskell"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-102b417f","guard":[["hasAny",["cmd","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Batchfile."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-115ed2a8","guard":[["hasAny",["gvy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .gvy ",{"slot":0}," holds Groovy."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-152ab752","guard":[["hasAny",["ahkl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds AutoHotkey."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-15d9af11","guard":[["hasAny",["ahkl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds AutoHotkey."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1a2a8c54","guard":[["hasAny",["hsc","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"Haskell"},["sense.before",{"lit":"file"}]]],"mem":null},
{"id":"n-1d8c2853","guard":[["hasAny",["item number","nomad","nth","position"]],["has","programming"]],"pyramid":["render.template",{"lit":["A .nomad ",{"slot":0}," holds HCL."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1e6e104e","guard":[["hasAny",["separate by","split","split by","wlt"]]],"pyramid":["render.list",["transform.split",{"lit":"Mathematica"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-206a9246","guard":[["hasAny",["cbl","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"COBOL"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-20f361e9","guard":[["hasAny",["item number","nth","orc","position"]]],"pyramid":["render.template",{"lit":["A .orc ",{"slot":0}," holds Csound."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-234820cd","guard":[["hasAny",["item number","lhs","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Literate Haskell."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-23ca0fce","guard":[["hasAny",["csh","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .csh ",{"slot":0}," holds Tcsh."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-261e03d1","guard":[["hasAny",["hsc","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"Haskell"},["sense.before",{"lit":"file"}]]],"mem":null},
{"id":"n-28af7c94","guard":[["hasAny",["delete","hsc","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"haskell"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-2a7cdb90","guard":[["hasAny",["hsc","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"Haskell"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-2b5d49f2","guard":[["hasAny",["item number","nth","position","zs"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds ZenScript."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2baf7a7b","guard":[["hasAny",["delete","lmi","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Python"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-2deea67d","guard":[["hasAny",["delete","remove","strip out","without","wlt"]]],"pyramid":["render.str",["transform.remove",{"lit":"Mathematica"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-30480821","guard":[["hasAny",["hsc","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"haskell"},["sense.before",{"lit":"file"}]]],"mem":null},
{"id":"n-30620fc0","guard":[["hasAny",["delete","remove","strip out","without","wlt"]]],"pyramid":["render.str",["transform.remove",{"lit":"Mathematica"},["sense.after",{"lit":"language"}]]],"mem":null},
{"id":"n-33756f1b","guard":[["hasAny",["item number","nth","position","scpt"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds AppleScript."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3379838e","guard":[["hasAny",["item number","jsm","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds JavaScript."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-35010312","guard":[["hasAny",["hsc","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"haskell"},["sense.before",{"lit":"file"}]]],"mem":null},
{"id":"n-36095c9c","guard":[["hasAny",["hic","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .hic ",{"slot":0}," holds Clojure."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-36e7d61f","guard":[["hasAny",["separate by","split","split by","wlt"]]],"pyramid":["render.and",["transform.split",{"lit":"Mathematica"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-3df8feb1","guard":[["hasAny",["item number","nth","position","zs"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds ZenScript."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3e0db1a6","guard":[["hasAny",["separate by","split","split by","wl"]]],"pyramid":["render.list",["transform.split",{"lit":"Mathematica"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-401c5744","guard":[["hasAny",["asc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds AGS Script."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-42408e8e","guard":[["hasAny",["item number","lhs","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Literate Haskell."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-433789f2","guard":[["hasAny",["clj","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .clj ",{"slot":0}," holds Clojure."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-44454ed7","guard":[["hasAny",["item number","nlogo","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds NetLogo."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4882fd9b","guard":[["hasAny",["delete","hsc","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Haskell"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-48ed4cbc","guard":[["hasAny",["item number","jsm","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds JavaScript."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4d16dd62","guard":[["hasAny",["delete","remove","strip out","without","wl"]]],"pyramid":["render.str",["transform.remove",{"lit":"Mathematica"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-4d33c2f5","guard":[["hasAny",["delete","hsboot","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Haskell"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-4d5e5e96","guard":[["hasAny",["delete","hsc","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Haskell"},["sense.after",{"lit":"language"}]]],"mem":null},
{"id":"n-4fecfc1c","guard":[["hasAny",["delete","rbx","remove","strip out","without"]],["has","language"]],"pyramid":["render.str",["transform.remove",{"lit":"ruby"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-53e20a65","guard":[["hasAny",["bmx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds BlitzMax."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-57b5947b","guard":[["hasAny",["item number","mkfile","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Makefile."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5808c7d2","guard":[["hasAny",["item number","nth","position","urs"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds UrWeb."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-588013f0","guard":[["hasAny",["delete","remove","strip out","without","wlt"]]],"pyramid":["render.str",["transform.remove",{"lit":"Mathematica"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-5aee6c21","guard":[["hasAny",["hsc","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"haskell"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-5c3651b1","guard":[["hasAny",["cmd","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Batchfile."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5edbcb57","guard":[["hasAny",["separate by","split","split by","wl"]]],"pyramid":["render.lines",["transform.split",{"lit":"Mathematica"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-60c3b5a6","guard":[["hasAny",["item number","nth","position","scpt"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds AppleScript."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-620257e2","guard":[["hasAny",["hsc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .hsc ",{"slot":0}," holds Haskell."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-627ab6b9","guard":[["hasAny",["bdy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .bdy ",{"slot":0}," holds PLSQL."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-62ff6171","guard":[["hasAny",["hsc","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"haskell"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-6b99333c","guard":[["hasAny",["delete","hsc","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Haskell"},["sense.before",{"lit":"file"}]]],"mem":null},
{"id":"n-6ce6f4a2","guard":[["hasAny",["item number","nth","position","xsh"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Xonsh."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6f5cd5d9","guard":[["hasAny",["delete","hsc","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"haskell"},["sense.before",{"lit":"file"}]]],"mem":null},
{"id":"n-6ff102c3","guard":[["hasAny",["asc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds AGS Script."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-76be91f1","guard":[["hasAny",["asy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .asy ",{"slot":0}," holds Asymptote."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7813bc69","guard":[["hasAny",["hsc","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"haskell"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-78254548","guard":[["hasAny",["item number","lvproj","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds LabVIEW."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-79567575","guard":[["hasAny",["item number","lvproj","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds LabVIEW."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7a175959","guard":[["hasAny",["item number","nth","position","qasm"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds OpenQASM."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-813b5284","guard":[["hasAny",["item number","moon","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds MoonScript."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-83395106","guard":[["hasAny",["item number","nth","position","vark"]]],"pyramid":["render.template",{"lit":["A .vark ",{"slot":0}," holds Gosu."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-839effd3","guard":[["hasAny",["als","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .als ",{"slot":0}," holds Alloy."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8fead02b","guard":[["hasAny",["item number","kts","nth","position"]]],"pyramid":["render.template",{"lit":["A .kts ",{"slot":0}," holds Kotlin."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-94dd0044","guard":[["hasAny",["delete","pls","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"PLSQL"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-951323c1","guard":[["hasAny",["bmx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds BlitzMax."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-959ff673","guard":[["hasAny",["cc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds C++."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-972cc62c","guard":[["hasAny",["separate by","split","split by","wl"]]],"pyramid":["render.and",["transform.split",{"lit":"Mathematica"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-980b4744","guard":[["hasAny",["cob","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"COBOL"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-9a0d5d7e","guard":[["hasAny",["delete","lmi","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"python"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-9bef4b0b","guard":[["hasAny",["hx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .hx ",{"slot":0}," holds Haxe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9fbd0744","guard":[["hasAny",["ik","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Ioke."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-a29ffe5e","guard":[["hasAny",["delete","rbx","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Ruby"},["sense.after",{"lit":"language"}]]],"mem":null},
{"id":"n-a2e3212b","guard":[["hasAny",["fsx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .fsx ",{"slot":0}," holds F#."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a4386b81","guard":[["hasAny",["hsboot","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .hs-boot file ",{"slot":0}," Haskell."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a778cf28","guard":[["hasAny",["item number","nth","pb","position"]]],"pyramid":["render.template",{"lit":["A .pb ",{"slot":0}," holds PureBasic."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-aca54d7d","guard":[["hasAny",["delete","lmi","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"python"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-aeeb4022","guard":[["hasAny",["hsc","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"Haskell"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-b81a660c","guard":[["hasAny",["chs","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .chs ",{"slot":0}," holds C2hs Haskell."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b870383a","guard":[["hasAny",["item number","nth","position","pyx"]]],"pyramid":["render.template",{"lit":["A .pyx ",{"slot":0}," holds Cython."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b9528077","guard":[["hasAny",["item number","nth","position","qasm"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds OpenQASM."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c0f4497d","guard":[["hasAny",["cob","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"COBOL"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-c46849d9","guard":[["hasAny",["item number","nth","position","vhd"]]],"pyramid":["render.template",{"lit":["A .vhd ",{"slot":0}," holds VHDL."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c70c6b20","guard":[["hasAny",["item number","nth","pir","position"]],["has","programming"]],"pyramid":["render.template",{"lit":["A .pir ",{"slot":0}," holds Parrot Internal Representation."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c76c13a2","guard":[["hasAny",["item number","mkfile","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Makefile."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cb41deee","guard":[["hasAny",["ihlp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .ihlp ",{"slot":0}," holds Stata."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cbc7d4dc","guard":[["hasAny",["delete","lmi","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Python"},["sense.after",{"lit":"file"}]]],"mem":null},
{"id":"n-cea07c09","guard":[["hasAny",["item number","nth","position","yy"]]],"pyramid":["render.template",{"lit":["A .yy ",{"slot":0}," holds Yacc."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ced47182","guard":[["hasAny",["delete","remove","strip out","without","wl"]]],"pyramid":["render.str",["transform.remove",{"lit":"Mathematica"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-d5d3cf6d","guard":[["hasAny",["delete","hsc","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"haskell"},["sense.after",{"lit":"language"}]]],"mem":null},
{"id":"n-d65088cb","guard":[["hasAny",["delete","remove","strip out","without","wl"]]],"pyramid":["render.str",["transform.remove",{"lit":"Mathematica"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-d83f3e5b","guard":[["hasAny",["delete","rbx","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"ruby"},["sense.after",{"lit":"language"}]]],"mem":null},
{"id":"n-db70c2a5","guard":[["hasAny",["cc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds C++."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-dba56e1c","guard":[["hasAny",["item number","nth","position","urs"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds UrWeb."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dea6eece","guard":[["hasAny",["bdy","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"PLSQL"},["sense.after",{"lit":"language"}]]],"mem":null},
{"id":"n-dfb24fdc","guard":[["hasAny",["delete","hsboot","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"haskell"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-e4220eca","guard":[["hasAny",["item number","nth","position","yar"]]],"pyramid":["render.template",{"lit":["A .yar ",{"slot":0}," holds YARA."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e654fef3","guard":[["hasAny",["cbl","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"COBOL"},["sense.after",{"lit":"language"}]]],"mem":null},
{"id":"n-e9fbba77","guard":[["hasAny",["ik","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds Ioke."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ea1a57fb","guard":[["hasAny",["item number","nlogo","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds NetLogo."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ec53c632","guard":[["hasAny",["aj","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .aj ",{"slot":0}," holds AspectJ."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-edd8fbe4","guard":[["hasAny",["item number","moon","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file holds MoonScript."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f371c2fd","guard":[["hasAny",["hsc","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"haskell"},["sense.before",{"lit":"file"}]]],"mem":null},
{"id":"n-f399218b","guard":[["hasAny",["item number","nth","position","ts"]]],"pyramid":["render.template",{"lit":["A .ts ",{"slot":0}," holds TypeScript."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fafafb5c","guard":[["hasAny",["6pm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .6pm ",{"slot":0}," holds Raku."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-00bced03","guard":[["hasAny",["shortest","shortest one","shortest word","tpl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Smarty."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0511fb20","guard":[["hasAny",["item number","nth","position","sce"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Scilab."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-08c7a094","guard":[["hasAny",["lgt","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Logtalk."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0b215747","guard":[["hasAny",["asy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Asymptote."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-201a3fa7","guard":[["hasAny",["hsc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haskell."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3feeb5c9","guard":[["hasAny",["bdy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PLSQL."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4893b38c","guard":[["hasAny",["rl","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Ragel."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4b8f22ff","guard":[["hasAny",["ihlp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Stata."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4eebba0f","guard":[["hasAny",["chs","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds C2hs Haskell."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-53c203d6","guard":[["hasAny",["pls","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PLSQL."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-58eda3a4","guard":[["hasAny",["item number","nth","position","yar"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds YARA."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-63373a72","guard":[["hasAny",["ny","shortest","shortest one","shortest word"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Common Lisp."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-664c976e","guard":[["hasAny",["jl","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Julia."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-69924005","guard":[["hasAny",["item number","kts","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Kotlin."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6fcab171","guard":[["hasAny",["hx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haxe."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-737d800b","guard":[["hasAny",["cob","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds COBOL."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-756ea8ea","guard":[["hasAny",["item number","nth","position","vhd"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds VHDL."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-75b18b10","guard":[["hasAny",["6pm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Raku."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8b5fd9f1","guard":[["hasAny",["scm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Scheme."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8b9e410f","guard":[["hasAny",["ksh","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Shell."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8e438354","guard":[["hasAny",["als","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Alloy."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9472209a","guard":[["hasAny",["fsx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds F#."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-98520399","guard":[["hasAny",["kid","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Genshi."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9a86aa3c","guard":[["hasAny",["bi","shortest","shortest one","shortest word"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds FreeBasic."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a31878b8","guard":[["hasAny",["frx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds VBA."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a976e4bd","guard":[["hasAny",["item number","nth","position","pyx"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Cython."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ac99848a","guard":[["hasAny",["item number","nth","pir","position"]],["has","programming"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Parrot Internal Representation."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b517509b","guard":[["hasAny",["csh","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Tcsh."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bb6a093f","guard":[["hasAny",["fth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Forth."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-bc1970f2","guard":[["hasAny",["item number","nth","position","ts"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds TypeScript."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d100e6d7","guard":[["hasAny",["item number","nomad","nth","position"]],["has","programming"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds HCL."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d831fb28","guard":[["hasAny",["item number","nth","orc","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Csound."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-da51532d","guard":[["hasAny",["item number","nth","position","vark"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Gosu."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e21619b9","guard":[["hasAny",["item number","nth","position","yy"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Yacc."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e7d49957","guard":[["hasAny",["item number","nth","pb","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PureBasic."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e8bf54d6","guard":[["hasAny",["shortest","shortest one","shortest word","wl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Mathematica."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-eb3bb802","guard":[["hasAny",["lmi","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Python."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ecc3174f","guard":[["hasAny",["gvy","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Groovy."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ff547803","guard":[["hasAny",["aj","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds AspectJ."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-028020b7","guard":[["hasAny",["fth","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Forth."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0324d076","guard":[["hasAny",["bi","item number","nth","position","shortest","shortest one","shortest word"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," FreeBasic."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-03719e98","guard":[["hasAny",["6pm","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Raku."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-03dbd1fc","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","vhd"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds VHDL."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0605d942","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tpl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Smarty."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0682915d","guard":[["hasAny",["hsc","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haskell."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-06e8e4b6","guard":[["hasAny",["item number","nth","position","rbfrm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .rbfrm ",{"slot":0}," ",{"slot":1}," REALbasic."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0a412c26","guard":[["hasAny",["gvy","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Groovy."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0ae3b383","guard":[["hasAny",["cljs","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .cljs ",{"slot":0}," ",{"slot":1}," Clojure."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0aff40d6","guard":[["hasAny",["asy","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Asymptote."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0d795a52","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","yy"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Yacc."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0f5f3210","guard":[["hasAny",["item number","nth","ny","position","shortest","shortest one","shortest word"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Common Lisp."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0f79eef8","guard":[["hasAny",["alphabetize the letters","asy","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Asymptote."]},["transform.sortLetters",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-11b8e11b","guard":[["hasAny",["frx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .frx ",{"slot":0}," ",{"slot":1}," VBA."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-11e48844","guard":[["hasAny",["asy","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Asymptote."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1255a634","guard":[["hasAny",["item number","lmi","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Python."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-13a096d6","guard":[["hasAny",["item number","nth","pir","position","shortest","shortest one","shortest word"]],["has","programming"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Parrot Internal Representation."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-13ce7ef4","guard":[["hasAny",["item number","lgt","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Logtalk."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-173ca992","guard":[["hasAny",["csh","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Tcsh."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-18e98eec","guard":[["hasAny",["item number","nth","pls","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," PLSQL."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-19765db0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hsc","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haskell."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1a86852c","guard":[["hasAny",["chs","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds C2hs Haskell."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1e2e96f4","guard":[["hasAny",["aj","alphabetize the letters","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds AspectJ."]},["transform.sortLetters",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1efef1c4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","kts","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Kotlin."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-20f5ca65","guard":[["hasAny",["item number","ksh","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Shell."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-23c85d4d","guard":[["hasAny",["fshader","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds GLSL."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2480ce78","guard":[["hasAny",["gvy","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Groovy."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-24cfe361","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","pir","position","title case"]],["has","programming"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Parrot Internal Representation."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-251e7f70","guard":[["hasAny",["6pm","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Raku."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-284aa0ef","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ihlp","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Stata."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-28b3f7c8","guard":[["hasAny",["fth","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .fth ",{"slot":0}," ",{"slot":1}," Forth."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2c0b2485","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ts"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds TypeScript."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2cf15eb2","guard":[["hasAny",["chs","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds C2hs Haskell."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2e49b5b0","guard":[["hasAny",["hsboot","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .hs-boot ",{"slot":0}," ",{"slot":1}," Haskell."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-329b5b5e","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","wl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Mathematica."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3492ee28","guard":[["hasAny",["alphabetize the letters","fsx","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds F#."]},["transform.sortLetters",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-358cce5f","guard":[["hasAny",["clj","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Clojure."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-36cf48b2","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","ts","without vowels"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds TypeScript."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-36d36609","guard":[["hasAny",["item number","nth","position","tpl"]]],"pyramid":["render.template",{"lit":["A .tpl ",{"slot":0}," ",{"slot":1}," Smarty."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-39deb9f5","guard":[["hasAny",["aj","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds AspectJ."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3bf44dd6","guard":[["hasAny",["item number","nth","position","rktd","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Racket."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3da823a5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sce","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Scilab."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3e32799f","guard":[["hasAny",["item number","kts","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Kotlin."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3e7daf4d","guard":[["hasAny",["item number","nth","position","rl"]]],"pyramid":["render.template",{"lit":["A .rl ",{"slot":0}," ",{"slot":1}," Ragel."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-458e7487","guard":[["hasAny",["6pm","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Raku."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-478f660a","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yy"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Yacc."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-479056a5","guard":[["hasAny",["item number","lmi","nth","position"]]],"pyramid":["render.template",{"lit":["A .lmi ",{"slot":0}," ",{"slot":1}," Python."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-47b74cbe","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gvy","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Groovy."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4850d95d","guard":[["hasAny",["csh","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Tcsh."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-495de62f","guard":[["hasAny",["item number","kid","nth","position"]]],"pyramid":["render.template",{"lit":["A .kid ",{"slot":0}," ",{"slot":1}," Genshi."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4e07e3cd","guard":[["hasAny",["item number","nth","orc","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Csound."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5099b354","guard":[["hasAny",["bdy","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PLSQL."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-517e9f6a","guard":[["hasAny",["bdy","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PLSQL."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-53082f28","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fsx","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds F#."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-53c7d2b2","guard":[["hasAny",["alphabetize the letters","gvy","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Groovy."]},["transform.sortLetters",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-553183d1","guard":[["hasAny",["item number","nth","pb","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PureBasic."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5557a193","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hx","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haxe."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-57b1f0ed","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","ts"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds TypeScript."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-57e1ea44","guard":[["hasAny",["bdy","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PLSQL."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-58b5715d","guard":[["hasAny",["item number","no vowels","nth","position","pyx","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Cython."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5be64bb9","guard":[["hasAny",["aj","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds AspectJ."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5ccb47d7","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vhd"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds VHDL."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5ec12b3e","guard":[["hasAny",["invert case","item number","nth","orc","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Csound."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5f2bbcac","guard":[["hasAny",["hx","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haxe."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5f5cbcfd","guard":[["hasAny",["item number","jbuilder","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .jbuilder ",{"slot":0}," ",{"slot":1}," Ruby."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-627ef7e4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","vark"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Gosu."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-63949f65","guard":[["hasAny",["escript","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Erlang."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-65195bac","guard":[["hasAny",["item number","ksh","nth","position"]]],"pyramid":["render.template",{"lit":["A .ksh ",{"slot":0}," ",{"slot":1}," Shell."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-66b4d1d5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","chs","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds C2hs Haskell."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6864933c","guard":[["hasAny",["item number","nth","position","rbfrm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds REALbasic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6930ff9a","guard":[["hasAny",["als","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Alloy."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6c32520c","guard":[["hasAny",["als","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Alloy."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6f7e0188","guard":[["hasAny",["item number","nth","position","rl","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Ragel."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-70804ae2","guard":[["hasAny",["item number","nth","pb","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PureBasic."]},["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-711bb1ea","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","yar"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds YARA."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-73702fc1","guard":[["hasAny",["invert case","item number","nth","pir","position","swap case","toggle case"]],["has","programming"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Parrot Internal Representation."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-763f2ac9","guard":[["hasAny",["cob","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .cob ",{"slot":0}," ",{"slot":1}," COBOL."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-765443d8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","orc","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Csound."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-77dbb04e","guard":[["hasAny",["item number","nth","position","sce","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Scilab."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8287ef55","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","vhd","without vowels"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds VHDL."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-82c5faa5","guard":[["hasAny",["invert case","item number","kts","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Kotlin."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8a51cf1b","guard":[["hasAny",["item number","kid","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Genshi."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-93356585","guard":[["hasAny",["item number","nth","position","rktd","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .rktd ",{"slot":0}," ",{"slot":1}," Racket."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-94080afc","guard":[["hasAny",["item number","kts","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Kotlin."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-946c2305","guard":[["hasAny",["invert case","item number","nth","position","pyx","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Cython."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-95778231","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","pyx","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Cython."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9591bfd5","guard":[["hasAny",["invert case","item number","nth","pb","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PureBasic."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9639ead3","guard":[["hasAny",["cljx","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .cljx ",{"slot":0}," ",{"slot":1}," Clojure."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-97567927","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","ts"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds TypeScript."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-99c474cb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nomad","nth","position","title case"]],["has","programming"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds HCL."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9c45a229","guard":[["hasAny",["frx","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," VBA."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9e73bc68","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","yar"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds YARA."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a1b58cd3","guard":[["hasAny",["invert case","item number","nomad","nth","position","swap case","toggle case"]],["has","programming"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds HCL."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a2de4b7b","guard":[["hasAny",["item number","nth","position","wl"]]],"pyramid":["render.template",{"lit":["A .wl ",{"slot":0}," ",{"slot":1}," Mathematica."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a7e01fb6","guard":[["hasAny",["gvy","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Groovy."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-aa1e2eb5","guard":[["hasAny",["als","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Alloy."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-aaa0f904","guard":[["hasAny",["alphabetize the letters","item number","letters in order","nth","position","sort the letters","yy"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Yacc."]},["transform.sortLetters",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ad31a36f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","csh","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Tcsh."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ae0dc953","guard":[["hasAny",["item number","nth","position","scm"]]],"pyramid":["render.template",{"lit":["A .scm ",{"slot":0}," ",{"slot":1}," Scheme."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ae554246","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yar"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds YARA."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b27f7b27","guard":[["hasAny",["alphabetize the letters","bdy","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PLSQL."]},["transform.sortLetters",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b57bb4de","guard":[["hasAny",["chs","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds C2hs Haskell."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b833dad5","guard":[["hasAny",["item number","nth","position","scm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Scheme."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c2df2f9b","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","vark"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Gosu."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c418a1c7","guard":[["hasAny",["alphabetize the letters","hx","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haxe."]},["transform.sortLetters",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c50634b5","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","yy"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Yacc."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c564254c","guard":[["hasAny",["item number","jl","nth","position"]]],"pyramid":["render.template",{"lit":["A .jl ",{"slot":0}," ",{"slot":1}," Julia."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c5e99a17","guard":[["hasAny",["escript","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .escript ",{"slot":0}," ",{"slot":1}," Erlang."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c820970f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","pb","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PureBasic."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ce44d924","guard":[["hasAny",["bdy","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PLSQL."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cfa6d83b","guard":[["hasAny",["hsboot","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .hs-boot ",{"slot":0}," ",{"slot":1}," Haskell."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d06358fb","guard":[["hasAny",["item number","no vowels","nth","pb","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PureBasic."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d0716b43","guard":[["hasAny",["item number","nth","position","pyx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Cython."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d147d043","guard":[["hasAny",["hsc","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haskell."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d1a6a59e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","vhd"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds VHDL."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d23b665b","guard":[["hasAny",["alphabetize the letters","chs","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds C2hs Haskell."]},["transform.sortLetters",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d4514f0f","guard":[["hasAny",["item number","nth","podspec","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .podspec ",{"slot":0}," ",{"slot":1}," Ruby."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d502fe2a","guard":[["hasAny",["aj","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds AspectJ."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d6e5d0e3","guard":[["hasAny",["hx","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haxe."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dbec1002","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ts"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds TypeScript."]},["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dcb95ca8","guard":[["hasAny",["cob","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," COBOL."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dcea3ba7","guard":[["hasAny",["invert case","item number","nth","position","sce","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Scilab."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dcf08185","guard":[["hasAny",["item number","lgt","nth","position"]]],"pyramid":["render.template",{"lit":["A .lgt ",{"slot":0}," ",{"slot":1}," Logtalk."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e2904e0b","guard":[["hasAny",["capnp","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Cap'n Proto."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e2a65680","guard":[["hasAny",["item number","nth","pls","position"]]],"pyramid":["render.template",{"lit":["A .pls ",{"slot":0}," ",{"slot":1}," PLSQL."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e43518ed","guard":[["hasAny",["item number","no vowels","nth","position","remove vowels","without vowels","yy"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Yacc."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e461d938","guard":[["hasAny",["fsx","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds F#."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e56c3cf4","guard":[["hasAny",["hx","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haxe."]},["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e90f30e2","guard":[["hasAny",["capnp","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .capnp ",{"slot":0}," ",{"slot":1}," Cap'n Proto."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e96d6c90","guard":[["hasAny",["hsc","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haskell."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ea8de573","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","yy"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Yacc."]},["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ea9070f5","guard":[["hasAny",["fshader","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .fshader ",{"slot":0}," ",{"slot":1}," GLSL."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-eeb48811","guard":[["hasAny",["fsx","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds F#."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f047331d","guard":[["hasAny",["ihlp","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Stata."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f0eaed0e","guard":[["hasAny",["aj","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds AspectJ."]},["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f27ed1a5","guard":[["hasAny",["item number","jl","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Julia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f43ed0ea","guard":[["hasAny",["6pm","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Raku."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f8c5f2e0","guard":[["hasAny",["bi","item number","nth","position"]],["has","a"]],"pyramid":["render.template",{"lit":["A .bi ",{"slot":0}," ",{"slot":1}," FreeBasic."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fa54ad32","guard":[["hasAny",["item number","nth","ny","position"]],["has","a"]],"pyramid":["render.template",{"lit":["A .ny ",{"slot":0}," ",{"slot":1}," Common Lisp."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fa721550","guard":[["hasAny",["hx","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haxe."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fb943c24","guard":[["hasAny",["csh","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Tcsh."]},["transform.noVowels",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fd41b962","guard":[["hasAny",["fsx","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds F#."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ff119fb4","guard":[["hasAny",["asy","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Asymptote."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ff51f7c9","guard":[["hasAny",["alphabetize the letters","als","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Alloy."]},["transform.sortLetters",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-01cc3fec","guard":[["hasAny",["hsboot","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .hs-boot ",{"slot":0}," ",{"slot":1}," Haskell."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-02a157da","guard":[["hasAny",["each word","item number","kts","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Kotlin."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-05d57bc0","guard":[["hasAny",["als","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Alloy."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0667332d","guard":[["hasAny",["each word","item number","nth","position","split into words","vark"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Gosu."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0af1cf42","guard":[["hasAny",["fshader","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," GLSL."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0b6852a9","guard":[["hasAny",["each word","gvy","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Groovy."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0c5902cf","guard":[["hasAny",["each word","item number","nth","position","split into words","yar"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds YARA."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1218f1cc","guard":[["hasAny",["each word","item number","nth","position","pyx","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Cython."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1699fb34","guard":[["hasAny",["csh","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Tcsh."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-16bfd755","guard":[["hasAny",["each word","ihlp","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Stata."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-187550cf","guard":[["hasAny",["each word","gvy","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Groovy."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1a179f56","guard":[["hasAny",["each word","item number","nth","position","split into words","ts"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds TypeScript."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1f414300","guard":[["hasAny",["each word","item number","nomad","nth","position","split into words"]],["has","programming"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds HCL."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2f1532b2","guard":[["hasAny",["each word","item number","nth","position","split into words","vhd"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds VHDL."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3480b7c6","guard":[["hasAny",["each word","item number","nth","orc","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Csound."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-401cee3b","guard":[["hasAny",["capnp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Cap'n Proto."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4d030ce5","guard":[["hasAny",["each word","item number","nth","pb","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PureBasic."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4d386211","guard":[["hasAny",["csh","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Tcsh."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-52823491","guard":[["hasAny",["hsboot","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .hs-boot ",{"slot":0}," ",{"slot":1}," Haskell."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-55e45105","guard":[["hasAny",["each word","hsc","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haskell."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-57fd8df4","guard":[["hasAny",["chs","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds C2hs Haskell."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-63fa4363","guard":[["hasAny",["each word","item number","nth","orc","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Csound."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-64da23d3","guard":[["hasAny",["each word","item number","nth","position","sce","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Scilab."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-66fdc59d","guard":[["hasAny",["each word","item number","kts","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Kotlin."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-67cea11e","guard":[["hasAny",["each word","item number","nth","pir","position","split into words"]],["has","programming"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Parrot Internal Representation."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-67e7a5ae","guard":[["hasAny",["each word","item number","nomad","nth","position","split into words"]],["has","programming"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds HCL."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-69c54c85","guard":[["hasAny",["item number","nth","position","rbfrm"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," REALbasic."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6b28c3c2","guard":[["hasAny",["als","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Alloy."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-71a325df","guard":[["hasAny",["asy","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Asymptote."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-71b708ff","guard":[["hasAny",["6pm","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Raku."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-74733b1f","guard":[["hasAny",["bdy","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PLSQL."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-751b5c01","guard":[["hasAny",["each word","item number","nth","position","sce","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Scilab."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7c4ae4d4","guard":[["hasAny",["each word","item number","nth","position","split into words","ts"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds TypeScript."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-89df7f84","guard":[["hasAny",["each word","item number","nth","position","split into words","vark"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Gosu."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8bf07680","guard":[["hasAny",["each word","hx","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haxe."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-905a93c3","guard":[["hasAny",["each word","item number","nth","position","split into words","vhd"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds VHDL."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a192cd83","guard":[["hasAny",["asy","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Asymptote."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a57f9eba","guard":[["hasAny",["each word","hx","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haxe."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-aba67ed6","guard":[["hasAny",["6pm","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Raku."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-acf6eb89","guard":[["hasAny",["each word","item number","nth","pb","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PureBasic."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ad69b247","guard":[["hasAny",["bdy","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds PLSQL."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-af450804","guard":[["hasAny",["each word","hsc","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Haskell."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b088e491","guard":[["hasAny",["each word","item number","nth","position","split into words","yy"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Yacc."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b384025e","guard":[["hasAny",["each word","fsx","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds F#."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b5b75705","guard":[["hasAny",["each word","ihlp","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Stata."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b9c99950","guard":[["hasAny",["each word","fsx","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds F#."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bf9d8e3e","guard":[["hasAny",["aj","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds AspectJ."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-caa069b2","guard":[["hasAny",["aj","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds AspectJ."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cbd81fba","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hsboot","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .hs-boot ",{"slot":0}," ",{"slot":1}," Haskell."]},["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d3b37671","guard":[["hasAny",["item number","nth","position","rktd"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Racket."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d613563b","guard":[["hasAny",["each word","item number","nth","position","split into words","yy"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Yacc."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e12524fa","guard":[["hasAny",["each word","item number","nth","pir","position","split into words"]],["has","programming"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Parrot Internal Representation."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ea04cef2","guard":[["hasAny",["each word","item number","nth","position","pyx","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds Cython."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f70bef08","guard":[["hasAny",["escript","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," file ",{"slot":1}," Erlang."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f9c8c4c8","guard":[["hasAny",["chs","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds C2hs Haskell."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fbe29eed","guard":[["hasAny",["each word","item number","nth","position","split into words","yar"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," holds YARA."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-15128a5f","guard":[["hasAny",["each word","hsboot","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .hs-boot ",{"slot":0}," ",{"slot":1}," Haskell."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-21f5a9f7","guard":[["hasAny",["item number","lmi","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Python."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-38ac6cb8","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","wl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Mathematica."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3e8558a4","guard":[["hasAny",["item number","nth","position","scm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Scheme."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4a0e0221","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tpl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Smarty."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4bc10222","guard":[["hasAny",["bi","item number","nth","position","shortest","shortest one","shortest word"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," FreeBasic."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-667292cd","guard":[["hasAny",["item number","jl","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Julia."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-75793340","guard":[["hasAny",["item number","nth","position","rl","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ragel."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-81830c4a","guard":[["hasAny",["item number","nth","ny","position","shortest","shortest one","shortest word"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Common Lisp."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-85cc6c00","guard":[["hasAny",["item number","nth","pls","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," PLSQL."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8e7c6b3f","guard":[["hasAny",["fth","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Forth."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b1b5dfc8","guard":[["hasAny",["item number","kid","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Genshi."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c58350e0","guard":[["hasAny",["each word","hsboot","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .hs-boot ",{"slot":0}," ",{"slot":1}," Haskell."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cc6677bf","guard":[["hasAny",["item number","ksh","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Shell."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ccea6d23","guard":[["hasAny",["cob","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," COBOL."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dabb4d42","guard":[["hasAny",["first n","hsboot","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":["A .hs-boot ",{"slot":0}," ",{"slot":1}," Haskell."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-eb723a30","guard":[["hasAny",["frx","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," VBA."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-eece0905","guard":[["hasAny",["first n","hsboot","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":["A .hs-boot ",{"slot":0}," ",{"slot":1}," Haskell."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fcf46536","guard":[["hasAny",["item number","lgt","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Logtalk."]},["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-029f337b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","ksh","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Shell."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-068ea563","guard":[["hasAny",["cob","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," COBOL."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0dfc840f","guard":[["hasAny",["item number","nth","position","rktd"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Racket."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0ee2ec30","guard":[["hasAny",["fth","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Forth."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-17387100","guard":[["hasAny",["item number","nth","ny","position"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Common Lisp."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-17454ce9","guard":[["hasAny",["frx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," VBA."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1d1bb926","guard":[["hasAny",["invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case","tpl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Smarty."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1d46229f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cob","item number","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," COBOL."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1e4d306c","guard":[["hasAny",["capnp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Cap'n Proto."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1efefa3a","guard":[["hasAny",["item number","nth","position","rl","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ragel."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1fe00605","guard":[["hasAny",["item number","ksh","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Shell."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-20f0bb00","guard":[["hasAny",["item number","kid","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Genshi."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-23690635","guard":[["hasAny",["item number","nth","position","rl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ragel."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2541643c","guard":[["hasAny",["fth","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Forth."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2e90042d","guard":[["hasAny",["cob","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," COBOL."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-328f5f15","guard":[["hasAny",["item number","nth","position","rbfrm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," REALbasic."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-34f00918","guard":[["hasAny",["item number","nth","position","tpl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Smarty."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3829dd8e","guard":[["hasAny",["item number","lmi","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Python."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3b63d4f5","guard":[["hasAny",["capnp","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Cap'n Proto."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-400e541b","guard":[["hasAny",["cob","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," COBOL."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-420093f3","guard":[["hasAny",["fshader","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," GLSL."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-42f65eb2","guard":[["hasAny",["item number","nth","position","wl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Mathematica."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4506230c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","ny","position","shortest","shortest one","shortest word","title case"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Common Lisp."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4611c50c","guard":[["hasAny",["item number","nth","position","tpl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Smarty."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4a6f8fa3","guard":[["hasAny",["fshader","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," GLSL."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4b5dc541","guard":[["hasAny",["invert case","item number","lmi","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Python."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4c941f1c","guard":[["hasAny",["item number","nth","pls","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," PLSQL."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4d7f4283","guard":[["hasAny",["bi","item number","nth","position"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," FreeBasic."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-56c05601","guard":[["hasAny",["invert case","item number","nth","ny","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Common Lisp."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-57606521","guard":[["hasAny",["item number","nth","position","rl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ragel."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-58a8b8fc","guard":[["hasAny",["item number","nth","position","wl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Mathematica."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5907e6c8","guard":[["hasAny",["item number","jl","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Julia."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5b48f86c","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tpl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Smarty."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5e8de9f6","guard":[["hasAny",["item number","lmi","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Python."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-62379ecd","guard":[["hasAny",["item number","lgt","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Logtalk."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-661b3201","guard":[["hasAny",["fth","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Forth."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-688dbfe4","guard":[["hasAny",["item number","lmi","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Python."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-695b4288","guard":[["hasAny",["invert case","item number","nth","pls","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," PLSQL."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-723f0317","guard":[["hasAny",["item number","ksh","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Shell."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7770c7c7","guard":[["hasAny",["invert case","item number","kid","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Genshi."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-79eecd61","guard":[["hasAny",["invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case","wl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Mathematica."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7cd7e14e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","shortest","shortest one","shortest word","title case","tpl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Smarty."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7eacb15a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","lmi","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Python."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-80da80d7","guard":[["hasAny",["invert case","item number","ksh","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Shell."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8b4ff7a9","guard":[["hasAny",["bi","item number","nth","position","shortest","shortest one","shortest word"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," FreeBasic."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-92fba516","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","lgt","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Logtalk."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-93446fe0","guard":[["hasAny",["bi","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," FreeBasic."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-948c98e5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","frx","item number","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," VBA."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-96967031","guard":[["hasAny",["item number","nth","pls","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," PLSQL."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a095281a","guard":[["hasAny",["cob","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," COBOL."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a2a6dfc6","guard":[["hasAny",["item number","nth","ny","position"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Common Lisp."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a3a2e5d5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","scm","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Scheme."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a3fe1ee5","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","wl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Mathematica."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a6567898","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","jl","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Julia."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a658f661","guard":[["hasAny",["fshader","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," GLSL."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a750195b","guard":[["hasAny",["item number","nth","position","scm"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Scheme."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a8d11923","guard":[["hasAny",["escript","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Erlang."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a9a221c8","guard":[["hasAny",["item number","kid","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Genshi."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b2cc60fe","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","rl","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ragel."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c495bf99","guard":[["hasAny",["item number","kid","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Genshi."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c6cb030b","guard":[["hasAny",["invert case","item number","jl","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Julia."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c74cc970","guard":[["hasAny",["invert case","item number","nth","position","scm","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Scheme."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c82a5de6","guard":[["hasAny",["item number","nth","pls","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," PLSQL."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c89e2ab7","guard":[["hasAny",["item number","lgt","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Logtalk."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ccc67210","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","shortest","shortest one","shortest word","title case","wl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Mathematica."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d105ccd7","guard":[["hasAny",["invert case","item number","nth","position","rl","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ragel."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d1d2a0c1","guard":[["hasAny",["bi","capitalise","capitalize","capitalize each word","item number","nth","position","shortest","shortest one","shortest word","title case"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," FreeBasic."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d2363126","guard":[["hasAny",["frx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," VBA."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d6ec80ba","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fth","item number","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Forth."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d79db603","guard":[["hasAny",["capnp","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Cap'n Proto."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d82f78bb","guard":[["hasAny",["fth","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Forth."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dbec9694","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","pls","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," PLSQL."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dd52819a","guard":[["hasAny",["invert case","item number","lgt","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Logtalk."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dde4a8be","guard":[["hasAny",["frx","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," VBA."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-de16ca4d","guard":[["hasAny",["item number","nth","position","rbfrm"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," REALbasic."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-de6a345a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","kid","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Genshi."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-defd8964","guard":[["hasAny",["item number","nth","position","scm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Scheme."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e3b6e28f","guard":[["hasAny",["escript","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Erlang."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e8e64198","guard":[["hasAny",["item number","nth","ny","position","shortest","shortest one","shortest word"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Common Lisp."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ee201d33","guard":[["hasAny",["frx","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," VBA."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f0f513af","guard":[["hasAny",["item number","jl","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Julia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f19527cd","guard":[["hasAny",["item number","nth","position","scm"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Scheme."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f1985606","guard":[["hasAny",["item number","jl","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Julia."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f4539027","guard":[["hasAny",["item number","ksh","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Shell."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f90643d2","guard":[["hasAny",["item number","nth","position","rktd","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Racket."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f9ae6a8b","guard":[["hasAny",["escript","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Erlang."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fac81303","guard":[["hasAny",["item number","nth","position","rbfrm","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," REALbasic."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fca26036","guard":[["hasAny",["bi","item number","nth","position"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," FreeBasic."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ff58167c","guard":[["hasAny",["item number","nth","position","rktd","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Racket."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ffb75f2e","guard":[["hasAny",["item number","lgt","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Logtalk."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-013ff9a8","guard":[["hasAny",["first n","frx","item number","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," VBA."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0255cd76","guard":[["hasAny",["cob","each word","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," COBOL."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0d2b28ae","guard":[["hasAny",["each word","frx","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," VBA."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0e3e344d","guard":[["hasAny",["invert case","item number","nth","position","rktd","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Racket."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-174792ba","guard":[["hasAny",["each word","item number","jl","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Julia."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1a33d205","guard":[["hasAny",["each word","item number","nth","position","scm","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Scheme."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-25232fac","guard":[["hasAny",["cob","each word","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," COBOL."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-25daa3fc","guard":[["hasAny",["first n","item number","lmi","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Python."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2843f71a","guard":[["hasAny",["bi","each word","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," FreeBasic."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-355e135f","guard":[["hasAny",["first n","item number","nth","position","shortest","shortest one","shortest word","take","wl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Mathematica."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-35e46154","guard":[["hasAny",["each word","item number","nth","position","shortest","shortest one","shortest word","split into words","wl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Mathematica."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-36f1a17e","guard":[["hasAny",["each word","item number","lgt","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Logtalk."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-39f22e74","guard":[["hasAny",["bi","each word","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," FreeBasic."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-40c086b9","guard":[["hasAny",["escript","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Erlang."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-417818d4","guard":[["hasAny",["each word","item number","ksh","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Shell."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-42219fea","guard":[["hasAny",["first n","item number","nth","pls","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," PLSQL."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4482b695","guard":[["hasAny",["first n","item number","nth","position","scm","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Scheme."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-44b476a3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fshader","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," GLSL."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4a3a06de","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","rbfrm","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," REALbasic."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4cca7685","guard":[["hasAny",["each word","item number","lmi","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Python."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-52af2bd2","guard":[["hasAny",["capnp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Cap'n Proto."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5321a212","guard":[["hasAny",["first n","item number","kid","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Genshi."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5354df5a","guard":[["hasAny",["first n","item number","nth","position","shortest","shortest one","shortest word","take","tpl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Smarty."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5db42afa","guard":[["hasAny",["each word","item number","nth","position","shortest","shortest one","shortest word","split into words","tpl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Smarty."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-60b5b1a5","guard":[["hasAny",["each word","item number","nth","position","scm","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Scheme."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-62ce7e14","guard":[["hasAny",["first n","item number","nth","position","shortest","shortest one","shortest word","take","tpl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Smarty."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-667da4ca","guard":[["hasAny",["first n","item number","nth","pls","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," PLSQL."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-66cbafdb","guard":[["hasAny",["first n","item number","nth","position","rl","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ragel."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-68e25ff3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","capnp","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Cap'n Proto."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6d8922a4","guard":[["hasAny",["cob","first n","item number","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," COBOL."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7472b0a0","guard":[["hasAny",["each word","fth","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Forth."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7b5b489c","guard":[["hasAny",["first n","item number","kid","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Genshi."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7e2c812c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","rktd","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Racket."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-812b7267","guard":[["hasAny",["each word","item number","kid","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Genshi."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8ede4354","guard":[["hasAny",["fshader","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," GLSL."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-91837f0e","guard":[["hasAny",["each word","item number","nth","position","rl","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ragel."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9237ab0e","guard":[["hasAny",["first n","item number","ksh","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Shell."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-947b8bc2","guard":[["hasAny",["item number","nth","position","rktd"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Racket."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-94bee196","guard":[["hasAny",["each word","item number","nth","pls","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," PLSQL."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-97aeb82a","guard":[["hasAny",["each word","item number","nth","position","shortest","shortest one","shortest word","split into words","tpl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Smarty."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-98dba512","guard":[["hasAny",["first n","fth","item number","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Forth."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9cdf21d6","guard":[["hasAny",["capnp","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Cap'n Proto."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9d272b88","guard":[["hasAny",["each word","item number","nth","position","shortest","shortest one","shortest word","split into words","wl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Mathematica."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9f756dca","guard":[["hasAny",["each word","item number","nth","pls","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," PLSQL."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a014e8d9","guard":[["hasAny",["each word","frx","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," VBA."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a0cbc66d","guard":[["hasAny",["each word","item number","lmi","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Python."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ac28a3ea","guard":[["hasAny",["each word","item number","jl","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Julia."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-acc7b878","guard":[["hasAny",["first n","item number","nth","position","rl","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ragel."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-adeba973","guard":[["hasAny",["cob","first n","item number","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," COBOL."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ae311559","guard":[["hasAny",["first n","frx","item number","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," VBA."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b076e173","guard":[["hasAny",["item number","nth","position","rbfrm"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," REALbasic."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b159ac67","guard":[["hasAny",["each word","item number","nth","ny","position","shortest","shortest one","shortest word","split into words"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Common Lisp."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b6f42c75","guard":[["hasAny",["first n","item number","jl","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Julia."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ba277bcc","guard":[["hasAny",["bi","first n","item number","nth","position","shortest","shortest one","shortest word","take"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," FreeBasic."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bb3c5bd5","guard":[["hasAny",["invert case","item number","nth","position","rbfrm","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," REALbasic."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bdef47c4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","escript","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Erlang."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bee1e26e","guard":[["hasAny",["first n","item number","nth","position","scm","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Scheme."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c0125dce","guard":[["hasAny",["each word","item number","ksh","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Shell."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c63da193","guard":[["hasAny",["first n","item number","nth","ny","position","shortest","shortest one","shortest word","take"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Common Lisp."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c716eb67","guard":[["hasAny",["escript","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Erlang."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cf59a0e1","guard":[["hasAny",["first n","item number","nth","position","shortest","shortest one","shortest word","take","wl"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Mathematica."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d084533a","guard":[["hasAny",["each word","item number","lgt","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Logtalk."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d34b5abf","guard":[["hasAny",["fshader","item number","nth","position"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," GLSL."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-df0caef1","guard":[["hasAny",["first n","item number","lgt","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Logtalk."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e130dc48","guard":[["hasAny",["first n","item number","lmi","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Python."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e13fb142","guard":[["hasAny",["each word","item number","kid","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Genshi."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e8b202b3","guard":[["hasAny",["first n","item number","nth","ny","position","shortest","shortest one","shortest word","take"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Common Lisp."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ef15cd35","guard":[["hasAny",["first n","item number","ksh","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Shell."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f46f4e43","guard":[["hasAny",["each word","fth","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Forth."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f4f8aab2","guard":[["hasAny",["each word","item number","nth","position","rl","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Ragel."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f793e257","guard":[["hasAny",["bi","first n","item number","nth","position","shortest","shortest one","shortest word","take"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," FreeBasic."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f80c77c6","guard":[["hasAny",["first n","fth","item number","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Forth."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fa1643cd","guard":[["hasAny",["each word","item number","nth","ny","position","shortest","shortest one","shortest word","split into words"]],["has","a"]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Common Lisp."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fac49e21","guard":[["hasAny",["first n","item number","jl","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Julia."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fcf80f55","guard":[["hasAny",["first n","item number","lgt","nth","position","shortest","shortest one","shortest word","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Logtalk."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0f8b0127","guard":[["hasAny",["capnp","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Cap'n Proto."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-13883dc6","guard":[["hasAny",["each word","fshader","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," GLSL."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-31f9c049","guard":[["hasAny",["capnp","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Cap'n Proto."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4358fd38","guard":[["hasAny",["each word","item number","nth","position","rktd","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Racket."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-48ee77a2","guard":[["hasAny",["first n","item number","nth","position","rktd","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Racket."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-514d4ba9","guard":[["hasAny",["escript","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Erlang."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-668eec9c","guard":[["hasAny",["capnp","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Cap'n Proto."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6cc8b72e","guard":[["hasAny",["each word","item number","nth","position","rbfrm","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," REALbasic."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6f17eb66","guard":[["hasAny",["first n","fshader","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," GLSL."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8beec0af","guard":[["hasAny",["first n","item number","nth","position","rktd","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Racket."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9fccfff0","guard":[["hasAny",["each word","fshader","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," GLSL."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-aa3e3987","guard":[["hasAny",["each word","item number","nth","position","rktd","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Racket."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bd5401d4","guard":[["hasAny",["each word","escript","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Erlang."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d3fe7b63","guard":[["hasAny",["capnp","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Cap'n Proto."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d5807c3c","guard":[["hasAny",["first n","fshader","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," GLSL."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d6aed2d0","guard":[["hasAny",["first n","item number","nth","position","rbfrm","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," REALbasic."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e07f1242","guard":[["hasAny",["each word","escript","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Erlang."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ed744826","guard":[["hasAny",["first n","item number","nth","position","rbfrm","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," REALbasic."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f6291f90","guard":[["hasAny",["each word","item number","nth","position","rbfrm","split into words"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," REALbasic."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f683be0f","guard":[["hasAny",["escript","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":["A .",{"slot":0}," ",{"slot":1}," ",{"slot":2}," Erlang."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the language of .ahkl files","expect":{"contains":["AutoHotkey"],"notRefusal":true}},{"q":"name the language of .urs files","expect":{"contains":["UrWeb"],"notRefusal":true}},{"q":"a file ending in .lmi holds which language","expect":{"contains":["Python"],"notRefusal":true}},{"q":"which programming language uses the file extension .hsc","expect":{"contains":["Haskell"],"notRefusal":true}},{"q":"name the language of .cc files","expect":{"contains":["C++"],"notRefusal":true}},{"q":"name the language of .zs files","expect":{"contains":["ZenScript"],"notRefusal":true}},{"q":"name the language of .scpt files","expect":{"contains":["AppleScript"],"notRefusal":true}},{"q":"a file ending in .cljx holds which language","expect":{"contains":["Clojure"],"notRefusal":true}},{"q":"name the language of .mkfile files","expect":{"contains":["Makefile"],"notRefusal":true}},{"q":"which programming language uses the file extension .sce","expect":{"contains":["Scilab"],"notRefusal":true}},{"q":"which programming language uses the file extension .orc","expect":{"contains":["Csound"],"notRefusal":true}},{"q":"a file ending in .rbfrm holds which language","expect":{"contains":["REALbasic"],"notRefusal":true}},{"q":"which programming language uses the file extension .asy","expect":{"contains":["Asymptote"],"notRefusal":true}},{"q":"a file ending in .bi holds which language","expect":{"contains":["FreeBasic"],"notRefusal":true}},{"q":"name the language of .ik files","expect":{"contains":["Ioke"],"notRefusal":true}},{"q":"name the language of .wlt files","expect":{"contains":["Mathematica"],"notRefusal":true}},{"q":"which programming language uses the file extension .6pm","expect":{"contains":["Raku"],"notRefusal":true}},{"q":"name the language of .py files","expect":{"contains":["Python"],"notRefusal":true}},{"q":"a file ending in .tpl holds which language","expect":{"contains":["Smarty"],"notRefusal":true}},{"q":"name the language of .lvproj files","expect":{"contains":["LabVIEW"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
