// crypto-name-ticker-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"crypto-name-ticker-neo-g6","class":"crypto-name-ticker","generation":6,"lane":"neo","grownFrom":["give the symbol of the coin Cryptex","which ticker does Legends of Aria trade under","what is the ticker of the cryptocurrency LiveGreen Coin","what is the ticker of the cryptocurrency Chiiper Chain","what is the ticker of the cryptocurrency DZD","what is the ticker of the cryptocurrency Internet Computer","which ticker does Kento trade under","give the symbol of the coin Bidcommerce","which ticker does MAKE trade under","which ticker does Düber trade under","give the symbol of the coin KeeperDAO","which ticker does Page trade under","what is the ticker of the cryptocurrency Metavault Trade","which ticker does CryptoTwitter trade under","what is the ticker of the cryptocurrency MazaCoin","what is the ticker of the cryptocurrency RAWG","which ticker does RChain trade under","what is the ticker of the cryptocurrency Syntropy","which ticker does healthbank trade under","give the symbol of the coin Baby Pepe Floki"],"version":1});

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
{"id":"n-ecd9444e","guard":[["hasAny",["coin","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Cryptex":"CTX","which ticker does Legends of Aria trade under":"ARIA","what is the ticker of the cryptocurrency LiveGreen Coin":"LGC","what is the ticker of the cryptocurrency Chiiper Chain":"CHII","what is the ticker of the cryptocurrency DZD":"DZDD","what is the ticker of the cryptocurrency Internet Computer":"ICP","which ticker does Kento trade under":"KNTO","give the symbol of the coin Bidcommerce":"BIDCOM","which ticker does MAKE trade under":"MAKE","which ticker does Düber trade under":"DBR","give the symbol of the coin KeeperDAO":"ROOK","which ticker does Page trade under":"PAGE","what is the ticker of the cryptocurrency Metavault Trade":"MVX","which ticker does CryptoTwitter trade under":"CT","what is the ticker of the cryptocurrency MazaCoin":"MZC","what is the ticker of the cryptocurrency RAWG":"RAWG","which ticker does RChain trade under":"RHOC","what is the ticker of the cryptocurrency Syntropy":"NOIA","which ticker does healthbank trade under":"HBE","give the symbol of the coin Baby Pepe Floki":"BPEPEF","give the symbol of the coin Hyper Pay":"HPY","give the symbol of the coin DiveWallet Token":"DWT","give the symbol of the coin PoSToken":"POS","give the symbol of the coin Connectchain":"CCTN","give the symbol of the coin Token IN":"TIN","which ticker does Revain trade under":"REV","give the symbol of the coin BITONE":"BIO","give the symbol of the coin Konnect":"KCT","what is the ticker of the cryptocurrency SkyMap":"SKYM","which ticker does TribeOne trade under":"HAKA","give the symbol of the coin Triaconta":"TRIA","which ticker does Froggies Token trade under":"FRGST","what is the ticker of the cryptocurrency Digix DAO":"DGD","which ticker does eBit trade under":"EBIT","which ticker does Optimism trade under":"OP","which ticker does Mars Token trade under":"OMT","what is the ticker of the cryptocurrency Crown Coin":"CRW","give the symbol of the coin Bertinity":"BRTX","give the symbol of the coin LINQ":"LINQ","give the symbol of the coin The Etho Protocol":"ETHO","what is the ticker of the cryptocurrency SXP":"SXP","give the symbol of the coin MotaCoin":"MOTA","what is the ticker of the cryptocurrency xxxNifty":"NSFW","which ticker does Loyalty Labs trade under":"LOYAL","give the symbol of the coin BitVegan":"VEG","give the symbol of the coin Wolf of Wall Street":"WOLFOF","which ticker does iCommunity trade under":"ICOM","what is the ticker of the cryptocurrency Gacrux NFT":"RUX","what is the ticker of the cryptocurrency DaxxCoin":"DAXX","what is the ticker of the cryptocurrency BrainCoin":"BRAIN","what is the ticker of the cryptocurrency Arcana Network":"XAR","which ticker does LessFnGas trade under":"LESSF","give the symbol of the coin DuckDuckCoin":"DUCKD","give the symbol of the coin PointPay":"PXP","what is the ticker of the cryptocurrency WCAPES":"WCA","what is the ticker of the cryptocurrency ANS Crypto Coin":"ANS","what is the ticker of the cryptocurrency STP Network":"STPT","give the symbol of the coin Crogecoin":"CROGE","give the symbol of the coin UCX":"UCX","which ticker does CatCoin Token trade under":"CATS","give the symbol of the coin USX Quantum":"USX","give the symbol of the coin Eauric":"EAURIC","which ticker does Gigzi trade under":"GZB","what is the ticker of the cryptocurrency 3xcalibur":"XCAL","what is the ticker of the cryptocurrency VirtualMining Coin":"VMC","what is the ticker of the cryptocurrency Marnotaur":"TAUR","what is the ticker of the cryptocurrency Grizzly Honey":"GHNY","give the symbol of the coin Playermon":"PYM","what is the ticker of the cryptocurrency Recharge":"RCG","which ticker does Bizkey trade under":"BZKY","which ticker does Influ Token trade under":"INTO","give the symbol of the coin eToro Polish Zloty":"POLNX","give the symbol of the coin YVS.Finance":"YVS","which ticker does Digitalcoin trade under":"DGC","which ticker does Masa trade under":"MASA","which ticker does Hoppy trade under":"HOPPY","which ticker does Farad trade under":"FRD","which ticker does MocktailSwap trade under":"MOK","what is the ticker of the cryptocurrency KingXChain":"KXC","what is the ticker of the cryptocurrency KOK Coin":"KOK","give the symbol of the coin CZUSD":"CZUSD","what is the ticker of the cryptocurrency Roketsin":"RSIN","give the symbol of the coin RealChain":"RCT","give the symbol of the coin Empower":"MPWR","give the symbol of the coin Ezillion":"EZI","what is the ticker of the cryptocurrency Moon Rabbit":"AAA","what is the ticker of the cryptocurrency Wrapped Huobi Token":"WHT","which ticker does Mantle Staked Ether trade under":"METH","which ticker does Monavale trade under":"MONAV","what is the ticker of the cryptocurrency Honorarium":"HRM","which ticker does BRCP Token trade under":"BRCP","what is the ticker of the cryptocurrency Crazy Internet Coin":"CIC","what is the ticker of the cryptocurrency LeisureMeta":"LM","give the symbol of the coin wShiba":"WSHIB","what is the ticker of the cryptocurrency Drawshop Kingdom Reverse":"DRAW","which ticker does Coinsuper Ecosystem Network trade under":"CEN","which ticker does Galeon trade under":"GALEON","which ticker does BrightCoin trade under":"BRIC","give the symbol of the coin Gastro Advisor Token":"FORK","which ticker does Plus Coin trade under":"NPLC"}}},
{"id":"n-2d33250b","guard":[["hasAny",["braincoin","chain","coin","dao","daxxcoin","drawshop","dzd","gacrux","grizzly","honorarium","internet","kingxchain","leisuremeta","marnotaur","mazacoin","moon","network","rawg","recharge","roketsin","skymap","sxp","syntropy","token","trade","wcapes","xxxnifty"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Cryptex":"CTX","which ticker does Legends of Aria trade under":"ARIA","what is the ticker of the cryptocurrency LiveGreen Coin":"LGC","what is the ticker of the cryptocurrency Chiiper Chain":"CHII","what is the ticker of the cryptocurrency DZD":"DZDD","what is the ticker of the cryptocurrency Internet Computer":"ICP","which ticker does Kento trade under":"KNTO","give the symbol of the coin Bidcommerce":"BIDCOM","which ticker does MAKE trade under":"MAKE","which ticker does Düber trade under":"DBR","give the symbol of the coin KeeperDAO":"ROOK","which ticker does Page trade under":"PAGE","what is the ticker of the cryptocurrency Metavault Trade":"MVX","which ticker does CryptoTwitter trade under":"CT","what is the ticker of the cryptocurrency MazaCoin":"MZC","what is the ticker of the cryptocurrency RAWG":"RAWG","which ticker does RChain trade under":"RHOC","what is the ticker of the cryptocurrency Syntropy":"NOIA","which ticker does healthbank trade under":"HBE","give the symbol of the coin Baby Pepe Floki":"BPEPEF","give the symbol of the coin Hyper Pay":"HPY","give the symbol of the coin DiveWallet Token":"DWT","give the symbol of the coin PoSToken":"POS","give the symbol of the coin Connectchain":"CCTN","give the symbol of the coin Token IN":"TIN","which ticker does Revain trade under":"REV","give the symbol of the coin BITONE":"BIO","give the symbol of the coin Konnect":"KCT","what is the ticker of the cryptocurrency SkyMap":"SKYM","which ticker does TribeOne trade under":"HAKA","give the symbol of the coin Triaconta":"TRIA","which ticker does Froggies Token trade under":"FRGST","what is the ticker of the cryptocurrency Digix DAO":"DGD","which ticker does eBit trade under":"EBIT","which ticker does Optimism trade under":"OP","which ticker does Mars Token trade under":"OMT","what is the ticker of the cryptocurrency Crown Coin":"CRW","give the symbol of the coin Bertinity":"BRTX","give the symbol of the coin LINQ":"LINQ","give the symbol of the coin The Etho Protocol":"ETHO","what is the ticker of the cryptocurrency SXP":"SXP","give the symbol of the coin MotaCoin":"MOTA","what is the ticker of the cryptocurrency xxxNifty":"NSFW","which ticker does Loyalty Labs trade under":"LOYAL","give the symbol of the coin BitVegan":"VEG","give the symbol of the coin Wolf of Wall Street":"WOLFOF","which ticker does iCommunity trade under":"ICOM","what is the ticker of the cryptocurrency Gacrux NFT":"RUX","what is the ticker of the cryptocurrency DaxxCoin":"DAXX","what is the ticker of the cryptocurrency BrainCoin":"BRAIN","what is the ticker of the cryptocurrency Arcana Network":"XAR","which ticker does LessFnGas trade under":"LESSF","give the symbol of the coin DuckDuckCoin":"DUCKD","give the symbol of the coin PointPay":"PXP","what is the ticker of the cryptocurrency WCAPES":"WCA","what is the ticker of the cryptocurrency ANS Crypto Coin":"ANS","what is the ticker of the cryptocurrency STP Network":"STPT","give the symbol of the coin Crogecoin":"CROGE","give the symbol of the coin UCX":"UCX","which ticker does CatCoin Token trade under":"CATS","give the symbol of the coin USX Quantum":"USX","give the symbol of the coin Eauric":"EAURIC","which ticker does Gigzi trade under":"GZB","what is the ticker of the cryptocurrency VirtualMining Coin":"VMC","what is the ticker of the cryptocurrency Marnotaur":"TAUR","what is the ticker of the cryptocurrency Grizzly Honey":"GHNY","give the symbol of the coin Playermon":"PYM","what is the ticker of the cryptocurrency Recharge":"RCG","which ticker does Bizkey trade under":"BZKY","which ticker does Influ Token trade under":"INTO","give the symbol of the coin eToro Polish Zloty":"POLNX","give the symbol of the coin YVS.Finance":"YVS","which ticker does Digitalcoin trade under":"DGC","which ticker does Masa trade under":"MASA","which ticker does Hoppy trade under":"HOPPY","which ticker does Farad trade under":"FRD","which ticker does MocktailSwap trade under":"MOK","what is the ticker of the cryptocurrency KingXChain":"KXC","what is the ticker of the cryptocurrency KOK Coin":"KOK","give the symbol of the coin CZUSD":"CZUSD","what is the ticker of the cryptocurrency Roketsin":"RSIN","give the symbol of the coin RealChain":"RCT","give the symbol of the coin Empower":"MPWR","give the symbol of the coin Ezillion":"EZI","what is the ticker of the cryptocurrency Moon Rabbit":"AAA","what is the ticker of the cryptocurrency Wrapped Huobi Token":"WHT","which ticker does Mantle Staked Ether trade under":"METH","which ticker does Monavale trade under":"MONAV","what is the ticker of the cryptocurrency Honorarium":"HRM","which ticker does BRCP Token trade under":"BRCP","what is the ticker of the cryptocurrency Crazy Internet Coin":"CIC","what is the ticker of the cryptocurrency LeisureMeta":"LM","give the symbol of the coin wShiba":"WSHIB","what is the ticker of the cryptocurrency Drawshop Kingdom Reverse":"DRAW","which ticker does Coinsuper Ecosystem Network trade under":"CEN","which ticker does Galeon trade under":"GALEON","which ticker does BrightCoin trade under":"BRIC","give the symbol of the coin Gastro Advisor Token":"FORK","which ticker does Plus Coin trade under":"NPLC"}}},
{"id":"n-36e85075","guard":[["hasAny",["coin","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the coin Cryptex":"CTX","Aria trade under":"ARIA","the cryptocurrency LiveGreen Coin":"LGC","the cryptocurrency Chiiper Chain":"CHII","the cryptocurrency DZD":"DZDD","the cryptocurrency Internet Computer":"ICP","the coin Bidcommerce":"BIDCOM","the coin KeeperDAO":"ROOK","the cryptocurrency Metavault Trade":"MVX","the cryptocurrency MazaCoin":"MZC","the cryptocurrency RAWG":"RAWG","the cryptocurrency Syntropy":"NOIA","the coin Baby Pepe Floki":"BPEPEF","the coin Hyper Pay":"HPY","the coin DiveWallet Token":"DWT","the coin PoSToken":"POS","the coin Connectchain":"CCTN","the coin Token IN":"TIN","the coin BITONE":"BIO","the coin Konnect":"KCT","the cryptocurrency SkyMap":"SKYM","the coin Triaconta":"TRIA","the cryptocurrency Digix DAO":"DGD","the cryptocurrency Crown Coin":"CRW","the coin Bertinity":"BRTX","the coin LINQ":"LINQ","the coin The Etho Protocol":"ETHO","the cryptocurrency SXP":"SXP","the coin MotaCoin":"MOTA","the cryptocurrency xxxNifty":"NSFW","the coin BitVegan":"VEG","the coin Wolf of Wall Street":"WOLFOF","the cryptocurrency Gacrux NFT":"RUX","the cryptocurrency DaxxCoin":"DAXX","the cryptocurrency BrainCoin":"BRAIN","the cryptocurrency Arcana Network":"XAR","the coin DuckDuckCoin":"DUCKD","the coin PointPay":"PXP","the cryptocurrency WCAPES":"WCA","the cryptocurrency ANS Crypto Coin":"ANS","the cryptocurrency STP Network":"STPT","the coin Crogecoin":"CROGE","the coin UCX":"UCX","the coin USX Quantum":"USX","the coin Eauric":"EAURIC","the cryptocurrency 3xcalibur":"XCAL","the cryptocurrency VirtualMining Coin":"VMC","the cryptocurrency Marnotaur":"TAUR","the cryptocurrency Grizzly Honey":"GHNY","the coin Playermon":"PYM","the cryptocurrency Recharge":"RCG","the coin eToro Polish Zloty":"POLNX","the coin YVS.Finance":"YVS","the cryptocurrency KingXChain":"KXC","the cryptocurrency KOK Coin":"KOK","the coin CZUSD":"CZUSD","the cryptocurrency Roketsin":"RSIN","the coin RealChain":"RCT","the coin Empower":"MPWR","the coin Ezillion":"EZI","the cryptocurrency Moon Rabbit":"AAA","the cryptocurrency Wrapped Huobi Token":"WHT","the cryptocurrency Honorarium":"HRM","the cryptocurrency Crazy Internet Coin":"CIC","the cryptocurrency LeisureMeta":"LM","the coin wShiba":"WSHIB","the cryptocurrency Drawshop Kingdom Reverse":"DRAW","the coin Gastro Advisor Token":"FORK"}}},
{"id":"n-19a09dc3","guard":[["has","ticker"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"ticker"}]]],"mem":{"table":{"does Legends of Aria trade under":"ARIA","of the cryptocurrency LiveGreen Coin":"LGC","of the cryptocurrency Chiiper Chain":"CHII","of the cryptocurrency DZD":"DZDD","of the cryptocurrency Internet Computer":"ICP","does Kento trade under":"KNTO","does MAKE trade under":"MAKE","does Düber trade under":"DBR","does Page trade under":"PAGE","of the cryptocurrency Metavault Trade":"MVX","does CryptoTwitter trade under":"CT","of the cryptocurrency MazaCoin":"MZC","of the cryptocurrency RAWG":"RAWG","does RChain trade under":"RHOC","of the cryptocurrency Syntropy":"NOIA","does healthbank trade under":"HBE","does Revain trade under":"REV","of the cryptocurrency SkyMap":"SKYM","does TribeOne trade under":"HAKA","does Froggies Token trade under":"FRGST","of the cryptocurrency Digix DAO":"DGD","does eBit trade under":"EBIT","does Optimism trade under":"OP","does Mars Token trade under":"OMT","of the cryptocurrency Crown Coin":"CRW","of the cryptocurrency SXP":"SXP","of the cryptocurrency xxxNifty":"NSFW","does Loyalty Labs trade under":"LOYAL","does iCommunity trade under":"ICOM","of the cryptocurrency Gacrux NFT":"RUX","of the cryptocurrency DaxxCoin":"DAXX","of the cryptocurrency BrainCoin":"BRAIN","of the cryptocurrency Arcana Network":"XAR","does LessFnGas trade under":"LESSF","of the cryptocurrency WCAPES":"WCA","of the cryptocurrency ANS Crypto Coin":"ANS","of the cryptocurrency STP Network":"STPT","does CatCoin Token trade under":"CATS","does Gigzi trade under":"GZB","of the cryptocurrency 3xcalibur":"XCAL","of the cryptocurrency VirtualMining Coin":"VMC","of the cryptocurrency Marnotaur":"TAUR","of the cryptocurrency Grizzly Honey":"GHNY","of the cryptocurrency Recharge":"RCG","does Bizkey trade under":"BZKY","does Influ Token trade under":"INTO","does Digitalcoin trade under":"DGC","does Masa trade under":"MASA","does Hoppy trade under":"HOPPY","does Farad trade under":"FRD","does MocktailSwap trade under":"MOK","of the cryptocurrency KingXChain":"KXC","of the cryptocurrency KOK Coin":"KOK","of the cryptocurrency Roketsin":"RSIN","of the cryptocurrency Moon Rabbit":"AAA","of the cryptocurrency Wrapped Huobi Token":"WHT","does Mantle Staked Ether trade under":"METH","does Monavale trade under":"MONAV","of the cryptocurrency Honorarium":"HRM","does BRCP Token trade under":"BRCP","of the cryptocurrency Crazy Internet Coin":"CIC","of the cryptocurrency LeisureMeta":"LM","of the cryptocurrency Drawshop Kingdom Reverse":"DRAW","does Coinsuper Ecosystem Network trade under":"CEN","does Galeon trade under":"GALEON","does BrightCoin trade under":"BRIC","does Plus Coin trade under":"NPLC"}}},
{"id":"n-f9d8dd51","guard":[["has","cryptocurrency"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ticker of the cryptocurrency LiveGreen Coin":"LGC","the ticker of the cryptocurrency Chiiper Chain":"CHII","the ticker of the cryptocurrency DZD":"DZDD","the ticker of the cryptocurrency Internet Computer":"ICP","the ticker of the cryptocurrency Metavault Trade":"MVX","the ticker of the cryptocurrency MazaCoin":"MZC","the ticker of the cryptocurrency RAWG":"RAWG","the ticker of the cryptocurrency Syntropy":"NOIA","the ticker of the cryptocurrency SkyMap":"SKYM","the ticker of the cryptocurrency Digix DAO":"DGD","the ticker of the cryptocurrency Crown Coin":"CRW","the ticker of the cryptocurrency SXP":"SXP","the ticker of the cryptocurrency xxxNifty":"NSFW","the ticker of the cryptocurrency Gacrux NFT":"RUX","the ticker of the cryptocurrency DaxxCoin":"DAXX","the ticker of the cryptocurrency BrainCoin":"BRAIN","the ticker of the cryptocurrency Arcana Network":"XAR","the ticker of the cryptocurrency WCAPES":"WCA","the ticker of the cryptocurrency ANS Crypto Coin":"ANS","the ticker of the cryptocurrency STP Network":"STPT","the ticker of the cryptocurrency 3xcalibur":"XCAL","the ticker of the cryptocurrency VirtualMining Coin":"VMC","the ticker of the cryptocurrency Marnotaur":"TAUR","the ticker of the cryptocurrency Grizzly Honey":"GHNY","the ticker of the cryptocurrency Recharge":"RCG","the ticker of the cryptocurrency KingXChain":"KXC","the ticker of the cryptocurrency KOK Coin":"KOK","the ticker of the cryptocurrency Roketsin":"RSIN","the ticker of the cryptocurrency Moon Rabbit":"AAA","the ticker of the cryptocurrency Wrapped Huobi Token":"WHT","the ticker of the cryptocurrency Honorarium":"HRM","the ticker of the cryptocurrency Crazy Internet Coin":"CIC","the ticker of the cryptocurrency LeisureMeta":"LM","the ticker of the cryptocurrency Drawshop Kingdom Reverse":"DRAW"}}},
{"id":"n-599efcf7","guard":[["hasAny",["ans","aria","backwards","ebit","galeon","hoppy","item number","make","masa","nth","page","position","reverse order","reversed"]],["has","ticker"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":3}]],"mem":null},
{"id":"n-e40b76db","guard":[["hasAny",["ans","aria","backwards","ebit","galeon","hoppy","item number","make","masa","nth","page","position","reverse order","reversed"]],["has","ticker"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":3}]],"mem":null},
{"id":"n-400d4bb6","guard":[["hasAny",["brcp","ebit","galeon","hoppy","item number","make","masa","nth","page","position"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-7c0aecf6","guard":[["hasAny",["brcp","ebit","galeon","hoppy","item number","make","masa","nth","page","position"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-11d50eb3","guard":[["hasAny",["brcp","ebit","galeon","hoppy","item number","make","masa","nth","page","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b820288f","guard":[["hasAny",["brcp","ebit","galeon","hoppy","item number","make","masa","nth","page","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-6bc71c14","guard":[["hasAny",["backwards","czusd","eauric","item number","linq","nth","position","rawg","reverse order","reversed","sxp","ucx"]]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":1}]],"mem":null},
{"id":"n-b8ad5cd8","guard":[["hasAny",["backwards","capitalise","capitalize","capitalize each word","czusd","eauric","linq","mirror","rawg","reversed","spell backwards","sxp","title case","ucx"]]],"pyramid":["render.str",["transform.reverse",["transform.title",["transform.reverse",["sense.lastWord"]]]]],"mem":null},
{"id":"n-f9f11b37","guard":[["hasAny",["backwards","czusd","delete","eauric","linq","mirror","rawg","remove","reversed","spell backwards","strip out","sxp","ucx","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.reverse",["sense.lastWord"]]]],"mem":null},
{"id":"n-1a0826fb","guard":[["hasAny",["backwards","czusd","eauric","from position","items from to","linq","rawg","reverse order","reversed","slice","sxp","ucx"]]],"pyramid":["render.list",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-27aac865","guard":[["hasAny",["backwards","czusd","eauric","from position","items from to","linq","rawg","reverse order","reversed","slice","sxp","ucx"]]],"pyramid":["render.list",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]]],"mem":null},
{"id":"n-33480e02","guard":[["hasAny",["backwards","czusd","eauric","from position","items from to","linq","rawg","reverse order","reversed","slice","sxp","ucx"]]],"pyramid":["render.lines",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]]],"mem":null},
{"id":"n-3bfa01ed","guard":[["hasAny",["backwards","czusd","eauric","from position","items from to","linq","rawg","reverse order","reversed","slice","sxp","ucx"]]],"pyramid":["render.list",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]]],"mem":null},
{"id":"n-5602b065","guard":[["hasAny",["backwards","czusd","eauric","linq","rawg","reverse order","reversed","separate by","split","split by","sxp","ucx"]]],"pyramid":["render.list",["transform.reverseStrs",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-62dbf9b9","guard":[["hasAny",["backwards","czusd","eauric","from position","items from to","linq","rawg","reverse order","reversed","slice","sxp","ucx"]]],"pyramid":["render.and",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]]],"mem":null},
{"id":"n-6a8d9c7b","guard":[["hasAny",["backwards","czusd","eauric","from position","items from to","linq","rawg","reverse order","reversed","slice","sxp","ucx"]]],"pyramid":["render.and",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]]],"mem":null},
{"id":"n-7c3d075b","guard":[["hasAny",["backwards","czusd","eauric","from position","items from to","linq","rawg","reverse order","reversed","slice","sxp","ucx"]]],"pyramid":["render.lines",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]]],"mem":null},
{"id":"n-829c58e2","guard":[["hasAny",["backwards","czusd","eauric","from position","items from to","linq","rawg","reverse order","reversed","slice","sxp","ucx"]]],"pyramid":["render.lines",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-98d0e673","guard":[["hasAny",["backwards","czusd","eauric","linq","rawg","reverse order","reversed","separate by","split","split by","sxp","ucx"]]],"pyramid":["render.and",["transform.reverseStrs",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-d029f8e7","guard":[["hasAny",["backwards","czusd","eauric","from position","items from to","linq","rawg","reverse order","reversed","slice","sxp","ucx"]]],"pyramid":["render.and",["transform.reverseStrs",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-fbfdc2e0","guard":[["hasAny",["backwards","czusd","eauric","linq","rawg","reverse order","reversed","separate by","split","split by","sxp","ucx"]]],"pyramid":["render.lines",["transform.reverseStrs",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-0c3af848","guard":[["hasAny",["czusd","eauric","linq","rawg","sxp","ucx"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["sense.lastWord"]],"mem":null},
{"id":"n-15db1327","guard":[["hasAny",["capitalise","capitalize","capitalize each word","czusd","eauric","linq","rawg","sxp","title case","ucx"]]],"pyramid":["render.str",["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-20c5ec37","guard":[["hasAny",["czusd","eauric","invert case","linq","rawg","swap case","sxp","toggle case","ucx"]]],"pyramid":["render.str",["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2709d562","guard":[["hasAny",["czusd","each word","eauric","linq","rawg","split into words","sxp","ucx"]]],"pyramid":["render.list",["transform.words",["sense.lastWord"]]],"mem":null},
{"id":"n-c7dc6767","guard":[["hasAny",["czusd","eauric","linq","lower case","lowercase","rawg","small letters","sxp","ucx"]]],"pyramid":["render.str",["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ec22c56d","guard":[["hasAny",["all caps","capital letters","capitals","czusd","eauric","linq","rawg","sxp","ucx","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-010d3ab3","guard":[["hasAny",["czusd","eauric","item number","linq","nth","position","rawg","sxp","ucx"]]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["sense.wordCount"]]],"mem":null},
{"id":"n-6b79428e","guard":[["hasAny",["czusd","eauric","invert case","linq","rawg","swap case","sxp","toggle case","ucx"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7b2e474d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","czusd","eauric","linq","rawg","sxp","title case","ucx"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-89b2035d","guard":[["hasAny",["czusd","eauric","linq","lower case","lowercase","rawg","small letters","sxp","ucx"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c485e3cf","guard":[["hasAny",["all caps","capital letters","capitals","czusd","eauric","linq","rawg","sxp","ucx","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e71fd175","guard":[["hasAny",["capitalise","capitalize","capitalize each word","czusd","eauric","invert case","linq","rawg","swap case","sxp","title case","toggle case","ucx"]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-f6a2109b","guard":[["hasAny",["czusd","eauric","linq","normalise","normalize","rawg","simplify the text","sxp","ucx"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-01f17429","guard":[["hasAny",["czusd","eauric","from position","items from to","linq","rawg","slice","sxp","ucx"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-0ce85817","guard":[["hasAny",["brcp","ebit","first n","hoppy","make","masa","page","shortest","shortest one","shortest word","take"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-22c3ea04","guard":[["hasAny",["czusd","eauric","linq","rawg","separate by","split","split by","sxp","ucx"]]],"pyramid":["render.list",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-2e81278f","guard":[["hasAny",["czusd","eauric","from position","items from to","linq","rawg","slice","sxp","ucx"]]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]],"mem":null},
{"id":"n-3bdd1812","guard":[["hasAny",["czusd","eauric","from position","items from to","linq","rawg","slice","sxp","ucx"]]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-4a9cf487","guard":[["hasAny",["czusd","eauric","linq","rawg","separate by","split","split by","sxp","ucx"]]],"pyramid":["render.lines",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-4f4c0c5f","guard":[["hasAny",["czusd","each word","eauric","linq","rawg","split into words","sxp","ucx"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-56d04051","guard":[["hasAny",["czusd","eauric","from position","items from to","linq","rawg","slice","sxp","ucx"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]],"mem":null},
{"id":"n-63e96596","guard":[["hasAny",["czusd","eauric","from position","items from to","linq","rawg","slice","sxp","ucx"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]],"mem":null},
{"id":"n-6be2ebf3","guard":[["hasAny",["czusd","eauric","linq","rawg","separate by","split","split by","sxp","ucx"]]],"pyramid":["render.and",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-6e858fd9","guard":[["hasAny",["czusd","each word","eauric","linq","rawg","split into words","sxp","ucx"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-708bdd7b","guard":[["hasAny",["czusd","eauric","from position","items from to","linq","rawg","slice","sxp","ucx"]]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]],"mem":null},
{"id":"n-88bc0f94","guard":[["hasAny",["czusd","eauric","linq","normalise","normalize","rawg","simplify the text","sxp","ucx"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-c92440aa","guard":[["hasAny",["czusd","eauric","from position","items from to","linq","rawg","slice","sxp","ucx"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]],"mem":null},
{"id":"n-dc8ae434","guard":[["hasAny",["czusd","eauric","from position","items from to","linq","rawg","slice","sxp","ucx"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-e2802e9e","guard":[["hasAny",["czusd","delete","eauric","linq","rawg","remove","strip out","sxp","ucx","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-e5f18f26","guard":[["hasAny",["czusd","delete","eauric","linq","rawg","remove","strip out","sxp","ucx","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-f234ae69","guard":[["hasAny",["czusd","eauric","from position","items from to","linq","rawg","slice","sxp","ucx"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]],"mem":null},
{"id":"n-16ad5dd8","guard":[["hasAny",["backwards","brcp","ebit","make","masa","page","reverse order","reversed","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-1a8b5f9b","guard":[["hasAny",["backwards","brcp","each word","ebit","make","masa","page","reverse order","reversed","shortest","shortest one","shortest word","split into words"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["transform.words",["sense.text"]]]]],"mem":null},
{"id":"n-de34f091","guard":[["hasAny",["backwards","brcp","ebit","make","masa","page","reverse order","reversed","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["aggregate.shortest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-6e4abe30","guard":[["hasAny",["a to z","alphabetical","alphabetize","backwards","ebit","make","masa","page","reverse order","reversed","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["transform.sortStrs",["sense.words"]]]]],"mem":null},
{"id":"n-183f4415","guard":[["hasAny",["backwards","etho","item number","kok","nth","position","quantum","reverse order","reversed"]],["has","coin"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-e0196ed7","guard":[["hasAny",["backwards","etho","item number","kok","nth","position","quantum","reverse order","reversed"]],["has","coin"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":2}]],"mem":null},
{"id":"n-e370a8db","guard":[["hasAny",["brcp","farad","no vowels","remove vowels","shortest","shortest one","shortest word","sxp","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-5c00008b","guard":[["hasAny",["backwards","eauric","galeon","longest","longest one","longest word","reverse order","reversed"]]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-c977e6a4","guard":[["hasAny",["backwards","each word","eauric","galeon","longest","longest one","longest word","reverse order","reversed","split into words"]]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["transform.words",["sense.text"]]]]],"mem":null},
{"id":"n-cb2c034f","guard":[["hasAny",["backwards","eauric","galeon","longest","longest one","longest word","reverse order","reversed"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["aggregate.longest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-76203825","guard":[["hasAny",["empower","no vowels","remove vowels","sxp","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-1c6696d0","guard":[["hasAny",["a to z","alphabetical","alphabetize","eauric","galeon","longest","longest one","longest word"]]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["sense.words"]]]],"mem":null},
{"id":"n-2a987fab","guard":[["hasAny",["empower","invert case","no vowels","remove vowels","swap case","sxp","toggle case","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.swapCase",["sense.lastWord"]]]],"mem":null},
{"id":"n-3acb5584","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","letters in order","linq","sort the letters","title case","ucx"]]],"pyramid":["render.str",["transform.sortLetters",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-5ad760a7","guard":[["hasAny",["empower","no vowels","remove vowels","sxp","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-8dc86679","guard":[["hasAny",["all caps","capital letters","capitals","empower","no vowels","remove vowels","sxp","upper case","uppercase","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.upper",["sense.lastWord"]]]],"mem":null},
{"id":"n-978e4236","guard":[["hasAny",["capitalise","capitalize","capitalize each word","empower","no vowels","remove vowels","sxp","title case","without vowels"]]],"pyramid":["render.str",["transform.title",["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-d4bf9493","guard":[["hasAny",["empower","lower case","lowercase","no vowels","remove vowels","small letters","sxp","without vowels"]]],"pyramid":["render.str",["transform.lower",["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-da1734e6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","empower","no vowels","remove vowels","sxp","title case","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-df070af1","guard":[["hasAny",["alphabetize the letters","ans","hoppy","letters in order","shortest","shortest one","shortest word","sort the letters"]]],"pyramid":["render.str",["transform.sortLetters",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-94a19387","guard":[["hasAny",["czusd","each word","eauric","longest","longest one","longest word","split into words","words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-aa6b37d4","guard":[["hasAny",["delete","rawg","remove","strip out","sxp","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-df97a543","guard":[["hasAny",["delete","rawg","remove","strip out","sxp","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"ticker"}]]],"mem":null},
{"id":"n-f8cbda80","guard":[["hasAny",["each word","galeon","hoppy","longest","longest one","longest word","split into words","words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"ticker"}]]]],"mem":null},
{"id":"n-9880fa21","guard":[["hasAny",["backwards","kok","mirror","reverse order","reversed","shortest","shortest one","shortest word","spell backwards"]]],"pyramid":["render.str",["transform.reverse",["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]]],"mem":null},
{"id":"n-7980f5dd","guard":[["hasAny",["backwards","item number","kok","mirror","nth","position","reverse order","reversed","spell backwards"]]],"pyramid":["render.str",["transform.reverse",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":2}]]],"mem":null},
{"id":"n-9d62a95a","guard":[["hasAny",["backwards","item number","kok","mirror","nth","position","reverse order","reversed","spell backwards"]]],"pyramid":["render.str",["transform.reverse",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":2}]]],"mem":null},
{"id":"n-cdcb46d1","guard":[["hasAny",["backwards","kok","mirror","reversed","shortest","shortest one","shortest word","spell backwards"]]],"pyramid":["render.str",["transform.reverse",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-0e59f441","guard":[["hasAny",["backwards","capitalise","capitalize","capitalize each word","kok","mirror","reversed","shortest","shortest one","shortest word","spell backwards","title case"]]],"pyramid":["render.str",["transform.reverse",["transform.title",["aggregate.shortest",["sense.content"]]]]],"mem":null},
{"id":"n-4f0d97b9","guard":[["hasAny",["a to z","alphabetical","alphabetize","backwards","kok","mirror","reversed","shortest","shortest one","shortest word","spell backwards"]]],"pyramid":["render.str",["transform.reverse",["aggregate.shortest",["transform.sortStrs",["sense.content"]]]]],"mem":null},
{"id":"n-7d9958f8","guard":[["hasAny",["backwards","brcp","item number","nth","position","reverse order","reversed"]]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":4}]],"mem":null},
{"id":"n-88676fd6","guard":[["hasAny",["backwards","brcp","item number","nth","position","reverse order","reversed"]]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":4}]],"mem":null},
{"id":"n-9262daed","guard":[["hasAny",["backwards","invert case","kok","mirror","reversed","shortest","shortest one","shortest word","spell backwards","swap case","toggle case"]]],"pyramid":["render.str",["transform.reverse",["transform.swapCase",["aggregate.shortest",["sense.content"]]]]],"mem":null},
{"id":"n-a375c1e7","guard":[["hasAny",["backwards","item number","kok","mirror","nth","position","reversed","spell backwards"]]],"pyramid":["render.str",["transform.reverse",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-03670c98","guard":[["hasAny",["bitvegan","coin","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin BitVegan":"VEG"}}},
{"id":"n-0790f93d","guard":[["hasAny",["galeon","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Galeon trade under":"GALEON"}}},
{"id":"n-08338dbd","guard":[["hasAny",["catcoin","ticker","token","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does CatCoin Token trade under":"CATS"}}},
{"id":"n-09147858","guard":[["has","rawg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency RAWG":"RAWG"}}},
{"id":"n-0a49b002","guard":[["hasAny",["cryptocurrency","sxp","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency SXP":"SXP"}}},
{"id":"n-0b8fc0f4","guard":[["hasAny",["3xcalibur","cryptocurrency","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency 3xcalibur":"XCAL"}}},
{"id":"n-0c9984e3","guard":[["hasAny",["coin","crown","cryptocurrency","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Crown Coin":"CRW"}}},
{"id":"n-0d54f203","guard":[["hasAny",["coin","realchain","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin RealChain":"RCT"}}},
{"id":"n-0d7d6770","guard":[["hasAny",["healthbank","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does healthbank trade under":"HBE"}}},
{"id":"n-11425c72","guard":[["has","influ"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Influ Token trade under":"INTO"}}},
{"id":"n-121a269d","guard":[["hasAny",["coin","konnect","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Konnect":"KCT"}}},
{"id":"n-134b6aea","guard":[["has","galeon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Galeon trade under":"GALEON"}}},
{"id":"n-13a104a7","guard":[["has","virtualmining"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency VirtualMining Coin":"VMC"}}},
{"id":"n-15e8d73b","guard":[["has","wcapes"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency WCAPES":"WCA"}}},
{"id":"n-164a1d73","guard":[["hasAny",["coin","plus","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Plus Coin trade under":"NPLC"}}},
{"id":"n-1bfa8f3b","guard":[["hasAny",["gigzi","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Gigzi trade under":"GZB"}}},
{"id":"n-1c04cb35","guard":[["has","gigzi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Gigzi trade under":"GZB"}}},
{"id":"n-1d0f992b","guard":[["hasAny",["ether","mantle","staked","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Mantle Staked Ether trade under":"METH"}}},
{"id":"n-1f5018d6","guard":[["has","crazy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Crazy Internet Coin":"CIC"}}},
{"id":"n-20d5e2c8","guard":[["hasAny",["braincoin","cryptocurrency","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency BrainCoin":"BRAIN"}}},
{"id":"n-214142b4","guard":[["hasAny",["coin","postoken","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin PoSToken":"POS"}}},
{"id":"n-21b8523a","guard":[["has","triaconta"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Triaconta":"TRIA"}}},
{"id":"n-21eb8f53","guard":[["hasAny",["baby","coin","floki","pepe","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Baby Pepe Floki":"BPEPEF"}}},
{"id":"n-22123b56","guard":[["hasAny",["coin","quantum","symbol","usx"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin USX Quantum":"USX"}}},
{"id":"n-228f589c","guard":[["hasAny",["cryptocurrency","drawshop","kingdom","reverse","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Drawshop Kingdom Reverse":"DRAW"}}},
{"id":"n-240694db","guard":[["has","ezillion"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Ezillion":"EZI"}}},
{"id":"n-26d12f86","guard":[["hasAny",["revain","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Revain trade under":"REV"}}},
{"id":"n-28ddfd52","guard":[["hasAny",["cryptocurrency","mazacoin","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency MazaCoin":"MZC"}}},
{"id":"n-2a1f96c3","guard":[["hasAny",["coin","crogecoin","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Crogecoin":"CROGE"}}},
{"id":"n-2beb7ee1","guard":[["hasAny",["computer","cryptocurrency","internet","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Internet Computer":"ICP"}}},
{"id":"n-2dab6ce6","guard":[["hasAny",["brcp","ticker","token","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does BRCP Token trade under":"BRCP"}}},
{"id":"n-2dffbdcc","guard":[["has","healthbank"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does healthbank trade under":"HBE"}}},
{"id":"n-3056bf5c","guard":[["has","yvsfinance"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin YVS.Finance":"YVS"}}},
{"id":"n-30f15848","guard":[["hasAny",["coin","symbol","token"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Token IN":"TIN"}}},
{"id":"n-32c96581","guard":[["hasAny",["mocktailswap","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does MocktailSwap trade under":"MOK"}}},
{"id":"n-3333edc6","guard":[["hasAny",["cryptocurrency","gacrux","nft","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Gacrux NFT":"RUX"}}},
{"id":"n-34423191","guard":[["hasAny",["cryptotwitter","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does CryptoTwitter trade under":"CT"}}},
{"id":"n-35fb60ab","guard":[["has","optimism"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Optimism trade under":"OP"}}},
{"id":"n-36a6daed","guard":[["hasAny",["cryptocurrency","grizzly","honey","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Grizzly Honey":"GHNY"}}},
{"id":"n-37cf2356","guard":[["has","rchain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does RChain trade under":"RHOC"}}},
{"id":"n-3b69826a","guard":[["has","digitalcoin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Digitalcoin trade under":"DGC"}}},
{"id":"n-3c61640b","guard":[["hasAny",["coin","etoro","polish","symbol","zloty"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin eToro Polish Zloty":"POLNX"}}},
{"id":"n-3f74e2b3","guard":[["hasAny",["farad","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Farad trade under":"FRD"}}},
{"id":"n-3fb26844","guard":[["hasAny",["coin","symbol","wshiba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin wShiba":"WSHIB"}}},
{"id":"n-3fdf92e6","guard":[["hasAny",["coin","motacoin","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin MotaCoin":"MOTA"}}},
{"id":"n-40484a2f","guard":[["hasAny",["mars","ticker","token","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Mars Token trade under":"OMT"}}},
{"id":"n-4076cec1","guard":[["hasAny",["coin","plus"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Plus Coin trade under":"NPLC"}}},
{"id":"n-413b43ea","guard":[["has","mars"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Mars Token trade under":"OMT"}}},
{"id":"n-416658f2","guard":[["hasAny",["labs","loyalty"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Loyalty Labs trade under":"LOYAL"}}},
{"id":"n-471460a6","guard":[["hasAny",["cryptocurrency","grizzly","honey","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Grizzly Honey":"GHNY"}}},
{"id":"n-47ca402c","guard":[["hasAny",["coin","hyper","pay","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Hyper Pay":"HPY"}}},
{"id":"n-4990c78c","guard":[["has","make"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does MAKE trade under":"MAKE"}}},
{"id":"n-49a4cef4","guard":[["hasAny",["masa","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Masa trade under":"MASA"}}},
{"id":"n-4ad49bc7","guard":[["hasAny",["froggies","ticker","token","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Froggies Token trade under":"FRGST"}}},
{"id":"n-4b321107","guard":[["has","honorarium"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Honorarium":"HRM"}}},
{"id":"n-4c44c05d","guard":[["hasAny",["cryptocurrency","ticker","wcapes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency WCAPES":"WCA"}}},
{"id":"n-4da73d08","guard":[["hasAny",["monavale","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Monavale trade under":"MONAV"}}},
{"id":"n-4f408f53","guard":[["hasAny",["düber","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Düber trade under":"DBR"}}},
{"id":"n-50f1a581","guard":[["hasAny",["cryptocurrency","network","stp","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency STP Network":"STPT"}}},
{"id":"n-5136ef4e","guard":[["hasAny",["labs","loyalty","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Loyalty Labs trade under":"LOYAL"}}},
{"id":"n-5157dc86","guard":[["hasAny",["coin","cryptocurrency","ticker","virtualmining"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency VirtualMining Coin":"VMC"}}},
{"id":"n-5478f580","guard":[["has","xxxnifty"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency xxxNifty":"NSFW"}}},
{"id":"n-5546c126","guard":[["hasAny",["coin","etho","protocol","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin The Etho Protocol":"ETHO"}}},
{"id":"n-5626d624","guard":[["hasAny",["cryptocurrency","dao","digix","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Digix DAO":"DGD"}}},
{"id":"n-569392a7","guard":[["hasAny",["cryptocurrency","daxxcoin","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency DaxxCoin":"DAXX"}}},
{"id":"n-5d24c871","guard":[["hasAny",["cryptocurrency","leisuremeta","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency LeisureMeta":"LM"}}},
{"id":"n-60a85aae","guard":[["hasAny",["coin","duckduckcoin","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin DuckDuckCoin":"DUCKD"}}},
{"id":"n-64e7eeee","guard":[["has","bertinity"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Bertinity":"BRTX"}}},
{"id":"n-65259b62","guard":[["hasAny",["cryptocurrency","skymap","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency SkyMap":"SKYM"}}},
{"id":"n-66b5a673","guard":[["hasAny",["bizkey","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Bizkey trade under":"BZKY"}}},
{"id":"n-6c395120","guard":[["has","divewallet"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin DiveWallet Token":"DWT"}}},
{"id":"n-6c969d6f","guard":[["hasAny",["cryptocurrency","drawshop","kingdom","reverse","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Drawshop Kingdom Reverse":"DRAW"}}},
{"id":"n-6e2c617b","guard":[["hasAny",["coin","ezillion","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Ezillion":"EZI"}}},
{"id":"n-6e34de3d","guard":[["hasAny",["cryptocurrency","ticker","xxxnifty"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency xxxNifty":"NSFW"}}},
{"id":"n-701c1f7b","guard":[["has","czusd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin CZUSD":"CZUSD"}}},
{"id":"n-714d411f","guard":[["has","realchain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin RealChain":"RCT"}}},
{"id":"n-71747263","guard":[["hasAny",["influ","ticker","token","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Influ Token trade under":"INTO"}}},
{"id":"n-718781cd","guard":[["hasAny",["coin","etho","protocol","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin The Etho Protocol":"ETHO"}}},
{"id":"n-72b24b35","guard":[["hasAny",["coin","cryptex","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Cryptex":"CTX"}}},
{"id":"n-7365bac4","guard":[["has","page"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Page trade under":"PAGE"}}},
{"id":"n-75615a26","guard":[["hasAny",["coin","empower","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Empower":"MPWR"}}},
{"id":"n-7585a08a","guard":[["hasAny",["chain","chiiper","cryptocurrency","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Chiiper Chain":"CHII"}}},
{"id":"n-76042055","guard":[["hasAny",["lessfngas","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does LessFnGas trade under":"LESSF"}}},
{"id":"n-77a09c68","guard":[["has","bizkey"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Bizkey trade under":"BZKY"}}},
{"id":"n-78a1c435","guard":[["has","revain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Revain trade under":"REV"}}},
{"id":"n-78f14512","guard":[["hasAny",["coin","connectchain","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Connectchain":"CCTN"}}},
{"id":"n-7a9d3423","guard":[["hasAny",["cryptocurrency","huobi","ticker","token","wrapped"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Wrapped Huobi Token":"WHT"}}},
{"id":"n-7ac10971","guard":[["has","roketsin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Roketsin":"RSIN"}}},
{"id":"n-7ad41489","guard":[["has","düber"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Düber trade under":"DBR"}}},
{"id":"n-7c3e850a","guard":[["hasAny",["coin","crazy","cryptocurrency","internet","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Crazy Internet Coin":"CIC"}}},
{"id":"n-7d974f23","guard":[["hasAny",["arcana","cryptocurrency","network","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Arcana Network":"XAR"}}},
{"id":"n-80f093b0","guard":[["has","bitvegan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin BitVegan":"VEG"}}},
{"id":"n-81a8802b","guard":[["has","kok"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency KOK Coin":"KOK"}}},
{"id":"n-83348d74","guard":[["has","farad"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Farad trade under":"FRD"}}},
{"id":"n-84359d92","guard":[["hasAny",["cryptocurrency","syntropy","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Syntropy":"NOIA"}}},
{"id":"n-8576dac6","guard":[["hasAny",["coin","linq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin LINQ":"LINQ"}}},
{"id":"n-86633d12","guard":[["hasAny",["coin","playermon","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Playermon":"PYM"}}},
{"id":"n-86a29bec","guard":[["has","sxp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency SXP":"SXP"}}},
{"id":"n-87281e50","guard":[["has","leisuremeta"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency LeisureMeta":"LM"}}},
{"id":"n-87764ae8","guard":[["has","bidcommerce"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Bidcommerce":"BIDCOM"}}},
{"id":"n-878fcf03","guard":[["hasAny",["cryptocurrency","rawg","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency RAWG":"RAWG"}}},
{"id":"n-880b790c","guard":[["hasAny",["coin","quantum","symbol","usx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin USX Quantum":"USX"}}},
{"id":"n-890bff05","guard":[["has","livegreen"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency LiveGreen Coin":"LGC"}}},
{"id":"n-8a07c307","guard":[["hasAny",["baby","coin","floki","pepe","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Baby Pepe Floki":"BPEPEF"}}},
{"id":"n-92067ceb","guard":[["has","keeperdao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin KeeperDAO":"ROOK"}}},
{"id":"n-9316b64c","guard":[["hasAny",["cryptocurrency","metavault","ticker","trade"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Metavault Trade":"MVX"}}},
{"id":"n-946e79dd","guard":[["has","bitone"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin BITONE":"BIO"}}},
{"id":"n-9549dd00","guard":[["has","empower"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Empower":"MPWR"}}},
{"id":"n-95c1ab78","guard":[["has","monavale"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Monavale trade under":"MONAV"}}},
{"id":"n-993f0b8d","guard":[["hasAny",["chain","chiiper","cryptocurrency","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Chiiper Chain":"CHII"}}},
{"id":"n-9a33c593","guard":[["hasAny",["cryptocurrency","recharge","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Recharge":"RCG"}}},
{"id":"n-9a3fdb24","guard":[["hasAny",["cryptocurrency","moon","rabbit","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Moon Rabbit":"AAA"}}},
{"id":"n-9aee6727","guard":[["has","ucx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin UCX":"UCX"}}},
{"id":"n-a171fef9","guard":[["hasAny",["advisor","coin","gastro","symbol","token"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Gastro Advisor Token":"FORK"}}},
{"id":"n-a17b1cd1","guard":[["has","lessfngas"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does LessFnGas trade under":"LESSF"}}},
{"id":"n-a492632d","guard":[["has","froggies"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Froggies Token trade under":"FRGST"}}},
{"id":"n-a4952ca8","guard":[["hasAny",["cryptocurrency","honorarium","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Honorarium":"HRM"}}},
{"id":"n-a530fe5f","guard":[["hasAny",["ebit","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does eBit trade under":"EBIT"}}},
{"id":"n-a5b568d9","guard":[["has","crown"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Crown Coin":"CRW"}}},
{"id":"n-a66d77c3","guard":[["has","hoppy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Hoppy trade under":"HOPPY"}}},
{"id":"n-a7c61856","guard":[["hasAny",["cryptocurrency","huobi","ticker","token","wrapped"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Wrapped Huobi Token":"WHT"}}},
{"id":"n-aabfd300","guard":[["hasAny",["hoppy","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Hoppy trade under":"HOPPY"}}},
{"id":"n-ac1ef4b3","guard":[["has","mocktailswap"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does MocktailSwap trade under":"MOK"}}},
{"id":"n-af5b3370","guard":[["hasAny",["bertinity","coin","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Bertinity":"BRTX"}}},
{"id":"n-b2578ed3","guard":[["hasAny",["coin","keeperdao","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin KeeperDAO":"ROOK"}}},
{"id":"n-b2ec84d7","guard":[["has","stp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency STP Network":"STPT"}}},
{"id":"n-b4c90838","guard":[["hasAny",["coinsuper","ecosystem","network","ticker","trade","under"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Coinsuper Ecosystem Network trade under":"CEN"}}},
{"id":"n-b607c850","guard":[["has","daxxcoin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency DaxxCoin":"DAXX"}}},
{"id":"n-b69ad8bc","guard":[["has","pointpay"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin PointPay":"PXP"}}},
{"id":"n-b759997b","guard":[["hasAny",["coin","cryptocurrency","livegreen","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency LiveGreen Coin":"LGC"}}},
{"id":"n-b8a1a279","guard":[["has","syntropy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Syntropy":"NOIA"}}},
{"id":"n-b96d902d","guard":[["has","konnect"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Konnect":"KCT"}}},
{"id":"n-ba44d793","guard":[["hasAny",["bitone","coin","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin BITONE":"BIO"}}},
{"id":"n-ba7267a6","guard":[["has","arcana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Arcana Network":"XAR"}}},
{"id":"n-bc0644f9","guard":[["hasAny",["coin","street","symbol","wall","wolf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Wolf of Wall Street":"WOLFOF"}}},
{"id":"n-bd3c0c5d","guard":[["has","brightcoin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does BrightCoin trade under":"BRIC"}}},
{"id":"n-bd3d7253","guard":[["hasAny",["ticker","trade","tribeone","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does TribeOne trade under":"HAKA"}}},
{"id":"n-bd51a451","guard":[["hasAny",["aria","legends","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Legends of Aria trade under":"ARIA"}}},
{"id":"n-bee68e57","guard":[["hasAny",["brightcoin","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does BrightCoin trade under":"BRIC"}}},
{"id":"n-c041f930","guard":[["has","masa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Masa trade under":"MASA"}}},
{"id":"n-c1eb3774","guard":[["hasAny",["make","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does MAKE trade under":"MAKE"}}},
{"id":"n-c46281d6","guard":[["hasAny",["coin","symbol","triaconta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Triaconta":"TRIA"}}},
{"id":"n-c649bd84","guard":[["has","cryptex"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Cryptex":"CTX"}}},
{"id":"n-c6899197","guard":[["hasAny",["coin","eauric","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Eauric":"EAURIC"}}},
{"id":"n-c8c0058d","guard":[["hasAny",["cryptocurrency","roketsin","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Roketsin":"RSIN"}}},
{"id":"n-cb36d89b","guard":[["hasAny",["rchain","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does RChain trade under":"RHOC"}}},
{"id":"n-cc8eedf5","guard":[["has","playermon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Playermon":"PYM"}}},
{"id":"n-cedf6cf9","guard":[["hasAny",["ans","coin","crypto","cryptocurrency","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency ANS Crypto Coin":"ANS"}}},
{"id":"n-cf261d50","guard":[["has","catcoin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does CatCoin Token trade under":"CATS"}}},
{"id":"n-cfd1cec1","guard":[["hasAny",["cryptocurrency","dzd","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency DZD":"DZDD"}}},
{"id":"n-d0712656","guard":[["has","motacoin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin MotaCoin":"MOTA"}}},
{"id":"n-d0c16234","guard":[["has","dzd"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency DZD":"DZDD"}}},
{"id":"n-d26da759","guard":[["hasAny",["ans","crypto"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency ANS Crypto Coin":"ANS"}}},
{"id":"n-d59850a1","guard":[["hasAny",["coin","cryptocurrency","kok","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency KOK Coin":"KOK"}}},
{"id":"n-d64b3751","guard":[["hasAny",["coin","pointpay","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin PointPay":"PXP"}}},
{"id":"n-d6f34384","guard":[["has","skymap"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency SkyMap":"SKYM"}}},
{"id":"n-d8501409","guard":[["hasAny",["bidcommerce","coin","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Bidcommerce":"BIDCOM"}}},
{"id":"n-d96164b5","guard":[["hasAny",["cryptocurrency","moon","rabbit","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Moon Rabbit":"AAA"}}},
{"id":"n-d9725c7a","guard":[["hasAny",["digitalcoin","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Digitalcoin trade under":"DGC"}}},
{"id":"n-da5fb266","guard":[["has","braincoin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency BrainCoin":"BRAIN"}}},
{"id":"n-dac9af61","guard":[["has","computer"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Internet Computer":"ICP"}}},
{"id":"n-db9813a0","guard":[["has","kento"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Kento trade under":"KNTO"}}},
{"id":"n-dcafe111","guard":[["has","crogecoin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Crogecoin":"CROGE"}}},
{"id":"n-e021239c","guard":[["hasAny",["page","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Page trade under":"PAGE"}}},
{"id":"n-e13effec","guard":[["hasAny",["ether","mantle","staked","ticker","trade","under"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Mantle Staked Ether trade under":"METH"}}},
{"id":"n-e160556d","guard":[["has","brcp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does BRCP Token trade under":"BRCP"}}},
{"id":"n-e36d9b72","guard":[["hasAny",["optimism","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Optimism trade under":"OP"}}},
{"id":"n-e3ee35fb","guard":[["has","linq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin LINQ":"LINQ"}}},
{"id":"n-e4523804","guard":[["hasAny",["coin","symbol","ucx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin UCX":"UCX"}}},
{"id":"n-e509ff99","guard":[["has","ebit"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does eBit trade under":"EBIT"}}},
{"id":"n-e517563e","guard":[["hasAny",["coin","divewallet","symbol","token"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin DiveWallet Token":"DWT"}}},
{"id":"n-e58f34e3","guard":[["has","eauric"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Eauric":"EAURIC"}}},
{"id":"n-e5ce0acf","guard":[["hasAny",["aria","legends"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does Legends of Aria trade under":"ARIA"}}},
{"id":"n-e6e450ac","guard":[["has","postoken"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin PoSToken":"POS"}}},
{"id":"n-e6f2f79c","guard":[["has","mazacoin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency MazaCoin":"MZC"}}},
{"id":"n-e8a0dc70","guard":[["hasAny",["icommunity","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does iCommunity trade under":"ICOM"}}},
{"id":"n-ea1fb2bf","guard":[["hasAny",["coin","street","symbol","wall","wolf"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Wolf of Wall Street":"WOLFOF"}}},
{"id":"n-ea689700","guard":[["has","connectchain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Connectchain":"CCTN"}}},
{"id":"n-ec7c788c","guard":[["has","kingxchain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency KingXChain":"KXC"}}},
{"id":"n-ed0880f3","guard":[["has","recharge"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Recharge":"RCG"}}},
{"id":"n-edd0af1d","guard":[["hasAny",["advisor","gastro"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Gastro Advisor Token":"FORK"}}},
{"id":"n-ee7bb66e","guard":[["hasAny",["cryptocurrency","gacrux","nft","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Gacrux NFT":"RUX"}}},
{"id":"n-ee995cc9","guard":[["hasAny",["coinsuper","ecosystem","network","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Coinsuper Ecosystem Network trade under":"CEN"}}},
{"id":"n-ef272e9c","guard":[["has","marnotaur"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Marnotaur":"TAUR"}}},
{"id":"n-efd8c907","guard":[["hasAny",["coin","etoro","polish","symbol","zloty"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin eToro Polish Zloty":"POLNX"}}},
{"id":"n-f25d0fb5","guard":[["has","tribeone"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does TribeOne trade under":"HAKA"}}},
{"id":"n-f2ddc522","guard":[["has","wshiba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin wShiba":"WSHIB"}}},
{"id":"n-f352c0bf","guard":[["has","icommunity"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does iCommunity trade under":"ICOM"}}},
{"id":"n-f3b0b334","guard":[["hasAny",["cryptocurrency","dao","digix","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Digix DAO":"DGD"}}},
{"id":"n-f3c88061","guard":[["has","cryptotwitter"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which ticker does CryptoTwitter trade under":"CT"}}},
{"id":"n-f4917f6a","guard":[["hasAny",["cryptocurrency","metavault","ticker","trade"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Metavault Trade":"MVX"}}},
{"id":"n-f504eb0b","guard":[["hasAny",["cryptocurrency","kingxchain","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency KingXChain":"KXC"}}},
{"id":"n-f7a35359","guard":[["hasAny",["coin","hyper","pay","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin Hyper Pay":"HPY"}}},
{"id":"n-f8b4cfe7","guard":[["has","duckduckcoin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the symbol of the coin DuckDuckCoin":"DUCKD"}}},
{"id":"n-f97e23cf","guard":[["hasAny",["coin","czusd","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin CZUSD":"CZUSD"}}},
{"id":"n-fce62fd6","guard":[["hasAny",["cryptocurrency","marnotaur","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of the cryptocurrency Marnotaur":"TAUR"}}},
{"id":"n-fd74eb9f","guard":[["hasAny",["kento","ticker","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which ticker does Kento trade under":"KNTO"}}},
{"id":"n-fefb4b4d","guard":[["hasAny",["coin","symbol","yvsfinance"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the symbol of the coin YVS.Finance":"YVS"}}},
{"id":"n-12b37b4b","guard":[["hasAny",["empower","longest","longest one","longest word","no vowels","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-7a5fe9a5","guard":[["hasAny",["a to z","alphabetical","alphabetize","brcp","shortest","shortest one","shortest word"]]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.words"]]]],"mem":null},
{"id":"n-88b52338","guard":[["hasAny",["huobi","no vowels","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-e2cf22eb","guard":[["hasAny",["aria","each word","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"give the symbol of the coin Cryptex","expect":{"equals":"CTX","notRefusal":true}},{"q":"which ticker does Legends of Aria trade under","expect":{"equals":"ARIA","notRefusal":true}},{"q":"what is the ticker of the cryptocurrency LiveGreen Coin","expect":{"equals":"LGC","notRefusal":true}},{"q":"what is the ticker of the cryptocurrency Chiiper Chain","expect":{"equals":"CHII","notRefusal":true}},{"q":"what is the ticker of the cryptocurrency DZD","expect":{"equals":"DZDD","notRefusal":true}},{"q":"what is the ticker of the cryptocurrency Internet Computer","expect":{"equals":"ICP","notRefusal":true}},{"q":"which ticker does Kento trade under","expect":{"equals":"KNTO","notRefusal":true}},{"q":"give the symbol of the coin Bidcommerce","expect":{"equals":"BIDCOM","notRefusal":true}},{"q":"which ticker does MAKE trade under","expect":{"equals":"MAKE","notRefusal":true}},{"q":"which ticker does Düber trade under","expect":{"equals":"DBR","notRefusal":true}},{"q":"give the symbol of the coin KeeperDAO","expect":{"equals":"ROOK","notRefusal":true}},{"q":"which ticker does Page trade under","expect":{"equals":"PAGE","notRefusal":true}},{"q":"what is the ticker of the cryptocurrency Metavault Trade","expect":{"equals":"MVX","notRefusal":true}},{"q":"which ticker does CryptoTwitter trade under","expect":{"equals":"CT","notRefusal":true}},{"q":"what is the ticker of the cryptocurrency MazaCoin","expect":{"equals":"MZC","notRefusal":true}},{"q":"what is the ticker of the cryptocurrency RAWG","expect":{"equals":"RAWG","notRefusal":true}},{"q":"which ticker does RChain trade under","expect":{"equals":"RHOC","notRefusal":true}},{"q":"what is the ticker of the cryptocurrency Syntropy","expect":{"equals":"NOIA","notRefusal":true}},{"q":"which ticker does healthbank trade under","expect":{"equals":"HBE","notRefusal":true}},{"q":"give the symbol of the coin Baby Pepe Floki","expect":{"equals":"BPEPEF","notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
