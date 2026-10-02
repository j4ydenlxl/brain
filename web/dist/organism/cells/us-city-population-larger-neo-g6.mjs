// us-city-population-larger-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"us-city-population-larger-neo-g6","class":"us-city-population-larger","generation":6,"lane":"neo","grownFrom":["which has the larger population, Wilmington, Delaware or Lincoln, California","whose population is larger: Hoover, Alabama or Lenexa, Kansas","between Layton, Utah and West Valley City, Utah, which has the greater population","whose population is larger: Rancho Cordova, California or Columbia, Missouri","whose population is larger: Baytown, Texas or South Gate, California","which has the larger population, Concord, California or Pembroke Pines, Florida","which has the larger population, Buffalo, New York or Aliso Viejo, California","whose population is larger: Florin, California or Burke, Virginia","between Centreville, Virginia and Irving, Texas, which has the greater population","between Birmingham, Alabama and Lorain, Ohio, which has the greater population","between Coon Rapids, Minnesota and Bridgeport, Connecticut, which has the greater population","whose population is larger: Colton, California or Allentown, Pennsylvania","between Tuscaloosa, Alabama and Bellingham, Washington, which has the greater population","between Burnsville, Minnesota and Pocatello, Idaho, which has the greater population","which has the larger population, Catalina Foothills, Arizona or New Braunfels, Texas","whose population is larger: Irving, Texas or Danbury, Connecticut","between Atlanta, Georgia and Troy, Michigan, which has the greater population","between Tonawanda, New York and Stillwater, Oklahoma, which has the greater population","which has the larger population, Hanford, California or Coon Rapids, Minnesota","between Pittsfield, Massachusetts and Los Angeles, California, which has the greater population"],"version":1});

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
{"id":"n-30156093","guard":[["has","population"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Wilmington, Delaware or Lincoln, California":"Wilmington, Delaware has the larger population (71502 against 45675).","whose population is larger: Hoover, Alabama or Lenexa, Kansas":"Hoover, Alabama has the larger population (84100 against 51206).","between Layton, Utah and West Valley City, Utah, which has the greater population":"West Valley City, Utah has the larger population (134609 against 72413).","whose population is larger: Rancho Cordova, California or Columbia, Missouri":"Columbia, Missouri has the larger population (117165 against 69482).","whose population is larger: Baytown, Texas or South Gate, California":"South Gate, California has the larger population (95219 against 75310).","which has the larger population, Concord, California or Pembroke Pines, Florida":"Pembroke Pines, Florida has the larger population (164753 against 126938).","which has the larger population, Buffalo, New York or Aliso Viejo, California":"Buffalo, New York has the larger population (258989 against 50219).","whose population is larger: Florin, California or Burke, Virginia":"Florin, California has the larger population (49486 against 42290).","between Centreville, Virginia and Irving, Texas, which has the greater population":"Irving, Texas has the larger population (232013 against 73084).","between Birmingham, Alabama and Lorain, Ohio, which has the greater population":"Birmingham, Alabama has the larger population (212424 against 63714).","between Coon Rapids, Minnesota and Bridgeport, Connecticut, which has the greater population":"Bridgeport, Connecticut has the larger population (147022 against 62159).","whose population is larger: Colton, California or Allentown, Pennsylvania":"Allentown, Pennsylvania has the larger population (119624 against 53856).","between Tuscaloosa, Alabama and Bellingham, Washington, which has the greater population":"Tuscaloosa, Alabama has the larger population (96352 against 84462).","between Burnsville, Minnesota and Pocatello, Idaho, which has the greater population":"Burnsville, Minnesota has the larger population (61158 against 54592).","which has the larger population, Catalina Foothills, Arizona or New Braunfels, Texas":"New Braunfels, Texas has the larger population (67097 against 51329).","whose population is larger: Irving, Texas or Danbury, Connecticut":"Irving, Texas has the larger population (232013 against 83890).","between Atlanta, Georgia and Troy, Michigan, which has the greater population":"Atlanta, Georgia has the larger population (456378 against 82982).","between Tonawanda, New York and Stillwater, Oklahoma, which has the greater population":"Tonawanda, New York has the larger population (57844 against 48104).","which has the larger population, Hanford, California or Coon Rapids, Minnesota":"Coon Rapids, Minnesota has the larger population (62159 against 54912).","between Pittsfield, Massachusetts and Los Angeles, California, which has the greater population":"Los Angeles, California has the larger population (3918872 against 43632).","which has the larger population, Glen Burnie, Maryland or Layton, Utah":"Layton, Utah has the larger population (72413 against 69060).","whose population is larger: Bedford, Texas or Orem, Utah":"Orem, Utah has the larger population (93220 against 48864).","which has the larger population, Alexandria, Virginia or Sugar Land, Texas":"Alexandria, Virginia has the larger population (151473 against 85681).","between Irvine, California and Baytown, Texas, which has the greater population":"Irvine, California has the larger population (246992 against 75310).","whose population is larger: West Valley City, Utah or Blaine, Minnesota":"West Valley City, Utah has the larger population (134609 against 61210).","whose population is larger: Eden Prairie, Minnesota or Great Falls, Montana":"Eden Prairie, Minnesota has the larger population (63206 against 59479).","whose population is larger: Bolingbrook, Illinois or Catalina Foothills, Arizona":"Bolingbrook, Illinois has the larger population (74320 against 51329).","between Guaynabo, Puerto Rico and West Seneca, New York, which has the greater population":"Guaynabo, Puerto Rico has the larger population (71667 against 45197).","between Westminster, Colorado and Sunrise Manor, Nevada, which has the greater population":"Sunrise Manor, Nevada has the larger population (192873 against 111770).","between Montebello, California and Walnut Creek, California, which has the greater population":"Walnut Creek, California has the larger population (67568 against 63416).","which has the larger population, Allentown, Pennsylvania or Deltona, Florida":"Allentown, Pennsylvania has the larger population (119624 against 87387).","whose population is larger: Stillwater, Oklahoma or Concord, California":"Concord, California has the larger population (126938 against 48104).","whose population is larger: Los Angeles, California or Gary, Indiana":"Los Angeles, California has the larger population (3918872 against 77858).","which has the larger population, Carrollton, Texas or Kentwood, Michigan":"Carrollton, Texas has the larger population (129266 against 50761).","which has the larger population, Blaine, Minnesota or Enid, Oklahoma":"Blaine, Minnesota has the larger population (61210 against 50891).","between Rochester Hills, Michigan and Keller, Texas, which has the greater population":"Rochester Hills, Michigan has the larger population (72987 against 44250).","whose population is larger: Keller, Texas or Yuba City, California":"Yuba City, California has the larger population (66147 against 44250).","which has the larger population, Lenexa, Kansas or Rochester Hills, Michigan":"Rochester Hills, Michigan has the larger population (72987 against 51206).","whose population is larger: Levittown, Pennsylvania or Alexandria, Virginia":"Alexandria, Virginia has the larger population (151473 against 52407).","between Dearborn, Michigan and Draper, Utah, which has the greater population":"Dearborn, Michigan has the larger population (95520 against 46399).","whose population is larger: St. Louis Park, Minnesota or Fayetteville, Arkansas":"Fayetteville, Arkansas has the larger population (80552 against 47486).","which has the larger population, Ankeny, Iowa or Birmingham, Alabama":"Birmingham, Alabama has the larger population (212424 against 53413).","which has the larger population, Waterloo, Iowa or Palm Beach Gardens, Florida":"Waterloo, Iowa has the larger population (68357 against 51865).","which has the larger population, Clarksville, Tennessee or Tonawanda, New York":"Clarksville, Tennessee has the larger population (146281 against 57844).","whose population is larger: South Hill, Washington or Hanford, California":"South Hill, Washington has the larger population (55194 against 54912).","between New Braunfels, Texas and Fontana, California, which has the greater population":"Fontana, California has the larger population (205228 against 67097).","whose population is larger: Lorain, Ohio or Wilmington, Delaware":"Wilmington, Delaware has the larger population (71502 against 63714).","between Decatur, Alabama and Hoover, Alabama, which has the greater population":"Hoover, Alabama has the larger population (84100 against 55419).","between Missoula, Montana and Delano, California, which has the greater population":"Missoula, Montana has the larger population (70117 against 52538).","which has the larger population, South Gate, California or South Jordan, Utah":"South Gate, California has the larger population (95219 against 62751).","which has the larger population, Murray, Utah or Manhattan, Kansas":"Manhattan, Kansas has the larger population (55909 against 48834).","between West Hartford, Connecticut and South Hill, Washington, which has the greater population":"West Hartford, Connecticut has the larger population (63187 against 55194).","between Aliso Viejo, California and Bolingbrook, Illinois, which has the greater population":"Bolingbrook, Illinois has the larger population (74320 against 50219).","whose population is larger: Bellingham, Washington or Greenwood, Indiana":"Bellingham, Washington has the larger population (84462 against 54564).","whose population is larger: West Seneca, New York or McKinney, Texas":"McKinney, Texas has the larger population (156821 against 45197).","whose population is larger: Bridgeport, Connecticut or Edina, Minnesota":"Bridgeport, Connecticut has the larger population (147022 against 49976).","whose population is larger: Brookhaven, Georgia or Revere, Massachusetts":"Revere, Massachusetts has the larger population (53165 against 51567).","between Palm Beach Gardens, Florida and Levittown, Pennsylvania, which has the greater population":"Levittown, Pennsylvania has the larger population (52407 against 51865).","between Deltona, Florida and Middletown, Ohio, which has the greater population":"Deltona, Florida has the larger population (87387 against 48527).","between Newport News, Virginia and Eden Prairie, Minnesota, which has the greater population":"Newport News, Virginia has the larger population (181606 against 63206).","between Jeffersonville, Indiana and Brookhaven, Georgia, which has the greater population":"Brookhaven, Georgia has the larger population (51567 against 46415).","whose population is larger: Draper, Utah or Murray, Utah":"Murray, Utah has the larger population (48834 against 46399).","whose population is larger: Olympia, Washington or Ankeny, Iowa":"Ankeny, Iowa has the larger population (53413 against 49608).","which has the larger population, Orem, Utah or Westminster, Colorado":"Westminster, Colorado has the larger population (111770 against 93220).","which has the larger population, Phoenix, Arizona or Decatur, Alabama":"Phoenix, Arizona has the larger population (1555324 against 55419).","which has the larger population, Edina, Minnesota or Dearborn, Michigan":"Dearborn, Michigan has the larger population (95520 against 49976).","between Pembroke Pines, Florida and Colton, California, which has the greater population":"Pembroke Pines, Florida has the larger population (164753 against 53856).","which has the larger population, Olathe, Kansas or Richmond, California":"Olathe, Kansas has the larger population (132787 against 108303).","whose population is larger: Walnut Creek, California or Buffalo, New York":"Buffalo, New York has the larger population (258989 against 67568).","which has the larger population, Conway, Arkansas or Missoula, Montana":"Missoula, Montana has the larger population (70117 against 64184).","whose population is larger: Delano, California or Porterville, California":"Porterville, California has the larger population (58472 against 52538).","whose population is larger: Yorba Linda, California or Clarksville, Tennessee":"Clarksville, Tennessee has the larger population (146281 against 67362).","between Sugar Land, Texas and Bedford, Texas, which has the greater population":"Sugar Land, Texas has the larger population (85681 against 48864).","which has the larger population, Columbia, Missouri or Guaynabo, Puerto Rico":"Columbia, Missouri has the larger population (117165 against 71667).","whose population is larger: Sunrise Manor, Nevada or Racine, Wisconsin":"Sunrise Manor, Nevada has the larger population (192873 against 77931).","whose population is larger: Middletown, Ohio or Glen Burnie, Maryland":"Glen Burnie, Maryland has the larger population (69060 against 48527).","which has the larger population, Revere, Massachusetts or Lombard, Illinois":"Revere, Massachusetts has the larger population (53165 against 44025).","whose population is larger: Miramar, Florida or Conway, Arkansas":"Miramar, Florida has the larger population (133741 against 64184).","between Lombard, Illinois and Apex, North Carolina, which has the greater population":"Lombard, Illinois has the larger population (44025 against 43893).","whose population is larger: Apex, North Carolina or Waterloo, Iowa":"Waterloo, Iowa has the larger population (68357 against 43893).","between South Jordan, Utah and Olympia, Washington, which has the greater population":"South Jordan, Utah has the larger population (62751 against 49608).","which has the larger population, Greenwood, Indiana or Atlanta, Georgia":"Atlanta, Georgia has the larger population (456378 against 54564).","which has the larger population, McKinney, Texas or Tuscaloosa, Alabama":"McKinney, Texas has the larger population (156821 against 96352).","which has the larger population, Danbury, Connecticut or Montebello, California":"Danbury, Connecticut has the larger population (83890 against 63416).","which has the larger population, Gary, Indiana or Jeffersonville, Indiana":"Gary, Indiana has the larger population (77858 against 46415).","which has the larger population, Great Falls, Montana or Spokane, Washington":"Spokane, Washington has the larger population (212078 against 59479).","whose population is larger: Pocatello, Idaho or Phoenix, Arizona":"Phoenix, Arizona has the larger population (1555324 against 54592).","which has the larger population, Burke, Virginia or Centreville, Virginia":"Centreville, Virginia has the larger population (73084 against 42290).","between Spokane, Washington and Miramar, Florida, which has the greater population":"Spokane, Washington has the larger population (212078 against 133741).","between Enid, Oklahoma and Florin, California, which has the greater population":"Enid, Oklahoma has the larger population (50891 against 49486).","whose population is larger: Fontana, California or Potomac, Maryland":"Fontana, California has the larger population (205228 against 45882).","whose population is larger: Troy, Michigan or Carrollton, Texas":"Carrollton, Texas has the larger population (129266 against 82982).","between Richmond, California and Rancho Cordova, California, which has the greater population":"Richmond, California has the larger population (108303 against 69482).","which has the larger population, Fayetteville, Arkansas or Newport News, Virginia":"Newport News, Virginia has the larger population (181606 against 80552).","which has the larger population, Potomac, Maryland or Burnsville, Minnesota":"Burnsville, Minnesota has the larger population (61158 against 45882).","which has the larger population, Yuba City, California or Pittsfield, Massachusetts":"Yuba City, California has the larger population (66147 against 43632).","between Lincoln, California and St. Louis Park, Minnesota, which has the greater population":"St. Louis Park, Minnesota has the larger population (47486 against 45675).","which has the larger population, Racine, Wisconsin or Irvine, California":"Irvine, California has the larger population (246992 against 77931).","which has the larger population, Porterville, California or West Hartford, Connecticut":"West Hartford, Connecticut has the larger population (63187 against 58472).","between Kentwood, Michigan and Yorba Linda, California, which has the greater population":"Yorba Linda, California has the larger population (67362 against 50761)."}}},
{"id":"n-a0f89ba3","guard":[["has","population"],["not",["has","of"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Wilmington, Delaware or Lincoln, California":"Wilmington, Delaware has the larger population (71502 against 45675).","whose population is larger: Hoover, Alabama or Lenexa, Kansas":"Hoover, Alabama has the larger population (84100 against 51206).","between Layton, Utah and West Valley City, Utah, which has the greater population":"West Valley City, Utah has the larger population (134609 against 72413).","whose population is larger: Rancho Cordova, California or Columbia, Missouri":"Columbia, Missouri has the larger population (117165 against 69482).","whose population is larger: Baytown, Texas or South Gate, California":"South Gate, California has the larger population (95219 against 75310).","which has the larger population, Concord, California or Pembroke Pines, Florida":"Pembroke Pines, Florida has the larger population (164753 against 126938).","which has the larger population, Buffalo, New York or Aliso Viejo, California":"Buffalo, New York has the larger population (258989 against 50219).","whose population is larger: Florin, California or Burke, Virginia":"Florin, California has the larger population (49486 against 42290).","between Centreville, Virginia and Irving, Texas, which has the greater population":"Irving, Texas has the larger population (232013 against 73084).","between Birmingham, Alabama and Lorain, Ohio, which has the greater population":"Birmingham, Alabama has the larger population (212424 against 63714).","between Coon Rapids, Minnesota and Bridgeport, Connecticut, which has the greater population":"Bridgeport, Connecticut has the larger population (147022 against 62159).","whose population is larger: Colton, California or Allentown, Pennsylvania":"Allentown, Pennsylvania has the larger population (119624 against 53856).","between Tuscaloosa, Alabama and Bellingham, Washington, which has the greater population":"Tuscaloosa, Alabama has the larger population (96352 against 84462).","between Burnsville, Minnesota and Pocatello, Idaho, which has the greater population":"Burnsville, Minnesota has the larger population (61158 against 54592).","which has the larger population, Catalina Foothills, Arizona or New Braunfels, Texas":"New Braunfels, Texas has the larger population (67097 against 51329).","whose population is larger: Irving, Texas or Danbury, Connecticut":"Irving, Texas has the larger population (232013 against 83890).","between Atlanta, Georgia and Troy, Michigan, which has the greater population":"Atlanta, Georgia has the larger population (456378 against 82982).","between Tonawanda, New York and Stillwater, Oklahoma, which has the greater population":"Tonawanda, New York has the larger population (57844 against 48104).","which has the larger population, Hanford, California or Coon Rapids, Minnesota":"Coon Rapids, Minnesota has the larger population (62159 against 54912).","between Pittsfield, Massachusetts and Los Angeles, California, which has the greater population":"Los Angeles, California has the larger population (3918872 against 43632).","which has the larger population, Glen Burnie, Maryland or Layton, Utah":"Layton, Utah has the larger population (72413 against 69060).","whose population is larger: Bedford, Texas or Orem, Utah":"Orem, Utah has the larger population (93220 against 48864).","which has the larger population, Alexandria, Virginia or Sugar Land, Texas":"Alexandria, Virginia has the larger population (151473 against 85681).","between Irvine, California and Baytown, Texas, which has the greater population":"Irvine, California has the larger population (246992 against 75310).","whose population is larger: West Valley City, Utah or Blaine, Minnesota":"West Valley City, Utah has the larger population (134609 against 61210).","whose population is larger: Eden Prairie, Minnesota or Great Falls, Montana":"Eden Prairie, Minnesota has the larger population (63206 against 59479).","whose population is larger: Bolingbrook, Illinois or Catalina Foothills, Arizona":"Bolingbrook, Illinois has the larger population (74320 against 51329).","between Guaynabo, Puerto Rico and West Seneca, New York, which has the greater population":"Guaynabo, Puerto Rico has the larger population (71667 against 45197).","between Westminster, Colorado and Sunrise Manor, Nevada, which has the greater population":"Sunrise Manor, Nevada has the larger population (192873 against 111770).","between Montebello, California and Walnut Creek, California, which has the greater population":"Walnut Creek, California has the larger population (67568 against 63416).","which has the larger population, Allentown, Pennsylvania or Deltona, Florida":"Allentown, Pennsylvania has the larger population (119624 against 87387).","whose population is larger: Stillwater, Oklahoma or Concord, California":"Concord, California has the larger population (126938 against 48104).","whose population is larger: Los Angeles, California or Gary, Indiana":"Los Angeles, California has the larger population (3918872 against 77858).","which has the larger population, Carrollton, Texas or Kentwood, Michigan":"Carrollton, Texas has the larger population (129266 against 50761).","which has the larger population, Blaine, Minnesota or Enid, Oklahoma":"Blaine, Minnesota has the larger population (61210 against 50891).","between Rochester Hills, Michigan and Keller, Texas, which has the greater population":"Rochester Hills, Michigan has the larger population (72987 against 44250).","whose population is larger: Keller, Texas or Yuba City, California":"Yuba City, California has the larger population (66147 against 44250).","which has the larger population, Lenexa, Kansas or Rochester Hills, Michigan":"Rochester Hills, Michigan has the larger population (72987 against 51206).","whose population is larger: Levittown, Pennsylvania or Alexandria, Virginia":"Alexandria, Virginia has the larger population (151473 against 52407).","between Dearborn, Michigan and Draper, Utah, which has the greater population":"Dearborn, Michigan has the larger population (95520 against 46399).","whose population is larger: St. Louis Park, Minnesota or Fayetteville, Arkansas":"Fayetteville, Arkansas has the larger population (80552 against 47486).","which has the larger population, Ankeny, Iowa or Birmingham, Alabama":"Birmingham, Alabama has the larger population (212424 against 53413).","which has the larger population, Waterloo, Iowa or Palm Beach Gardens, Florida":"Waterloo, Iowa has the larger population (68357 against 51865).","which has the larger population, Clarksville, Tennessee or Tonawanda, New York":"Clarksville, Tennessee has the larger population (146281 against 57844).","whose population is larger: South Hill, Washington or Hanford, California":"South Hill, Washington has the larger population (55194 against 54912).","between New Braunfels, Texas and Fontana, California, which has the greater population":"Fontana, California has the larger population (205228 against 67097).","whose population is larger: Lorain, Ohio or Wilmington, Delaware":"Wilmington, Delaware has the larger population (71502 against 63714).","between Decatur, Alabama and Hoover, Alabama, which has the greater population":"Hoover, Alabama has the larger population (84100 against 55419).","between Missoula, Montana and Delano, California, which has the greater population":"Missoula, Montana has the larger population (70117 against 52538).","which has the larger population, South Gate, California or South Jordan, Utah":"South Gate, California has the larger population (95219 against 62751).","which has the larger population, Murray, Utah or Manhattan, Kansas":"Manhattan, Kansas has the larger population (55909 against 48834).","between West Hartford, Connecticut and South Hill, Washington, which has the greater population":"West Hartford, Connecticut has the larger population (63187 against 55194).","between Aliso Viejo, California and Bolingbrook, Illinois, which has the greater population":"Bolingbrook, Illinois has the larger population (74320 against 50219).","whose population is larger: Bellingham, Washington or Greenwood, Indiana":"Bellingham, Washington has the larger population (84462 against 54564).","whose population is larger: West Seneca, New York or McKinney, Texas":"McKinney, Texas has the larger population (156821 against 45197).","whose population is larger: Bridgeport, Connecticut or Edina, Minnesota":"Bridgeport, Connecticut has the larger population (147022 against 49976).","whose population is larger: Brookhaven, Georgia or Revere, Massachusetts":"Revere, Massachusetts has the larger population (53165 against 51567).","between Palm Beach Gardens, Florida and Levittown, Pennsylvania, which has the greater population":"Levittown, Pennsylvania has the larger population (52407 against 51865).","between Deltona, Florida and Middletown, Ohio, which has the greater population":"Deltona, Florida has the larger population (87387 against 48527).","between Newport News, Virginia and Eden Prairie, Minnesota, which has the greater population":"Newport News, Virginia has the larger population (181606 against 63206).","between Jeffersonville, Indiana and Brookhaven, Georgia, which has the greater population":"Brookhaven, Georgia has the larger population (51567 against 46415).","whose population is larger: Draper, Utah or Murray, Utah":"Murray, Utah has the larger population (48834 against 46399).","whose population is larger: Olympia, Washington or Ankeny, Iowa":"Ankeny, Iowa has the larger population (53413 against 49608).","which has the larger population, Orem, Utah or Westminster, Colorado":"Westminster, Colorado has the larger population (111770 against 93220).","which has the larger population, Phoenix, Arizona or Decatur, Alabama":"Phoenix, Arizona has the larger population (1555324 against 55419).","which has the larger population, Edina, Minnesota or Dearborn, Michigan":"Dearborn, Michigan has the larger population (95520 against 49976).","between Pembroke Pines, Florida and Colton, California, which has the greater population":"Pembroke Pines, Florida has the larger population (164753 against 53856).","which has the larger population, Olathe, Kansas or Richmond, California":"Olathe, Kansas has the larger population (132787 against 108303).","whose population is larger: Walnut Creek, California or Buffalo, New York":"Buffalo, New York has the larger population (258989 against 67568).","which has the larger population, Conway, Arkansas or Missoula, Montana":"Missoula, Montana has the larger population (70117 against 64184).","whose population is larger: Delano, California or Porterville, California":"Porterville, California has the larger population (58472 against 52538).","whose population is larger: Yorba Linda, California or Clarksville, Tennessee":"Clarksville, Tennessee has the larger population (146281 against 67362).","between Sugar Land, Texas and Bedford, Texas, which has the greater population":"Sugar Land, Texas has the larger population (85681 against 48864).","which has the larger population, Columbia, Missouri or Guaynabo, Puerto Rico":"Columbia, Missouri has the larger population (117165 against 71667).","whose population is larger: Sunrise Manor, Nevada or Racine, Wisconsin":"Sunrise Manor, Nevada has the larger population (192873 against 77931).","whose population is larger: Middletown, Ohio or Glen Burnie, Maryland":"Glen Burnie, Maryland has the larger population (69060 against 48527).","which has the larger population, Revere, Massachusetts or Lombard, Illinois":"Revere, Massachusetts has the larger population (53165 against 44025).","whose population is larger: Miramar, Florida or Conway, Arkansas":"Miramar, Florida has the larger population (133741 against 64184).","between Lombard, Illinois and Apex, North Carolina, which has the greater population":"Lombard, Illinois has the larger population (44025 against 43893).","whose population is larger: Apex, North Carolina or Waterloo, Iowa":"Waterloo, Iowa has the larger population (68357 against 43893).","between South Jordan, Utah and Olympia, Washington, which has the greater population":"South Jordan, Utah has the larger population (62751 against 49608).","which has the larger population, Greenwood, Indiana or Atlanta, Georgia":"Atlanta, Georgia has the larger population (456378 against 54564).","which has the larger population, McKinney, Texas or Tuscaloosa, Alabama":"McKinney, Texas has the larger population (156821 against 96352).","which has the larger population, Danbury, Connecticut or Montebello, California":"Danbury, Connecticut has the larger population (83890 against 63416).","which has the larger population, Gary, Indiana or Jeffersonville, Indiana":"Gary, Indiana has the larger population (77858 against 46415).","which has the larger population, Great Falls, Montana or Spokane, Washington":"Spokane, Washington has the larger population (212078 against 59479).","whose population is larger: Pocatello, Idaho or Phoenix, Arizona":"Phoenix, Arizona has the larger population (1555324 against 54592).","which has the larger population, Burke, Virginia or Centreville, Virginia":"Centreville, Virginia has the larger population (73084 against 42290).","between Spokane, Washington and Miramar, Florida, which has the greater population":"Spokane, Washington has the larger population (212078 against 133741).","between Enid, Oklahoma and Florin, California, which has the greater population":"Enid, Oklahoma has the larger population (50891 against 49486).","whose population is larger: Fontana, California or Potomac, Maryland":"Fontana, California has the larger population (205228 against 45882).","whose population is larger: Troy, Michigan or Carrollton, Texas":"Carrollton, Texas has the larger population (129266 against 82982).","between Richmond, California and Rancho Cordova, California, which has the greater population":"Richmond, California has the larger population (108303 against 69482).","which has the larger population, Fayetteville, Arkansas or Newport News, Virginia":"Newport News, Virginia has the larger population (181606 against 80552).","which has the larger population, Potomac, Maryland or Burnsville, Minnesota":"Burnsville, Minnesota has the larger population (61158 against 45882).","which has the larger population, Yuba City, California or Pittsfield, Massachusetts":"Yuba City, California has the larger population (66147 against 43632).","between Lincoln, California and St. Louis Park, Minnesota, which has the greater population":"St. Louis Park, Minnesota has the larger population (47486 against 45675).","which has the larger population, Racine, Wisconsin or Irvine, California":"Irvine, California has the larger population (246992 against 77931).","which has the larger population, Porterville, California or West Hartford, Connecticut":"West Hartford, Connecticut has the larger population (63187 against 58472).","between Kentwood, Michigan and Yorba Linda, California, which has the greater population":"Yorba Linda, California has the larger population (67362 against 50761)."}}},
{"id":"n-ec1a9104","guard":[["has","larger"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"larger: Hoover, Alabama or Lenexa, Kansas":"Hoover, Alabama has the larger population (84100 against 51206).","larger: Rancho Cordova, California or Columbia, Missouri":"Columbia, Missouri has the larger population (117165 against 69482).","larger: Baytown, Texas or South Gate, California":"South Gate, California has the larger population (95219 against 75310).","larger: Florin, California or Burke, Virginia":"Florin, California has the larger population (49486 against 42290).","larger: Colton, California or Allentown, Pennsylvania":"Allentown, Pennsylvania has the larger population (119624 against 53856).","larger: Irving, Texas or Danbury, Connecticut":"Irving, Texas has the larger population (232013 against 83890).","larger: Bedford, Texas or Orem, Utah":"Orem, Utah has the larger population (93220 against 48864).","larger: West Valley City, Utah or Blaine, Minnesota":"West Valley City, Utah has the larger population (134609 against 61210).","larger: Eden Prairie, Minnesota or Great Falls, Montana":"Eden Prairie, Minnesota has the larger population (63206 against 59479).","larger: Bolingbrook, Illinois or Catalina Foothills, Arizona":"Bolingbrook, Illinois has the larger population (74320 against 51329).","larger: Stillwater, Oklahoma or Concord, California":"Concord, California has the larger population (126938 against 48104).","larger: Los Angeles, California or Gary, Indiana":"Los Angeles, California has the larger population (3918872 against 77858).","larger: Keller, Texas or Yuba City, California":"Yuba City, California has the larger population (66147 against 44250).","larger: Levittown, Pennsylvania or Alexandria, Virginia":"Alexandria, Virginia has the larger population (151473 against 52407).","larger: St. Louis Park, Minnesota or Fayetteville, Arkansas":"Fayetteville, Arkansas has the larger population (80552 against 47486).","larger: South Hill, Washington or Hanford, California":"South Hill, Washington has the larger population (55194 against 54912).","larger: Lorain, Ohio or Wilmington, Delaware":"Wilmington, Delaware has the larger population (71502 against 63714).","larger: Bellingham, Washington or Greenwood, Indiana":"Bellingham, Washington has the larger population (84462 against 54564).","larger: West Seneca, New York or McKinney, Texas":"McKinney, Texas has the larger population (156821 against 45197).","larger: Bridgeport, Connecticut or Edina, Minnesota":"Bridgeport, Connecticut has the larger population (147022 against 49976).","larger: Brookhaven, Georgia or Revere, Massachusetts":"Revere, Massachusetts has the larger population (53165 against 51567).","larger: Draper, Utah or Murray, Utah":"Murray, Utah has the larger population (48834 against 46399).","larger: Olympia, Washington or Ankeny, Iowa":"Ankeny, Iowa has the larger population (53413 against 49608).","larger: Walnut Creek, California or Buffalo, New York":"Buffalo, New York has the larger population (258989 against 67568).","larger: Delano, California or Porterville, California":"Porterville, California has the larger population (58472 against 52538).","larger: Yorba Linda, California or Clarksville, Tennessee":"Clarksville, Tennessee has the larger population (146281 against 67362).","larger: Sunrise Manor, Nevada or Racine, Wisconsin":"Sunrise Manor, Nevada has the larger population (192873 against 77931).","larger: Middletown, Ohio or Glen Burnie, Maryland":"Glen Burnie, Maryland has the larger population (69060 against 48527).","larger: Miramar, Florida or Conway, Arkansas":"Miramar, Florida has the larger population (133741 against 64184).","larger: Apex, North Carolina or Waterloo, Iowa":"Waterloo, Iowa has the larger population (68357 against 43893).","larger: Pocatello, Idaho or Phoenix, Arizona":"Phoenix, Arizona has the larger population (1555324 against 54592).","larger: Fontana, California or Potomac, Maryland":"Fontana, California has the larger population (205228 against 45882).","larger: Troy, Michigan or Carrollton, Texas":"Carrollton, Texas has the larger population (129266 against 82982)."}}},
{"id":"n-1ff1a477","guard":[["hasAny",["baytown","bedford","brookhaven","carrollton","clarksville","columbia","concord","delano","draper","fayetteville","from position","idaho","iowa","items from to","keller","new","ohio","pennsylvania","slice"]],["has","larger"]],"pyramid":["render.list",["transform.sliceStrs",["sense.list"],{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-1de1a45c","guard":[["hasAny",["alabama","blaine","bolingbrook","burke","connecticut","conway","eden","first n","fontana","hanford","indiana","manor","take","top"]],["has","larger"]],"pyramid":["render.list",["transform.takeStrs",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-f5d48f75","guard":[["hasAny",["decatur","from position","items from to","jeffersonville","olathe","slice"]],["has","which"],["not",["has","lesser"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-0a7af911","guard":[["hasAny",["bridgeport","delete","remove","strip out","without"]],["has","minnesota"]],"pyramid":["render.str",["transform.remove",{"lit":"Bridgeport, Connecticut"},["sense.lastWord"]]],"mem":null},
{"id":"n-1b0508ab","guard":[["hasAny",["bolingbrook","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Bolingbrook, Illinois"},["sense.lastWord"]]],"mem":null},
{"id":"n-3f5fe92b","guard":[["hasAny",["bridgeport","separate by","split","split by"]],["has","minnesota"]],"pyramid":["render.list",["transform.split",{"lit":"Bridgeport, Connecticut"},["sense.lastWord"]]],"mem":null},
{"id":"n-5aa0b809","guard":[["hasAny",["buffalo","delete","remove","strip out","without"]],["has","larger"]],"pyramid":["render.str",["transform.remove",{"lit":"Buffalo, New York"},["sense.subject"]]],"mem":null},
{"id":"n-70ddeb3e","guard":[["hasAny",["carrollton","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Carrollton, Texas"},["sense.subject"]]],"mem":null},
{"id":"n-8624f3f7","guard":[["hasAny",["bridgeport","delete","remove","strip out","without"]],["has","minnesota"]],"pyramid":["render.str",["transform.remove",{"lit":"Bridgeport, Connecticut"},["sense.subject"]]],"mem":null},
{"id":"n-88116f72","guard":[["hasAny",["buffalo","separate by","split","split by"]],["has","larger"]],"pyramid":["render.list",["transform.split",{"lit":"Buffalo, New York"},["sense.subject"]]],"mem":null},
{"id":"n-999d9f1f","guard":[["hasAny",["alexandria","separate by","split","split by"]],["has","larger"]],"pyramid":["render.list",["transform.split",{"lit":"Alexandria, Virginia"},["sense.subject"]]],"mem":null},
{"id":"n-99a3b139","guard":[["hasAny",["bolingbrook","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"Bolingbrook, Illinois"},["sense.lastWord"]]],"mem":null},
{"id":"n-c810aff7","guard":[["hasAny",["alexandria","delete","remove","strip out","without"]],["has","larger"]],"pyramid":["render.str",["transform.remove",{"lit":"Alexandria, Virginia"},["sense.subject"]]],"mem":null},
{"id":"n-d5d769da","guard":[["hasAny",["carrollton","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"Carrollton, Texas"},["sense.subject"]]],"mem":null},
{"id":"n-e8e2a23b","guard":[["hasAny",["bridgeport","separate by","split","split by"]],["has","minnesota"]],"pyramid":["render.list",["transform.split",{"lit":"Bridgeport, Connecticut"},["sense.subject"]]],"mem":null},
{"id":"n-003f2588","guard":[["hasAny",["larger","mckinney","new","population","seneca","texas","west","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: West Seneca, New York or McKinney, Texas":"McKinney, Texas has the larger population (156821 against 45197)."}}},
{"id":"n-005619a7","guard":[["hasAny",["bridgeport","connecticut","edina","larger","minnesota","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Bridgeport, Connecticut or Edina, Minnesota":"Bridgeport, Connecticut has the larger population (147022 against 49976)."}}},
{"id":"n-009fc001","guard":[["hasAny",["between","eden","greater","has","minnesota","newport","news","population","prairie","virginia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Newport News, Virginia and Eden Prairie, Minnesota, which has the greater population":"Newport News, Virginia has the larger population (181606 against 63206)."}}},
{"id":"n-0155408e","guard":[["hasAny",["alabama","has","larger","mckinney","population","texas","tuscaloosa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, McKinney, Texas or Tuscaloosa, Alabama":"McKinney, Texas has the larger population (156821 against 96352)."}}},
{"id":"n-01ceb42e","guard":[["hasAny",["has","illinois","larger","lombard","massachusetts","population","revere"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Revere, Massachusetts or Lombard, Illinois":"Revere, Massachusetts has the larger population (53165 against 44025)."}}},
{"id":"n-02e121fa","guard":[["hasAny",["clarksville","has","larger","new","population","tennessee","tonawanda","york"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Clarksville, Tennessee or Tonawanda, New York":"Clarksville, Tennessee has the larger population (146281 against 57844)."}}},
{"id":"n-038cb7a7","guard":[["hasAny",["aliso","between","bolingbrook","california","greater","has","illinois","population","viejo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Aliso Viejo, California and Bolingbrook, Illinois, which has the greater population":"Bolingbrook, Illinois has the larger population (74320 against 50219)."}}},
{"id":"n-06f40d9d","guard":[["hasAny",["aliso","has","viejo"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Buffalo, New York or Aliso Viejo, California":"Buffalo, New York has the larger population (258989 against 50219)."}}},
{"id":"n-07595cde","guard":[["hasAny",["atlanta","georgia","greenwood","has","indiana","larger","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Greenwood, Indiana or Atlanta, Georgia":"Atlanta, Georgia has the larger population (456378 against 54564)."}}},
{"id":"n-09c72cc3","guard":[["hasAny",["between","centreville","greater","has","irving","population","texas","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Centreville, Virginia and Irving, Texas, which has the greater population":"Irving, Texas has the larger population (232013 against 73084)."}}},
{"id":"n-0c158970","guard":[["hasAny",["alabama","arizona","decatur","has","larger","phoenix","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Phoenix, Arizona or Decatur, Alabama":"Phoenix, Arizona has the larger population (1555324 against 55419)."}}},
{"id":"n-0e66d525","guard":[["hasAny",["california","gate","has","jordan","larger","population","south","utah"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, South Gate, California or South Jordan, Utah":"South Gate, California has the larger population (95219 against 62751)."}}},
{"id":"n-0ef4c855","guard":[["hasAny",["arizona","braunfels","catalina","foothills","has","larger","new","population","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Catalina Foothills, Arizona or New Braunfels, Texas":"New Braunfels, Texas has the larger population (67097 against 51329)."}}},
{"id":"n-10ce6099","guard":[["hasAny",["between","california","delano","greater","has","missoula","montana","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Missoula, Montana and Delano, California, which has the greater population":"Missoula, Montana has the larger population (70117 against 52538)."}}},
{"id":"n-155cf23f","guard":[["hasAny",["decatur","hoover"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Decatur, Alabama and Hoover, Alabama, which has the greater population":"Hoover, Alabama has the larger population (84100 against 55419)."}}},
{"id":"n-15988e7b","guard":[["hasAny",["between","california","delano","greater","has","missoula","montana","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Missoula, Montana and Delano, California, which has the greater population":"Missoula, Montana has the larger population (70117 against 52538)."}}},
{"id":"n-1a1f8809","guard":[["hasAny",["keller","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Keller, Texas or Yuba City, California":"Yuba City, California has the larger population (66147 against 44250)."}}},
{"id":"n-1a3d0f33","guard":[["hasAny",["alexandria","has","land","larger","population","sugar","texas","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Alexandria, Virginia or Sugar Land, Texas":"Alexandria, Virginia has the larger population (151473 against 85681)."}}},
{"id":"n-1c05986a","guard":[["hasAny",["california","city","has","larger","massachusetts","pittsfield","population","yuba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Yuba City, California or Pittsfield, Massachusetts":"Yuba City, California has the larger population (66147 against 43632)."}}},
{"id":"n-1c0abaae","guard":[["hasAny",["california","has","irvine","larger","population","racine","wisconsin"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Racine, Wisconsin or Irvine, California":"Irvine, California has the larger population (246992 against 77931)."}}},
{"id":"n-1c6feefa","guard":[["hasAny",["between","california","greater","has","kentwood","linda","michigan","population","yorba"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Kentwood, Michigan and Yorba Linda, California, which has the greater population":"Yorba Linda, California has the larger population (67362 against 50761)."}}},
{"id":"n-1f4ac9a3","guard":[["hasAny",["between","deltona","florida","greater","has","middletown","ohio","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Deltona, Florida and Middletown, Ohio, which has the greater population":"Deltona, Florida has the larger population (87387 against 48527)."}}},
{"id":"n-21824575","guard":[["hasAny",["between","colorado","greater","has","manor","nevada","population","sunrise","westminster"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Westminster, Colorado and Sunrise Manor, Nevada, which has the greater population":"Sunrise Manor, Nevada has the larger population (192873 against 111770)."}}},
{"id":"n-22b6dbc4","guard":[["hasAny",["between","greater","has","new","oklahoma","population","stillwater","tonawanda","york"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Tonawanda, New York and Stillwater, Oklahoma, which has the greater population":"Tonawanda, New York has the larger population (57844 against 48104)."}}},
{"id":"n-23856bb1","guard":[["hasAny",["columbia","guaynabo","has","larger","missouri","population","puerto","rico"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Columbia, Missouri or Guaynabo, Puerto Rico":"Columbia, Missouri has the larger population (117165 against 71667)."}}},
{"id":"n-24349fbb","guard":[["hasAny",["brookhaven","georgia","larger","massachusetts","population","revere"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Brookhaven, Georgia or Revere, Massachusetts":"Revere, Massachusetts has the larger population (53165 against 51567)."}}},
{"id":"n-244fedae","guard":[["hasAny",["carrollton","larger","michigan","population","texas","troy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Troy, Michigan or Carrollton, Texas":"Carrollton, Texas has the larger population (129266 against 82982)."}}},
{"id":"n-2617bc2a","guard":[["hasAny",["between","dearborn","draper","greater","has","michigan","population","utah"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Dearborn, Michigan and Draper, Utah, which has the greater population":"Dearborn, Michigan has the larger population (95520 against 46399)."}}},
{"id":"n-2672f9f5","guard":[["hasAny",["beach","between","florida","gardens","greater","has","levittown","palm","pennsylvania","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Palm Beach Gardens, Florida and Levittown, Pennsylvania, which has the greater population":"Levittown, Pennsylvania has the larger population (52407 against 51865)."}}},
{"id":"n-269f04f3","guard":[["hasAny",["angeles","between","california","greater","has","los","massachusetts","pittsfield","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Pittsfield, Massachusetts and Los Angeles, California, which has the greater population":"Los Angeles, California has the larger population (3918872 against 43632)."}}},
{"id":"n-26ab43e3","guard":[["hasAny",["california","has","kansas","larger","olathe","population","richmond"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Olathe, Kansas or Richmond, California":"Olathe, Kansas has the larger population (132787 against 108303)."}}},
{"id":"n-26b6d741","guard":[["hasAny",["has","kentwood"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Carrollton, Texas or Kentwood, Michigan":"Carrollton, Texas has the larger population (129266 against 50761)."}}},
{"id":"n-27bbbe30","guard":[["hasAny",["california","concord","florida","has","larger","pembroke","pines","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Concord, California or Pembroke Pines, Florida":"Pembroke Pines, Florida has the larger population (164753 against 126938)."}}},
{"id":"n-2853aabe","guard":[["hasAny",["california","columbia","cordova","larger","missouri","population","rancho"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Rancho Cordova, California or Columbia, Missouri":"Columbia, Missouri has the larger population (117165 against 69482)."}}},
{"id":"n-28c421b2","guard":[["hasAny",["california","connecticut","hartford","has","larger","population","porterville","west"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Porterville, California or West Hartford, Connecticut":"West Hartford, Connecticut has the larger population (63187 against 58472)."}}},
{"id":"n-2d43473f","guard":[["hasAny",["between","california","greater","has","lincoln","louis","minnesota","park","population","st"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Lincoln, California and St. Louis Park, Minnesota, which has the greater population":"St. Louis Park, Minnesota has the larger population (47486 against 45675)."}}},
{"id":"n-2d4d8766","guard":[["hasAny",["california","delaware","has","larger","lincoln","population","wilmington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Wilmington, Delaware or Lincoln, California":"Wilmington, Delaware has the larger population (71502 against 45675)."}}},
{"id":"n-2f41941e","guard":[["hasAny",["beach","florida","gardens","has","iowa","larger","palm","population","waterloo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Waterloo, Iowa or Palm Beach Gardens, Florida":"Waterloo, Iowa has the larger population (68357 against 51865)."}}},
{"id":"n-2faa6908","guard":[["hasAny",["dearborn","edina","has","larger","michigan","minnesota","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Edina, Minnesota or Dearborn, Michigan":"Dearborn, Michigan has the larger population (95520 against 49976)."}}},
{"id":"n-306adca4","guard":[["hasAny",["colorado","has","larger","orem","population","utah","westminster"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Orem, Utah or Westminster, Colorado":"Westminster, Colorado has the larger population (111770 against 93220)."}}},
{"id":"n-3092092b","guard":[["has","draper"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Draper, Utah or Murray, Utah":"Murray, Utah has the larger population (48834 against 46399)."}}},
{"id":"n-326f727e","guard":[["hasAny",["baytown","texas"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Baytown, Texas or South Gate, California":"South Gate, California has the larger population (95219 against 75310)."}}},
{"id":"n-327658d2","guard":[["hasAny",["arkansas","conway","florida","larger","miramar","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Miramar, Florida or Conway, Arkansas":"Miramar, Florida has the larger population (133741 against 64184)."}}},
{"id":"n-340715a6","guard":[["hasAny",["arkansas","conway","florida","larger","miramar","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Miramar, Florida or Conway, Arkansas":"Miramar, Florida has the larger population (133741 against 64184)."}}},
{"id":"n-349d6ce7","guard":[["hasAny",["bedford","larger","orem","population","texas","utah"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Bedford, Texas or Orem, Utah":"Orem, Utah has the larger population (93220 against 48864)."}}},
{"id":"n-3580a7a3","guard":[["hasAny",["burke","centreville","has","larger","population","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Burke, Virginia or Centreville, Virginia":"Centreville, Virginia has the larger population (73084 against 42290)."}}},
{"id":"n-3626a8b8","guard":[["hasAny",["allentown","california","colton","larger","pennsylvania","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Colton, California or Allentown, Pennsylvania":"Allentown, Pennsylvania has the larger population (119624 against 53856)."}}},
{"id":"n-38f5d238","guard":[["hasAny",["between","california","greater","has","kentwood","linda","michigan","population","yorba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Kentwood, Michigan and Yorba Linda, California, which has the greater population":"Yorba Linda, California has the larger population (67362 against 50761)."}}},
{"id":"n-39126541","guard":[["hasAny",["colorado","has","larger","orem","population","utah","westminster"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Orem, Utah or Westminster, Colorado":"Westminster, Colorado has the larger population (111770 against 93220)."}}},
{"id":"n-3a215521","guard":[["hasAny",["has","illinois","larger","lombard","massachusetts","population","revere"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Revere, Massachusetts or Lombard, Illinois":"Revere, Massachusetts has the larger population (53165 against 44025)."}}},
{"id":"n-3b311a32","guard":[["hasAny",["apex","carolina","iowa","larger","north","population","waterloo"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Apex, North Carolina or Waterloo, Iowa":"Waterloo, Iowa has the larger population (68357 against 43893)."}}},
{"id":"n-3b38e356","guard":[["hasAny",["between","bridgeport","connecticut","coon","greater","has","minnesota","population","rapids"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Coon Rapids, Minnesota and Bridgeport, Connecticut, which has the greater population":"Bridgeport, Connecticut has the larger population (147022 against 62159)."}}},
{"id":"n-3f44495b","guard":[["hasAny",["between","california","creek","greater","has","montebello","population","walnut"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Montebello, California and Walnut Creek, California, which has the greater population":"Walnut Creek, California has the larger population (67568 against 63416)."}}},
{"id":"n-40d2031d","guard":[["hasAny",["alexandria","has","land","larger","population","sugar","texas","virginia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Alexandria, Virginia or Sugar Land, Texas":"Alexandria, Virginia has the larger population (151473 against 85681)."}}},
{"id":"n-419a22d2","guard":[["hasAny",["beach","florida","gardens","has","iowa","larger","palm","population","waterloo"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Waterloo, Iowa or Palm Beach Gardens, Florida":"Waterloo, Iowa has the larger population (68357 against 51865)."}}},
{"id":"n-451a815e","guard":[["hasAny",["brookhaven","georgia","larger","massachusetts","population","revere"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Brookhaven, Georgia or Revere, Massachusetts":"Revere, Massachusetts has the larger population (53165 against 51567)."}}},
{"id":"n-45ba600a","guard":[["hasAny",["california","has","irvine","larger","population","racine","wisconsin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Racine, Wisconsin or Irvine, California":"Irvine, California has the larger population (246992 against 77931)."}}},
{"id":"n-462c6f91","guard":[["hasAny",["between","greater","has","jordan","olympia","population","south","utah","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between South Jordan, Utah and Olympia, Washington, which has the greater population":"South Jordan, Utah has the larger population (62751 against 49608)."}}},
{"id":"n-465def27","guard":[["hasAny",["between","california","enid","florin","greater","has","oklahoma","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Enid, Oklahoma and Florin, California, which has the greater population":"Enid, Oklahoma has the larger population (50891 against 49486)."}}},
{"id":"n-4849f962","guard":[["hasAny",["california","delano","larger","population","porterville"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Delano, California or Porterville, California":"Porterville, California has the larger population (58472 against 52538)."}}},
{"id":"n-489bacb3","guard":[["hasAny",["between","brookhaven","georgia","greater","has","indiana","jeffersonville","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Jeffersonville, Indiana and Brookhaven, Georgia, which has the greater population":"Brookhaven, Georgia has the larger population (51567 against 46415)."}}},
{"id":"n-48d84387","guard":[["hasAny",["between","city","greater","has","layton","population","utah","valley","west"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Layton, Utah and West Valley City, Utah, which has the greater population":"West Valley City, Utah has the larger population (134609 against 72413)."}}},
{"id":"n-49de1c22","guard":[["hasAny",["alabama","hoover","kansas","larger","lenexa","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Hoover, Alabama or Lenexa, Kansas":"Hoover, Alabama has the larger population (84100 against 51206)."}}},
{"id":"n-4a40641d","guard":[["hasAny",["between","greater","has","hills","keller","michigan","population","rochester","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Rochester Hills, Michigan and Keller, Texas, which has the greater population":"Rochester Hills, Michigan has the larger population (72987 against 44250)."}}},
{"id":"n-4fed3833","guard":[["hasAny",["angeles","california","gary","indiana","larger","los","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Los Angeles, California or Gary, Indiana":"Los Angeles, California has the larger population (3918872 against 77858)."}}},
{"id":"n-5015c385","guard":[["hasAny",["centreville","has"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Burke, Virginia or Centreville, Virginia":"Centreville, Virginia has the larger population (73084 against 42290)."}}},
{"id":"n-51ee2b48","guard":[["hasAny",["bellingham","tuscaloosa","washington"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Tuscaloosa, Alabama and Bellingham, Washington, which has the greater population":"Tuscaloosa, Alabama has the larger population (96352 against 84462)."}}},
{"id":"n-522b167f","guard":[["hasAny",["between","centreville","greater","has","irving","population","texas","virginia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Centreville, Virginia and Irving, Texas, which has the greater population":"Irving, Texas has the larger population (232013 against 73084)."}}},
{"id":"n-52c11465","guard":[["hasAny",["aliso","buffalo","california","has","larger","new","population","viejo","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Buffalo, New York or Aliso Viejo, California":"Buffalo, New York has the larger population (258989 against 50219)."}}},
{"id":"n-55edaca5","guard":[["hasAny",["alabama","between","birmingham","greater","has","lorain","ohio","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Birmingham, Alabama and Lorain, Ohio, which has the greater population":"Birmingham, Alabama has the larger population (212424 against 63714)."}}},
{"id":"n-5602a1cf","guard":[["hasAny",["between","deltona","florida","greater","has","middletown","ohio","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Deltona, Florida and Middletown, Ohio, which has the greater population":"Deltona, Florida has the larger population (87387 against 48527)."}}},
{"id":"n-561b9bbc","guard":[["hasAny",["between","california","cordova","greater","has","population","rancho","richmond"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Richmond, California and Rancho Cordova, California, which has the greater population":"Richmond, California has the larger population (108303 against 69482)."}}},
{"id":"n-5633a004","guard":[["hasAny",["falls","great","has","larger","montana","population","spokane","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Great Falls, Montana or Spokane, Washington":"Spokane, Washington has the larger population (212078 against 59479)."}}},
{"id":"n-581cb106","guard":[["hasAny",["clarksville","has","larger","new","population","tennessee","tonawanda","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Clarksville, Tennessee or Tonawanda, New York":"Clarksville, Tennessee has the larger population (146281 against 57844)."}}},
{"id":"n-59b907d4","guard":[["hasAny",["angeles","between","california","greater","has","los","massachusetts","pittsfield","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Pittsfield, Massachusetts and Los Angeles, California, which has the greater population":"Los Angeles, California has the larger population (3918872 against 43632)."}}},
{"id":"n-59c8447e","guard":[["hasAny",["has","hills","kansas","larger","lenexa","michigan","population","rochester"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Lenexa, Kansas or Rochester Hills, Michigan":"Rochester Hills, Michigan has the larger population (72987 against 51206)."}}},
{"id":"n-5a2b2d71","guard":[["hasAny",["apex","carolina","iowa","larger","north","population","waterloo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Apex, North Carolina or Waterloo, Iowa":"Waterloo, Iowa has the larger population (68357 against 43893)."}}},
{"id":"n-621eb916","guard":[["hasAny",["has","jordan","utah"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, South Gate, California or South Jordan, Utah":"South Gate, California has the larger population (95219 against 62751)."}}},
{"id":"n-63eb7579","guard":[["hasAny",["alabama","ankeny","birmingham","has","iowa","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Ankeny, Iowa or Birmingham, Alabama":"Birmingham, Alabama has the larger population (212424 against 53413)."}}},
{"id":"n-6481bf80","guard":[["hasAny",["aliso","between","bolingbrook","california","greater","has","illinois","population","viejo"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Aliso Viejo, California and Bolingbrook, Illinois, which has the greater population":"Bolingbrook, Illinois has the larger population (74320 against 50219)."}}},
{"id":"n-650a3811","guard":[["hasAny",["draper","larger","murray","population","utah"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Draper, Utah or Murray, Utah":"Murray, Utah has the larger population (48834 against 46399)."}}},
{"id":"n-660c8bb6","guard":[["has","troy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Troy, Michigan or Carrollton, Texas":"Carrollton, Texas has the larger population (129266 against 82982)."}}},
{"id":"n-66d77685","guard":[["hasAny",["alabama","hoover","kansas","larger","lenexa","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Hoover, Alabama or Lenexa, Kansas":"Hoover, Alabama has the larger population (84100 against 51206)."}}},
{"id":"n-6820bbcb","guard":[["hasAny",["bridgeport","connecticut","edina","larger","minnesota","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Bridgeport, Connecticut or Edina, Minnesota":"Bridgeport, Connecticut has the larger population (147022 against 49976)."}}},
{"id":"n-69d4c62f","guard":[["hasAny",["has","layton","utah"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Glen Burnie, Maryland or Layton, Utah":"Layton, Utah has the larger population (72413 against 69060)."}}},
{"id":"n-6a929b73","guard":[["hasAny",["california","florin"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Florin, California or Burke, Virginia":"Florin, California has the larger population (49486 against 42290)."}}},
{"id":"n-6bacab80","guard":[["hasAny",["arkansas","conway","has","larger","missoula","montana","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Conway, Arkansas or Missoula, Montana":"Missoula, Montana has the larger population (70117 against 64184)."}}},
{"id":"n-6c4335d0","guard":[["hasAny",["between","city","greater","has","layton","population","utah","valley","west"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Layton, Utah and West Valley City, Utah, which has the greater population":"West Valley City, Utah has the larger population (134609 against 72413)."}}},
{"id":"n-6c68cebe","guard":[["hasAny",["eden","falls","great","larger","minnesota","montana","population","prairie"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Eden Prairie, Minnesota or Great Falls, Montana":"Eden Prairie, Minnesota has the larger population (63206 against 59479)."}}},
{"id":"n-6c9fef6e","guard":[["hasAny",["california","columbia","cordova","larger","missouri","population","rancho"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Rancho Cordova, California or Columbia, Missouri":"Columbia, Missouri has the larger population (117165 against 69482)."}}},
{"id":"n-6eadafda","guard":[["hasAny",["alabama","ankeny","birmingham","has","iowa","larger","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Ankeny, Iowa or Birmingham, Alabama":"Birmingham, Alabama has the larger population (212424 against 53413)."}}},
{"id":"n-709b15c4","guard":[["hasAny",["has","kansas","manhattan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Murray, Utah or Manhattan, Kansas":"Manhattan, Kansas has the larger population (55909 against 48834)."}}},
{"id":"n-737dd662","guard":[["hasAny",["between","brookhaven","georgia","greater","has","indiana","jeffersonville","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Jeffersonville, Indiana and Brookhaven, Georgia, which has the greater population":"Brookhaven, Georgia has the larger population (51567 against 46415)."}}},
{"id":"n-75b2e944","guard":[["hasAny",["between","california","greater","has","lincoln","louis","minnesota","park","population","st"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Lincoln, California and St. Louis Park, Minnesota, which has the greater population":"St. Louis Park, Minnesota has the larger population (47486 against 45675)."}}},
{"id":"n-7914fd00","guard":[["hasAny",["has","hills","kansas","larger","lenexa","michigan","population","rochester"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Lenexa, Kansas or Rochester Hills, Michigan":"Rochester Hills, Michigan has the larger population (72987 against 51206)."}}},
{"id":"n-7990a7e4","guard":[["hasAny",["between","connecticut","greater","hartford","has","hill","population","south","washington","west"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between West Hartford, Connecticut and South Hill, Washington, which has the greater population":"West Hartford, Connecticut has the larger population (63187 against 55194)."}}},
{"id":"n-79b4957b","guard":[["hasAny",["allentown","deltona","florida","has","larger","pennsylvania","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Allentown, Pennsylvania or Deltona, Florida":"Allentown, Pennsylvania has the larger population (119624 against 87387)."}}},
{"id":"n-7a07beca","guard":[["hasAny",["arkansas","fayetteville","larger","louis","minnesota","park","population","st"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: St. Louis Park, Minnesota or Fayetteville, Arkansas":"Fayetteville, Arkansas has the larger population (80552 against 47486)."}}},
{"id":"n-7a3cda21","guard":[["hasAny",["allentown","california","colton","larger","pennsylvania","population"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Colton, California or Allentown, Pennsylvania":"Allentown, Pennsylvania has the larger population (119624 against 53856)."}}},
{"id":"n-7a648c3d","guard":[["hasAny",["angeles","california","gary","indiana","larger","los","population"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Los Angeles, California or Gary, Indiana":"Los Angeles, California has the larger population (3918872 against 77858)."}}},
{"id":"n-7ba01daf","guard":[["hasAny",["arizona","idaho","larger","phoenix","pocatello","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Pocatello, Idaho or Phoenix, Arizona":"Phoenix, Arizona has the larger population (1555324 against 54592)."}}},
{"id":"n-7e0b91fc","guard":[["hasAny",["between","california","colton","florida","greater","has","pembroke","pines","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Pembroke Pines, Florida and Colton, California, which has the greater population":"Pembroke Pines, Florida has the larger population (164753 against 53856)."}}},
{"id":"n-7eeff321","guard":[["hasAny",["alabama","between","decatur","greater","has","hoover","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Decatur, Alabama and Hoover, Alabama, which has the greater population":"Hoover, Alabama has the larger population (84100 against 55419)."}}},
{"id":"n-7f1a6548","guard":[["hasAny",["california","coon","hanford","has","larger","minnesota","population","rapids"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Hanford, California or Coon Rapids, Minnesota":"Coon Rapids, Minnesota has the larger population (62159 against 54912)."}}},
{"id":"n-7f9a83ab","guard":[["hasAny",["eden","falls","great","larger","minnesota","montana","population","prairie"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Eden Prairie, Minnesota or Great Falls, Montana":"Eden Prairie, Minnesota has the larger population (63206 against 59479)."}}},
{"id":"n-835c8205","guard":[["hasAny",["carrollton","has","kentwood","larger","michigan","population","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Carrollton, Texas or Kentwood, Michigan":"Carrollton, Texas has the larger population (129266 against 50761)."}}},
{"id":"n-8376ed8e","guard":[["hasAny",["california","coon","hanford","has","larger","minnesota","population","rapids"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Hanford, California or Coon Rapids, Minnesota":"Coon Rapids, Minnesota has the larger population (62159 against 54912)."}}},
{"id":"n-83e45207","guard":[["hasAny",["between","greater","has","hills","keller","michigan","population","rochester","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Rochester Hills, Michigan and Keller, Texas, which has the greater population":"Rochester Hills, Michigan has the larger population (72987 against 44250)."}}},
{"id":"n-86fa2988","guard":[["hasAny",["alexandria","larger","levittown","pennsylvania","population","virginia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Levittown, Pennsylvania or Alexandria, Virginia":"Alexandria, Virginia has the larger population (151473 against 52407)."}}},
{"id":"n-887c39e7","guard":[["hasAny",["hartford","porterville","west"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Porterville, California or West Hartford, Connecticut":"West Hartford, Connecticut has the larger population (63187 against 58472)."}}},
{"id":"n-89010d81","guard":[["hasAny",["arizona","braunfels","catalina","foothills","has","larger","new","population","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Catalina Foothills, Arizona or New Braunfels, Texas":"New Braunfels, Texas has the larger population (67097 against 51329)."}}},
{"id":"n-8949dc72","guard":[["hasAny",["between","greater","guaynabo","has","new","population","puerto","rico","seneca","west","york"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Guaynabo, Puerto Rico and West Seneca, New York, which has the greater population":"Guaynabo, Puerto Rico has the larger population (71667 against 45197)."}}},
{"id":"n-8cf6e124","guard":[["hasAny",["apex","between","carolina","greater","has","illinois","lombard","north","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Lombard, Illinois and Apex, North Carolina, which has the greater population":"Lombard, Illinois has the larger population (44025 against 43893)."}}},
{"id":"n-8d1bb377","guard":[["hasAny",["burnsville","has","larger","maryland","minnesota","population","potomac"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Potomac, Maryland or Burnsville, Minnesota":"Burnsville, Minnesota has the larger population (61158 against 45882)."}}},
{"id":"n-8e122a23","guard":[["hasAny",["bedford","larger","orem","population","texas","utah"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Bedford, Texas or Orem, Utah":"Orem, Utah has the larger population (93220 against 48864)."}}},
{"id":"n-8e1391ba","guard":[["hasAny",["bellingham","greenwood","indiana","larger","population","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Bellingham, Washington or Greenwood, Indiana":"Bellingham, Washington has the larger population (84462 against 54564)."}}},
{"id":"n-8eaa1dc8","guard":[["hasAny",["california","connecticut","danbury","has","larger","montebello","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Danbury, Connecticut or Montebello, California":"Danbury, Connecticut has the larger population (83890 against 63416)."}}},
{"id":"n-8eb5bed6","guard":[["hasAny",["california","clarksville","larger","linda","population","tennessee","yorba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Yorba Linda, California or Clarksville, Tennessee":"Clarksville, Tennessee has the larger population (146281 against 67362)."}}},
{"id":"n-8f14bc2c","guard":[["hasAny",["arizona","idaho","larger","phoenix","pocatello","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Pocatello, Idaho or Phoenix, Arizona":"Phoenix, Arizona has the larger population (1555324 against 54592)."}}},
{"id":"n-8f47d2fd","guard":[["hasAny",["apex","between","carolina","greater","has","illinois","lombard","north","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Lombard, Illinois and Apex, North Carolina, which has the greater population":"Lombard, Illinois has the larger population (44025 against 43893)."}}},
{"id":"n-8f5225d1","guard":[["hasAny",["middletown","ohio"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Middletown, Ohio or Glen Burnie, Maryland":"Glen Burnie, Maryland has the larger population (69060 against 48527)."}}},
{"id":"n-8fc5e631","guard":[["hasAny",["concord","larger"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Concord, California or Pembroke Pines, Florida":"Pembroke Pines, Florida has the larger population (164753 against 126938)."}}},
{"id":"n-8fe439d8","guard":[["hasAny",["arkansas","conway","has","larger","missoula","montana","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Conway, Arkansas or Missoula, Montana":"Missoula, Montana has the larger population (70117 against 64184)."}}},
{"id":"n-91ae5ca3","guard":[["hasAny",["baytown","california","gate","larger","population","south","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Baytown, Texas or South Gate, California":"South Gate, California has the larger population (95219 against 75310)."}}},
{"id":"n-925cc8e4","guard":[["hasAny",["california","concord","larger","oklahoma","population","stillwater"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Stillwater, Oklahoma or Concord, California":"Concord, California has the larger population (126938 against 48104)."}}},
{"id":"n-947bdad7","guard":[["hasAny",["ankeny","iowa","larger","olympia","population","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Olympia, Washington or Ankeny, Iowa":"Ankeny, Iowa has the larger population (53413 against 49608)."}}},
{"id":"n-94a8b0cd","guard":[["hasAny",["buffalo","california","creek","larger","new","population","walnut","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Walnut Creek, California or Buffalo, New York":"Buffalo, New York has the larger population (258989 against 67568)."}}},
{"id":"n-962f7e83","guard":[["hasAny",["dearborn","edina","has","larger","michigan","minnesota","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Edina, Minnesota or Dearborn, Michigan":"Dearborn, Michigan has the larger population (95520 against 49976)."}}},
{"id":"n-967325ad","guard":[["hasAny",["burnie","glen","has","larger","layton","maryland","population","utah"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Glen Burnie, Maryland or Layton, Utah":"Layton, Utah has the larger population (72413 against 69060)."}}},
{"id":"n-969cdc55","guard":[["hasAny",["between","california","enid","florin","greater","has","oklahoma","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Enid, Oklahoma and Florin, California, which has the greater population":"Enid, Oklahoma has the larger population (50891 against 49486)."}}},
{"id":"n-96d8f7fd","guard":[["hasAny",["california","hanford","hill","larger","population","south","washington"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: South Hill, Washington or Hanford, California":"South Hill, Washington has the larger population (55194 against 54912)."}}},
{"id":"n-98583714","guard":[["hasAny",["larger","manor","nevada","population","racine","sunrise","wisconsin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Sunrise Manor, Nevada or Racine, Wisconsin":"Sunrise Manor, Nevada has the larger population (192873 against 77931)."}}},
{"id":"n-98b6de0c","guard":[["hasAny",["between","florida","greater","has","miramar","population","spokane","washington"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Spokane, Washington and Miramar, Florida, which has the greater population":"Spokane, Washington has the larger population (212078 against 133741)."}}},
{"id":"n-992f8da5","guard":[["hasAny",["between","bridgeport","connecticut","coon","greater","has","minnesota","population","rapids"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Coon Rapids, Minnesota and Bridgeport, Connecticut, which has the greater population":"Bridgeport, Connecticut has the larger population (147022 against 62159)."}}},
{"id":"n-9981c83c","guard":[["hasAny",["between","eden","greater","has","minnesota","newport","news","population","prairie","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Newport News, Virginia and Eden Prairie, Minnesota, which has the greater population":"Newport News, Virginia has the larger population (181606 against 63206)."}}},
{"id":"n-998bdfe4","guard":[["hasAny",["larger","manor","nevada","population","racine","sunrise","wisconsin"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Sunrise Manor, Nevada or Racine, Wisconsin":"Sunrise Manor, Nevada has the larger population (192873 against 77931)."}}},
{"id":"n-9e22f62e","guard":[["hasAny",["burke","california","florin","larger","population","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Florin, California or Burke, Virginia":"Florin, California has the larger population (49486 against 42290)."}}},
{"id":"n-a28cba4a","guard":[["hasAny",["california","has","kansas","larger","olathe","population","richmond"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Olathe, Kansas or Richmond, California":"Olathe, Kansas has the larger population (132787 against 108303)."}}},
{"id":"n-a5786539","guard":[["hasAny",["between","braunfels","california","fontana","greater","has","new","population","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between New Braunfels, Texas and Fontana, California, which has the greater population":"Fontana, California has the larger population (205228 against 67097)."}}},
{"id":"n-a6a177af","guard":[["hasAny",["california","hanford","hill","larger","population","south","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: South Hill, Washington or Hanford, California":"South Hill, Washington has the larger population (55194 against 54912)."}}},
{"id":"n-ab519a83","guard":[["hasAny",["california","delano","larger","population","porterville"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Delano, California or Porterville, California":"Porterville, California has the larger population (58472 against 52538)."}}},
{"id":"n-ac0e012c","guard":[["hasAny",["california","fontana","larger","maryland","population","potomac"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Fontana, California or Potomac, Maryland":"Fontana, California has the larger population (205228 against 45882)."}}},
{"id":"n-b138579d","guard":[["hasAny",["baytown","between","california","greater","has","irvine","population","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Irvine, California and Baytown, Texas, which has the greater population":"Irvine, California has the larger population (246992 against 75310)."}}},
{"id":"n-b1e0fdab","guard":[["hasAny",["baytown","irvine"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Irvine, California and Baytown, Texas, which has the greater population":"Irvine, California has the larger population (246992 against 75310)."}}},
{"id":"n-b2388d4f","guard":[["hasAny",["bedford","between","greater","has","land","population","sugar","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Sugar Land, Texas and Bedford, Texas, which has the greater population":"Sugar Land, Texas has the larger population (85681 against 48864)."}}},
{"id":"n-b8ff9c1f","guard":[["hasAny",["beach","between","florida","gardens","greater","has","levittown","palm","pennsylvania","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Palm Beach Gardens, Florida and Levittown, Pennsylvania, which has the greater population":"Levittown, Pennsylvania has the larger population (52407 against 51865)."}}},
{"id":"n-b99857ed","guard":[["hasAny",["gary","has","indiana","jeffersonville","larger","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Gary, Indiana or Jeffersonville, Indiana":"Gary, Indiana has the larger population (77858 against 46415)."}}},
{"id":"n-b9aab6dc","guard":[["hasAny",["california","delaware","has","larger","lincoln","population","wilmington"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Wilmington, Delaware or Lincoln, California":"Wilmington, Delaware has the larger population (71502 against 45675)."}}},
{"id":"n-c4a12c78","guard":[["hasAny",["danbury","montebello"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Danbury, Connecticut or Montebello, California":"Danbury, Connecticut has the larger population (83890 against 63416)."}}},
{"id":"n-c4dd04f5","guard":[["hasAny",["arizona","bolingbrook","catalina","foothills","illinois","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Bolingbrook, Illinois or Catalina Foothills, Arizona":"Bolingbrook, Illinois has the larger population (74320 against 51329)."}}},
{"id":"n-c666634c","guard":[["hasAny",["between","burnsville","greater","has","idaho","minnesota","pocatello","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Burnsville, Minnesota and Pocatello, Idaho, which has the greater population":"Burnsville, Minnesota has the larger population (61158 against 54592)."}}},
{"id":"n-c7f4b267","guard":[["hasAny",["larger","mckinney","new","population","seneca","texas","west","york"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: West Seneca, New York or McKinney, Texas":"McKinney, Texas has the larger population (156821 against 45197)."}}},
{"id":"n-c80a2e7b","guard":[["hasAny",["creek","walnut"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Walnut Creek, California or Buffalo, New York":"Buffalo, New York has the larger population (258989 against 67568)."}}},
{"id":"n-c89007dd","guard":[["hasAny",["has","kansas","larger","manhattan","murray","population","utah"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Murray, Utah or Manhattan, Kansas":"Manhattan, Kansas has the larger population (55909 against 48834)."}}},
{"id":"n-ca340d5a","guard":[["hasAny",["between","colton","greater"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Pembroke Pines, Florida and Colton, California, which has the greater population":"Pembroke Pines, Florida has the larger population (164753 against 53856)."}}},
{"id":"n-cac57b25","guard":[["hasAny",["columbia","guaynabo","has","larger","missouri","population","puerto","rico"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Columbia, Missouri or Guaynabo, Puerto Rico":"Columbia, Missouri has the larger population (117165 against 71667)."}}},
{"id":"n-cc257d87","guard":[["hasAny",["alabama","has","larger","mckinney","population","texas","tuscaloosa"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, McKinney, Texas or Tuscaloosa, Alabama":"McKinney, Texas has the larger population (156821 against 96352)."}}},
{"id":"n-cc4c8dc5","guard":[["hasAny",["arkansas","fayetteville","has","larger","newport","news","population","virginia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Fayetteville, Arkansas or Newport News, Virginia":"Newport News, Virginia has the larger population (181606 against 80552)."}}},
{"id":"n-cd520ff3","guard":[["hasAny",["california","fontana","larger","maryland","population","potomac"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Fontana, California or Potomac, Maryland":"Fontana, California has the larger population (205228 against 45882)."}}},
{"id":"n-cd5a487e","guard":[["hasAny",["blaine","enid","has","larger","minnesota","oklahoma","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Blaine, Minnesota or Enid, Oklahoma":"Blaine, Minnesota has the larger population (61210 against 50891)."}}},
{"id":"n-cde04592","guard":[["hasAny",["alexandria","larger","levittown","pennsylvania","population","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Levittown, Pennsylvania or Alexandria, Virginia":"Alexandria, Virginia has the larger population (151473 against 52407)."}}},
{"id":"n-ce2e9697","guard":[["hasAny",["between","greater","guaynabo","has","new","population","puerto","rico","seneca","west","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Guaynabo, Puerto Rico and West Seneca, New York, which has the greater population":"Guaynabo, Puerto Rico has the larger population (71667 against 45197)."}}},
{"id":"n-ce46b686","guard":[["hasAny",["california","concord","larger","oklahoma","population","stillwater"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Stillwater, Oklahoma or Concord, California":"Concord, California has the larger population (126938 against 48104)."}}},
{"id":"n-cf9f7863","guard":[["hasAny",["atlanta","between","georgia","greater","has","michigan","population","troy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Atlanta, Georgia and Troy, Michigan, which has the greater population":"Atlanta, Georgia has the larger population (456378 against 82982)."}}},
{"id":"n-cfcc2ac1","guard":[["hasAny",["delaware","larger","lorain","ohio","population","wilmington"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Lorain, Ohio or Wilmington, Delaware":"Wilmington, Delaware has the larger population (71502 against 63714)."}}},
{"id":"n-d06991ec","guard":[["hasAny",["connecticut","danbury","irving","larger","population","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Irving, Texas or Danbury, Connecticut":"Irving, Texas has the larger population (232013 against 83890)."}}},
{"id":"n-d0b59b56","guard":[["hasAny",["arkansas","fayetteville","has","larger","newport","news","population","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Fayetteville, Arkansas or Newport News, Virginia":"Newport News, Virginia has the larger population (181606 against 80552)."}}},
{"id":"n-d29bfb9a","guard":[["hasAny",["arizona","bolingbrook","catalina","foothills","illinois","larger","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Bolingbrook, Illinois or Catalina Foothills, Arizona":"Bolingbrook, Illinois has the larger population (74320 against 51329)."}}},
{"id":"n-d32407c9","guard":[["hasAny",["between","dearborn","draper","greater","has","michigan","population","utah"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Dearborn, Michigan and Draper, Utah, which has the greater population":"Dearborn, Michigan has the larger population (95520 against 46399)."}}},
{"id":"n-d47c58d1","guard":[["hasAny",["between","greater","has","new","oklahoma","population","stillwater","tonawanda","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Tonawanda, New York and Stillwater, Oklahoma, which has the greater population":"Tonawanda, New York has the larger population (57844 against 48104)."}}},
{"id":"n-da9970ac","guard":[["hasAny",["california","city","keller","larger","population","texas","yuba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Keller, Texas or Yuba City, California":"Yuba City, California has the larger population (66147 against 44250)."}}},
{"id":"n-decb50b2","guard":[["hasAny",["between","greater","has","jordan","olympia","population","south","utah","washington"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between South Jordan, Utah and Olympia, Washington, which has the greater population":"South Jordan, Utah has the larger population (62751 against 49608)."}}},
{"id":"n-def626bb","guard":[["hasAny",["birmingham","lorain","ohio"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Birmingham, Alabama and Lorain, Ohio, which has the greater population":"Birmingham, Alabama has the larger population (212424 against 63714)."}}},
{"id":"n-e24d3072","guard":[["hasAny",["arkansas","fayetteville","larger","louis","minnesota","park","population","st"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: St. Louis Park, Minnesota or Fayetteville, Arkansas":"Fayetteville, Arkansas has the larger population (80552 against 47486)."}}},
{"id":"n-e4359cb1","guard":[["hasAny",["falls","great","has","larger","montana","population","spokane","washington"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Great Falls, Montana or Spokane, Washington":"Spokane, Washington has the larger population (212078 against 59479)."}}},
{"id":"n-e5d63726","guard":[["hasAny",["delaware","larger","lorain","ohio","population","wilmington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Lorain, Ohio or Wilmington, Delaware":"Wilmington, Delaware has the larger population (71502 against 63714)."}}},
{"id":"n-e5de5120","guard":[["hasAny",["burnie","glen","larger","maryland","middletown","ohio","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: Middletown, Ohio or Glen Burnie, Maryland":"Glen Burnie, Maryland has the larger population (69060 against 48527)."}}},
{"id":"n-e6543540","guard":[["hasAny",["bellingham","greenwood","indiana","larger","population","washington"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Bellingham, Washington or Greenwood, Indiana":"Bellingham, Washington has the larger population (84462 against 54564)."}}},
{"id":"n-e6fd7b65","guard":[["hasAny",["atlanta","georgia","greenwood","has","indiana","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Greenwood, Indiana or Atlanta, Georgia":"Atlanta, Georgia has the larger population (456378 against 54564)."}}},
{"id":"n-e81b17bd","guard":[["hasAny",["alabama","bellingham","between","greater","has","population","tuscaloosa","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Tuscaloosa, Alabama and Bellingham, Washington, which has the greater population":"Tuscaloosa, Alabama has the larger population (96352 against 84462)."}}},
{"id":"n-e8419876","guard":[["hasAny",["blaine","enid","has","larger","minnesota","oklahoma","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Blaine, Minnesota or Enid, Oklahoma":"Blaine, Minnesota has the larger population (61210 against 50891)."}}},
{"id":"n-e89c925f","guard":[["hasAny",["alabama","arizona","decatur","has","larger","phoenix","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Phoenix, Arizona or Decatur, Alabama":"Phoenix, Arizona has the larger population (1555324 against 55419)."}}},
{"id":"n-ea28cdf5","guard":[["hasAny",["between","florida","greater","has","miramar","population","spokane","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Spokane, Washington and Miramar, Florida, which has the greater population":"Spokane, Washington has the larger population (212078 against 133741)."}}},
{"id":"n-ebd62d5b","guard":[["hasAny",["bedford","between","greater","has","land","population","sugar","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Sugar Land, Texas and Bedford, Texas, which has the greater population":"Sugar Land, Texas has the larger population (85681 against 48864)."}}},
{"id":"n-ecb90e05","guard":[["hasAny",["braunfels","fontana","new"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between New Braunfels, Texas and Fontana, California, which has the greater population":"Fontana, California has the larger population (205228 against 67097)."}}},
{"id":"n-ef2e6293","guard":[["hasAny",["between","burnsville","greater","has","idaho","minnesota","pocatello","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Burnsville, Minnesota and Pocatello, Idaho, which has the greater population":"Burnsville, Minnesota has the larger population (61158 against 54592)."}}},
{"id":"n-efc2cd79","guard":[["hasAny",["allentown","deltona","florida","has","larger","pennsylvania","population"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Allentown, Pennsylvania or Deltona, Florida":"Allentown, Pennsylvania has the larger population (119624 against 87387)."}}},
{"id":"n-f08176bf","guard":[["hasAny",["between","colorado","greater","has","manor","nevada","population","sunrise","westminster"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Westminster, Colorado and Sunrise Manor, Nevada, which has the greater population":"Sunrise Manor, Nevada has the larger population (192873 against 111770)."}}},
{"id":"n-f243bc97","guard":[["hasAny",["ankeny","iowa","larger","olympia","population","washington"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Olympia, Washington or Ankeny, Iowa":"Ankeny, Iowa has the larger population (53413 against 49608)."}}},
{"id":"n-f3172c66","guard":[["hasAny",["between","california","cordova","greater","has","population","rancho","richmond"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Richmond, California and Rancho Cordova, California, which has the greater population":"Richmond, California has the larger population (108303 against 69482)."}}},
{"id":"n-f7b8a3b0","guard":[["hasAny",["blaine","city","larger","minnesota","population","utah","valley","west"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: West Valley City, Utah or Blaine, Minnesota":"West Valley City, Utah has the larger population (134609 against 61210)."}}},
{"id":"n-f7c514b3","guard":[["hasAny",["california","clarksville","larger","linda","population","tennessee","yorba"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Yorba Linda, California or Clarksville, Tennessee":"Clarksville, Tennessee has the larger population (146281 against 67362)."}}},
{"id":"n-f7f3c88a","guard":[["hasAny",["blaine","city","larger","minnesota","population","utah","valley","west"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose population is larger: West Valley City, Utah or Blaine, Minnesota":"West Valley City, Utah has the larger population (134609 against 61210)."}}},
{"id":"n-f810448d","guard":[["hasAny",["burnsville","has","larger","maryland","minnesota","population","potomac"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Potomac, Maryland or Burnsville, Minnesota":"Burnsville, Minnesota has the larger population (61158 against 45882)."}}},
{"id":"n-f86a2894","guard":[["hasAny",["gary","has","indiana","jeffersonville","larger","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger population, Gary, Indiana or Jeffersonville, Indiana":"Gary, Indiana has the larger population (77858 against 46415)."}}},
{"id":"n-f9545c22","guard":[["hasAny",["has","massachusetts","pittsfield"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger population, Yuba City, California or Pittsfield, Massachusetts":"Yuba City, California has the larger population (66147 against 43632)."}}},
{"id":"n-fcdc339c","guard":[["hasAny",["between","california","creek","greater","has","montebello","population","walnut"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Montebello, California and Walnut Creek, California, which has the greater population":"Walnut Creek, California has the larger population (67568 against 63416)."}}},
{"id":"n-fd028e85","guard":[["hasAny",["between","connecticut","greater","hartford","has","hill","population","south","washington","west"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between West Hartford, Connecticut and South Hill, Washington, which has the greater population":"West Hartford, Connecticut has the larger population (63187 against 55194)."}}},
{"id":"n-fe0c510c","guard":[["hasAny",["atlanta","between","georgia","greater","has","michigan","population","troy"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Atlanta, Georgia and Troy, Michigan, which has the greater population":"Atlanta, Georgia has the larger population (456378 against 82982)."}}},
{"id":"n-fe7d18a0","guard":[["hasAny",["connecticut","danbury","irving","larger","population","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose population is larger: Irving, Texas or Danbury, Connecticut":"Irving, Texas has the larger population (232013 against 83890)."}}},
{"id":"n-3b694ef9","guard":[["hasAny",["longest","longest one","longest word","manhattan","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (55909 against 48834)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0a83b2f9","guard":[["hasAny",["item number","manhattan","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," population (55909 against 48834)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1bd3c6db","guard":[["hasAny",["columbia","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," population (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3e3be2b3","guard":[["hasAny",["apex","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the larger ",{"slot":2}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-47d59b5b","guard":[["hasAny",["item number","longest","longest one","longest word","manhattan","nth","position"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," (55909 against 48834)."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-671b8e8c","guard":[["hasAny",["columbia","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the larger ",{"slot":2}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c681ede5","guard":[["hasAny",["element","item number","levittown","longest","longest one","longest word","nth","position"]],["has","between"]],"pyramid":["render.template",{"lit":["Levittown, ",{"slot":0}," ",{"slot":1}," the larger ",{"slot":2}," (52407 against 51865)."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-0b55feb4","guard":[["hasAny",["item number","longest","longest one","longest word","manhattan","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Manhattan, Kansas ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," (55909 against 48834)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1939aacb","guard":[["hasAny",["apex","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," population (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2ff7baa0","guard":[["hasAny",["item number","longest","longest one","longest word","nth","olathe","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":["Olathe, Kansas ",{"slot":0}," the ",{"slot":1}," ",{"slot":2}," (132787 against 108303)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-39bb18ea","guard":[["hasAny",["item number","longest","longest one","longest word","nth","olathe","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas ",{"slot":1}," the larger ",{"slot":2}," (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-467c3cd7","guard":[["hasAny",["columbia","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["aggregate.shortest",["sense.list"]],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6037146b","guard":[["hasAny",["delano","longest","longest one","longest word","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (58472 against 52538)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9fd2afcd","guard":[["hasAny",["concord","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (126938 against 48104)."]},["aggregate.shortest",["sense.list"]],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a4e0dbe3","guard":[["hasAny",["columbia","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", Missouri has the ",{"slot":1}," ",{"slot":2}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-020d9b5d","guard":[["hasAny",["item number","longest","longest one","longest word","manhattan","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-08ac95d4","guard":[["hasAny",["columbia","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-163265e2","guard":[["hasAny",["alexandria","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (151473 against 52407)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-16a31f9d","guard":[["hasAny",["item number","longest","longest one","longest word","manhattan","nth","position"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["sense.lastWord"],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-19591328","guard":[["hasAny",["apex","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", Iowa has the ",{"slot":1}," ",{"slot":2}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2bbf7061","guard":[["hasAny",["item number","longest","longest one","longest word","nth","olathe","position"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas has the ",{"slot":1}," ",{"slot":2}," (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a12b5eed","guard":[["hasAny",["bedford","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (93220 against 48864)."]},["aggregate.shortest",["sense.list"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-bdde4478","guard":[["hasAny",["item number","longest","longest one","longest word","manhattan","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["sense.subject"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c6a2f6b9","guard":[["hasAny",["carrollton","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (129266 against 82982)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c87ebc4e","guard":[["hasAny",["item number","nth","olathe","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas ",{"slot":1}," the ",{"slot":2}," population (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d1d5ec34","guard":[["hasAny",["columbia","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d86a3b66","guard":[["hasAny",["concord","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (126938 against 48104)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-dc9ba3fd","guard":[["hasAny",["delaware","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (71502 against 63714)."]},["aggregate.longest",["sense.list"]],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-deb298ca","guard":[["hasAny",["item number","longest","longest one","longest word","manhattan","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e3723a31","guard":[["hasAny",["brookhaven","longest","longest one","longest word","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (53165 against 51567)."]},["aggregate.shortest",["sense.list"]],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f376d4f1","guard":[["hasAny",["delano","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (58472 against 52538)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-07b6fc78","guard":[["hasAny",["all caps","capital letters","capitals","columbia","element","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.upper",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-09875585","guard":[["hasAny",["delano","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (58472 against 52538)."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.list"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-09967cb9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","longest","longest one","longest word","manhattan","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["transform.title",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0ecee66f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","columbia","element","item number","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-0fbaebe3","guard":[["hasAny",["bedford","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (93220 against 48864)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-13d7725a","guard":[["hasAny",["all caps","capital letters","capitals","item number","longest","longest one","longest word","manhattan","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["transform.upper",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-183ca685","guard":[["hasAny",["item number","longest","longest one","longest word","lower case","lowercase","manhattan","nth","position","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["transform.lower",["sense.subject"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-19c7631b","guard":[["hasAny",["item number","manhattan","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1c1569b5","guard":[["hasAny",["apex","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-24214b1d","guard":[["hasAny",["element","item number","mckinney","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (156821 against 45197)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-366f03e5","guard":[["hasAny",["columbia","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-377717c2","guard":[["hasAny",["delaware","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (71502 against 63714)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3a983670","guard":[["hasAny",["allentown","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (119624 against 53856)."]},["transform.nthStr",["sense.list"],{"lit":3}],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-47013385","guard":[["hasAny",["invert case","item number","longest","longest one","longest word","manhattan","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-4c296d45","guard":[["hasAny",["columbia","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4dcd2c46","guard":[["hasAny",["columbia","element","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["transform.swapCase",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-5d768ddc","guard":[["hasAny",["alabama","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (84100 against 51206)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-7787a20d","guard":[["hasAny",["element","fontana","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (205228 against 45882)."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-812377d9","guard":[["hasAny",["item number","longest","longest one","longest word","lower case","lowercase","manhattan","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["sense.lastWord"],["transform.lower",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-82bc222e","guard":[["hasAny",["item number","longest","longest one","longest word","manhattan","nth","position"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-85f2d929","guard":[["hasAny",["apex","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8dd68eef","guard":[["hasAny",["brookhaven","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (53165 against 51567)."]},["transform.nthStr",["sense.list"],{"lit":3}],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8dfa557a","guard":[["hasAny",["clarksville","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (146281 against 67362)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8e5b4158","guard":[["hasAny",["columbia","element","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-8ec595f9","guard":[["hasAny",["all caps","capital letters","capitals","item number","longest","longest one","longest word","manhattan","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["sense.lastWord"],["transform.upper",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-98ff4786","guard":[["hasAny",["bolingbrook","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (74320 against 51329)."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.list"],{"lit":2}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9ebb3009","guard":[["hasAny",["alabama","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (84100 against 51206)."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.list"]],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a058b0f6","guard":[["hasAny",["element","idaho","item number","nth","position"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (1555324 against 54592)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b01c2769","guard":[["hasAny",["bellingham","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (84462 against 54564)."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-bf84b21a","guard":[["hasAny",["all caps","capital letters","capitals","columbia","element","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["transform.upper",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c2f208c5","guard":[["hasAny",["invert case","item number","longest","longest one","longest word","manhattan","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["transform.swapCase",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-cebda2d5","guard":[["hasAny",["element","fontana","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (205228 against 45882)."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.list"]],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ceef5781","guard":[["hasAny",["element","fayetteville","item number","nth","position"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (80552 against 47486)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d1acb093","guard":[["hasAny",["columbia","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d46a6613","guard":[["hasAny",["columbia","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-df4554c7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","columbia","element","item number","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["transform.title",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e5986523","guard":[["hasAny",["item number","longest","longest one","longest word","lower case","lowercase","manhattan","nth","position","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-ed450b75","guard":[["hasAny",["carrollton","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (129266 against 82982)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f47f503f","guard":[["hasAny",["item number","manhattan","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-facd5abf","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","longest","longest one","longest word","manhattan","nth","position","title case"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-fce054ae","guard":[["hasAny",["apex","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ff919307","guard":[["hasAny",["columbia","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-0732c55f","guard":[["hasAny",["apex","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.lower",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-09e8e4bd","guard":[["hasAny",["columbia","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-0d7b36df","guard":[["hasAny",["element","fontana","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (205228 against 45882)."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.list"],{"lit":2}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-1379586e","guard":[["hasAny",["apex","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-1567adab","guard":[["hasAny",["columbia","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-15db5e28","guard":[["hasAny",["bellingham","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (84462 against 54564)."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.list"],{"lit":2}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-17ea4246","guard":[["hasAny",["item number","longest","longest one","longest word","nth","olathe","position"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1b29e9eb","guard":[["hasAny",["item number","longest","longest one","longest word","nth","olathe","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-2a528028","guard":[["hasAny",["columbia","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2ff1e15a","guard":[["hasAny",["apex","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-3055d6ea","guard":[["hasAny",["apex","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-40108835","guard":[["hasAny",["draper","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (48834 against 46399)."]},["transform.nthStr",["sense.list"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-44d72708","guard":[["hasAny",["apex","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4dae9a87","guard":[["hasAny",["bedford","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (93220 against 48864)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.list"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4e08d91b","guard":[["hasAny",["baytown","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["South ",{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (95219 against 75310)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.list"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4eb34e79","guard":[["hasAny",["bellingham","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (84462 against 54564)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-657e8654","guard":[["hasAny",["element","fayetteville","item number","longest","longest one","longest word","nth","position"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (80552 against 47486)."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.list"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-679f3442","guard":[["hasAny",["conway","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (133741 against 64184)."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.list"],{"lit":2}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-6b342fcb","guard":[["hasAny",["each word","item number","longest","longest one","longest word","manhattan","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7dc33f45","guard":[["hasAny",["apex","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-825381e6","guard":[["hasAny",["ankeny","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (53413 against 49608)."]},["transform.nthStr",["sense.list"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-82604d7c","guard":[["hasAny",["bridgeport","element","item number","longest","longest one","longest word","nth","position"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (147022 against 49976)."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8945e3f1","guard":[["hasAny",["eden","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Prairie, ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (63206 against 59479)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8aba92e7","guard":[["hasAny",["clarksville","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (146281 against 67362)."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.list"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8ef441e9","guard":[["hasAny",["alabama","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (84100 against 51206)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9265ede4","guard":[["hasAny",["danbury","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (232013 against 83890)."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-92cfbf87","guard":[["hasAny",["each word","item number","longest","longest one","longest word","manhattan","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["render.and",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9353c772","guard":[["hasAny",["burke","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (49486 against 42290)."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-98aaed89","guard":[["hasAny",["angeles","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Angeles, ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (3918872 against 77858)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9e5529e3","guard":[["hasAny",["conway","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (133741 against 64184)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a550405b","guard":[["hasAny",["item number","longest","longest one","longest word","nth","olathe","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a57d4006","guard":[["hasAny",["alexandria","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (151473 against 52407)."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.list"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a7a80485","guard":[["hasAny",["bridgeport","element","item number","longest","longest one","longest word","nth","position"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (147022 against 49976)."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a934dbb6","guard":[["hasAny",["each word","item number","longest","longest one","longest word","manhattan","nth","position","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["render.list",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b1bb8c9d","guard":[["hasAny",["each word","item number","longest","longest one","longest word","manhattan","nth","position","split into words"]]],"pyramid":["render.template",{"lit":["Manhattan, ",{"slot":0}," ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (55909 against 48834)."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b39dc13d","guard":[["hasAny",["all caps","apex","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b3cd0372","guard":[["hasAny",["bolingbrook","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (74320 against 51329)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b548127a","guard":[["hasAny",["element","item number","keller","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," City, ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (66147 against 44250)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.list"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c70189f4","guard":[["hasAny",["allentown","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (119624 against 53856)."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.list"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ca630a34","guard":[["hasAny",["element","fontana","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (205228 against 45882)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d208fea7","guard":[["hasAny",["all caps","apex","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.upper",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-de1a7d33","guard":[["hasAny",["columbia","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e2fa1b36","guard":[["hasAny",["columbia","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e646ae54","guard":[["hasAny",["concord","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (126938 against 48104)."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.list"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-e6689652","guard":[["hasAny",["apex","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-ed8c8815","guard":[["hasAny",["columbia","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (117165 against 69482)."]},["transform.nthStr",["sense.list"],{"lit":3}],["transform.nthStr",["sense.list"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f372e069","guard":[["hasAny",["danbury","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (232013 against 83890)."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f7e46b43","guard":[["hasAny",["alabama","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (84100 against 51206)."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.list"],{"lit":2}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-febcdccf","guard":[["hasAny",["brookhaven","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (53165 against 51567)."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.list"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0357cf97","guard":[["hasAny",["apex","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-04e53fdc","guard":[["hasAny",["burnie","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Burnie, ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (69060 against 48527)."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.list"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0a5004f8","guard":[["hasAny",["element","item number","mckinney","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (156821 against 45197)."]},["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.list"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-10ffac63","guard":[["hasAny",["alabama","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (84100 against 51206)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-139229b5","guard":[["hasAny",["bellingham","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (84462 against 54564)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-14d015df","guard":[["hasAny",["invert case","item number","longest","longest one","longest word","nth","olathe","position","swap case","toggle case"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1cf548ac","guard":[["hasAny",["delaware","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (71502 against 63714)."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.list"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2708dcff","guard":[["hasAny",["element","first n","fontana","item number","nth","position","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (205228 against 45882)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-2e67e63f","guard":[["hasAny",["element","idaho","item number","nth","position"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (1555324 against 54592)."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.list"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-34e8b801","guard":[["hasAny",["apex","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-3674b830","guard":[["hasAny",["burke","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (49486 against 42290)."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-3a3d4ce0","guard":[["hasAny",["conway","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (133741 against 64184)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-4c8cb0ea","guard":[["hasAny",["carrollton","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (129266 against 82982)."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.list"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-5895cebf","guard":[["hasAny",["bridgeport","element","first n","item number","longest","longest one","longest word","nth","position","take","top"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (147022 against 49976)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-71508219","guard":[["hasAny",["conway","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (133741 against 64184)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-76008d43","guard":[["hasAny",["element","first n","fontana","item number","nth","position","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (205228 against 45882)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-8bb82d71","guard":[["hasAny",["all caps","capital letters","capitals","item number","longest","longest one","longest word","nth","olathe","position","upper case","uppercase"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-8eb736e3","guard":[["hasAny",["burke","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (49486 against 42290)."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-94db71c1","guard":[["hasAny",["danbury","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (232013 against 83890)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-977fd330","guard":[["hasAny",["ankeny","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (53413 against 49608)."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.list"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-9b470ee3","guard":[["hasAny",["apex","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a52624a9","guard":[["hasAny",["bellingham","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (84462 against 54564)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-a8690f40","guard":[["hasAny",["apex","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b1174959","guard":[["hasAny",["danbury","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (232013 against 83890)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-b7c7f4bf","guard":[["hasAny",["apex","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-b98198f2","guard":[["hasAny",["bolingbrook","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (74320 against 51329)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-bfb98b80","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","longest","longest one","longest word","nth","olathe","position","title case"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c03d6563","guard":[["hasAny",["alabama","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (84100 against 51206)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-cb637b57","guard":[["hasAny",["bridgeport","element","first n","item number","longest","longest one","longest word","nth","position","take","top"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (147022 against 49976)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-ceb090e8","guard":[["hasAny",["danbury","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (232013 against 83890)."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d13d228a","guard":[["hasAny",["item number","longest","longest one","longest word","nth","olathe","position"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d36d0696","guard":[["hasAny",["bolingbrook","element","first n","item number","nth","position","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (74320 against 51329)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-d50ae695","guard":[["hasAny",["item number","longest","longest one","longest word","lower case","lowercase","nth","olathe","position","small letters"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d71e27cd","guard":[["hasAny",["item number","nth","olathe","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dacff5ff","guard":[["hasAny",["item number","nth","olathe","position","shortest","shortest one","shortest word"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f4edc225","guard":[["hasAny",["bridgeport","element","item number","nth","position"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (147022 against 49976)."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-f87c504a","guard":[["hasAny",["apex","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (68357 against 43893)."]},["transform.nthStr",["sense.list"],{"lit":3}],["transform.nthStr",["sense.list"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-0acf4ef4","guard":[["hasAny",["each word","item number","longest","longest one","longest word","nth","olathe","position","split into words"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-55f05276","guard":[["hasAny",["each word","item number","longest","longest one","longest word","nth","olathe","position","split into words"]],["has","larger"]],"pyramid":["render.template",{"lit":[{"slot":0},", Kansas ",{"slot":1}," the ",{"slot":2}," ",{"slot":3}," (132787 against 108303)."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9ec62421","guard":[["hasAny",["burke","element","first n","item number","nth","position","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (49486 against 42290)."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null},
{"id":"n-c65dfe1f","guard":[["hasAny",["burke","element","first n","item number","nth","position","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0},", ",{"slot":1}," has the ",{"slot":2}," ",{"slot":3}," (49486 against 42290)."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":2}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which has the larger population, Wilmington, Delaware or Lincoln, California","expect":{"contains":["Wilmington, Delaware"],"notContains":["Lincoln, California"],"notRefusal":true}},{"q":"whose population is larger: Hoover, Alabama or Lenexa, Kansas","expect":{"contains":["Hoover, Alabama"],"notContains":["Lenexa, Kansas"],"notRefusal":true}},{"q":"between Layton, Utah and West Valley City, Utah, which has the greater population","expect":{"contains":["West Valley City, Utah"],"notContains":["Layton, Utah"],"notRefusal":true}},{"q":"whose population is larger: Rancho Cordova, California or Columbia, Missouri","expect":{"contains":["Columbia, Missouri"],"notContains":["Rancho Cordova, California"],"notRefusal":true}},{"q":"whose population is larger: Baytown, Texas or South Gate, California","expect":{"contains":["South Gate, California"],"notContains":["Baytown, Texas"],"notRefusal":true}},{"q":"which has the larger population, Concord, California or Pembroke Pines, Florida","expect":{"contains":["Pembroke Pines, Florida"],"notContains":["Concord, California"],"notRefusal":true}},{"q":"which has the larger population, Buffalo, New York or Aliso Viejo, California","expect":{"contains":["Buffalo, New York"],"notContains":["Aliso Viejo, California"],"notRefusal":true}},{"q":"whose population is larger: Florin, California or Burke, Virginia","expect":{"contains":["Florin, California"],"notContains":["Burke, Virginia"],"notRefusal":true}},{"q":"between Centreville, Virginia and Irving, Texas, which has the greater population","expect":{"contains":["Irving, Texas"],"notContains":["Centreville, Virginia"],"notRefusal":true}},{"q":"between Birmingham, Alabama and Lorain, Ohio, which has the greater population","expect":{"contains":["Birmingham, Alabama"],"notContains":["Lorain, Ohio"],"notRefusal":true}},{"q":"between Coon Rapids, Minnesota and Bridgeport, Connecticut, which has the greater population","expect":{"contains":["Bridgeport, Connecticut"],"notContains":["Coon Rapids, Minnesota"],"notRefusal":true}},{"q":"whose population is larger: Colton, California or Allentown, Pennsylvania","expect":{"contains":["Allentown, Pennsylvania"],"notContains":["Colton, California"],"notRefusal":true}},{"q":"between Tuscaloosa, Alabama and Bellingham, Washington, which has the greater population","expect":{"contains":["Tuscaloosa, Alabama"],"notContains":["Bellingham, Washington"],"notRefusal":true}},{"q":"between Burnsville, Minnesota and Pocatello, Idaho, which has the greater population","expect":{"contains":["Burnsville, Minnesota"],"notContains":["Pocatello, Idaho"],"notRefusal":true}},{"q":"which has the larger population, Catalina Foothills, Arizona or New Braunfels, Texas","expect":{"contains":["New Braunfels, Texas"],"notContains":["Catalina Foothills, Arizona"],"notRefusal":true}},{"q":"whose population is larger: Irving, Texas or Danbury, Connecticut","expect":{"contains":["Irving, Texas"],"notContains":["Danbury, Connecticut"],"notRefusal":true}},{"q":"between Atlanta, Georgia and Troy, Michigan, which has the greater population","expect":{"contains":["Atlanta, Georgia"],"notContains":["Troy, Michigan"],"notRefusal":true}},{"q":"between Tonawanda, New York and Stillwater, Oklahoma, which has the greater population","expect":{"contains":["Tonawanda, New York"],"notContains":["Stillwater, Oklahoma"],"notRefusal":true}},{"q":"which has the larger population, Hanford, California or Coon Rapids, Minnesota","expect":{"contains":["Coon Rapids, Minnesota"],"notContains":["Hanford, California"],"notRefusal":true}},{"q":"between Pittsfield, Massachusetts and Los Angeles, California, which has the greater population","expect":{"contains":["Los Angeles, California"],"notContains":["Pittsfield, Massachusetts"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
