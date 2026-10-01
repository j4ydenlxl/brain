// nasdaq-company-symbol-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"nasdaq-company-symbol-neo-g6","class":"nasdaq-company-symbol","generation":6,"lane":"neo","grownFrom":["what is the Nasdaq symbol of Kingsoft Cloud Holdings Limited","which symbol does Nomad Power Solutions, Inc. list under","what is the Nasdaq symbol of Coffee Holding Co., Inc.","give the ticker of U.S. Gold Corp.","what is the Nasdaq symbol of ArrowMark Financial Corp.","what is the Nasdaq symbol of ArcBest Corporation","which symbol does Avalanche Treasury Corporation list under","give the ticker of CB Financial Services, Inc.","what is the Nasdaq symbol of Prime Medicine, Inc.","give the ticker of EDAP TMS S.A.","what is the Nasdaq symbol of Baosheng Media Group Holdings Limited","what is the Nasdaq symbol of Stewards Inc","which symbol does Pliant Therapeutics, Inc. list under","give the ticker of BioRestorative Therapies, Inc.","what is the Nasdaq symbol of PMA Graphene Technology Group Inc.","which symbol does Cisco Systems, Inc. list under","what is the Nasdaq symbol of AnaptysBio, Inc.","what is the Nasdaq symbol of Marten Transport, Ltd.","what is the Nasdaq symbol of My Size, Inc.","give the ticker of National Beverage Corp."],"version":1});

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
{"id":"n-cd3115ab","guard":[["hasAny",["symbol","ticker"]],["not",["has","blackstone"]],["not",["has","rollins"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Kingsoft Cloud Holdings Limited":"KC","which symbol does Nomad Power Solutions, Inc. list under":"NMAD","what is the Nasdaq symbol of Coffee Holding Co., Inc.":"JVA","give the ticker of U.S. Gold Corp.":"USAU","what is the Nasdaq symbol of ArrowMark Financial Corp.":"BANX","what is the Nasdaq symbol of ArcBest Corporation":"ARCB","which symbol does Avalanche Treasury Corporation list under":"AVAT","give the ticker of CB Financial Services, Inc.":"CBFV","what is the Nasdaq symbol of Prime Medicine, Inc.":"PRME","give the ticker of EDAP TMS S.A.":"FOCL","what is the Nasdaq symbol of Baosheng Media Group Holdings Limited":"BAOS","what is the Nasdaq symbol of Stewards Inc":"SWRD","which symbol does Pliant Therapeutics, Inc. list under":"PLRX","give the ticker of BioRestorative Therapies, Inc.":"BRTX","what is the Nasdaq symbol of PMA Graphene Technology Group Inc.":"PMA","which symbol does Cisco Systems, Inc. list under":"CSCO","what is the Nasdaq symbol of AnaptysBio, Inc.":"ANAB","what is the Nasdaq symbol of Marten Transport, Ltd.":"MRTN","what is the Nasdaq symbol of My Size, Inc.":"MYSZ","give the ticker of National Beverage Corp.":"FIZZ","give the ticker of Star Holdings":"STHO","give the ticker of BlackLine, Inc.":"BL","which symbol does Curanex Pharmaceuticals Inc list under":"CURX","give the ticker of Ostin Technology Group Co., Ltd.":"OST","what is the Nasdaq symbol of Alarum Technologies Ltd.":"ALAR","what is the Nasdaq symbol of PRF Technologies Ltd.":"PRFX","give the ticker of Wynn Resorts, Limited":"WYNN","give the ticker of BranchOut Food Inc.":"BOF","give the ticker of Royalty Pharma plc":"RPRX","give the ticker of CryoPort, Inc.":"CYRX","which symbol does Intellicheck, Inc. list under":"IDN","what is the Nasdaq symbol of IBEX Limited":"IBEX","give the ticker of Willis Towers Watson Public Limited Company":"WTW","which symbol does ZoomInfo Technologies Inc. list under":"GTM","which symbol does Lixiang Education Holding Co., Ltd. list under":"LXEH","which symbol does GBank Financial Holdings Inc. list under":"GBFH","what is the Nasdaq symbol of EquipmentShare.com Inc":"EQPT","what is the Nasdaq symbol of Innventure, Inc.":"INV","which symbol does LexinFintech Holdings Ltd. list under":"LX","what is the Nasdaq symbol of Astrana Health Inc.":"ASTH","what is the Nasdaq symbol of CrowdStrike Holdings, Inc.":"CRWD","which symbol does Itron, Inc. list under":"ITRI","what is the Nasdaq symbol of Ituran Location and Control Ltd.":"ITRN","which symbol does Intercure Ltd. list under":"INCR","which symbol does Oruka Therapeutics, Inc. list under":"ORKA","which symbol does Praxis Precision Medicines, Inc. list under":"PRAX","give the ticker of Siebert Financial Corp.":"SIEB","which symbol does Paylocity Holding Corporation list under":"PCTY","which symbol does Fennec Pharmaceuticals Inc. list under":"FENC","give the ticker of Verra Mobility Corporation":"VRRM","what is the Nasdaq symbol of BrenX Ltd.":"BRNX","give the ticker of Innovative Solutions and Support, Inc.":"IA","which symbol does Entrada Therapeutics, Inc. list under":"TRDA","which symbol does Ionis Pharmaceuticals, Inc. list under":"IONS","which symbol does CytoMed Therapeutics Limited list under":"GDTC","what is the Nasdaq symbol of ALPS Group Inc":"ALPS","give the ticker of Kolibri Global Energy Inc.":"KGEI","which symbol does Processa Pharmaceuticals, Inc. list under":"PCSA","give the ticker of Perion Network Ltd":"PERI","give the ticker of United Bankshares, Inc.":"UBSI","which symbol does HF Foods Group Inc. list under":"HFFG","give the ticker of eToro Group Ltd.":"ETOR","what is the Nasdaq symbol of Baiya International Group Inc.":"BIYA","what is the Nasdaq symbol of SWK Holdings Corporation":"SWKHL","give the ticker of Alamar Biosciences, Inc.":"ALMR","give the ticker of ARKO Corp.":"ARKO","which symbol does ZW Data Action Technologies Inc. list under":"CNET","which symbol does DocuSign, Inc. list under":"DOCU","give the ticker of Icon Energy Corp.":"ICON","give the ticker of Candel Therapeutics, Inc.":"CADL","which symbol does NBT Bancorp Inc. list under":"NBTB","give the ticker of Ceragon Networks Ltd.":"CRNT","what is the Nasdaq symbol of Fidelity D & D Bancorp, Inc.":"FDBC","which symbol does Investar Holding Corporation list under":"ISTR","give the ticker of Entegris, Inc.":"ENTG","give the ticker of Union Bankshares, Inc.":"UNB","which symbol does Reynolds Consumer Products Inc. list under":"REYN","give the ticker of Dogwood Therapeutics, Inc.":"DWTX","give the ticker of Mammoth Energy Services, Inc.":"TUSK","what is the Nasdaq symbol of Littelfuse, Inc.":"LFUS","what is the Nasdaq symbol of Change Agents Corporation":"CHGA","give the ticker of U.S. GoldMining Inc.":"USGO","what is the Nasdaq symbol of Biogen Inc.":"BIIB","give the ticker of Meridian Holdings Inc.":"MRDN","which symbol does Passage Bio, Inc. list under":"PASG","what is the Nasdaq symbol of ACI Worldwide, Inc.":"ACIW","what is the Nasdaq symbol of Kratos Defense & Security Solutions, Inc.":"KTOS","what is the Nasdaq symbol of Vera Therapeutics, Inc.":"VERA","which symbol does J. W. Mays, Inc. list under":"MAYS","give the ticker of Quantum Cyber N.V.":"QUCY","which symbol does Dorman Products, Inc. list under":"DORM","which symbol does Jefferson Capital, Inc. list under":"JCAP","what is the Nasdaq symbol of Viant Technology Inc.":"DSP","which symbol does BayCom Corp list under":"BCML","give the ticker of ACM Research, Inc.":"ACMR","which symbol does BridgeBio Pharma, Inc. list under":"BBIO","what is the Nasdaq symbol of Inflection Point Acquisition Corp. VIII":"IPHXU","what is the Nasdaq symbol of Collective Mining Ltd.":"CNL","which symbol does Veru Inc. list under":"VERU","what is the Nasdaq symbol of Enliven Therapeutics, Inc.":"ELVN"}}},
{"id":"n-fc47197e","guard":[["hasAny",["symbol","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Kingsoft Cloud Holdings Limited":"KC","which symbol does Nomad Power Solutions, Inc. list under":"NMAD","what is the Nasdaq symbol of Coffee Holding Co., Inc.":"JVA","give the ticker of U.S. Gold Corp.":"USAU","what is the Nasdaq symbol of ArrowMark Financial Corp.":"BANX","what is the Nasdaq symbol of ArcBest Corporation":"ARCB","which symbol does Avalanche Treasury Corporation list under":"AVAT","give the ticker of CB Financial Services, Inc.":"CBFV","what is the Nasdaq symbol of Prime Medicine, Inc.":"PRME","give the ticker of EDAP TMS S.A.":"FOCL","what is the Nasdaq symbol of Baosheng Media Group Holdings Limited":"BAOS","what is the Nasdaq symbol of Stewards Inc":"SWRD","which symbol does Pliant Therapeutics, Inc. list under":"PLRX","give the ticker of BioRestorative Therapies, Inc.":"BRTX","what is the Nasdaq symbol of PMA Graphene Technology Group Inc.":"PMA","which symbol does Cisco Systems, Inc. list under":"CSCO","what is the Nasdaq symbol of AnaptysBio, Inc.":"ANAB","what is the Nasdaq symbol of Marten Transport, Ltd.":"MRTN","what is the Nasdaq symbol of My Size, Inc.":"MYSZ","give the ticker of National Beverage Corp.":"FIZZ","give the ticker of Star Holdings":"STHO","give the ticker of BlackLine, Inc.":"BL","which symbol does Curanex Pharmaceuticals Inc list under":"CURX","give the ticker of Ostin Technology Group Co., Ltd.":"OST","what is the Nasdaq symbol of Alarum Technologies Ltd.":"ALAR","what is the Nasdaq symbol of PRF Technologies Ltd.":"PRFX","give the ticker of Wynn Resorts, Limited":"WYNN","give the ticker of BranchOut Food Inc.":"BOF","give the ticker of Royalty Pharma plc":"RPRX","give the ticker of CryoPort, Inc.":"CYRX","which symbol does Intellicheck, Inc. list under":"IDN","what is the Nasdaq symbol of IBEX Limited":"IBEX","give the ticker of Willis Towers Watson Public Limited Company":"WTW","which symbol does ZoomInfo Technologies Inc. list under":"GTM","which symbol does Lixiang Education Holding Co., Ltd. list under":"LXEH","which symbol does GBank Financial Holdings Inc. list under":"GBFH","what is the Nasdaq symbol of EquipmentShare.com Inc":"EQPT","what is the Nasdaq symbol of Innventure, Inc.":"INV","which symbol does LexinFintech Holdings Ltd. list under":"LX","what is the Nasdaq symbol of Astrana Health Inc.":"ASTH","what is the Nasdaq symbol of CrowdStrike Holdings, Inc.":"CRWD","which symbol does Itron, Inc. list under":"ITRI","what is the Nasdaq symbol of Ituran Location and Control Ltd.":"ITRN","which symbol does Intercure Ltd. list under":"INCR","which symbol does Oruka Therapeutics, Inc. list under":"ORKA","which symbol does Praxis Precision Medicines, Inc. list under":"PRAX","give the ticker of Siebert Financial Corp.":"SIEB","which symbol does Paylocity Holding Corporation list under":"PCTY","which symbol does Fennec Pharmaceuticals Inc. list under":"FENC","give the ticker of Verra Mobility Corporation":"VRRM","what is the Nasdaq symbol of BrenX Ltd.":"BRNX","give the ticker of Innovative Solutions and Support, Inc.":"IA","which symbol does Entrada Therapeutics, Inc. list under":"TRDA","which symbol does Ionis Pharmaceuticals, Inc. list under":"IONS","which symbol does CytoMed Therapeutics Limited list under":"GDTC","what is the Nasdaq symbol of ALPS Group Inc":"ALPS","give the ticker of Kolibri Global Energy Inc.":"KGEI","which symbol does Processa Pharmaceuticals, Inc. list under":"PCSA","give the ticker of Perion Network Ltd":"PERI","give the ticker of United Bankshares, Inc.":"UBSI","which symbol does HF Foods Group Inc. list under":"HFFG","give the ticker of eToro Group Ltd.":"ETOR","what is the Nasdaq symbol of Baiya International Group Inc.":"BIYA","what is the Nasdaq symbol of SWK Holdings Corporation":"SWKHL","give the ticker of Alamar Biosciences, Inc.":"ALMR","give the ticker of ARKO Corp.":"ARKO","which symbol does ZW Data Action Technologies Inc. list under":"CNET","which symbol does DocuSign, Inc. list under":"DOCU","give the ticker of Icon Energy Corp.":"ICON","give the ticker of Candel Therapeutics, Inc.":"CADL","which symbol does NBT Bancorp Inc. list under":"NBTB","give the ticker of Ceragon Networks Ltd.":"CRNT","what is the Nasdaq symbol of Fidelity D & D Bancorp, Inc.":"FDBC","which symbol does Investar Holding Corporation list under":"ISTR","give the ticker of Entegris, Inc.":"ENTG","give the ticker of Union Bankshares, Inc.":"UNB","which symbol does Reynolds Consumer Products Inc. list under":"REYN","give the ticker of Dogwood Therapeutics, Inc.":"DWTX","give the ticker of Mammoth Energy Services, Inc.":"TUSK","what is the Nasdaq symbol of Littelfuse, Inc.":"LFUS","what is the Nasdaq symbol of Change Agents Corporation":"CHGA","give the ticker of U.S. GoldMining Inc.":"USGO","what is the Nasdaq symbol of Biogen Inc.":"BIIB","give the ticker of Meridian Holdings Inc.":"MRDN","which symbol does Passage Bio, Inc. list under":"PASG","what is the Nasdaq symbol of ACI Worldwide, Inc.":"ACIW","what is the Nasdaq symbol of Kratos Defense & Security Solutions, Inc.":"KTOS","what is the Nasdaq symbol of Vera Therapeutics, Inc.":"VERA","which symbol does J. W. Mays, Inc. list under":"MAYS","give the ticker of Quantum Cyber N.V.":"QUCY","which symbol does Dorman Products, Inc. list under":"DORM","which symbol does Jefferson Capital, Inc. list under":"JCAP","what is the Nasdaq symbol of Viant Technology Inc.":"DSP","which symbol does BayCom Corp list under":"BCML","give the ticker of ACM Research, Inc.":"ACMR","which symbol does BridgeBio Pharma, Inc. list under":"BBIO","what is the Nasdaq symbol of Inflection Point Acquisition Corp. VIII":"IPHXU","what is the Nasdaq symbol of Collective Mining Ltd.":"CNL","which symbol does Veru Inc. list under":"VERU","what is the Nasdaq symbol of Enliven Therapeutics, Inc.":"ELVN"}}},
{"id":"n-29b4ea83","guard":[["hasAny",["inc","nasdaq","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"Kingsoft Cloud Holdings Limited":"KC","Coffee Holding Co., Inc":"JVA","U.S. Gold Corp":"USAU","ArrowMark Financial Corp":"BANX","ArcBest Corporation":"ARCB","CB Financial Services, Inc":"CBFV","Prime Medicine, Inc":"PRME","EDAP TMS S.A":"FOCL","Baosheng Media Group Holdings Limited":"BAOS","Stewards Inc":"SWRD","BioRestorative Therapies, Inc":"BRTX","PMA Graphene Technology Group Inc":"PMA","AnaptysBio, Inc":"ANAB","Marten Transport, Ltd":"MRTN","My Size, Inc":"MYSZ","National Beverage Corp":"FIZZ","Star Holdings":"STHO","BlackLine, Inc":"BL","Ostin Technology Group Co., Ltd":"OST","Alarum Technologies Ltd":"ALAR","PRF Technologies Ltd":"PRFX","Wynn Resorts, Limited":"WYNN","BranchOut Food Inc":"BOF","Royalty Pharma plc":"RPRX","CryoPort, Inc":"CYRX","IBEX Limited":"IBEX","Willis Towers Watson Public Limited Company":"WTW","EquipmentShare.com Inc":"EQPT","Innventure, Inc":"INV","Astrana Health Inc":"ASTH","CrowdStrike Holdings, Inc":"CRWD","Ituran Location and Control Ltd":"ITRN","Siebert Financial Corp":"SIEB","Verra Mobility Corporation":"VRRM","BrenX Ltd":"BRNX","Innovative Solutions and Support, Inc":"IA","ALPS Group Inc":"ALPS","Kolibri Global Energy Inc":"KGEI","Perion Network Ltd":"PERI","United Bankshares, Inc":"UBSI","eToro Group Ltd":"ETOR","Baiya International Group Inc":"BIYA","SWK Holdings Corporation":"SWKHL","Alamar Biosciences, Inc":"ALMR","ARKO Corp":"ARKO","Icon Energy Corp":"ICON","Candel Therapeutics, Inc":"CADL","Ceragon Networks Ltd":"CRNT","Fidelity D & D Bancorp, Inc":"FDBC","Entegris, Inc":"ENTG","Union Bankshares, Inc":"UNB","Dogwood Therapeutics, Inc":"DWTX","Mammoth Energy Services, Inc":"TUSK","Littelfuse, Inc":"LFUS","Change Agents Corporation":"CHGA","U.S. GoldMining Inc":"USGO","Biogen Inc":"BIIB","Meridian Holdings Inc":"MRDN","ACI Worldwide, Inc":"ACIW","Kratos Defense & Security Solutions, Inc":"KTOS","Vera Therapeutics, Inc":"VERA","Quantum Cyber N.V":"QUCY","Viant Technology Inc":"DSP","ACM Research, Inc":"ACMR","Inflection Point Acquisition Corp. VIII":"IPHXU","Collective Mining Ltd":"CNL","Enliven Therapeutics, Inc":"ELVN"}}},
{"id":"n-b20c31e5","guard":[["has","symbol"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"of Kingsoft Cloud Holdings Limited":"KC","does Nomad Power Solutions, Inc. list under":"NMAD","of Coffee Holding Co., Inc":"JVA","of ArrowMark Financial Corp":"BANX","of ArcBest Corporation":"ARCB","does Avalanche Treasury Corporation list under":"AVAT","of Prime Medicine, Inc":"PRME","of Baosheng Media Group Holdings Limited":"BAOS","of Stewards Inc":"SWRD","does Pliant Therapeutics, Inc. list under":"PLRX","of PMA Graphene Technology Group Inc":"PMA","does Cisco Systems, Inc. list under":"CSCO","of AnaptysBio, Inc":"ANAB","of Marten Transport, Ltd":"MRTN","of My Size, Inc":"MYSZ","does Curanex Pharmaceuticals Inc list under":"CURX","of Alarum Technologies Ltd":"ALAR","of PRF Technologies Ltd":"PRFX","does Intellicheck, Inc. list under":"IDN","of IBEX Limited":"IBEX","does ZoomInfo Technologies Inc. list under":"GTM","does Lixiang Education Holding Co., Ltd. list under":"LXEH","does GBank Financial Holdings Inc. list under":"GBFH","of EquipmentShare.com Inc":"EQPT","of Innventure, Inc":"INV","does LexinFintech Holdings Ltd. list under":"LX","of Astrana Health Inc":"ASTH","of CrowdStrike Holdings, Inc":"CRWD","does Itron, Inc. list under":"ITRI","of Ituran Location and Control Ltd":"ITRN","does Intercure Ltd. list under":"INCR","does Oruka Therapeutics, Inc. list under":"ORKA","does Praxis Precision Medicines, Inc. list under":"PRAX","does Paylocity Holding Corporation list under":"PCTY","does Fennec Pharmaceuticals Inc. list under":"FENC","of BrenX Ltd":"BRNX","does Entrada Therapeutics, Inc. list under":"TRDA","does Ionis Pharmaceuticals, Inc. list under":"IONS","does CytoMed Therapeutics Limited list under":"GDTC","of ALPS Group Inc":"ALPS","does Processa Pharmaceuticals, Inc. list under":"PCSA","does HF Foods Group Inc. list under":"HFFG","of Baiya International Group Inc":"BIYA","of SWK Holdings Corporation":"SWKHL","does ZW Data Action Technologies Inc. list under":"CNET","does DocuSign, Inc. list under":"DOCU","does NBT Bancorp Inc. list under":"NBTB","of Fidelity D & D Bancorp, Inc":"FDBC","does Investar Holding Corporation list under":"ISTR","does Reynolds Consumer Products Inc. list under":"REYN","of Littelfuse, Inc":"LFUS","of Change Agents Corporation":"CHGA","of Biogen Inc":"BIIB","does Passage Bio, Inc. list under":"PASG","of ACI Worldwide, Inc":"ACIW","of Kratos Defense & Security Solutions, Inc":"KTOS","of Vera Therapeutics, Inc":"VERA","does J. W. Mays, Inc. list under":"MAYS","does Dorman Products, Inc. list under":"DORM","does Jefferson Capital, Inc. list under":"JCAP","of Viant Technology Inc":"DSP","does BayCom Corp list under":"BCML","does BridgeBio Pharma, Inc. list under":"BBIO","of Inflection Point Acquisition Corp. VIII":"IPHXU","of Collective Mining Ltd":"CNL","does Veru Inc. list under":"VERU","of Enliven Therapeutics, Inc":"ELVN"}}},
{"id":"n-4497344d","guard":[["has","inc"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"inc"}]]],"mem":{"table":{"which symbol does Nomad Power Solutions":"NMAD","what is the Nasdaq symbol of Coffee Holding Co":"JVA","give the ticker of CB Financial Services":"CBFV","what is the Nasdaq symbol of Prime Medicine":"PRME","what is the Nasdaq symbol of Stewards":"SWRD","which symbol does Pliant Therapeutics":"PLRX","give the ticker of BioRestorative Therapies":"BRTX","what is the Nasdaq symbol of PMA Graphene Technology Group":"PMA","which symbol does Cisco Systems":"CSCO","what is the Nasdaq symbol of AnaptysBio":"ANAB","what is the Nasdaq symbol of My Size":"MYSZ","give the ticker of BlackLine":"BL","which symbol does Curanex Pharmaceuticals":"CURX","give the ticker of BranchOut Food":"BOF","give the ticker of CryoPort":"CYRX","which symbol does Intellicheck":"IDN","which symbol does ZoomInfo Technologies":"GTM","which symbol does GBank Financial Holdings":"GBFH","what is the Nasdaq symbol of EquipmentShare.com":"EQPT","what is the Nasdaq symbol of Innventure":"INV","what is the Nasdaq symbol of Astrana Health":"ASTH","what is the Nasdaq symbol of CrowdStrike Holdings":"CRWD","which symbol does Itron":"ITRI","which symbol does Oruka Therapeutics":"ORKA","which symbol does Praxis Precision Medicines":"PRAX","which symbol does Fennec Pharmaceuticals":"FENC","give the ticker of Innovative Solutions and Support":"IA","which symbol does Entrada Therapeutics":"TRDA","which symbol does Ionis Pharmaceuticals":"IONS","what is the Nasdaq symbol of ALPS Group":"ALPS","give the ticker of Kolibri Global Energy":"KGEI","which symbol does Processa Pharmaceuticals":"PCSA","give the ticker of United Bankshares":"UBSI","which symbol does HF Foods Group":"HFFG","what is the Nasdaq symbol of Baiya International Group":"BIYA","give the ticker of Alamar Biosciences":"ALMR","which symbol does ZW Data Action Technologies":"CNET","which symbol does DocuSign":"DOCU","give the ticker of Candel Therapeutics":"CADL","which symbol does NBT Bancorp":"NBTB","what is the Nasdaq symbol of Fidelity D & D Bancorp":"FDBC","give the ticker of Entegris":"ENTG","give the ticker of Union Bankshares":"UNB","which symbol does Reynolds Consumer Products":"REYN","give the ticker of Dogwood Therapeutics":"DWTX","give the ticker of Mammoth Energy Services":"TUSK","what is the Nasdaq symbol of Littelfuse":"LFUS","give the ticker of U.S. GoldMining":"USGO","what is the Nasdaq symbol of Biogen":"BIIB","give the ticker of Meridian Holdings":"MRDN","which symbol does Passage Bio":"PASG","what is the Nasdaq symbol of ACI Worldwide":"ACIW","what is the Nasdaq symbol of Kratos Defense & Security Solutions":"KTOS","what is the Nasdaq symbol of Vera Therapeutics":"VERA","which symbol does J. W. Mays":"MAYS","which symbol does Dorman Products":"DORM","which symbol does Jefferson Capital":"JCAP","what is the Nasdaq symbol of Viant Technology":"DSP","give the ticker of ACM Research":"ACMR","which symbol does BridgeBio Pharma":"BBIO","which symbol does Veru":"VERU","what is the Nasdaq symbol of Enliven Therapeutics":"ELVN"}}},
{"id":"n-aab9bcec","guard":[["has","nasdaq"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the Nasdaq symbol of Kingsoft Cloud Holdings Limited":"KC","the Nasdaq symbol of Coffee Holding Co., Inc":"JVA","the Nasdaq symbol of ArrowMark Financial Corp":"BANX","the Nasdaq symbol of ArcBest Corporation":"ARCB","the Nasdaq symbol of Prime Medicine, Inc":"PRME","the Nasdaq symbol of Baosheng Media Group Holdings Limited":"BAOS","the Nasdaq symbol of Stewards Inc":"SWRD","the Nasdaq symbol of PMA Graphene Technology Group Inc":"PMA","the Nasdaq symbol of AnaptysBio, Inc":"ANAB","the Nasdaq symbol of Marten Transport, Ltd":"MRTN","the Nasdaq symbol of My Size, Inc":"MYSZ","the Nasdaq symbol of Alarum Technologies Ltd":"ALAR","the Nasdaq symbol of PRF Technologies Ltd":"PRFX","the Nasdaq symbol of IBEX Limited":"IBEX","the Nasdaq symbol of EquipmentShare.com Inc":"EQPT","the Nasdaq symbol of Innventure, Inc":"INV","the Nasdaq symbol of Astrana Health Inc":"ASTH","the Nasdaq symbol of CrowdStrike Holdings, Inc":"CRWD","the Nasdaq symbol of Ituran Location and Control Ltd":"ITRN","the Nasdaq symbol of BrenX Ltd":"BRNX","the Nasdaq symbol of ALPS Group Inc":"ALPS","the Nasdaq symbol of Baiya International Group Inc":"BIYA","the Nasdaq symbol of SWK Holdings Corporation":"SWKHL","the Nasdaq symbol of Fidelity D & D Bancorp, Inc":"FDBC","the Nasdaq symbol of Littelfuse, Inc":"LFUS","the Nasdaq symbol of Change Agents Corporation":"CHGA","the Nasdaq symbol of Biogen Inc":"BIIB","the Nasdaq symbol of ACI Worldwide, Inc":"ACIW","the Nasdaq symbol of Kratos Defense & Security Solutions, Inc":"KTOS","the Nasdaq symbol of Vera Therapeutics, Inc":"VERA","the Nasdaq symbol of Viant Technology Inc":"DSP","the Nasdaq symbol of Inflection Point Acquisition Corp. VIII":"IPHXU","the Nasdaq symbol of Collective Mining Ltd":"CNL","the Nasdaq symbol of Enliven Therapeutics, Inc":"ELVN"}}},
{"id":"n-3eb0a3cc","guard":[["hasAny",["alps","arko","first n","graphene","ibex","icon","resorts","shortest","shortest one","shortest word","take","vera"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-6312a458","guard":[["hasAny",["alps","arko","first n","graphene","ibex","icon","resorts","shortest","shortest one","shortest word","take","vera"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-16eeee9c","guard":[["hasAny",["arko","graphene","ibex","icon","resorts","shortest","shortest one","shortest word"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.str",["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-45474385","guard":[["hasAny",["arko","capitalise","capitalize","capitalize each word","graphene","ibex","icon","resorts","shortest","shortest one","shortest word","title case"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.str",["transform.title",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-a9dca9b7","guard":[["hasAny",["arko","graphene","ibex","icon","invert case","resorts","shortest","shortest one","shortest word","swap case","toggle case"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-b2f40582","guard":[["hasAny",["arko","graphene","ibex","icon","resorts","shortest","shortest one","shortest word"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-681919e2","guard":[["hasAny",["arko","first n","graphene","ibex","icon","resorts","shortest","shortest one","shortest word","take"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":5}]]],"mem":null},
{"id":"n-a4a01ce3","guard":[["hasAny",["arko","delete","graphene","ibex","icon","remove","resorts","shortest","shortest one","shortest word","strip out","without"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.str",["transform.remove",["aggregate.shortest",["sense.content"]],["sense.lastWord"]]],"mem":null},
{"id":"n-c4228518","guard":[["hasAny",["arko","each word","graphene","ibex","icon","resorts","shortest","shortest one","shortest word","split into words","words"]],["not",["has","airline"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-cdc3c918","guard":[["hasAny",["alps","divisor count","how many factors","icon","item number","nth","number of divisors","position","resorts","vera","veru"]],["not",["has","host"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-0419a05d","guard":[["hasAny",["arko","icon","item number","nth","position","resorts","veru"]],["not",["has","host"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f7d83270","guard":[["hasAny",["alps","graphene","ibex","item number","nth","position","vera"]],["has","what"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-359d5100","guard":[["hasAny",["arko","first n","icon","resorts","shortest","shortest one","shortest word","take","veru"]],["not",["has","host"]]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-5bacf23d","guard":[["hasAny",["arko","icon","item number","nth","position","resorts","veru"]],["not",["has","host"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-63cb74c4","guard":[["hasAny",["alps","capitalise","capitalize","capitalize each word","graphene","ibex","item number","nth","position","title case","vera"]],["has","what"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-799b40f8","guard":[["hasAny",["arko","capitalise","capitalize","capitalize each word","icon","item number","nth","position","resorts","title case","veru"]],["not",["has","host"]]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-97b3887c","guard":[["hasAny",["alps","graphene","ibex","invert case","item number","nth","position","swap case","toggle case","vera"]],["has","what"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-aee4adce","guard":[["hasAny",["alps","backwards","icon","item number","nth","position","resorts","reverse order","reversed","vera"]],["has","the"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":3}]],"mem":null},
{"id":"n-b1c25596","guard":[["hasAny",["alps","graphene","ibex","item number","nth","position","vera"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c24ee7f3","guard":[["hasAny",["alps","backwards","icon","item number","nth","position","resorts","reverse order","reversed","vera"]],["has","the"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":3}]],"mem":null},
{"id":"n-ebfea7cf","guard":[["hasAny",["arko","icon","invert case","item number","nth","position","resorts","swap case","toggle case","veru"]],["not",["has","host"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-73a2c74a","guard":[["hasAny",["cyber","nasdaq"]]],"pyramid":["render.str",["memory.lookup",["sense.roman"]]],"mem":{"table":{"D":"FDBC","V":"QUCY","VIII":"IPHXU"}}},
{"id":"n-2cadf5c9","guard":[["hasAny",["arko","icon","item number","nth","position","resorts"]],["has","give"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9d72ea09","guard":[["hasAny",["a to z","alphabetical","alphabetize","arko","ibex","resorts","shortest","shortest one","shortest word"]],["has","the"],["not",["has","airline"]]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.content"]]]],"mem":null},
{"id":"n-0af41840","guard":[["hasAny",["arko","icon","invert case","item number","nth","position","resorts","swap case","toggle case"]],["has","give"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-2ebf31f1","guard":[["hasAny",["arko","icon","item number","nth","position","resorts"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5709b403","guard":[["hasAny",["a to z","alphabetical","alphabetize","alps","arko","ibex","item number","nth","position"]],["not",["has","airline"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":1}]],"mem":null},
{"id":"n-7600d543","guard":[["hasAny",["a to z","alphabetical","alphabetize","graphene","item number","nth","position","vera","veru"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":5}]],"mem":null},
{"id":"n-852671d9","guard":[["hasAny",["arko","capitalise","capitalize","capitalize each word","icon","item number","nth","position","resorts","title case"]],["has","give"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-9f6704de","guard":[["hasAny",["alps","character count","graphene","how many characters","item number","length","nth","number of characters","position","vera"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-cf75373c","guard":[["hasAny",["a to z","alphabetical","alphabetize","alps","arko","ibex","item number","nth","position"]],["not",["has","airline"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":1}]],"mem":null},
{"id":"n-dccd5a3b","guard":[["hasAny",["arko","each word","icon","item number","nth","position","resorts","split into words"]],["has","give"]],"pyramid":["render.str",["transform.nthStr",["transform.words",["sense.text"]],{"lit":5}]],"mem":null},
{"id":"n-26000c93","guard":[["hasAny",["backwards","ibex","resorts","reverse order","reversed","shortest","shortest one","shortest word"]],["has","limited"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-37a443ea","guard":[["hasAny",["a to z","alphabetical","alphabetize","item number","j","nth","position","resorts"]],["not",["has","company"]],["not",["has","host"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":4}]],"mem":null},
{"id":"n-3e9db63b","guard":[["hasAny",["arko","ibex","separate by","split","split by"]],["not",["has","airline"]]],"pyramid":["render.list",["transform.split",["sense.after",{"lit":"of"}],["sense.lastWord"]]],"mem":null},
{"id":"n-58463f8c","guard":[["hasAny",["brenx","item number","marten","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-6d1c0d2e","guard":[["hasAny",["item number","meridian","no vowels","nth","position","remove vowels","resorts","without vowels"]],["has","give"]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-76fba424","guard":[["hasAny",["arko","delete","ibex","remove","strip out","without"]],["not",["has","airline"]]],"pyramid":["render.str",["transform.remove",["sense.after",{"lit":"of"}],["sense.lastWord"]]],"mem":null},
{"id":"n-7a3ba4ac","guard":[["hasAny",["arko","before","ibex","item number","nth","one less","position","predecessor","previous"]],["not",["has","airline"]]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["transform.prev",["sense.wordCount"]]]],"mem":null},
{"id":"n-9e189432","guard":[["hasAny",["backwards","item number","j","nth","position","reverse order","reversed","veru"]],["has","symbol"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":4}]],"mem":null},
{"id":"n-9e27fa73","guard":[["hasAny",["item number","meridian","no vowels","nth","position","remove vowels","resorts","without vowels"]],["has","give"]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-b94ee79b","guard":[["hasAny",["how many vowels","ibex","item number","nth","number of vowels","position","veru","vowel count"]],["has","symbol"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-d3f89ca6","guard":[["hasAny",["backwards","item number","j","nth","position","reverse order","reversed","veru"]],["has","symbol"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":4}]],"mem":null},
{"id":"n-d5cffee2","guard":[["hasAny",["arko","ibex","separate by","split","split by"]],["not",["has","airline"]]],"pyramid":["render.lines",["transform.split",["sense.after",{"lit":"of"}],["sense.lastWord"]]],"mem":null},
{"id":"n-f35f8601","guard":[["hasAny",["arko","ibex","separate by","split","split by"]],["not",["has","airline"]]],"pyramid":["render.and",["transform.split",["sense.after",{"lit":"of"}],["sense.lastWord"]]],"mem":null},
{"id":"n-f38b76ee","guard":[["hasAny",["alps","item number","nth","position","root of","sqrt","square root","vera"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["compute.sqrt",["sense.wordCount"]]]],"mem":null},
{"id":"n-007600ce","guard":[["hasAny",["bio","inc","list","passage","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Passage Bio, Inc. list under":"PASG"}}},
{"id":"n-007fbfa2","guard":[["hasAny",["capital","inc","jefferson","list","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Jefferson Capital, Inc. list under":"JCAP"}}},
{"id":"n-008a5257","guard":[["has","equipmentsharecom"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of EquipmentShare.com Inc":"EQPT"}}},
{"id":"n-02ea456c","guard":[["hasAny",["inc","list","symbol","technologies","under","zoominfo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does ZoomInfo Technologies Inc. list under":"GTM"}}},
{"id":"n-0308a634","guard":[["hasAny",["bio","passage"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Passage Bio, Inc. list under":"PASG"}}},
{"id":"n-036da132","guard":[["hasAny",["holdings","lexinfintech","list","ltd","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does LexinFintech Holdings Ltd. list under":"LX"}}},
{"id":"n-06463644","guard":[["hasAny",["limited","resorts","ticker","wynn"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Wynn Resorts, Limited":"WYNN"}}},
{"id":"n-06e5bf2f","guard":[["hasAny",["company","limited","public","ticker","towers","watson","willis"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Willis Towers Watson Public Limited Company":"WTW"}}},
{"id":"n-08cb8136","guard":[["has","stewards"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Stewards Inc":"SWRD"}}},
{"id":"n-08f75d52","guard":[["has","alps"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of ALPS Group Inc":"ALPS"}}},
{"id":"n-09279b90","guard":[["has","innventure"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Innventure, Inc.":"INV"}}},
{"id":"n-0bdb82f3","guard":[["hasAny",["pharma","plc","royalty","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Royalty Pharma plc":"RPRX"}}},
{"id":"n-0f17e45d","guard":[["has","paylocity"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Paylocity Holding Corporation list under":"PCTY"}}},
{"id":"n-0f618c6c","guard":[["hasAny",["holdings","inc","meridian","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Meridian Holdings Inc.":"MRDN"}}},
{"id":"n-10269660","guard":[["hasAny",["cyber","nv","quantum","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Quantum Cyber N.V.":"QUCY"}}},
{"id":"n-108a9e56","guard":[["hasAny",["corporation","mobility","ticker","verra"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Verra Mobility Corporation":"VRRM"}}},
{"id":"n-12b87462","guard":[["hasAny",["inc","nasdaq","size","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of My Size, Inc.":"MYSZ"}}},
{"id":"n-12d6589b","guard":[["hasAny",["edap","sa","ticker","tms"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of EDAP TMS S.A.":"FOCL"}}},
{"id":"n-1319a78b","guard":[["hasAny",["ibex","limited","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of IBEX Limited":"IBEX"}}},
{"id":"n-1378f432","guard":[["hasAny",["ceragon","ltd","networks","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Ceragon Networks Ltd.":"CRNT"}}},
{"id":"n-13b8ccdb","guard":[["hasAny",["acm","inc","research","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of ACM Research, Inc.":"ACMR"}}},
{"id":"n-149a2365","guard":[["hasAny",["baiya","international"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Baiya International Group Inc.":"BIYA"}}},
{"id":"n-15efd246","guard":[["hasAny",["financial","gbank","holdings"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does GBank Financial Holdings Inc. list under":"GBFH"}}},
{"id":"n-16758873","guard":[["has","littelfuse"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Littelfuse, Inc.":"LFUS"}}},
{"id":"n-1701a54d","guard":[["hasAny",["consumer","reynolds"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Reynolds Consumer Products Inc. list under":"REYN"}}},
{"id":"n-196d0ef2","guard":[["hasAny",["j","mays","w"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does J. W. Mays, Inc. list under":"MAYS"}}},
{"id":"n-1b2bd803","guard":[["hasAny",["inc","intellicheck","list","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Intellicheck, Inc. list under":"IDN"}}},
{"id":"n-1c214281","guard":[["hasAny",["cisco","systems"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Cisco Systems, Inc. list under":"CSCO"}}},
{"id":"n-1cae228e","guard":[["hasAny",["co","coffee","holding","inc","nasdaq","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Coffee Holding Co., Inc.":"JVA"}}},
{"id":"n-1ccf333a","guard":[["has","curanex"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Curanex Pharmaceuticals Inc list under":"CURX"}}},
{"id":"n-1d2601de","guard":[["hasAny",["candel","inc","therapeutics","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Candel Therapeutics, Inc.":"CADL"}}},
{"id":"n-1de5d9af","guard":[["has","anaptysbio"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of AnaptysBio, Inc.":"ANAB"}}},
{"id":"n-1f11ad21","guard":[["hasAny",["anaptysbio","inc","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of AnaptysBio, Inc.":"ANAB"}}},
{"id":"n-1f819052","guard":[["has","candel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Candel Therapeutics, Inc.":"CADL"}}},
{"id":"n-21b6cf1b","guard":[["hasAny",["ltd","nasdaq","prf","symbol","technologies"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of PRF Technologies Ltd.":"PRFX"}}},
{"id":"n-24b6941d","guard":[["hasAny",["aci","worldwide"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of ACI Worldwide, Inc.":"ACIW"}}},
{"id":"n-25792f9c","guard":[["hasAny",["energy","global","inc","kolibri","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Kolibri Global Energy Inc.":"KGEI"}}},
{"id":"n-269bfa02","guard":[["hasAny",["holdings","star","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Star Holdings":"STHO"}}},
{"id":"n-269bfad2","guard":[["has","investar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Investar Holding Corporation list under":"ISTR"}}},
{"id":"n-270c82f7","guard":[["hasAny",["inc","list","nomad","power","solutions","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Nomad Power Solutions, Inc. list under":"NMAD"}}},
{"id":"n-27e87c52","guard":[["hasAny",["bancorp","nbt"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does NBT Bancorp Inc. list under":"NBTB"}}},
{"id":"n-2b68f85f","guard":[["hasAny",["biogen","inc","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Biogen Inc.":"BIIB"}}},
{"id":"n-2c1fbe89","guard":[["has","gold"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of U.S. Gold Corp.":"USAU"}}},
{"id":"n-2f53638a","guard":[["hasAny",["corporation","mobility","ticker","verra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Verra Mobility Corporation":"VRRM"}}},
{"id":"n-31ec45a1","guard":[["hasAny",["acm","inc","research","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of ACM Research, Inc.":"ACMR"}}},
{"id":"n-327f8256","guard":[["hasAny",["foods","group","hf","inc","list","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does HF Foods Group Inc. list under":"HFFG"}}},
{"id":"n-36f87e67","guard":[["has","zoominfo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does ZoomInfo Technologies Inc. list under":"GTM"}}},
{"id":"n-377bb510","guard":[["has","veru"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Veru Inc. list under":"VERU"}}},
{"id":"n-37ad259f","guard":[["hasAny",["cisco","inc","list","symbol","systems","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Cisco Systems, Inc. list under":"CSCO"}}},
{"id":"n-3bc276c8","guard":[["hasAny",["cb","financial","inc","services","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of CB Financial Services, Inc.":"CBFV"}}},
{"id":"n-3c284d8b","guard":[["hasAny",["company","limited","public","ticker","towers","watson","willis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Willis Towers Watson Public Limited Company":"WTW"}}},
{"id":"n-3d900d8c","guard":[["hasAny",["energy","inc","mammoth","services","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Mammoth Energy Services, Inc.":"TUSK"}}},
{"id":"n-410715e5","guard":[["hasAny",["cryoport","inc","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of CryoPort, Inc.":"CYRX"}}},
{"id":"n-4118a16d","guard":[["hasAny",["inc","list","pliant","symbol","therapeutics","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Pliant Therapeutics, Inc. list under":"PLRX"}}},
{"id":"n-41e8ca9c","guard":[["hasAny",["bridgebio","inc","list","pharma","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does BridgeBio Pharma, Inc. list under":"BBIO"}}},
{"id":"n-423db02f","guard":[["hasAny",["nomad","power","solutions"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Nomad Power Solutions, Inc. list under":"NMAD"}}},
{"id":"n-425dc959","guard":[["has","processa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Processa Pharmaceuticals, Inc. list under":"PCSA"}}},
{"id":"n-43b53a06","guard":[["has","brenx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of BrenX Ltd.":"BRNX"}}},
{"id":"n-46f3d52b","guard":[["hasAny",["inc","list","medicines","praxis","precision","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Praxis Precision Medicines, Inc. list under":"PRAX"}}},
{"id":"n-478e7a40","guard":[["hasAny",["inc","innventure","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Innventure, Inc.":"INV"}}},
{"id":"n-494af3ac","guard":[["has","dogwood"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Dogwood Therapeutics, Inc.":"DWTX"}}},
{"id":"n-4a2bad8a","guard":[["hasAny",["bancorp","inc","list","nbt","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does NBT Bancorp Inc. list under":"NBTB"}}},
{"id":"n-4d71677f","guard":[["hasAny",["inc","nasdaq","symbol","technology","viant"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Viant Technology Inc.":"DSP"}}},
{"id":"n-4df7a4e0","guard":[["hasAny",["biorestorative","inc","therapies","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of BioRestorative Therapies, Inc.":"BRTX"}}},
{"id":"n-4e69fb6b","guard":[["hasAny",["cloud","holdings","kingsoft","limited","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Kingsoft Cloud Holdings Limited":"KC"}}},
{"id":"n-4ee6b149","guard":[["hasAny",["collective","mining"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Collective Mining Ltd.":"CNL"}}},
{"id":"n-4f374ac1","guard":[["hasAny",["dorman","inc","list","products","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Dorman Products, Inc. list under":"DORM"}}},
{"id":"n-50bfeb88","guard":[["has","docusign"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does DocuSign, Inc. list under":"DOCU"}}},
{"id":"n-52a8441d","guard":[["hasAny",["medicine","prime"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Prime Medicine, Inc.":"PRME"}}},
{"id":"n-541c329e","guard":[["hasAny",["action","data","inc","list","symbol","technologies","under","zw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does ZW Data Action Technologies Inc. list under":"CNET"}}},
{"id":"n-56b309c3","guard":[["hasAny",["biorestorative","inc","therapies","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of BioRestorative Therapies, Inc.":"BRTX"}}},
{"id":"n-595877f7","guard":[["hasAny",["aci","inc","nasdaq","symbol","worldwide"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of ACI Worldwide, Inc.":"ACIW"}}},
{"id":"n-5c9f3ad1","guard":[["hasAny",["baosheng","group","holdings","limited","media","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Baosheng Media Group Holdings Limited":"BAOS"}}},
{"id":"n-5dad5d19","guard":[["hasAny",["corporation","holding","list","paylocity","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Paylocity Holding Corporation list under":"PCTY"}}},
{"id":"n-5f6d04ee","guard":[["has","prf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of PRF Technologies Ltd.":"PRFX"}}},
{"id":"n-60c11131","guard":[["hasAny",["curanex","inc","list","pharmaceuticals","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Curanex Pharmaceuticals Inc list under":"CURX"}}},
{"id":"n-62d75750","guard":[["hasAny",["cytomed","limited","list","symbol","therapeutics","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does CytoMed Therapeutics Limited list under":"GDTC"}}},
{"id":"n-637dd1de","guard":[["hasAny",["goldmining","inc","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of U.S. GoldMining Inc.":"USGO"}}},
{"id":"n-63ce6338","guard":[["hasAny",["agents","change"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Change Agents Corporation":"CHGA"}}},
{"id":"n-64233d24","guard":[["hasAny",["baiya","group","inc","international","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Baiya International Group Inc.":"BIYA"}}},
{"id":"n-652243a5","guard":[["hasAny",["etoro","group","ltd","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of eToro Group Ltd.":"ETOR"}}},
{"id":"n-694da671","guard":[["has","fennec"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Fennec Pharmaceuticals Inc. list under":"FENC"}}},
{"id":"n-69548158","guard":[["hasAny",["edap","sa","ticker","tms"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of EDAP TMS S.A.":"FOCL"}}},
{"id":"n-6b344968","guard":[["hasAny",["inc","medicine","nasdaq","prime","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Prime Medicine, Inc.":"PRME"}}},
{"id":"n-6bb4327b","guard":[["hasAny",["cloud","holdings","kingsoft","limited","nasdaq","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Kingsoft Cloud Holdings Limited":"KC"}}},
{"id":"n-6e209e8d","guard":[["hasAny",["consumer","inc","list","products","reynolds","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Reynolds Consumer Products Inc. list under":"REYN"}}},
{"id":"n-70f30e7f","guard":[["hasAny",["crowdstrike","holdings"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of CrowdStrike Holdings, Inc.":"CRWD"}}},
{"id":"n-726aad7a","guard":[["hasAny",["alamar","biosciences","inc","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Alamar Biosciences, Inc.":"ALMR"}}},
{"id":"n-728ba297","guard":[["hasAny",["ltd","network","perion","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Perion Network Ltd":"PERI"}}},
{"id":"n-7781fda1","guard":[["hasAny",["crowdstrike","holdings","inc","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of CrowdStrike Holdings, Inc.":"CRWD"}}},
{"id":"n-7798d02d","guard":[["hasAny",["ltd","marten","nasdaq","symbol","transport"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Marten Transport, Ltd.":"MRTN"}}},
{"id":"n-791185cd","guard":[["hasAny",["inc","innovative","solutions","support","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Innovative Solutions and Support, Inc.":"IA"}}},
{"id":"n-7a15fd7a","guard":[["hasAny",["inc","nasdaq","stewards","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Stewards Inc":"SWRD"}}},
{"id":"n-7a3c4c5e","guard":[["has","itron"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Itron, Inc. list under":"ITRI"}}},
{"id":"n-7a52d12b","guard":[["hasAny",["baycom","corp","list","symbol","under"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does BayCom Corp list under":"BCML"}}},
{"id":"n-7a91a9f4","guard":[["has","intellicheck"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Intellicheck, Inc. list under":"IDN"}}},
{"id":"n-7b5458b9","guard":[["hasAny",["corp","financial","siebert","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Siebert Financial Corp.":"SIEB"}}},
{"id":"n-7cc36fce","guard":[["hasAny",["holdings","lexinfintech"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does LexinFintech Holdings Ltd. list under":"LX"}}},
{"id":"n-8026674d","guard":[["hasAny",["corp","energy","icon","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Icon Energy Corp.":"ICON"}}},
{"id":"n-8102dad4","guard":[["hasAny",["co","group","ltd","ostin","technology","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Ostin Technology Group Co., Ltd.":"OST"}}},
{"id":"n-81abdb61","guard":[["hasAny",["co","group","ltd","ostin","technology","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Ostin Technology Group Co., Ltd.":"OST"}}},
{"id":"n-81beea23","guard":[["has","ionis"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Ionis Pharmaceuticals, Inc. list under":"IONS"}}},
{"id":"n-83e70cf5","guard":[["has","united"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of United Bankshares, Inc.":"UBSI"}}},
{"id":"n-83f73dee","guard":[["has","viant"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Viant Technology Inc.":"DSP"}}},
{"id":"n-8411d8fb","guard":[["hasAny",["inc","ionis","list","pharmaceuticals","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Ionis Pharmaceuticals, Inc. list under":"IONS"}}},
{"id":"n-851ce648","guard":[["hasAny",["astrana","health","inc","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Astrana Health Inc.":"ASTH"}}},
{"id":"n-86c934d4","guard":[["hasAny",["holdings","swk"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of SWK Holdings Corporation":"SWKHL"}}},
{"id":"n-8764a88b","guard":[["hasAny",["etoro","group","ltd","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of eToro Group Ltd.":"ETOR"}}},
{"id":"n-8926edf8","guard":[["hasAny",["alamar","biosciences","inc","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Alamar Biosciences, Inc.":"ALMR"}}},
{"id":"n-8b3ca183","guard":[["hasAny",["bridgebio","pharma"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does BridgeBio Pharma, Inc. list under":"BBIO"}}},
{"id":"n-8b4924b8","guard":[["hasAny",["corporation","holdings","nasdaq","swk","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of SWK Holdings Corporation":"SWKHL"}}},
{"id":"n-8b84069c","guard":[["hasAny",["arko","corp","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of ARKO Corp.":"ARKO"}}},
{"id":"n-8b9b0676","guard":[["hasAny",["corp","energy","icon","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Icon Energy Corp.":"ICON"}}},
{"id":"n-8bd1f63c","guard":[["hasAny",["ceragon","ltd","networks","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Ceragon Networks Ltd.":"CRNT"}}},
{"id":"n-90741ca8","guard":[["hasAny",["alarum","ltd","nasdaq","symbol","technologies"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Alarum Technologies Ltd.":"ALAR"}}},
{"id":"n-911971e1","guard":[["hasAny",["foods","group","hf"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does HF Foods Group Inc. list under":"HFFG"}}},
{"id":"n-917a7217","guard":[["hasAny",["ibex","limited","nasdaq","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of IBEX Limited":"IBEX"}}},
{"id":"n-973ce8d0","guard":[["hasAny",["defense","inc","kratos","nasdaq","security","solutions","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Kratos Defense & Security Solutions, Inc.":"KTOS"}}},
{"id":"n-97c8c9b6","guard":[["hasAny",["capital","jefferson"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Jefferson Capital, Inc. list under":"JCAP"}}},
{"id":"n-9a7d2ae7","guard":[["has","oruka"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Oruka Therapeutics, Inc. list under":"ORKA"}}},
{"id":"n-9b6d5e34","guard":[["hasAny",["baycom","corp","list","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does BayCom Corp list under":"BCML"}}},
{"id":"n-9b9339c3","guard":[["hasAny",["holdings","inc","meridian","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Meridian Holdings Inc.":"MRDN"}}},
{"id":"n-9c073207","guard":[["hasAny",["cyber","nv","quantum","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Quantum Cyber N.V.":"QUCY"}}},
{"id":"n-9d5a661a","guard":[["has","dorman"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Dorman Products, Inc. list under":"DORM"}}},
{"id":"n-9d87dd26","guard":[["hasAny",["defense","inc","kratos","nasdaq","security","solutions","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Kratos Defense & Security Solutions, Inc.":"KTOS"}}},
{"id":"n-9e556eb6","guard":[["hasAny",["arcbest","corporation","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of ArcBest Corporation":"ARCB"}}},
{"id":"n-9e6aea17","guard":[["hasAny",["cb","financial","inc","services","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of CB Financial Services, Inc.":"CBFV"}}},
{"id":"n-9e6d5a85","guard":[["hasAny",["branchout","food","inc","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of BranchOut Food Inc.":"BOF"}}},
{"id":"n-9f97b577","guard":[["hasAny",["corporation","holding","investar","list","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Investar Holding Corporation list under":"ISTR"}}},
{"id":"n-a0c28e16","guard":[["hasAny",["inc","list","symbol","under","veru"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Veru Inc. list under":"VERU"}}},
{"id":"n-a17bca93","guard":[["hasAny",["action","data","zw"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does ZW Data Action Technologies Inc. list under":"CNET"}}},
{"id":"n-a461c23e","guard":[["hasAny",["avalanche","treasury"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Avalanche Treasury Corporation list under":"AVAT"}}},
{"id":"n-a50a0017","guard":[["hasAny",["inc","j","list","mays","symbol","under","w"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does J. W. Mays, Inc. list under":"MAYS"}}},
{"id":"n-a5169d47","guard":[["hasAny",["bankshares","inc","ticker","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of United Bankshares, Inc.":"UBSI"}}},
{"id":"n-a9006bdf","guard":[["hasAny",["bancorp","d","fidelity","inc","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Fidelity D & D Bancorp, Inc.":"FDBC"}}},
{"id":"n-aa7d5e52","guard":[["hasAny",["entegris","inc","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Entegris, Inc.":"ENTG"}}},
{"id":"n-aa8762d9","guard":[["hasAny",["graphene","pma"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of PMA Graphene Technology Group Inc.":"PMA"}}},
{"id":"n-aa9f64e3","guard":[["hasAny",["blackline","inc","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of BlackLine, Inc.":"BL"}}},
{"id":"n-aac65f35","guard":[["hasAny",["holdings","star","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Star Holdings":"STHO"}}},
{"id":"n-aad1587d","guard":[["hasAny",["acquisition","corp","inflection","nasdaq","point","symbol","viii"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Inflection Point Acquisition Corp. VIII":"IPHXU"}}},
{"id":"n-ab0ca21a","guard":[["hasAny",["alps","group","inc","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of ALPS Group Inc":"ALPS"}}},
{"id":"n-ab6389c2","guard":[["hasAny",["energy","global","inc","kolibri","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Kolibri Global Energy Inc.":"KGEI"}}},
{"id":"n-ac238276","guard":[["hasAny",["inc","nasdaq","symbol","therapeutics","vera"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Vera Therapeutics, Inc.":"VERA"}}},
{"id":"n-afa54b66","guard":[["hasAny",["pharma","plc","royalty","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Royalty Pharma plc":"RPRX"}}},
{"id":"n-afcc77fc","guard":[["hasAny",["acquisition","corp","inflection","nasdaq","point","symbol","viii"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Inflection Point Acquisition Corp. VIII":"IPHXU"}}},
{"id":"n-b071fdf1","guard":[["has","blackline"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of BlackLine, Inc.":"BL"}}},
{"id":"n-b07eb6df","guard":[["has","pliant"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Pliant Therapeutics, Inc. list under":"PLRX"}}},
{"id":"n-b1bfb4ce","guard":[["has","goldmining"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of U.S. GoldMining Inc.":"USGO"}}},
{"id":"n-b1c30780","guard":[["hasAny",["arrowmark","corp","financial","nasdaq","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of ArrowMark Financial Corp.":"BANX"}}},
{"id":"n-b1f3c225","guard":[["has","biogen"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Biogen Inc.":"BIIB"}}},
{"id":"n-b27358b3","guard":[["hasAny",["fennec","inc","list","pharmaceuticals","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Fennec Pharmaceuticals Inc. list under":"FENC"}}},
{"id":"n-b2b6ac7c","guard":[["has","entrada"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Entrada Therapeutics, Inc. list under":"TRDA"}}},
{"id":"n-b2b8de9b","guard":[["hasAny",["entrada","inc","list","symbol","therapeutics","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Entrada Therapeutics, Inc. list under":"TRDA"}}},
{"id":"n-b441b151","guard":[["hasAny",["beverage","corp","national","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of National Beverage Corp.":"FIZZ"}}},
{"id":"n-b6c2c874","guard":[["hasAny",["inc","list","oruka","symbol","therapeutics","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Oruka Therapeutics, Inc. list under":"ORKA"}}},
{"id":"n-b7acc08c","guard":[["hasAny",["astrana","health"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Astrana Health Inc.":"ASTH"}}},
{"id":"n-bda4eb8e","guard":[["hasAny",["docusign","inc","list","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does DocuSign, Inc. list under":"DOCU"}}},
{"id":"n-c13aaea5","guard":[["has","size"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of My Size, Inc.":"MYSZ"}}},
{"id":"n-c1bb8789","guard":[["has","cryoport"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of CryoPort, Inc.":"CYRX"}}},
{"id":"n-c238d6e8","guard":[["hasAny",["financial","gbank","holdings","inc","list","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does GBank Financial Holdings Inc. list under":"GBFH"}}},
{"id":"n-c2ccfffe","guard":[["has","enliven"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Enliven Therapeutics, Inc.":"ELVN"}}},
{"id":"n-c404ee1b","guard":[["hasAny",["beverage","corp","national","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of National Beverage Corp.":"FIZZ"}}},
{"id":"n-c4119437","guard":[["hasAny",["inc","list","pharmaceuticals","processa","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Processa Pharmaceuticals, Inc. list under":"PCSA"}}},
{"id":"n-c48e23cf","guard":[["hasAny",["medicines","praxis","precision"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Praxis Precision Medicines, Inc. list under":"PRAX"}}},
{"id":"n-c50bb373","guard":[["hasAny",["intercure","list","ltd","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Intercure Ltd. list under":"INCR"}}},
{"id":"n-c5e4f307","guard":[["hasAny",["energy","inc","mammoth","services","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Mammoth Energy Services, Inc.":"TUSK"}}},
{"id":"n-c674dc82","guard":[["hasAny",["co","education","holding","list","lixiang","ltd","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Lixiang Education Holding Co., Ltd. list under":"LXEH"}}},
{"id":"n-c810c992","guard":[["has","arko"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of ARKO Corp.":"ARKO"}}},
{"id":"n-c8ba0a4a","guard":[["hasAny",["dogwood","inc","therapeutics","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Dogwood Therapeutics, Inc.":"DWTX"}}},
{"id":"n-c9cea615","guard":[["has","arcbest"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of ArcBest Corporation":"ARCB"}}},
{"id":"n-cabbbbbe","guard":[["has","alarum"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Alarum Technologies Ltd.":"ALAR"}}},
{"id":"n-cb112492","guard":[["hasAny",["equipmentsharecom","inc","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of EquipmentShare.com Inc":"EQPT"}}},
{"id":"n-cbda5a59","guard":[["hasAny",["co","education","holding","list","lixiang","ltd","symbol","under"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Lixiang Education Holding Co., Ltd. list under":"LXEH"}}},
{"id":"n-ccbe5dd7","guard":[["hasAny",["arrowmark","corp","financial","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of ArrowMark Financial Corp.":"BANX"}}},
{"id":"n-cd468f2e","guard":[["hasAny",["control","ituran","location","ltd","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Ituran Location and Control Ltd.":"ITRN"}}},
{"id":"n-d067e5aa","guard":[["hasAny",["marten","transport"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Marten Transport, Ltd.":"MRTN"}}},
{"id":"n-d1a2f561","guard":[["hasAny",["inc","littelfuse","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Littelfuse, Inc.":"LFUS"}}},
{"id":"n-d2f4cbb7","guard":[["hasAny",["branchout","food","inc","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of BranchOut Food Inc.":"BOF"}}},
{"id":"n-d3e9971c","guard":[["hasAny",["graphene","group","inc","nasdaq","pma","symbol","technology"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of PMA Graphene Technology Group Inc.":"PMA"}}},
{"id":"n-d9d2c608","guard":[["has","union"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Union Bankshares, Inc.":"UNB"}}},
{"id":"n-da90d973","guard":[["hasAny",["bancorp","d","fidelity","inc","nasdaq","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Fidelity D & D Bancorp, Inc.":"FDBC"}}},
{"id":"n-dd2d70d2","guard":[["hasAny",["collective","ltd","mining","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Collective Mining Ltd.":"CNL"}}},
{"id":"n-dfc91b96","guard":[["hasAny",["inc","innovative","solutions","support","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Innovative Solutions and Support, Inc.":"IA"}}},
{"id":"n-e0c02e88","guard":[["hasAny",["bankshares","inc","ticker","union"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Union Bankshares, Inc.":"UNB"}}},
{"id":"n-e23e32c6","guard":[["hasAny",["agents","change","corporation","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Change Agents Corporation":"CHGA"}}},
{"id":"n-e3765f18","guard":[["hasAny",["inc","itron","list","symbol","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Itron, Inc. list under":"ITRI"}}},
{"id":"n-e3c1c6e8","guard":[["hasAny",["enliven","inc","nasdaq","symbol","therapeutics"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Enliven Therapeutics, Inc.":"ELVN"}}},
{"id":"n-e5976211","guard":[["hasAny",["corp","financial","siebert","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Siebert Financial Corp.":"SIEB"}}},
{"id":"n-e8dae189","guard":[["has","intercure"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Intercure Ltd. list under":"INCR"}}},
{"id":"n-ea68cf2e","guard":[["hasAny",["brenx","ltd","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of BrenX Ltd.":"BRNX"}}},
{"id":"n-ebf1ea09","guard":[["hasAny",["control","ituran","location","ltd","nasdaq","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Ituran Location and Control Ltd.":"ITRN"}}},
{"id":"n-ebf606b2","guard":[["hasAny",["baosheng","group","holdings","limited","media","nasdaq","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Baosheng Media Group Holdings Limited":"BAOS"}}},
{"id":"n-f1e2a71b","guard":[["has","entegris"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the ticker of Entegris, Inc.":"ENTG"}}},
{"id":"n-f4d02090","guard":[["hasAny",["limited","resorts","ticker","wynn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Wynn Resorts, Limited":"WYNN"}}},
{"id":"n-f826d51a","guard":[["hasAny",["ltd","network","perion","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of Perion Network Ltd":"PERI"}}},
{"id":"n-fa37b6e0","guard":[["has","vera"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Vera Therapeutics, Inc.":"VERA"}}},
{"id":"n-fa59279e","guard":[["hasAny",["co","coffee","holding","inc","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the Nasdaq symbol of Coffee Holding Co., Inc.":"JVA"}}},
{"id":"n-fac95615","guard":[["hasAny",["cytomed","limited"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does CytoMed Therapeutics Limited list under":"GDTC"}}},
{"id":"n-faf69428","guard":[["hasAny",["corp","gold","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the ticker of U.S. Gold Corp.":"USAU"}}},
{"id":"n-ff9083c8","guard":[["hasAny",["avalanche","corporation","list","symbol","treasury","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Avalanche Treasury Corporation list under":"AVAT"}}},
{"id":"n-186b3f09","guard":[["hasAny",["longest","longest one","longest word","meridian","no vowels","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-19000084","guard":[["hasAny",["abbreviate","acronym","global"]],["has","ticker"]],"pyramid":["render.str",["transform.acronym",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-329fed2d","guard":[["hasAny",["item number","j","nth","position"]],["has","symbol"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4688a24f","guard":[["hasAny",["no vowels","remove vowels","resorts","shortest","shortest one","shortest word","without vowels"]],["has","give"]],"pyramid":["render.str",["transform.noVowels",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-6cba6f1c","guard":[["hasAny",["item number","nth","position","veru"]]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-0526684a","guard":[["hasAny",["abbreviate","acronym","capitalise","capitalize","capitalize each word","global","title case"]],["has","ticker"]],"pyramid":["render.str",["transform.title",["transform.acronym",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-0927ffd9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","veru"]]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.words"],{"lit":4}]]],"mem":null},
{"id":"n-0dc28a35","guard":[["hasAny",["a to z","alphabetical","alphabetize","item number","nth","position","resorts"]],["has","give"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],["sense.wordCount"]]],"mem":null},
{"id":"n-0f614abf","guard":[["hasAny",["backwards","graphene","item number","nth","position","reverse order","reversed"]]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":5}]],"mem":null},
{"id":"n-1d56132f","guard":[["hasAny",["arko","each word","longest","longest one","longest word","split into words","words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-2725d7ef","guard":[["hasAny",["abbreviate","acronym","global","lower case","lowercase","small letters"]],["has","ticker"]],"pyramid":["render.str",["transform.lower",["transform.acronym",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-303eaee4","guard":[["hasAny",["each word","item number","nth","position","split into words","veru"]]],"pyramid":["render.str",["transform.nthStr",["transform.words",["sense.text"]],{"lit":4}]],"mem":null},
{"id":"n-3496ab24","guard":[["hasAny",["invert case","item number","j","nth","position","swap case","toggle case"]],["has","symbol"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-4d58d9eb","guard":[["hasAny",["backwards","graphene","item number","nth","position","reverse order","reversed"]]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":5}]],"mem":null},
{"id":"n-50d28428","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","j","nth","position","title case"]],["has","symbol"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-6c3d0792","guard":[["hasAny",["alphabetize the letters","alps","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.str",["transform.sortLetters",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-6e83f3f3","guard":[["hasAny",["graphene","how many items","item number","nth","number of items","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-776c1aac","guard":[["hasAny",["as a roman numeral","growth rate","in roman numerals","lexinfintech","percent change","percent decrease","percent increase","percentage change","roman numeral","to roman"]]],"pyramid":["render.str",["compute.toRoman",["compute.percentChange",{"lit":5},["sense.wordCount"]]]],"mem":null},
{"id":"n-8cfaa50d","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","veru"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.words"],{"lit":4}]]],"mem":null},
{"id":"n-af7bebe3","guard":[["hasAny",["character count","how many characters","ibex","item number","length","nth","number of characters","position"]],["has","what"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-d727513c","guard":[["hasAny",["a to z","alphabetical","alphabetize","item number","j","nth","position"]],["has","symbol"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":5}]],"mem":null},
{"id":"n-e4123879","guard":[["hasAny",["a to z","alphabetical","alphabetize","icon","item number","nth","position"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":3}]],"mem":null},
{"id":"n-e51a1e8c","guard":[["hasAny",["abbreviate","acronym","first letters of the name","global","initials"]],["has","ticker"]],"pyramid":["render.str",["transform.acronym",["transform.initials",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-e754a988","guard":[["hasAny",["a to z","alphabetical","alphabetize","icon","item number","nth","position"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":4}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the Nasdaq symbol of Kingsoft Cloud Holdings Limited","expect":{"equals":"KC","notRefusal":true}},{"q":"which symbol does Nomad Power Solutions, Inc. list under","expect":{"equals":"NMAD","notRefusal":true}},{"q":"what is the Nasdaq symbol of Coffee Holding Co., Inc.","expect":{"equals":"JVA","notRefusal":true}},{"q":"give the ticker of U.S. Gold Corp.","expect":{"equals":"USAU","notRefusal":true}},{"q":"what is the Nasdaq symbol of ArrowMark Financial Corp.","expect":{"equals":"BANX","notRefusal":true}},{"q":"what is the Nasdaq symbol of ArcBest Corporation","expect":{"equals":"ARCB","notRefusal":true}},{"q":"which symbol does Avalanche Treasury Corporation list under","expect":{"equals":"AVAT","notRefusal":true}},{"q":"give the ticker of CB Financial Services, Inc.","expect":{"equals":"CBFV","notRefusal":true}},{"q":"what is the Nasdaq symbol of Prime Medicine, Inc.","expect":{"equals":"PRME","notRefusal":true}},{"q":"give the ticker of EDAP TMS S.A.","expect":{"equals":"FOCL","notRefusal":true}},{"q":"what is the Nasdaq symbol of Baosheng Media Group Holdings Limited","expect":{"equals":"BAOS","notRefusal":true}},{"q":"what is the Nasdaq symbol of Stewards Inc","expect":{"equals":"SWRD","notRefusal":true}},{"q":"which symbol does Pliant Therapeutics, Inc. list under","expect":{"equals":"PLRX","notRefusal":true}},{"q":"give the ticker of BioRestorative Therapies, Inc.","expect":{"equals":"BRTX","notRefusal":true}},{"q":"what is the Nasdaq symbol of PMA Graphene Technology Group Inc.","expect":{"equals":"PMA","notRefusal":true}},{"q":"which symbol does Cisco Systems, Inc. list under","expect":{"equals":"CSCO","notRefusal":true}},{"q":"what is the Nasdaq symbol of AnaptysBio, Inc.","expect":{"equals":"ANAB","notRefusal":true}},{"q":"what is the Nasdaq symbol of Marten Transport, Ltd.","expect":{"equals":"MRTN","notRefusal":true}},{"q":"what is the Nasdaq symbol of My Size, Inc.","expect":{"equals":"MYSZ","notRefusal":true}},{"q":"give the ticker of National Beverage Corp.","expect":{"equals":"FIZZ","notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
