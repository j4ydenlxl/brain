// city-region-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"city-region-neo-g6","class":"city-region","generation":6,"lane":"neo","grownFrom":["name the first-level division that holds Pārdi","in what state or province does Haldia lie","in what state or province does Banfora lie","which region or province is Magdeburg in","name the first-level division that holds Vero Beach","which region or province is Kórinthos in","name the first-level division that holds Boca Chica","in what state or province does Missérété lie","which region or province is Pāndharkawada in","in what state or province does Acerra lie","name the first-level division that holds Gādarwāra","which region or province is La Vista in","which region or province is Kigonsera in","which region or province is Tempelhof in","which region or province is Tiancheng in","name the first-level division that holds Burriana","name the first-level division that holds Malda","name the first-level division that holds Yangiqo‘rg‘on","name the first-level division that holds Grivegnée","which region or province is Manjīl in"],"version":1});

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
{"id":"n-144d76dd","guard":[["hasAny",["division","province"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Pārdi":"Pārdi lies in Gujarat.","in what state or province does Haldia lie":"Haldia lies in West Bengal.","in what state or province does Banfora lie":"Banfora lies in Cascades Region.","which region or province is Magdeburg in":"Magdeburg lies in Saxony-Anhalt.","name the first-level division that holds Vero Beach":"Vero Beach lies in Florida.","which region or province is Kórinthos in":"Kórinthos lies in Peloponnese.","name the first-level division that holds Boca Chica":"Boca Chica lies in Santo Domingo Province.","in what state or province does Missérété lie":"Missérété lies in Oueme.","which region or province is Pāndharkawada in":"Pāndharkawada lies in Maharashtra.","in what state or province does Acerra lie":"Acerra lies in Campania.","name the first-level division that holds Gādarwāra":"Gādarwāra lies in Madhya Pradesh.","which region or province is La Vista in":"La Vista lies in Nebraska.","which region or province is Kigonsera in":"Kigonsera lies in Ruvuma.","which region or province is Tempelhof in":"Tempelhof lies in State of Berlin.","which region or province is Tiancheng in":"Tiancheng lies in Chongqing.","name the first-level division that holds Burriana":"Burriana lies in Valencia.","name the first-level division that holds Malda":"Malda lies in West Bengal.","name the first-level division that holds Yangiqo‘rg‘on":"Yangiqo‘rg‘on lies in Namangan.","name the first-level division that holds Grivegnée":"Grivegnée lies in Wallonia.","which region or province is Manjīl in":"Manjīl lies in Gilan Province.","name the first-level division that holds Buritirama":"Buritirama lies in Bahia.","which region or province is Mohnyin in":"Mohnyin lies in Kachin State.","in what state or province does Chiclana de la Frontera lie":"Chiclana de la Frontera lies in Andalusia.","name the first-level division that holds Pilar de la Horadada":"Pilar de la Horadada lies in Valencia.","which region or province is Sikka in":"Sikka lies in Gujarat.","name the first-level division that holds Mokokchūng":"Mokokchūng lies in Nagaland.","name the first-level division that holds Zibihu":"Zibihu lies in Yunnan.","name the first-level division that holds Herzogenrath":"Herzogenrath lies in North Rhine-Westphalia.","in what state or province does Den Chai lie":"Den Chai lies in Phrae.","which region or province is Sunbury-on-Thames in":"Sunbury-on-Thames lies in England.","in what state or province does Basirpur lie":"Basirpur lies in Punjab.","name the first-level division that holds Pārassāla":"Pārassāla lies in Tamil Nadu.","name the first-level division that holds Elland":"Elland lies in England.","name the first-level division that holds Bačka Palanka":"Bačka Palanka lies in Vojvodina.","in what state or province does Szekszárd lie":"Szekszárd lies in Tolna County.","in what state or province does Ka'ersai lie":"Ka'ersai lies in Xinjiang.","which region or province is Maillardville in":"Maillardville lies in British Columbia.","in what state or province does North Massapequa lie":"North Massapequa lies in New York.","which region or province is Natividade in":"Natividade lies in Rio de Janeiro.","which region or province is Tujunga in":"Tujunga lies in California.","which region or province is Hürth in":"Hürth lies in North Rhine-Westphalia.","in what state or province does Khasab lie":"Khasab lies in Musandam Governorate.","in what state or province does Saumur lie":"Saumur lies in Pays de la Loire.","which region or province is Banikoara in":"Banikoara lies in Alibori.","in what state or province does The Gap lie":"The Gap lies in Queensland.","which region or province is Riversdale in":"Riversdale lies in Western Cape.","in what state or province does Srisailam Project RFC Township lie":"Srisailam Project RFC Township lies in Andhra Pradesh.","in what state or province does Cozumel lie":"Cozumel lies in Quintana Roo.","which region or province is Cape Town in":"Cape Town lies in Western Cape.","which region or province is Fandriana in":"Fandriana lies in Amoron'i Mania.","name the first-level division that holds Yesagyo":"Yesagyo lies in Magway.","name the first-level division that holds Narasannapeta":"Narasannapeta lies in Andhra Pradesh.","in what state or province does Goražde lie":"Goražde lies in Federation of B&H.","which region or province is Setsan in":"Setsan lies in Yangon.","name the first-level division that holds Valente":"Valente lies in Bahia.","which region or province is Sayreville Junction in":"Sayreville Junction lies in New Jersey.","name the first-level division that holds Chengxian Chengguanzhen":"Chengxian Chengguanzhen lies in Gansu.","which region or province is Misburg in":"Misburg lies in Lower Saxony.","in what state or province does Wedel lie":"Wedel lies in Schleswig-Holstein.","which region or province is Ploieşti in":"Ploieşti lies in Prahova.","in what state or province does Andenne lie":"Andenne lies in Wallonia.","in what state or province does Ranau lie":"Ranau lies in Sabah.","name the first-level division that holds Modāsa":"Modāsa lies in Gujarat.","which region or province is La Isla in":"La Isla lies in Veracruz.","which region or province is Cheranellūr in":"Cheranellūr lies in Kerala.","which region or province is Włocławek in":"Włocławek lies in Kujawsko-Pomorskie.","in what state or province does Kilwinning lie":"Kilwinning lies in Scotland.","in what state or province does Daocheng lie":"Daocheng lies in Jiangsu.","in what state or province does Frankenthal lie":"Frankenthal lies in Rheinland-Pfalz.","in what state or province does Fussa lie":"Fussa lies in Tokyo.","name the first-level division that holds Dois Córregos":"Dois Córregos lies in Sao Paulo.","name the first-level division that holds L’govskiy":"L’govskiy lies in Kursk Oblast.","which region or province is Canby in":"Canby lies in Oregon.","name the first-level division that holds Abu Jibeha":"Abu Jibeha lies in Southern Kordofan.","in what state or province does Pirané lie":"Pirané lies in Formosa.","which region or province is Wonji in":"Wonji lies in Oromiya.","which region or province is Nookat in":"Nookat lies in Osh Region.","which region or province is Traralgon in":"Traralgon lies in Victoria.","name the first-level division that holds Kārakkād":"Kārakkād lies in Kerala.","name the first-level division that holds Francavilla al Mare":"Francavilla al Mare lies in Abruzzo.","in what state or province does Musanze lie":"Musanze lies in Northern Province.","which region or province is Lake Country in":"Lake Country lies in British Columbia.","in what state or province does Bellavista lie":"Bellavista lies in San Martin Department.","in what state or province does Unaizah lie":"Unaizah lies in Al-Qassim Region.","name the first-level division that holds Bad Reichenhall":"Bad Reichenhall lies in Bavaria.","in what state or province does Yōga lie":"Yōga lies in Tokyo.","name the first-level division that holds Igarassu":"Igarassu lies in Pernambuco.","which region or province is Maizuru in":"Maizuru lies in Kyoto.","which region or province is Godalming in":"Godalming lies in England.","in what state or province does Baimajing lie":"Baimajing lies in Hainan.","name the first-level division that holds Toktogul":"Toktogul lies in Jalal-Abad Region.","in what state or province does Dalai lie":"Dalai lies in Jilin.","name the first-level division that holds Simancas":"Simancas lies in Madrid.","name the first-level division that holds Amontada":"Amontada lies in Ceara.","name the first-level division that holds Fes":"Fes lies in Fes-Meknes.","name the first-level division that holds Bury St Edmunds":"Bury St Edmunds lies in England.","in what state or province does Habboûch lie":"Habboûch lies in Nabatieh.","which region or province is San Ildefonso in":"San Ildefonso lies in Central Luzon.","in what state or province does Bình Thủy lie":"Bình Thủy lies in Can Tho City.","in what state or province does Maroubra lie":"Maroubra lies in New South Wales."}}},
{"id":"n-214ea699","guard":[["hasAny",["division","province"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Pārdi":"Pārdi lies in Gujarat.","in what state or province does Haldia lie":"Haldia lies in West Bengal.","in what state or province does Banfora lie":"Banfora lies in Cascades Region.","which region or province is Magdeburg in":"Magdeburg lies in Saxony-Anhalt.","name the first-level division that holds Vero Beach":"Vero Beach lies in Florida.","which region or province is Kórinthos in":"Kórinthos lies in Peloponnese.","name the first-level division that holds Boca Chica":"Boca Chica lies in Santo Domingo Province.","in what state or province does Missérété lie":"Missérété lies in Oueme.","which region or province is Pāndharkawada in":"Pāndharkawada lies in Maharashtra.","in what state or province does Acerra lie":"Acerra lies in Campania.","name the first-level division that holds Gādarwāra":"Gādarwāra lies in Madhya Pradesh.","which region or province is La Vista in":"La Vista lies in Nebraska.","which region or province is Kigonsera in":"Kigonsera lies in Ruvuma.","which region or province is Tempelhof in":"Tempelhof lies in State of Berlin.","which region or province is Tiancheng in":"Tiancheng lies in Chongqing.","name the first-level division that holds Burriana":"Burriana lies in Valencia.","name the first-level division that holds Malda":"Malda lies in West Bengal.","name the first-level division that holds Yangiqo‘rg‘on":"Yangiqo‘rg‘on lies in Namangan.","name the first-level division that holds Grivegnée":"Grivegnée lies in Wallonia.","which region or province is Manjīl in":"Manjīl lies in Gilan Province.","name the first-level division that holds Buritirama":"Buritirama lies in Bahia.","which region or province is Mohnyin in":"Mohnyin lies in Kachin State.","in what state or province does Chiclana de la Frontera lie":"Chiclana de la Frontera lies in Andalusia.","name the first-level division that holds Pilar de la Horadada":"Pilar de la Horadada lies in Valencia.","which region or province is Sikka in":"Sikka lies in Gujarat.","name the first-level division that holds Mokokchūng":"Mokokchūng lies in Nagaland.","name the first-level division that holds Zibihu":"Zibihu lies in Yunnan.","name the first-level division that holds Herzogenrath":"Herzogenrath lies in North Rhine-Westphalia.","in what state or province does Den Chai lie":"Den Chai lies in Phrae.","which region or province is Sunbury-on-Thames in":"Sunbury-on-Thames lies in England.","in what state or province does Basirpur lie":"Basirpur lies in Punjab.","name the first-level division that holds Pārassāla":"Pārassāla lies in Tamil Nadu.","name the first-level division that holds Elland":"Elland lies in England.","name the first-level division that holds Bačka Palanka":"Bačka Palanka lies in Vojvodina.","in what state or province does Szekszárd lie":"Szekszárd lies in Tolna County.","in what state or province does Ka'ersai lie":"Ka'ersai lies in Xinjiang.","which region or province is Maillardville in":"Maillardville lies in British Columbia.","in what state or province does North Massapequa lie":"North Massapequa lies in New York.","which region or province is Natividade in":"Natividade lies in Rio de Janeiro.","which region or province is Tujunga in":"Tujunga lies in California.","which region or province is Hürth in":"Hürth lies in North Rhine-Westphalia.","in what state or province does Khasab lie":"Khasab lies in Musandam Governorate.","in what state or province does Saumur lie":"Saumur lies in Pays de la Loire.","which region or province is Banikoara in":"Banikoara lies in Alibori.","in what state or province does The Gap lie":"The Gap lies in Queensland.","which region or province is Riversdale in":"Riversdale lies in Western Cape.","in what state or province does Srisailam Project RFC Township lie":"Srisailam Project RFC Township lies in Andhra Pradesh.","in what state or province does Cozumel lie":"Cozumel lies in Quintana Roo.","which region or province is Cape Town in":"Cape Town lies in Western Cape.","which region or province is Fandriana in":"Fandriana lies in Amoron'i Mania.","name the first-level division that holds Yesagyo":"Yesagyo lies in Magway.","name the first-level division that holds Narasannapeta":"Narasannapeta lies in Andhra Pradesh.","in what state or province does Goražde lie":"Goražde lies in Federation of B&H.","which region or province is Setsan in":"Setsan lies in Yangon.","name the first-level division that holds Valente":"Valente lies in Bahia.","which region or province is Sayreville Junction in":"Sayreville Junction lies in New Jersey.","name the first-level division that holds Chengxian Chengguanzhen":"Chengxian Chengguanzhen lies in Gansu.","which region or province is Misburg in":"Misburg lies in Lower Saxony.","in what state or province does Wedel lie":"Wedel lies in Schleswig-Holstein.","which region or province is Ploieşti in":"Ploieşti lies in Prahova.","in what state or province does Andenne lie":"Andenne lies in Wallonia.","in what state or province does Ranau lie":"Ranau lies in Sabah.","name the first-level division that holds Modāsa":"Modāsa lies in Gujarat.","which region or province is La Isla in":"La Isla lies in Veracruz.","which region or province is Cheranellūr in":"Cheranellūr lies in Kerala.","which region or province is Włocławek in":"Włocławek lies in Kujawsko-Pomorskie.","in what state or province does Kilwinning lie":"Kilwinning lies in Scotland.","in what state or province does Daocheng lie":"Daocheng lies in Jiangsu.","in what state or province does Frankenthal lie":"Frankenthal lies in Rheinland-Pfalz.","in what state or province does Fussa lie":"Fussa lies in Tokyo.","name the first-level division that holds Dois Córregos":"Dois Córregos lies in Sao Paulo.","name the first-level division that holds L’govskiy":"L’govskiy lies in Kursk Oblast.","which region or province is Canby in":"Canby lies in Oregon.","name the first-level division that holds Abu Jibeha":"Abu Jibeha lies in Southern Kordofan.","in what state or province does Pirané lie":"Pirané lies in Formosa.","which region or province is Wonji in":"Wonji lies in Oromiya.","which region or province is Nookat in":"Nookat lies in Osh Region.","which region or province is Traralgon in":"Traralgon lies in Victoria.","name the first-level division that holds Kārakkād":"Kārakkād lies in Kerala.","name the first-level division that holds Francavilla al Mare":"Francavilla al Mare lies in Abruzzo.","in what state or province does Musanze lie":"Musanze lies in Northern Province.","which region or province is Lake Country in":"Lake Country lies in British Columbia.","in what state or province does Bellavista lie":"Bellavista lies in San Martin Department.","in what state or province does Unaizah lie":"Unaizah lies in Al-Qassim Region.","name the first-level division that holds Bad Reichenhall":"Bad Reichenhall lies in Bavaria.","in what state or province does Yōga lie":"Yōga lies in Tokyo.","name the first-level division that holds Igarassu":"Igarassu lies in Pernambuco.","which region or province is Maizuru in":"Maizuru lies in Kyoto.","which region or province is Godalming in":"Godalming lies in England.","in what state or province does Baimajing lie":"Baimajing lies in Hainan.","name the first-level division that holds Toktogul":"Toktogul lies in Jalal-Abad Region.","in what state or province does Dalai lie":"Dalai lies in Jilin.","name the first-level division that holds Simancas":"Simancas lies in Madrid.","name the first-level division that holds Amontada":"Amontada lies in Ceara.","name the first-level division that holds Fes":"Fes lies in Fes-Meknes.","name the first-level division that holds Bury St Edmunds":"Bury St Edmunds lies in England.","in what state or province does Habboûch lie":"Habboûch lies in Nabatieh.","which region or province is San Ildefonso in":"San Ildefonso lies in Central Luzon.","in what state or province does Bình Thủy lie":"Bình Thủy lies in Can Tho City.","in what state or province does Maroubra lie":"Maroubra lies in New South Wales."}}},
{"id":"n-51dc0a0f","guard":[["has","province"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"in"}]]],"mem":{"table":{"which region or province is Magdeburg":"Magdeburg lies in Saxony-Anhalt.","which region or province is Kórinthos":"Kórinthos lies in Peloponnese.","which region or province is Pāndharkawada":"Pāndharkawada lies in Maharashtra.","which region or province is La Vista":"La Vista lies in Nebraska.","which region or province is Kigonsera":"Kigonsera lies in Ruvuma.","which region or province is Tempelhof":"Tempelhof lies in State of Berlin.","which region or province is Tiancheng":"Tiancheng lies in Chongqing.","which region or province is Manjīl":"Manjīl lies in Gilan Province.","which region or province is Mohnyin":"Mohnyin lies in Kachin State.","which region or province is Sikka":"Sikka lies in Gujarat.","which region or province is Sunbury-on-Thames":"Sunbury-on-Thames lies in England.","which region or province is Maillardville":"Maillardville lies in British Columbia.","which region or province is Natividade":"Natividade lies in Rio de Janeiro.","which region or province is Tujunga":"Tujunga lies in California.","which region or province is Hürth":"Hürth lies in North Rhine-Westphalia.","which region or province is Banikoara":"Banikoara lies in Alibori.","which region or province is Riversdale":"Riversdale lies in Western Cape.","which region or province is Cape Town":"Cape Town lies in Western Cape.","which region or province is Fandriana":"Fandriana lies in Amoron'i Mania.","which region or province is Setsan":"Setsan lies in Yangon.","which region or province is Sayreville Junction":"Sayreville Junction lies in New Jersey.","which region or province is Misburg":"Misburg lies in Lower Saxony.","which region or province is Ploieşti":"Ploieşti lies in Prahova.","which region or province is La Isla":"La Isla lies in Veracruz.","which region or province is Cheranellūr":"Cheranellūr lies in Kerala.","which region or province is Włocławek":"Włocławek lies in Kujawsko-Pomorskie.","which region or province is Canby":"Canby lies in Oregon.","which region or province is Wonji":"Wonji lies in Oromiya.","which region or province is Nookat":"Nookat lies in Osh Region.","which region or province is Traralgon":"Traralgon lies in Victoria.","which region or province is Lake Country":"Lake Country lies in British Columbia.","which region or province is Maizuru":"Maizuru lies in Kyoto.","which region or province is Godalming":"Godalming lies in England.","which region or province is San Ildefonso":"San Ildefonso lies in Central Luzon."}}},
{"id":"n-c8765b58","guard":[["has","lie"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"in"}]]],"mem":{"table":{"what state or province does Haldia lie":"Haldia lies in West Bengal.","what state or province does Banfora lie":"Banfora lies in Cascades Region.","what state or province does Missérété lie":"Missérété lies in Oueme.","what state or province does Acerra lie":"Acerra lies in Campania.","what state or province does Chiclana de la Frontera lie":"Chiclana de la Frontera lies in Andalusia.","what state or province does Den Chai lie":"Den Chai lies in Phrae.","what state or province does Basirpur lie":"Basirpur lies in Punjab.","what state or province does Szekszárd lie":"Szekszárd lies in Tolna County.","what state or province does Ka'ersai lie":"Ka'ersai lies in Xinjiang.","what state or province does North Massapequa lie":"North Massapequa lies in New York.","what state or province does Khasab lie":"Khasab lies in Musandam Governorate.","what state or province does Saumur lie":"Saumur lies in Pays de la Loire.","what state or province does The Gap lie":"The Gap lies in Queensland.","what state or province does Srisailam Project RFC Township lie":"Srisailam Project RFC Township lies in Andhra Pradesh.","what state or province does Cozumel lie":"Cozumel lies in Quintana Roo.","what state or province does Goražde lie":"Goražde lies in Federation of B&H.","what state or province does Wedel lie":"Wedel lies in Schleswig-Holstein.","what state or province does Andenne lie":"Andenne lies in Wallonia.","what state or province does Ranau lie":"Ranau lies in Sabah.","what state or province does Kilwinning lie":"Kilwinning lies in Scotland.","what state or province does Daocheng lie":"Daocheng lies in Jiangsu.","what state or province does Frankenthal lie":"Frankenthal lies in Rheinland-Pfalz.","what state or province does Fussa lie":"Fussa lies in Tokyo.","what state or province does Pirané lie":"Pirané lies in Formosa.","what state or province does Musanze lie":"Musanze lies in Northern Province.","what state or province does Bellavista lie":"Bellavista lies in San Martin Department.","what state or province does Unaizah lie":"Unaizah lies in Al-Qassim Region.","what state or province does Yōga lie":"Yōga lies in Tokyo.","what state or province does Baimajing lie":"Baimajing lies in Hainan.","what state or province does Dalai lie":"Dalai lies in Jilin.","what state or province does Habboûch lie":"Habboûch lies in Nabatieh.","what state or province does Bình Thủy lie":"Bình Thủy lies in Can Tho City.","what state or province does Maroubra lie":"Maroubra lies in New South Wales."}}},
{"id":"n-eda8c6c3","guard":[["hasAny",["count","godalming","how many","how many items","normalise","normalize","number of items","simplify the text","sunburyonthames"]]],"pyramid":["render.str",["transform.norm",{"lit":"England"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-2b5fcb0b","guard":[["hasAny",["buritirama","valente"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Bahia."]},["sense.lastWord"]],"mem":null},
{"id":"n-b4526259","guard":[["hasAny",["burriana","horadada"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Valencia."]},["sense.lastWord"]],"mem":null},
{"id":"n-d7f7929a","guard":[["hasAny",["modāsa","pārdi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Gujarat."]},["sense.lastWord"]],"mem":null},
{"id":"n-f1391297","guard":[["hasAny",["bury","elland"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in England."]},["sense.lastWord"]],"mem":null},
{"id":"n-1605a72d","guard":[["hasAny",["bury","capitalise","capitalize","capitalize each word","elland","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in England."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1a868329","guard":[["hasAny",["buritirama","lower case","lowercase","small letters","valente"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Bahia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2f6348b8","guard":[["hasAny",["buritirama","invert case","swap case","toggle case","valente"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Bahia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3309d605","guard":[["hasAny",["andenne","grivegnée","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"Wallonia"},["sense.lastWord"]]],"mem":null},
{"id":"n-33e01a86","guard":[["hasAny",["all caps","bury","capital letters","capitals","elland","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in England."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-390b3e3c","guard":[["hasAny",["andenne","grivegnée","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"Wallonia"},["sense.lastWord"]]],"mem":null},
{"id":"n-4cde35ce","guard":[["hasAny",["burriana","capitalise","capitalize","capitalize each word","horadada","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Valencia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5cefdee9","guard":[["hasAny",["burriana","horadada","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Valencia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5de15bf8","guard":[["hasAny",["buritirama","capitalise","capitalize","capitalize each word","title case","valente"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Bahia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-666d2c69","guard":[["hasAny",["bury","elland","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in England."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6b2c1d90","guard":[["hasAny",["andenne","grivegnée","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"Wallonia"},["sense.lastWord"]]],"mem":null},
{"id":"n-6fe0b65a","guard":[["hasAny",["lower case","lowercase","modāsa","pārdi","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Gujarat."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-81dd85c2","guard":[["hasAny",["burriana","horadada","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Valencia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9e934022","guard":[["hasAny",["all caps","burriana","capital letters","capitals","horadada","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Valencia."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-9ec525f5","guard":[["hasAny",["andenne","delete","grivegnée","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Wallonia"},["sense.lastWord"]]],"mem":null},
{"id":"n-bece0265","guard":[["hasAny",["capitalise","capitalize","capitalize each word","modāsa","pārdi","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Gujarat."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c41b0b20","guard":[["hasAny",["all caps","capital letters","capitals","modāsa","pārdi","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Gujarat."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-d5ffe151","guard":[["hasAny",["bury","elland","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in England."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e778ce38","guard":[["hasAny",["all caps","buritirama","capital letters","capitals","upper case","uppercase","valente"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Bahia."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f66ccb5e","guard":[["hasAny",["godalming","longest","longest one","longest word","sunburyonthames"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in England."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fe55f665","guard":[["hasAny",["invert case","modāsa","pārdi","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Gujarat."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-06aeaee0","guard":[["hasAny",["country","delete","maillardville","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"British Columbia"},["sense.after",{"lit":"province"}]]],"mem":null},
{"id":"n-0a968f72","guard":[["hasAny",["buritirama","each word","split into words","valente"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Bahia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-19f28b9e","guard":[["hasAny",["delete","fussa","remove","strip out","without","yōga"]]],"pyramid":["render.str",["transform.remove",{"lit":"Tokyo"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-2ebca154","guard":[["hasAny",["delete","fussa","remove","strip out","without","yōga"]]],"pyramid":["render.str",["transform.remove",{"lit":"Tokyo"},["sense.after",{"lit":"province"}]]],"mem":null},
{"id":"n-30a36a11","guard":[["hasAny",["fussa","item number","nth","position","yōga"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Tokyo."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4079f82d","guard":[["hasAny",["delete","herzogenrath","hürth","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"North Rhine-Westphalia"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-46b02498","guard":[["hasAny",["herzogenrath","hürth","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"North Rhine-Westphalia"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-472e7dfe","guard":[["hasAny",["item number","modāsa","nth","position","pārdi"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Gujarat."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-52705737","guard":[["hasAny",["bury","each word","elland","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in England."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-691b792a","guard":[["hasAny",["herzogenrath","hürth","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"North Rhine-Westphalia"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-6c1c9b93","guard":[["hasAny",["andenne","grivegnée","longest","longest one","longest word","separate by","split","split by"]]],"pyramid":["render.str",["aggregate.longest",["transform.split",{"lit":"Wallonia"},["sense.lastWord"]]]],"mem":null},
{"id":"n-6e162234","guard":[["hasAny",["burriana","each word","horadada","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Valencia."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6ecb959e","guard":[["hasAny",["godalming","item number","nth","position","sunburyonthames"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in England."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-799cbb11","guard":[["hasAny",["bury","each word","elland","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in England."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7dd933d6","guard":[["hasAny",["burriana","horadada","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Valencia."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-7faa634b","guard":[["hasAny",["each word","modāsa","pārdi","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Gujarat."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8a079506","guard":[["hasAny",["buritirama","item number","nth","position","valente"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Bahia."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-8e844b84","guard":[["hasAny",["andenne","grivegnée","separate by","shortest","shortest one","shortest word","split","split by"]]],"pyramid":["render.str",["aggregate.shortest",["transform.split",{"lit":"Wallonia"},["sense.lastWord"]]]],"mem":null},
{"id":"n-902a5626","guard":[["hasAny",["delete","godalming","remove","strip out","sunburyonthames","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"england"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-9e1f9c67","guard":[["hasAny",["country","delete","maillardville","remove","strip out","without"]],["has","region"]],"pyramid":["render.str",["transform.remove",{"lit":"British Columbia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-b15e2dad","guard":[["hasAny",["delete","godalming","remove","strip out","sunburyonthames","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"England"},["sense.after",{"lit":"province"}]]],"mem":null},
{"id":"n-b4c580e2","guard":[["hasAny",["buritirama","normalise","normalize","simplify the text","valente"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Bahia."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-c2db821f","guard":[["hasAny",["andenne","change to","grivegnée","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",{"lit":"Wallonia"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-c2fec387","guard":[["hasAny",["modāsa","normalise","normalize","pārdi","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Gujarat."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-cc0b27fd","guard":[["hasAny",["delete","godalming","remove","strip out","sunburyonthames","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"England"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-cd73d355","guard":[["hasAny",["delete","godalming","remove","strip out","sunburyonthames","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"england"},["sense.after",{"lit":"province"}]]],"mem":null},
{"id":"n-cdab7dac","guard":[["hasAny",["herzogenrath","hürth","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"North Rhine-Westphalia"},["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-dd84f745","guard":[["hasAny",["buritirama","each word","split into words","valente"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Bahia."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e2d60f27","guard":[["hasAny",["bury","elland","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in England."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-e4ab557c","guard":[["hasAny",["burriana","each word","horadada","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Valencia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f835b8b8","guard":[["hasAny",["each word","modāsa","pārdi","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Gujarat."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-46d590af","guard":[["hasAny",["cheranellūr","count","how many","how many items","normalise","normalize","number of items","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":"Kerala"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-5b691e54","guard":[["hasAny",["count","how many","how many items","normalise","normalize","number of items","sikka","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":"Gujarat"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-b65a6cdd","guard":[["hasAny",["count","how many","how many items","maillardville","normalise","normalize","number of items","simplify the text"]]],"pyramid":["render.str",["transform.norm",{"lit":"British Columbia"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-006f9e43","guard":[["has","yangiqorgon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Yangiqo‘rg‘on":"Yangiqo‘rg‘on lies in Namangan."}}},
{"id":"n-032629b2","guard":[["has","fes"]],"pyramid":["render.template",{"lit":["Fes lies in ",{"slot":0},"-Meknes."]},["sense.lastWord"]],"mem":null},
{"id":"n-04d2443b","guard":[["hasAny",["ildefonso","province","region","san"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is San Ildefonso in":"San Ildefonso lies in Central Luzon."}}},
{"id":"n-0923b5fc","guard":[["hasAny",["beach","vero"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Vero Beach":"Vero Beach lies in Florida."}}},
{"id":"n-0b040ab9","guard":[["has","fes"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Fes":"Fes lies in Fes-Meknes."}}},
{"id":"n-0dfeb102","guard":[["hasAny",["division","firstlevel","holds","kārakkād","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Kārakkād":"Kārakkād lies in Kerala."}}},
{"id":"n-10997330","guard":[["hasAny",["canby","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Canby in":"Canby lies in Oregon."}}},
{"id":"n-118bed98","guard":[["has","magdeburg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Magdeburg in":"Magdeburg lies in Saxony-Anhalt."}}},
{"id":"n-11be2f0f","guard":[["hasAny",["kilwinning","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Kilwinning lie":"Kilwinning lies in Scotland."}}},
{"id":"n-12b90e18","guard":[["hasAny",["province","region","traralgon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Traralgon in":"Traralgon lies in Victoria."}}},
{"id":"n-13dac7b9","guard":[["hasAny",["lie","province","state","szekszárd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Szekszárd lie":"Szekszárd lies in Tolna County."}}},
{"id":"n-1586c217","guard":[["hasAny",["chai","den","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Den Chai lie":"Den Chai lies in Phrae."}}},
{"id":"n-17f50596","guard":[["has","malda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Malda":"Malda lies in West Bengal."}}},
{"id":"n-1ab26471","guard":[["has","pāndharkawada"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Pāndharkawada in":"Pāndharkawada lies in Maharashtra."}}},
{"id":"n-1ac63fa1","guard":[["has","setsan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Setsan in":"Setsan lies in Yangon."}}},
{"id":"n-1c4248e0","guard":[["hasAny",["lie","musanze","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Musanze lie":"Musanze lies in Northern Province."}}},
{"id":"n-1d028f03","guard":[["hasAny",["godalming","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Godalming in":"Godalming lies in England."}}},
{"id":"n-1d41027f","guard":[["hasAny",["division","firstlevel","grivegnée","holds","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Grivegnée":"Grivegnée lies in Wallonia."}}},
{"id":"n-21ba456f","guard":[["has","kigonsera"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Kigonsera in":"Kigonsera lies in Ruvuma."}}},
{"id":"n-22bb3a43","guard":[["has","pārassāla"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Pārassāla":"Pārassāla lies in Tamil Nadu."}}},
{"id":"n-24dab19e","guard":[["has","valente"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Valente":"Valente lies in Bahia."}}},
{"id":"n-2734dffd","guard":[["hasAny",["maillardville","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Maillardville in":"Maillardville lies in British Columbia."}}},
{"id":"n-2982a1bf","guard":[["hasAny",["province","region","wonji"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Wonji in":"Wonji lies in Oromiya."}}},
{"id":"n-2a89eb79","guard":[["has","lgovskiy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds L’govskiy":"L’govskiy lies in Kursk Oblast."}}},
{"id":"n-2d45a6da","guard":[["hasAny",["bình","thủy"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Bình Thủy lie":"Bình Thủy lies in Can Tho City."}}},
{"id":"n-2db79116","guard":[["has","sikka"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Sikka in":"Sikka lies in Gujarat."}}},
{"id":"n-2e5713b1","guard":[["has","lgovskiy"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kursk Oblast."]},["sense.lastWord"]],"mem":null},
{"id":"n-2f2cca86","guard":[["has","gādarwāra"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madhya Pradesh."]},["sense.lastWord"]],"mem":null},
{"id":"n-2f96a899","guard":[["has","narasannapeta"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Andhra Pradesh."]},["sense.lastWord"]],"mem":null},
{"id":"n-30480686","guard":[["has","banikoara"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Banikoara in":"Banikoara lies in Alibori."}}},
{"id":"n-304d4454","guard":[["hasAny",["division","firstlevel","holds","name","pārassāla"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Pārassāla":"Pārassāla lies in Tamil Nadu."}}},
{"id":"n-32b6b26e","guard":[["hasAny",["bad","reichenhall"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Bad Reichenhall":"Bad Reichenhall lies in Bavaria."}}},
{"id":"n-3356c4e1","guard":[["hasAny",["cape","province","region","town"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Cape Town in":"Cape Town lies in Western Cape."}}},
{"id":"n-337ea190","guard":[["has","ranau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Ranau lie":"Ranau lies in Sabah."}}},
{"id":"n-33cb0638","guard":[["hasAny",["maizuru","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Maizuru in":"Maizuru lies in Kyoto."}}},
{"id":"n-33ea4467","guard":[["has","malda"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in West Bengal."]},["sense.lastWord"]],"mem":null},
{"id":"n-3443ed87","guard":[["has","kórinthos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Kórinthos in":"Kórinthos lies in Peloponnese."}}},
{"id":"n-350b90dc","guard":[["has","fandriana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Fandriana in":"Fandriana lies in Amoron'i Mania."}}},
{"id":"n-3512501c","guard":[["has","buritirama"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Buritirama":"Buritirama lies in Bahia."}}},
{"id":"n-359d9cd3","guard":[["hasAny",["baimajing","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Baimajing lie":"Baimajing lies in Hainan."}}},
{"id":"n-365e2ad8","guard":[["has","amontada"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Ceara."]},["sense.lastWord"]],"mem":null},
{"id":"n-3731ddb3","guard":[["hasAny",["country","lake","province","region"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Lake Country in":"Lake Country lies in British Columbia."}}},
{"id":"n-37f5ca23","guard":[["hasAny",["division","elland","firstlevel","holds","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Elland":"Elland lies in England."}}},
{"id":"n-392685cc","guard":[["hasAny",["province","region","tujunga"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Tujunga in":"Tujunga lies in California."}}},
{"id":"n-3a8a8a14","guard":[["hasAny",["banfora","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Banfora lie":"Banfora lies in Cascades Region."}}},
{"id":"n-3be35b79","guard":[["hasAny",["boca","chica","division","firstlevel","holds","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Boca Chica":"Boca Chica lies in Santo Domingo Province."}}},
{"id":"n-3c32e0d6","guard":[["hasAny",["isla","la","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is La Isla in":"La Isla lies in Veracruz."}}},
{"id":"n-3dd16872","guard":[["hasAny",["lie","missérété","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Missérété lie":"Missérété lies in Oueme."}}},
{"id":"n-3ddffd2c","guard":[["has","simancas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Simancas":"Simancas lies in Madrid."}}},
{"id":"n-3fc9f714","guard":[["hasAny",["goražde","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Goražde lie":"Goražde lies in Federation of B&H."}}},
{"id":"n-405adbb2","guard":[["has","pirané"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Pirané lie":"Pirané lies in Formosa."}}},
{"id":"n-4620d739","guard":[["has","mokokchūng"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Mokokchūng":"Mokokchūng lies in Nagaland."}}},
{"id":"n-464a6de8","guard":[["hasAny",["lie","province","state","unaizah"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Unaizah lie":"Unaizah lies in Al-Qassim Region."}}},
{"id":"n-46fbac58","guard":[["has","bad"],["has","name"]],"pyramid":["render.template",{"lit":["Bad ",{"slot":0}," lies in Bavaria."]},["sense.lastWord"]],"mem":null},
{"id":"n-476d9891","guard":[["has","bačka"]],"pyramid":["render.template",{"lit":["Bačka ",{"slot":0}," lies in Vojvodina."]},["sense.lastWord"]],"mem":null},
{"id":"n-47acacbc","guard":[["has","simancas"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madrid."]},["sense.lastWord"]],"mem":null},
{"id":"n-491f7f2c","guard":[["has","khasab"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Khasab lie":"Khasab lies in Musandam Governorate."}}},
{"id":"n-4ba7c5f7","guard":[["has","manjīl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Manjīl in":"Manjīl lies in Gilan Province."}}},
{"id":"n-4c318239","guard":[["hasAny",["lie","massapequa","north","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does North Massapequa lie":"North Massapequa lies in New York."}}},
{"id":"n-4e25ba23","guard":[["hasAny",["province","region","tempelhof"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Tempelhof in":"Tempelhof lies in State of Berlin."}}},
{"id":"n-4f02b13a","guard":[["hasAny",["division","firstlevel","herzogenrath","holds","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Herzogenrath":"Herzogenrath lies in North Rhine-Westphalia."}}},
{"id":"n-4f4609cf","guard":[["hasAny",["division","firstlevel","gādarwāra","holds","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Gādarwāra":"Gādarwāra lies in Madhya Pradesh."}}},
{"id":"n-4ff553a0","guard":[["has","beach"]],"pyramid":["render.template",{"lit":["Vero ",{"slot":0}," lies in Florida."]},["sense.lastWord"]],"mem":null},
{"id":"n-5449a561","guard":[["has","toktogul"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Jalal-Abad Region."]},["sense.lastWord"]],"mem":null},
{"id":"n-55a756b2","guard":[["hasAny",["córregos","division","dois","firstlevel","holds","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Dois Córregos":"Dois Córregos lies in Sao Paulo."}}},
{"id":"n-5695d4f6","guard":[["hasAny",["andenne","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Andenne lie":"Andenne lies in Wallonia."}}},
{"id":"n-57a43a53","guard":[["hasAny",["bình","lie","province","state","thủy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Bình Thủy lie":"Bình Thủy lies in Can Tho City."}}},
{"id":"n-57f7d60b","guard":[["hasAny",["bury","division","edmunds","firstlevel","holds","name","st"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Bury St Edmunds":"Bury St Edmunds lies in England."}}},
{"id":"n-59c0e80b","guard":[["hasAny",["division","firstlevel","holds","igarassu","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Igarassu":"Igarassu lies in Pernambuco."}}},
{"id":"n-5b30a2ba","guard":[["hasAny",["hürth","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Hürth in":"Hürth lies in North Rhine-Westphalia."}}},
{"id":"n-5bbb41d2","guard":[["hasAny",["lie","project","province","rfc","srisailam","state","township"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Srisailam Project RFC Township lie":"Srisailam Project RFC Township lies in Andhra Pradesh."}}},
{"id":"n-5cde478b","guard":[["hasAny",["division","firstlevel","holds","name","simancas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Simancas":"Simancas lies in Madrid."}}},
{"id":"n-5d61c42d","guard":[["has","kārakkād"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Kārakkād":"Kārakkād lies in Kerala."}}},
{"id":"n-5f0ebb22","guard":[["hasAny",["division","firstlevel","holds","name","yangiqorgon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Yangiqo‘rg‘on":"Yangiqo‘rg‘on lies in Namangan."}}},
{"id":"n-622c193c","guard":[["has","banfora"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Banfora lie":"Banfora lies in Cascades Region."}}},
{"id":"n-62459735","guard":[["has","basirpur"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Basirpur lie":"Basirpur lies in Punjab."}}},
{"id":"n-63e10ebc","guard":[["hasAny",["bellavista","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Bellavista lie":"Bellavista lies in San Martin Department."}}},
{"id":"n-63f317b7","guard":[["has","maroubra"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Maroubra lie":"Maroubra lies in New South Wales."}}},
{"id":"n-648a5c69","guard":[["has","sunburyonthames"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Sunbury-on-Thames in":"Sunbury-on-Thames lies in England."}}},
{"id":"n-65046cd5","guard":[["hasAny",["massapequa","north"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does North Massapequa lie":"North Massapequa lies in New York."}}},
{"id":"n-67524cbe","guard":[["has","traralgon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Traralgon in":"Traralgon lies in Victoria."}}},
{"id":"n-6785c14d","guard":[["has","vista"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is La Vista in":"La Vista lies in Nebraska."}}},
{"id":"n-67c45c61","guard":[["hasAny",["boca","chica"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Boca Chica":"Boca Chica lies in Santo Domingo Province."}}},
{"id":"n-6808947d","guard":[["hasAny",["province","region","setsan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Setsan in":"Setsan lies in Yangon."}}},
{"id":"n-68257409","guard":[["has","hürth"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Hürth in":"Hürth lies in North Rhine-Westphalia."}}},
{"id":"n-68384796","guard":[["hasAny",["magdeburg","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Magdeburg in":"Magdeburg lies in Saxony-Anhalt."}}},
{"id":"n-685e27e9","guard":[["hasAny",["manjīl","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Manjīl in":"Manjīl lies in Gilan Province."}}},
{"id":"n-69fbb7fb","guard":[["has","modāsa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Modāsa":"Modāsa lies in Gujarat."}}},
{"id":"n-6a6c39c7","guard":[["has","herzogenrath"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in North Rhine-Westphalia."]},["sense.lastWord"]],"mem":null},
{"id":"n-6c732126","guard":[["hasAny",["gap","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does The Gap lie":"The Gap lies in Queensland."}}},
{"id":"n-6d0fd7eb","guard":[["hasAny",["dalai","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Dalai lie":"Dalai lies in Jilin."}}},
{"id":"n-6f03d2d9","guard":[["hasAny",["division","firstlevel","holds","lgovskiy","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds L’govskiy":"L’govskiy lies in Kursk Oblast."}}},
{"id":"n-6f08a8cc","guard":[["hasAny",["haldia","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Haldia lie":"Haldia lies in West Bengal."}}},
{"id":"n-6ff9ce5e","guard":[["has","kilwinning"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Kilwinning lie":"Kilwinning lies in Scotland."}}},
{"id":"n-70afc66f","guard":[["hasAny",["abu","division","firstlevel","holds","jibeha","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Abu Jibeha":"Abu Jibeha lies in Southern Kordofan."}}},
{"id":"n-71eb2357","guard":[["has","natividade"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Natividade in":"Natividade lies in Rio de Janeiro."}}},
{"id":"n-71f598bb","guard":[["has","maillardville"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Maillardville in":"Maillardville lies in British Columbia."}}},
{"id":"n-72f9ce89","guard":[["hasAny",["division","firstlevel","holds","name","yesagyo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Yesagyo":"Yesagyo lies in Magway."}}},
{"id":"n-7301c03b","guard":[["has","boca"]],"pyramid":["render.template",{"lit":["Boca ",{"slot":0}," lies in Santo Domingo Province."]},["sense.lastWord"]],"mem":null},
{"id":"n-734b0b70","guard":[["has","włocławek"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Włocławek in":"Włocławek lies in Kujawsko-Pomorskie."}}},
{"id":"n-74cedc0f","guard":[["hasAny",["buritirama","division","firstlevel","holds","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Buritirama":"Buritirama lies in Bahia."}}},
{"id":"n-77099554","guard":[["has","misburg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Misburg in":"Misburg lies in Lower Saxony."}}},
{"id":"n-77be3b69","guard":[["hasAny",["kaersai","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Ka'ersai lie":"Ka'ersai lies in Xinjiang."}}},
{"id":"n-77f52fcb","guard":[["has","goražde"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Goražde lie":"Goražde lies in Federation of B&H."}}},
{"id":"n-78683f30","guard":[["hasAny",["al","division","firstlevel","francavilla","holds","mare","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Francavilla al Mare":"Francavilla al Mare lies in Abruzzo."}}},
{"id":"n-790171f6","guard":[["has","saumur"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Saumur lie":"Saumur lies in Pays de la Loire."}}},
{"id":"n-7956f83f","guard":[["hasAny",["division","firstlevel","holds","name","toktogul"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Toktogul":"Toktogul lies in Jalal-Abad Region."}}},
{"id":"n-7a06fd75","guard":[["has","amontada"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Amontada":"Amontada lies in Ceara."}}},
{"id":"n-7b5fa21d","guard":[["hasAny",["daocheng","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Daocheng lie":"Daocheng lies in Jiangsu."}}},
{"id":"n-7d13f86b","guard":[["hasAny",["cheranellūr","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Cheranellūr in":"Cheranellūr lies in Kerala."}}},
{"id":"n-7d20cfca","guard":[["has","szekszárd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Szekszárd lie":"Szekszárd lies in Tolna County."}}},
{"id":"n-7e1416bd","guard":[["hasAny",["mohnyin","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Mohnyin in":"Mohnyin lies in Kachin State."}}},
{"id":"n-7f7d25a6","guard":[["has","canby"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Canby in":"Canby lies in Oregon."}}},
{"id":"n-83089ffb","guard":[["has","unaizah"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Unaizah lie":"Unaizah lies in Al-Qassim Region."}}},
{"id":"n-834c5d1d","guard":[["hasAny",["bačka","division","firstlevel","holds","name","palanka"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Bačka Palanka":"Bačka Palanka lies in Vojvodina."}}},
{"id":"n-83e06856","guard":[["has","baimajing"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Baimajing lie":"Baimajing lies in Hainan."}}},
{"id":"n-86409ed6","guard":[["has","tiancheng"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Tiancheng in":"Tiancheng lies in Chongqing."}}},
{"id":"n-869ad937","guard":[["has","burriana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Burriana":"Burriana lies in Valencia."}}},
{"id":"n-88baef76","guard":[["hasAny",["junction","province","region","sayreville"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Sayreville Junction in":"Sayreville Junction lies in New Jersey."}}},
{"id":"n-89cd8ff9","guard":[["has","yesagyo"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Magway."]},["sense.lastWord"]],"mem":null},
{"id":"n-8a359cce","guard":[["hasAny",["frankenthal","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Frankenthal lie":"Frankenthal lies in Rheinland-Pfalz."}}},
{"id":"n-8a641da1","guard":[["hasAny",["division","firstlevel","holds","name","zibihu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Zibihu":"Zibihu lies in Yunnan."}}},
{"id":"n-8a80b374","guard":[["hasAny",["fussa","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Fussa lie":"Fussa lies in Tokyo."}}},
{"id":"n-8bdffd90","guard":[["has","toktogul"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Toktogul":"Toktogul lies in Jalal-Abad Region."}}},
{"id":"n-8db4cfdc","guard":[["hasAny",["bad","division","firstlevel","holds","name","reichenhall"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Bad Reichenhall":"Bad Reichenhall lies in Bavaria."}}},
{"id":"n-8e0f5459","guard":[["has","tempelhof"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Tempelhof in":"Tempelhof lies in State of Berlin."}}},
{"id":"n-8e43c442","guard":[["hasAny",["córregos","dois"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Dois Córregos":"Dois Córregos lies in Sao Paulo."}}},
{"id":"n-8ed58343","guard":[["has","andenne"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Andenne lie":"Andenne lies in Wallonia."}}},
{"id":"n-8f0fac4a","guard":[["has","herzogenrath"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Herzogenrath":"Herzogenrath lies in North Rhine-Westphalia."}}},
{"id":"n-8f5d4988","guard":[["hasAny",["division","firstlevel","holds","name","valente"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Valente":"Valente lies in Bahia."}}},
{"id":"n-903f3756","guard":[["hasAny",["chiclana","de","frontera","la","lie","province","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Chiclana de la Frontera lie":"Chiclana de la Frontera lies in Andalusia."}}},
{"id":"n-92c20b79","guard":[["has","habboûch"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Habboûch lie":"Habboûch lies in Nabatieh."}}},
{"id":"n-93b12da6","guard":[["hasAny",["bačka","palanka"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Bačka Palanka":"Bačka Palanka lies in Vojvodina."}}},
{"id":"n-9561d8dd","guard":[["has","yōga"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Yōga lie":"Yōga lies in Tokyo."}}},
{"id":"n-98180d78","guard":[["hasAny",["banikoara","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Banikoara in":"Banikoara lies in Alibori."}}},
{"id":"n-98e15284","guard":[["hasAny",["amontada","division","firstlevel","holds","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Amontada":"Amontada lies in Ceara."}}},
{"id":"n-98fbbbed","guard":[["has","acerra"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Acerra lie":"Acerra lies in Campania."}}},
{"id":"n-99b10d6e","guard":[["hasAny",["de","division","firstlevel","holds","horadada","la","name","pilar"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Pilar de la Horadada":"Pilar de la Horadada lies in Valencia."}}},
{"id":"n-9b10eb6f","guard":[["hasAny",["country","lake","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Lake Country in":"Lake Country lies in British Columbia."}}},
{"id":"n-9ba003e5","guard":[["hasAny",["lie","province","saumur","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Saumur lie":"Saumur lies in Pays de la Loire."}}},
{"id":"n-9cd50cdd","guard":[["hasAny",["habboûch","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Habboûch lie":"Habboûch lies in Nabatieh."}}},
{"id":"n-9fb8d8e9","guard":[["has","igarassu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Igarassu":"Igarassu lies in Pernambuco."}}},
{"id":"n-a043d84c","guard":[["has","isla"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is La Isla in":"La Isla lies in Veracruz."}}},
{"id":"n-a12f4e0c","guard":[["has","grivegnée"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Grivegnée":"Grivegnée lies in Wallonia."}}},
{"id":"n-a23c1e33","guard":[["has","missérété"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Missérété lie":"Missérété lies in Oueme."}}},
{"id":"n-a319c83c","guard":[["has","mohnyin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Mohnyin in":"Mohnyin lies in Kachin State."}}},
{"id":"n-a39d4b81","guard":[["hasAny",["junction","province","region","sayreville"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Sayreville Junction in":"Sayreville Junction lies in New Jersey."}}},
{"id":"n-a6187c7b","guard":[["has","wonji"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Wonji in":"Wonji lies in Oromiya."}}},
{"id":"n-a7d8edb6","guard":[["hasAny",["division","firstlevel","holds","mokokchūng","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Mokokchūng":"Mokokchūng lies in Nagaland."}}},
{"id":"n-a7de1a4e","guard":[["hasAny",["basirpur","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Basirpur lie":"Basirpur lies in Punjab."}}},
{"id":"n-a9b394f0","guard":[["has","abu"]],"pyramid":["render.template",{"lit":["Abu ",{"slot":0}," lies in Southern Kordofan."]},["sense.lastWord"]],"mem":null},
{"id":"n-a9e80f1a","guard":[["has","godalming"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Godalming in":"Godalming lies in England."}}},
{"id":"n-aa361289","guard":[["hasAny",["cozumel","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Cozumel lie":"Cozumel lies in Quintana Roo."}}},
{"id":"n-aa52554e","guard":[["hasAny",["abu","jibeha"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Abu Jibeha":"Abu Jibeha lies in Southern Kordofan."}}},
{"id":"n-ac578efc","guard":[["hasAny",["chengguanzhen","chengxian","division","firstlevel","holds","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Chengxian Chengguanzhen":"Chengxian Chengguanzhen lies in Gansu."}}},
{"id":"n-adfee7cc","guard":[["has","daocheng"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Daocheng lie":"Daocheng lies in Jiangsu."}}},
{"id":"n-b05675b7","guard":[["hasAny",["province","region","riversdale"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Riversdale in":"Riversdale lies in Western Cape."}}},
{"id":"n-b1228bd2","guard":[["has","pārdi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Pārdi":"Pārdi lies in Gujarat."}}},
{"id":"n-b2686a47","guard":[["hasAny",["lie","pirané","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Pirané lie":"Pirané lies in Formosa."}}},
{"id":"n-b2d328c3","guard":[["hasAny",["kórinthos","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Kórinthos in":"Kórinthos lies in Peloponnese."}}},
{"id":"n-b58cf9dc","guard":[["has","bellavista"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Bellavista lie":"Bellavista lies in San Martin Department."}}},
{"id":"n-b5b189c0","guard":[["hasAny",["lie","province","ranau","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Ranau lie":"Ranau lies in Sabah."}}},
{"id":"n-b6e8c8d2","guard":[["has","frankenthal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Frankenthal lie":"Frankenthal lies in Rheinland-Pfalz."}}},
{"id":"n-b79fd567","guard":[["has","dalai"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Dalai lie":"Dalai lies in Jilin."}}},
{"id":"n-ba8fe138","guard":[["has","cozumel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Cozumel lie":"Cozumel lies in Quintana Roo."}}},
{"id":"n-bb49018f","guard":[["has","wedel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Wedel lie":"Wedel lies in Schleswig-Holstein."}}},
{"id":"n-be37e669","guard":[["hasAny",["acerra","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Acerra lie":"Acerra lies in Campania."}}},
{"id":"n-bf19d488","guard":[["hasAny",["lie","province","state","wedel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Wedel lie":"Wedel lies in Schleswig-Holstein."}}},
{"id":"n-c00f6d4a","guard":[["hasAny",["natividade","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Natividade in":"Natividade lies in Rio de Janeiro."}}},
{"id":"n-c080d970","guard":[["hasAny",["province","region","tiancheng"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Tiancheng in":"Tiancheng lies in Chongqing."}}},
{"id":"n-c1567efd","guard":[["has","chengguanzhen"]],"pyramid":["render.template",{"lit":["Chengxian ",{"slot":0}," lies in Gansu."]},["sense.lastWord"]],"mem":null},
{"id":"n-c1b5acde","guard":[["has","cheranellūr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Cheranellūr in":"Cheranellūr lies in Kerala."}}},
{"id":"n-c2b9aaa7","guard":[["has","riversdale"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Riversdale in":"Riversdale lies in Western Cape."}}},
{"id":"n-c2da8730","guard":[["has","elland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Elland":"Elland lies in England."}}},
{"id":"n-c601283d","guard":[["hasAny",["cape","province","region","town"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Cape Town in":"Cape Town lies in Western Cape."}}},
{"id":"n-c7b32654","guard":[["hasAny",["de","division","firstlevel","holds","horadada","la","name","pilar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Pilar de la Horadada":"Pilar de la Horadada lies in Valencia."}}},
{"id":"n-c7cbed61","guard":[["has","gap"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does The Gap lie":"The Gap lies in Queensland."}}},
{"id":"n-c83ee0ac","guard":[["has","igarassu"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Pernambuco."]},["sense.lastWord"]],"mem":null},
{"id":"n-c9a1d936","guard":[["hasAny",["chengguanzhen","chengxian"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Chengxian Chengguanzhen":"Chengxian Chengguanzhen lies in Gansu."}}},
{"id":"n-cacd1f8a","guard":[["hasAny",["lie","maroubra","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Maroubra lie":"Maroubra lies in New South Wales."}}},
{"id":"n-cc79b066","guard":[["hasAny",["beach","division","firstlevel","holds","name","vero"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Vero Beach":"Vero Beach lies in Florida."}}},
{"id":"n-ccb9ebce","guard":[["hasAny",["division","fes","firstlevel","holds","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Fes":"Fes lies in Fes-Meknes."}}},
{"id":"n-ccbc3e1e","guard":[["has","haldia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Haldia lie":"Haldia lies in West Bengal."}}},
{"id":"n-ce3d108f","guard":[["hasAny",["al","francavilla","mare"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Francavilla al Mare":"Francavilla al Mare lies in Abruzzo."}}},
{"id":"n-cf2f31b0","guard":[["has","mokokchūng"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Nagaland."]},["sense.lastWord"]],"mem":null},
{"id":"n-d1a9d8f2","guard":[["has","nookat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Nookat in":"Nookat lies in Osh Region."}}},
{"id":"n-d741b8c5","guard":[["has","ploieşti"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Ploieşti in":"Ploieşti lies in Prahova."}}},
{"id":"n-d75c52db","guard":[["has","yesagyo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Yesagyo":"Yesagyo lies in Magway."}}},
{"id":"n-d80fc90a","guard":[["hasAny",["lie","province","state","yōga"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Yōga lie":"Yōga lies in Tokyo."}}},
{"id":"n-d9038f89","guard":[["hasAny",["province","region","sikka"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Sikka in":"Sikka lies in Gujarat."}}},
{"id":"n-d9c6e1b2","guard":[["hasAny",["division","firstlevel","holds","modāsa","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Modāsa":"Modāsa lies in Gujarat."}}},
{"id":"n-db06bd1e","guard":[["has","gādarwāra"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Gādarwāra":"Gādarwāra lies in Madhya Pradesh."}}},
{"id":"n-defc3a6a","guard":[["has","kaersai"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Ka'ersai lie":"Ka'ersai lies in Xinjiang."}}},
{"id":"n-df280802","guard":[["has","zibihu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Zibihu":"Zibihu lies in Yunnan."}}},
{"id":"n-e03ad07d","guard":[["hasAny",["ildefonso","province","region","san"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is San Ildefonso in":"San Ildefonso lies in Central Luzon."}}},
{"id":"n-e06dee13","guard":[["has","pārassāla"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Tamil Nadu."]},["sense.lastWord"]],"mem":null},
{"id":"n-e1706519","guard":[["hasAny",["fandriana","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Fandriana in":"Fandriana lies in Amoron'i Mania."}}},
{"id":"n-e257886f","guard":[["hasAny",["lie","project","province","rfc","srisailam","state","township"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Srisailam Project RFC Township lie":"Srisailam Project RFC Township lies in Andhra Pradesh."}}},
{"id":"n-e30bc12d","guard":[["hasAny",["chai","den"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Den Chai lie":"Den Chai lies in Phrae."}}},
{"id":"n-e359de45","guard":[["has","grivegnée"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Wallonia."]},["sense.lastWord"]],"mem":null},
{"id":"n-e3d76b21","guard":[["hasAny",["province","region","sunburyonthames"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Sunbury-on-Thames in":"Sunbury-on-Thames lies in England."}}},
{"id":"n-e47c63e0","guard":[["hasAny",["ploieşti","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Ploieşti in":"Ploieşti lies in Prahova."}}},
{"id":"n-e719b0dd","guard":[["hasAny",["misburg","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Misburg in":"Misburg lies in Lower Saxony."}}},
{"id":"n-e91cd6d0","guard":[["hasAny",["division","firstlevel","holds","name","pārdi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Pārdi":"Pārdi lies in Gujarat."}}},
{"id":"n-eb4486bb","guard":[["has","musanze"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Musanze lie":"Musanze lies in Northern Province."}}},
{"id":"n-ec3d7f65","guard":[["has","narasannapeta"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Narasannapeta":"Narasannapeta lies in Andhra Pradesh."}}},
{"id":"n-ecaa48f1","guard":[["hasAny",["chiclana","de","frontera","la","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Chiclana de la Frontera lie":"Chiclana de la Frontera lies in Andalusia."}}},
{"id":"n-ecfae577","guard":[["hasAny",["la","province","region","vista"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is La Vista in":"La Vista lies in Nebraska."}}},
{"id":"n-ed048662","guard":[["hasAny",["province","pāndharkawada","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Pāndharkawada in":"Pāndharkawada lies in Maharashtra."}}},
{"id":"n-efe7b6e9","guard":[["hasAny",["bury","edmunds","st"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Bury St Edmunds":"Bury St Edmunds lies in England."}}},
{"id":"n-eff40c3b","guard":[["hasAny",["kigonsera","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Kigonsera in":"Kigonsera lies in Ruvuma."}}},
{"id":"n-f274b46c","guard":[["has","tujunga"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Tujunga in":"Tujunga lies in California."}}},
{"id":"n-f2eb12eb","guard":[["hasAny",["division","firstlevel","holds","name","narasannapeta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Narasannapeta":"Narasannapeta lies in Andhra Pradesh."}}},
{"id":"n-f356af4e","guard":[["has","fussa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what state or province does Fussa lie":"Fussa lies in Tokyo."}}},
{"id":"n-f638ff85","guard":[["has","maizuru"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which region or province is Maizuru in":"Maizuru lies in Kyoto."}}},
{"id":"n-f9a9d27f","guard":[["has","kārakkād"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kerala."]},["sense.lastWord"]],"mem":null},
{"id":"n-fa2aaa03","guard":[["hasAny",["division","firstlevel","holds","malda","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Malda":"Malda lies in West Bengal."}}},
{"id":"n-fb04506e","guard":[["hasAny",["khasab","lie","province","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what state or province does Khasab lie":"Khasab lies in Musandam Governorate."}}},
{"id":"n-fbde71a0","guard":[["hasAny",["province","region","włocławek"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Włocławek in":"Włocławek lies in Kujawsko-Pomorskie."}}},
{"id":"n-fbfe5fd6","guard":[["hasAny",["burriana","division","firstlevel","holds","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the first-level division that holds Burriana":"Burriana lies in Valencia."}}},
{"id":"n-fc2e5e6c","guard":[["has","córregos"]],"pyramid":["render.template",{"lit":["Dois ",{"slot":0}," lies in Sao Paulo."]},["sense.lastWord"]],"mem":null},
{"id":"n-fe6cc656","guard":[["has","zibihu"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Yunnan."]},["sense.lastWord"]],"mem":null},
{"id":"n-ff5ef588","guard":[["hasAny",["nookat","province","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which region or province is Nookat in":"Nookat lies in Osh Region."}}},
{"id":"n-0088a079","guard":[["hasAny",["ildefonso","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["San ",{"slot":0}," lies in Central Luzon."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-03109ba3","guard":[["hasAny",["longest","longest one","longest word","włocławek"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kujawsko-Pomorskie."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0915d324","guard":[["hasAny",["kārakkād","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kerala."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0941cb3d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","igarassu","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Pernambuco."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0defd658","guard":[["hasAny",["longest","longest one","longest word","massapequa"]]],"pyramid":["render.template",{"lit":["North ",{"slot":0}," lies in New York."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0fae97f5","guard":[["hasAny",["shortest","shortest one","shortest word","wonji"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Oromiya."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-125ba98d","guard":[["hasAny",["grivegnée","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Wallonia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-145751cf","guard":[["hasAny",["cheranellūr","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kerala."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-14ed6abc","guard":[["hasAny",["herzogenrath","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in North Rhine-Westphalia."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-17109b0b","guard":[["hasAny",["longest","longest one","longest word","manjīl"]]],"pyramid":["render.template",{"lit":["Manjīl lies in Gilan ",{"slot":0},"."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-181b4cd7","guard":[["hasAny",["amontada","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Ceara."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-191f2b5b","guard":[["hasAny",["frankenthal","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Rheinland-Pfalz."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-192f9e5c","guard":[["hasAny",["all caps","capital letters","capitals","igarassu","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Pernambuco."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-1c88aa6a","guard":[["hasAny",["all caps","amontada","capital letters","capitals","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Ceara."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-1d629c96","guard":[["hasAny",["all caps","capital letters","capitals","grivegnée","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Wallonia."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-21b2f67a","guard":[["hasAny",["amontada","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Ceara."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-323d5a57","guard":[["hasAny",["all caps","capital letters","capitals","malda","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in West Bengal."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-35042fe7","guard":[["hasAny",["delete","herzogenrath","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"North Rhine-Westphalia"},["sense.lastWord"]]],"mem":null},
{"id":"n-37ec2371","guard":[["hasAny",["gādarwāra","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madhya Pradesh."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3c83435b","guard":[["hasAny",["grivegnée","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Wallonia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3ccbbb39","guard":[["hasAny",["gādarwāra","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madhya Pradesh."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3eeda546","guard":[["hasAny",["igarassu","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Pernambuco."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4057f5c2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mokokchūng","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Nagaland."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4143154c","guard":[["hasAny",["fandriana","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Amoron'i Mania."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-478a416a","guard":[["hasAny",["all caps","capital letters","capitals","herzogenrath","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in North Rhine-Westphalia."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-495f7de1","guard":[["hasAny",["all caps","capital letters","capitals","kārakkād","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kerala."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-4b669b2a","guard":[["hasAny",["kigonsera","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Ruvuma."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4f0e64d7","guard":[["hasAny",["lower case","lowercase","malda","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in West Bengal."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4f672257","guard":[["hasAny",["lower case","lowercase","small letters","zibihu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Yunnan."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5058b22b","guard":[["hasAny",["invert case","swap case","toggle case","yesagyo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Magway."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5167c0e2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","herzogenrath","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in North Rhine-Westphalia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-55120c23","guard":[["hasAny",["baimajing","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Hainan."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-57253a09","guard":[["hasAny",["lower case","lowercase","small letters","yesagyo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Magway."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-58b0b07c","guard":[["hasAny",["all caps","capital letters","capitals","narasannapeta","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Andhra Pradesh."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-635b52e8","guard":[["hasAny",["herzogenrath","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in North Rhine-Westphalia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-63d4fa37","guard":[["hasAny",["all caps","capital letters","capitals","mokokchūng","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Nagaland."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-671a13a5","guard":[["hasAny",["invert case","simancas","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madrid."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7784a1ea","guard":[["hasAny",["capitalise","capitalize","capitalize each word","grivegnée","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Wallonia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-77e330db","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kārakkād","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kerala."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-82585d5d","guard":[["hasAny",["igarassu","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Pernambuco."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-843d94fe","guard":[["hasAny",["invert case","swap case","toggle case","zibihu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Yunnan."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-86b96a02","guard":[["hasAny",["invert case","malda","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in West Bengal."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-89486a10","guard":[["hasAny",["lower case","lowercase","narasannapeta","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Andhra Pradesh."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8b5885c4","guard":[["hasAny",["invert case","lgovskiy","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kursk Oblast."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8bf5de25","guard":[["hasAny",["invert case","kārakkād","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kerala."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8bfb4a64","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","toktogul"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Jalal-Abad Region."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-93c865c7","guard":[["hasAny",["longest","longest one","longest word","narasannapeta"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Andhra Pradesh."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-95de74b4","guard":[["hasAny",["longest","longest one","longest word","maillardville"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in British Columbia."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-964657a3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","yesagyo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Magway."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-969c1436","guard":[["hasAny",["all caps","capital letters","capitals","toktogul","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Jalal-Abad Region."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-982003ff","guard":[["hasAny",["longest","longest one","longest word","traralgon"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Victoria."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9923bda1","guard":[["hasAny",["invert case","mokokchūng","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Nagaland."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9cbea974","guard":[["hasAny",["lower case","lowercase","pārassāla","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Tamil Nadu."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a1015fd1","guard":[["hasAny",["amontada","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Ceara."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a2380754","guard":[["hasAny",["all caps","capital letters","capitals","upper case","uppercase","zibihu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Yunnan."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a6b05057","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gādarwāra","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madhya Pradesh."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a7e050f9","guard":[["hasAny",["all caps","capital letters","capitals","gādarwāra","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madhya Pradesh."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-ae63dd5e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pārassāla","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Tamil Nadu."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b1cb911d","guard":[["hasAny",["herzogenrath","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"North Rhine-Westphalia"},["sense.lastWord"]]],"mem":null},
{"id":"n-b44799c2","guard":[["hasAny",["kilwinning","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Scotland."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b73ab3b9","guard":[["hasAny",["longest","longest one","longest word","natividade"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Rio de Janeiro."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b884b371","guard":[["hasAny",["longest","longest one","longest word","magdeburg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Saxony-Anhalt."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c220179a","guard":[["hasAny",["canby","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Oregon."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c3cf9e1b","guard":[["hasAny",["longest","longest one","longest word","tiancheng"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Chongqing."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c55e9895","guard":[["hasAny",["bellavista","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in San Martin Department."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c6c76c97","guard":[["hasAny",["nookat","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Nookat lies in Osh ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c844b4ec","guard":[["hasAny",["herzogenrath","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"North Rhine-Westphalia"},["sense.lastWord"]]],"mem":null},
{"id":"n-c92915f1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","simancas","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madrid."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cff4a7c7","guard":[["hasAny",["lower case","lowercase","small letters","toktogul"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Jalal-Abad Region."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d0b30224","guard":[["hasAny",["invert case","swap case","toggle case","toktogul"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Jalal-Abad Region."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d3aabf29","guard":[["hasAny",["longest","longest one","longest word","pāndharkawada"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Maharashtra."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d6062db8","guard":[["hasAny",["longest","longest one","longest word","missérété"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Oueme."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d6216652","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lgovskiy","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kursk Oblast."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d7d44a21","guard":[["hasAny",["gap","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," lies in Queensland."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d83428c4","guard":[["hasAny",["longest","longest one","longest word","musanze"]]],"pyramid":["render.template",{"lit":["Musanze lies in Northern ",{"slot":0},"."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d8853a23","guard":[["hasAny",["hürth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in North Rhine-Westphalia."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-de995ff6","guard":[["hasAny",["herzogenrath","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in North Rhine-Westphalia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-dff1e830","guard":[["hasAny",["all caps","capital letters","capitals","pārassāla","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Tamil Nadu."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e05e5780","guard":[["hasAny",["all caps","capital letters","capitals","simancas","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madrid."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e0631cf5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","malda","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in West Bengal."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e0b0c94b","guard":[["hasAny",["lower case","lowercase","mokokchūng","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Nagaland."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e4025c17","guard":[["hasAny",["all caps","capital letters","capitals","upper case","uppercase","yesagyo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Magway."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-ec74b7b0","guard":[["hasAny",["invert case","narasannapeta","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Andhra Pradesh."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ed906828","guard":[["hasAny",["banikoara","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Alibori."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ee85d58c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","narasannapeta","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Andhra Pradesh."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f0366616","guard":[["hasAny",["longest","longest one","longest word","szekszárd"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Tolna County."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f0f9a815","guard":[["hasAny",["longest","longest one","longest word","riversdale"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Western Cape."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f17d298e","guard":[["hasAny",["longest","longest one","longest word","tempelhof"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in State of Berlin."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f217acdc","guard":[["hasAny",["shortest","shortest one","shortest word","sikka"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Gujarat."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f48ee9d4","guard":[["hasAny",["lgovskiy","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kursk Oblast."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f767f5a0","guard":[["hasAny",["invert case","pārassāla","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Tamil Nadu."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f8c5e23a","guard":[["has","fes"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-fa132aaa","guard":[["hasAny",["kórinthos","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Peloponnese."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fa7a063e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","zibihu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Yunnan."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fc979a91","guard":[["hasAny",["all caps","capital letters","capitals","lgovskiy","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kursk Oblast."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-fecb8b1b","guard":[["hasAny",["lower case","lowercase","simancas","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madrid."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ff04314e","guard":[["hasAny",["herzogenrath","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"North Rhine-Westphalia"},["sense.lastWord"]]],"mem":null},
{"id":"n-0048cb27","guard":[["hasAny",["item number","natividade","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Rio de Janeiro."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-012a1625","guard":[["hasAny",["delete","project","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Andhra Pradesh"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-029f5f56","guard":[["hasAny",["item number","nth","position","toktogul"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Jalal-Abad Region."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-04538f7a","guard":[["hasAny",["each word","pārassāla","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Tamil Nadu."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-054db8e3","guard":[["hasAny",["horadada","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Pilar ",{"slot":0}," la ",{"slot":1}," lies in Valencia."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-071af0ec","guard":[["hasAny",["fandriana","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Amoron'i Mania."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0b098006","guard":[["hasAny",["each word","gādarwāra","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madhya Pradesh."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0b9541f0","guard":[["hasAny",["item number","nth","position","traralgon"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Victoria."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0c117266","guard":[["hasAny",["item number","khasab","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Musandam Governorate."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0c5d9862","guard":[["hasAny",["item number","nth","position","simancas"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madrid."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-0c722d5d","guard":[["hasAny",["elland","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in England."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-0c9b94ae","guard":[["hasAny",["each word","grivegnée","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Wallonia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0d74e8c4","guard":[["hasAny",["item number","nth","position","unaizah"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Al-Qassim Region."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-11ba52f0","guard":[["hasAny",["each word","kārakkād","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kerala."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-13b0c802","guard":[["hasAny",["herzogenrath","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in North Rhine-Westphalia."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-13b3b22c","guard":[["hasAny",["each word","herzogenrath","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in North Rhine-Westphalia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-17cecb23","guard":[["hasAny",["dalai","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Jilin."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1dd3938e","guard":[["hasAny",["burriana","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Valencia."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-1ff4e0b0","guard":[["hasAny",["bellavista","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in San Martin Department."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-21067a3b","guard":[["hasAny",["andenne","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Wallonia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-210cce52","guard":[["hasAny",["bình","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Thủy lies in Can Tho City."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-25ab9479","guard":[["hasAny",["daocheng","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Jiangsu."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-263b0abf","guard":[["hasAny",["basirpur","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Punjab."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2912903a","guard":[["hasAny",["herzogenrath","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"North Rhine-Westphalia"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-2a44e8c5","guard":[["hasAny",["each word","herzogenrath","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in North Rhine-Westphalia."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2b45edbf","guard":[["hasAny",["andenne","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Wallonia"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-2c00ec42","guard":[["hasAny",["item number","maroubra","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in New South Wales."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2cbbd7ea","guard":[["hasAny",["fes","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-2d34d2c1","guard":[["hasAny",["each word","simancas","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madrid."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2fd678d7","guard":[["hasAny",["normalise","normalize","pārassāla","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Tamil Nadu."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-2fedeb0d","guard":[["hasAny",["each word","simancas","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madrid."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-309fc8b0","guard":[["hasAny",["banfora","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Cascades Region."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-30e4e714","guard":[["hasAny",["ildefonso","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Ildefonso lies in Central Luzon."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-311e6899","guard":[["hasAny",["item number","nth","position","wedel"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Schleswig-Holstein."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-346c71ac","guard":[["hasAny",["change to","herzogenrath","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",{"lit":"North Rhine-Westphalia"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-348b238c","guard":[["hasAny",["bury","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Bury ",{"slot":0}," ",{"slot":1}," lies in England."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-352799f6","guard":[["hasAny",["igarassu","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Pernambuco."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-379b2945","guard":[["hasAny",["country","item number","nth","position"]],["has","region"]],"pyramid":["render.template",{"lit":["Lake ",{"slot":0}," lies in British Columbia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-38779469","guard":[["hasAny",["amontada","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Ceara."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3a0de2cf","guard":[["hasAny",["item number","nth","position","pāndharkawada"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Maharashtra."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3ad77f44","guard":[["hasAny",["each word","mokokchūng","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Nagaland."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3c34969a","guard":[["hasAny",["normalise","normalize","simplify the text","zibihu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Yunnan."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-3dc9ffbd","guard":[["hasAny",["gap","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," lies in Queensland."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-46b407a3","guard":[["hasAny",["herzogenrath","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"North Rhine-Westphalia"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-46e4e66e","guard":[["hasAny",["all caps","capital letters","capitals","fes","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-4bfa3923","guard":[["hasAny",["each word","kārakkād","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kerala."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-501b0286","guard":[["hasAny",["item number","junction","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Junction lies in New Jersey."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-515dd31e","guard":[["hasAny",["item number","nth","pirané","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Formosa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-52332874","guard":[["hasAny",["item number","manjīl","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Gilan Province."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-52a106e9","guard":[["hasAny",["habboûch","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Nabatieh."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-52d6de2a","guard":[["hasAny",["gādarwāra","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madhya Pradesh."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-53214eb2","guard":[["hasAny",["bačka","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Palanka lies in Vojvodina."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-53a337e8","guard":[["hasAny",["cheranellūr","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Kerala"},["sense.after",{"lit":"province"}]]],"mem":null},
{"id":"n-53cfae3a","guard":[["hasAny",["item number","maillardville","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in British Columbia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-56dd7430","guard":[["hasAny",["item number","kilwinning","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Scotland."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5e910694","guard":[["hasAny",["item number","mokokchūng","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Nagaland."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5ed1240d","guard":[["hasAny",["normalise","normalize","simplify the text","yesagyo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Magway."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-60a08f49","guard":[["hasAny",["each word","split into words","yesagyo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Magway."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-60fea39a","guard":[["hasAny",["bad","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Bavaria."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-653e2b74","guard":[["hasAny",["haldia","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in West Bengal."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-660f8195","guard":[["hasAny",["each word","malda","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in West Bengal."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-663c466e","guard":[["hasAny",["grivegnée","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Wallonia."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-67409273","guard":[["hasAny",["kārakkād","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kerala."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-67d922bb","guard":[["hasAny",["isla","item number","nth","position"]]],"pyramid":["render.template",{"lit":["La ",{"slot":0}," lies in Veracruz."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-68366773","guard":[["hasAny",["chai","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Den ",{"slot":0}," lies in Phrae."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6da5366a","guard":[["hasAny",["item number","nth","position","tiancheng"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Chongqing."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6fcd967e","guard":[["hasAny",["delete","remove","sikka","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"gujarat"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-70a93b8b","guard":[["hasAny",["normalise","normalize","simplify the text","toktogul"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Jalal-Abad Region."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-70b1566a","guard":[["hasAny",["amontada","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Ceara."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-724482f4","guard":[["hasAny",["herzogenrath","longest","longest one","longest word","separate by","split","split by"]]],"pyramid":["render.str",["aggregate.longest",["transform.split",{"lit":"North Rhine-Westphalia"},["sense.lastWord"]]]],"mem":null},
{"id":"n-73444bf4","guard":[["hasAny",["each word","split into words","toktogul"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Jalal-Abad Region."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-74221bdb","guard":[["hasAny",["fes","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Fes-Meknes."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-787d0a85","guard":[["hasAny",["item number","nth","position","wonji"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Oromiya."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-790107b1","guard":[["hasAny",["item number","nth","position","ranau"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Sabah."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-79c8b647","guard":[["hasAny",["each word","split into words","zibihu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Yunnan."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7a6aea8a","guard":[["hasAny",["delete","remove","sikka","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"gujarat"},["sense.after",{"lit":"province"}]]],"mem":null},
{"id":"n-7ab8366c","guard":[["hasAny",["mokokchūng","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Nagaland."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-7bb0b86f","guard":[["hasAny",["beach","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Beach lies in Florida."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-7cda3285","guard":[["hasAny",["goražde","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Federation of B&H."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7d35a619","guard":[["hasAny",["canby","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Oregon."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7e9e80c7","guard":[["hasAny",["item number","nth","position","saumur"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Pays de la Loire."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8027e0d9","guard":[["hasAny",["item number","nth","position","sikka"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Gujarat."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-803bb9c3","guard":[["hasAny",["delete","project","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Andhra Pradesh"},["sense.after",{"lit":"province"}]]],"mem":null},
{"id":"n-831b9aad","guard":[["hasAny",["malda","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in West Bengal."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-84033f66","guard":[["hasAny",["fes","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-86c8d0f3","guard":[["hasAny",["cozumel","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Quintana Roo."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8b8b04d9","guard":[["hasAny",["item number","nth","position","riversdale"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Western Cape."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8e63b814","guard":[["hasAny",["item number","nth","position","yesagyo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Magway."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-8fbb15ff","guard":[["hasAny",["each word","split into words","zibihu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Yunnan."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-91145871","guard":[["hasAny",["cheranellūr","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Kerala"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-93abef3a","guard":[["hasAny",["chai","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Chai lies in Phrae."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-94c98115","guard":[["hasAny",["item number","malda","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in West Bengal."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-992fa550","guard":[["hasAny",["normalise","normalize","simancas","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madrid."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-997e119a","guard":[["hasAny",["item number","kārakkād","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kerala."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-9c0c52a7","guard":[["hasAny",["item number","nth","position","tempelhof"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in State of Berlin."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9d77eba1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fes","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-9dc8495b","guard":[["hasAny",["each word","grivegnée","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Wallonia."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9dfc1c0c","guard":[["hasAny",["cheranellūr","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kerala."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9e5f20ab","guard":[["hasAny",["each word","igarassu","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Pernambuco."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9f104dc1","guard":[["hasAny",["bình","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Bình ",{"slot":0}," lies in Can Tho City."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a14c3870","guard":[["hasAny",["each word","lgovskiy","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kursk Oblast."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a20afa20","guard":[["hasAny",["herzogenrath","separate by","shortest","shortest one","shortest word","split","split by"]]],"pyramid":["render.str",["aggregate.shortest",["transform.split",{"lit":"North Rhine-Westphalia"},["sense.lastWord"]]]],"mem":null},
{"id":"n-a29ca915","guard":[["hasAny",["each word","split into words","toktogul"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Jalal-Abad Region."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a967c111","guard":[["hasAny",["item number","missérété","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Oueme."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a98a9a41","guard":[["hasAny",["amontada","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Ceara."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-ab7d949d","guard":[["hasAny",["each word","narasannapeta","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Andhra Pradesh."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ab8242e3","guard":[["hasAny",["each word","split into words","yesagyo"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Magway."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ae095122","guard":[["hasAny",["item number","musanze","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Northern Province."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-aed5ec4a","guard":[["hasAny",["each word","lgovskiy","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kursk Oblast."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b1eef009","guard":[["hasAny",["each word","igarassu","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Pernambuco."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b2e73cdd","guard":[["hasAny",["delete","remove","sikka","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Gujarat"},["sense.after",{"lit":"province"}]]],"mem":null},
{"id":"n-b441d720","guard":[["hasAny",["andenne","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Wallonia"},["sense.after",{"lit":"province"}]]],"mem":null},
{"id":"n-bacb191a","guard":[["hasAny",["hürth","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in North Rhine-Westphalia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bb201d6e","guard":[["hasAny",["item number","nth","position","pārassāla"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Tamil Nadu."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-bbd2482e","guard":[["hasAny",["each word","gādarwāra","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madhya Pradesh."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bd08b95b","guard":[["hasAny",["item number","misburg","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Lower Saxony."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bd56f723","guard":[["hasAny",["item number","kigonsera","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Ruvuma."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bd9671d2","guard":[["hasAny",["item number","massapequa","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Massapequa lies in New York."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bf5accd0","guard":[["hasAny",["abu","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Southern Kordofan."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-bfed98c2","guard":[["hasAny",["item number","nth","position","vista"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Vista lies in Nebraska."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c0b1b008","guard":[["hasAny",["item number","mohnyin","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kachin State."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c23271db","guard":[["hasAny",["item number","nth","ploieşti","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Prahova."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c264e8e8","guard":[["hasAny",["banikoara","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Alibori."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c3a6594b","guard":[["hasAny",["frankenthal","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Rheinland-Pfalz."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c5d790d8","guard":[["hasAny",["boca","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Chica lies in Santo Domingo Province."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-c8456943","guard":[["hasAny",["delete","hürth","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"North Rhine-Westphalia"},["sense.after",{"lit":"province"}]]],"mem":null},
{"id":"n-c8c09e0f","guard":[["hasAny",["item number","nth","position","vista"]]],"pyramid":["render.template",{"lit":["La ",{"slot":0}," lies in Nebraska."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ca9abf5a","guard":[["hasAny",["amontada","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Ceara."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ce95443f","guard":[["hasAny",["delete","hürth","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"North Rhine-Westphalia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-d1b828b3","guard":[["hasAny",["item number","nookat","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Osh Region."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d3440ad1","guard":[["hasAny",["acerra","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Campania."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d60ad442","guard":[["hasAny",["item number","nth","position","włocławek"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kujawsko-Pomorskie."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d6144fee","guard":[["hasAny",["isla","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Isla lies in Veracruz."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d62e58df","guard":[["hasAny",["baimajing","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Hainan."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d9a1e280","guard":[["hasAny",["grivegnée","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Wallonia."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-dbb83c87","guard":[["hasAny",["item number","nth","position","setsan"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Yangon."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dd948d8a","guard":[["hasAny",["al","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":["Francavilla ",{"slot":0}," ",{"slot":1}," lies in Abruzzo."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-e18fd652","guard":[["hasAny",["chengguanzhen","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Chengguanzhen lies in Gansu."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e27b364b","guard":[["hasAny",["item number","magdeburg","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Saxony-Anhalt."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e2b1fee0","guard":[["hasAny",["country","item number","nth","position"]],["has","region"]],"pyramid":["render.template",{"lit":[{"slot":0}," Country lies in British Columbia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e3a44e0f","guard":[["hasAny",["herzogenrath","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"North Rhine-Westphalia"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-e463c1b1","guard":[["hasAny",["item number","nth","position","szekszárd"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Tolna County."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e64331aa","guard":[["hasAny",["item number","nth","position","tujunga"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in California."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e76ee0f4","guard":[["hasAny",["delete","herzogenrath","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"North Rhine-Westphalia"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-e8549583","guard":[["hasAny",["item number","kórinthos","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Peloponnese."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e8780e74","guard":[["hasAny",["bad","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Reichenhall lies in Bavaria."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-ec5170b0","guard":[["hasAny",["item number","maizuru","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Kyoto."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ee4408e8","guard":[["hasAny",["córregos","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Córregos lies in Sao Paulo."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-ef0d3590","guard":[["hasAny",["item number","nth","position","zibihu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Yunnan."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-f08991b4","guard":[["hasAny",["delete","remove","sikka","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Gujarat"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-f158066f","guard":[["hasAny",["each word","narasannapeta","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Andhra Pradesh."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f2699574","guard":[["hasAny",["gādarwāra","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Madhya Pradesh."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-f5df7b05","guard":[["hasAny",["each word","mokokchūng","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Nagaland."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f6662490","guard":[["hasAny",["each word","pārassāla","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Tamil Nadu."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f89f4172","guard":[["hasAny",["each word","malda","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in West Bengal."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f92c3f78","guard":[["hasAny",["item number","junction","nth","position"]]],"pyramid":["render.template",{"lit":["Sayreville ",{"slot":0}," lies in New Jersey."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fafef47f","guard":[["hasAny",["abu","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Jibeha lies in Southern Kordofan."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-fbd3703f","guard":[["hasAny",["item number","narasannapeta","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Andhra Pradesh."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-fe8a26f1","guard":[["hasAny",["igarassu","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Pernambuco."]},["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-2ef753f5","guard":[["hasAny",["beach","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Florida."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-440dba25","guard":[["hasAny",["each word","fes","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-4a925d41","guard":[["hasAny",["each word","fes","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-536dd9a4","guard":[["hasAny",["bury","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," St ",{"slot":1}," lies in England."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-5a696ac0","guard":[["hasAny",["bačka","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Vojvodina."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-5ee2f062","guard":[["hasAny",["córregos","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Sao Paulo."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-6123b741","guard":[["hasAny",["boca","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Santo Domingo Province."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-71785dd5","guard":[["hasAny",["ildefonso","longest","longest one","longest word","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Central Luzon."]},["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-871bcf5a","guard":[["hasAny",["al","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," al ",{"slot":1}," lies in Abruzzo."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-87eeaa0b","guard":[["hasAny",["chengguanzhen","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Gansu."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-b222974f","guard":[["hasAny",["fes","normalise","normalize","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["transform.norm",["sense.lastWord"],{"lit":1}],["sense.lastWord"]],"mem":null},
{"id":"n-beb5232a","guard":[["hasAny",["abu","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Southern Kordofan."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-f45fbe17","guard":[["hasAny",["bad","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Bavaria."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-f5f6ad80","guard":[["hasAny",["fes","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-fb0b37ae","guard":[["hasAny",["horadada","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," de la ",{"slot":1}," lies in Valencia."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-0a6fdd51","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vista"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Nebraska."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0b0d0613","guard":[["hasAny",["chengguanzhen","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Gansu."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-152fbb1d","guard":[["hasAny",["abu","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Southern Kordofan."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-17c626c5","guard":[["hasAny",["country","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in British Columbia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-199b0476","guard":[["hasAny",["cape","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":[{"slot":0}," Town lies in Western ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-22ecb71f","guard":[["hasAny",["chengguanzhen","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Gansu."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2667fad7","guard":[["hasAny",["item number","longest","longest one","longest word","massapequa","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in New York."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-29078fd1","guard":[["hasAny",["all caps","beach","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Florida."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-2975aa0f","guard":[["hasAny",["cape","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["Cape ",{"slot":0}," lies in Western ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2d0f7736","guard":[["hasAny",["al","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in Abruzzo."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-2dde9ceb","guard":[["hasAny",["abu","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Southern Kordofan."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3127b32d","guard":[["hasAny",["bury","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Edmunds lies in England."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3b18af79","guard":[["hasAny",["all caps","boca","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Santo Domingo Province."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3d575ddc","guard":[["hasAny",["abu","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Southern Kordofan."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-41bc8328","guard":[["hasAny",["bad","invert case","item number","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Bavaria."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-453e4a07","guard":[["hasAny",["córregos","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Sao Paulo."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-49960edd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fes","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-589b31af","guard":[["hasAny",["abu","all caps","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Southern Kordofan."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-69e9572b","guard":[["hasAny",["all caps","capital letters","capitals","fes","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-6bb35ab6","guard":[["hasAny",["fes","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6dfbd75e","guard":[["hasAny",["beach","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Florida."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6ebd9e78","guard":[["hasAny",["item number","longest","longest one","longest word","manjīl","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Gilan ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-71287775","guard":[["hasAny",["bačka","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Vojvodina."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-71cbc659","guard":[["hasAny",["al","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Mare lies in Abruzzo."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-735f2fed","guard":[["hasAny",["beach","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Florida."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7513be63","guard":[["hasAny",["isla","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Veracruz."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-75c4cde0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","córregos","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Sao Paulo."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7841a651","guard":[["hasAny",["bad","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Bavaria."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8973db3c","guard":[["hasAny",["boca","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Santo Domingo Province."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-905724ee","guard":[["hasAny",["all caps","bad","capital letters","capitals","item number","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Bavaria."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-9878eadb","guard":[["hasAny",["fes","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-99c9e466","guard":[["hasAny",["capitalise","capitalize","capitalize each word","chengguanzhen","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Gansu."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9d5f0fac","guard":[["hasAny",["bačka","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Vojvodina."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a5e7511a","guard":[["hasAny",["all caps","bačka","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Vojvodina."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-afd5875f","guard":[["hasAny",["ildefonso","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Central Luzon."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b0a5f06b","guard":[["hasAny",["chengguanzhen","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Gansu."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b0babe92","guard":[["hasAny",["item number","junction","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in New Jersey."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b43f19a5","guard":[["hasAny",["item number","longest","longest one","longest word","musanze","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Northern ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ba6b806f","guard":[["hasAny",["boca","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Santo Domingo Province."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bd7797db","guard":[["hasAny",["all caps","capital letters","capitals","córregos","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Sao Paulo."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c08db9f7","guard":[["hasAny",["chai","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Phrae."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cf83437c","guard":[["hasAny",["beach","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Florida."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d1225a13","guard":[["hasAny",["boca","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Santo Domingo Province."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d59176e8","guard":[["hasAny",["bad","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Bavaria."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d9c5595c","guard":[["hasAny",["horadada","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," la Horadada lies in Valencia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-de1247c2","guard":[["hasAny",["córregos","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Sao Paulo."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-dff0d139","guard":[["hasAny",["item number","nookat","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Osh ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e1583661","guard":[["hasAny",["bačka","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Vojvodina."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f18c88c4","guard":[["hasAny",["all caps","capital letters","capitals","chengguanzhen","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Gansu."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f266afd1","guard":[["hasAny",["bad","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Bavaria."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-026c6f83","guard":[["hasAny",["córregos","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Sao Paulo."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1334ff53","guard":[["hasAny",["córregos","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Sao Paulo."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1f830fd2","guard":[["hasAny",["chengguanzhen","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Gansu."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-210a795b","guard":[["hasAny",["chai","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Phrae."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-26a672ea","guard":[["hasAny",["country","item number","nth","position"]],["has","region"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in British Columbia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2b564a52","guard":[["hasAny",["beach","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Florida."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-2e77ab69","guard":[["hasAny",["córregos","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Sao Paulo."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-317fccc6","guard":[["hasAny",["boca","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Santo Domingo Province."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-35e88dc9","guard":[["hasAny",["item number","nth","position","vista"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Nebraska."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-399bb1e5","guard":[["hasAny",["bačka","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Vojvodina."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-43a49d4e","guard":[["hasAny",["horadada","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," la ",{"slot":2}," lies in Valencia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-4c8a66a5","guard":[["hasAny",["chengguanzhen","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Gansu."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4f94d813","guard":[["hasAny",["item number","massapequa","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in New York."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-50ee7420","guard":[["hasAny",["fes","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-53c85d0c","guard":[["hasAny",["chengguanzhen","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Gansu."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-548ae32f","guard":[["hasAny",["item number","junction","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in New Jersey."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-54e22722","guard":[["hasAny",["bình","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Can Tho City."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6154618c","guard":[["hasAny",["bad","each word","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Bavaria."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-67256947","guard":[["hasAny",["cape","item number","nth","position"]],["has","region"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Western Cape."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6875624c","guard":[["hasAny",["abu","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Southern Kordofan."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-6a848008","guard":[["hasAny",["fes","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-6cb21db7","guard":[["hasAny",["al","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in Abruzzo."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-80ba0f7f","guard":[["hasAny",["beach","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Florida."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-91ae4a7e","guard":[["hasAny",["bačka","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Vojvodina."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-93e49cfa","guard":[["hasAny",["bury","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in England."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-93ef997f","guard":[["hasAny",["al","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in Abruzzo."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-9b397108","guard":[["hasAny",["beach","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Florida."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9e8b1378","guard":[["hasAny",["boca","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Santo Domingo Province."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a5d3e051","guard":[["hasAny",["bad","item number","normalise","normalize","nth","position","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Bavaria."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-a74d82a9","guard":[["hasAny",["horadada","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," la ",{"slot":2}," lies in Valencia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-aa5a5596","guard":[["hasAny",["bury","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in England."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-acb44a74","guard":[["hasAny",["item number","manjīl","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Gilan ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bdde8e0f","guard":[["hasAny",["bačka","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Vojvodina."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-bfa5e4ff","guard":[["hasAny",["abu","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Southern Kordofan."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-c8135486","guard":[["hasAny",["boca","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Santo Domingo Province."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ccf16325","guard":[["hasAny",["bačka","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Vojvodina."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e34974ec","guard":[["hasAny",["boca","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Santo Domingo Province."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-e5cf1a65","guard":[["hasAny",["each word","fes","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-eb3b5ad5","guard":[["hasAny",["córregos","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Sao Paulo."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-ef8a8e78","guard":[["hasAny",["ildefonso","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Central Luzon."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f26a80e0","guard":[["hasAny",["each word","fes","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in ",{"slot":1},"-Meknes."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f3cb9280","guard":[["hasAny",["beach","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Florida."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f48a4da8","guard":[["hasAny",["bad","each word","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Bavaria."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f4c14c2f","guard":[["hasAny",["isla","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Veracruz."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f61b7b6e","guard":[["hasAny",["item number","musanze","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," lies in Northern ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-fbc65ef3","guard":[["hasAny",["abu","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Southern Kordofan."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ff5702c6","guard":[["hasAny",["abu","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Southern Kordofan."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-30f7c74e","guard":[["hasAny",["al","capitalise","capitalize","capitalize each word","item number","nth","position","shortest","shortest one","shortest word","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in Abruzzo."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-47c83a1c","guard":[["hasAny",["all caps","capital letters","capitals","horadada","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," la ",{"slot":2}," lies in Valencia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-6235baac","guard":[["hasAny",["bury","capitalise","capitalize","capitalize each word","item number","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in England."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-74af32f1","guard":[["hasAny",["bury","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in England."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7b6f0328","guard":[["hasAny",["al","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in Abruzzo."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7cab5c4a","guard":[["hasAny",["al","all caps","capital letters","capitals","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in Abruzzo."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-8060c748","guard":[["hasAny",["bury","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in England."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a586b086","guard":[["hasAny",["cape","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Western ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-abe79465","guard":[["hasAny",["horadada","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," la ",{"slot":2}," lies in Valencia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d79c0277","guard":[["hasAny",["all caps","bury","capital letters","capitals","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in England."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e0c55548","guard":[["hasAny",["capitalise","capitalize","capitalize each word","horadada","item number","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," la ",{"slot":2}," lies in Valencia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ef7f42fc","guard":[["hasAny",["horadada","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," la ",{"slot":2}," lies in Valencia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f6871d54","guard":[["hasAny",["al","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in Abruzzo."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2109ad7f","guard":[["hasAny",["al","item number","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in Abruzzo."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-2a088185","guard":[["hasAny",["al","each word","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in Abruzzo."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2de1174f","guard":[["hasAny",["chiclana","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," la ",{"slot":2}," lies in Andalusia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-4d238fcf","guard":[["hasAny",["al","each word","item number","nth","position","shortest","shortest one","shortest word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in Abruzzo."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-501b0eb3","guard":[["hasAny",["bury","each word","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in England."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-67e7c768","guard":[["hasAny",["each word","horadada","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," la ",{"slot":2}," lies in Valencia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8110937b","guard":[["hasAny",["chiclana","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Chiclana ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in Andalusia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-8cc2b0b8","guard":[["hasAny",["chiclana","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Frontera lies in Andalusia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-9f130d09","guard":[["hasAny",["bury","each word","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in England."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a279b053","guard":[["hasAny",["horadada","item number","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," la ",{"slot":2}," lies in Valencia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-ce3f0a57","guard":[["hasAny",["horadada","item number","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," la ",{"slot":2}," lies in Valencia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-eb49edd9","guard":[["hasAny",["bury","item number","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in England."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-ed932242","guard":[["hasAny",["each word","horadada","item number","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," la ",{"slot":2}," lies in Valencia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f896fc59","guard":[["hasAny",["al","item number","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in Abruzzo."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-fc5fd57b","guard":[["hasAny",["bury","item number","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in England."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.norm",["sense.lastWord"],{"lit":1}]],"mem":null},
{"id":"n-fee43f5f","guard":[["hasAny",["cape","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Western ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-19045061","guard":[["hasAny",["element","item number","nth","position","project"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Project ",{"slot":1}," ",{"slot":2}," lies in Andhra Pradesh."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-377f9ee4","guard":[["hasAny",["element","item number","nth","position","project"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," RFC ",{"slot":2}," lies in Andhra Pradesh."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-61141254","guard":[["hasAny",["element","item number","nth","position","project"]]],"pyramid":["render.template",{"lit":["Srisailam ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," lies in Andhra Pradesh."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-88ca4ffa","guard":[["hasAny",["chiclana","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," de ",{"slot":1}," ",{"slot":2}," lies in Andalusia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-bb1195e1","guard":[["hasAny",["item number","nth","position","project"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Township lies in Andhra Pradesh."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e4e30575","guard":[["hasAny",["cape","item number","nth","position"]],["has","region"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," lies in Western ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b79cf838","guard":[["hasAny",["element","item number","nth","position","project","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," lies in Andhra Pradesh."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-f2277993","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","project"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," lies in Andhra Pradesh."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-f64cc25e","guard":[["hasAny",["chiclana","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," lies in Andalusia."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-620d43ae","guard":[["hasAny",["chiclana","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," lies in Andalusia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-f76fcac5","guard":[["hasAny",["element","item number","nth","position","project"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," lies in Andhra Pradesh."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the first-level division that holds Pārdi","expect":{"contains":["Gujarat"],"notRefusal":true}},{"q":"in what state or province does Haldia lie","expect":{"contains":["West Bengal"],"notRefusal":true}},{"q":"in what state or province does Banfora lie","expect":{"contains":["Cascades Region"],"notRefusal":true}},{"q":"which region or province is Magdeburg in","expect":{"contains":["Saxony-Anhalt"],"notRefusal":true}},{"q":"name the first-level division that holds Vero Beach","expect":{"contains":["Florida"],"notRefusal":true}},{"q":"which region or province is Kórinthos in","expect":{"contains":["Peloponnese"],"notRefusal":true}},{"q":"name the first-level division that holds Boca Chica","expect":{"contains":["Santo Domingo Province"],"notRefusal":true}},{"q":"in what state or province does Missérété lie","expect":{"contains":["Oueme"],"notRefusal":true}},{"q":"which region or province is Pāndharkawada in","expect":{"contains":["Maharashtra"],"notRefusal":true}},{"q":"in what state or province does Acerra lie","expect":{"contains":["Campania"],"notRefusal":true}},{"q":"name the first-level division that holds Gādarwāra","expect":{"contains":["Madhya Pradesh"],"notRefusal":true}},{"q":"which region or province is La Vista in","expect":{"contains":["Nebraska"],"notRefusal":true}},{"q":"which region or province is Kigonsera in","expect":{"contains":["Ruvuma"],"notRefusal":true}},{"q":"which region or province is Tempelhof in","expect":{"contains":["State of Berlin"],"notRefusal":true}},{"q":"which region or province is Tiancheng in","expect":{"contains":["Chongqing"],"notRefusal":true}},{"q":"name the first-level division that holds Burriana","expect":{"contains":["Valencia"],"notRefusal":true}},{"q":"name the first-level division that holds Malda","expect":{"contains":["West Bengal"],"notRefusal":true}},{"q":"name the first-level division that holds Yangiqo‘rg‘on","expect":{"contains":["Namangan"],"notRefusal":true}},{"q":"name the first-level division that holds Grivegnée","expect":{"contains":["Wallonia"],"notRefusal":true}},{"q":"which region or province is Manjīl in","expect":{"contains":["Gilan Province"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
