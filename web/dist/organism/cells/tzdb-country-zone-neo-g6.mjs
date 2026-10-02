// tzdb-country-zone-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"tzdb-country-zone-neo-g6","class":"tzdb-country-zone","generation":6,"lane":"neo","grownFrom":["name the time zone of Turkmenistan","which IANA time zone does Cabo Verde use","which IANA time zone does Palau use","which IANA time zone does Northern Mariana Islands use","name the time zone of Botswana","what is the tz database zone for Saint Helena","which IANA time zone does Azerbaijan use","which IANA time zone does Svalbard and Jan Mayen use","what is the tz database zone for Faroe Islands","what is the tz database zone for The Netherlands","name the time zone of Finland","what is the tz database zone for Qatar","name the time zone of Philippines","name the time zone of Saint Barthelemy","name the time zone of Turkey","name the time zone of Bonaire, Saint Eustatius and Saba","which IANA time zone does Madagascar use","name the time zone of Israel","which IANA time zone does Albania use","what is the tz database zone for Sudan"],"version":1});

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
{"id":"n-827164ad","guard":[["has","zone"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Turkmenistan":"Turkmenistan uses Asia/Ashgabat.","which IANA time zone does Cabo Verde use":"Cabo Verde uses Atlantic/Cape_Verde.","which IANA time zone does Palau use":"Palau uses Pacific/Palau.","which IANA time zone does Northern Mariana Islands use":"Northern Mariana Islands uses Pacific/Saipan.","name the time zone of Botswana":"Botswana uses Africa/Gaborone.","what is the tz database zone for Saint Helena":"Saint Helena uses Atlantic/St_Helena.","which IANA time zone does Azerbaijan use":"Azerbaijan uses Asia/Baku.","which IANA time zone does Svalbard and Jan Mayen use":"Svalbard and Jan Mayen uses Arctic/Longyearbyen.","what is the tz database zone for Faroe Islands":"Faroe Islands uses Atlantic/Faroe.","what is the tz database zone for The Netherlands":"The Netherlands uses Europe/Amsterdam.","name the time zone of Finland":"Finland uses Europe/Helsinki.","what is the tz database zone for Qatar":"Qatar uses Asia/Qatar.","name the time zone of Philippines":"Philippines uses Asia/Manila.","name the time zone of Saint Barthelemy":"Saint Barthelemy uses America/St_Barthelemy.","name the time zone of Turkey":"Turkey uses Europe/Istanbul.","name the time zone of Bonaire, Saint Eustatius and Saba":"Bonaire, Saint Eustatius and Saba uses America/Kralendijk.","which IANA time zone does Madagascar use":"Madagascar uses Indian/Antananarivo.","name the time zone of Israel":"Israel uses Asia/Jerusalem.","which IANA time zone does Albania use":"Albania uses Europe/Tirane.","what is the tz database zone for Sudan":"Sudan uses Africa/Khartoum.","what is the tz database zone for Austria":"Austria uses Europe/Vienna.","name the time zone of Saint Kitts and Nevis":"Saint Kitts and Nevis uses America/St_Kitts.","what is the tz database zone for Sao Tome and Principe":"Sao Tome and Principe uses Africa/Sao_Tome.","what is the tz database zone for Latvia":"Latvia uses Europe/Riga.","which IANA time zone does Liberia use":"Liberia uses Africa/Monrovia.","which IANA time zone does Kuwait use":"Kuwait uses Asia/Kuwait.","what is the tz database zone for Laos":"Laos uses Asia/Vientiane.","name the time zone of Sri Lanka":"Sri Lanka uses Asia/Colombo.","which IANA time zone does Suriname use":"Suriname uses America/Paramaribo.","name the time zone of Fiji":"Fiji uses Pacific/Fiji.","name the time zone of Honduras":"Honduras uses America/Tegucigalpa.","name the time zone of Hungary":"Hungary uses Europe/Budapest.","which IANA time zone does Tajikistan use":"Tajikistan uses Asia/Dushanbe.","name the time zone of Egypt":"Egypt uses Africa/Cairo.","which IANA time zone does Saudi Arabia use":"Saudi Arabia uses Asia/Riyadh.","which IANA time zone does Niue use":"Niue uses Pacific/Niue.","name the time zone of Dominican Republic":"Dominican Republic uses America/Santo_Domingo.","what is the tz database zone for Greece":"Greece uses Europe/Athens.","what is the tz database zone for Peru":"Peru uses America/Lima.","which IANA time zone does North Macedonia use":"North Macedonia uses Europe/Skopje.","which IANA time zone does Dominica use":"Dominica uses America/Dominica.","name the time zone of Slovakia":"Slovakia uses Europe/Bratislava.","name the time zone of Bhutan":"Bhutan uses Asia/Thimphu.","what is the tz database zone for Bermuda":"Bermuda uses Atlantic/Bermuda.","name the time zone of Curacao":"Curacao uses America/Curacao.","what is the tz database zone for Rwanda":"Rwanda uses Africa/Kigali.","name the time zone of Guadeloupe":"Guadeloupe uses America/Guadeloupe.","what is the tz database zone for Djibouti":"Djibouti uses Africa/Djibouti.","which IANA time zone does Jamaica use":"Jamaica uses America/Jamaica.","which IANA time zone does Mali use":"Mali uses Africa/Bamako.","which IANA time zone does India use":"India uses Asia/Kolkata.","what is the tz database zone for Benin":"Benin uses Africa/Porto-Novo.","which IANA time zone does Isle of Man use":"Isle of Man uses Europe/Isle_of_Man.","name the time zone of Georgia":"Georgia uses Asia/Tbilisi.","what is the tz database zone for Armenia":"Armenia uses Asia/Yerevan.","what is the tz database zone for Ghana":"Ghana uses Africa/Accra.","what is the tz database zone for Libya":"Libya uses Africa/Tripoli.","name the time zone of United Kingdom":"United Kingdom uses Europe/London.","name the time zone of San Marino":"San Marino uses Europe/San_Marino.","which IANA time zone does North Korea use":"North Korea uses Asia/Pyongyang.","which IANA time zone does Comoros use":"Comoros uses Indian/Comoro.","name the time zone of Cook Islands":"Cook Islands uses Pacific/Rarotonga.","what is the tz database zone for Guinea":"Guinea uses Africa/Conakry.","what is the tz database zone for French Guiana":"French Guiana uses America/Cayenne.","which IANA time zone does Burundi use":"Burundi uses Africa/Bujumbura.","name the time zone of Vanuatu":"Vanuatu uses Pacific/Efate.","which IANA time zone does Czechia use":"Czechia uses Europe/Prague.","which IANA time zone does Falkland Islands use":"Falkland Islands uses Atlantic/Stanley.","what is the tz database zone for French Southern Territories":"French Southern Territories uses Indian/Kerguelen.","which IANA time zone does Liechtenstein use":"Liechtenstein uses Europe/Vaduz.","name the time zone of Nauru":"Nauru uses Pacific/Nauru.","name the time zone of Vietnam":"Vietnam uses Asia/Ho_Chi_Minh.","name the time zone of United Arab Emirates":"United Arab Emirates uses Asia/Dubai.","what is the tz database zone for Guernsey":"Guernsey uses Europe/Guernsey.","which IANA time zone does Samoa use":"Samoa uses Pacific/Apia.","which IANA time zone does British Indian Ocean Territory use":"British Indian Ocean Territory uses Indian/Chagos.","which IANA time zone does Sint Maarten use":"Sint Maarten uses America/Lower_Princes.","what is the tz database zone for Panama":"Panama uses America/Panama.","which IANA time zone does Iran use":"Iran uses Asia/Tehran.","what is the tz database zone for Cambodia":"Cambodia uses Asia/Phnom_Penh.","which IANA time zone does Slovenia use":"Slovenia uses Europe/Ljubljana.","name the time zone of Reunion":"Reunion uses Indian/Reunion.","which IANA time zone does Montserrat use":"Montserrat uses America/Montserrat.","what is the tz database zone for Burkina Faso":"Burkina Faso uses Africa/Ouagadougou.","which IANA time zone does Germany use":"Germany uses Europe/Berlin.","which IANA time zone does Denmark use":"Denmark uses Europe/Copenhagen.","what is the tz database zone for Lithuania":"Lithuania uses Europe/Vilnius.","what is the tz database zone for Christmas Island":"Christmas Island uses Indian/Christmas.","what is the tz database zone for Nepal":"Nepal uses Asia/Kathmandu.","name the time zone of Bahrain":"Bahrain uses Asia/Bahrain.","name the time zone of Belize":"Belize uses America/Belize.","name the time zone of Cuba":"Cuba uses America/Havana.","what is the tz database zone for Estonia":"Estonia uses Europe/Tallinn.","what is the tz database zone for Timor Leste":"Timor Leste uses Asia/Dili.","name the time zone of Vatican":"Vatican uses Europe/Vatican.","what is the tz database zone for Ireland":"Ireland uses Europe/Dublin.","which IANA time zone does Kenya use":"Kenya uses Africa/Nairobi.","what is the tz database zone for Mayotte":"Mayotte uses Indian/Mayotte.","what is the tz database zone for Seychelles":"Seychelles uses Indian/Mahe.","name the time zone of Nicaragua":"Nicaragua uses America/Managua."}}},
{"id":"n-4dca9ad6","guard":[["has","time"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"time"}]]],"mem":{"table":{"zone of Turkmenistan":"Turkmenistan uses Asia/Ashgabat.","zone does Cabo Verde use":"Cabo Verde uses Atlantic/Cape_Verde.","zone does Palau use":"Palau uses Pacific/Palau.","zone does Northern Mariana Islands use":"Northern Mariana Islands uses Pacific/Saipan.","zone of Botswana":"Botswana uses Africa/Gaborone.","zone does Azerbaijan use":"Azerbaijan uses Asia/Baku.","zone does Svalbard and Jan Mayen use":"Svalbard and Jan Mayen uses Arctic/Longyearbyen.","zone of Finland":"Finland uses Europe/Helsinki.","zone of Philippines":"Philippines uses Asia/Manila.","zone of Saint Barthelemy":"Saint Barthelemy uses America/St_Barthelemy.","zone of Turkey":"Turkey uses Europe/Istanbul.","zone of Bonaire, Saint Eustatius and Saba":"Bonaire, Saint Eustatius and Saba uses America/Kralendijk.","zone does Madagascar use":"Madagascar uses Indian/Antananarivo.","zone of Israel":"Israel uses Asia/Jerusalem.","zone does Albania use":"Albania uses Europe/Tirane.","zone of Saint Kitts and Nevis":"Saint Kitts and Nevis uses America/St_Kitts.","zone does Liberia use":"Liberia uses Africa/Monrovia.","zone does Kuwait use":"Kuwait uses Asia/Kuwait.","zone of Sri Lanka":"Sri Lanka uses Asia/Colombo.","zone does Suriname use":"Suriname uses America/Paramaribo.","zone of Fiji":"Fiji uses Pacific/Fiji.","zone of Honduras":"Honduras uses America/Tegucigalpa.","zone of Hungary":"Hungary uses Europe/Budapest.","zone does Tajikistan use":"Tajikistan uses Asia/Dushanbe.","zone of Egypt":"Egypt uses Africa/Cairo.","zone does Saudi Arabia use":"Saudi Arabia uses Asia/Riyadh.","zone does Niue use":"Niue uses Pacific/Niue.","zone of Dominican Republic":"Dominican Republic uses America/Santo_Domingo.","zone does North Macedonia use":"North Macedonia uses Europe/Skopje.","zone does Dominica use":"Dominica uses America/Dominica.","zone of Slovakia":"Slovakia uses Europe/Bratislava.","zone of Bhutan":"Bhutan uses Asia/Thimphu.","zone of Curacao":"Curacao uses America/Curacao.","zone of Guadeloupe":"Guadeloupe uses America/Guadeloupe.","zone does Jamaica use":"Jamaica uses America/Jamaica.","zone does Mali use":"Mali uses Africa/Bamako.","zone does India use":"India uses Asia/Kolkata.","zone does Isle of Man use":"Isle of Man uses Europe/Isle_of_Man.","zone of Georgia":"Georgia uses Asia/Tbilisi.","zone of United Kingdom":"United Kingdom uses Europe/London.","zone of San Marino":"San Marino uses Europe/San_Marino.","zone does North Korea use":"North Korea uses Asia/Pyongyang.","zone does Comoros use":"Comoros uses Indian/Comoro.","zone of Cook Islands":"Cook Islands uses Pacific/Rarotonga.","zone does Burundi use":"Burundi uses Africa/Bujumbura.","zone of Vanuatu":"Vanuatu uses Pacific/Efate.","zone does Czechia use":"Czechia uses Europe/Prague.","zone does Falkland Islands use":"Falkland Islands uses Atlantic/Stanley.","zone does Liechtenstein use":"Liechtenstein uses Europe/Vaduz.","zone of Nauru":"Nauru uses Pacific/Nauru.","zone of Vietnam":"Vietnam uses Asia/Ho_Chi_Minh.","zone of United Arab Emirates":"United Arab Emirates uses Asia/Dubai.","zone does Samoa use":"Samoa uses Pacific/Apia.","zone does British Indian Ocean Territory use":"British Indian Ocean Territory uses Indian/Chagos.","zone does Sint Maarten use":"Sint Maarten uses America/Lower_Princes.","zone does Iran use":"Iran uses Asia/Tehran.","zone does Slovenia use":"Slovenia uses Europe/Ljubljana.","zone of Reunion":"Reunion uses Indian/Reunion.","zone does Montserrat use":"Montserrat uses America/Montserrat.","zone does Germany use":"Germany uses Europe/Berlin.","zone does Denmark use":"Denmark uses Europe/Copenhagen.","zone of Bahrain":"Bahrain uses Asia/Bahrain.","zone of Belize":"Belize uses America/Belize.","zone of Cuba":"Cuba uses America/Havana.","zone of Vatican":"Vatican uses Europe/Vatican.","zone does Kenya use":"Kenya uses Africa/Nairobi.","zone of Nicaragua":"Nicaragua uses America/Managua."}}},
{"id":"n-b598adc7","guard":[["has","database"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"Saint Helena":"Saint Helena uses Atlantic/St_Helena.","Faroe Islands":"Faroe Islands uses Atlantic/Faroe.","The Netherlands":"The Netherlands uses Europe/Amsterdam.","Qatar":"Qatar uses Asia/Qatar.","Sudan":"Sudan uses Africa/Khartoum.","Austria":"Austria uses Europe/Vienna.","Sao Tome and Principe":"Sao Tome and Principe uses Africa/Sao_Tome.","Latvia":"Latvia uses Europe/Riga.","Laos":"Laos uses Asia/Vientiane.","Greece":"Greece uses Europe/Athens.","Peru":"Peru uses America/Lima.","Bermuda":"Bermuda uses Atlantic/Bermuda.","Rwanda":"Rwanda uses Africa/Kigali.","Djibouti":"Djibouti uses Africa/Djibouti.","Benin":"Benin uses Africa/Porto-Novo.","Armenia":"Armenia uses Asia/Yerevan.","Ghana":"Ghana uses Africa/Accra.","Libya":"Libya uses Africa/Tripoli.","Guinea":"Guinea uses Africa/Conakry.","French Guiana":"French Guiana uses America/Cayenne.","French Southern Territories":"French Southern Territories uses Indian/Kerguelen.","Guernsey":"Guernsey uses Europe/Guernsey.","Panama":"Panama uses America/Panama.","Cambodia":"Cambodia uses Asia/Phnom_Penh.","Burkina Faso":"Burkina Faso uses Africa/Ouagadougou.","Lithuania":"Lithuania uses Europe/Vilnius.","Christmas Island":"Christmas Island uses Indian/Christmas.","Nepal":"Nepal uses Asia/Kathmandu.","Estonia":"Estonia uses Europe/Tallinn.","Timor Leste":"Timor Leste uses Asia/Dili.","Ireland":"Ireland uses Europe/Dublin.","Mayotte":"Mayotte uses Indian/Mayotte.","Seychelles":"Seychelles uses Indian/Mahe."}}},
{"id":"n-d17cfd08","guard":[["has","database"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the tz database zone for Saint Helena":"Saint Helena uses Atlantic/St_Helena.","the tz database zone for Faroe Islands":"Faroe Islands uses Atlantic/Faroe.","the tz database zone for The Netherlands":"The Netherlands uses Europe/Amsterdam.","the tz database zone for Qatar":"Qatar uses Asia/Qatar.","the tz database zone for Sudan":"Sudan uses Africa/Khartoum.","the tz database zone for Austria":"Austria uses Europe/Vienna.","the tz database zone for Sao Tome and Principe":"Sao Tome and Principe uses Africa/Sao_Tome.","the tz database zone for Latvia":"Latvia uses Europe/Riga.","the tz database zone for Laos":"Laos uses Asia/Vientiane.","the tz database zone for Greece":"Greece uses Europe/Athens.","the tz database zone for Peru":"Peru uses America/Lima.","the tz database zone for Bermuda":"Bermuda uses Atlantic/Bermuda.","the tz database zone for Rwanda":"Rwanda uses Africa/Kigali.","the tz database zone for Djibouti":"Djibouti uses Africa/Djibouti.","the tz database zone for Benin":"Benin uses Africa/Porto-Novo.","the tz database zone for Armenia":"Armenia uses Asia/Yerevan.","the tz database zone for Ghana":"Ghana uses Africa/Accra.","the tz database zone for Libya":"Libya uses Africa/Tripoli.","the tz database zone for Guinea":"Guinea uses Africa/Conakry.","the tz database zone for French Guiana":"French Guiana uses America/Cayenne.","the tz database zone for French Southern Territories":"French Southern Territories uses Indian/Kerguelen.","the tz database zone for Guernsey":"Guernsey uses Europe/Guernsey.","the tz database zone for Panama":"Panama uses America/Panama.","the tz database zone for Cambodia":"Cambodia uses Asia/Phnom_Penh.","the tz database zone for Burkina Faso":"Burkina Faso uses Africa/Ouagadougou.","the tz database zone for Lithuania":"Lithuania uses Europe/Vilnius.","the tz database zone for Christmas Island":"Christmas Island uses Indian/Christmas.","the tz database zone for Nepal":"Nepal uses Asia/Kathmandu.","the tz database zone for Estonia":"Estonia uses Europe/Tallinn.","the tz database zone for Timor Leste":"Timor Leste uses Asia/Dili.","the tz database zone for Ireland":"Ireland uses Europe/Dublin.","the tz database zone for Mayotte":"Mayotte uses Indian/Mayotte.","the tz database zone for Seychelles":"Seychelles uses Indian/Mahe."}}},
{"id":"n-0c7ce080","guard":[["hasAny",["belize","curacao","dominica","guadeloupe","item number","jamaica","montserrat","nth","panama","position"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3bb95997","guard":[["hasAny",["belize","curacao","dominica","guadeloupe","jamaica","longest","longest one","longest word","montserrat"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-a8113863","guard":[["hasAny",["belize","curacao","dominica","guadeloupe","jamaica","longest","longest one","longest word","montserrat"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-846d1c25","guard":[["hasAny",["belize","curacao","dominica","guadeloupe","item number","jamaica","longest","longest one","longest word","montserrat","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cd523f41","guard":[["hasAny",["belize","curacao","dominica","guadeloupe","item number","jamaica","longest","longest one","longest word","montserrat","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-d62524a4","guard":[["hasAny",["belize","curacao","guadeloupe","panama"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-4440c979","guard":[["hasAny",["belize","curacao","guadeloupe","lower case","lowercase","panama","small letters"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-4d5b1f0b","guard":[["hasAny",["belize","curacao","guadeloupe","invert case","panama","swap case","toggle case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-8f03807f","guard":[["hasAny",["all caps","belize","capital letters","capitals","curacao","guadeloupe","panama","upper case","uppercase"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-cc3b683a","guard":[["hasAny",["belize","capitalise","capitalize","capitalize each word","curacao","guadeloupe","panama","title case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-2cd708a6","guard":[["hasAny",["belize","curacao","guadeloupe","item number","nth","panama","position"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-72405926","guard":[["hasAny",["belize","curacao","each word","guadeloupe","panama","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-caf34781","guard":[["hasAny",["belize","curacao","each word","guadeloupe","panama","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-13f18ce3","guard":[["hasAny",["belize","curacao","guadeloupe","invert case","item number","nth","panama","position","swap case","toggle case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-29d9e850","guard":[["hasAny",["belize","curacao","guadeloupe","item number","lower case","lowercase","nth","panama","position","small letters"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8ecffc93","guard":[["hasAny",["all caps","belize","capital letters","capitals","curacao","guadeloupe","item number","nth","panama","position","upper case","uppercase"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-fe0c59e4","guard":[["hasAny",["belize","capitalise","capitalize","capitalize each word","curacao","guadeloupe","item number","nth","panama","position","title case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-690eeb81","guard":[["hasAny",["belize","curacao","each word","guadeloupe","item number","nth","panama","position","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9e0d3923","guard":[["hasAny",["belize","curacao","each word","guadeloupe","item number","nth","panama","position","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d906e9b2","guard":[["hasAny",["fiji","item number","nauru","niue","nth","palau","position"]],["has","zone"],["not",["has","form"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7aa923a3","guard":[["hasAny",["belize","curacao","guadeloupe","longest","longest one","longest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-92da48c4","guard":[["hasAny",["bahrain","item number","kuwait","nth","position","qatar"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0349018f","guard":[["hasAny",["guernsey","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-158408a9","guard":[["hasAny",["fiji","nauru"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-a57ce066","guard":[["hasAny",["mayotte","reunion"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-bb6b509c","guard":[["hasAny",["bahrain","qatar"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-1ea9a83e","guard":[["hasAny",["fiji","lower case","lowercase","nauru","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-3bb1549c","guard":[["hasAny",["guernsey","lower case","lowercase","small letters","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-51af9e3b","guard":[["hasAny",["guernsey","invert case","swap case","toggle case","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-72ba9691","guard":[["hasAny",["all caps","capital letters","capitals","mayotte","reunion","upper case","uppercase"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-786ddff4","guard":[["hasAny",["all caps","capital letters","capitals","guernsey","upper case","uppercase","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-9963f111","guard":[["hasAny",["capitalise","capitalize","capitalize each word","guernsey","title case","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-9fd7a502","guard":[["hasAny",["lower case","lowercase","mayotte","reunion","small letters"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-b8c8e132","guard":[["hasAny",["all caps","capital letters","capitals","fiji","nauru","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-c23a16aa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mayotte","reunion","title case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-c7f570a2","guard":[["hasAny",["invert case","mayotte","reunion","swap case","toggle case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-d7496d00","guard":[["hasAny",["all caps","bahrain","capital letters","capitals","qatar","upper case","uppercase"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-d8132071","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fiji","nauru","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-df4b9a2c","guard":[["hasAny",["bahrain","capitalise","capitalize","capitalize each word","qatar","title case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-f4a0d722","guard":[["hasAny",["fiji","invert case","nauru","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-f5de8bfa","guard":[["hasAny",["bahrain","invert case","qatar","swap case","toggle case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-f934fbf2","guard":[["hasAny",["fiji","nauru"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["sense.after",{"lit":"of"}],["sense.lastWord"]],"mem":null},
{"id":"n-fded4452","guard":[["hasAny",["bahrain","lower case","lowercase","qatar","small letters"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-00702d6b","guard":[["hasAny",["bahrain","each word","qatar","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-055a9cad","guard":[["hasAny",["bahrain","kuwait","longest","longest one","longest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-08b6173b","guard":[["hasAny",["each word","mayotte","reunion","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-1fa6002e","guard":[["hasAny",["bahrain","item number","nth","position","qatar"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-3798f3aa","guard":[["hasAny",["each word","guernsey","split into words","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-5af01119","guard":[["hasAny",["guernsey","item number","nth","position","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-6b32d5b9","guard":[["hasAny",["longest","longest one","longest word","nauru","palau"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-999b93c1","guard":[["hasAny",["item number","mayotte","nth","position","reunion"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-a78f2218","guard":[["hasAny",["each word","fiji","nauru","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-ac475540","guard":[["hasAny",["bahrain","kuwait","longest","longest one","longest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-c1a0ab5b","guard":[["hasAny",["fiji","item number","nauru","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-c999f465","guard":[["hasAny",["each word","fiji","nauru","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-cd20a905","guard":[["hasAny",["bahrain","each word","qatar","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-f8c759f9","guard":[["hasAny",["each word","mayotte","reunion","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-fe5367fe","guard":[["hasAny",["each word","guernsey","split into words","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-00cea877","guard":[["hasAny",["all caps","capital letters","capitals","guernsey","item number","nth","position","upper case","uppercase","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-01b4079d","guard":[["hasAny",["invert case","item number","mayotte","nth","position","reunion","swap case","toggle case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0f03d7a7","guard":[["hasAny",["bahrain","item number","kuwait","longest","longest one","longest word","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-21c13475","guard":[["hasAny",["capitalise","capitalize","capitalize each word","guernsey","item number","nth","position","title case","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3786c72a","guard":[["hasAny",["bahrain","capitalise","capitalize","capitalize each word","item number","nth","position","qatar","title case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-48ca34db","guard":[["hasAny",["fiji","invert case","item number","nauru","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-563dca78","guard":[["hasAny",["all caps","capital letters","capitals","fiji","item number","nauru","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-5d3a15d3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mayotte","nth","position","reunion","title case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7a31e0a1","guard":[["hasAny",["fiji","item number","nauru","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-911ea0dc","guard":[["hasAny",["item number","longest","longest one","longest word","nauru","nth","palau","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-a3e1cb2f","guard":[["hasAny",["bahrain","item number","lower case","lowercase","nth","position","qatar","small letters"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a62a733a","guard":[["hasAny",["fiji","item number","lower case","lowercase","nauru","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a641d558","guard":[["hasAny",["guernsey","invert case","item number","nth","position","swap case","toggle case","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b3a53207","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fiji","item number","nauru","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b9e93216","guard":[["hasAny",["bahrain","invert case","item number","nth","position","qatar","swap case","toggle case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d7140c96","guard":[["hasAny",["all caps","bahrain","capital letters","capitals","item number","nth","position","qatar","upper case","uppercase"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-db6e9041","guard":[["hasAny",["item number","lower case","lowercase","mayotte","nth","position","reunion","small letters"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e3b8eaf7","guard":[["hasAny",["guernsey","item number","lower case","lowercase","nth","position","small letters","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f3e4b9b5","guard":[["hasAny",["all caps","capital letters","capitals","item number","mayotte","nth","position","reunion","upper case","uppercase"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-fad7a11a","guard":[["hasAny",["bahrain","item number","kuwait","longest","longest one","longest word","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-2836edad","guard":[["hasAny",["bahrain","each word","item number","nth","position","qatar","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3bf3f8e9","guard":[["hasAny",["each word","fiji","item number","nauru","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4af8629f","guard":[["hasAny",["each word","guernsey","item number","nth","position","split into words","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5f059a44","guard":[["hasAny",["each word","guernsey","item number","nth","position","split into words","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-618c8b32","guard":[["hasAny",["each word","item number","mayotte","nth","position","reunion","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9187f105","guard":[["hasAny",["item number","mayotte","nth","position","reunion"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-958a8ced","guard":[["hasAny",["bahrain","each word","item number","nth","position","qatar","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dec0eec2","guard":[["hasAny",["each word","fiji","item number","nauru","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ecc5d246","guard":[["hasAny",["each word","item number","mayotte","nth","position","reunion","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f32a11e7","guard":[["hasAny",["guernsey","item number","nth","position","vatican"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-00823f97","guard":[["hasAny",["dominica","iana","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Dominica use":"Dominica uses America/Dominica."}}},
{"id":"n-04642027","guard":[["hasAny",["georgia","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Georgia":"Georgia uses Asia/Tbilisi."}}},
{"id":"n-054647e2","guard":[["has","ghana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Ghana":"Ghana uses Africa/Accra."}}},
{"id":"n-0794408a","guard":[["has","egypt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Egypt":"Egypt uses Africa/Cairo."}}},
{"id":"n-085ef0ec","guard":[["hasAny",["honduras","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Honduras":"Honduras uses America/Tegucigalpa."}}},
{"id":"n-08e75901","guard":[["has","bhutan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Bhutan":"Bhutan uses Asia/Thimphu."}}},
{"id":"n-09e46462","guard":[["hasAny",["christmas","island"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Christmas Island":"Christmas Island uses Indian/Christmas."}}},
{"id":"n-0a05dfe0","guard":[["has","india"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does India use":"India uses Asia/Kolkata."}}},
{"id":"n-0a1ac3cb","guard":[["hasAny",["jan","mayen","svalbard"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Svalbard and Jan Mayen use":"Svalbard and Jan Mayen uses Arctic/Longyearbyen."}}},
{"id":"n-0a6644ba","guard":[["has","palau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Palau use":"Palau uses Pacific/Palau."}}},
{"id":"n-0a71d536","guard":[["has","guernsey"],["has","is"]],"pyramid":["render.template",{"lit":["Guernsey uses Europe/",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-0cb29f6f","guard":[["has","latvia"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Riga."]},["sense.lastWord"]],"mem":null},
{"id":"n-0fdebabe","guard":[["has","cuba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Cuba":"Cuba uses America/Havana."}}},
{"id":"n-11eeec36","guard":[["hasAny",["burkina","faso"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Burkina Faso":"Burkina Faso uses Africa/Ouagadougou."}}},
{"id":"n-1214dc75","guard":[["hasAny",["kitts","name","nevis","saint","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Saint Kitts and Nevis":"Saint Kitts and Nevis uses America/St_Kitts."}}},
{"id":"n-13041292","guard":[["has","kingdom"],["has","time"]],"pyramid":["render.template",{"lit":["United ",{"slot":0}," uses Europe/London."]},["sense.lastWord"]],"mem":null},
{"id":"n-15ca88f8","guard":[["has","cambodia"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Phnom_Penh."]},["sense.lastWord"]],"mem":null},
{"id":"n-15e19048","guard":[["hasAny",["iana","slovenia","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Slovenia use":"Slovenia uses Europe/Ljubljana."}}},
{"id":"n-16e68101","guard":[["has","rwanda"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Kigali."]},["sense.lastWord"]],"mem":null},
{"id":"n-172a7825","guard":[["has","turkey"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Turkey":"Turkey uses Europe/Istanbul."}}},
{"id":"n-17c05040","guard":[["has","finland"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Helsinki."]},["sense.lastWord"]],"mem":null},
{"id":"n-18e45c82","guard":[["hasAny",["database","principe","sao","tome","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Sao Tome and Principe":"Sao Tome and Principe uses Africa/Sao_Tome."}}},
{"id":"n-1a1542c4","guard":[["has","cuba"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Havana."]},["sense.lastWord"]],"mem":null},
{"id":"n-1a5118e9","guard":[["hasAny",["iana","jamaica","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Jamaica use":"Jamaica uses America/Jamaica."}}},
{"id":"n-1b69e45e","guard":[["has","israel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Israel":"Israel uses Asia/Jerusalem."}}},
{"id":"n-1bde133b","guard":[["hasAny",["comoros","iana","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Comoros use":"Comoros uses Indian/Comoro."}}},
{"id":"n-1ce71001","guard":[["hasAny",["curacao","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Curacao":"Curacao uses America/Curacao."}}},
{"id":"n-1da990f7","guard":[["hasAny",["marino","name","san","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of San Marino":"San Marino uses Europe/San_Marino."}}},
{"id":"n-1edade7d","guard":[["hasAny",["austria","database","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Austria":"Austria uses Europe/Vienna."}}},
{"id":"n-1f339481","guard":[["hasAny",["guadeloupe","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Guadeloupe":"Guadeloupe uses America/Guadeloupe."}}},
{"id":"n-1fd5b50e","guard":[["has","lithuania"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vilnius."]},["sense.lastWord"]],"mem":null},
{"id":"n-207c04a8","guard":[["has","cambodia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Cambodia":"Cambodia uses Asia/Phnom_Penh."}}},
{"id":"n-22356ee3","guard":[["hasAny",["name","reunion","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Reunion":"Reunion uses Indian/Reunion."}}},
{"id":"n-23d970a6","guard":[["hasAny",["bonaire","eustatius","name","saba","saint","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Bonaire, Saint Eustatius and Saba":"Bonaire, Saint Eustatius and Saba uses America/Kralendijk."}}},
{"id":"n-25d3c424","guard":[["has","sudan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Sudan":"Sudan uses Africa/Khartoum."}}},
{"id":"n-271a0657","guard":[["hasAny",["bermuda","database","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Bermuda":"Bermuda uses Atlantic/Bermuda."}}},
{"id":"n-275de4f1","guard":[["has","macedonia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does North Macedonia use":"North Macedonia uses Europe/Skopje."}}},
{"id":"n-2766ccc1","guard":[["hasAny",["iana","mali","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Mali use":"Mali uses Africa/Bamako."}}},
{"id":"n-287678b5","guard":[["has","guiana"],["has","tz"]],"pyramid":["render.template",{"lit":["French ",{"slot":0}," uses America/Cayenne."]},["sense.lastWord"]],"mem":null},
{"id":"n-28fb05bb","guard":[["hasAny",["egypt","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Egypt":"Egypt uses Africa/Cairo."}}},
{"id":"n-29c0fb24","guard":[["hasAny",["fiji","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Fiji":"Fiji uses Pacific/Fiji."}}},
{"id":"n-2a8fa491","guard":[["has","curacao"]],"pyramid":["render.template",{"lit":["Curacao uses America/",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-2cb68d07","guard":[["hasAny",["benin","database","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Benin":"Benin uses Africa/Porto-Novo."}}},
{"id":"n-2dec7029","guard":[["hasAny",["name","time","vanuatu","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Vanuatu":"Vanuatu uses Pacific/Efate."}}},
{"id":"n-3025de05","guard":[["has","bahrain"],["has","time"]],"pyramid":["render.template",{"lit":["Bahrain uses Asia/",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-30c578e5","guard":[["has","comoros"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Comoros use":"Comoros uses Indian/Comoro."}}},
{"id":"n-31686652","guard":[["hasAny",["faroe","islands"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Faroe Islands":"Faroe Islands uses Atlantic/Faroe."}}},
{"id":"n-3217a8d9","guard":[["has","vietnam"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Vietnam":"Vietnam uses Asia/Ho_Chi_Minh."}}},
{"id":"n-34509d21","guard":[["has","dominican"],["has","time"]],"pyramid":["render.template",{"lit":["Dominican ",{"slot":0}," uses America/Santo_Domingo."]},["sense.lastWord"]],"mem":null},
{"id":"n-35bc9bdf","guard":[["has","slovakia"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Bratislava."]},["sense.lastWord"]],"mem":null},
{"id":"n-3705a732","guard":[["has","ireland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Ireland":"Ireland uses Europe/Dublin."}}},
{"id":"n-3bc3a516","guard":[["has","mayotte"],["has","tz"]],"pyramid":["render.template",{"lit":["Mayotte uses Indian/",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-3ea18d76","guard":[["hasAny",["iana","niue","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Niue use":"Niue uses Pacific/Niue."}}},
{"id":"n-421b21b4","guard":[["has","ireland"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Dublin."]},["sense.lastWord"]],"mem":null},
{"id":"n-437720b5","guard":[["has","libya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Libya":"Libya uses Africa/Tripoli."}}},
{"id":"n-44438d7d","guard":[["has","reunion"],["has","time"]],"pyramid":["render.template",{"lit":["Reunion uses Indian/",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-44f89b2f","guard":[["hasAny",["database","ghana","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Ghana":"Ghana uses Africa/Accra."}}},
{"id":"n-474f85f8","guard":[["has","bhutan"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Thimphu."]},["sense.lastWord"]],"mem":null},
{"id":"n-47512d06","guard":[["hasAny",["database","peru","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Peru":"Peru uses America/Lima."}}},
{"id":"n-48410a88","guard":[["hasAny",["iana","samoa","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Samoa use":"Samoa uses Pacific/Apia."}}},
{"id":"n-4861ddf7","guard":[["has","fiji"],["has","name"]],"pyramid":["render.template",{"lit":["Fiji uses Pacific/",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-48c0eb98","guard":[["has","hungary"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Budapest."]},["sense.lastWord"]],"mem":null},
{"id":"n-48f52b98","guard":[["hasAny",["christmas","database","island","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Christmas Island":"Christmas Island uses Indian/Christmas."}}},
{"id":"n-48f84ccd","guard":[["has","qatar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Qatar":"Qatar uses Asia/Qatar."}}},
{"id":"n-495df561","guard":[["hasAny",["database","french","guiana","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for French Guiana":"French Guiana uses America/Cayenne."}}},
{"id":"n-49d4bd90","guard":[["hasAny",["database","guernsey","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Guernsey":"Guernsey uses Europe/Guernsey."}}},
{"id":"n-4a467ded","guard":[["has","austria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Austria":"Austria uses Europe/Vienna."}}},
{"id":"n-4a4e3d93","guard":[["has","guiana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for French Guiana":"French Guiana uses America/Cayenne."}}},
{"id":"n-4c134c82","guard":[["hasAny",["database","seychelles","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Seychelles":"Seychelles uses Indian/Mahe."}}},
{"id":"n-4cb6d47d","guard":[["hasAny",["cuba","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Cuba":"Cuba uses America/Havana."}}},
{"id":"n-4f138f36","guard":[["hasAny",["database","ireland","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Ireland":"Ireland uses Europe/Dublin."}}},
{"id":"n-4faa9b31","guard":[["hasAny",["database","mayotte","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Mayotte":"Mayotte uses Indian/Mayotte."}}},
{"id":"n-52fc8758","guard":[["hasAny",["database","lithuania","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Lithuania":"Lithuania uses Europe/Vilnius."}}},
{"id":"n-53308233","guard":[["has","peru"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Peru":"Peru uses America/Lima."}}},
{"id":"n-539e2eee","guard":[["has","botswana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Botswana":"Botswana uses Africa/Gaborone."}}},
{"id":"n-54339bb3","guard":[["hasAny",["southern","territories"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for French Southern Territories":"French Southern Territories uses Indian/Kerguelen."}}},
{"id":"n-556613ba","guard":[["has","estonia"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Tallinn."]},["sense.lastWord"]],"mem":null},
{"id":"n-55ae4553","guard":[["has","greece"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Athens."]},["sense.lastWord"]],"mem":null},
{"id":"n-56f52a36","guard":[["hasAny",["burkina","database","faso","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Burkina Faso":"Burkina Faso uses Africa/Ouagadougou."}}},
{"id":"n-570b1bef","guard":[["hasAny",["leste","timor"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Timor Leste":"Timor Leste uses Asia/Dili."}}},
{"id":"n-57f9bc42","guard":[["has","finland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Finland":"Finland uses Europe/Helsinki."}}},
{"id":"n-5ae0115c","guard":[["hasAny",["database","guinea","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Guinea":"Guinea uses Africa/Conakry."}}},
{"id":"n-5c12f88b","guard":[["hasAny",["database","djibouti","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Djibouti":"Djibouti uses Africa/Djibouti."}}},
{"id":"n-5f87ae98","guard":[["has","sudan"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Khartoum."]},["sense.lastWord"]],"mem":null},
{"id":"n-608cbb84","guard":[["hasAny",["database","estonia","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Estonia":"Estonia uses Europe/Tallinn."}}},
{"id":"n-63d450fc","guard":[["has","djibouti"],["has","tz"]],"pyramid":["render.template",{"lit":["Djibouti uses Africa/",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-64bfddaa","guard":[["has","azerbaijan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Azerbaijan use":"Azerbaijan uses Asia/Baku."}}},
{"id":"n-64d40c6e","guard":[["has","seychelles"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Seychelles":"Seychelles uses Indian/Mahe."}}},
{"id":"n-650aff8b","guard":[["hasAny",["denmark","iana","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Denmark use":"Denmark uses Europe/Copenhagen."}}},
{"id":"n-663421ee","guard":[["hasAny",["name","nicaragua","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Nicaragua":"Nicaragua uses America/Managua."}}},
{"id":"n-687be724","guard":[["has","falkland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Falkland Islands use":"Falkland Islands uses Atlantic/Stanley."}}},
{"id":"n-6937855c","guard":[["has","vatican"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Vatican":"Vatican uses Europe/Vatican."}}},
{"id":"n-6a9011b9","guard":[["has","guinea"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Conakry."]},["sense.lastWord"]],"mem":null},
{"id":"n-6e588bfc","guard":[["has","nauru"],["has","name"]],"pyramid":["render.template",{"lit":["Nauru uses Pacific/",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-70358c3a","guard":[["has","georgia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Georgia":"Georgia uses Asia/Tbilisi."}}},
{"id":"n-721ad6e6","guard":[["hasAny",["albania","iana","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Albania use":"Albania uses Europe/Tirane."}}},
{"id":"n-7263070b","guard":[["hasAny",["database","laos","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Laos":"Laos uses Asia/Vientiane."}}},
{"id":"n-7329c9ad","guard":[["has","kingdom"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of United Kingdom":"United Kingdom uses Europe/London."}}},
{"id":"n-74dbd074","guard":[["hasAny",["database","qatar","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Qatar":"Qatar uses Asia/Qatar."}}},
{"id":"n-75458700","guard":[["has","guinea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Guinea":"Guinea uses Africa/Conakry."}}},
{"id":"n-756ee872","guard":[["has","cook"],["has","time"]],"pyramid":["render.template",{"lit":["Cook ",{"slot":0}," uses Pacific/Rarotonga."]},["sense.lastWord"]],"mem":null},
{"id":"n-758d6bc8","guard":[["hasAny",["arab","emirates"]],["has","time"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of United Arab Emirates":"United Arab Emirates uses Asia/Dubai."}}},
{"id":"n-7590787d","guard":[["hasAny",["marino","san"]],["has","time"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of San Marino":"San Marino uses Europe/San_Marino."}}},
{"id":"n-77cdfdae","guard":[["has","burundi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Burundi use":"Burundi uses Africa/Bujumbura."}}},
{"id":"n-77d4c8b6","guard":[["has","guernsey"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Guernsey":"Guernsey uses Europe/Guernsey."}}},
{"id":"n-77eb17f3","guard":[["hasAny",["israel","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Israel":"Israel uses Asia/Jerusalem."}}},
{"id":"n-77fd4d10","guard":[["has","madagascar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Madagascar use":"Madagascar uses Indian/Antananarivo."}}},
{"id":"n-7a78b91b","guard":[["hasAny",["name","time","vatican","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Vatican":"Vatican uses Europe/Vatican."}}},
{"id":"n-7b80c117","guard":[["has","netherlands"],["has","tz"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," uses Europe/Amsterdam."]},["sense.lastWord"]],"mem":null},
{"id":"n-7e7bd906","guard":[["hasAny",["bahrain","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Bahrain":"Bahrain uses Asia/Bahrain."}}},
{"id":"n-7e7cf252","guard":[["hasAny",["name","time","turkmenistan","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Turkmenistan":"Turkmenistan uses Asia/Ashgabat."}}},
{"id":"n-7f1e93d4","guard":[["hasAny",["iana","kenya","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Kenya use":"Kenya uses Africa/Nairobi."}}},
{"id":"n-7f203c64","guard":[["has","egypt"],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Cairo."]},["sense.lastWord"]],"mem":null},
{"id":"n-7f633d98","guard":[["hasAny",["lanka","name","sri","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Sri Lanka":"Sri Lanka uses Asia/Colombo."}}},
{"id":"n-7f83b83c","guard":[["has","samoa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Samoa use":"Samoa uses Pacific/Apia."}}},
{"id":"n-7fc071ac","guard":[["has","panama"],["has","tz"]],"pyramid":["render.template",{"lit":["Panama uses America/",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-809b4c55","guard":[["hasAny",["database","french","southern","territories","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for French Southern Territories":"French Southern Territories uses Indian/Kerguelen."}}},
{"id":"n-8109cfd0","guard":[["hasAny",["cook","islands"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Cook Islands":"Cook Islands uses Pacific/Rarotonga."}}},
{"id":"n-811e081f","guard":[["has","benin"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Porto-Novo."]},["sense.lastWord"]],"mem":null},
{"id":"n-81923e62","guard":[["hasAny",["iana","montserrat","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Montserrat use":"Montserrat uses America/Montserrat."}}},
{"id":"n-81ae86a8","guard":[["hasAny",["iana","liechtenstein","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Liechtenstein use":"Liechtenstein uses Europe/Vaduz."}}},
{"id":"n-840dc339","guard":[["has","laos"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Vientiane."]},["sense.lastWord"]],"mem":null},
{"id":"n-8510ac4f","guard":[["has","bermuda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Bermuda":"Bermuda uses Atlantic/Bermuda."}}},
{"id":"n-85721486","guard":[["has","barthelemy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Saint Barthelemy":"Saint Barthelemy uses America/St_Barthelemy."}}},
{"id":"n-857370c1","guard":[["has","vanuatu"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Efate."]},["sense.lastWord"]],"mem":null},
{"id":"n-87d73e42","guard":[["hasAny",["name","nauru","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Nauru":"Nauru uses Pacific/Nauru."}}},
{"id":"n-88cf50f5","guard":[["hasAny",["arabia","saudi"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Saudi Arabia use":"Saudi Arabia uses Asia/Riyadh."}}},
{"id":"n-890bffea","guard":[["has","lanka"],["has","name"]],"pyramid":["render.template",{"lit":["Sri ",{"slot":0}," uses Asia/Colombo."]},["sense.lastWord"]],"mem":null},
{"id":"n-898d8969","guard":[["has","vatican"],["has","name"]],"pyramid":["render.template",{"lit":["Vatican uses Europe/",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-8ab352f5","guard":[["hasAny",["falkland","iana","islands","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Falkland Islands use":"Falkland Islands uses Atlantic/Stanley."}}},
{"id":"n-8be4cdfd","guard":[["has","panama"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Panama":"Panama uses America/Panama."}}},
{"id":"n-8c65b5e9","guard":[["has","germany"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Germany use":"Germany uses Europe/Berlin."}}},
{"id":"n-8c691ae4","guard":[["has","austria"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vienna."]},["sense.lastWord"]],"mem":null},
{"id":"n-8cbc377f","guard":[["hasAny",["cabo","verde"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Cabo Verde use":"Cabo Verde uses Atlantic/Cape_Verde."}}},
{"id":"n-9061e2c2","guard":[["hasAny",["iana","maarten","sint","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Sint Maarten use":"Sint Maarten uses America/Lower_Princes."}}},
{"id":"n-90699fe1","guard":[["has","guadeloupe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Guadeloupe":"Guadeloupe uses America/Guadeloupe."}}},
{"id":"n-91c5bf83","guard":[["hasAny",["arabia","iana","saudi","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Saudi Arabia use":"Saudi Arabia uses Asia/Riyadh."}}},
{"id":"n-92268bfa","guard":[["hasAny",["mariana","northern"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Northern Mariana Islands use":"Northern Mariana Islands uses Pacific/Saipan."}}},
{"id":"n-92ce4a08","guard":[["hasAny",["database","netherlands","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for The Netherlands":"The Netherlands uses Europe/Amsterdam."}}},
{"id":"n-9318543f","guard":[["has","czechia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Czechia use":"Czechia uses Europe/Prague."}}},
{"id":"n-93863846","guard":[["hasAny",["iana","india","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does India use":"India uses Asia/Kolkata."}}},
{"id":"n-9480402d","guard":[["hasAny",["database","principe","sao","tome","tz","zone"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Sao Tome and Principe":"Sao Tome and Principe uses Africa/Sao_Tome."}}},
{"id":"n-963d7998","guard":[["hasAny",["database","greece","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Greece":"Greece uses Europe/Athens."}}},
{"id":"n-98b39f50","guard":[["has","slovenia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Slovenia use":"Slovenia uses Europe/Ljubljana."}}},
{"id":"n-99076c85","guard":[["hasAny",["database","latvia","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Latvia":"Latvia uses Europe/Riga."}}},
{"id":"n-9989d3e2","guard":[["has","korea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does North Korea use":"North Korea uses Asia/Pyongyang."}}},
{"id":"n-9ba75421","guard":[["has","ghana"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Accra."]},["sense.lastWord"]],"mem":null},
{"id":"n-9bcf30af","guard":[["has","latvia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Latvia":"Latvia uses Europe/Riga."}}},
{"id":"n-9e1650bc","guard":[["has","vanuatu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Vanuatu":"Vanuatu uses Pacific/Efate."}}},
{"id":"n-9f468812","guard":[["has","kenya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Kenya use":"Kenya uses Africa/Nairobi."}}},
{"id":"n-9fcc6427","guard":[["hasAny",["iana","korea","north","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does North Korea use":"North Korea uses Asia/Pyongyang."}}},
{"id":"n-a0dccbdf","guard":[["hasAny",["name","time","turkey","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Turkey":"Turkey uses Europe/Istanbul."}}},
{"id":"n-a191121a","guard":[["hasAny",["cabo","iana","time","use","verde","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Cabo Verde use":"Cabo Verde uses Atlantic/Cape_Verde."}}},
{"id":"n-a1a55093","guard":[["has","qatar"],["has","tz"]],"pyramid":["render.template",{"lit":["Qatar uses Asia/",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-a50cd9c4","guard":[["has","mayotte"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Mayotte":"Mayotte uses Indian/Mayotte."}}},
{"id":"n-a61306d4","guard":[["hasAny",["iana","jan","mayen","svalbard","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Svalbard and Jan Mayen use":"Svalbard and Jan Mayen uses Arctic/Longyearbyen."}}},
{"id":"n-a655bbb1","guard":[["hasAny",["iana","tajikistan","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Tajikistan use":"Tajikistan uses Asia/Dushanbe."}}},
{"id":"n-a6664306","guard":[["has","faroe"],["has","tz"]],"pyramid":["render.template",{"lit":["Faroe ",{"slot":0}," uses Atlantic/Faroe."]},["sense.lastWord"]],"mem":null},
{"id":"n-a82167a7","guard":[["hasAny",["germany","iana","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Germany use":"Germany uses Europe/Berlin."}}},
{"id":"n-a85032f9","guard":[["has","albania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Albania use":"Albania uses Europe/Tirane."}}},
{"id":"n-a8fa836e","guard":[["hasAny",["bonaire","eustatius","saba"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Bonaire, Saint Eustatius and Saba":"Bonaire, Saint Eustatius and Saba uses America/Kralendijk."}}},
{"id":"n-aa53205d","guard":[["hasAny",["database","faroe","islands","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Faroe Islands":"Faroe Islands uses Atlantic/Faroe."}}},
{"id":"n-aac09536","guard":[["has","liberia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Liberia use":"Liberia uses Africa/Monrovia."}}},
{"id":"n-aac3a693","guard":[["hasAny",["name","time","vietnam","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Vietnam":"Vietnam uses Asia/Ho_Chi_Minh."}}},
{"id":"n-aad80aa5","guard":[["hasAny",["kitts","nevis"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Saint Kitts and Nevis":"Saint Kitts and Nevis uses America/St_Kitts."}}},
{"id":"n-aaeec51d","guard":[["has","slovakia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Slovakia":"Slovakia uses Europe/Bratislava."}}},
{"id":"n-ac5f19c7","guard":[["has","kuwait"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Kuwait use":"Kuwait uses Asia/Kuwait."}}},
{"id":"n-ac6f992e","guard":[["has","guadeloupe"],["has","time"]],"pyramid":["render.template",{"lit":["Guadeloupe uses America/",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-ad0890a6","guard":[["hasAny",["iana","islands","mariana","northern","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Northern Mariana Islands use":"Northern Mariana Islands uses Pacific/Saipan."}}},
{"id":"n-adfa80a2","guard":[["has","estonia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Estonia":"Estonia uses Europe/Tallinn."}}},
{"id":"n-ae10fdc4","guard":[["hasAny",["database","nepal","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Nepal":"Nepal uses Asia/Kathmandu."}}},
{"id":"n-aef94f64","guard":[["hasAny",["dominican","republic"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Dominican Republic":"Dominican Republic uses America/Santo_Domingo."}}},
{"id":"n-af5f3ce2","guard":[["hasAny",["dominican","name","republic","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Dominican Republic":"Dominican Republic uses America/Santo_Domingo."}}},
{"id":"n-afd8b8b9","guard":[["has","jamaica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Jamaica use":"Jamaica uses America/Jamaica."}}},
{"id":"n-b03e5332","guard":[["has","peru"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Lima."]},["sense.lastWord"]],"mem":null},
{"id":"n-b1ef4c72","guard":[["hasAny",["british","iana","indian","ocean","territory","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does British Indian Ocean Territory use":"British Indian Ocean Territory uses Indian/Chagos."}}},
{"id":"n-b1ff2c7b","guard":[["has","montserrat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Montserrat use":"Montserrat uses America/Montserrat."}}},
{"id":"n-b21eccff","guard":[["hasAny",["lanka","sri"]],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Sri Lanka":"Sri Lanka uses Asia/Colombo."}}},
{"id":"n-b22852a9","guard":[["has","netherlands"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for The Netherlands":"The Netherlands uses Europe/Amsterdam."}}},
{"id":"n-b37aaceb","guard":[["has","laos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Laos":"Laos uses Asia/Vientiane."}}},
{"id":"n-b39280b7","guard":[["hasAny",["helena","saint"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Saint Helena":"Saint Helena uses Atlantic/St_Helena."}}},
{"id":"n-b425bfef","guard":[["hasAny",["iana","suriname","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Suriname use":"Suriname uses America/Paramaribo."}}},
{"id":"n-b65323c9","guard":[["has","turkmenistan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Turkmenistan":"Turkmenistan uses Asia/Ashgabat."}}},
{"id":"n-b707cbc5","guard":[["hasAny",["iana","kuwait","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Kuwait use":"Kuwait uses Asia/Kuwait."}}},
{"id":"n-b90110af","guard":[["has","nepal"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Kathmandu."]},["sense.lastWord"]],"mem":null},
{"id":"n-bebd52cb","guard":[["has","armenia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Armenia":"Armenia uses Asia/Yerevan."}}},
{"id":"n-c264f4d9","guard":[["hasAny",["bhutan","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Bhutan":"Bhutan uses Asia/Thimphu."}}},
{"id":"n-c313b09c","guard":[["hasAny",["czechia","iana","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Czechia use":"Czechia uses Europe/Prague."}}},
{"id":"n-c32111dc","guard":[["hasAny",["database","panama","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Panama":"Panama uses America/Panama."}}},
{"id":"n-c437daac","guard":[["hasAny",["database","sudan","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Sudan":"Sudan uses Africa/Khartoum."}}},
{"id":"n-c5563aa2","guard":[["has","niue"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Niue use":"Niue uses Pacific/Niue."}}},
{"id":"n-c5778c65","guard":[["hasAny",["iana","madagascar","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Madagascar use":"Madagascar uses Indian/Antananarivo."}}},
{"id":"n-c7721151","guard":[["hasAny",["isle","man"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Isle of Man use":"Isle of Man uses Europe/Isle_of_Man."}}},
{"id":"n-c8c0ccbc","guard":[["hasAny",["finland","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Finland":"Finland uses Europe/Helsinki."}}},
{"id":"n-c98cf44d","guard":[["has","nepal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Nepal":"Nepal uses Asia/Kathmandu."}}},
{"id":"n-cd26c77b","guard":[["has","djibouti"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Djibouti":"Djibouti uses Africa/Djibouti."}}},
{"id":"n-cd5d3a33","guard":[["hasAny",["database","rwanda","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Rwanda":"Rwanda uses Africa/Kigali."}}},
{"id":"n-d077dd64","guard":[["has","libya"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Tripoli."]},["sense.lastWord"]],"mem":null},
{"id":"n-d187a0d6","guard":[["hasAny",["iana","palau","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Palau use":"Palau uses Pacific/Palau."}}},
{"id":"n-d2ea34b6","guard":[["hasAny",["cook","islands","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Cook Islands":"Cook Islands uses Pacific/Rarotonga."}}},
{"id":"n-d56b8841","guard":[["has","seychelles"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Mahe."]},["sense.lastWord"]],"mem":null},
{"id":"n-d6399ce2","guard":[["hasAny",["cambodia","database","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Cambodia":"Cambodia uses Asia/Phnom_Penh."}}},
{"id":"n-d6e80653","guard":[["has","vietnam"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ho_Chi_Minh."]},["sense.lastWord"]],"mem":null},
{"id":"n-d6ee58b8","guard":[["hasAny",["name","slovakia","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Slovakia":"Slovakia uses Europe/Bratislava."}}},
{"id":"n-d7224ee4","guard":[["has","denmark"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Denmark use":"Denmark uses Europe/Copenhagen."}}},
{"id":"n-d7470977","guard":[["hasAny",["azerbaijan","iana","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Azerbaijan use":"Azerbaijan uses Asia/Baku."}}},
{"id":"n-d7f1fbee","guard":[["has","leste"]],"pyramid":["render.template",{"lit":["Timor ",{"slot":0}," uses Asia/Dili."]},["sense.lastWord"]],"mem":null},
{"id":"n-d87664b0","guard":[["hasAny",["iana","macedonia","north","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does North Macedonia use":"North Macedonia uses Europe/Skopje."}}},
{"id":"n-daf84401","guard":[["hasAny",["iana","iran","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Iran use":"Iran uses Asia/Tehran."}}},
{"id":"n-db1e3216","guard":[["has","bermuda"],["has","tz"]],"pyramid":["render.template",{"lit":["Bermuda uses Atlantic/",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-dd627e53","guard":[["hasAny",["armenia","database","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Armenia":"Armenia uses Asia/Yerevan."}}},
{"id":"n-dd675f56","guard":[["has","greece"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Greece":"Greece uses Europe/Athens."}}},
{"id":"n-de11e5ef","guard":[["has","burkina"],["has","tz"]],"pyramid":["render.template",{"lit":["Burkina ",{"slot":0}," uses Africa/Ouagadougou."]},["sense.lastWord"]],"mem":null},
{"id":"n-de305bb8","guard":[["has","nauru"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Nauru":"Nauru uses Pacific/Nauru."}}},
{"id":"n-dee50c7f","guard":[["has","israel"],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Jerusalem."]},["sense.lastWord"]],"mem":null},
{"id":"n-df66a7ba","guard":[["has","honduras"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Honduras":"Honduras uses America/Tegucigalpa."}}},
{"id":"n-df9ec79c","guard":[["hasAny",["barthelemy","name","saint","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Saint Barthelemy":"Saint Barthelemy uses America/St_Barthelemy."}}},
{"id":"n-e087c226","guard":[["hasAny",["burundi","iana","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Burundi use":"Burundi uses Africa/Bujumbura."}}},
{"id":"n-e193bb63","guard":[["has","liechtenstein"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Liechtenstein use":"Liechtenstein uses Europe/Vaduz."}}},
{"id":"n-e296e5c1","guard":[["hasAny",["arab","emirates","name","time","united","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of United Arab Emirates":"United Arab Emirates uses Asia/Dubai."}}},
{"id":"n-e344e50c","guard":[["has","rwanda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Rwanda":"Rwanda uses Africa/Kigali."}}},
{"id":"n-e39f4987","guard":[["has","honduras"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Tegucigalpa."]},["sense.lastWord"]],"mem":null},
{"id":"n-e57f91c1","guard":[["has","benin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Benin":"Benin uses Africa/Porto-Novo."}}},
{"id":"n-e7e39a26","guard":[["has","mali"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Mali use":"Mali uses Africa/Bamako."}}},
{"id":"n-e90e6179","guard":[["has","reunion"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Reunion":"Reunion uses Indian/Reunion."}}},
{"id":"n-e91afbe7","guard":[["hasAny",["database","leste","timor","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Timor Leste":"Timor Leste uses Asia/Dili."}}},
{"id":"n-e95706f6","guard":[["has","fiji"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Fiji":"Fiji uses Pacific/Fiji."}}},
{"id":"n-e9c2de8f","guard":[["has","tajikistan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Tajikistan use":"Tajikistan uses Asia/Dushanbe."}}},
{"id":"n-e9f8fbfa","guard":[["hasAny",["botswana","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Botswana":"Botswana uses Africa/Gaborone."}}},
{"id":"n-ea5a0449","guard":[["has","curacao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Curacao":"Curacao uses America/Curacao."}}},
{"id":"n-ea74a6ec","guard":[["hasAny",["maarten","sint"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Sint Maarten use":"Sint Maarten uses America/Lower_Princes."}}},
{"id":"n-f01e819a","guard":[["has","turkey"],["has","name"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Istanbul."]},["sense.lastWord"]],"mem":null},
{"id":"n-f05e8002","guard":[["hasAny",["name","philippines","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Philippines":"Philippines uses Asia/Manila."}}},
{"id":"n-f0d4a2c0","guard":[["has","philippines"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Philippines":"Philippines uses Asia/Manila."}}},
{"id":"n-f0df57d1","guard":[["hasAny",["database","libya","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Libya":"Libya uses Africa/Tripoli."}}},
{"id":"n-f11b8a34","guard":[["has","lithuania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Lithuania":"Lithuania uses Europe/Vilnius."}}},
{"id":"n-f1483150","guard":[["has","hungary"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Hungary":"Hungary uses Europe/Budapest."}}},
{"id":"n-f1543993","guard":[["has","dominica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Dominica use":"Dominica uses America/Dominica."}}},
{"id":"n-f16b9a60","guard":[["hasAny",["iana","isle","man","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Isle of Man use":"Isle of Man uses Europe/Isle_of_Man."}}},
{"id":"n-f202de42","guard":[["hasAny",["iana","liberia","time","use","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which IANA time zone does Liberia use":"Liberia uses Africa/Monrovia."}}},
{"id":"n-f2ac605e","guard":[["has","nicaragua"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Nicaragua":"Nicaragua uses America/Managua."}}},
{"id":"n-f3728f5b","guard":[["hasAny",["kingdom","name","time","united","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of United Kingdom":"United Kingdom uses Europe/London."}}},
{"id":"n-f3b580c4","guard":[["has","belize"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Belize":"Belize uses America/Belize."}}},
{"id":"n-f599c93d","guard":[["has","suriname"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Suriname use":"Suriname uses America/Paramaribo."}}},
{"id":"n-f5e91ac4","guard":[["hasAny",["database","helena","saint","tz","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the tz database zone for Saint Helena":"Saint Helena uses Atlantic/St_Helena."}}},
{"id":"n-f639ad56","guard":[["has","iran"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does Iran use":"Iran uses Asia/Tehran."}}},
{"id":"n-f68a2eee","guard":[["has","nicaragua"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Managua."]},["sense.lastWord"]],"mem":null},
{"id":"n-f6f201ff","guard":[["has","belize"],["has","name"]],"pyramid":["render.template",{"lit":["Belize uses America/",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-f74cb707","guard":[["has","botswana"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Gaborone."]},["sense.lastWord"]],"mem":null},
{"id":"n-fa0a202b","guard":[["has","turkmenistan"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ashgabat."]},["sense.lastWord"]],"mem":null},
{"id":"n-fa1a9a9e","guard":[["hasAny",["hungary","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Hungary":"Hungary uses Europe/Budapest."}}},
{"id":"n-fb6010b9","guard":[["hasAny",["british","iana","indian","ocean","territory","time","use","zone"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which IANA time zone does British Indian Ocean Territory use":"British Indian Ocean Territory uses Indian/Chagos."}}},
{"id":"n-fc798ff6","guard":[["hasAny",["belize","name","time","zone"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the time zone of Belize":"Belize uses America/Belize."}}},
{"id":"n-fe1b343f","guard":[["has","georgia"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Tbilisi."]},["sense.lastWord"]],"mem":null},
{"id":"n-fe27134e","guard":[["has","philippines"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Manila."]},["sense.lastWord"]],"mem":null},
{"id":"n-ff34b2a4","guard":[["has","armenia"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Yerevan."]},["sense.lastWord"]],"mem":null},
{"id":"n-ff3cd616","guard":[["has","bahrain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the time zone of Bahrain":"Bahrain uses Asia/Bahrain."}}},
{"id":"n-01a8539a","guard":[["hasAny",["azerbaijan","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Baku."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-045c62a1","guard":[["hasAny",["armenia","capitalise","capitalize","capitalize each word","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Yerevan."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-05ae0bee","guard":[["hasAny",["benin","invert case","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Porto-Novo."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-05e292d0","guard":[["hasAny",["denmark","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Copenhagen."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-06d02075","guard":[["has","laos"],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Vientiane."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-09e01d6c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","greece","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Athens."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0a1669fe","guard":[["has","djibouti"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-0a25188c","guard":[["hasAny",["lower case","lowercase","slovakia","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Bratislava."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0de213b3","guard":[["hasAny",["invert case","swap case","toggle case","vanuatu"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Efate."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0f649af7","guard":[["hasAny",["all caps","capital letters","capitals","greece","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Athens."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-103a5852","guard":[["hasAny",["comoros","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Comoro."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-121725dd","guard":[["hasAny",["all caps","botswana","capital letters","capitals","upper case","uppercase"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Gaborone."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-1274d6ab","guard":[["hasAny",["longest","longest one","longest word","slovenia"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Ljubljana."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-155ce615","guard":[["hasAny",["liechtenstein","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vaduz."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-165b0472","guard":[["hasAny",["all caps","capital letters","capitals","upper case","uppercase","vietnam"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ho_Chi_Minh."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-16da2b21","guard":[["hasAny",["invert case","slovakia","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Bratislava."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1762e2c0","guard":[["hasAny",["armenia","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Yerevan."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-176ec9fb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","seychelles","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Mahe."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-187d2429","guard":[["hasAny",["all caps","capital letters","capitals","slovakia","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Bratislava."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-1896cb2d","guard":[["has","ghana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Accra."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-197ac9b7","guard":[["hasAny",["all caps","cambodia","capital letters","capitals","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Phnom_Penh."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-1af3dab6","guard":[["has","peru"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Lima."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-1cb45f5c","guard":[["has","sudan"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Khartoum."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-1d0dcb35","guard":[["hasAny",["all caps","capital letters","capitals","peru","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Lima."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-1d60e7fe","guard":[["hasAny",["invert case","swap case","toggle case","vietnam"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ho_Chi_Minh."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1d8ff778","guard":[["hasAny",["finland","invert case","swap case","toggle case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Helsinki."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1e0ff6de","guard":[["hasAny",["all caps","capital letters","capitals","hungary","upper case","uppercase"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Budapest."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-1e17f94d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hungary","title case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Budapest."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1f8f53d0","guard":[["hasAny",["all caps","capital letters","capitals","latvia","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Riga."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-1fac78b6","guard":[["hasAny",["lower case","lowercase","small letters","turkmenistan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ashgabat."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2158ce79","guard":[["hasAny",["all caps","capital letters","capitals","ireland","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Dublin."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-21d9cebe","guard":[["hasAny",["cuba","invert case","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Havana."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-24f65471","guard":[["hasAny",["capitalise","capitalize","capitalize each word","israel","title case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Jerusalem."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-257bb143","guard":[["hasAny",["lithuania","longest","longest one","longest word"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vilnius."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-26a33b92","guard":[["hasAny",["longest","longest one","longest word","montserrat"]],["has","iana"]],"pyramid":["render.template",{"lit":["Montserrat uses America/",{"slot":0},"."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-2730f5b1","guard":[["hasAny",["albania","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Tirane."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-280aabf5","guard":[["hasAny",["greece","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Athens."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2926685a","guard":[["hasAny",["georgia","invert case","swap case","toggle case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Tbilisi."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2c595886","guard":[["hasAny",["hungary","lower case","lowercase","small letters"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Budapest."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3112cde8","guard":[["hasAny",["lower case","lowercase","peru","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Lima."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-31a7977f","guard":[["hasAny",["all caps","bhutan","capital letters","capitals","upper case","uppercase"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Thimphu."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-328e6b3b","guard":[["hasAny",["germany","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Berlin."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-32a19acf","guard":[["hasAny",["all caps","capital letters","capitals","philippines","upper case","uppercase"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Manila."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-33a6bb05","guard":[["hasAny",["all caps","capital letters","capitals","israel","upper case","uppercase"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Jerusalem."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-33ac11c5","guard":[["hasAny",["burundi","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Bujumbura."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-34b40ca0","guard":[["hasAny",["invert case","rwanda","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Kigali."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-35e64bd2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","honduras","title case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Tegucigalpa."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-36564b2c","guard":[["hasAny",["cambodia","invert case","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Phnom_Penh."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3683f2b7","guard":[["hasAny",["bhutan","capitalise","capitalize","capitalize each word","title case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Thimphu."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-374d0c43","guard":[["hasAny",["hungary","invert case","swap case","toggle case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Budapest."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-379fed4b","guard":[["hasAny",["liechtenstein","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vaduz."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-38753f0c","guard":[["hasAny",["honduras","longest","longest one","longest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Tegucigalpa."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-38ab630c","guard":[["hasAny",["israel","longest","longest one","longest word"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Jerusalem."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-39943317","guard":[["hasAny",["bhutan","invert case","swap case","toggle case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Thimphu."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3a91cee9","guard":[["hasAny",["lower case","lowercase","philippines","small letters"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Manila."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3ae8147d","guard":[["hasAny",["all caps","capital letters","capitals","rwanda","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Kigali."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3ba897f1","guard":[["hasAny",["invert case","swap case","toggle case","turkey"]],["has","name"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Istanbul."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-3bb41124","guard":[["hasAny",["all caps","capital letters","capitals","cuba","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Havana."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3c8ab1ed","guard":[["hasAny",["longest","longest one","longest word","maarten"]],["has","iana"]],"pyramid":["render.template",{"lit":["Sint ",{"slot":0}," uses America/Lower_Princes."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-3e94891e","guard":[["hasAny",["kenya","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Nairobi."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-3ef65aab","guard":[["hasAny",["all caps","armenia","capital letters","capitals","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Yerevan."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3ef7f6af","guard":[["has","rwanda"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Kigali."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-4093fbb2","guard":[["hasAny",["latvia","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Riga."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-43ef3825","guard":[["hasAny",["egypt","longest","longest one","longest word"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Cairo."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-4491da51","guard":[["hasAny",["invert case","swap case","toggle case","turkmenistan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ashgabat."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-44e52525","guard":[["hasAny",["egypt","lower case","lowercase","small letters"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Cairo."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-457a23a0","guard":[["hasAny",["longest","longest one","longest word","madagascar"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Antananarivo."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-474aaa8d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","laos","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Vientiane."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-475e0401","guard":[["has","cuba"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Havana."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-4a621b15","guard":[["hasAny",["all caps","capital letters","capitals","turkmenistan","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ashgabat."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-4d85c72a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lithuania","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vilnius."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4eb0d0da","guard":[["hasAny",["lower case","lowercase","nicaragua","small letters"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Managua."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4f07dba1","guard":[["hasAny",["invert case","netherlands","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," uses Europe/Amsterdam."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-521a9ad1","guard":[["hasAny",["longest","longest one","longest word","samoa"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Apia."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-52eefc36","guard":[["hasAny",["lower case","lowercase","netherlands","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," uses Europe/Amsterdam."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-54d621a3","guard":[["hasAny",["longest","longest one","longest word","macedonia"]],["has","iana"]],"pyramid":["render.template",{"lit":["North ",{"slot":0}," uses Europe/Skopje."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-55a407e9","guard":[["hasAny",["austria","capitalise","capitalize","capitalize each word","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vienna."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5614fb15","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vanuatu"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Efate."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-56b6dde2","guard":[["hasAny",["bhutan","lower case","lowercase","small letters"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Thimphu."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-572cc265","guard":[["hasAny",["estonia","invert case","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Tallinn."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5789badc","guard":[["hasAny",["czechia","longest","longest one","longest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Prague."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-578a5b54","guard":[["hasAny",["georgia","lower case","lowercase","small letters"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Tbilisi."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5828452e","guard":[["hasAny",["longest","longest one","longest word","tajikistan"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Dushanbe."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-5a95d584","guard":[["hasAny",["invert case","philippines","swap case","toggle case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Manila."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5cfb22e0","guard":[["hasAny",["all caps","capital letters","capitals","ghana","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Accra."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-5d00056c","guard":[["has","nepal"],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Kathmandu."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-5d79037f","guard":[["hasAny",["longest","longest one","longest word","vanuatu"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Efate."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-5df71123","guard":[["hasAny",["bhutan","longest","longest one","longest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Thimphu."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-5e70c798","guard":[["hasAny",["all caps","capital letters","capitals","finland","upper case","uppercase"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Helsinki."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-5f752f77","guard":[["hasAny",["capitalise","capitalize","capitalize each word","philippines","title case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Manila."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-617588c6","guard":[["hasAny",["finland","longest","longest one","longest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Helsinki."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-61d29a7b","guard":[["hasAny",["invert case","latvia","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Riga."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-636d5b42","guard":[["hasAny",["all caps","benin","capital letters","capitals","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Porto-Novo."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-655f509f","guard":[["hasAny",["invert case","peru","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Lima."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-66759eea","guard":[["hasAny",["honduras","lower case","lowercase","small letters"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Tegucigalpa."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-685e64de","guard":[["hasAny",["capitalise","capitalize","capitalize each word","peru","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Lima."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-694d5fa2","guard":[["hasAny",["greece","invert case","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Athens."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6a0df428","guard":[["has","bermuda"],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-6a84066b","guard":[["hasAny",["invert case","sudan","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Khartoum."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6bfcc97f","guard":[["hasAny",["libya","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Tripoli."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6c911e51","guard":[["hasAny",["all caps","capital letters","capitals","estonia","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Tallinn."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-6cf18211","guard":[["hasAny",["finland","lower case","lowercase","small letters"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Helsinki."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6dbc56b6","guard":[["hasAny",["austria","invert case","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vienna."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6ef2f5ab","guard":[["hasAny",["all caps","capital letters","capitals","seychelles","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Mahe."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-7006f9f1","guard":[["hasAny",["longest","longest one","longest word","philippines"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Manila."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-71f59398","guard":[["hasAny",["capitalise","capitalize","capitalize each word","libya","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Tripoli."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-721890e1","guard":[["hasAny",["botswana","longest","longest one","longest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Gaborone."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-7244da62","guard":[["hasAny",["czechia","longest","longest one","longest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Prague."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-7405a8ef","guard":[["hasAny",["invert case","nicaragua","swap case","toggle case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Managua."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-792cb7e6","guard":[["hasAny",["laos","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Vientiane."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-79ef9508","guard":[["hasAny",["kuwait","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":["Kuwait uses Asia/",{"slot":0},"."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-7e919ff0","guard":[["hasAny",["lower case","lowercase","nepal","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Kathmandu."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-82292b86","guard":[["hasAny",["longest","longest one","longest word","palau"]],["has","iana"]],"pyramid":["render.template",{"lit":["Palau uses Pacific/",{"slot":0},"."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-84a6d8c2","guard":[["hasAny",["ghana","invert case","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Accra."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8659cd6f","guard":[["hasAny",["invert case","lithuania","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vilnius."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8794dae7","guard":[["hasAny",["cuba","lower case","lowercase","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Havana."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8a94034c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","georgia","title case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Tbilisi."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8ca2c8a4","guard":[["hasAny",["denmark","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Copenhagen."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8d809caa","guard":[["hasAny",["botswana","capitalise","capitalize","capitalize each word","title case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Gaborone."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8e508947","guard":[["hasAny",["longest","longest one","longest word","suriname"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Paramaribo."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8ecea4e8","guard":[["hasAny",["egypt","invert case","swap case","toggle case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Cairo."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8eddd2c5","guard":[["hasAny",["invert case","libya","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Tripoli."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8fadbb53","guard":[["hasAny",["india","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Kolkata."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-910a740e","guard":[["hasAny",["longest","longest one","longest word","seychelles"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Mahe."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-93fa99eb","guard":[["has","guinea"],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Conakry."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-9520e0b2","guard":[["hasAny",["georgia","longest","longest one","longest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Tbilisi."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-98b2affd","guard":[["hasAny",["israel","lower case","lowercase","small letters"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Jerusalem."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9c3a050b","guard":[["hasAny",["botswana","invert case","swap case","toggle case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Gaborone."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9c5f0033","guard":[["hasAny",["invert case","seychelles","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Mahe."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9d44f13b","guard":[["hasAny",["longest","longest one","longest word","turkmenistan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ashgabat."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-9e17461e","guard":[["hasAny",["longest","longest one","longest word","netherlands"]],["has","tz"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," uses Europe/Amsterdam."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-9f59cfc4","guard":[["hasAny",["invert case","nepal","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Kathmandu."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a1446e96","guard":[["has","armenia"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Yerevan."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-a1bf93fb","guard":[["hasAny",["invert case","ireland","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Dublin."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a24a5b01","guard":[["has","ireland"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Dublin."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-a480d93e","guard":[["hasAny",["hungary","longest","longest one","longest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Budapest."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-a4d75ffb","guard":[["hasAny",["lower case","lowercase","seychelles","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Mahe."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a52f1769","guard":[["hasAny",["all caps","capital letters","capitals","nepal","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Kathmandu."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a85688ec","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vietnam"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ho_Chi_Minh."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a9cf3538","guard":[["has","latvia"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Riga."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-ad3c6e66","guard":[["hasAny",["longest","longest one","longest word","turkey"]],["has","name"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Istanbul."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-ae4a02c4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ireland","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Dublin."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-afa1e180","guard":[["hasAny",["all caps","capital letters","capitals","libya","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Tripoli."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b06d1a48","guard":[["hasAny",["all caps","capital letters","capitals","guinea","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Conakry."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b2738112","guard":[["hasAny",["all caps","capital letters","capitals","netherlands","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," uses Europe/Amsterdam."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b39a321d","guard":[["hasAny",["longest","longest one","longest word","slovakia"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Bratislava."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-b464d2b5","guard":[["hasAny",["all caps","capital letters","capitals","upper case","uppercase","vanuatu"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Efate."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b623f0ae","guard":[["hasAny",["liberia","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Monrovia."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-b651fd7e","guard":[["hasAny",["all caps","capital letters","capitals","laos","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Vientiane."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b6810ecb","guard":[["has","cambodia"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Phnom_Penh."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-b6d7246f","guard":[["hasAny",["longest","longest one","longest word","nicaragua"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Managua."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-b6dfdc17","guard":[["hasAny",["burundi","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Bujumbura."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-b860a22e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cuba","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Havana."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b863c853","guard":[["hasAny",["botswana","lower case","lowercase","small letters"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Gaborone."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b8da2dbd","guard":[["hasAny",["lower case","lowercase","small letters","vietnam"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ho_Chi_Minh."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ba49c3e7","guard":[["hasAny",["invert case","laos","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Vientiane."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bb071022","guard":[["hasAny",["capitalise","capitalize","capitalize each word","netherlands","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," uses Europe/Amsterdam."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bb75ab7c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","turkmenistan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ashgabat."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bb9dd7b5","guard":[["hasAny",["lower case","lowercase","small letters","vanuatu"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Efate."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-bd806ee5","guard":[["hasAny",["dominica","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":["Dominica uses America/",{"slot":0},"."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-bdfed2f3","guard":[["hasAny",["ghana","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Accra."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c0c548d9","guard":[["has","libya"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Tripoli."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-c1cd0896","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sudan","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Khartoum."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c35e635a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nepal","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Kathmandu."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c590ca7c","guard":[["hasAny",["cambodia","capitalise","capitalize","capitalize each word","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Phnom_Penh."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c662c461","guard":[["hasAny",["germany","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Berlin."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c7c98f98","guard":[["hasAny",["capitalise","capitalize","capitalize each word","slovakia","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Bratislava."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c8140472","guard":[["hasAny",["capitalise","capitalize","capitalize each word","egypt","title case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Cairo."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c82d471a","guard":[["hasAny",["azerbaijan","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Baku."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-ca00fc3e","guard":[["has","estonia"],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Tallinn."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-ca264ec3","guard":[["hasAny",["all caps","capital letters","capitals","georgia","upper case","uppercase"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Tbilisi."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-cb262f97","guard":[["hasAny",["lower case","lowercase","rwanda","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Kigali."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cb6d4cdc","guard":[["hasAny",["benin","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Porto-Novo."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cc01b398","guard":[["hasAny",["cambodia","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Phnom_Penh."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cd4d644d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ghana","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Accra."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cd9ad6a4","guard":[["hasAny",["longest","longest one","longest word","suriname"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Paramaribo."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-ce1f1354","guard":[["hasAny",["ireland","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Dublin."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ced4072e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","finland","title case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Helsinki."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d0de3a4d","guard":[["hasAny",["benin","capitalise","capitalize","capitalize each word","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Porto-Novo."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d106ab76","guard":[["hasAny",["capitalise","capitalize","capitalize each word","estonia","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Tallinn."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d13411de","guard":[["hasAny",["guinea","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Conakry."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d2ab60d4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","latvia","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Riga."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d2fe42f5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nicaragua","title case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Managua."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d3ac982a","guard":[["hasAny",["albania","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Tirane."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-d3b16ed6","guard":[["hasAny",["invert case","israel","swap case","toggle case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Jerusalem."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d5432d46","guard":[["hasAny",["longest","longest one","longest word","slovenia"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Ljubljana."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-d8310890","guard":[["hasAny",["all caps","capital letters","capitals","lithuania","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vilnius."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-d8fcd751","guard":[["hasAny",["all caps","capital letters","capitals","nicaragua","upper case","uppercase"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Managua."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-da11c58b","guard":[["has","benin"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Porto-Novo."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-de319c57","guard":[["hasAny",["arabia","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":["Saudi ",{"slot":0}," uses Asia/Riyadh."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-dedb464e","guard":[["hasAny",["estonia","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Tallinn."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e17fadf9","guard":[["has","austria"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vienna."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-e24d253a","guard":[["hasAny",["longest","longest one","longest word","tajikistan"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Dushanbe."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e2f6690a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","turkey"]],["has","name"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Istanbul."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e32800f0","guard":[["hasAny",["armenia","invert case","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Yerevan."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e4b03142","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rwanda","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Kigali."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e7178176","guard":[["hasAny",["all caps","austria","capital letters","capitals","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vienna."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e72cf51a","guard":[["hasAny",["all caps","capital letters","capitals","egypt","upper case","uppercase"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Cairo."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e790ca28","guard":[["hasAny",["all caps","capital letters","capitals","honduras","upper case","uppercase"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Tegucigalpa."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e95bca42","guard":[["has","greece"],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Athens."]},["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-e9b00c64","guard":[["hasAny",["jamaica","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":["Jamaica uses America/",{"slot":0},"."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-ee180e42","guard":[["hasAny",["lower case","lowercase","small letters","sudan"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Khartoum."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f188f304","guard":[["hasAny",["longest","longest one","longest word","vietnam"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ho_Chi_Minh."]},["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-f1c803b8","guard":[["hasAny",["austria","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vienna."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f31da413","guard":[["hasAny",["longest","longest one","longest word","madagascar"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Antananarivo."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f3fc49c2","guard":[["hasAny",["all caps","capital letters","capitals","sudan","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Khartoum."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f40a5398","guard":[["hasAny",["liberia","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Monrovia."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f516c382","guard":[["hasAny",["lithuania","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vilnius."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f517785e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","guinea","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Conakry."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f5b31aee","guard":[["hasAny",["guinea","invert case","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Conakry."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f67234cb","guard":[["hasAny",["honduras","invert case","swap case","toggle case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Tegucigalpa."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f9cfe1b7","guard":[["hasAny",["all caps","capital letters","capitals","turkey","upper case","uppercase"]],["has","name"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Istanbul."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-fe6c5a71","guard":[["hasAny",["comoros","longest","longest one","longest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Comoro."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ff66ba85","guard":[["hasAny",["lower case","lowercase","small letters","turkey"]],["has","name"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Istanbul."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-009dd28e","guard":[["hasAny",["bahrain","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Bahrain."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-010fd6fa","guard":[["hasAny",["item number","nth","position","slovenia"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Ljubljana."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-02d60534","guard":[["hasAny",["each word","slovakia","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Bratislava."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0440eaeb","guard":[["hasAny",["item number","nth","peru","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Lima."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-05e1b5ca","guard":[["hasAny",["each word","split into words","turkey"]],["has","name"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Istanbul."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0ab5ad1a","guard":[["hasAny",["each word","nicaragua","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Managua."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0b8a5051","guard":[["hasAny",["bermuda","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/Bermuda."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0c87d7fc","guard":[["hasAny",["cambodia","each word","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Phnom_Penh."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0dc2e4ea","guard":[["hasAny",["cuba","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Havana."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0f83317f","guard":[["hasAny",["item number","nth","panama","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Panama."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-117d8545","guard":[["hasAny",["burundi","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Bujumbura."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1683dedc","guard":[["hasAny",["bhutan","each word","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Thimphu."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-17631799","guard":[["hasAny",["item number","nth","position","turkey"]],["has","name"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Istanbul."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1833baac","guard":[["hasAny",["each word","israel","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Jerusalem."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1854e250","guard":[["hasAny",["cook","item number","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands uses Pacific/Rarotonga."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1ac2199c","guard":[["hasAny",["each word","split into words","vanuatu"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Efate."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1c6b4fec","guard":[["hasAny",["cambodia","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Phnom_Penh."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1dd2e0bc","guard":[["hasAny",["each word","ghana","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Accra."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-203a0fe6","guard":[["hasAny",["each word","seychelles","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Mahe."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-22e1c1d3","guard":[["has","mayotte"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["sense.after",{"lit":"for"}],["sense.lastWord"]],"mem":null},
{"id":"n-25db7f78","guard":[["hasAny",["israel","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Jerusalem."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-260f09db","guard":[["hasAny",["each word","lithuania","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vilnius."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-263fe698","guard":[["hasAny",["each word","split into words","turkmenistan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ashgabat."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-268d2446","guard":[["hasAny",["each word","libya","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Tripoli."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-26b09407","guard":[["hasAny",["christmas","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["Christmas ",{"slot":0}," uses Indian/",{"slot":1},"."]},["sense.lastWord"],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-283250a7","guard":[["hasAny",["cuba","each word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Havana."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2860a467","guard":[["hasAny",["item number","nth","position","seychelles"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Mahe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-28864a99","guard":[["hasAny",["item number","jan","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":["Svalbard and ",{"slot":0}," Mayen uses Arctic/Longyearbyen."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-290adc92","guard":[["hasAny",["item number","jamaica","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Jamaica."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-29ac3131","guard":[["hasAny",["item number","jan","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Jan Mayen uses Arctic/Longyearbyen."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-30275930","guard":[["hasAny",["bahrain","longest","longest one","longest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-3177604c","guard":[["hasAny",["greece","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Athens."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-341ae313","guard":[["hasAny",["azerbaijan","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Baku."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3600ce17","guard":[["hasAny",["item number","mali","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Bamako."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3661c1e4","guard":[["hasAny",["bermuda","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-37290a63","guard":[["hasAny",["each word","laos","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Vientiane."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-37e87289","guard":[["hasAny",["item number","montserrat","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Montserrat."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-37efd6ed","guard":[["hasAny",["benin","each word","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Porto-Novo."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3840f54e","guard":[["hasAny",["each word","greece","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Athens."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-388635be","guard":[["hasAny",["item number","maarten","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," Maarten uses America/Lower_Princes."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-38a432ca","guard":[["hasAny",["djibouti","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Djibouti."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-395ef314","guard":[["hasAny",["item number","mariana","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":["Northern ",{"slot":0}," Islands uses Pacific/Saipan."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3c3eef4b","guard":[["hasAny",["item number","liechtenstein","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vaduz."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3d49218f","guard":[["hasAny",["each word","honduras","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Tegucigalpa."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3e791315","guard":[["hasAny",["armenia","each word","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Yerevan."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3f17bee7","guard":[["has","guernsey"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["sense.after",{"lit":"for"}],["sense.lastWord"]],"mem":null},
{"id":"n-3f61afa3","guard":[["hasAny",["hungary","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Budapest."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3f7d6851","guard":[["hasAny",["ghana","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Accra."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3f85a3d7","guard":[["hasAny",["longest","longest one","longest word","reunion"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-40af9e78","guard":[["hasAny",["item number","kenya","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Nairobi."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-416795f3","guard":[["hasAny",["guernsey","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Guernsey."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-43af587b","guard":[["hasAny",["each word","rwanda","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Kigali."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-446822ce","guard":[["hasAny",["each word","israel","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Jerusalem."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-478cb0c9","guard":[["hasAny",["item number","nth","position","turkmenistan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ashgabat."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-49500e73","guard":[["hasAny",["austria","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vienna."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4a373a8b","guard":[["hasAny",["botswana","each word","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Gaborone."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4a8dd306","guard":[["hasAny",["all caps","bermuda","capital letters","capitals","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-4a935ad5","guard":[["hasAny",["all caps","capital letters","capitals","djibouti","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["transform.upper",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-4affbfbe","guard":[["hasAny",["burkina","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," Faso uses Africa/Ouagadougou."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4c908026","guard":[["hasAny",["bermuda","invert case","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-4d0a3833","guard":[["hasAny",["item number","latvia","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Riga."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4d510ea8","guard":[["hasAny",["egypt","item number","nth","position"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Cairo."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4f983ec4","guard":[["hasAny",["barthelemy","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["Saint ",{"slot":0}," uses America/St_",{"slot":1},"."]},["sense.lastWord"],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-52335d6a","guard":[["hasAny",["falkland","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":["Falkland ",{"slot":0}," uses Atlantic/Stanley."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-55ca3ccf","guard":[["hasAny",["item number","netherlands","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," uses Europe/Amsterdam."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-571a16a2","guard":[["hasAny",["bhutan","each word","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Thimphu."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-57334dcf","guard":[["hasAny",["each word","guinea","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Conakry."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5b290042","guard":[["hasAny",["finland","item number","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Helsinki."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5c4df83e","guard":[["hasAny",["item number","nth","position","reunion"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Reunion."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5d28e52a","guard":[["hasAny",["each word","latvia","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Riga."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5f27cf82","guard":[["has","qatar"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["sense.after",{"lit":"for"}],["sense.lastWord"]],"mem":null},
{"id":"n-5ff3cbbd","guard":[["hasAny",["each word","nepal","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Kathmandu."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-60428da5","guard":[["hasAny",["dominican","item number","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," Republic uses America/Santo_Domingo."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-60650bcd","guard":[["hasAny",["dominica","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Dominica."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-63296bf2","guard":[["hasAny",["each word","split into words","vietnam"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ho_Chi_Minh."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-632f6547","guard":[["hasAny",["each word","lithuania","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vilnius."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-63428ae7","guard":[["hasAny",["benin","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Porto-Novo."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-63e129e2","guard":[["hasAny",["each word","ireland","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Dublin."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-65446299","guard":[["hasAny",["bhutan","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Thimphu."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-69a86aaf","guard":[["hasAny",["each word","egypt","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Cairo."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6acee2e0","guard":[["hasAny",["each word","split into words","sudan"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Khartoum."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6aec54f7","guard":[["hasAny",["comoros","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Comoro."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6d7cc807","guard":[["hasAny",["guadeloupe","item number","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Guadeloupe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-71911ef5","guard":[["hasAny",["iran","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Tehran."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7262223a","guard":[["hasAny",["lanka","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Colombo."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-728e322b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","djibouti","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-7515dfca","guard":[["hasAny",["each word","nicaragua","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Managua."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-78659d7d","guard":[["hasAny",["each word","estonia","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Tallinn."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7e9a550a","guard":[["hasAny",["germany","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Berlin."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7eb7dea0","guard":[["hasAny",["longest","longest one","longest word","nauru"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-7f0bbf6a","guard":[["hasAny",["each word","netherlands","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," uses Europe/Amsterdam."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7f22b8e5","guard":[["hasAny",["each word","split into words","sudan"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Khartoum."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7f48d989","guard":[["hasAny",["item number","kingdom","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," Kingdom uses Europe/London."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-844ffe38","guard":[["hasAny",["each word","laos","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Vientiane."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8463e8af","guard":[["hasAny",["each word","split into words","vanuatu"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Efate."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-890ca479","guard":[["hasAny",["each word","seychelles","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Mahe."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8a2323f9","guard":[["hasAny",["each word","ghana","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Accra."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8b823598","guard":[["hasAny",["austria","each word","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vienna."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8c8ab8c0","guard":[["hasAny",["item number","kuwait","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Kuwait."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8d19b344","guard":[["hasAny",["armenia","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Yerevan."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8f472e1c","guard":[["hasAny",["item number","nth","position","slovakia"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Bratislava."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8fa2e588","guard":[["hasAny",["czechia","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Prague."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8fee13a9","guard":[["hasAny",["albania","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Tirane."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-91004fdd","guard":[["hasAny",["each word","rwanda","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Kigali."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-91ff08e9","guard":[["hasAny",["item number","mariana","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," Mariana Islands uses Pacific/Saipan."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-93afb146","guard":[["hasAny",["item number","nth","position","rwanda"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Kigali."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-93d59d30","guard":[["hasAny",["each word","ireland","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Dublin."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-94cafd0d","guard":[["hasAny",["each word","greece","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Athens."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-95122cbd","guard":[["hasAny",["each word","split into words","vietnam"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ho_Chi_Minh."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9633f264","guard":[["hasAny",["arabia","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," Arabia uses Asia/Riyadh."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-976b64ef","guard":[["hasAny",["item number","nicaragua","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Managua."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-98a0b1a0","guard":[["hasAny",["india","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Kolkata."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9b0cf612","guard":[["hasAny",["faroe","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands uses Atlantic/Faroe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9b5bb271","guard":[["hasAny",["each word","peru","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Lima."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9b5fdac6","guard":[["hasAny",["item number","nth","philippines","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Manila."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9c752020","guard":[["has","djibouti"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["sense.after",{"lit":"for"}],["sense.lastWord"]],"mem":null},
{"id":"n-9dea1826","guard":[["hasAny",["botswana","item number","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Gaborone."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9df0b9db","guard":[["hasAny",["item number","lanka","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Lanka uses Asia/Colombo."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a3b62a3b","guard":[["hasAny",["benin","each word","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Porto-Novo."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a5b14955","guard":[["hasAny",["item number","nepal","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Kathmandu."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a5ce9e65","guard":[["hasAny",["each word","libya","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Tripoli."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a615cab3","guard":[["hasAny",["item number","nth","position","vatican"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vatican."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a7e80b0a","guard":[["hasAny",["dominican","longest","longest one","longest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Santo_Domingo."]},["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-a8d6202c","guard":[["hasAny",["item number","niue","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Niue."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-aac7e27d","guard":[["hasAny",["each word","latvia","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Riga."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ab008c77","guard":[["hasAny",["each word","hungary","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Budapest."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ad3c2d08","guard":[["hasAny",["item number","liberia","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Monrovia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ada62f84","guard":[["hasAny",["item number","nth","position","samoa"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Apia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b0cb3f6c","guard":[["has","bermuda"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["sense.after",{"lit":"for"}],["sense.lastWord"]],"mem":null},
{"id":"n-b610d0af","guard":[["hasAny",["item number","libya","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Tripoli."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bae2e81c","guard":[["has","panama"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["sense.after",{"lit":"for"}],["sense.lastWord"]],"mem":null},
{"id":"n-bb719c71","guard":[["hasAny",["item number","nth","position","vietnam"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ho_Chi_Minh."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bbd3beb3","guard":[["hasAny",["item number","nth","position","qatar"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Qatar."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bd6e37b7","guard":[["hasAny",["each word","split into words","turkey"]],["has","name"],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Istanbul."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bee5631b","guard":[["hasAny",["bermuda","capitalise","capitalize","capitalize each word","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-c0d7243c","guard":[["hasAny",["item number","nth","palau","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Palau."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c390a174","guard":[["hasAny",["item number","nauru","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Nauru."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c6a91913","guard":[["hasAny",["item number","leste","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Leste uses Asia/Dili."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c9f4e73e","guard":[["hasAny",["georgia","item number","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Tbilisi."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ca886711","guard":[["hasAny",["item number","laos","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Vientiane."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cb9b121b","guard":[["hasAny",["botswana","each word","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Gaborone."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ce352a58","guard":[["hasAny",["item number","nth","position","sudan"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Khartoum."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cf513b7c","guard":[["hasAny",["djibouti","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["transform.lower",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-cf975893","guard":[["hasAny",["belize","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Belize."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d0026823","guard":[["hasAny",["each word","finland","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Helsinki."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d02497bd","guard":[["hasAny",["falkland","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands uses Atlantic/Stanley."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d038ba2b","guard":[["hasAny",["each word","slovakia","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Bratislava."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d06011af","guard":[["hasAny",["each word","georgia","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Tbilisi."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d1a2cc7a","guard":[["hasAny",["item number","macedonia","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," Macedonia uses Europe/Skopje."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d227cc38","guard":[["hasAny",["helena","lower case","lowercase","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":["Saint ",{"slot":0}," uses Atlantic/St_",{"slot":1},"."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d246dbe3","guard":[["hasAny",["curacao","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Curacao."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d6222286","guard":[["hasAny",["each word","netherlands","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," uses Europe/Amsterdam."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d75f83fb","guard":[["hasAny",["each word","split into words","turkmenistan"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Ashgabat."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d97585b8","guard":[["hasAny",["cambodia","each word","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Phnom_Penh."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d9de7c4e","guard":[["hasAny",["estonia","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Tallinn."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-daf3446c","guard":[["hasAny",["each word","philippines","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Manila."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dc92ad12","guard":[["hasAny",["guinea","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Conakry."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dee2acdb","guard":[["hasAny",["denmark","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Copenhagen."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dfda26d9","guard":[["hasAny",["austria","each word","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vienna."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e0446c05","guard":[["hasAny",["each word","egypt","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Cairo."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e1eeb3a4","guard":[["hasAny",["each word","georgia","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Tbilisi."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e37d1c2e","guard":[["hasAny",["fiji","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Fiji."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e3c47810","guard":[["hasAny",["each word","hungary","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Budapest."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e486225e","guard":[["hasAny",["item number","lithuania","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Vilnius."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e532bc91","guard":[["hasAny",["each word","estonia","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Tallinn."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e7ad89c9","guard":[["hasAny",["each word","guinea","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/Conakry."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e9e9cdb0","guard":[["hasAny",["armenia","each word","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Yerevan."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ec40a95a","guard":[["hasAny",["guiana","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," Guiana uses America/Cayenne."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ed95c34f","guard":[["hasAny",["each word","philippines","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Manila."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ede11f31","guard":[["hasAny",["item number","nth","position","tajikistan"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Dushanbe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f013b15d","guard":[["hasAny",["item number","nth","position","vanuatu"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Pacific/Efate."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f02abefc","guard":[["hasAny",["honduras","item number","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Tegucigalpa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f220aa05","guard":[["hasAny",["item number","madagascar","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Antananarivo."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f2e97a1e","guard":[["hasAny",["longest","longest one","longest word","vatican"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-f4ec3257","guard":[["hasAny",["each word","peru","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Lima."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f6763fcb","guard":[["hasAny",["djibouti","invert case","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-f72ab982","guard":[["hasAny",["each word","honduras","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Tegucigalpa."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f76680bf","guard":[["hasAny",["item number","mayotte","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/Mayotte."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f7c15079","guard":[["hasAny",["each word","nepal","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/Kathmandu."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f8725bc5","guard":[["hasAny",["cuba","each word","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Havana."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f9e4e970","guard":[["hasAny",["item number","nth","position","suriname"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/Paramaribo."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fc61bdd1","guard":[["hasAny",["each word","finland","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Helsinki."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fe0b1970","guard":[["hasAny",["dominican","longest","longest one","longest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Santo_Domingo."]},["aggregate.longest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-ff2fa11f","guard":[["hasAny",["ireland","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/Dublin."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-09e5642b","guard":[["hasAny",["helena","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_Helena."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-0fd2d106","guard":[["hasAny",["bermuda","each word","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-1214065f","guard":[["hasAny",["item number","nth","position","southern"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," Southern ",{"slot":1}," uses Indian/Kerguelen."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-1e0dea64","guard":[["hasAny",["item number","nth","position","principe"]],["has","tz"]],"pyramid":["render.template",{"lit":["Sao ",{"slot":0}," and ",{"slot":1}," uses Africa/Sao_Tome."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-20753845","guard":[["hasAny",["djibouti","each word","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-222fff3c","guard":[["hasAny",["arab","item number","nth","position"]],["has","zone"]],"pyramid":["render.template",{"lit":["United ",{"slot":0}," ",{"slot":1}," uses Asia/Dubai."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-2a6d2b17","guard":[["hasAny",["item number","kitts","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," Kitts and ",{"slot":1}," uses America/St_Kitts."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-3ef3ed29","guard":[["hasAny",["bermuda","each word","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-4843fe35","guard":[["hasAny",["burkina","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Africa/Ouagadougou."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-54dba54b","guard":[["hasAny",["item number","lanka","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Colombo."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-56228565","guard":[["hasAny",["christmas","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Indian/Christmas."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-5cc48722","guard":[["hasAny",["djibouti","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-5e65a1ed","guard":[["hasAny",["djibouti","each word","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-78ffa263","guard":[["hasAny",["item number","nth","position","southern"]],["has","tz"]],"pyramid":["render.template",{"lit":["French ",{"slot":0}," ",{"slot":1}," uses Indian/Kerguelen."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-8f24b0e7","guard":[["hasAny",["item number","kitts","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Saint ",{"slot":0}," and ",{"slot":1}," uses America/St_Kitts."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-8f9aaf3a","guard":[["hasAny",["arab","item number","nth","position"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," Arab ",{"slot":1}," uses Asia/Dubai."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-9a961ab3","guard":[["hasAny",["guiana","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Cayenne."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-a68118ff","guard":[["hasAny",["faroe","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Faroe."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-a72d9cb7","guard":[["hasAny",["item number","nth","position","principe"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," Tome and ",{"slot":1}," uses Africa/Sao_Tome."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-b49154ae","guard":[["hasAny",["item number","leste","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Dili."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-cbff0f7a","guard":[["hasAny",["bermuda","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-d1c7aef0","guard":[["hasAny",["item number","kingdom","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/London."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-ed195fbd","guard":[["hasAny",["cook","item number","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Pacific/Rarotonga."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-f20a4c40","guard":[["hasAny",["dominican","item number","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Santo_Domingo."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-ffa2ad09","guard":[["hasAny",["barthelemy","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_Barthelemy."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-024f89a5","guard":[["hasAny",["british","item number","longest","longest one","longest word","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":["British ",{"slot":0}," Ocean ",{"slot":1}," uses Indian/Chagos."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-065f3f71","guard":[["hasAny",["item number","longest","longest one","longest word","macedonia","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/Skopje."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-092fa4f0","guard":[["hasAny",["all caps","burkina","capital letters","capitals","item number","nth","position","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Africa/Ouagadougou."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-0af54b37","guard":[["hasAny",["arabia","item number","longest","longest one","longest word","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Riyadh."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-0b164606","guard":[["hasAny",["dominican","item number","lower case","lowercase","nth","position","small letters"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Santo_Domingo."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1131ece1","guard":[["hasAny",["all caps","capital letters","capitals","djibouti","item number","nth","position","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-12e03323","guard":[["hasAny",["item number","jan","nth","position","shortest","shortest one","shortest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," Mayen uses Arctic/Longyearbyen."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-144d5a6f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cook","item number","nth","position","title case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Pacific/Rarotonga."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-177364ad","guard":[["hasAny",["dominican","invert case","item number","nth","position","swap case","toggle case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Santo_Domingo."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-187bc222","guard":[["hasAny",["item number","jan","longest","longest one","longest word","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," Mayen uses Arctic/Longyearbyen."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-1ed83a5f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dominican","item number","nth","position","title case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Santo_Domingo."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1ee753ac","guard":[["hasAny",["burkina","invert case","item number","nth","position","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Africa/Ouagadougou."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-203f3778","guard":[["hasAny",["djibouti","invert case","item number","nth","position","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2093970b","guard":[["hasAny",["isle","item number","nth","position","shortest","shortest one","shortest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," of Man uses Europe/Isle_of_",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-20c256a1","guard":[["hasAny",["item number","kingdom","lower case","lowercase","nth","position","small letters"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/London."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2777e7e4","guard":[["hasAny",["item number","kingdom","longest","longest one","longest word","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/London."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-28d5e537","guard":[["hasAny",["cabo","item number","longest","longest one","longest word","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Cape_Verde."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-31912ea5","guard":[["hasAny",["item number","lanka","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Colombo."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-36311458","guard":[["hasAny",["burkina","item number","lower case","lowercase","nth","position","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Africa/Ouagadougou."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-395fd0b5","guard":[["hasAny",["guiana","item number","lower case","lowercase","nth","position","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Cayenne."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3b1867eb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","lanka","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Colombo."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3b38047c","guard":[["hasAny",["longest","longest one","longest word","marino","shortest","shortest one","shortest word"]],["has","time"]],"pyramid":["render.template",{"lit":["San ",{"slot":0}," uses Europe/",{"slot":1},"_",{"slot":2},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-3c67e18b","guard":[["hasAny",["arabia","item number","longest","longest one","longest word","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Riyadh."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-3fa230d9","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","vatican"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-40359dfa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","leste","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Dili."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-418b254e","guard":[["hasAny",["christmas","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," Island uses Indian/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-42177b1f","guard":[["hasAny",["element","item number","mayotte","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-4769bfe6","guard":[["hasAny",["helena","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-4e1617ce","guard":[["hasAny",["all caps","capital letters","capitals","cook","item number","nth","position","upper case","uppercase"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Pacific/Rarotonga."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-5f7843b1","guard":[["hasAny",["invert case","item number","kingdom","nth","position","swap case","toggle case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/London."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-61668315","guard":[["hasAny",["item number","jan","longest","longest one","longest word","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," Mayen uses Arctic/Longyearbyen."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-68e3c126","guard":[["hasAny",["item number","kingdom","longest","longest one","longest word","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/London."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-68f76cdf","guard":[["hasAny",["item number","lanka","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Colombo."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-69e25295","guard":[["hasAny",["bermuda","item number","lower case","lowercase","nth","position","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7659242e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","guiana","item number","nth","position","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Cayenne."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7fce701b","guard":[["hasAny",["item number","longest","longest one","longest word","maarten","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Lower_Princes."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-842d9f37","guard":[["hasAny",["falkland","item number","longest","longest one","longest word","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Stanley."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-84bebfee","guard":[["hasAny",["all caps","capital letters","capitals","item number","lanka","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Colombo."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-868a0a70","guard":[["hasAny",["cook","invert case","item number","nth","position","swap case","toggle case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Pacific/Rarotonga."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-88f662ee","guard":[["hasAny",["all caps","capital letters","capitals","dominican","item number","nth","position","upper case","uppercase"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Santo_Domingo."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-8af4b84f","guard":[["hasAny",["falkland","item number","longest","longest one","longest word","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Stanley."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-975aa692","guard":[["hasAny",["item number","longest","longest one","longest word","maarten","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Lower_Princes."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9e8a4f76","guard":[["hasAny",["bermuda","invert case","item number","nth","position","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-a11fe980","guard":[["hasAny",["cabo","item number","longest","longest one","longest word","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":["Cabo ",{"slot":0}," uses Atlantic/Cape_",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-a51fedbb","guard":[["hasAny",["cook","item number","lower case","lowercase","nth","position","small letters"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Pacific/Rarotonga."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a795adee","guard":[["hasAny",["all caps","capital letters","capitals","item number","leste","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Dili."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a8afe75c","guard":[["hasAny",["all caps","capital letters","capitals","faroe","item number","nth","position","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Faroe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a99ea13a","guard":[["hasAny",["faroe","item number","lower case","lowercase","nth","position","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Faroe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ad96710d","guard":[["hasAny",["barthelemy","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Barthelemy uses America/St_",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-af941a64","guard":[["hasAny",["christmas","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Indian/",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.lastWord"],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-afffb6f4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","kingdom","nth","position","title case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/London."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b442c1b5","guard":[["hasAny",["item number","leste","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Dili."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b750013d","guard":[["hasAny",["guiana","invert case","item number","nth","position","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Cayenne."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b76aaa1f","guard":[["hasAny",["invert case","item number","leste","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Dili."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b7c54483","guard":[["hasAny",["element","item number","nth","panama","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses America/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-ba7e7408","guard":[["hasAny",["all caps","bermuda","capital letters","capitals","item number","nth","position","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-be70923c","guard":[["hasAny",["invert case","item number","lanka","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Colombo."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c1247800","guard":[["hasAny",["helena","item number","lower case","lowercase","nth","position","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," Helena uses Atlantic/St_",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c1904e76","guard":[["hasAny",["faroe","invert case","item number","nth","position","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Faroe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c1c913fa","guard":[["hasAny",["element","item number","nth","position","qatar"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Asia/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-c4dbde56","guard":[["hasAny",["item number","longest","longest one","longest word","macedonia","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/Skopje."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-c624ea8d","guard":[["hasAny",["djibouti","item number","lower case","lowercase","nth","position","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c9fb2a84","guard":[["hasAny",["capitalise","capitalize","capitalize each word","djibouti","item number","nth","position","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-caa3e7f8","guard":[["hasAny",["isle","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Isle of ",{"slot":0}," uses Europe/Isle_of_",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cf4ef53f","guard":[["hasAny",["cook","item number","longest","longest one","longest word","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Pacific/Rarotonga."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-d5f52c97","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","reunion"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Indian/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-d793e66e","guard":[["hasAny",["item number","longest","longest one","longest word","mariana","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Islands uses Pacific/Saipan."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d7c9c3ec","guard":[["hasAny",["burkina","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Africa/Ouagadougou."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-dc3afd39","guard":[["hasAny",["british","item number","longest","longest one","longest word","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," Indian Ocean ",{"slot":1}," uses Indian/Chagos."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-df7ccc3a","guard":[["hasAny",["cook","item number","longest","longest one","longest word","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Pacific/Rarotonga."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-df939ffb","guard":[["hasAny",["all caps","capital letters","capitals","item number","kingdom","nth","position","upper case","uppercase"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/London."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-dfabdb85","guard":[["hasAny",["item number","longest","longest one","longest word","mariana","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Islands uses Pacific/Saipan."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e692c181","guard":[["hasAny",["christmas","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Indian/",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["sense.lastWord"],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-e90c41cb","guard":[["hasAny",["element","guernsey","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Europe/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-f3af5a2c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","faroe","item number","nth","position","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Faroe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f49c2a4b","guard":[["hasAny",["bermuda","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-f5cf129a","guard":[["hasAny",["bermuda","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f61e8de1","guard":[["hasAny",["all caps","capital letters","capitals","guiana","item number","nth","position","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Cayenne."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f669d18e","guard":[["hasAny",["djibouti","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"for"}]],"mem":null},
{"id":"n-f6fc6644","guard":[["hasAny",["barthelemy","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-f73c1ea1","guard":[["hasAny",["item number","lanka","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Colombo."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-04182c72","guard":[["hasAny",["item number","macedonia","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/Skopje."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-054ec857","guard":[["hasAny",["item number","mariana","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Islands uses Pacific/Saipan."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-08fa9d24","guard":[["hasAny",["christmas","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Indian/",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-10b2c89c","guard":[["hasAny",["arabia","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Riyadh."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-146d5ea7","guard":[["hasAny",["each word","item number","kingdom","nth","position","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/London."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-15105b59","guard":[["hasAny",["item number","longest","longest one","longest word","marino","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/San_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-19069d66","guard":[["hasAny",["cabo","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," Verde uses Atlantic/Cape_",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-1b46d615","guard":[["hasAny",["cook","each word","item number","nth","position","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Pacific/Rarotonga."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1ddc14d4","guard":[["hasAny",["barthelemy","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-1f58882d","guard":[["hasAny",["each word","item number","lanka","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Colombo."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2350d0ed","guard":[["hasAny",["djibouti","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-255008bd","guard":[["hasAny",["item number","marino","nth","position","shortest","shortest one","shortest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_Marino."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-27ed8c98","guard":[["hasAny",["dominican","each word","item number","nth","position","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Santo_Domingo."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-33dd4387","guard":[["hasAny",["christmas","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Indian/",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-3610a026","guard":[["hasAny",["burkina","each word","item number","nth","position","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Africa/Ouagadougou."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3c2b3ad1","guard":[["hasAny",["item number","nth","position","principe"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and Principe uses Africa/Sao_Tome."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3d886f8e","guard":[["hasAny",["each word","guiana","item number","nth","position","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Cayenne."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3eaa2a16","guard":[["hasAny",["item number","kitts","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses America/St_Kitts."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-42cea164","guard":[["hasAny",["each word","guiana","item number","nth","position","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Cayenne."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-45728241","guard":[["hasAny",["all caps","capital letters","capitals","helena","item number","nth","position","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-471d1277","guard":[["hasAny",["faroe","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Faroe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5109beaa","guard":[["hasAny",["barthelemy","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-519aef4b","guard":[["hasAny",["falkland","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Stanley."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-521643fa","guard":[["hasAny",["helena","item number","lower case","lowercase","nth","position","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-55af968a","guard":[["hasAny",["bonaire","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["Bonaire, ",{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses America/Kralendijk."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-58759445","guard":[["hasAny",["item number","kitts","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses America/St_Kitts."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-58cb2bed","guard":[["hasAny",["item number","maarten","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Lower_Princes."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5a6aa128","guard":[["hasAny",["capitalise","capitalize","capitalize each word","helena","item number","nth","position","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5a9627d1","guard":[["hasAny",["each word","faroe","item number","nth","position","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Faroe."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5b2dae8b","guard":[["hasAny",["burkina","each word","item number","nth","position","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Africa/Ouagadougou."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-680c0dfa","guard":[["hasAny",["each word","item number","lanka","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Colombo."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-693271b1","guard":[["hasAny",["bonaire","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0},", Saint ",{"slot":1}," and ",{"slot":2}," uses America/Kralendijk."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-6ad5d0bd","guard":[["hasAny",["barthelemy","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-72359645","guard":[["hasAny",["isle","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," uses Europe/Isle_of_Man."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-72bdd756","guard":[["hasAny",["bermuda","each word","item number","nth","position","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-74458ba3","guard":[["hasAny",["djibouti","each word","item number","nth","position","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-794265c9","guard":[["hasAny",["djibouti","each word","item number","nth","position","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Africa/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-85d173eb","guard":[["hasAny",["each word","faroe","item number","nth","position","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Faroe."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-87c75870","guard":[["hasAny",["burkina","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Africa/Ouagadougou."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-89a60d93","guard":[["hasAny",["barthelemy","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8daec0b0","guard":[["hasAny",["dominican","item number","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Santo_Domingo."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-90c0e441","guard":[["hasAny",["british","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Ocean Territory uses Indian/Chagos."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-91d8d3f6","guard":[["hasAny",["arab","item number","nth","position"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Emirates uses Asia/Dubai."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-93ab02ed","guard":[["hasAny",["bermuda","each word","item number","nth","position","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-94505036","guard":[["hasAny",["each word","item number","leste","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Dili."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a2d1fd94","guard":[["hasAny",["item number","jan","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," Mayen uses Arctic/Longyearbyen."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-b8861248","guard":[["hasAny",["item number","nth","position","southern"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Territories uses Indian/Kerguelen."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-b8979900","guard":[["hasAny",["guiana","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Cayenne."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-b8fd9649","guard":[["hasAny",["each word","item number","kingdom","nth","position","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/London."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b94aada4","guard":[["hasAny",["all caps","barthelemy","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-bccc530e","guard":[["hasAny",["each word","item number","leste","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Dili."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c07a4292","guard":[["hasAny",["item number","leste","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Asia/Dili."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-cb7c4e3e","guard":[["hasAny",["barthelemy","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cb99ed87","guard":[["hasAny",["helena","invert case","item number","nth","position","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-d5d8ec4e","guard":[["hasAny",["item number","kitts","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and Nevis uses America/St_Kitts."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d8b708a3","guard":[["hasAny",["dominican","each word","item number","nth","position","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/Santo_Domingo."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-eae3d7b2","guard":[["hasAny",["bermuda","item number","nth","position"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," uses Atlantic/",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fa7d2e53","guard":[["hasAny",["cook","each word","item number","nth","position","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Pacific/Rarotonga."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-03d77ff8","guard":[["hasAny",["helena","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-1f44a3fc","guard":[["hasAny",["bonaire","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," Eustatius and ",{"slot":2}," uses America/Kralendijk."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-294f6432","guard":[["hasAny",["item number","nth","position","southern"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Indian/Kerguelen."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-2a863c3a","guard":[["hasAny",["item number","marino","nth","position","shortest","shortest one","shortest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-3308b38a","guard":[["hasAny",["helena","invert case","item number","lower case","lowercase","nth","position","small letters","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-362df3a6","guard":[["hasAny",["barthelemy","item number","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-38a1fa10","guard":[["hasAny",["capitalise","capitalize","capitalize each word","christmas","item number","longest","longest one","longest word","nth","position","title case"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Indian/",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-52cba3f0","guard":[["hasAny",["barthelemy","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-6138ab8c","guard":[["hasAny",["all caps","capital letters","capitals","helena","item number","lower case","lowercase","nth","position","small letters","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-67018d9c","guard":[["hasAny",["christmas","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Indian/",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-79b9dfe3","guard":[["hasAny",["all caps","capital letters","capitals","christmas","item number","longest","longest one","longest word","nth","position","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Indian/",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-7d4d3acc","guard":[["hasAny",["christmas","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Indian/",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-8e34f3f3","guard":[["hasAny",["barthelemy","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9d517fbc","guard":[["hasAny",["christmas","item number","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Indian/",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-a412fa37","guard":[["hasAny",["barthelemy","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bac7a7a9","guard":[["hasAny",["barthelemy","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-c0ca4cdd","guard":[["hasAny",["all caps","barthelemy","capital letters","capitals","item number","longest","longest one","longest word","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-c54fe17f","guard":[["hasAny",["isle","item number","nth","position","shortest","shortest one","shortest word"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," uses Europe/Isle_of_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cd9627e5","guard":[["hasAny",["cabo","item number","longest","longest one","longest word","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Cape_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-d0cbf7f7","guard":[["hasAny",["item number","longest","longest one","longest word","marino","nth","position","shortest","shortest one","shortest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," Marino uses Europe/",{"slot":1},"_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-df4f3d87","guard":[["hasAny",["each word","helena","item number","nth","position","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e1d21ee8","guard":[["hasAny",["item number","kitts","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses America/St_Kitts."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-e74de711","guard":[["hasAny",["barthelemy","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-e8681ef4","guard":[["hasAny",["each word","helena","item number","nth","position","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ea5d5a70","guard":[["hasAny",["longest","longest one","longest word","marino","shortest","shortest one","shortest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-eca5b128","guard":[["hasAny",["capitalise","capitalize","capitalize each word","helena","item number","lower case","lowercase","nth","position","small letters","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f01b671d","guard":[["hasAny",["barthelemy","capitalise","capitalize","capitalize each word","item number","longest","longest one","longest word","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-f0bee2e6","guard":[["hasAny",["arab","item number","nth","position"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Asia/Dubai."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-f3764eb1","guard":[["hasAny",["item number","nth","position","principe"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses Africa/Sao_Tome."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-f4d05b3f","guard":[["hasAny",["helena","item number","lower case","lowercase","nth","position","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-00f724bf","guard":[["hasAny",["cabo","item number","longest","longest one","longest word","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Cape_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-011dac58","guard":[["hasAny",["all caps","capital letters","capitals","item number","kitts","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses America/St_Kitts."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-0fcf6f06","guard":[["hasAny",["arab","item number","lower case","lowercase","nth","position","small letters"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Asia/Dubai."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-15088646","guard":[["hasAny",["christmas","each word","item number","longest","longest one","longest word","nth","position","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Indian/",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-302c6ee2","guard":[["hasAny",["each word","helena","item number","lower case","lowercase","nth","position","small letters","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-31e43dc5","guard":[["hasAny",["each word","helena","item number","lower case","lowercase","nth","position","small letters","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3657f462","guard":[["hasAny",["all caps","arab","capital letters","capitals","item number","nth","position","upper case","uppercase"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Asia/Dubai."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3a58b5c8","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","southern"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Indian/Kerguelen."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4302d8cd","guard":[["hasAny",["helena","item number","lower case","lowercase","nth","position","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-49002e57","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","southern","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Indian/Kerguelen."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-4cc07b34","guard":[["hasAny",["arab","invert case","item number","nth","position","swap case","toggle case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Asia/Dubai."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-55c94626","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","kitts","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses America/St_Kitts."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-56843a16","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","marino","nth","position","shortest","shortest one","shortest word","title case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-57112f21","guard":[["hasAny",["item number","longest","longest one","longest word","marino","nth","position","shortest","shortest one","shortest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-59da11e6","guard":[["hasAny",["british","item number","longest","longest one","longest word","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Ocean ",{"slot":2}," uses Indian/Chagos."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-5fc2520c","guard":[["hasAny",["isle","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," uses Europe/Isle_of_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-608dfa1f","guard":[["hasAny",["arab","item number","longest","longest one","longest word","nth","position"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Asia/Dubai."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-698063d7","guard":[["hasAny",["item number","longest","longest one","longest word","marino","nth","position","shortest","shortest one","shortest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6f1612a3","guard":[["hasAny",["invert case","item number","nth","position","principe","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses Africa/Sao_Tome."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7319c8f6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","southern","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Indian/Kerguelen."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7726a79a","guard":[["hasAny",["british","item number","longest","longest one","longest word","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Ocean ",{"slot":2}," uses Indian/Chagos."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7b5050ef","guard":[["hasAny",["item number","longest","longest one","longest word","nth","position","southern"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Indian/Kerguelen."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-87bc1ac7","guard":[["hasAny",["christmas","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Indian/",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-8db356c3","guard":[["hasAny",["barthelemy","each word","item number","longest","longest one","longest word","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-92c955e7","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","southern"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Indian/Kerguelen."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a0bcfc54","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","principe","title case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses Africa/Sao_Tome."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b06e4733","guard":[["hasAny",["arab","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Asia/Dubai."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b5e85c32","guard":[["hasAny",["bonaire","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," and Saba uses America/Kralendijk."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-bcfe51ce","guard":[["hasAny",["all caps","capital letters","capitals","item number","marino","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-bd65b4ac","guard":[["hasAny",["item number","kitts","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses America/St_Kitts."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c096e050","guard":[["hasAny",["invert case","item number","marino","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c79fe759","guard":[["hasAny",["item number","lower case","lowercase","nth","position","principe","small letters"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses Africa/Sao_Tome."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cac8659d","guard":[["hasAny",["arab","item number","longest","longest one","longest word","nth","position"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Asia/Dubai."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-cb306adf","guard":[["hasAny",["item number","lower case","lowercase","marino","nth","position","shortest","shortest one","shortest word","small letters"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e9786a53","guard":[["hasAny",["invert case","item number","kitts","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses America/St_Kitts."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ebc06265","guard":[["hasAny",["invert case","item number","nth","position","southern","swap case","toggle case"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Indian/Kerguelen."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-ef3e8f55","guard":[["hasAny",["christmas","each word","item number","longest","longest one","longest word","nth","position","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Indian/",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-efe6e980","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","principe","upper case","uppercase"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses Africa/Sao_Tome."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f4146b7c","guard":[["hasAny",["barthelemy","each word","item number","longest","longest one","longest word","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses America/St_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-0e572afc","guard":[["hasAny",["each word","item number","kitts","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses America/St_Kitts."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-156ef8ae","guard":[["hasAny",["each word","item number","kitts","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses America/St_Kitts."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-19fd3bdb","guard":[["hasAny",["cabo","item number","nth","position"]],["has","iana"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Atlantic/Cape_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-2bbeb638","guard":[["hasAny",["item number","longest","longest one","longest word","lower case","lowercase","marino","nth","position","shortest","shortest one","shortest word","small letters"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-31370aa9","guard":[["hasAny",["invert case","item number","longest","longest one","longest word","marino","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-3372bf1a","guard":[["hasAny",["arab","each word","item number","nth","position","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Asia/Dubai."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-389ffb21","guard":[["hasAny",["arab","each word","item number","nth","position","split into words"]],["has","zone"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Asia/Dubai."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-47b77cd0","guard":[["hasAny",["each word","item number","nth","position","southern","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Indian/Kerguelen."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-565be5de","guard":[["hasAny",["each word","item number","nth","position","principe","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses Africa/Sao_Tome."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-650a7a4d","guard":[["hasAny",["each word","item number","nth","position","principe","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," uses Africa/Sao_Tome."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6cf87711","guard":[["hasAny",["bonaire","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," and ",{"slot":3}," uses America/Kralendijk."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-71530f5d","guard":[["hasAny",["each word","item number","marino","nth","position","shortest","shortest one","shortest word","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b4f99c80","guard":[["hasAny",["all caps","capital letters","capitals","item number","longest","longest one","longest word","marino","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-b9436234","guard":[["hasAny",["item number","longest","longest one","longest word","marino","nth","position","shortest","shortest one","shortest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-c600f5a3","guard":[["hasAny",["bonaire","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," and ",{"slot":3}," uses America/Kralendijk."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-cbddc4d0","guard":[["hasAny",["item number","longest","longest one","longest word","marino","nth","position","shortest","shortest one","shortest word"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-dd662094","guard":[["hasAny",["isle","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," of ",{"slot":1}," uses Europe/Isle_of_",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e3c1f776","guard":[["hasAny",["each word","item number","nth","position","southern","split into words"]],["has","tz"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses Indian/Kerguelen."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e8b7f281","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","longest","longest one","longest word","marino","nth","position","shortest","shortest one","shortest word","title case"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-eefa42a2","guard":[["hasAny",["each word","item number","marino","nth","position","shortest","shortest one","shortest word","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fc17785e","guard":[["hasAny",["item number","longest","longest one","longest word","marino","nth","position"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-41bfe6da","guard":[["hasAny",["each word","item number","longest","longest one","longest word","marino","nth","position","shortest","shortest one","shortest word","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-43a7ecae","guard":[["hasAny",["all caps","bonaire","capital letters","capitals","item number","longest","longest one","longest word","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," and ",{"slot":3}," uses America/Kralendijk."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-6adc53a4","guard":[["hasAny",["each word","item number","longest","longest one","longest word","marino","nth","position","shortest","shortest one","shortest word","split into words"]],["has","time"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," uses Europe/",{"slot":2},"_",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-90d5d7a6","guard":[["hasAny",["bonaire","capitalise","capitalize","capitalize each word","item number","longest","longest one","longest word","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," and ",{"slot":3}," uses America/Kralendijk."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-94e40192","guard":[["hasAny",["bonaire","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," and ",{"slot":3}," uses America/Kralendijk."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-95aa3ccf","guard":[["hasAny",["bonaire","item number","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," and ",{"slot":3}," uses America/Kralendijk."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1d859d59","guard":[["hasAny",["bonaire","element","item number","longest","longest one","longest word","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," and ",{"slot":3}," uses America/Kralendijk."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-517a5dac","guard":[["hasAny",["bonaire","each word","item number","longest","longest one","longest word","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," and ",{"slot":3}," uses America/Kralendijk."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a4c2d471","guard":[["hasAny",["bonaire","each word","item number","longest","longest one","longest word","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," ",{"slot":2}," and ",{"slot":3}," uses America/Kralendijk."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.longest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the time zone of Turkmenistan","expect":{"contains":["Asia/Ashgabat"],"notRefusal":true}},{"q":"which IANA time zone does Cabo Verde use","expect":{"contains":["Atlantic/Cape_Verde"],"notRefusal":true}},{"q":"which IANA time zone does Palau use","expect":{"contains":["Pacific/Palau"],"notRefusal":true}},{"q":"which IANA time zone does Northern Mariana Islands use","expect":{"contains":["Pacific/Saipan"],"notRefusal":true}},{"q":"name the time zone of Botswana","expect":{"contains":["Africa/Gaborone"],"notRefusal":true}},{"q":"what is the tz database zone for Saint Helena","expect":{"contains":["Atlantic/St_Helena"],"notRefusal":true}},{"q":"which IANA time zone does Azerbaijan use","expect":{"contains":["Asia/Baku"],"notRefusal":true}},{"q":"which IANA time zone does Svalbard and Jan Mayen use","expect":{"contains":["Arctic/Longyearbyen"],"notRefusal":true}},{"q":"what is the tz database zone for Faroe Islands","expect":{"contains":["Atlantic/Faroe"],"notRefusal":true}},{"q":"what is the tz database zone for The Netherlands","expect":{"contains":["Europe/Amsterdam"],"notRefusal":true}},{"q":"name the time zone of Finland","expect":{"contains":["Europe/Helsinki"],"notRefusal":true}},{"q":"what is the tz database zone for Qatar","expect":{"contains":["Asia/Qatar"],"notRefusal":true}},{"q":"name the time zone of Philippines","expect":{"contains":["Asia/Manila"],"notRefusal":true}},{"q":"name the time zone of Saint Barthelemy","expect":{"contains":["America/St_Barthelemy"],"notRefusal":true}},{"q":"name the time zone of Turkey","expect":{"contains":["Europe/Istanbul"],"notRefusal":true}},{"q":"name the time zone of Bonaire, Saint Eustatius and Saba","expect":{"contains":["America/Kralendijk"],"notRefusal":true}},{"q":"which IANA time zone does Madagascar use","expect":{"contains":["Indian/Antananarivo"],"notRefusal":true}},{"q":"name the time zone of Israel","expect":{"contains":["Asia/Jerusalem"],"notRefusal":true}},{"q":"which IANA time zone does Albania use","expect":{"contains":["Europe/Tirane"],"notRefusal":true}},{"q":"what is the tz database zone for Sudan","expect":{"contains":["Africa/Khartoum"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
