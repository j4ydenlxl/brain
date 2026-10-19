// gutenberg-id-of-title-f06c-larger-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"gutenberg-id-of-title-f06c-larger-neo-g10","class":"gutenberg-id-of-title-f06c-larger","generation":10,"lane":"neo","grownFrom":["between A Christmas Mystery: The Story of Three Wise Men and Angel Unawares: A Story of Christmas Eve, which has the greater gutenberg id","whose gutenberg id is larger: The Christmas Books of Mr. M.A. Titmarsh or The Lost Word: A Christmas Legend of Long Ago","whose gutenberg id is larger: The Lost Word: A Christmas Legend of Long Ago or When the Yule Log Burns: A Christmas Story","which has the larger gutenberg id, Evenings at Donaldson Manor; Or, The Christmas Guest or A Christmas Mystery: The Story of Three Wise Men","which has the larger gutenberg id, The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story or The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House","which has the larger gutenberg id, On Christmas Day In The Evening or A Christmas Story Man in His Element: or, A New Way to Keep House","between The First Christmas Tree: A Story of the Forest and Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season., which has the greater gutenberg id","between The Burglar and the Blizzard: A Christmas Story and On Christmas Day In The Evening, which has the greater gutenberg id","between When the Yule Log Burns: A Christmas Story and Evenings at Donaldson Manor; Or, The Christmas Guest, which has the greater gutenberg id","whose gutenberg id is larger: A Christmas Mystery: The Story of Three Wise Men or The Christmas Angel","between Shakespeare's Christmas Gift to Queen Bess and Christmas Outside of Eden, which has the greater gutenberg id","which has the larger gutenberg id, The Doctor's Christmas Eve or Christmas Outside of Eden","between The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House and The Romance of a Christmas Card, which has the greater gutenberg id","between Rosemary: A Christmas story and The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking, which has the greater gutenberg id","which has the larger gutenberg id, The Old Peabody Pew: A Christmas Romance of a Country Church or The Christmas Books of Mr. M.A. Titmarsh","between Mr. Kris Kringle: A Christmas Tale and The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story, which has the greater gutenberg id","between The Christmas Child and A Christmas Story Man in His Element: or, A New Way to Keep House, which has the greater gutenberg id","which has the larger gutenberg id, Christmas with Grandma Elsie or The Christmas Angel","which has the larger gutenberg id, Shakespeare's Christmas Gift to Queen Bess or The Doctor's Christmas Eve","whose gutenberg id is larger: Angel Unawares: A Story of Christmas Eve or Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season."],"version":1});

// <KERNEL>
const KERNEL_VERSION = 2;
const MAX_DEPTH = 64;
const MAX_LIST = 10000;
const MAX_BITS = 65536;
const MAX_TEXT = 100000;
const SAFE = 9007199254740991n;
const NEAR = 0.5;
const TYPES = Object.freeze(['text', 'num', 'nums', 'str', 'strs', 'bool', 'kv', 'tpl', 'mat']);
const FAMILIES = Object.freeze(['sense', 'transform', 'aggregate', 'compare', 'compute', 'memory', 'know', 'series', 'table', 'matrix', 'route', 'iterate', 'render']);
/** A matrix holds at most MAT_MAX rows and columns; its determinant and inverse are taken up to MAT_SOLVE. */
const MAT_MAX = 12;
const MAT_SOLVE = 10;
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
/** A matrix: 1 to MAT_MAX rows of one length (1 to MAT_MAX) of numbers. */
function isMat(v) { return Array.isArray(v) && v.length >= 1 && v.length <= MAT_MAX && Array.isArray(v[0]) && v[0].length >= 1 && v[0].length <= MAT_MAX && v.every((r) => Array.isArray(r) && r.length === v[0].length && r.every(isNum)); }
const CHECK = Object.freeze({
  text: (v) => typeof v === 'string', str: (v) => typeof v === 'string', num: isNum, bool: (v) => typeof v === 'boolean',
  nums: (v) => Array.isArray(v) && v.every(isNum), strs: (v) => Array.isArray(v) && v.every((s) => typeof s === 'string'),
  kv: isKv, tpl: isTpl, mat: isMat,
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

// ---- knowledge (contract c5): packs of rows the absorber pulled, loaded by knowLoad, read by the know family. A pack
// is DATA: { id, columns: [names], rows: [[cells]] } or the column form { id, columns, cols } (each column a list of
// cells, or { s: cells joined by sep, sep, num? } or { d: distinct cells joined by sep, i: indices in base 36 joined by
// commas, sep, num? } or { d, r: runs "index*count" in base 36 joined by commas, sep, num? } or { f: cells front coded
// and joined by sep, sep, num? }). A cell is a string or a finite number. Keys match after knowNorm; a key with two
// values is no answer.
const KNOW = new Map();
const KNOW_ID = /^[a-z0-9-]+$/;
const KNOW_MAX_ROWS = 200000;
const KNOW_MAX_GRAM = 8;
/** The match form of a key: no accents, lower case, every run of what is not a letter or a digit one space, no leading "the". */
function knowNorm(s) {
  if (typeof s !== 'string' && !(typeof s === 'number' && Number.isFinite(s))) return '';
  const t = knowWords(String(s));
  return t.startsWith('the ') ? t.slice(4) : t === 'the' ? '' : t;
}
function knowWords(s) { return s.slice(0, 2000).normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }
/** A number as plain digits (no exponent, no separator; a float to 15 significant digits), or null. */
function plainNum(v) {
  if (typeof v === 'bigint') return v.toString();
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  if (Number.isInteger(v)) return Math.abs(v) < 1e21 ? String(v + 0) : BigInt(v).toString();
  const s = String(Number(v.toPrecision(15)) + 0);
  return /e/i.test(s) ? null : s;
}
function knowCell(v) { return typeof v === 'string' ? (v.trim() ? v : null) : typeof v === 'number' && Number.isFinite(v) ? plainNum(v) : null; }
function knowColumn(c, n) {
  if (Array.isArray(c)) return c.length === n ? c : null;
  if (!isKv(c) || typeof c.sep !== 'string' || c.sep.length !== 1) return null;
  const conv = c.num === true ? (x) => (x === '' ? '' : Number(x)) : (x) => x;
  if (typeof c.s === 'string') { const xs = n ? c.s.split(c.sep) : []; return xs.length === n ? xs.map(conv) : null; }
  if (typeof c.d === 'string' && typeof c.i === 'string') {
    const d = c.d.split(c.sep).map(conv), ix = n ? c.i.split(',') : [];
    if (ix.length !== n) return null;
    const out = new Array(n);
    for (let k = 0; k < n; k++) { const j = parseInt(ix[k], 36); if (!(j >= 0 && j < d.length)) return null; out[k] = d[j]; }
    return out;
  }
  if (typeof c.d === 'string' && typeof c.r === 'string') { // runs of the dictionary: "index*count" in base 36, by commas
    const d = c.d.split(c.sep).map(conv), out = [];
    for (const run of n ? c.r.split(',') : []) {
      const m = /^([0-9a-z]+)\*([0-9a-z]+)$/.exec(run), j = m ? parseInt(m[1], 36) : -1, len = m ? parseInt(m[2], 36) : 0;
      if (!(j >= 0 && j < d.length) || !(len >= 1) || out.length + len > n) return null;
      for (let k = 0; k < len; k++) out.push(d[j]);
    }
    return out.length === n ? out : null;
  }
  if (typeof c.f === 'string') { // front coded: each item the count (one base 36 digit) of first code units it shares with the item before, then the rest
    const xs = n ? c.f.split(c.sep) : [];
    if (xs.length !== n) return null;
    const out = new Array(n);
    let prev = '';
    for (let k = 0; k < n; k++) {
      const m = /^[0-9a-z]/.test(xs[k]) ? parseInt(xs[k][0], 36) : -1;
      if (!(m >= 0 && m <= prev.length)) return null;
      prev = prev.slice(0, m) + xs[k].slice(1);
      out[k] = conv(prev);
    }
    return out;
  }
  return null;
}
function knowRows(p) {
  const cols = p.columns;
  if (Array.isArray(p.rows)) return p.rows.slice(0, KNOW_MAX_ROWS).map((r) => (Array.isArray(r) ? cols.map((_, j) => r[j]) : null));
  if (!Array.isArray(p.cols) || p.cols.length !== cols.length || !Number.isInteger(p.n) || p.n < 0 || p.n > KNOW_MAX_ROWS) return null;
  const data = p.cols.map((c) => knowColumn(c, p.n));
  if (data.some((c) => c === null)) return null;
  return Array.from({ length: p.n }, (_, i) => data.map((c) => c[i]));
}
/**
 * Load knowledge packs: the registry becomes exactly the valid packs given (a later pack of one id wins); the count.
 * A row that is not a list, a cell that is neither a string nor a finite number, becomes empty text.
 */
function knowLoad(packs) {
  KNOW.clear();
  for (const p of Array.isArray(packs) ? packs : []) {
    if (!isKv(p) || typeof p.id !== 'string' || !KNOW_ID.test(p.id) || !Array.isArray(p.columns) || !p.columns.length) continue;
    if (!p.columns.every((c) => typeof c === 'string' && c.trim()) || new Set(p.columns).size !== p.columns.length) continue;
    let rows = null;
    try { rows = knowRows(p); } catch { rows = null; }
    if (!rows) continue;
    const clean = rows.filter(Boolean).map((r) => r.map((v) => (typeof v === 'string' || (typeof v === 'number' && Number.isFinite(v)) ? v : '')));
    KNOW.set(p.id, { id: p.id, cols: p.columns.slice(), col: new Map(p.columns.map((c, j) => [c, j])), rows: clean, keys: new Map(), grams: new Map(), series: new Map(), tables: new Map() });
  }
  return KNOW.size;
}
function knowCol(p, name) { return typeof name === 'string' && p.col.has(name) ? p.col.get(name) : -1; }
function knowKeys(p, j) {
  let m = p.keys.get(j);
  if (m) return m;
  m = new Map();
  p.rows.forEach((r, i) => { const k = knowNorm(r[j]); if (!k) return; const a = m.get(k); if (a) a.push(i); else m.set(k, [i]); });
  p.keys.set(j, m);
  return m;
}
/** The one value of column vc for the key in column kc of a pack, or null (no pack, no column, no key, two values). */
function knowGet(id, kc, key, vc) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p || typeof key !== 'string') return null;
  const ki = knowCol(p, kc), vi = knowCol(p, vc);
  if (ki < 0 || vi < 0) return null;
  const at = knowKeys(p, ki).get(knowNorm(key));
  if (!at) return null;
  let out = null, on = null;
  for (const i of at) {
    const v = knowCell(p.rows[i][vi]);
    if (v === null) continue;
    const n = knowNorm(v) || v;
    if (on !== null && n !== on) return null;
    if (on === null) { out = v; on = n; }
  }
  return out;
}
/** The row of a key as { column: cell } (numbers as numbers), or null (no key, or two rows that differ). */
function knowRow(id, kc, key) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p || typeof key !== 'string') return null;
  const ki = knowCol(p, kc);
  const at = ki < 0 ? null : knowKeys(p, ki).get(knowNorm(key));
  if (!at) return null;
  const sig = (r) => r.map((v) => knowNorm(v)).join('\u0000');
  if (at.some((i) => sig(p.rows[i]) !== sig(p.rows[at[0]]))) return null;
  const out = Object.create(null);
  p.cols.forEach((c, j) => { const v = p.rows[at[0]][j]; if (v !== '') out[c] = v; });
  return out;
}
function knowGrams(p, j) {
  let g = p.grams.get(j);
  if (g) return g;
  g = { canon: new Map(), max: 1 };
  for (const r of p.rows) {
    const t = knowCell(r[j]), k = t === null ? '' : knowNorm(t);
    if (!k || g.canon.has(k)) continue;
    g.canon.set(k, t);
    g.max = Math.min(KNOW_MAX_GRAM, Math.max(g.max, k.split(' ').length));
  }
  p.grams.set(j, g);
  return g;
}
/** A key that begins with a mark: neither a letter, a digit nor a space. */
const MARKED = /^[^\p{L}\p{N}\s]/u;
function boundedIn(hay, needle) {
  for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + 1)) {
    const a = i === 0 || !/[\p{L}\p{N}]/u.test(hay[i - 1]), b = i + needle.length >= hay.length || !/[\p{L}\p{N}]/u.test(hay[i + needle.length]);
    if (a && b) return true;
  }
  return false;
}
/**
 * The keys of a pack column the prompt names, in prompt order, each as the pack writes it: the longest match at each
 * place, never overlapping. When one of them is written in the prompt exactly as in the pack, only those exact ones
 * are kept; one made only of stop words goes when another is found. A key written with a leading mark (".no") is
 * named only where the prompt writes it with the mark (any case).
 */
function knowFind(q, id, kc) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p || typeof q !== 'string') return null;
  const j = knowCol(p, kc);
  if (j < 0) return null;
  const g = knowGrams(p, j), ws = splitW(knowWords(q)), found = [], src = q.slice(0, 2000), low = src.toLowerCase();
  for (let i = 0; i < ws.length && found.length < 50;) {
    let hit = 0;
    for (let n = Math.min(g.max + 1, ws.length - i); n >= 1 && !hit; n--) {
      let k = ws.slice(i, i + n).join(' ');
      if (k.startsWith('the ')) k = k.slice(4);
      if (!k || !g.canon.has(k)) continue;
      const t = g.canon.get(k);
      // a key the pack writes with a leading mark (".no", "#tag") is named only where the prompt writes the mark too
      if (MARKED.test(t) && !boundedIn(low, t.toLowerCase())) continue;
      if (!found.includes(t)) found.push(t);
      hit = n;
    }
    i += hit || 1;
  }
  const exact = found.filter((t) => boundedIn(src, t));
  const kept = exact.length ? exact : found;
  const content = kept.filter((t) => splitW(norm(t, 1)).some((w) => !STOP.has(w)));
  return content.length ? content : kept;
}
/** The keys among keys whose column vc holds value (knowNorm equal), in the given order. */
function knowWhere(keys, id, kc, vc, value) {
  const want = knowNorm(value);
  if (!want || !Array.isArray(keys)) return null;
  return keys.filter((k) => { const v = knowGet(id, kc, k, vc); return v !== null && knowNorm(v) === want; });
}

// ---- series and long tables (the series and table families). A SERIES is a pack's value column read in the order of
// its key column: the keys order when every one is a date written YYYY, YYYY-MM or YYYY-MM-DD, or else every one is a
// number; a row whose value is no number is left out, and so is a key with two different values. A LONG TABLE holds one
// row per entity and time: a value is read by the pair (a pair with two different values is no answer), an entity's
// values in the order of its times, a time's values in the order of the entities' match forms. Both are built once per
// pack and columns while the pack is loaded, and neither depends on the order of the pack's rows.
// A date key: a year, a month or a day, and a day may carry a UTC time to the second ("2026-10-02T12:34:56Z").
const DATE_KEY = /^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?Z?)?)?)?$/;
const dateOrder = (m) => [m[2], m[3], m[4], m[5], m[6]].reduce((s, x) => s * 100 + Number(x || 0), Number(m[1])) + (m[7] ? Number('0.' + m[7]) : 0);
/** The place in order of each key (all dates, else all numbers), or null when the keys do not order. */
function orderOf(keys) {
  const ts = keys.map((k) => String(k).trim());
  if (!ts.length) return null;
  if (ts.every((t) => DATE_KEY.test(t))) return ts.map((t) => dateOrder(DATE_KEY.exec(t)));
  const ns = ts.map((t) => parseNum(t));
  return ns.every((x) => x !== null) ? ns.map(F) : null;
}
/** A cell as a number: a finite number, or text that is one (thousands commas allowed), else null. */
/** A float to 12 significant digits (the noise of float arithmetic on pack values goes); any other value as it is. */
function fx(v) { return typeof v === 'number' && Number.isFinite(v) && !Number.isInteger(v) ? Number(v.toPrecision(12)) + 0 : v; }
function cellNum(v) { return typeof v === 'number' ? fin(v) : typeof v === 'string' ? parseNum(v.trim()) : null; }
function seriesOf(id, kc, vc) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p) return null;
  const ki = knowCol(p, kc), vi = knowCol(p, vc);
  if (ki < 0 || vi < 0 || ki === vi) return null;
  const tag = ki + ',' + vi;
  if (p.series.has(tag)) return p.series.get(tag);
  const by = new Map();
  for (const r of p.rows) {
    const k = knowCell(r[ki]), n = k === null ? '' : knowNorm(k), v = cellNum(r[vi]);
    if (!n || v === null) continue;
    const e = by.get(n);
    if (!e) by.set(n, { n, k, v, bad: false });
    else { if (cmp(e.v, v) !== 0) e.bad = true; if (k < e.k) e.k = k; }
  }
  const list = [...by.values()].filter((e) => !e.bad), os = orderOf(list.map((e) => e.k));
  let s = null;
  if (os) {
    // keys written two ways for one place in order (2020-2 and 2020-02) are one item when they agree, none when not
    const all = list.map((e, i) => ({ n: e.n, k: e.k, v: e.v, o: os[i] })).sort((a, b) => a.o - b.o || cmp(a.k, b.k));
    const items = [], at = new Map();
    for (let i = 0; i < all.length;) {
      let j = i;
      while (j < all.length && all[j].o === all[i].o) j++;
      const g = all.slice(i, j);
      if (g.every((x) => cmp(x.v, g[0].v) === 0)) { for (const x of g) at.set(x.n, items.length); items.push(g[0]); }
      i = j;
    }
    s = { items, at };
  }
  p.series.set(tag, s);
  return s;
}
function serIdx(s, key) { if (!s || typeof key !== 'string') return -1; const i = s.at.get(knowNorm(key)); return i === undefined ? -1 : i; }
/** The item a step from the key (0 the key's own), or null. */
function serItem(s, key, step) { const i = serIdx(s, key); return i < 0 ? null : s.items[i + step] ?? null; }
/** The items from one key to the other, both included, in order (either may come first). */
function serSpan(s, k1, k2) { const i = serIdx(s, k1), j = serIdx(s, k2); return i < 0 || j < 0 ? null : s.items.slice(Math.min(i, j), Math.max(i, j) + 1); }
function serPair(s, k1, k2) { const i = serIdx(s, k1), j = serIdx(s, k2); return i < 0 || j < 0 ? null : [s.items[i].v, s.items[j].v]; }
/** The key of the one largest (dir 1) or smallest (dir -1) value of items; null for none or a tie. */
function argExt(items, dir) {
  if (!ne(items)) return null;
  let best = items[0], tie = false;
  for (const x of items.slice(1)) { const c = cmp(x.v, best.v) * dir; if (c > 0) { best = x; tie = false; } else if (c === 0) tie = true; }
  return tie ? null : best;
}
function tableOf(id, ec, tc, vc) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p) return null;
  const ei = knowCol(p, ec), ti = knowCol(p, tc), vi = knowCol(p, vc);
  if (ei < 0 || ti < 0 || vi < 0 || ei === ti || ei === vi || ti === vi) return null;
  const tag = ei + ',' + ti + ',' + vi;
  if (p.tables.has(tag)) return p.tables.get(tag);
  const pairs = new Map(), ents = new Map(), times = new Map();
  for (const r of p.rows) {
    const e = knowCell(r[ei]), t = knowCell(r[ti]), v = knowCell(r[vi]);
    const en = e === null ? '' : knowNorm(e), tn = t === null ? '' : knowNorm(t);
    if (!en || !tn || v === null) continue;
    if (!ents.has(en) || e < ents.get(en)) ents.set(en, e);
    if (!times.has(tn) || t < times.get(tn)) times.set(tn, t);
    const k = en + '\u0000' + tn, x = pairs.get(k), vn = knowNorm(v) || v;
    if (!x) pairs.set(k, { en, tn, v, vn, x: cellNum(r[vi]), bad: false });
    else if (x.vn !== vn) x.bad = true;
    else if (v < x.v) x.v = v;
  }
  const tl = [...times.keys()], os = orderOf(tl.map((tn) => times.get(tn)));
  const ord = os ? new Map(tl.map((tn, i) => [tn, os[i]])) : null;
  const byE = new Map(), byT = new Map();
  for (const x of pairs.values()) {
    if (x.bad) continue;
    const item = { en: x.en, tn: x.tn, e: ents.get(x.en), t: times.get(x.tn), v: x.v, x: x.x };
    (byE.get(x.en) || byE.set(x.en, []).get(x.en)).push(item);
    (byT.get(x.tn) || byT.set(x.tn, []).get(x.tn)).push(item);
  }
  if (ord) for (const l of byE.values()) l.sort((a, b) => ord.get(a.tn) - ord.get(b.tn) || cmp(a.tn, b.tn));
  for (const l of byT.values()) l.sort((a, b) => cmp(a.en, b.en));
  const t = { pairs, byE, byT, ord };
  p.tables.set(tag, t);
  return t;
}
function tabPair(t, e, time) {
  if (!t || typeof e !== 'string' || typeof time !== 'string') return null;
  const x = t.pairs.get(knowNorm(e) + '\u0000' + knowNorm(time));
  return x && !x.bad ? x : null;
}
/** An entity's items with a number, in time order (null when the times do not order). */
function tabNums(t, e) { if (!t || !t.ord || typeof e !== 'string') return null; const l = t.byE.get(knowNorm(e)); return l ? ne(l.filter((x) => x.x !== null)) : null; }
/** A time's items with a number, as { k: entity, v: number } in the order of the entities' match forms. */
function tabAt(t, time) { if (!t || typeof time !== 'string') return null; const l = t.byT.get(knowNorm(time)); return l ? ne(l.filter((x) => x.x !== null).map((x) => ({ k: x.e, v: x.x }))) : null; }

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

// ---- matrices (type mat): parsed from the prompt as [[1, 2], [3, 4]] or as rows split by ";" (1 2; 3 4), the entries
// exact (BigInt for integers) where the arithmetic is; a determinant of integers is exact (Bareiss), an inverse is taken
// in floats with each entry snapped to an integer within 1e-9 and otherwise to 12 significant digits; a singular one is null
const MAT_BRACKET = /\[\s*\[[^[\]]*\](?:\s*(?:,\s*)?\[[^[\]]*\])*\s*\]/g;
const MAT_ROWS = /-?\d+(?:\.\d+)?(?:(?:[ \t]*,[ \t]*|[ \t]+)-?\d+(?:\.\d+)?)*(?:[ \t]*;[ \t]*-?\d+(?:\.\d+)?(?:(?:[ \t]*,[ \t]*|[ \t]+)-?\d+(?:\.\d+)?)*)+/g;
function rowNums(s) { const ts = s.split(/[\s,]+/).filter(Boolean), xs = ts.map(parseNum); return xs.length && !xs.includes(null) ? xs : null; }
function matOfRows(rows) { const m = rows.map(rowNums); return m.every(Boolean) && isMat(m) ? m : null; }
/** The matrices a prompt writes, in prompt order (the first 4000 characters are read). */
function matricesIn(q) {
  if (typeof q !== 'string') return [];
  const src = q.slice(0, 4000), found = [];
  let rest = src;
  for (const m of src.matchAll(MAT_BRACKET)) {
    const mat = matOfRows([...m[0].matchAll(/\[([^[\]]*)\]/g)].map((x) => x[1]));
    if (mat) found.push([m.index, mat]);
    rest = rest.slice(0, m.index) + ' '.repeat(m[0].length) + rest.slice(m.index + m[0].length);
  }
  for (const m of rest.matchAll(MAT_ROWS)) { const mat = matOfRows(m[0].split(';')); if (mat) found.push([m.index, mat]); }
  return found.sort((a, b) => a[0] - b[0]).map((x) => x[1]);
}
function M(v) { if (!isMat(v)) throw new TypeError('not a matrix'); return v; }
function matT(m) { return M(m)[0].map((_, j) => m.map((r) => r[j])); }
function matZip(a, b, op) { M(a); M(b); return a.length === b.length && a[0].length === b[0].length ? a.map((r, i) => r.map((x, j) => op(x, b[i][j]))) : null; }
function matMul(a, b) {
  M(a); M(b);
  if (a[0].length !== b.length) return null;
  return a.map((r) => b[0].map((_, j) => { let s = 0; for (let k = 0; k < b.length; k++) s = add(s, mul(r[k], b[k][j])); return s; }));
}
function isSquare(m) { return isMat(m) && m.length === m[0].length && m.length <= MAT_SOLVE; }
function matId(n) { const k = int(n); return k !== null && k >= 1 && k <= MAT_MAX ? Array.from({ length: k }, (_, i) => Array.from({ length: k }, (x, j) => (i === j ? 1 : 0))) : null; }
/** A float near an integer (1e-9 relative) is that integer; any other to 12 significant digits. */
function snap(x) {
  if (typeof x !== 'number' || !Number.isFinite(x)) return null;
  const r = Math.round(x);
  return Math.abs(x - r) <= 1e-9 * Math.max(1, Math.abs(x)) ? r + 0 : Number(x.toPrecision(12)) + 0;
}
function detOf(m) {
  if (!isSquare(m)) return null;
  const n = m.length;
  if (m.every((r) => r.every(isInt))) { // Bareiss: every division is exact
    const a = m.map((r) => r.map(big));
    let sign = 1n, prev = 1n;
    for (let k = 0; k < n - 1; k++) {
      if (a[k][k] === 0n) {
        let s = k + 1;
        while (s < n && a[s][k] === 0n) s++;
        if (s === n) return 0;
        [a[k], a[s]] = [a[s], a[k]];
        sign = -sign;
      }
      for (let i = k + 1; i < n; i++) for (let j = k + 1; j < n; j++) a[i][j] = (a[i][j] * a[k][k] - a[i][k] * a[k][j]) / prev;
      prev = a[k][k];
    }
    return capB(sign * a[n - 1][n - 1]);
  }
  const a = m.map((r) => r.map(F));
  let d = 1;
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(a[i][k]) > Math.abs(a[p][k])) p = i;
    if (a[p][k] === 0) return 0;
    if (p !== k) { [a[k], a[p]] = [a[p], a[k]]; d = -d; }
    d *= a[k][k];
    for (let i = k + 1; i < n; i++) { const f = a[i][k] / a[k][k]; for (let j = k; j < n; j++) a[i][j] -= f * a[k][j]; }
  }
  return snap(d);
}
function invOf(m) {
  if (!isSquare(m)) return null;
  const d = detOf(m);
  if (d === null || F(d) === 0) return null;
  const n = m.length, a = m.map((r, i) => [...r.map(F), ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(a[i][k]) > Math.abs(a[p][k])) p = i;
    if (Math.abs(a[p][k]) < 1e-12) return null;
    [a[k], a[p]] = [a[p], a[k]];
    const pv = a[k][k];
    for (let j = 0; j < 2 * n; j++) a[k][j] /= pv;
    for (let i = 0; i < n; i++) if (i !== k && a[i][k] !== 0) { const f = a[i][k]; for (let j = 0; j < 2 * n; j++) a[i][j] -= f * a[k][j]; }
  }
  return a.map((r) => r.slice(n).map(snap));
}
function matPow(m, e) {
  const k = int(e);
  if (!isSquare(m) || k === null || k < 0 || k > 64) return null;
  let out = matId(m.length);
  for (let i = 0; i < k && out; i++) out = clean(matMul(out, m));
  return out;
}
/** An entry as text: an integer in full, any other number rounded to 6 decimal places. */
function matNum(v) { return typeof v === 'bigint' || Number.isInteger(v) ? plainNum(v) : plainNum(roundTo(v, 6)); }
function matText(m) { return '[' + M(m).map((r) => '[' + r.map(matNum).join(', ') + ']').join(', ') + ']'; }

// ---- text and code: identifier cases, substrings, codes, distances, base64, a path into JSON
/** The words of an identifier or a phrase: camelCase and PascalCase humps split, every run of what is not a letter or a digit a break. */
function idWords(s) { return s.slice(0, MAX_TEXT).replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, '$1 $2').replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2').split(/[^\p{L}\p{N}]+/u).filter(Boolean).map((w) => w.toLowerCase()); }
function cap1(w) { return w ? w[0].toUpperCase() + w.slice(1) : w; }
function caseJoin(s, how) {
  const ws = idWords(s);
  if (!ws.length) return null;
  if (how === 'camel') return ws[0] + ws.slice(1).map(cap1).join('');
  if (how === 'pascal') return ws.map(cap1).join('');
  return ws.join(how === 'snake' ? '_' : '-');
}
function caesar(s, k) {
  const n = int(k);
  if (n === null) return null;
  const sh = ((n % 26) + 26) % 26;
  return s.replace(/[A-Za-z]/g, (ch) => { const b = ch <= 'Z' ? 65 : 97; return String.fromCharCode(((ch.charCodeAt(0) - b + sh) % 26) + b); });
}
function editDistance(a, b) {
  const x = [...a], y = [...b];
  if (x.length > 2000 || y.length > 2000) return null;
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    const cur = [i];
    for (let j = 1; j <= y.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[y.length];
}
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function utf8Of(s) {
  const out = [];
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c >= 0xd800 && c <= 0xdfff) return null;
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return out;
}
/** UTF-8 bytes as text, or null when they are not well formed UTF-8. */
function utf8Text(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length;) {
    const b = bytes[i], n = b < 0x80 ? 0 : b >= 0xc2 && b < 0xe0 ? 1 : b >= 0xe0 && b < 0xf0 ? 2 : b >= 0xf0 && b < 0xf5 ? 3 : -1;
    if (n < 0 || i + n > bytes.length - 1) return null;
    let c = n ? b & (0x3f >> n) : b;
    for (let k = 1; k <= n; k++) { const x = bytes[i + k]; if ((x & 0xc0) !== 0x80) return null; c = (c << 6) | (x & 63); }
    if ((n === 2 && (c < 0x800 || (c >= 0xd800 && c <= 0xdfff))) || (n === 3 && (c < 0x10000 || c > 0x10ffff))) return null;
    s += String.fromCodePoint(c);
    i += n + 1;
  }
  return s;
}
function b64Encode(s) {
  const b = s.length <= MAX_TEXT ? utf8Of(s) : null;
  if (!b) return null;
  let out = '';
  for (let i = 0; i < b.length; i += 3) {
    const x = (b[i] << 16) | ((b[i + 1] ?? 0) << 8) | (b[i + 2] ?? 0);
    out += B64[(x >> 18) & 63] + B64[(x >> 12) & 63] + (i + 1 < b.length ? B64[(x >> 6) & 63] : '=') + (i + 2 < b.length ? B64[x & 63] : '=');
  }
  return out;
}
function b64Decode(t) {
  const s = t.trim();
  if (!s || s.length % 4 || s.length > MAX_TEXT || !/^[A-Za-z0-9+/]+={0,2}$/.test(s)) return null;
  const bytes = [];
  for (let i = 0; i < s.length; i += 4) {
    const v = [0, 1, 2, 3].map((k) => (s[i + k] === '=' ? 0 : B64.indexOf(s[i + k])));
    const x = (v[0] << 18) | (v[1] << 12) | (v[2] << 6) | v[3];
    bytes.push((x >> 16) & 255);
    if (s[i + 2] !== '=') bytes.push((x >> 8) & 255);
    if (s[i + 3] !== '=') bytes.push(x & 255);
  }
  return utf8Text(bytes);
}
/** The first JSON object the prompt writes (balanced braces outside strings, then JSON.parse), or null. */
function jsonIn(q) {
  if (typeof q !== 'string') return null;
  const src = q.slice(0, MAX_TEXT);
  for (let i = src.indexOf('{'), tries = 0; i >= 0 && tries < 20; i = src.indexOf('{', i + 1), tries++) {
    let depth = 0, str = false, j = i;
    for (; j < src.length; j++) {
      const ch = src[j];
      if (str) { if (ch === '\\') j++; else if (ch === '"') str = false; continue; }
      if (ch === '"') str = true;
      else if (ch === '{' || ch === '[') depth++;
      else if (ch === '}' || ch === ']') { depth--; if (depth === 0) break; }
    }
    if (depth !== 0) continue;
    try { const v = JSON.parse(src.slice(i, j + 1)); if (isKv(v)) return v; } catch { /* not JSON: the next brace */ }
  }
  return null;
}
/** The value at a dotted path of an object (a list step is a 0-based index) as text: a number in full, an object as JSON. */
function pathGet(obj, p) {
  let v = obj;
  for (const step of p.split('.')) {
    if (Array.isArray(v) && /^\d+$/.test(step)) v = v[Number(step)];
    else if (isKv(v) && Object.hasOwn(v, step)) v = v[step];
    else return null;
  }
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return plainNum(v);
  if (typeof v === 'boolean') return String(v);
  return v !== null && typeof v === 'object' ? jsonText(v) : null;
}
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
  P('sense.matrix', 'text', 'mat', 'matrix|the matrix|grid of numbers|array', (a, c) => matricesIn(c.q)[0] ?? null);
  P('sense.matrixAt', 'text num', 'mat', 'second matrix|the other matrix|nth matrix|matrix b', (a, c) => pick(matricesIn(c.q), N(a[0])));
  P('sense.json', 'text', 'kv', 'json|the object|this json|the record', (a, c) => jsonIn(c.q));

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
  P('transform.camel', 'str', 'str', 'camel case|camelcase|camelCase|lower camel case', (a) => caseJoin(S(a[0]), 'camel'));
  P('transform.pascal', 'str', 'str', 'pascal case|PascalCase|upper camel case|class name', (a) => caseJoin(S(a[0]), 'pascal'));
  P('transform.snake', 'str', 'str', 'snake case|snake_case|underscores|variable name', (a) => caseJoin(S(a[0]), 'snake'));
  P('transform.kebab', 'str', 'str', 'kebab case|kebab-case|hyphens|slug|dashes', (a) => caseJoin(S(a[0]), 'kebab'));
  P('transform.substr', 'str num num', 'str', 'characters from|substring|letters from to|slice of the text', (a) => { const ch = [...S(a[0]).slice(0, MAX_TEXT)], i = int(a[1]), j = int(a[2]); return i !== null && j !== null && i >= 1 && j >= i && i <= ch.length ? ch.slice(i - 1, j).join('') : null; });
  P('transform.charAt', 'str num', 'str', 'letter at|character at|nth letter|which letter', (a) => pick([...S(a[0]).slice(0, MAX_TEXT)], a[1]));
  P('transform.padStart', 'str num str', 'str', 'pad|pad with|leading zeros|zero pad|padded to', (a) => { const k = int(a[1]); return S(a[2]) && k !== null && k >= 0 && k <= MAX_TEXT ? S(a[0]).padStart(k, a[2]) : null; });
  P('transform.caesar', 'str num', 'str', 'caesar cipher|shift each letter|rot13|rotate the letters|shift by', (a) => caesar(S(a[0]), N(a[1])));
  P('transform.charCodes', 'str', 'nums', 'character codes|ascii codes|code points|unicode values|ascii', (a) => { const ch = [...S(a[0])]; return ch.length <= MAX_LIST ? ne(ch.map((x) => x.codePointAt(0))) : null; });
  P('transform.fromCodes', 'nums', 'str', 'from character codes|from ascii|decode the codes|which characters', (a) => { const xs = ne(NS(a[0])); return xs && xs.length <= MAX_LIST && xs.every((x) => isInt(x) && F(x) >= 0 && F(x) <= 0x10ffff && !(F(x) >= 0xd800 && F(x) <= 0xdfff)) ? String.fromCodePoint(...xs.map(Number)) : null; });
  P('transform.base64', 'str', 'str', 'base64|base 64|encode in base64|to base64', (a) => b64Encode(S(a[0])));
  P('transform.unbase64', 'str', 'str', 'decode base64|from base64|base64 decode|decode', (a) => b64Decode(S(a[0])));
  P('transform.get', 'kv str', 'str', 'the field|the value at|the key|get|path', (a) => (S(a[1]).trim() ? pathGet(KV(a[0]), a[1].trim()) : null));

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
  P('aggregate.indexOf', 'str str', 'num', 'position of|where does|index of|at which position', (a) => { const h = [...S(a[0]).slice(0, MAX_TEXT).toLowerCase()], n = [...S(a[1]).toLowerCase()]; if (!n.length) return null; for (let i = 0; i + n.length <= h.length; i++) if (n.every((ch, k) => h[i + k] === ch)) return i + 1; return null; });
  P('aggregate.commonLetter', 'str', 'str', 'most common letter|most frequent letter|which letter appears most', (a) => { const n = new Map(); for (const ch of S(a[0]).slice(0, MAX_TEXT).toLowerCase()) if (/\p{L}/u.test(ch)) n.set(ch, (n.get(ch) || 0) + 1); const top = Math.max(0, ...n.values()), best = [...n].filter(([, k]) => k === top); return top && best.length === 1 ? best[0][0] : null; });
  P('aggregate.lines', 'str', 'num', 'how many lines|number of lines|line count|lines of code', (a) => S(a[0]).replace(/\r\n?/g, '\n').replace(/\n+$/, '').split('\n').length);

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
  P('compute.editDistance', 'str str', 'num', 'edit distance|levenshtein|how many edits|changes to turn', (a) => editDistance(S(a[0]), S(a[1])));
  P('compute.hamming', 'str str', 'num', 'hamming distance|positions that differ|how many positions differ', (a) => { const x = [...S(a[0])], y = [...S(a[1])]; return x.length === y.length && x.length <= MAX_TEXT ? x.filter((ch, i) => ch !== y[i]).length : null; });

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

  // know: retrieval from the knowledge packs (knowLoad); a pack id and its column names are literal arguments
  P('know.find', 'text str str', 'strs', 'which|named|mentioned|the one called', (a, c) => ne(knowFind(c.q, S(a[0]), S(a[1]))));
  P('know.lookup', 'str str str str', 'str', 'what is the|look up|the value of|find the', (a) => knowGet(S(a[1]), S(a[2]), S(a[0]), S(a[3])));
  P('know.reverse', 'str str str str', 'str', 'which has|whose|which one has|the one with', (a) => knowGet(S(a[1]), S(a[3]), S(a[0]), S(a[2])));
  P('know.row', 'str str str', 'kv', 'everything about|the record of|all about', (a) => knowRow(S(a[1]), S(a[2]), S(a[0])));
  P('know.has', 'str str str', 'bool', 'is it known|is there a|is it listed', (a) => { const p = KNOW.get(S(a[1])); const j = p ? knowCol(p, S(a[2])) : -1; return j < 0 ? null : knowKeys(p, j).has(knowNorm(S(a[0]))); });
  P('know.where', 'strs str str str str', 'strs', 'which of these|the ones that are|among these', (a) => knowWhere(SS(a[0]), S(a[1]), S(a[2]), S(a[3]), S(a[4])));
  P('know.num', 'str', 'num', 'as a number|numeric value|how much', (a) => parseNum(S(a[0]).trim()));

  // series: a pack's value column in the order of its key column; the keys come first, then the pack id, the key column
  // and the value column (literal arguments, as in know)
  const SER = (a, i) => seriesOf(S(a[i]), S(a[i + 1]), S(a[i + 2]));
  const span = (a) => serSpan(SER(a, 2), S(a[0]), S(a[1]));
  const pair = (a) => serPair(SER(a, 2), S(a[0]), S(a[1]));
  P('series.at', 'str str str str', 'num', 'in|at|value in|the value for', (a) => serItem(SER(a, 1), S(a[0]), 0)?.v ?? null);
  P('series.prev', 'str str str str', 'num', 'the one before|previous|the year before|prior', (a) => serItem(SER(a, 1), S(a[0]), -1)?.v ?? null);
  P('series.next', 'str str str str', 'num', 'the one after|next|the year after|following', (a) => serItem(SER(a, 1), S(a[0]), 1)?.v ?? null);
  P('series.prevKey', 'str str str str', 'str', 'the key before|which came before|the year before', (a) => serItem(SER(a, 1), S(a[0]), -1)?.k ?? null);
  P('series.nextKey', 'str str str str', 'str', 'the key after|which came next|the year after', (a) => serItem(SER(a, 1), S(a[0]), 1)?.k ?? null);
  P('series.step', 'str str str str', 'num', 'change from the one before|rise that year|fall that year|year on year', (a) => { const x = serItem(SER(a, 1), S(a[0]), 0), y = serItem(SER(a, 1), a[0], -1); return x && y ? fx(sub(x.v, y.v)) : null; });
  P('series.delta', 'str str str str str', 'num', 'change from|difference between|how much did it change|rise from', (a) => { const p = pair(a); return p ? fx(sub(p[1], p[0])) : null; });
  P('series.ratio', 'str str str str str', 'num', 'ratio|how many times|times as much', (a) => { const p = pair(a); return p ? fx(div(p[1], p[0])) : null; });
  P('series.change', 'str str str str str', 'num', 'percent change|percentage change|grew by|growth from', (a) => { const p = pair(a); return p ? fx(div(mul(sub(p[1], p[0]), 100), p[0])) : null; });
  P('series.mean', 'str str str str str', 'num', 'average from|mean between|average over|mean from', (a) => fx(meanOf(span(a)?.map((x) => x.v) ?? null)));
  P('series.sum', 'str str str str str', 'num', 'total from|sum over|altogether between', (a) => fx(sumOf(ne(span(a))?.map((x) => x.v) ?? null)));
  P('series.max', 'str str str str str', 'num', 'highest between|peak from|maximum over', (a) => sortNums(ne(span(a))?.map((x) => x.v) ?? null)?.at(-1) ?? null);
  P('series.min', 'str str str str str', 'num', 'lowest between|minimum over', (a) => sortNums(ne(span(a))?.map((x) => x.v) ?? null)?.[0] ?? null);
  P('series.window', 'str str str str str', 'nums', 'values from|from to|between', (a) => ne(span(a))?.map((x) => x.v) ?? null);
  P('series.argmaxIn', 'str str str str str', 'str', 'when was it highest between|peak year between', (a) => argExt(span(a), 1)?.k ?? null);
  P('series.argminIn', 'str str str str str', 'str', 'when was it lowest between|low year between', (a) => argExt(span(a), -1)?.k ?? null);
  P('series.higher', 'str str str str str', 'str', 'which was higher|which is larger|more in', (a) => { const p = pair(a); return p === null || cmp(p[0], p[1]) === 0 ? null : cmp(p[0], p[1]) > 0 ? serItem(SER(a, 2), a[0], 0).k : serItem(SER(a, 2), a[1], 0).k; });
  P('series.lower', 'str str str str str', 'str', 'which was lower|which is smaller|less in', (a) => { const p = pair(a); return p === null || cmp(p[0], p[1]) === 0 ? null : cmp(p[0], p[1]) < 0 ? serItem(SER(a, 2), a[0], 0).k : serItem(SER(a, 2), a[1], 0).k; });
  P('series.greater', 'str str str str str', 'bool', 'higher in|more than in|greater in', (a) => { const p = pair(a); return p ? cmp(p[0], p[1]) > 0 : null; });
  P('series.first', 'str str str', 'num', 'first value|earliest value|at the start', (a) => SER(a, 0)?.items[0]?.v ?? null);
  P('series.last', 'str str str', 'num', 'latest value|most recent|last value', (a) => SER(a, 0)?.items.at(-1)?.v ?? null);
  P('series.firstKey', 'str str str', 'str', 'first year|earliest|since when', (a) => SER(a, 0)?.items[0]?.k ?? null);
  P('series.lastKey', 'str str str', 'str', 'latest year|most recent year|last on record', (a) => SER(a, 0)?.items.at(-1)?.k ?? null);
  P('series.argmax', 'str str str', 'str', 'when was it highest|the year with the highest|peak year|record high', (a) => argExt(SER(a, 0)?.items, 1)?.k ?? null);
  P('series.argmin', 'str str str', 'str', 'when was it lowest|the year with the lowest|record low', (a) => argExt(SER(a, 0)?.items, -1)?.k ?? null);
  P('series.values', 'str str str', 'nums', 'all values|the whole series|every value', (a) => { const s = SER(a, 0); return s && s.items.length <= MAX_LIST ? ne(s.items.map((x) => x.v)) : null; });
  P('series.keys', 'str str str', 'strs', 'every year|all the years|the keys', (a) => { const s = SER(a, 0); return s && s.items.length <= MAX_LIST ? ne(s.items.map((x) => x.k)) : null; });
  P('series.countAbove', 'num str str str', 'num', 'how many years above|how many times over|count above', (a) => { const s = SER(a, 1), x = N(a[0]); return s ? s.items.filter((y) => cmp(y.v, x) > 0).length : null; });
  P('series.countBelow', 'num str str str', 'num', 'how many years below|how many times under|count below', (a) => { const s = SER(a, 1), x = N(a[0]); return s ? s.items.filter((y) => cmp(y.v, x) < 0).length : null; });

  // table: a long table, one row per entity and time; the entity and the time come first, then the pack id, the entity
  // column, the time column and the value column
  const TAB = (a, i) => tableOf(S(a[i]), S(a[i + 1]), S(a[i + 2]), S(a[i + 3]));
  P('table.get', 'str str str str str str', 'str', 'of in|for in|the value of in', (a) => tabPair(TAB(a, 2), S(a[0]), S(a[1]))?.v ?? null);
  P('table.at', 'str str str str str str', 'num', 'how much in|how many in|the number for in', (a) => tabPair(TAB(a, 2), S(a[0]), S(a[1]))?.x ?? null);
  P('table.latest', 'str str str str str', 'num', 'latest|most recent|current|now', (a) => tabNums(TAB(a, 1), S(a[0]))?.at(-1).x ?? null);
  P('table.latestKey', 'str str str str str', 'str', 'when was the latest|most recent year|last year on record for', (a) => tabNums(TAB(a, 1), S(a[0]))?.at(-1).t ?? null);
  P('table.earliest', 'str str str str str', 'num', 'earliest|first recorded|at the start', (a) => tabNums(TAB(a, 1), S(a[0]))?.[0].x ?? null);
  P('table.earliestKey', 'str str str str str', 'str', 'first year|since when|earliest year for', (a) => tabNums(TAB(a, 1), S(a[0]))?.[0].t ?? null);
  P('table.series', 'str str str str str', 'nums', 'over the years|every year of|the history of|all values of', (a) => { const l = tabNums(TAB(a, 1), S(a[0])); return l && l.length <= MAX_LIST ? l.map((x) => x.x) : null; });
  P('table.top', 'str str str str str', 'str', 'which had the most|the highest in|largest in|top in', (a) => argExt(tabAt(TAB(a, 1), S(a[0])), 1)?.k ?? null);
  P('table.bottom', 'str str str str str', 'str', 'which had the least|the lowest in|smallest in|bottom in', (a) => argExt(tabAt(TAB(a, 1), S(a[0])), -1)?.k ?? null);
  P('table.across', 'str str str str str', 'nums', 'all values in|every one in|across in', (a) => { const l = tabAt(TAB(a, 1), S(a[0])); return l && l.length <= MAX_LIST ? l.map((x) => x.v) : null; });
  P('table.rank', 'str str str str str str', 'num', 'rank|ranked|place in|position in', (a) => { const t = TAB(a, 2), x = tabPair(t, S(a[0]), S(a[1]))?.x ?? null, l = tabAt(t, a[1]); return x === null || !l ? null : 1 + l.filter((y) => cmp(y.v, x) > 0).length; });
  P('table.delta', 'str str str str str str str', 'num', 'change from to|difference between and for|how much did it grow', (a) => { const t = TAB(a, 3), x = tabPair(t, S(a[0]), S(a[1]))?.x ?? null, y = tabPair(t, a[0], S(a[2]))?.x ?? null; return x === null || y === null ? null : fx(sub(y, x)); });

  // matrix: shape, parts, arithmetic, determinant and inverse of small square ones
  P('matrix.rows', 'mat', 'num', 'how many rows|number of rows|rows', (a) => M(a[0]).length);
  P('matrix.cols', 'mat', 'num', 'how many columns|number of columns|columns', (a) => M(a[0])[0].length);
  P('matrix.shape', 'mat', 'str', 'shape|dimensions|size of the matrix|order of the matrix', (a) => M(a[0]).length + 'x' + a[0][0].length);
  P('matrix.row', 'mat num', 'nums', 'row|the row|nth row', (a) => pick(M(a[0]), a[1]));
  P('matrix.col', 'mat num', 'nums', 'column|the column|nth column', (a) => pick(matT(a[0]), a[1]));
  P('matrix.at', 'mat num num', 'num', 'entry|element at|row column|entry at', (a) => { const r = pick(M(a[0]), a[1]); return r ? pick(r, a[2]) : null; });
  P('matrix.transpose', 'mat', 'mat', 'transpose|transposed|flip rows and columns', (a) => matT(a[0]));
  P('matrix.add', 'mat mat', 'mat', 'add|add the matrices|sum of the matrices|plus|matrix sum', (a) => matZip(a[0], a[1], add));
  P('matrix.sub', 'mat mat', 'mat', 'subtract|subtract the matrices|difference of the matrices|minus', (a) => matZip(a[0], a[1], sub));
  P('matrix.mul', 'mat mat', 'mat', 'multiply|multiply the matrices|matrix product|product|times', (a) => matMul(a[0], a[1]));
  P('matrix.scale', 'mat num', 'mat', 'scale|multiply the matrix by|scalar multiple|times', (a) => { const k = N(a[1]); return M(a[0]).map((r) => r.map((x) => mul(x, k))); });
  P('matrix.det', 'mat', 'num', 'determinant|det', (a) => detOf(M(a[0])));
  P('matrix.inverse', 'mat', 'mat', 'inverse|invert|inverse matrix', (a) => invOf(M(a[0])));
  P('matrix.trace', 'mat', 'num', 'trace|sum of the diagonal', (a) => (isSquare(a[0]) || (isMat(a[0]) && a[0].length === a[0][0].length) ? sumOf(a[0].map((r, i) => r[i])) : null));
  P('matrix.identity', 'num', 'mat', 'identity matrix|identity|unit matrix', (a) => matId(N(a[0])));
  P('matrix.flatten', 'mat', 'nums', 'flatten|all entries|every entry|entries', (a) => M(a[0]).flat());
  P('matrix.power', 'mat num', 'mat', 'to the power|matrix power|squared|cubed', (a) => matPow(M(a[0]), N(a[1])));
  P('matrix.reshape', 'nums num', 'mat', 'arrange in rows|reshape|in rows|into a grid', (a) => { const xs = NS(a[0]), k = int(a[1]), c = k ? xs.length / k : 0; return k !== null && k >= 1 && k <= MAT_MAX && isInt(c) && c >= 1 && c <= MAT_MAX ? Array.from({ length: k }, (_, i) => xs.slice(i * c, i * c + c)) : null; });

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
  P('render.plain', 'num', 'str', 'exact number|all its digits|in full', (a) => plainNum(N(a[0])));
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
  P('render.matrix', 'mat', 'str', 'matrix|as a matrix|in brackets', (a) => matText(a[0]));
  P('render.matrixRows', 'mat', 'str', 'rows|one row per line|as a grid', (a) => M(a[0]).map((r) => r.map(matNum).join(' ')).join('\n'));
  return Object.freeze(out);
}

// ---- evaluation: nodes, types, shape
function isLit(node) { return isKv(node) && Object.hasOwn(node, 'lit'); }
/** The argument types a node of this primitive carries (its in list without the implicit "text"), or null. */
function argTypes(name) {
  if (typeof name !== 'string') return null;
  if (Object.hasOwn(ARGS, name)) return ARGS[name].slice();
  const m = MACROS.get(name);
  return m ? m.in.slice() : null;
}
/**
 * Evaluate a node on a prompt and a mem: a value of the node's type, or null (a miss, never a guess). env holds the
 * argument values of the macro whose body is being evaluated: a { param: j } leaf is the j-th of them.
 */
function evalNode(node, q, mem, depth = 0, env = null) {
  try {
    if (depth > MAX_DEPTH) return null;
    if (isLit(node)) return clean(node.lit);
    if (env !== null && isParam(node)) return node.param < env.length ? env[node.param] : null;
    if (!Array.isArray(node) || typeof node[0] !== 'string') return null;
    if (!Object.hasOwn(PRIMS, node[0])) {
      const m = MACROS.get(node[0]);
      if (!m || node.length - 1 !== m.in.length) return null;
      const vals = [];
      for (let i = 1; i < node.length; i++) { const v = evalNode(node[i], q, mem, depth + 1, env); if (v === null) return null; vals.push(v); }
      return evalNode(m.body, q, mem, depth + 1, vals);
    }
    const p = PRIMS[node[0]], ts = ARGS[node[0]], n = node.length - 1;
    if (n < ts.length || (n > ts.length && !p.rest)) return null;
    const args = [];
    for (let i = 1; i <= n; i++) { const v = evalNode(node[i], q, mem, depth + 1, env); if (v === null && !p.lazy) return null; args.push(v); }
    return p.fn(args, { q: typeof q === 'string' ? q : '', mem: isKv(mem) ? mem : null });
  } catch { return null; }
}
/** Whether a node is well typed and yields the wanted type (any type when want is undefined). */
function wellTyped(node, want, depth = 0) {
  if (depth > MAX_DEPTH) return false;
  if (isLit(node)) return typeof want === 'string' && want !== 'text' && Object.hasOwn(CHECK, want) && CHECK[want](clean(node.lit));
  if (!Array.isArray(node) || typeof node[0] !== 'string') return false;
  if (!Object.hasOwn(PRIMS, node[0])) {
    const m = MACROS.get(node[0]);
    if (!m || (want !== undefined && m.out !== want) || node.length - 1 !== m.in.length) return false;
    for (let i = 1; i < node.length; i++) if (!wellTyped(node[i], m.in[i - 1], depth + 1)) return false;
    return true;
  }
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
  if (node.length === 1) return ['sense', 'memory'].includes(PRIMS[node[0]]?.family) || MACROS.has(node[0]); // a macro's own leaves were checked when it loaded
  return node.slice(1).every((x) => leavesOk(x, depth + 1));
}
/** The family of a primitive, or of a macro's apex primitive; null for any other name. */
function familyOfName(name) { return typeof name !== 'string' ? null : Object.hasOwn(PRIMS, name) ? PRIMS[name].family : MACROS.has(name) ? MACROS.get(name).family : null; }

// ---- macros (contract c6): composites of the primitives that grow/evolve.mjs mined from kept cells and a measured
// trial kept (neo/MACROS.json), loaded by macroLoad. A macro node ["macro.<slug>", a1, .., ak] is the macro's body with
// its { param: j } leaves bound to the VALUES of a1 .. ak: typed by the macro's in and out like a primitive, total like
// every node (a null argument is a null, a throw is a null, the depth bar holds inside the body too). A body names
// primitives only, never a macro, so no macro reaches itself; a compiled module carries the macros its cells name.
const MACROS = new Map();
const MACRO_NAME = /^macro\.[a-z0-9][a-z0-9-]{0,79}$/;
/** The most macros loaded, the largest body (nodes) and the most parameters a macro takes. */
const MACRO_MAX = 512;
const MACRO_MAX_SIZE = 48;
const MACRO_MAX_PARAMS = 8;
function isParam(node) { return isKv(node) && Number.isInteger(node.param) && node.param >= 0 && Object.keys(node).length === 1; }
/**
 * A macro checked: { name, body, in, out, family, params, size } frozen, or null. The body is a node of primitives whose
 * leaves are literals of their place's type, sense or memory primitives or { param: j } (j below params, each used,
 * each place of one type); the place types are its in (a given in must equal them), its apex primitive's out its out
 * (a given out must equal it).
 */
function macroOf(m) {
  if (!isKv(m) || typeof m.name !== 'string' || !MACRO_NAME.test(m.name) || Object.hasOwn(PRIMS, m.name)) return null;
  const k = m.params;
  if (!Number.isInteger(k) || k < 0 || k > MACRO_MAX_PARAMS || !Array.isArray(m.body) || !Object.hasOwn(PRIMS, m.body[0])) return null;
  const types = new Array(k).fill(undefined);
  let size = 0;
  const walk = (node, want, depth) => {
    if (++size > MACRO_MAX_SIZE || depth > MAX_DEPTH) return false;
    if (isParam(node)) {
      if (node.param >= k || typeof want !== 'string' || want === 'text') return false;
      if (types[node.param] !== undefined && types[node.param] !== want) return false;
      types[node.param] = want;
      return true;
    }
    if (isLit(node)) return typeof want === 'string' && want !== 'text' && Object.hasOwn(CHECK, want) && CHECK[want](clean(node.lit));
    if (!Array.isArray(node) || typeof node[0] !== 'string' || !Object.hasOwn(PRIMS, node[0])) return false;
    const p = PRIMS[node[0]], ts = ARGS[node[0]], n = node.length - 1;
    if ((want !== undefined && p.out !== want) || n < ts.length || (n > ts.length && !p.rest)) return false;
    if (n === 0 && !['sense', 'memory'].includes(p.family)) return false;
    for (let i = 1; i <= n; i++) if (!walk(node[i], i <= ts.length ? ts[i - 1] : p.rest, depth + 1)) return false;
    return true;
  };
  if (!walk(m.body, undefined, 0) || types.some((t) => t === undefined)) return null;
  if (m.in !== undefined && m.in !== null && !(Array.isArray(m.in) && m.in.length === k && m.in.every((t, j) => t === types[j]))) return null;
  const out = PRIMS[m.body[0]].out;
  if (m.out !== undefined && m.out !== null && m.out !== out) return null;
  const body = JSON.parse(JSON.stringify(m.body));
  return Object.freeze({ name: m.name, body, in: Object.freeze(types), out, family: PRIMS[m.body[0]].family, params: k, size });
}
/** Load macros: the registry becomes exactly the valid macros given (the first of a name wins, MACRO_MAX at most); their names. */
function macroLoad(list) {
  MACROS.clear();
  for (const m of Array.isArray(list) ? list : []) {
    if (MACROS.size >= MACRO_MAX) break;
    let e = null;
    try { e = macroOf(m); } catch { e = null; }
    if (e && !MACROS.has(e.name)) MACROS.set(e.name, e);
  }
  return [...MACROS.keys()];
}
/** The loaded macro of a name ({ name, body, in, out, family, params, size }), or null. */
function macroInfo(name) { return typeof name === 'string' && MACROS.has(name) ? MACROS.get(name) : null; }
/** A node with every loaded macro node replaced by its body, the arguments in place of the parameters (primitives only). */
function expandMacros(node, depth = 0, env = null) {
  if (depth > MAX_DEPTH) return node;
  if (env !== null && isParam(node)) return node.param < env.length ? env[node.param] : node;
  if (!Array.isArray(node) || typeof node[0] !== 'string') return node;
  const args = node.slice(1).map((c) => expandMacros(c, depth + 1, env));
  const m = Object.hasOwn(PRIMS, node[0]) ? null : MACROS.get(node[0]);
  return m && args.length === m.in.length ? expandMacros(m.body, depth + 1, args) : [node[0], ...args];
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
/** The guard features of a prompt, computed once and handed to guardWith for every guard tried on it. */
function promptFeatures(q) { return featuresOf(q); }
/** guardOk on the features of a prompt (promptFeatures): whether every feature of the guard holds. */
function guardWith(guard, f) { try { return isKv(f) && guardHolds(guard, f); } catch { return false; } }
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
  else if (familyOfName(c.pyramid[0]) !== 'render') errors.push('the apex is not a render primitive');
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
// the facts the cells read (grow/know.mjs packs, only the columns the cells name)
knowLoad([{"id":"fr-tidytuesday-christmas-novels-420215","columns":["title","gutenberg id","gutenberg author id"],"n":42,"cols":[{"f":"0A Christmas Carol in Prose; Being a Ghost Story of Christmas|0The Old Peabody Pew: A Christmas Romance of a Country Church|4Lost Word: A Christmas Legend of Long Ago|0Mrs. Budlong's Christmas Presents|0Uncle Noah's Christmas Inspiration|0Rosemary: A Christmas story|r|0Angel Unawares: A Story of Christmas Eve|1 Christmas Carol|cMystery: The Story of Three Wise Men|cStory Man in His Element: or, A New Way to Keep House|2Versailles Christmas-Tide|1nd Thus He Came: A Christmas Fantasy|2gel Unawares: A Story of Christmas Eve|0Christian Gellert's Last Christmas From \"German Tales\" Published by the American Publishers' Corporation|6mas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season.|aEve and Christmas Day: Ten Christmas stories|aHolidays at Merryvale The Merryvale Boys|aOutside of Eden|awith Grandma Elsie|9: A Story|1olonel Crockett's Co-operative Christmas|0Evenings at Donaldson Manor; Or, The Christmas Guest|0Mr. Blake's Walking-Stick: A Christmas Story for Boys and Girls|4Kris Kringle: A Christmas Tale|0On Christmas Day In The Evening|0Shakespeare's Christmas Gift to Queen Bess|0The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story|4Burglar and the Blizzard: A Christmas Story|4Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House|5hristmas Angel|eBooks of Mr. M.A. Titmarsh|eChild|4Doctor's Christmas Eve|4Fairies and the Christmas Child|5irst Christmas Tree: A Story of the Forest|4Prodigal Village: A Christmas Tale|4Romance of a Christmas Card|4Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking|4Upas Tree: A Christmas Story for all the Year|1wo Christmas Celebrations|0When the Yule Log Burns: A Christmas Story","sep":"|"},{"s":"46|1902|4384|12881|15826|17743|17743|42919|19337|10707|18770|10813|14606|42919|22665|20251|32455|23569|15552|14534|20516|22696|20018|52935|20180|19384|20210|8694|14835|38983|15709|2731|20453|42923|37547|16134|44796|17456|17937|16454|17006|17510","sep":"|","num":true},{"s":"37|266|362|2334|6328|3522|3796|3522|37|1324|8241|3695|5591|3796|8194|9186|650|7166|2497|2044|3531|2334|9034|3293|357|2216|9154|102|3939|2241|5282|313|2440|869|38912|362|4001|266|585|1253|7088|6328","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-4ea2a808","guard":[["has","christmas"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between A Christmas Mystery: The Story of Three Wise Men and Angel Unawares: A Story of Christmas Eve, which has the greater gutenberg id":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 10707).","whose gutenberg id is larger: The Christmas Books of Mr. M.A. Titmarsh or The Lost Word: A Christmas Legend of Long Ago":"The Lost Word: A Christmas Legend of Long Ago has the larger gutenberg id (4384 against 2731).","whose gutenberg id is larger: The Lost Word: A Christmas Legend of Long Ago or When the Yule Log Burns: A Christmas Story":"When the Yule Log Burns: A Christmas Story has the larger gutenberg id (17510 against 4384).","which has the larger gutenberg id, Evenings at Donaldson Manor; Or, The Christmas Guest or A Christmas Mystery: The Story of Three Wise Men":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 10707).","which has the larger gutenberg id, The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story or The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 8694).","which has the larger gutenberg id, On Christmas Day In The Evening or A Christmas Story Man in His Element: or, A New Way to Keep House":"On Christmas Day In The Evening has the larger gutenberg id (19384 against 18770).","between The First Christmas Tree: A Story of the Forest and Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season., which has the greater gutenberg id":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 16134).","between The Burglar and the Blizzard: A Christmas Story and On Christmas Day In The Evening, which has the greater gutenberg id":"On Christmas Day In The Evening has the larger gutenberg id (19384 against 14835).","between When the Yule Log Burns: A Christmas Story and Evenings at Donaldson Manor; Or, The Christmas Guest, which has the greater gutenberg id":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 17510).","whose gutenberg id is larger: A Christmas Mystery: The Story of Three Wise Men or The Christmas Angel":"The Christmas Angel has the larger gutenberg id (15709 against 10707).","between Shakespeare's Christmas Gift to Queen Bess and Christmas Outside of Eden, which has the greater gutenberg id":"Shakespeare's Christmas Gift to Queen Bess has the larger gutenberg id (20210 against 15552).","which has the larger gutenberg id, The Doctor's Christmas Eve or Christmas Outside of Eden":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 15552).","between The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House and The Romance of a Christmas Card, which has the greater gutenberg id":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 17456).","between Rosemary: A Christmas story and The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking, which has the greater gutenberg id":"The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking has the larger gutenberg id (17937 against 17743).","which has the larger gutenberg id, The Old Peabody Pew: A Christmas Romance of a Country Church or The Christmas Books of Mr. M.A. Titmarsh":"The Christmas Books of Mr. M.A. Titmarsh has the larger gutenberg id (2731 against 1902).","between Mr. Kris Kringle: A Christmas Tale and The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story, which has the greater gutenberg id":"Mr. Kris Kringle: A Christmas Tale has the larger gutenberg id (20180 against 8694).","between The Christmas Child and A Christmas Story Man in His Element: or, A New Way to Keep House, which has the greater gutenberg id":"The Christmas Child has the larger gutenberg id (20453 against 18770).","which has the larger gutenberg id, Christmas with Grandma Elsie or The Christmas Angel":"The Christmas Angel has the larger gutenberg id (15709 against 14534).","which has the larger gutenberg id, Shakespeare's Christmas Gift to Queen Bess or The Doctor's Christmas Eve":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 20210).","whose gutenberg id is larger: Angel Unawares: A Story of Christmas Eve or Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season.":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 20251).","which has the larger gutenberg id, Uncle Noah's Christmas Inspiration or Angel Unawares: A Story of Christmas Eve":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 15826).","which has the larger gutenberg id, The Christmas Angel or Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season.":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 15709).","which has the larger gutenberg id, Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. or The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 17937).","between The Christmas Angel and The First Christmas Tree: A Story of the Forest, which has the greater gutenberg id":"The First Christmas Tree: A Story of the Forest has the larger gutenberg id (16134 against 15709).","whose gutenberg id is larger: The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking or The Upas Tree: A Christmas Story for all the Year":"The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking has the larger gutenberg id (17937 against 16454).","between Angel Unawares: A Story of Christmas Eve and A Christmas Carol in Prose; Being a Ghost Story of Christmas, which has the greater gutenberg id":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 46).","whose gutenberg id is larger: A Christmas Story Man in His Element: or, A New Way to Keep House or Colonel Crockett's Co-operative Christmas":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 18770).","which has the larger gutenberg id, On Christmas Day In The Evening or Colonel Crockett's Co-operative Christmas":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 19384).","between The Romance of a Christmas Card and The Burglar and the Blizzard: A Christmas Story, which has the greater gutenberg id":"The Romance of a Christmas Card has the larger gutenberg id (17456 against 14835).","whose gutenberg id is larger: Shakespeare's Christmas Gift to Queen Bess or The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 20210).","whose gutenberg id is larger: The Romance of a Christmas Card or The Christmas Child":"The Christmas Child has the larger gutenberg id (20453 against 17456).","between The Upas Tree: A Christmas Story for all the Year and Shakespeare's Christmas Gift to Queen Bess, which has the greater gutenberg id":"Shakespeare's Christmas Gift to Queen Bess has the larger gutenberg id (20210 against 16454).","between The Old Peabody Pew: A Christmas Romance of a Country Church and Colonel Crockett's Co-operative Christmas, which has the greater gutenberg id":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 1902).","which has the larger gutenberg id, The Lost Word: A Christmas Legend of Long Ago or A Christmas Carol":"A Christmas Carol has the larger gutenberg id (19337 against 4384).","between The Prodigal Village: A Christmas Tale and The Lost Word: A Christmas Legend of Long Ago, which has the greater gutenberg id":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 4384).","whose gutenberg id is larger: The Christmas Angel or Angel Unawares: A Story of Christmas Eve":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 15709).","whose gutenberg id is larger: The Burglar and the Blizzard: A Christmas Story or The Christmas Child":"The Christmas Child has the larger gutenberg id (20453 against 14835).","between A Christmas Carol and When the Yule Log Burns: A Christmas Story, which has the greater gutenberg id":"A Christmas Carol has the larger gutenberg id (19337 against 17510).","between Colonel Crockett's Co-operative Christmas and The Christmas Books of Mr. M.A. Titmarsh, which has the greater gutenberg id":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 2731).","whose gutenberg id is larger: The Prodigal Village: A Christmas Tale or The Christmas Books of Mr. M.A. Titmarsh":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 2731).","between Christmas with Grandma Elsie and Uncle Noah's Christmas Inspiration, which has the greater gutenberg id":"Uncle Noah's Christmas Inspiration has the larger gutenberg id (15826 against 14534).","whose gutenberg id is larger: The Christmas Child or On Christmas Day In The Evening":"The Christmas Child has the larger gutenberg id (20453 against 19384).","between Christmas Outside of Eden and Christmas: A Story, which has the greater gutenberg id":"Christmas: A Story has the larger gutenberg id (20516 against 15552).","which has the larger gutenberg id, The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking or The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story":"The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking has the larger gutenberg id (17937 against 8694).","between The Doctor's Christmas Eve and The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House, which has the greater gutenberg id":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 38983).","which has the larger gutenberg id, A Christmas Carol in Prose; Being a Ghost Story of Christmas or Rosemary: A Christmas story":"Rosemary: A Christmas story has the larger gutenberg id (17743 against 46).","which has the larger gutenberg id, The Upas Tree: A Christmas Story for all the Year or Mr. Kris Kringle: A Christmas Tale":"Mr. Kris Kringle: A Christmas Tale has the larger gutenberg id (20180 against 16454).","which has the larger gutenberg id, Colonel Crockett's Co-operative Christmas or The Lost Word: A Christmas Legend of Long Ago":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 4384).","whose gutenberg id is larger: Rosemary: A Christmas story or Mr. Kris Kringle: A Christmas Tale":"Mr. Kris Kringle: A Christmas Tale has the larger gutenberg id (20180 against 17743).","whose gutenberg id is larger: Mr. Kris Kringle: A Christmas Tale or The Doctor's Christmas Eve":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 20180).","between The Christmas Books of Mr. M.A. Titmarsh and A Christmas Carol, which has the greater gutenberg id":"A Christmas Carol has the larger gutenberg id (19337 against 2731).","which has the larger gutenberg id, A Christmas Story Man in His Element: or, A New Way to Keep House or The Prodigal Village: A Christmas Tale":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 18770).","between A Christmas Story Man in His Element: or, A New Way to Keep House and The Old Peabody Pew: A Christmas Romance of a Country Church, which has the greater gutenberg id":"A Christmas Story Man in His Element: or, A New Way to Keep House has the larger gutenberg id (18770 against 1902).","between The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking and Mr. Kris Kringle: A Christmas Tale, which has the greater gutenberg id":"Mr. Kris Kringle: A Christmas Tale has the larger gutenberg id (20180 against 17937).","which has the larger gutenberg id, Christmas Outside of Eden or The Romance of a Christmas Card":"The Romance of a Christmas Card has the larger gutenberg id (17456 against 15552).","between Uncle Noah's Christmas Inspiration and The Christmas Angel, which has the greater gutenberg id":"Uncle Noah's Christmas Inspiration has the larger gutenberg id (15826 against 15709).","which has the larger gutenberg id, The Romance of a Christmas Card or Christmas: A Story":"Christmas: A Story has the larger gutenberg id (20516 against 17456).","whose gutenberg id is larger: The Old Peabody Pew: A Christmas Romance of a Country Church or The Prodigal Village: A Christmas Tale":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 1902).","which has the larger gutenberg id, Christmas: A Story or On Christmas Day In The Evening":"Christmas: A Story has the larger gutenberg id (20516 against 19384).","between And Thus He Came: A Christmas Fantasy and A Christmas Mystery: The Story of Three Wise Men, which has the greater gutenberg id":"And Thus He Came: A Christmas Fantasy has the larger gutenberg id (14606 against 10707).","which has the larger gutenberg id, A Christmas Mystery: The Story of Three Wise Men or Uncle Noah's Christmas Inspiration":"Uncle Noah's Christmas Inspiration has the larger gutenberg id (15826 against 10707).","whose gutenberg id is larger: The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story or Shakespeare's Christmas Gift to Queen Bess":"Shakespeare's Christmas Gift to Queen Bess has the larger gutenberg id (20210 against 8694).","which has the larger gutenberg id, The Christmas Books of Mr. M.A. Titmarsh or When the Yule Log Burns: A Christmas Story":"When the Yule Log Burns: A Christmas Story has the larger gutenberg id (17510 against 2731).","whose gutenberg id is larger: Colonel Crockett's Co-operative Christmas or A Christmas Carol":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 19337).","between Christmas: A Story and The Christmas Child, which has the greater gutenberg id":"Christmas: A Story has the larger gutenberg id (20516 against 20453).","which has the larger gutenberg id, Mr. Kris Kringle: A Christmas Tale or Shakespeare's Christmas Gift to Queen Bess":"Shakespeare's Christmas Gift to Queen Bess has the larger gutenberg id (20210 against 20180).","whose gutenberg id is larger: Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. or A Christmas Carol in Prose; Being a Ghost Story of Christmas":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 46).","which has the larger gutenberg id, The Prodigal Village: A Christmas Tale or Colonel Crockett's Co-operative Christmas":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 22696).","whose gutenberg id is larger: The Christmas Child or The Prodigal Village: A Christmas Tale":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 20453).","which has the larger gutenberg id, Angel Unawares: A Story of Christmas Eve or The First Christmas Tree: A Story of the Forest":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 16134).","which has the larger gutenberg id, A Christmas Carol or And Thus He Came: A Christmas Fantasy":"A Christmas Carol has the larger gutenberg id (19337 against 14606).","whose gutenberg id is larger: And Thus He Came: A Christmas Fantasy or Christmas with Grandma Elsie":"And Thus He Came: A Christmas Fantasy has the larger gutenberg id (14606 against 14534).","whose gutenberg id is larger: Christmas: A Story or A Christmas Story Man in His Element: or, A New Way to Keep House":"Christmas: A Story has the larger gutenberg id (20516 against 18770).","which has the larger gutenberg id, The Burglar and the Blizzard: A Christmas Story or A Christmas Story Man in His Element: or, A New Way to Keep House":"A Christmas Story Man in His Element: or, A New Way to Keep House has the larger gutenberg id (18770 against 14835).","whose gutenberg id is larger: On Christmas Day In The Evening or The Old Peabody Pew: A Christmas Romance of a Country Church":"On Christmas Day In The Evening has the larger gutenberg id (19384 against 1902).","between A Christmas Carol in Prose; Being a Ghost Story of Christmas and The Upas Tree: A Christmas Story for all the Year, which has the greater gutenberg id":"The Upas Tree: A Christmas Story for all the Year has the larger gutenberg id (16454 against 46).","which has the larger gutenberg id, The Burglar and the Blizzard: A Christmas Story or Christmas: A Story":"Christmas: A Story has the larger gutenberg id (20516 against 14835).","which has the larger gutenberg id, The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House or The Burglar and the Blizzard: A Christmas Story":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 14835).","whose gutenberg id is larger: When the Yule Log Burns: A Christmas Story or And Thus He Came: A Christmas Fantasy":"When the Yule Log Burns: A Christmas Story has the larger gutenberg id (17510 against 14606).","between Evenings at Donaldson Manor; Or, The Christmas Guest and Christmas with Grandma Elsie, which has the greater gutenberg id":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 14534).","whose gutenberg id is larger: The First Christmas Tree: A Story of the Forest or Rosemary: A Christmas story":"Rosemary: A Christmas story has the larger gutenberg id (17743 against 16134).","between The Lost Word: A Christmas Legend of Long Ago and And Thus He Came: A Christmas Fantasy, which has the greater gutenberg id":"And Thus He Came: A Christmas Fantasy has the larger gutenberg id (14606 against 4384).","whose gutenberg id is larger: Evenings at Donaldson Manor; Or, The Christmas Guest or Uncle Noah's Christmas Inspiration":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 15826).","whose gutenberg id is larger: A Christmas Carol or Evenings at Donaldson Manor; Or, The Christmas Guest":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 19337).","between Christmas: A Story and The Old Peabody Pew: A Christmas Romance of a Country Church, which has the greater gutenberg id":"Christmas: A Story has the larger gutenberg id (20516 against 1902).","whose gutenberg id is larger: Christmas Outside of Eden or The Burglar and the Blizzard: A Christmas Story":"Christmas Outside of Eden has the larger gutenberg id (15552 against 14835).","between On Christmas Day In The Evening and The Prodigal Village: A Christmas Tale, which has the greater gutenberg id":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 19384).","whose gutenberg id is larger: The Doctor's Christmas Eve or The Romance of a Christmas Card":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 17456).","which has the larger gutenberg id, Rosemary: A Christmas story or The Upas Tree: A Christmas Story for all the Year":"Rosemary: A Christmas story has the larger gutenberg id (17743 against 16454).","between The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story and The Doctor's Christmas Eve, which has the greater gutenberg id":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 8694).","whose gutenberg id is larger: The Upas Tree: A Christmas Story for all the Year or The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story":"The Upas Tree: A Christmas Story for all the Year has the larger gutenberg id (16454 against 8694).","between Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. and Rosemary: A Christmas story, which has the greater gutenberg id":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 17743).","whose gutenberg id is larger: Christmas with Grandma Elsie or A Christmas Mystery: The Story of Three Wise Men":"Christmas with Grandma Elsie has the larger gutenberg id (14534 against 10707).","which has the larger gutenberg id, When the Yule Log Burns: A Christmas Story or Christmas with Grandma Elsie":"When the Yule Log Burns: A Christmas Story has the larger gutenberg id (17510 against 14534).","which has the larger gutenberg id, The First Christmas Tree: A Story of the Forest or A Christmas Carol in Prose; Being a Ghost Story of Christmas":"The First Christmas Tree: A Story of the Forest has the larger gutenberg id (16134 against 46).","whose gutenberg id is larger: A Christmas Carol in Prose; Being a Ghost Story of Christmas or The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking":"The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking has the larger gutenberg id (17937 against 46).","whose gutenberg id is larger: The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House or Christmas Outside of Eden":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 15552).","which has the larger gutenberg id, And Thus He Came: A Christmas Fantasy or Evenings at Donaldson Manor; Or, The Christmas Guest":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 14606).","whose gutenberg id is larger: Uncle Noah's Christmas Inspiration or The First Christmas Tree: A Story of the Forest":"The First Christmas Tree: A Story of the Forest has the larger gutenberg id (16134 against 15826).","which has the larger gutenberg id, The Christmas Child or The Old Peabody Pew: A Christmas Romance of a Country Church":"The Christmas Child has the larger gutenberg id (20453 against 1902)."}}},
{"id":"n-c71e5ce8","guard":[["hasAny",["ago","angel","bess","bigger than","blizzard","burns","came","card","child","colonel","day","donaldson","eden","element","elsie","exceeds","greater than","inspiration","is","item number","larger than","more than","mr","nth","position","tale"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","what"]],["not",["has","lesser"]],["not",["has","add"]]],"pyramid":["render.str",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-1afa6e88","guard":[["hasAny",["ago","angel","bess","bigger than","blizzard","burns","came","card","child","colonel","day","donaldson","eden","element","elsie","exceeds","greater than","inspiration","invert case","is","item number","larger than","more than","mr","nth","position","swap case","tale","toggle case"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","what"]],["not",["has","lesser"]],["not",["has","add"]]],"pyramid":["render.str",["transform.swapCase",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]]],"mem":null},
{"id":"n-506c9bf9","guard":[["hasAny",["ago","all caps","angel","bess","bigger than","blizzard","burns","came","capital letters","capitals","card","child","colonel","day","donaldson","eden","element","elsie","exceeds","greater than","inspiration","is","item number","larger than","more than","mr","nth","position","tale","upper case","uppercase"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","what"]],["not",["has","lesser"]],["not",["has","add"]]],"pyramid":["render.str",["transform.upper",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]]],"mem":null},
{"id":"n-7d15dd2a","guard":[["hasAny",["ago","angel","bess","bigger than","blizzard","burns","came","card","child","colonel","day","donaldson","eden","element","elsie","exceeds","greater than","inspiration","is","item number","larger than","lower case","lowercase","more than","mr","nth","position","small letters","tale"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","what"]],["not",["has","lesser"]],["not",["has","add"]]],"pyramid":["render.str",["transform.lower",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]]],"mem":null},
{"id":"n-d6b9e73c","guard":[["hasAny",["ago","angel","bess","bigger than","blizzard","burns","came","capitalise","capitalize","capitalize each word","card","child","colonel","day","donaldson","eden","element","elsie","exceeds","greater than","inspiration","is","item number","larger than","more than","mr","nth","position","tale","title case"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","what"]],["not",["has","lesser"]],["not",["has","add"]]],"pyramid":["render.str",["transform.title",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]]],"mem":null},
{"id":"n-69838098","guard":[["has","christmas"],["not",["has","author"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"larger: The Christmas Books of Mr. M.A. Titmarsh or The Lost Word: A Christmas Legend of Long Ago":"The Lost Word: A Christmas Legend of Long Ago has the larger gutenberg id (4384 against 2731).","larger: The Lost Word: A Christmas Legend of Long Ago or When the Yule Log Burns: A Christmas Story":"When the Yule Log Burns: A Christmas Story has the larger gutenberg id (17510 against 4384).","larger: A Christmas Mystery: The Story of Three Wise Men or The Christmas Angel":"The Christmas Angel has the larger gutenberg id (15709 against 10707).","larger: Angel Unawares: A Story of Christmas Eve or Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 20251).","larger: The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking or The Upas Tree: A Christmas Story for all the Year":"The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking has the larger gutenberg id (17937 against 16454).","larger: A Christmas Story Man in His Element: or, A New Way to Keep House or Colonel Crockett's Co-operative Christmas":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 18770).","larger: Shakespeare's Christmas Gift to Queen Bess or The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 20210).","larger: The Romance of a Christmas Card or The Christmas Child":"The Christmas Child has the larger gutenberg id (20453 against 17456).","larger: The Christmas Angel or Angel Unawares: A Story of Christmas Eve":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 15709).","larger: The Burglar and the Blizzard: A Christmas Story or The Christmas Child":"The Christmas Child has the larger gutenberg id (20453 against 14835).","larger: The Prodigal Village: A Christmas Tale or The Christmas Books of Mr. M.A. Titmarsh":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 2731).","larger: The Christmas Child or On Christmas Day In The Evening":"The Christmas Child has the larger gutenberg id (20453 against 19384).","larger: Rosemary: A Christmas story or Mr. Kris Kringle: A Christmas Tale":"Mr. Kris Kringle: A Christmas Tale has the larger gutenberg id (20180 against 17743).","larger: Mr. Kris Kringle: A Christmas Tale or The Doctor's Christmas Eve":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 20180).","larger: The Old Peabody Pew: A Christmas Romance of a Country Church or The Prodigal Village: A Christmas Tale":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 1902).","larger: The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story or Shakespeare's Christmas Gift to Queen Bess":"Shakespeare's Christmas Gift to Queen Bess has the larger gutenberg id (20210 against 8694).","larger: Colonel Crockett's Co-operative Christmas or A Christmas Carol":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 19337).","larger: Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. or A Christmas Carol in Prose; Being a Ghost Story of Christmas":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 46).","larger: The Christmas Child or The Prodigal Village: A Christmas Tale":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 20453).","larger: And Thus He Came: A Christmas Fantasy or Christmas with Grandma Elsie":"And Thus He Came: A Christmas Fantasy has the larger gutenberg id (14606 against 14534).","larger: Christmas: A Story or A Christmas Story Man in His Element: or, A New Way to Keep House":"Christmas: A Story has the larger gutenberg id (20516 against 18770).","larger: On Christmas Day In The Evening or The Old Peabody Pew: A Christmas Romance of a Country Church":"On Christmas Day In The Evening has the larger gutenberg id (19384 against 1902).","larger: When the Yule Log Burns: A Christmas Story or And Thus He Came: A Christmas Fantasy":"When the Yule Log Burns: A Christmas Story has the larger gutenberg id (17510 against 14606).","larger: The First Christmas Tree: A Story of the Forest or Rosemary: A Christmas story":"Rosemary: A Christmas story has the larger gutenberg id (17743 against 16134).","larger: Evenings at Donaldson Manor; Or, The Christmas Guest or Uncle Noah's Christmas Inspiration":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 15826).","larger: A Christmas Carol or Evenings at Donaldson Manor; Or, The Christmas Guest":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 19337).","larger: Christmas Outside of Eden or The Burglar and the Blizzard: A Christmas Story":"Christmas Outside of Eden has the larger gutenberg id (15552 against 14835).","larger: The Doctor's Christmas Eve or The Romance of a Christmas Card":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 17456).","larger: The Upas Tree: A Christmas Story for all the Year or The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story":"The Upas Tree: A Christmas Story for all the Year has the larger gutenberg id (16454 against 8694).","larger: Christmas with Grandma Elsie or A Christmas Mystery: The Story of Three Wise Men":"Christmas with Grandma Elsie has the larger gutenberg id (14534 against 10707).","larger: A Christmas Carol in Prose; Being a Ghost Story of Christmas or The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking":"The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking has the larger gutenberg id (17937 against 46).","larger: The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House or Christmas Outside of Eden":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 15552).","larger: Uncle Noah's Christmas Inspiration or The First Christmas Tree: A Story of the Forest":"The First Christmas Tree: A Story of the Forest has the larger gutenberg id (16134 against 15826)."}}},
{"id":"n-7c00aa20","guard":[["hasAny",["bigger than","colonel","donaldson","element","elsie","exceeds","ghost","greater than","item number","larger than","men","more than","nth","position","prodigal"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","what"]],["not",["has","lesser"]],["not",["has","add"]]],"pyramid":["render.str",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-2899f8fd","guard":[["hasAny",["all caps","bigger than","capital letters","capitals","colonel","donaldson","element","elsie","exceeds","ghost","greater than","item number","larger than","men","more than","nth","position","prodigal","upper case","uppercase"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","what"]],["not",["has","lesser"]],["not",["has","add"]]],"pyramid":["render.str",["transform.upper",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]]],"mem":null},
{"id":"n-2e373da0","guard":[["hasAny",["bigger than","colonel","donaldson","element","elsie","exceeds","ghost","greater than","invert case","item number","larger than","men","more than","nth","position","prodigal","swap case","toggle case"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","what"]],["not",["has","lesser"]],["not",["has","add"]]],"pyramid":["render.str",["transform.swapCase",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]]],"mem":null},
{"id":"n-43f11c26","guard":[["hasAny",["bigger than","colonel","donaldson","element","elsie","exceeds","ghost","greater than","item number","larger than","lower case","lowercase","men","more than","nth","position","prodigal","small letters"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","what"]],["not",["has","lesser"]],["not",["has","add"]]],"pyramid":["render.str",["transform.lower",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]]],"mem":null},
{"id":"n-cb48070a","guard":[["hasAny",["bigger than","capitalise","capitalize","capitalize each word","colonel","donaldson","element","elsie","exceeds","ghost","greater than","item number","larger than","men","more than","nth","position","prodigal","title case"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","what"]],["not",["has","lesser"]],["not",["has","add"]]],"pyramid":["render.str",["transform.title",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]]],"mem":null},
{"id":"n-c5548d2b","guard":[["hasAny",["a to z","alphabetical","alphabetize","element","ghost","item number","men","nth","position","prodigal","sort"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","what"]],["not",["has","lesser"]],["not",["has","add"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]],{"lit":2}]],"mem":null},
{"id":"n-406a5e91","guard":[["hasAny",["abbots","ago","angel","church","delete","element","first","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-82911c13","guard":[["hasAny",["abbots","came","colonel","elsie","item number","nth","position","prodigal","romance","separate by","split","split by"]],["not",["has","author"]],["not",["has","smaller"]],["not",["has","compare"]],["not",["has","lesser"]],["not",["has","what"]],["not",["has","add"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"story"}]]],"mem":null},
{"id":"n-b834933c","guard":[["hasAny",["abbots","came","colonel","delete","elsie","item number","nth","position","prodigal","remove","romance","strip out","without"]],["not",["has","author"]],["not",["has","smaller"]],["not",["has","compare"]],["not",["has","lesser"]],["not",["has","what"]],["not",["has","add"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"story"}]]],"mem":null},
{"id":"n-887a849d","guard":[["hasAny",["abbots","came","church","colonel","day","delete","element","elsie","item number","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-e95eb0fa","guard":[["hasAny",["all","bess","blizzard","card","day","divisor count","donaldson","element","how many divisors","how many factors","inspiration","item number","nth","number of divisors","position","rosemary"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","what"]],["not",["has","lesser"]],["not",["has","smaller"]],["not",["has","add"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-72b50b25","guard":[["hasAny",["ago","bess","books","church","colonel","delete","item number","nth","position","remove","strip out","tale","without"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","lesser"]],["not",["has","sum"]],["not",["has","makes"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.before",{"lit":"story"}]]],"mem":null},
{"id":"n-d05cbcbc","guard":[["hasAny",["abbots","church","delete","item number","kringle","nth","position","remove","strip out","without"]],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.after",{"lit":"larger"}]]],"mem":null},
{"id":"n-031a11d1","guard":[["hasAny",["bess","church","colonel","delete","eden","item number","nth","position","remove","strip out","tale","without"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","angel"]],["not",["has","lesser"]],["not",["has","makes"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.after",{"lit":"story"}]]],"mem":null},
{"id":"n-28df03b9","guard":[["hasAny",["bess","church","colonel","eden","item number","nth","position","separate by","split","split by","tale"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","angel"]],["not",["has","lesser"]],["not",["has","makes"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.after",{"lit":"story"}]]],"mem":null},
{"id":"n-b704088f","guard":[["hasAny",["abbots","church","delete","item number","kringle","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.after",{"lit":"has"}]]],"mem":null},
{"id":"n-675c7bbd","guard":[["hasAny",["angel","bess","colonel","donaldson","element","how many vowels","item number","nth","number of vowels","position","story","vowel count"]],["not",["has","author"]],["has","which"],["words<=",20],["not",["has","smaller"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-786613da","guard":[["hasAny",["abbots","child","church","delete","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"has"}]]],"mem":null},
{"id":"n-aa77ed1e","guard":[["hasAny",["ago","angel","delete","element","first","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-e0df69f8","guard":[["hasAny",["ago","bess","delete","element","inspiration","item number","mr","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","smaller"]],["not",["has","what"]],["not",["has","compare"]],["not",["has","lesser"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.before",{"lit":"story"}]]],"mem":null},
{"id":"n-43073f3d","guard":[["hasAny",["burns","delete","element","inspiration","item number","nth","position","remove","rosemary","strip out","without"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","makes"]],["not",["has","add"]],["not",["has","sum"]],["not",["has","lesser"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.before",{"lit":"of"}]]],"mem":null},
{"id":"n-4560ba81","guard":[["hasAny",["all","church","colonel","delete","item number","nth","position","prodigal","remove","rosemary","strip out","without"]],["not",["has","author"]],["not",["has","compare"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-b20cf6c9","guard":[["hasAny",["all","church","colonel","item number","nth","position","prodigal","rosemary","separate by","split","split by"]],["not",["has","author"]],["not",["has","compare"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-b99527a0","guard":[["hasAny",["abbots","child","colonel","day","delete","eden","item number","nth","position","prodigal","remove","strip out","unawares","without"]],["not",["has","author"]],["not",["has","add"]],["not",["has","compare"]],["not",["has","makes"]],["not",["has","smaller"]],["not",["has","stories"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.before",{"lit":"to"}]]],"mem":null},
{"id":"n-ebbe0a26","guard":[["hasAny",["all","church","colonel","delete","item number","nth","position","prodigal","remove","rosemary","strip out","without"]],["not",["has","author"]],["not",["has","compare"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-0a9972bf","guard":[["hasAny",["bess","carol","child","church","element","how many vowels","item number","kringle","nth","number of vowels","position","vowel count"]],["not",["has","author"]],["not",["has","eve"]],["not",["has","smaller"]],["not",["has","add"]],["not",["has","compare"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["aggregate.vowels",["sense.unit"]]]],"mem":null},
{"id":"n-1f3067cc","guard":[["hasAny",["abbots","church","colonel","consonant count","how many consonants","item number","nth","number of consonants","position"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","lesser"]],["not",["has","angel"]],["has","the"]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-e528a94a","guard":[["hasAny",["between","colonel","delete","element","item number","nth","position","remove","strip out","tale","without"]],["not",["has","author"]],["not",["has","lesser"]],["has","which"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.unit"]]],"mem":null},
{"id":"n-2ffc47d5","guard":[["hasAny",["came","church","colonel","delete","elsie","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","lesser"]],["not",["has","sum"]],["not",["has","add"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.before",{"lit":"story"}]]],"mem":null},
{"id":"n-90cfff86","guard":[["hasAny",["abbots","all","child","colonel","delete","item number","nth","position","remove","strip out","tale","without"]],["not",["has","add"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","makes"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.before",{"lit":"to"}]]],"mem":null},
{"id":"n-c7cc4338","guard":[["hasAny",["child","colonel","day","eden","item number","nth","position","prodigal","separate by","split","split by","unawares"]],["not",["has","author"]],["not",["has","add"]],["not",["has","compare"]],["not",["has","makes"]],["not",["has","smaller"]],["not",["has","stories"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"to"}]]],"mem":null},
{"id":"n-d2fdbba3","guard":[["hasAny",["child","colonel","day","delete","eden","item number","nth","position","prodigal","remove","strip out","unawares","without"]],["not",["has","author"]],["not",["has","add"]],["not",["has","compare"]],["not",["has","makes"]],["not",["has","smaller"]],["not",["has","stories"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"to"}]]],"mem":null},
{"id":"n-ed6c7848","guard":[["hasAny",["abbots","church","delete","item number","nth","position","remove","strip out","without"]],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"larger"}]]],"mem":null},
{"id":"n-ff43bf4b","guard":[["hasAny",["characters from","church","item number","letters from to","nth","position","slice of the text","substring"]],["words<=",25],["not",["has","compare"]],["not",["has","eden"]],["not",["has","lesser"]],["not",["has","add"]],["not",["has","carol"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":1},{"lit":46}]],"mem":null},
{"id":"n-04cc8442","guard":[["hasAny",["abbots","church","join","joined with","separated by"]],["not",["has","author"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.after",{"lit":"larger"}]]],"mem":null},
{"id":"n-1b5d5fff","guard":[["hasAny",["abbots","church","join","joined with","separated by"]],["not",["has","author"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.before",{"lit":"has"}]]],"mem":null},
{"id":"n-1c285fe4","guard":[["hasAny",["church","join","joined with","separated by"]],["words<=",25],["not",["has","compare"]],["not",["has","eden"]],["not",["has","lesser"]],["not",["has","add"]],["not",["has","carol"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.before",{"lit":"of"}]]],"mem":null},
{"id":"n-59229917","guard":[["hasAny",["abbots","child","colonel","day","join","joined with","prodigal","separated by","unawares"]],["has","or"],["not",["has","author"]],["not",["has","add"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.after",{"lit":"to"}]]],"mem":null},
{"id":"n-8393bb1e","guard":[["hasAny",["church","join","joined with","separated by"]],["words<=",25],["not",["has","compare"]],["not",["has","eden"]],["not",["has","lesser"]],["not",["has","add"]],["not",["has","carol"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-8cb09b7c","guard":[["hasAny",["abbots","child","colonel","day","join","joined with","prodigal","separated by","unawares"]],["has","or"],["not",["has","author"]],["not",["has","add"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.before",{"lit":"to"}]]],"mem":null},
{"id":"n-98e929e5","guard":[["hasAny",["abbots","church","element","join","joined with","separated by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-be6d0188","guard":[["hasAny",["abbots","church","element","join","joined with","separated by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-f80a573f","guard":[["hasAny",["abbots","church","join","joined with","separated by"]],["not",["has","author"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.after",{"lit":"has"}]]],"mem":null},
{"id":"n-fdb0d356","guard":[["hasAny",["abbots","church","join","joined with","separated by"]],["not",["has","author"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.before",{"lit":"larger"}]]],"mem":null},
{"id":"n-4d1de923","guard":[["hasAny",["abbots","child","church","count","element","eve","how many","how many items","item number","nth","number of items","position"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-15607366","guard":[["hasAny",["abbots","child","church","copies","count","element","eve","how many","how many items","item number","nth","number of items","position","repeat","say it times"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-7428b5c1","guard":[["hasAny",["abbots","child","church","count","element","eve","how many","how many items","item number","nth","number of items","position"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-a424e014","guard":[["hasAny",["abbots","child","church","count","element","eve","how many","how many items","item number","nth","number of items","position"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-c84ddd77","guard":[["hasAny",["abbots","child","church","count","element","eve","how many","how many items","item number","nth","number of items","position"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-9bff3fc1","guard":[["hasAny",["church","element","how many vowels","item number","nth","number of vowels","position","vowel count"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","lesser"]],["not",["has","smaller"]],["words<=",26],["not",["has","add"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-f987e96c","guard":[["hasAny",["character count","day","element","how many characters","item number","length","nth","number of characters","position","tree"]],["has","greater"],["not",["has","author"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-6607c824","guard":[["hasAny",["abbots","child","church","delete","element","eve","item number","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.unit"]]],"mem":null},
{"id":"n-17807f4e","guard":[["hasAny",["between","church","colonel","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.before",{"lit":"on"}]]],"mem":null},
{"id":"n-32085f10","guard":[["hasAny",["all","blizzard","colonel","delete","element","item number","nth","position","prodigal","remove","rosemary","strip out","without"]],["not",["has","author"]],["has","which"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-45396d8d","guard":[["hasAny",["angel","child","church","delete","first","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","fairies"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-5f0fb2f8","guard":[["hasAny",["between","change to","element","item number","nth","position","replace","substitute","swap","tale"]],["not",["has","author"]],["not",["has","lesser"]],["has","which"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.subject"],["sense.unit"]]],"mem":null},
{"id":"n-61a96a26","guard":[["hasAny",["abbots","change to","child","church","element","eve","item number","nth","position","replace","substitute","swap"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.subject"],["sense.unit"]]],"mem":null},
{"id":"n-8bceaf2f","guard":[["hasAny",["between","church","colonel","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-9e197a3c","guard":[["hasAny",["burns","child","delete","element","item number","nth","position","remove","rosemary","strip out","without"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","makes"]],["not",["has","add"]],["not",["has","sum"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-b8c267b1","guard":[["hasAny",["abbots","child","church","element","eve","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.wordCount"],["sense.unit"]]],"mem":null},
{"id":"n-c31d82e5","guard":[["hasAny",["all","blizzard","colonel","element","item number","nth","position","prodigal","rosemary","separate by","split","split by"]],["not",["has","author"]],["has","which"]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-ca21c14f","guard":[["hasAny",["all","blizzard","colonel","delete","element","item number","nth","position","prodigal","remove","rosemary","strip out","without"]],["not",["has","author"]],["has","which"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-e087c61b","guard":[["hasAny",["burns","child","element","item number","nth","position","rosemary","separate by","split","split by"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","makes"]],["not",["has","add"]],["not",["has","sum"]],["not",["has","smaller"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-f11db984","guard":[["hasAny",["bess","delete","element","item number","kringle","nth","position","remove","strip out","without"]],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"larger"}]]],"mem":null},
{"id":"n-fe798d15","guard":[["hasAny",["between","church","colonel","element","item number","nth","position","separate by","split","split by"]],["not",["has","author"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-141dad46","guard":[["hasAny",["bigger than","blizzard","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["words<=",22],["not",["has","author"]],["not",["has","compare"]],["not",["has","colonel"]],["not",["has","fairies"]],["not",["has","inspiration"]]],"pyramid":["render.str",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-57118a52","guard":[["hasAny",["all caps","bigger than","blizzard","capital letters","capitals","element","exceeds","greater than","item number","larger than","more than","nth","position","upper case","uppercase"]],["words<=",22],["not",["has","author"]],["not",["has","compare"]],["not",["has","colonel"]],["not",["has","fairies"]],["not",["has","inspiration"]]],"pyramid":["render.str",["transform.upper",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-d1cd738b","guard":[["hasAny",["bigger than","blizzard","element","exceeds","greater than","item number","larger than","lower case","lowercase","more than","nth","position","small letters"]],["words<=",22],["not",["has","author"]],["not",["has","compare"]],["not",["has","colonel"]],["not",["has","fairies"]],["not",["has","inspiration"]]],"pyramid":["render.str",["transform.lower",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-e27fe366","guard":[["hasAny",["bigger than","blizzard","element","exceeds","greater than","invert case","item number","larger than","more than","nth","position","swap case","toggle case"]],["words<=",22],["not",["has","author"]],["not",["has","compare"]],["not",["has","colonel"]],["not",["has","fairies"]],["not",["has","inspiration"]]],"pyramid":["render.str",["transform.swapCase",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-eb03d90f","guard":[["hasAny",["bigger than","blizzard","capitalise","capitalize","capitalize each word","element","exceeds","greater than","item number","larger than","more than","nth","position","title case"]],["words<=",22],["not",["has","author"]],["not",["has","compare"]],["not",["has","colonel"]],["not",["has","fairies"]],["not",["has","inspiration"]]],"pyramid":["render.str",["transform.title",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-be620717","guard":[["hasAny",["bess","character count","chicken","colonel","doctors","how many characters","item number","length","nth","number of characters","position"]],["has","greater"],["not",["has","author"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-97a9faec","guard":[["hasAny",["angel","between","element","item number","kringle","log base","logarithm","nth","position"]],["not",["has","author"]],["not",["has","colonel"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["compute.log",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-4c6747fa","guard":[["hasAny",["abbots","blizzard","church","colonel","count","how many","how many items","item number","nth","number of items","position"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","add"]],["not",["has","lesser"]],["not",["has","makes"]],["not",["has","books"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-4dbf7087","guard":[["hasAny",["abbots","blizzard","church","colonel","copies","count","how many","how many items","item number","nth","number of items","position","repeat","say it times"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","add"]],["not",["has","lesser"]],["not",["has","makes"]],["not",["has","books"]]],"pyramid":["render.str",["transform.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-bfa3d98c","guard":[["hasAny",["abbots","blizzard","church","colonel","count","how many","how many items","item number","nth","number of items","position"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","add"]],["not",["has","lesser"]],["not",["has","makes"]],["not",["has","books"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-d52c5c88","guard":[["hasAny",["abbots","blizzard","church","colonel","count","how many","how many items","item number","nth","number of items","position"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","add"]],["not",["has","lesser"]],["not",["has","makes"]],["not",["has","books"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-362520a2","guard":[["hasAny",["element","item number","kringle","nth","position"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]],"mem":null},
{"id":"n-9174cc34","guard":[["hasAny",["element","invert case","item number","kringle","nth","position","swap case","toggle case"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-9e808e25","guard":[["hasAny",["element","item number","kringle","lower case","lowercase","nth","position","small letters"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-9e80bfa9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","kringle","nth","position","title case"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-abdf3118","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","kringle","nth","position","upper case","uppercase"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-105829aa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","invert case","item number","kringle","nth","position","swap case","title case","toggle case"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]]],"mem":null},
{"id":"n-10f57c6f","guard":[["hasAny",["delete","element","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"Evenings at Donaldson Manor; Or, The Christmas Guest"}]],"mem":null},
{"id":"n-17c0c4bb","guard":[["hasAny",["element","item number","kringle","nth","position","separate by","split","split by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.subject"]]],"mem":null},
{"id":"n-39f91674","guard":[["hasAny",["delete","element","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"Colonel Crockett's Co-operative Christmas"}]],"mem":null},
{"id":"n-3bc63e16","guard":[["hasAny",["delete","element","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"The Prodigal Village: A Christmas Tale"}]],"mem":null},
{"id":"n-4d1b512d","guard":[["hasAny",["delete","element","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"The Christmas Child"}]],"mem":null},
{"id":"n-717e8d9f","guard":[["hasAny",["delete","element","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.subject"]]],"mem":null},
{"id":"n-7bb74d97","guard":[["hasAny",["delete","element","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"Christmas: A Story"}]],"mem":null},
{"id":"n-7f7f1943","guard":[["hasAny",["delete","element","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"Angel Unawares: A Story of Christmas Eve"}]],"mem":null},
{"id":"n-bbc23bf8","guard":[["has","camp"],["not",["has","doctors"]],["not",["has","author"]],["not",["has","lesser"]],["not",["has","prodigal"]]],"pyramid":["render.str",["transform.remove",{"lit":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-be3e75f0","guard":[["hasAny",["abbots","blizzard","church","colonel","delete","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","add"]],["not",["has","lesser"]],["not",["has","makes"]],["not",["has","books"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.unit"]]],"mem":null},
{"id":"n-d98dbc3b","guard":[["hasAny",["element","item number","kringle","nth","position","separate by","split","split by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.subject"]]],"mem":null},
{"id":"n-e3eb94e7","guard":[["hasAny",["element","item number","kringle","nth","position","separate by","split","split by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"story"}]],"mem":null},
{"id":"n-ed3430a5","guard":[["hasAny",["element","item number","kringle","nth","position","separate by","split","split by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.subject"]]],"mem":null},
{"id":"n-fee9ba68","guard":[["hasAny",["delete","element","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"story"}]],"mem":null},
{"id":"n-0099e26f","guard":[["hasAny",["abbots","blizzard","church","colonel","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","add"]],["not",["has","lesser"]],["not",["has","makes"]],["not",["has","books"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.wordCount"],["sense.unit"]]],"mem":null},
{"id":"n-0148f3e8","guard":[["hasAny",["element","item number","kringle","nth","position","separate by","split","split by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-01946115","guard":[["hasAny",["element","item number","kringle","nth","position","separate by","split","split by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"gutenberg"}]]],"mem":null},
{"id":"n-07d79289","guard":[["hasAny",["element","item number","kringle","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-0a5eb393","guard":[["hasAny",["element","item number","kringle","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.wordCount"],["sense.subject"]]],"mem":null},
{"id":"n-12470674","guard":[["hasAny",["bess","eden","element","item number","kringle","nth","position","separate by","split","split by"]],["not",["has","author"]],["not",["has","angel"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","blizzard"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"story"}]]],"mem":null},
{"id":"n-17632201","guard":[["hasAny",["delete","element","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-18107edf","guard":[["hasAny",["between","delete","ghost","item number","kringle","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-2d1268a7","guard":[["hasAny",["change to","child","church","element","eve","item number","nth","position","replace","substitute","swap"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.lastWord"],["sense.unit"]]],"mem":null},
{"id":"n-2eabc2bc","guard":[["hasAny",["element","item number","kringle","nth","position","separate by","split","split by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-31dfff55","guard":[["hasAny",["delete","element","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-3489f8d4","guard":[["hasAny",["element","item number","kringle","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-3bbd47d2","guard":[["hasAny",["bess","delete","eden","element","item number","kringle","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","angel"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","blizzard"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"story"}]]],"mem":null},
{"id":"n-4767fba1","guard":[["hasAny",["between","delete","ghost","item number","kringle","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-4cd5e079","guard":[["hasAny",["element","item number","kringle","nth","position","separate by","split","split by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"gutenberg"}]]],"mem":null},
{"id":"n-4e091498","guard":[["hasAny",["element","item number","kringle","nth","position","separate by","split","split by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-81cd42b8","guard":[["hasAny",["delete","element","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"gutenberg"}]]],"mem":null},
{"id":"n-8496d8de","guard":[["hasAny",["bess","blizzard","change to","church","item number","nth","position","prodigal","replace","substitute","swap"]],["not",["has","author"]],["has","a"],["not",["has","compare"]],["not",["has","add"]],["not",["has","abbots"]],["not",["has","came"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.lastWord"],["sense.unit"]]],"mem":null},
{"id":"n-87b30959","guard":[["hasAny",["all","child","colonel","delete","item number","nth","position","prodigal","remove","strip out","without"]],["not",["has","author"]],["not",["has","add"]],["not",["has","compare"]],["not",["has","makes"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.after",{"lit":"to"}]]],"mem":null},
{"id":"n-9667f3dd","guard":[["hasAny",["characters from","element","item number","kringle","letters from to","nth","position","slice of the text","substring"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":1},{"lit":46}]],"mem":null},
{"id":"n-a161407e","guard":[["hasAny",["between","ghost","item number","kringle","nth","position","separate by","split","split by"]],["not",["has","author"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-ae2f88ed","guard":[["hasAny",["ago","burns","carol","church","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","gutenberg"],["not",["has","add"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.howMany"],["sense.roman"]]],"mem":null},
{"id":"n-b4ca41ad","guard":[["hasAny",["element","item number","kringle","nth","position","separate by","split","split by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-b6709e7c","guard":[["hasAny",["element","item number","kringle","nth","position","separate by","split","split by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"gutenberg"}]]],"mem":null},
{"id":"n-b7712308","guard":[["hasAny",["change to","element","item number","kringle","nth","position","replace","substitute","swap"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.subject"],["sense.text"]]],"mem":null},
{"id":"n-bee1f724","guard":[["hasAny",["books","burns","came","carol","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","smaller"]],["not",["has","compare"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.before",{"lit":"word"}]]],"mem":null},
{"id":"n-c2cd0793","guard":[["hasAny",["element","item number","kringle","nth","position","separate by","split","split by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-d3aefaf4","guard":[["hasAny",["all","child","colonel","item number","nth","position","prodigal","separate by","split","split by"]],["not",["has","author"]],["not",["has","add"]],["not",["has","compare"]],["not",["has","makes"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.after",{"lit":"to"}]]],"mem":null},
{"id":"n-ec488dfc","guard":[["hasAny",["element","item number","kringle","nth","position","separate by","split","split by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-eca3cd80","guard":[["hasAny",["change to","element","item number","kringle","nth","position","replace","substitute","swap"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.subject"],["sense.lastWord"]]],"mem":null},
{"id":"n-fd7e17a1","guard":[["hasAny",["between","change to","element","item number","nth","position","replace","substitute","swap"]],["has","greater"],["not",["has","author"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.lastWord"],["sense.unit"]]],"mem":null},
{"id":"n-065278ae","guard":[["hasAny",["bess","blizzard","change to","colonel","item number","nth","position","prodigal","replace","substitute","swap"]],["not",["has","author"]],["has","which"],["not",["has","lesser"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.unit"]]],"mem":null},
{"id":"n-07f72cc0","guard":[["hasAny",["element","item number","kringle","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-1e41c06e","guard":[["hasAny",["change to","element","item number","kringle","nth","position","replace","substitute","swap"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.subject"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-30ba7470","guard":[["hasAny",["change to","element","item number","kringle","nth","position","replace","substitute","swap"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.subject"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-89f8fbfe","guard":[["hasAny",["element","item number","kringle","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-aac73eb3","guard":[["hasAny",["delete","element","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]]],"mem":null},
{"id":"n-4d066315","guard":[["hasAny",["abbots","church","element","eve","join","joined with","separated by"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.unit"]]],"mem":null},
{"id":"n-24e669a9","guard":[["hasAny",["bess","child","church","how many vowels","item number","kringle","nth","number of vowels","position","vowel count"]],["not",["has","eve"]],["not",["has","smaller"]],["not",["has","brown"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.vowels",["sense.unit"]]]],"mem":null},
{"id":"n-47351355","guard":[["hasAny",["divisor count","how many divisors","how many factors","inspiration","item number","kringle","nth","number of divisors","position","rosemary"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-acb4b31e","guard":[["hasAny",["bess","blizzard","consonant count","how many consonants","item number","kringle","nth","number of consonants","position"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.consonants",["sense.unit"]]]],"mem":null},
{"id":"n-05fe0e87","guard":[["has","unawares"],["words>=",23],["not",["has","smaller"]],["not",["has","sum"]],["not",["has","add"]],["not",["has","bess"]]],"pyramid":["render.list",["transform.split",{"lit":"Angel Unawares: A Story of Christmas Eve"},["sense.lastWord"]]],"mem":null},
{"id":"n-9016f45f","guard":[["has","unawares"],["words>=",23],["not",["has","smaller"]],["not",["has","sum"]],["not",["has","add"]],["not",["has","bess"]]],"pyramid":["render.lines",["transform.split",{"lit":"Angel Unawares: A Story of Christmas Eve"},["sense.lastWord"]]],"mem":null},
{"id":"n-b34b5596","guard":[["has","unawares"],["words>=",23],["not",["has","smaller"]],["not",["has","sum"]],["not",["has","add"]],["not",["has","bess"]]],"pyramid":["render.str",["transform.remove",{"lit":"Angel Unawares: A Story of Christmas Eve"},["sense.lastWord"]]],"mem":null},
{"id":"n-d6d55280","guard":[["has","unawares"],["words>=",23],["not",["has","smaller"]],["not",["has","sum"]],["not",["has","add"]],["not",["has","bess"]]],"pyramid":["render.and",["transform.split",{"lit":"Angel Unawares: A Story of Christmas Eve"},["sense.lastWord"]]],"mem":null},
{"id":"n-fdeb971f","guard":[["hasAny",["count","donaldson","eden","element","how many","how many items","item number","nth","number of items","position"]],["not",["has","author"]],["not",["has","compare"]],["words<=",27],["not",["has","add"]],["not",["has","lesser"]],["not",["has","makes"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["aggregate.countStrs",["sense.list"]]]],"mem":null},
{"id":"n-82757dbc","guard":[["hasAny",["blizzard","church","count","element","how many","how many items","item number","normalise","normalize","nth","number of items","position","simplify the text"]],["has","on"],["not",["has","smaller"]]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-e6c31c83","guard":[["hasAny",["child","church","count","element","how many","how many items","item number","normalise","normalize","nth","number of items","position","simplify the text"]],["has","larger"]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-ac9a2273","guard":[["hasAny",["add the digits","day","digit sum","element","item number","nth","position","story","sum of the digits"]],["not",["has","author"]],["has","which"],["not",["has","lesser"]],["not",["has","all"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-dae62b0e","guard":[["hasAny",["angel","colonel","consonant count","donaldson","element","how many consonants","item number","nth","number of consonants","position"]],["has","greater"],["not",["has","author"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["aggregate.consonants",["sense.subject"]]]],"mem":null},
{"id":"n-fe6a6d30","guard":[["hasAny",["character count","church","colonel","how many characters","item number","length","nth","number of characters","position","prodigal"]],["not",["has","add"]],["not",["has","compare"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["aggregate.chars",["sense.roman"]]]],"mem":null},
{"id":"n-0a0666cc","guard":[["hasAny",["colonel","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","smaller"]],["not",["has","compare"]],["not",["has","all"]]],"pyramid":["render.str",["transform.remove",{"lit":"Colonel Crockett's Co-operative Christmas"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-25073f78","guard":[["hasAny",["colonel","delete","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","smaller"]],["not",["has","compare"]],["not",["has","all"]]],"pyramid":["render.str",["transform.remove",{"lit":"Colonel Crockett's Co-operative Christmas"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}]]],"mem":null},
{"id":"n-52c314a1","guard":[["hasAny",["ago","burns","carol","delete","item number","nth","position","remove","strip out","without"]],["has","gutenberg"],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.roman"]]],"mem":null},
{"id":"n-52ef96df","guard":[["hasAny",["delete","item number","nth","position","remove","strip out","unawares","without"]],["not",["has","smaller"]],["not",["has","to"]],["not",["has","elsie"]],["not",["has","prodigal"]]],"pyramid":["render.str",["transform.remove",{"lit":"Angel Unawares: A Story of Christmas Eve"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-6c47c6dc","guard":[["hasAny",["delete","element","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"The Doctor's Christmas Eve"}]],"mem":null},
{"id":"n-75283160","guard":[["words<=",18],["has","story"],["has","which"],["not",["has","angel"]],["not",["has","smaller"]],["not",["has","colonel"]]],"pyramid":["render.str",["transform.remove",{"lit":"Christmas: A Story"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-819321ba","guard":[["hasAny",["ago","burns","carol","item number","nth","position","separate by","split","split by"]],["has","gutenberg"],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.roman"]]],"mem":null},
{"id":"n-841e7b12","guard":[["hasAny",["delete","donaldson","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","smaller"]],["not",["has","add"]],["not",["has","blizzard"]],["not",["has","books"]]],"pyramid":["render.str",["transform.remove",{"lit":"Evenings at Donaldson Manor; Or, The Christmas Guest"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}]]],"mem":null},
{"id":"n-8b785839","guard":[["hasAny",["ago","burns","carol","element","item number","nth","position","separate by","split","split by"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.roman"]]],"mem":null},
{"id":"n-8bed4769","guard":[["hasAny",["ago","burns","carol","item number","nth","position","separate by","split","split by"]],["has","gutenberg"],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.roman"]]],"mem":null},
{"id":"n-975217ee","guard":[["hasAny",["delete","donaldson","element","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","smaller"]],["not",["has","add"]],["not",["has","blizzard"]],["not",["has","books"]]],"pyramid":["render.str",["transform.remove",{"lit":"Evenings at Donaldson Manor; Or, The Christmas Guest"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-a0b4db5e","guard":[["hasAny",["delete","item number","nth","position","prodigal","remove","strip out","without"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","eve"]],["not",["has","add"]],["not",["has","kringle"]]],"pyramid":["render.str",["transform.remove",{"lit":"The Prodigal Village: A Christmas Tale"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}]]],"mem":null},
{"id":"n-a294d824","guard":[["hasAny",["ago","burns","carol","item number","nth","position","separate by","split","split by"]],["has","gutenberg"],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.roman"]]],"mem":null},
{"id":"n-ad887c77","guard":[["hasAny",["ago","burns","carol","element","item number","nth","position","separate by","split","split by"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.roman"]]],"mem":null},
{"id":"n-b1936c76","guard":[["hasAny",["ago","burns","carol","element","item number","nth","position","separate by","split","split by"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.roman"]]],"mem":null},
{"id":"n-b2d403aa","guard":[["hasAny",["ago","burns","carol","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.roman"]]],"mem":null},
{"id":"n-c262deaf","guard":[["hasAny",["delete","element","item number","nth","position","prodigal","remove","strip out","without"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","eve"]],["not",["has","add"]],["not",["has","kringle"]]],"pyramid":["render.str",["transform.remove",{"lit":"The Prodigal Village: A Christmas Tale"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-c2943d83","guard":[["hasAny",["delete","donaldson","item number","nth","position","remove","strip out","without"]],["colon"],["not",["has","author"]],["not",["has","of"]]],"pyramid":["render.str",["transform.remove",{"lit":"Evenings at Donaldson Manor; Or, The Christmas Guest"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-034801ce","guard":[["hasAny",["ago","burns","carol","change to","item number","nth","position","replace","substitute","swap"]],["has","gutenberg"],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.roman"],["sense.subject"]]],"mem":null},
{"id":"n-0b394f09","guard":[["hasAny",["between","colonel","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","christmastide"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-0bc63489","guard":[["hasAny",["between","colonel","element","item number","nth","position","separate by","split","split by"]],["not",["has","author"]],["not",["has","christmastide"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-14cf5964","guard":[["hasAny",["ago","burns","carol","change to","item number","nth","position","replace","substitute","swap"]],["has","gutenberg"],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.roman"],["sense.lastWord"]]],"mem":null},
{"id":"n-20d7768e","guard":[["hasAny",["ago","burns","carol","change to","element","item number","nth","position","replace","substitute","swap"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.roman"],["sense.text"]]],"mem":null},
{"id":"n-26e5ee96","guard":[["hasAny",["colonel","delete","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","add"]],["words<=",25],["not",["has","angel"]],["not",["has","carol"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-2b8b798f","guard":[["hasAny",["between","delete","element","item number","kringle","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","lesser"]],["has","which"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-3d45926e","guard":[["hasAny",["burns","came","carol","element","item number","nth","position","separate by","split","split by"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"word"}]]],"mem":null},
{"id":"n-40d12d76","guard":[["hasAny",["between","element","item number","kringle","nth","position","separate by","split","split by"]],["not",["has","author"]],["not",["has","lesser"]],["has","which"]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-65321fc5","guard":[["hasAny",["ago","burns","carol","change to","item number","nth","position","replace","substitute","swap"]],["has","gutenberg"],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.roman"],["sense.text"]]],"mem":null},
{"id":"n-673ff98b","guard":[["hasAny",["ago","burns","carol","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.howMany"],["sense.roman"]]],"mem":null},
{"id":"n-74dad600","guard":[["hasAny",["between","delete","element","item number","kringle","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","lesser"]],["has","which"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-7a838041","guard":[["hasAny",["ago","burns","carol","change to","element","item number","nth","position","replace","substitute","swap"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.roman"],["sense.lastWord"]]],"mem":null},
{"id":"n-997afc57","guard":[["hasAny",["bess","blizzard","change to","church","item number","nth","position","replace","substitute","swap"]],["not",["has","author"]],["has","a"],["not",["has","compare"]],["not",["has","add"]],["not",["has","came"]],["not",["has","doctors"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.subject"],["sense.unit"]]],"mem":null},
{"id":"n-a1430049","guard":[["hasAny",["between","colonel","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","christmastide"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.before",{"lit":"on"}]]],"mem":null},
{"id":"n-a2721d9f","guard":[["hasAny",["child","church","delete","element","item number","nth","position","remove","strip out","without"]],["has","larger"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-b4ba83f1","guard":[["hasAny",["ago","carol","change to","church","item number","nth","position","replace","substitute","swap"]],["has","gutenberg"],["not",["has","add"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.subject"],["sense.roman"]]],"mem":null},
{"id":"n-b5c296f5","guard":[["hasAny",["ago","burns","church","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","larger"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.wordCount"],["sense.roman"]]],"mem":null},
{"id":"n-c8d3c044","guard":[["hasAny",["ago","burns","carol","change to","element","item number","nth","position","replace","substitute","swap"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.roman"],["sense.subject"]]],"mem":null},
{"id":"n-cfdf8e22","guard":[["hasAny",["colonel","item number","nth","position","separate by","split","split by"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","add"]],["words<=",25],["not",["has","angel"]],["not",["has","carol"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-e5ede222","guard":[["hasAny",["all","delete","element","item number","larger","nth","position","remove","strip out","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.before",{"lit":"to"}]]],"mem":null},
{"id":"n-edcc4dab","guard":[["hasAny",["colonel","item number","nth","position","separate by","split","split by"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","add"]],["words<=",25],["not",["has","angel"]],["not",["has","carol"]]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-f6c71b47","guard":[["hasAny",["colonel","item number","nth","position","separate by","split","split by"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","add"]],["words<=",25],["not",["has","angel"]],["not",["has","carol"]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-fae4fd00","guard":[["hasAny",["colonel","delete","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","add"]],["words<=",25],["words>=",15],["not",["has","angel"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.before",{"lit":"of"}]]],"mem":null},
{"id":"n-fd8ba3fc","guard":[["hasAny",["burns","came","carol","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"word"}]]],"mem":null},
{"id":"n-1694853f","guard":[["hasAny",["ago","burns","carol","change to","element","item number","nth","position","replace","substitute","swap"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.roman"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-3939d423","guard":[["hasAny",["ago","burns","carol","change to","item number","nth","position","replace","substitute","swap"]],["has","gutenberg"],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.roman"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-b2f9efcc","guard":[["hasAny",["ago","burns","carol","change to","item number","nth","position","replace","substitute","swap"]],["has","gutenberg"],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.roman"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}]]],"mem":null},
{"id":"n-ba91b0f8","guard":[["hasAny",["ago","burns","carol","change to","item number","nth","position","replace","substitute","swap"]],["has","gutenberg"],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.roman"]]],"mem":null},
{"id":"n-ed90f256","guard":[["hasAny",["ago","burns","carol","change to","element","item number","nth","position","replace","substitute","swap"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.roman"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-d7b155e0","guard":[["has","prose"],["not",["has","angel"]],["has","which"],["not",["has","author"]],["colon"]],"pyramid":["render.str",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-05bb6dc2","guard":[["has","prose"],["not",["has","angel"]],["has","which"],["not",["has","author"]],["colon"]],"pyramid":["render.str",["transform.title",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-3d8b07a5","guard":[["has","prose"],["not",["has","angel"]],["has","which"],["not",["has","author"]],["colon"]],"pyramid":["render.str",["transform.upper",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-67833f86","guard":[["has","prose"],["not",["has","angel"]],["has","which"],["not",["has","author"]],["colon"]],"pyramid":["render.str",["transform.swapCase",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-7d65c8fd","guard":[["has","prose"],["not",["has","angel"]],["has","which"],["not",["has","author"]],["colon"]],"pyramid":["render.str",["transform.lower",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-1375a701","guard":[["hasAny",["angel","child","church","count","how many","how many items","item number","nth","number of items","position"]],["has","larger"],["has","gutenberg"],["has","whose"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-2ba78a62","guard":[["hasAny",["angel","element","item number","kringle","log","log base","logarithm","nth","position"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["compute.log",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-98dafec3","guard":[["hasAny",["angel","child","church","count","first n","how many","how many items","number of items","take","top"]],["has","larger"],["has","gutenberg"],["has","whose"]],"pyramid":["render.list",["transform.takeStrs",["sense.list"],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-a9b18144","guard":[["hasAny",["angel","child","church","count","first n","how many","how many items","number of items","take","top"]],["has","larger"],["has","gutenberg"],["has","whose"]],"pyramid":["render.and",["transform.takeStrs",["sense.list"],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-b2763fd7","guard":[["hasAny",["angel","child","church","count","first n","how many","how many items","number of items","take","top"]],["has","larger"],["has","gutenberg"],["has","whose"]],"pyramid":["render.lines",["transform.takeStrs",["sense.list"],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-d4b37c12","guard":[["hasAny",["angel","child","church","how many lines","item number","line count","lines of code","nth","number of lines","position"]],["has","larger"],["has","gutenberg"],["has","whose"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.lines",["sense.unit"]]]],"mem":null},
{"id":"n-e0aaa6aa","guard":[["hasAny",["a to z","alphabetical","alphabetize","books","item number","nth","position"]],["not",["has","author"]],["has","larger"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.list"]],{"lit":2}]],"mem":null},
{"id":"n-7915f979","guard":[["has","carol"],["has","and"],["not",["has","being"]],["not",["has","author"]],["has","which"],["not",["has","lesser"]]],"pyramid":["render.list",["transform.split",{"lit":"A Christmas Carol"},["sense.lastWord"]]],"mem":null},
{"id":"n-82e52db3","guard":[["has","carol"],["has","and"],["not",["has","being"]],["not",["has","author"]],["has","which"],["not",["has","lesser"]]],"pyramid":["render.str",["transform.remove",{"lit":"A Christmas Carol"},["sense.lastWord"]]],"mem":null},
{"id":"n-b4e51095","guard":[["has","carol"],["has","and"],["not",["has","being"]],["not",["has","author"]],["has","which"],["not",["has","lesser"]]],"pyramid":["render.lines",["transform.split",{"lit":"A Christmas Carol"},["sense.lastWord"]]],"mem":null},
{"id":"n-e4af0eae","guard":[["has","carol"],["has","and"],["not",["has","being"]],["not",["has","author"]],["has","which"],["not",["has","lesser"]]],"pyramid":["render.and",["transform.split",{"lit":"A Christmas Carol"},["sense.lastWord"]]],"mem":null},
{"id":"n-c9d5beb2","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger ",{"slot":0}," ",{"slot":1}," (38983 against ",{"slot":2},")."]},["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-c43e2586","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," id (38983 against ",{"slot":2},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-0f2a67ea","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-1461504f","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-3c32d31c","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-a33bfadd","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-8ec0eb3c","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["transform.kebab",["sense.wordAt",{"lit":3}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-9b6c5b9c","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["transform.lower",["sense.wordAt",{"lit":3}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-acc707c7","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["transform.nthStr",["sense.words"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-b2d050be","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["transform.pascal",["sense.wordAt",{"lit":3}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-cd36ecc1","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["transform.snake",["sense.wordAt",{"lit":3}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-d8d7580e","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-f39e1a65","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["transform.camel",["sense.wordAt",{"lit":3}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-38af4d24","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]]],"mem":null},
{"id":"n-41d4da32","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]]],"mem":null},
{"id":"n-623e7d20","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]]],"mem":null},
{"id":"n-72d961bc","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]]],"mem":null},
{"id":"n-1f2f7451","guard":[["words<=",18],["has","of"],["has","whose"],["not",["has","eve"]],["not",["has","and"]],["has","larger"]],"pyramid":["render.template",{"lit":["The Christmas ",{"slot":0}," has the ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," (",{"slot":4}," against ",{"slot":5},")."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],["aggregate.countStrs",["sense.list"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-be2a517c","guard":[["hasAny",["donaldson","element","how many words","item number","nth","number of words","position","story","word count"]],["not",["has","author"]],["has","which"],["words<=",20],["not",["has","inspiration"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-06926e24","guard":[["hasAny",["delete","item number","nth","position","remove","strip out","unawares","without"]],["has","which"],["not",["has","kringle"]],["not",["has","men"]]],"pyramid":["render.str",["transform.remove",{"lit":"Angel Unawares: A Story of Christmas Eve"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}]]],"mem":null},
{"id":"n-0db5912b","guard":[["has","carol"],["has","and"],["not",["has","all"]],["not",["has","of"]],["not",["has","author"]],["not",["has","lesser"]]],"pyramid":["render.str",["transform.remove",{"lit":"A Christmas Carol"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}]]],"mem":null},
{"id":"n-156f2c75","guard":[["hasAny",["delete","element","item number","nth","position","remove","strip out","unawares","without"]],["has","which"],["not",["has","kringle"]],["not",["has","men"]]],"pyramid":["render.str",["transform.remove",{"lit":"Angel Unawares: A Story of Christmas Eve"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-2ec28b45","guard":[["has","carol"],["has","and"],["not",["has","all"]],["not",["has","of"]],["not",["has","author"]],["not",["has","lesser"]]],"pyramid":["render.str",["transform.remove",{"lit":"A Christmas Carol"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-6c02fc0b","guard":[["hasAny",["colonel","item number","nth","position","prodigal","separate by","split","split by"]],["words<=",19],["not",["has","smaller"]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.roman"]]],"mem":null},
{"id":"n-71e789fa","guard":[["hasAny",["colonel","item number","nth","position","prodigal","separate by","split","split by"]],["words<=",19],["not",["has","smaller"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.roman"]]],"mem":null},
{"id":"n-76ec835c","guard":[["words<=",16],["has","story"],["has","which"],["not",["has","rosemary"]],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",{"lit":"Christmas: A Story"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}]]],"mem":null},
{"id":"n-92cbec73","guard":[["hasAny",["colonel","delete","item number","nth","position","prodigal","remove","strip out","without"]],["words<=",19],["not",["has","smaller"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.roman"]]],"mem":null},
{"id":"n-a4352e05","guard":[["hasAny",["colonel","item number","nth","position","prodigal","separate by","split","split by"]],["words<=",19],["not",["has","smaller"]]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.roman"]]],"mem":null},
{"id":"n-bfff6417","guard":[["words<=",16],["has","story"],["has","which"],["not",["has","rosemary"]],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",{"lit":"Christmas: A Story"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-c19579ec","guard":[["has","carol"],["not",["has","being"]],["has","which"],["has","of"],["not",["has","lesser"]]],"pyramid":["render.str",["transform.remove",{"lit":"A Christmas Carol"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-e215bacc","guard":[["hasAny",["delete","element","ghost","item number","nth","position","remove","strip out","without"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","lesser"]],["not",["has","add"]],["not",["has","sum"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"A Christmas Carol"}]],"mem":null},
{"id":"n-ef9d3a8d","guard":[["hasAny",["delete","item number","nth","position","prodigal","remove","strip out","without"]],["not",["has","of"]],["not",["has","author"]],["not",["has","carol"]],["not",["has","compare"]]],"pyramid":["render.str",["transform.remove",{"lit":"The Prodigal Village: A Christmas Tale"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-f496689c","guard":[["hasAny",["delete","doctors","item number","nth","position","remove","strip out","without"]],["has","larger"],["has","of"]],"pyramid":["render.str",["transform.remove",{"lit":"The Doctor's Christmas Eve"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}]]],"mem":null},
{"id":"n-fc3d4301","guard":[["has","child"],["has","whose"],["not",["has","fairies"]]],"pyramid":["render.str",["transform.remove",{"lit":"The Christmas Child"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-fc4b87e7","guard":[["hasAny",["delete","doctors","element","item number","nth","position","remove","strip out","without"]],["has","larger"],["has","of"]],"pyramid":["render.str",["transform.remove",{"lit":"The Doctor's Christmas Eve"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-ff507f79","guard":[["hasAny",["delete","doctors","item number","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.str",["transform.remove",{"lit":"The Doctor's Christmas Eve"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-0205db54","guard":[["hasAny",["ago","carol","change to","element","item number","nth","position","replace","substitute","swap"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.subject"],["sense.roman"]]],"mem":null},
{"id":"n-2c485af7","guard":[["hasAny",["abbots","delete","item number","nth","position","remove","rosemary","strip out","without"]],["has","larger"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-3700a616","guard":[["hasAny",["abbots","item number","nth","position","rosemary","separate by","split","split by"]],["has","larger"]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-449c9b0e","guard":[["hasAny",["abbots","delete","item number","nth","position","remove","rosemary","strip out","without"]],["has","larger"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-4fa52d6b","guard":[["hasAny",["delete","element","item number","kringle","nth","position","remove","strip out","without"]],["has","larger"],["not",["has","ago"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"has"}]]],"mem":null},
{"id":"n-6b9aeacc","guard":[["hasAny",["change to","colonel","item number","nth","position","prodigal","replace","substitute","swap"]],["words<=",19],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.roman"],["sense.lastWord"]]],"mem":null},
{"id":"n-6d6246e5","guard":[["hasAny",["ago","burns","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","larger"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.wordCount"],["sense.roman"]]],"mem":null},
{"id":"n-79db5200","guard":[["hasAny",["change to","colonel","item number","nth","position","prodigal","replace","substitute","swap"]],["words<=",19],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.roman"],["sense.subject"]]],"mem":null},
{"id":"n-7ef49f98","guard":[["hasAny",["change to","colonel","item number","nth","position","prodigal","replace","substitute","swap"]],["words<=",19],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.lastWord"],["sense.roman"]]],"mem":null},
{"id":"n-88b015d6","guard":[["hasAny",["all","doctors","element","item number","nth","position","separate by","split","split by"]],["has","which"]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"to"}]]],"mem":null},
{"id":"n-975d2eca","guard":[["hasAny",["all","delete","doctors","element","item number","nth","position","remove","strip out","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.after",{"lit":"to"}]]],"mem":null},
{"id":"n-a5c4dd78","guard":[["hasAny",["change to","colonel","item number","nth","position","prodigal","replace","substitute","swap"]],["words<=",19],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.roman"],["sense.text"]]],"mem":null},
{"id":"n-e0fc0f84","guard":[["hasAny",["colonel","delete","element","item number","nth","position","prodigal","remove","strip out","without"]],["not",["has","author"]],["not",["has","smaller"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.after",{"lit":"word"}]]],"mem":null},
{"id":"n-e8e1453b","guard":[["hasAny",["blizzard","chicken","how many words","item number","nth","number of words","position","word count"]],["has","whose"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}]]]],"mem":null},
{"id":"n-2874d6bb","guard":[["hasAny",["change to","colonel","item number","nth","position","prodigal","replace","substitute","swap"]],["words<=",19],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.roman"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}]]],"mem":null},
{"id":"n-2e103e0c","guard":[["hasAny",["change to","colonel","element","item number","nth","position","prodigal","replace","substitute","swap"]],["words<=",19],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.roman"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]],"mem":null},
{"id":"n-3cae71c0","guard":[["hasAny",["change to","colonel","item number","nth","position","prodigal","replace","substitute","swap"]],["words<=",19],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["sense.roman"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]],"mem":null},
{"id":"n-3dd471f2","guard":[["hasAny",["change to","child","element","item number","nth","position","replace","rosemary","substitute","swap"]],["has","larger"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.unit"]]],"mem":null},
{"id":"n-5a681ca5","guard":[["hasAny",["change to","colonel","item number","nth","position","prodigal","replace","substitute","swap"]],["words<=",19],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.roman"]]],"mem":null},
{"id":"n-eeed3b63","guard":[["hasAny",["change to","colonel","element","item number","nth","position","prodigal","replace","substitute","swap"]],["words<=",19],["not",["has","smaller"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.roman"]]],"mem":null},
{"id":"n-3d8f5a20","guard":[["words>=",32],["has","between"],["not",["has","author"]]],"pyramid":["render.template",{"lit":["Christmas Comes but Once a Year Showing What ",{"slot":0},". Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg ",{"slot":1}," (20251 against ",{"slot":2},")."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-0b6acf4d","guard":[["hasAny",["delete","element","item number","nth","position","remove","strip out","unawares","without"]],["has","which"],["not",["has","kringle"]],["not",["has","men"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg author id"}]]],"mem":null},
{"id":"n-ebbb56bb","guard":[["words>=",32],["has","between"],["not",["has","author"]]],"pyramid":["render.template",{"lit":[{"slot":0}," Comes but Once a Year Showing What ",{"slot":1},". Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg ",{"slot":2}," (20251 against ",{"slot":3},")."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-f6265136","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," gutenberg ",{"slot":1}," (38983 against ",{"slot":2},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-124aa5d6","guard":[["has","with"],["words<=",16],["has","which"],["not",["has","author"]],["not",["has","celebrations"]]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]]],"mem":null},
{"id":"n-b66b0d9a","guard":[["has","with"],["words<=",16],["has","which"],["not",["has","author"]],["not",["has","celebrations"]]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]]],"mem":null},
{"id":"n-7c418948","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":2}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-5dd23d2b","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.snake",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-870a86f2","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":2}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-a8162de5","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.kebab",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-bebc6445","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.camel",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-c919f007","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-e6637684","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-ebd2e199","guard":[["has","camp"],["has","whose"]],"pyramid":["render.template",{"lit":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," (38983 against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.pascal",["sense.wordAt",{"lit":2}]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-0940b812","guard":[["has","when"],["words<=",21],["has","larger"]],"pyramid":["render.template",{"lit":["When the Yule Log Burns: A Christmas Story has the larger gutenberg ",{"slot":0}," (",{"slot":1}," against ",{"slot":2},")."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-3b46b16d","guard":[["has","kris"],["has","story"],["has","larger"]],"pyramid":["render.template",{"lit":["Mr. Kris Kringle: A Christmas Tale has the larger gutenberg ",{"slot":0}," (",{"slot":1}," against ",{"slot":2},")."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-496006ec","guard":[["has","when"],["has","of"],["has","larger"],["not",["has","author"]]],"pyramid":["render.template",{"lit":["When the Yule Log Burns: A Christmas Story has the larger gutenberg ",{"slot":0}," (",{"slot":1}," against ",{"slot":2},")."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-6b64946f","guard":[["has","shakespeares"],["has","a"],["has","which"],["not",["has","author"]]],"pyramid":["render.template",{"lit":["Shakespeare's Christmas Gift to Queen Bess has the larger gutenberg ",{"slot":0}," (",{"slot":1}," against ",{"slot":2},")."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-70768c93","guard":[["has","doctors"],["has","of"],["has","larger"],["not",["has","author"]]],"pyramid":["render.template",{"lit":["The Doctor's Christmas Eve has the larger gutenberg ",{"slot":0}," (",{"slot":1}," against ",{"slot":2},")."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-b924c4d5","guard":[["has","angel"],["not",["has","and"]],["not",["has","eve"]],["has","larger"],["not",["has","author"]]],"pyramid":["render.template",{"lit":["The Christmas Angel has the larger gutenberg ",{"slot":0}," (",{"slot":1}," against ",{"slot":2},")."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-c21ab6e5","guard":[["has","uncle"],["has","which"],["not",["has","angel"]],["not",["has","lesser"]],["not",["has","smaller"]]],"pyramid":["render.template",{"lit":["Uncle Noah's Christmas Inspiration has the larger gutenberg ",{"slot":0}," (",{"slot":1}," against ",{"slot":2},")."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-f032ab18","guard":[["has","doctors"],["has","larger"],["not",["has","card"]],["not",["has","eden"]],["not",["has","author"]]],"pyramid":["render.template",{"lit":["The Doctor's Christmas Eve has the larger gutenberg ",{"slot":0}," (",{"slot":1}," against ",{"slot":2},")."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-2995abb4","guard":[["has","when"],["has","of"],["has","larger"],["not",["has","author"]]],"pyramid":["render.template",{"lit":["When the Yule Log Burns: A Christmas ",{"slot":0}," has the larger ",{"slot":1}," ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-2ef68192","guard":[["words<=",16],["has","which"],["has","of"]],"pyramid":["render.template",{"lit":["Christmas: ",{"slot":0}," has the larger gutenberg ",{"slot":1}," (",{"slot":2}," against ",{"slot":3},")."]},["transform.nthStr",["sense.list"],{"lit":1}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-94041c82","guard":[["has","child"],["has","whose"],["has","a"],["not",["has","prodigal"]],["not",["has","fairies"]],["not",["has","author"]]],"pyramid":["render.template",{"lit":["The Christmas Child has the ",{"slot":0}," gutenberg ",{"slot":1}," (",{"slot":2}," against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-e32bf726","guard":[["has","kris"],["has","story"],["has","larger"]],"pyramid":["render.template",{"lit":["Mr. Kris Kringle: A Christmas ",{"slot":0}," has the larger ",{"slot":1}," ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-d3fafc33","guard":[["has","child"],["has","whose"],["has","a"],["not",["has","prodigal"]],["not",["has","fairies"]],["not",["has","author"]]],"pyramid":["render.template",{"lit":["The Christmas Child has the ",{"slot":0}," gutenberg ",{"slot":1}," (",{"slot":2}," against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-f2ffbfc0","guard":[["has","child"],["has","whose"],["has","a"],["not",["has","prodigal"]],["not",["has","fairies"]],["not",["has","author"]]],"pyramid":["render.template",{"lit":["The Christmas Child has the ",{"slot":0}," gutenberg ",{"slot":1}," (",{"slot":2}," against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-1c2b82e7","guard":[["has","child"],["has","whose"],["has","a"],["not",["has","prodigal"]],["not",["has","fairies"]],["not",["has","author"]]],"pyramid":["render.template",{"lit":["The Christmas Child has the ",{"slot":0}," gutenberg ",{"slot":1}," (",{"slot":2}," against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-5ec8538f","guard":[["has","child"],["has","whose"],["has","a"],["not",["has","prodigal"]],["not",["has","fairies"]],["not",["has","author"]]],"pyramid":["render.template",{"lit":["The Christmas Child has the ",{"slot":0}," gutenberg ",{"slot":1}," (",{"slot":2}," against ",{"slot":3},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-176cdc46","guard":[["hasAny",["church","colonel","join","joined with","separated by"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","lesser"]],["not",["has","add"]],["not",["has","angel"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.before",{"lit":"story"}]]],"mem":null},
{"id":"n-bef99eab","guard":[["hasAny",["church","element","join","joined with","separated by"]],["has","larger"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-d5b522de","guard":[["hasAny",["church","element","join","joined with","separated by"]],["has","larger"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.before",{"lit":"on"}]]],"mem":null},
{"id":"n-fcb0f04b","guard":[["hasAny",["church","colonel","join","joined with","separated by"]],["not",["has","author"]],["not",["has","compare"]],["not",["has","smaller"]],["not",["has","lesser"]],["not",["has","angel"]],["not",["has","add"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.after",{"lit":"story"}]]],"mem":null},
{"id":"n-436c9f26","guard":[["hasAny",["elsie","how many vowels","inspiration","item number","nth","number of vowels","position","vowel count"]],["has","larger"],["has","the"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-89e7134f","guard":[["hasAny",["character count","how many characters","item number","kringle","length","nth","number of characters","position","rosemary"]],["has","between"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.chars",["sense.unit"]]]],"mem":null},
{"id":"n-30de6bb5","guard":[["hasAny",["blizzard","count","element","how many","how many items","item number","normalise","normalize","nth","number of items","position","simplify the text"]],["has","between"]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-0bccf2bc","guard":[["hasAny",["church","count","how many","how many items","item number","nth","number of items","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the ",{"slot":2}," ",{"slot":3}," ",{"slot":4}," (",{"slot":5}," against 1902)."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-4dd37409","guard":[["hasAny",["church","count","how many","how many items","invert case","item number","nth","number of items","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the ",{"slot":2}," ",{"slot":3}," ",{"slot":4}," (",{"slot":5}," against 1902)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.unit"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-67ea41cf","guard":[["hasAny",["church","count","how many","how many items","item number","nth","number of items","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the ",{"slot":2}," ",{"slot":3}," ",{"slot":4}," (",{"slot":5}," against 1902)."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["sense.units"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-a8917d94","guard":[["hasAny",["church","count","how many","how many items","item number","nth","number of items","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the ",{"slot":2}," ",{"slot":3}," ",{"slot":4}," (",{"slot":5}," against 1902)."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["sense.units"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-adfd10a1","guard":[["hasAny",["church","class name","count","how many","how many items","item number","nth","number of items","pascal case","pascalcase","position","shortest","shortest one","shortest word","upper camel case"]]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the ",{"slot":2}," ",{"slot":3}," ",{"slot":4}," (",{"slot":5}," against 1902)."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.pascal",["sense.unit"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-fa374833","guard":[["hasAny",["blizzard","count","how many","how many items","item number","nth","number of items","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["transform.nthStr",["sense.words"],["aggregate.countStrs",["sense.content"]]],["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-fe296816","guard":[["hasAny",["church","count","how many","how many items","item number","longest","longest one","longest word","nth","number of items","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the ",{"slot":2}," ",{"slot":3}," ",{"slot":4}," (",{"slot":5}," against 1902)."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.units"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-b5c15c93","guard":[["hasAny",["church","count","each word","how many","how many items","item number","nth","number of items","position","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the ",{"slot":2}," ",{"slot":3}," ",{"slot":4}," (",{"slot":5}," against 1902)."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.unit"]]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-f45fa58b","guard":[["hasAny",["church","count","each word","how many","how many items","item number","nth","number of items","position","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the ",{"slot":2}," ",{"slot":3}," ",{"slot":4}," (",{"slot":5}," against 1902)."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.unit"]]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],["aggregate.countStrs",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-f806951c","guard":[["hasAny",["carol","character count","element","how many characters","item number","length","nth","number of characters","position"]],["has","books"],["has","greater"]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["aggregate.chars",["sense.subject"]]]],"mem":null},
{"id":"n-2bca52fe","guard":[["hasAny",["carol","change to","element","item number","nth","position","replace","substitute","swap"]],["has","greater"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["sense.lastWord"],["sense.roman"]]],"mem":null},
{"id":"n-4a9cc6b8","guard":[["hasAny",["abbots","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","whose"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":46},["sense.unit"]]],"mem":null},
{"id":"n-6490f0a7","guard":[["hasAny",["carol","element","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","between"],["not",["has","author"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":46},["sense.unit"]]],"mem":null},
{"id":"n-6f635c10","guard":[["hasAny",["carol","change to","item number","nth","position","replace","substitute","swap"]],["has","greater"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.lastWord"],["sense.roman"]]],"mem":null},
{"id":"n-ca6917b7","guard":[["hasAny",["chicken","how many words","item number","nth","number of words","position","word count"]],["has","whose"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]]]],"mem":null},
{"id":"n-d4e20970","guard":[["hasAny",["blizzard","element","how many words","item number","nth","number of words","position","word count"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.words",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]]]],"mem":null},
{"id":"n-ec5d11ce","guard":[["hasAny",["abbots","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["has","whose"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":46},["sense.unit"]]],"mem":null},
{"id":"n-d56dac82","guard":[["hasAny",["change to","child","item number","nth","position","replace","substitute","swap"]],["has","larger"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],["sense.unit"]]],"mem":null},
{"id":"n-67f760c9","guard":[["hasAny",["blizzard","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against 14835)."]},["aggregate.longest",["sense.words"]],["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-9779af41","guard":[["hasAny",["blizzard","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (19384 against ",{"slot":3},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-849faa69","guard":[["hasAny",["blizzard","diagonal","hypotenuse","item number","longest","longest one","longest word","nth","position","pythagoras","pythagorean","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["render.number",["compute.hypot",["sense.wordCount"],{"lit":14835}]]],"mem":null},
{"id":"n-a141ebc6","guard":[["hasAny",["first","item number","nth","position","shortest","shortest one","shortest word"]],["has","greater"]],"pyramid":["render.template",{"lit":[{"slot":0}," Comes but Once a ",{"slot":1}," Showing What ",{"slot":2},". Brown Did, ",{"slot":3},", and Intended to Do, During That Festive Season. has the larger gutenberg ",{"slot":4}," (20251 against ",{"slot":5},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.unit"],["aggregate.shortest",["sense.content"]],["aggregate.shortest",["sense.list"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-bf364504","guard":[["hasAny",["blizzard","diagonal","hypotenuse","item number","longest","longest one","longest word","nth","position","pythagoras","pythagorean","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["aggregate.shortest",["sense.content"]],["render.number",["compute.hypot",["sense.wordCount"],{"lit":19384}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-4b8af592","guard":[["hasAny",["first","item number","nth","position","shortest","shortest one","shortest word"]],["has","greater"]],"pyramid":["render.template",{"lit":[{"slot":0}," Comes but Once a ",{"slot":1}," Showing What ",{"slot":2},". Brown Did, ",{"slot":3},", and Intended to Do, During That Festive Season. has the larger gutenberg ",{"slot":4}," (20251 against ",{"slot":5},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["sense.units"]],["aggregate.shortest",["sense.content"]],["aggregate.shortest",["sense.list"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-68ce1c61","guard":[["hasAny",["first","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","greater"]],"pyramid":["render.template",{"lit":[{"slot":0}," Comes but Once a ",{"slot":1}," Showing What ",{"slot":2},". Brown Did, ",{"slot":3},", and Intended to Do, During That Festive Season. has the larger gutenberg ",{"slot":4}," (20251 against ",{"slot":5},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.units"]],["aggregate.shortest",["sense.content"]],["aggregate.shortest",["sense.list"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-7c7aef0e","guard":[["hasAny",["class name","first","item number","nth","pascal case","pascalcase","position","shortest","shortest one","shortest word","upper camel case"]],["has","greater"]],"pyramid":["render.template",{"lit":[{"slot":0}," Comes but Once a ",{"slot":1}," Showing What ",{"slot":2},". Brown Did, ",{"slot":3},", and Intended to Do, During That Festive Season. has the larger gutenberg ",{"slot":4}," (20251 against ",{"slot":5},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.pascal",["sense.unit"]],["aggregate.shortest",["sense.content"]],["aggregate.shortest",["sense.list"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-8e4632c3","guard":[["hasAny",["first","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","greater"]],"pyramid":["render.template",{"lit":[{"slot":0}," Comes but Once a ",{"slot":1}," Showing What ",{"slot":2},". Brown Did, ",{"slot":3},", and Intended to Do, During That Festive Season. has the larger gutenberg ",{"slot":4}," (20251 against ",{"slot":5},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.unit"]],["aggregate.shortest",["sense.content"]],["aggregate.shortest",["sense.list"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-b304bca4","guard":[["hasAny",["first","item number","nth","position","shortest","shortest one","shortest word"]],["has","greater"]],"pyramid":["render.template",{"lit":[{"slot":0}," Comes but Once a ",{"slot":1}," Showing What ",{"slot":2},". Brown Did, ",{"slot":3},", and Intended to Do, During That Festive Season. has the larger gutenberg ",{"slot":4}," (20251 against ",{"slot":5},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["sense.units"]],["aggregate.shortest",["sense.content"]],["aggregate.shortest",["sense.list"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-23a615bf","guard":[["hasAny",["each word","first","item number","nth","position","shortest","shortest one","shortest word","split into words","words"]],["has","greater"]],"pyramid":["render.template",{"lit":[{"slot":0}," Comes but Once a ",{"slot":1}," Showing What ",{"slot":2},". Brown Did, ",{"slot":3},", and Intended to Do, During That Festive Season. has the larger gutenberg ",{"slot":4}," (20251 against ",{"slot":5},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.unit"]]],["aggregate.shortest",["sense.content"]],["aggregate.shortest",["sense.list"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-ed1831c5","guard":[["hasAny",["each word","first","item number","nth","position","shortest","shortest one","shortest word","split into words","words"]],["has","greater"]],"pyramid":["render.template",{"lit":[{"slot":0}," Comes but Once a ",{"slot":1}," Showing What ",{"slot":2},". Brown Did, ",{"slot":3},", and Intended to Do, During That Festive Season. has the larger gutenberg ",{"slot":4}," (20251 against ",{"slot":5},")."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.unit"]]],["aggregate.shortest",["sense.content"]],["aggregate.shortest",["sense.list"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-7ae885ce","guard":[["hasAny",["blizzard","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On Christmas ",{"slot":0}," In The Evening has the larger gutenberg ",{"slot":1}," (",{"slot":2}," against ",{"slot":3},")."]},["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-7e318145","guard":[["hasAny",["blizzard","item number","longest","longest one","longest word","nth","position"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg id (",{"slot":2}," against ",{"slot":3},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-add5e6e2","guard":[["hasAny",["carol","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"],["not",["has","author"]]],"pyramid":["render.template",{"lit":["The Upas Tree: A ",{"slot":0}," ",{"slot":1}," for ",{"slot":2}," the ",{"slot":3}," has the larger gutenberg ",{"slot":4}," (",{"slot":5}," against 46)."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.content"],{"lit":12}],["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-b28f85d0","guard":[["hasAny",["blizzard","item number","longest","longest one","longest word","nth","position"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-098650f6","guard":[["hasAny",["blizzard","invert case","item number","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["transform.swapCase",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-13aafd49","guard":[["hasAny",["blizzard","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-4734dabc","guard":[["hasAny",["blizzard","class name","item number","longest","longest one","longest word","nth","pascal case","pascalcase","position","upper camel case"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["transform.pascal",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-555bfc63","guard":[["hasAny",["carol","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"],["not",["has","author"]]],"pyramid":["render.template",{"lit":["The Upas Tree: A ",{"slot":0}," ",{"slot":1}," for ",{"slot":2}," the ",{"slot":3}," has the larger gutenberg ",{"slot":4}," (",{"slot":5}," against 46)."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.content"],{"lit":12}],["sense.unit"],["aggregate.shortest",["sense.content"]],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]]],"mem":null},
{"id":"n-67452200","guard":[["hasAny",["carol","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"],["not",["has","author"]]],"pyramid":["render.template",{"lit":["The Upas Tree: A ",{"slot":0}," ",{"slot":1}," for ",{"slot":2}," the ",{"slot":3}," has the larger gutenberg ",{"slot":4}," (",{"slot":5}," against 46)."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.content"],{"lit":12}],["sense.unit"],["aggregate.shortest",["sense.content"]],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]]],"mem":null},
{"id":"n-982ca028","guard":[["hasAny",["blizzard","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-ee01df89","guard":[["hasAny",["all caps","blizzard","capital letters","capitals","item number","longest","longest one","longest word","nth","position","upper case","uppercase"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["transform.upper",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-28164e66","guard":[["hasAny",["blizzard","item number","longest","longest one","longest word","nth","position"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["transform.nthStr",["sense.words"],["sense.wordCount"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-28f1328e","guard":[["hasAny",["blizzard","invert case","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.unit"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-2a6794be","guard":[["hasAny",["blizzard","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-42067a4a","guard":[["hasAny",["blizzard","each word","item number","longest","longest one","longest word","nth","position","split into words","words"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["render.and",["transform.words",["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-4d64f316","guard":[["hasAny",["blizzard","class name","item number","longest","longest one","longest word","nth","pascal case","pascalcase","position","shortest","shortest one","shortest word","upper camel case"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["transform.pascal",["sense.unit"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-6d8b2cc5","guard":[["hasAny",["blizzard","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["render.list",["sense.units"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-a96bb3ad","guard":[["hasAny",["blizzard","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["aggregate.longest",["sense.units"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-ad65fb10","guard":[["hasAny",["blizzard","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.units"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-bbfed59d","guard":[["hasAny",["blizzard","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["render.and",["sense.units"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-f7bff3c9","guard":[["hasAny",["blizzard","each word","item number","longest","longest one","longest word","nth","position","split into words","words"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["render.list",["transform.words",["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-ffc281a6","guard":[["hasAny",["blizzard","item number","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["transform.nthStr",["sense.words"],{"lit":12}],["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-1100700a","guard":[["hasAny",["blizzard","each word","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words","words"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.unit"]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-11c50e70","guard":[["hasAny",["blizzard","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]]],"mem":null},
{"id":"n-163490a6","guard":[["hasAny",["blizzard","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["aggregate.shortest",["sense.content"]],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-7b261726","guard":[["hasAny",["blizzard","each word","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words","words"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.unit"]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-8ab83878","guard":[["hasAny",["blizzard","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["aggregate.shortest",["sense.content"]],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-a1012f08","guard":[["hasAny",["blizzard","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]]],"mem":null},
{"id":"n-bfcd7ffc","guard":[["hasAny",["blizzard","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["aggregate.shortest",["sense.content"]],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-c4583807","guard":[["hasAny",["blizzard","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["aggregate.shortest",["sense.content"]],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-43c110d8","guard":[["hasAny",["blizzard","delete","item number","longest","longest one","longest word","nth","position","remove","strip out","without"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-2e32ae57","guard":[["hasAny",["bigger than","carol","element","exceeds","greater than","item number","larger than","more than","nth","position","shortest","shortest one","shortest word"]],["has","between"],["not",["has","author"]]],"pyramid":["render.template",{"lit":["The Upas Tree: A ",{"slot":0}," ",{"slot":1}," for ",{"slot":2}," the ",{"slot":3}," has the larger gutenberg ",{"slot":4}," (",{"slot":5}," against 46)."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.nthStr",["sense.content"],{"lit":12}],["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-953a6ff5","guard":[["hasAny",["bigger than","blizzard","element","exceeds","greater than","item number","larger than","longest","longest one","longest word","more than","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":-1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}]],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-f1e2236e","guard":[["hasAny",["bigger than","blizzard","element","exceeds","greater than","item number","larger than","longest","longest one","longest word","more than","nth","position","shortest","shortest one","shortest word"]],["has","between"]],"pyramid":["render.template",{"lit":["On ",{"slot":0}," ",{"slot":1}," In The Evening has the larger gutenberg ",{"slot":2}," (",{"slot":3}," against ",{"slot":4},")."]},["aggregate.longest",["sense.words"]],["sense.unit"],["aggregate.shortest",["sense.content"]],["know.lookup",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":2}]],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],{"lit":1}],{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"},{"lit":"gutenberg id"}]],"mem":null},
{"id":"n-ada67f40","guard":[["hasAny",["church","join","joined with","separated by"]],["has","which"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.roman"]]],"mem":null},
{"id":"n-0a249b94","guard":[["hasAny",["abbots","join","joined with","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-62ae8b14","guard":[["hasAny",["church","join","joined with","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-781caac9","guard":[["hasAny",["abbots","join","joined with","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-8fa11540","guard":[["hasAny",["church","join","joined with","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-christmas-novels-420215"},{"lit":"title"}],["sense.before",{"lit":"in"}]]],"mem":null},
{"id":"n-e58856bd","guard":[["hasAny",["books","item number","log","log base","logarithm","nth","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["compute.log",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-01c2efd2","guard":[["hasAny",["digits backwards","digits reversed","inspiration","item number","nth","position","reverse the digits"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-2541a9a3","guard":[["hasAny",["all","element","how many lines","item number","line count","lines of code","nth","number of lines","position"]],["has","whose"],["has","thin"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.lines",["sense.unitTo"]]]],"mem":null},
{"id":"n-2c0ec892","guard":[["hasAny",["angel","backwards","item number","nth","position","reverse","reverse order","reversed"]],["has","larger"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.list"]],{"lit":5}]],"mem":null},
{"id":"n-520eadd5","guard":[["hasAny",["character count","how many characters","item number","length","nth","number of characters","position","prodigal"]],["has","larger"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.chars",["sense.roman"]]]],"mem":null},
{"id":"n-990bc79f","guard":[["hasAny",["add the digits","digit sum","inspiration","item number","nth","position","sum of the digits"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-033e58a1","guard":[["hasAny",["all","chicken","christmas","claus","gutenberg","id","larger","santa","stocking","story","thin","tree","upas","yard","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking or The Upas Tree: A Christmas Story for all the Year":"The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking has the larger gutenberg id (17937 against 16454)."}}},
{"id":"n-04bb9119","guard":[["hasAny",["burns","christmas","elsie","grandma","gutenberg","has","id","larger","log","story","yule"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, When the Yule Log Burns: A Christmas Story or Christmas with Grandma Elsie":"When the Yule Log Burns: A Christmas Story has the larger gutenberg id (17510 against 14534)."}}},
{"id":"n-07a66bca","guard":[["hasAny",["christmas","gutenberg","id","kringle","kris","larger","mr","rosemary","story","tale"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Rosemary: A Christmas story or Mr. Kris Kringle: A Christmas Tale":"Mr. Kris Kringle: A Christmas Tale has the larger gutenberg id (20180 against 17743)."}}},
{"id":"n-088c4ce4","guard":[["hasAny",["angel","between","christmas","eve","greater","gutenberg","has","id","men","mystery","story","three","unawares","wise"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between A Christmas Mystery: The Story of Three Wise Men and Angel Unawares: A Story of Christmas Eve, which has the greater gutenberg id":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 10707)."}}},
{"id":"n-0ae60a6e","guard":[["hasAny",["between","brown","christmas","comes","during","festive","greater","gutenberg","has","id","intended","mr","once","rosemary","season","showing","story","thought","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. and Rosemary: A Christmas story, which has the greater gutenberg id":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 17743)."}}},
{"id":"n-10354df6","guard":[["hasAny",["all","bess","between","christmas","gift","greater","gutenberg","has","id","queen","shakespeares","story","tree","upas","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between The Upas Tree: A Christmas Story for all the Year and Shakespeare's Christmas Gift to Queen Bess, which has the greater gutenberg id":"Shakespeare's Christmas Gift to Queen Bess has the larger gutenberg id (20210 against 16454)."}}},
{"id":"n-107ecb76","guard":[["hasAny",["between","christmas","day","evening","greater","gutenberg","has","id","prodigal","tale","village"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between On Christmas Day In The Evening and The Prodigal Village: A Christmas Tale, which has the greater gutenberg id":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 19384)."}}},
{"id":"n-1149eba4","guard":[["hasAny",["books","christmas","church","country","gutenberg","has","id","larger","ma","mr","old","peabody","pew","romance","titmarsh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Old Peabody Pew: A Christmas Romance of a Country Church or The Christmas Books of Mr. M.A. Titmarsh":"The Christmas Books of Mr. M.A. Titmarsh has the larger gutenberg id (2731 against 1902)."}}},
{"id":"n-121feafc","guard":[["hasAny",["between","blizzard","burglar","card","christmas","greater","gutenberg","has","id","romance","story"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between The Romance of a Christmas Card and The Burglar and the Blizzard: A Christmas Story, which has the greater gutenberg id":"The Romance of a Christmas Card has the larger gutenberg id (17456 against 14835)."}}},
{"id":"n-173c2e27","guard":[["hasAny",["came","carol","christmas","fantasy","gutenberg","has","he","id","larger","thus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, A Christmas Carol or And Thus He Came: A Christmas Fantasy":"A Christmas Carol has the larger gutenberg id (19337 against 14606)."}}},
{"id":"n-1a2ac3fe","guard":[["hasAny",["christmas","colonel","cooperative","crocketts","gutenberg","has","id","larger","prodigal","tale","village"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Prodigal Village: A Christmas Tale or Colonel Crockett's Co-operative Christmas":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 22696)."}}},
{"id":"n-1b4b4366","guard":[["hasAny",["blizzard","burglar","child","christmas","gutenberg","id","larger","story"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Burglar and the Blizzard: A Christmas Story or The Christmas Child":"The Christmas Child has the larger gutenberg id (20453 against 14835)."}}},
{"id":"n-1d316e20","guard":[["hasAny",["came","christmas","elsie","fantasy","grandma","gutenberg","he","id","larger","thus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: And Thus He Came: A Christmas Fantasy or Christmas with Grandma Elsie":"And Thus He Came: A Christmas Fantasy has the larger gutenberg id (14606 against 14534)."}}},
{"id":"n-227cc58a","guard":[["hasAny",["ago","christmas","colonel","cooperative","crocketts","gutenberg","has","id","larger","legend","long","lost","word"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, Colonel Crockett's Co-operative Christmas or The Lost Word: A Christmas Legend of Long Ago":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 4384)."}}},
{"id":"n-29c03ed3","guard":[["hasAny",["between","books","christmas","colonel","cooperative","crocketts","greater","gutenberg","has","id","ma","mr","titmarsh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Colonel Crockett's Co-operative Christmas and The Christmas Books of Mr. M.A. Titmarsh, which has the greater gutenberg id":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 2731)."}}},
{"id":"n-2b1e4760","guard":[["hasAny",["christmas","church","country","day","evening","gutenberg","id","larger","old","peabody","pew","romance"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: On Christmas Day In The Evening or The Old Peabody Pew: A Christmas Romance of a Country Church":"On Christmas Day In The Evening has the larger gutenberg id (19384 against 1902)."}}},
{"id":"n-2cdb84fd","guard":[["hasAny",["christmas","donaldson","evenings","guest","gutenberg","id","inspiration","larger","manor","noahs","uncle"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Evenings at Donaldson Manor; Or, The Christmas Guest or Uncle Noah's Christmas Inspiration":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 15826)."}}},
{"id":"n-31f91014","guard":[["hasAny",["brown","carol","christmas","comes","during","festive","ghost","gutenberg","id","intended","larger","mr","once","prose","season","showing","story","thought","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. or A Christmas Carol in Prose; Being a Ghost Story of Christmas":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 46)."}}},
{"id":"n-3260ebd0","guard":[["hasAny",["card","christmas","doctors","eve","gutenberg","id","larger","romance"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Doctor's Christmas Eve or The Romance of a Christmas Card":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 17456)."}}},
{"id":"n-366180fd","guard":[["hasAny",["blizzard","burglar","christmas","element","gutenberg","has","his","house","id","keep","larger","man","new","story","way"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Burglar and the Blizzard: A Christmas Story or A Christmas Story Man in His Element: or, A New Way to Keep House":"A Christmas Story Man in His Element: or, A New Way to Keep House has the larger gutenberg id (18770 against 14835)."}}},
{"id":"n-37b4f9b0","guard":[["hasAny",["angel","christmas","eve","gutenberg","id","larger","story","unawares"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Christmas Angel or Angel Unawares: A Story of Christmas Eve":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 15709)."}}},
{"id":"n-37db5ca9","guard":[["hasAny",["between","burns","christmas","donaldson","evenings","greater","guest","gutenberg","has","id","log","manor","story","yule"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between When the Yule Log Burns: A Christmas Story and Evenings at Donaldson Manor; Or, The Christmas Guest, which has the greater gutenberg id":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 17510)."}}},
{"id":"n-3834c708","guard":[["hasAny",["christmas","element","gutenberg","his","house","id","keep","larger","man","new","story","way"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Christmas: A Story or A Christmas Story Man in His Element: or, A New Way to Keep House":"Christmas: A Story has the larger gutenberg id (20516 against 18770)."}}},
{"id":"n-3c82960e","guard":[["hasAny",["blizzard","burglar","christmas","gutenberg","has","id","larger","story"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Burglar and the Blizzard: A Christmas Story or Christmas: A Story":"Christmas: A Story has the larger gutenberg id (20516 against 14835)."}}},
{"id":"n-3cfeb894","guard":[["hasAny",["between","child","christmas","greater","gutenberg","has","id","story"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Christmas: A Story and The Christmas Child, which has the greater gutenberg id":"Christmas: A Story has the larger gutenberg id (20516 against 20453)."}}},
{"id":"n-3d7d95bc","guard":[["hasAny",["all","between","carol","christmas","ghost","greater","gutenberg","has","id","prose","story","tree","upas","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between A Christmas Carol in Prose; Being a Ghost Story of Christmas and The Upas Tree: A Christmas Story for all the Year, which has the greater gutenberg id":"The Upas Tree: A Christmas Story for all the Year has the larger gutenberg id (16454 against 46)."}}},
{"id":"n-3e14ad55","guard":[["hasAny",["carol","christmas","first","forest","ghost","gutenberg","has","id","larger","prose","story","tree"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The First Christmas Tree: A Story of the Forest or A Christmas Carol in Prose; Being a Ghost Story of Christmas":"The First Christmas Tree: A Story of the Forest has the larger gutenberg id (16134 against 46)."}}},
{"id":"n-3ef6b9c1","guard":[["hasAny",["between","child","christmas","element","greater","gutenberg","has","his","house","id","keep","man","new","story","way"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between The Christmas Child and A Christmas Story Man in His Element: or, A New Way to Keep House, which has the greater gutenberg id":"The Christmas Child has the larger gutenberg id (20453 against 18770)."}}},
{"id":"n-3f580e4f","guard":[["hasAny",["ago","carol","christmas","gutenberg","has","id","larger","legend","long","lost","word"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Lost Word: A Christmas Legend of Long Ago or A Christmas Carol":"A Christmas Carol has the larger gutenberg id (19337 against 4384)."}}},
{"id":"n-407d587d","guard":[["hasAny",["christmas","church","country","gutenberg","id","larger","old","peabody","pew","prodigal","romance","tale","village"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Old Peabody Pew: A Christmas Romance of a Country Church or The Prodigal Village: A Christmas Tale":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 1902)."}}},
{"id":"n-4194335d","guard":[["hasAny",["abbots","chicken","christmas","claus","ghost","gutenberg","has","id","larger","maurice","santa","stocking","story","temptation","thin","trehernes","yard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking or The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story":"The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking has the larger gutenberg id (17937 against 8694)."}}},
{"id":"n-42a093f3","guard":[["hasAny",["christmas","first","forest","gutenberg","id","larger","rosemary","story","tree"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The First Christmas Tree: A Story of the Forest or Rosemary: A Christmas story":"Rosemary: A Christmas story has the larger gutenberg id (17743 against 16134)."}}},
{"id":"n-466e68e6","guard":[["hasAny",["christmas","doctors","eve","gutenberg","id","kringle","kris","larger","mr","tale"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Mr. Kris Kringle: A Christmas Tale or The Doctor's Christmas Eve":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 20180)."}}},
{"id":"n-487ead31","guard":[["hasAny",["between","books","carol","christmas","greater","gutenberg","has","id","ma","mr","titmarsh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between The Christmas Books of Mr. M.A. Titmarsh and A Christmas Carol, which has the greater gutenberg id":"A Christmas Carol has the larger gutenberg id (19337 against 2731)."}}},
{"id":"n-4af183fb","guard":[["hasAny",["ago","burns","christmas","gutenberg","id","larger","legend","log","long","lost","story","word","yule"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Lost Word: A Christmas Legend of Long Ago or When the Yule Log Burns: A Christmas Story":"When the Yule Log Burns: A Christmas Story has the larger gutenberg id (17510 against 4384)."}}},
{"id":"n-4cb41035","guard":[["hasAny",["angel","between","christmas","greater","gutenberg","has","id","inspiration","noahs","uncle"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Uncle Noah's Christmas Inspiration and The Christmas Angel, which has the greater gutenberg id":"Uncle Noah's Christmas Inspiration has the larger gutenberg id (15826 against 15709)."}}},
{"id":"n-4e57b5a0","guard":[["hasAny",["abbots","all","christmas","ghost","gutenberg","id","larger","maurice","story","temptation","tree","trehernes","upas","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Upas Tree: A Christmas Story for all the Year or The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story":"The Upas Tree: A Christmas Story for all the Year has the larger gutenberg id (16454 against 8694)."}}},
{"id":"n-52aa57df","guard":[["hasAny",["christmas","donaldson","evenings","guest","gutenberg","has","id","larger","manor","men","mystery","story","three","wise"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, Evenings at Donaldson Manor; Or, The Christmas Guest or A Christmas Mystery: The Story of Three Wise Men":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 10707)."}}},
{"id":"n-533a8b24","guard":[["hasAny",["christmas","elsie","grandma","gutenberg","id","larger","men","mystery","story","three","wise"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Christmas with Grandma Elsie or A Christmas Mystery: The Story of Three Wise Men":"Christmas with Grandma Elsie has the larger gutenberg id (14534 against 10707)."}}},
{"id":"n-561a5880","guard":[["hasAny",["christmas","first","forest","gutenberg","id","inspiration","larger","noahs","story","tree","uncle"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Uncle Noah's Christmas Inspiration or The First Christmas Tree: A Story of the Forest":"The First Christmas Tree: A Story of the Forest has the larger gutenberg id (16134 against 15826)."}}},
{"id":"n-59eee13d","guard":[["hasAny",["adventure","bess","camp","carver","christmas","fire","gift","girls","gutenberg","house","id","larger","mystery","queen","shakespeares","solve"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Shakespeare's Christmas Gift to Queen Bess or The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 20210)."}}},
{"id":"n-59f0ea9d","guard":[["hasAny",["all","christmas","gutenberg","has","id","kringle","kris","larger","mr","story","tale","tree","upas","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Upas Tree: A Christmas Story for all the Year or Mr. Kris Kringle: A Christmas Tale":"Mr. Kris Kringle: A Christmas Tale has the larger gutenberg id (20180 against 16454)."}}},
{"id":"n-5c52ecac","guard":[["hasAny",["bess","between","christmas","eden","gift","greater","gutenberg","has","id","outside","queen","shakespeares"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Shakespeare's Christmas Gift to Queen Bess and Christmas Outside of Eden, which has the greater gutenberg id":"Shakespeare's Christmas Gift to Queen Bess has the larger gutenberg id (20210 against 15552)."}}},
{"id":"n-5d3ca8a5","guard":[["hasAny",["christmas","doctors","eden","eve","gutenberg","has","id","larger","outside"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Doctor's Christmas Eve or Christmas Outside of Eden":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 15552)."}}},
{"id":"n-5f489fb9","guard":[["hasAny",["card","christmas","gutenberg","has","id","larger","romance","story"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Romance of a Christmas Card or Christmas: A Story":"Christmas: A Story has the larger gutenberg id (20516 against 17456)."}}},
{"id":"n-6442d7f1","guard":[["hasAny",["carol","christmas","colonel","cooperative","crocketts","gutenberg","id","larger"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Colonel Crockett's Co-operative Christmas or A Christmas Carol":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 19337)."}}},
{"id":"n-66e03679","guard":[["hasAny",["books","christmas","gutenberg","id","larger","ma","mr","prodigal","tale","titmarsh","village"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Prodigal Village: A Christmas Tale or The Christmas Books of Mr. M.A. Titmarsh":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 2731)."}}},
{"id":"n-688f3542","guard":[["hasAny",["angel","christmas","eve","gutenberg","has","id","inspiration","larger","noahs","story","unawares","uncle"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, Uncle Noah's Christmas Inspiration or Angel Unawares: A Story of Christmas Eve":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 15826)."}}},
{"id":"n-69f66742","guard":[["hasAny",["abbots","bess","christmas","ghost","gift","gutenberg","id","larger","maurice","queen","shakespeares","story","temptation","trehernes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story or Shakespeare's Christmas Gift to Queen Bess":"Shakespeare's Christmas Gift to Queen Bess has the larger gutenberg id (20210 against 8694)."}}},
{"id":"n-6ab85ee8","guard":[["hasAny",["brown","chicken","christmas","claus","comes","during","festive","gutenberg","has","id","intended","larger","mr","once","santa","season","showing","stocking","thin","thought","yard","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. or The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 17937)."}}},
{"id":"n-6bb513bd","guard":[["hasAny",["between","christmas","eden","greater","gutenberg","has","id","outside","story"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Christmas Outside of Eden and Christmas: A Story, which has the greater gutenberg id":"Christmas: A Story has the larger gutenberg id (20516 against 15552)."}}},
{"id":"n-6c4ec2fd","guard":[["hasAny",["carol","christmas","ghost","gutenberg","has","id","larger","prose","rosemary","story"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, A Christmas Carol in Prose; Being a Ghost Story of Christmas or Rosemary: A Christmas story":"Rosemary: A Christmas story has the larger gutenberg id (17743 against 46)."}}},
{"id":"n-6ebf7d50","guard":[["hasAny",["angel","between","carol","christmas","eve","ghost","greater","gutenberg","has","id","prose","story","unawares"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Angel Unawares: A Story of Christmas Eve and A Christmas Carol in Prose; Being a Ghost Story of Christmas, which has the greater gutenberg id":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 46)."}}},
{"id":"n-6ffac1d3","guard":[["hasAny",["bess","christmas","doctors","eve","gift","gutenberg","has","id","larger","queen","shakespeares"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, Shakespeare's Christmas Gift to Queen Bess or The Doctor's Christmas Eve":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 20210)."}}},
{"id":"n-70e5bd23","guard":[["hasAny",["between","chicken","christmas","claus","greater","gutenberg","has","id","rosemary","santa","stocking","story","thin","yard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Rosemary: A Christmas story and The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking, which has the greater gutenberg id":"The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking has the larger gutenberg id (17937 against 17743)."}}},
{"id":"n-72eb526d","guard":[["hasAny",["between","christmas","church","colonel","cooperative","country","crocketts","greater","gutenberg","has","id","old","peabody","pew","romance"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between The Old Peabody Pew: A Christmas Romance of a Country Church and Colonel Crockett's Co-operative Christmas, which has the greater gutenberg id":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 1902)."}}},
{"id":"n-7347bb90","guard":[["hasAny",["between","blizzard","burglar","christmas","day","evening","greater","gutenberg","has","id","story"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between The Burglar and the Blizzard: A Christmas Story and On Christmas Day In The Evening, which has the greater gutenberg id":"On Christmas Day In The Evening has the larger gutenberg id (19384 against 14835)."}}},
{"id":"n-8587d66e","guard":[["hasAny",["angel","brown","christmas","comes","during","eve","festive","gutenberg","id","intended","larger","mr","once","season","showing","story","thought","unawares","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Angel Unawares: A Story of Christmas Eve or Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season.":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 20251)."}}},
{"id":"n-87852d1e","guard":[["hasAny",["carol","christmas","donaldson","evenings","guest","gutenberg","id","larger","manor"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: A Christmas Carol or Evenings at Donaldson Manor; Or, The Christmas Guest":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 19337)."}}},
{"id":"n-890e56cb","guard":[["hasAny",["angel","christmas","gutenberg","id","larger","men","mystery","story","three","wise"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: A Christmas Mystery: The Story of Three Wise Men or The Christmas Angel":"The Christmas Angel has the larger gutenberg id (15709 against 10707)."}}},
{"id":"n-896f52bf","guard":[["hasAny",["angel","between","christmas","first","forest","greater","gutenberg","has","id","story","tree"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between The Christmas Angel and The First Christmas Tree: A Story of the Forest, which has the greater gutenberg id":"The First Christmas Tree: A Story of the Forest has the larger gutenberg id (16134 against 15709)."}}},
{"id":"n-8bbe2008","guard":[["hasAny",["child","christmas","church","country","gutenberg","has","id","larger","old","peabody","pew","romance"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Christmas Child or The Old Peabody Pew: A Christmas Romance of a Country Church":"The Christmas Child has the larger gutenberg id (20453 against 1902)."}}},
{"id":"n-8d16c66b","guard":[["hasAny",["christmas","gutenberg","has","id","inspiration","larger","men","mystery","noahs","story","three","uncle","wise"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, A Christmas Mystery: The Story of Three Wise Men or Uncle Noah's Christmas Inspiration":"Uncle Noah's Christmas Inspiration has the larger gutenberg id (15826 against 10707)."}}},
{"id":"n-8e59db2b","guard":[["hasAny",["christmas","day","element","evening","gutenberg","has","his","house","id","keep","larger","man","new","story","way"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, On Christmas Day In The Evening or A Christmas Story Man in His Element: or, A New Way to Keep House":"On Christmas Day In The Evening has the larger gutenberg id (19384 against 18770)."}}},
{"id":"n-90a5b9cf","guard":[["hasAny",["between","christmas","church","country","greater","gutenberg","has","id","old","peabody","pew","romance","story"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Christmas: A Story and The Old Peabody Pew: A Christmas Romance of a Country Church, which has the greater gutenberg id":"Christmas: A Story has the larger gutenberg id (20516 against 1902)."}}},
{"id":"n-93c5a4cf","guard":[["hasAny",["adventure","between","camp","card","carver","christmas","fire","girls","greater","gutenberg","has","house","id","mystery","romance","solve"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House and The Romance of a Christmas Card, which has the greater gutenberg id":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 17456)."}}},
{"id":"n-9517c086","guard":[["hasAny",["abbots","adventure","camp","carver","christmas","fire","ghost","girls","gutenberg","has","house","id","larger","maurice","mystery","solve","story","temptation","trehernes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story or The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 8694)."}}},
{"id":"n-9535e047","guard":[["hasAny",["adventure","between","camp","carver","christmas","doctors","eve","fire","girls","greater","gutenberg","has","house","id","mystery","solve"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between The Doctor's Christmas Eve and The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House, which has the greater gutenberg id":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 38983)."}}},
{"id":"n-98ab6aa0","guard":[["hasAny",["christmas","day","evening","gutenberg","has","id","larger","story"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, Christmas: A Story or On Christmas Day In The Evening":"Christmas: A Story has the larger gutenberg id (20516 against 19384)."}}},
{"id":"n-9be0bc73","guard":[["hasAny",["between","came","christmas","fantasy","greater","gutenberg","has","he","id","men","mystery","story","three","thus","wise"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between And Thus He Came: A Christmas Fantasy and A Christmas Mystery: The Story of Three Wise Men, which has the greater gutenberg id":"And Thus He Came: A Christmas Fantasy has the larger gutenberg id (14606 against 10707)."}}},
{"id":"n-9c51f50d","guard":[["hasAny",["between","christmas","church","country","element","greater","gutenberg","has","his","house","id","keep","man","new","old","peabody","pew","romance","story","way"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between A Christmas Story Man in His Element: or, A New Way to Keep House and The Old Peabody Pew: A Christmas Romance of a Country Church, which has the greater gutenberg id":"A Christmas Story Man in His Element: or, A New Way to Keep House has the larger gutenberg id (18770 against 1902)."}}},
{"id":"n-9d684b39","guard":[["hasAny",["child","christmas","gutenberg","id","larger","prodigal","tale","village"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Christmas Child or The Prodigal Village: A Christmas Tale":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 20453)."}}},
{"id":"n-a55340cf","guard":[["hasAny",["between","brown","christmas","comes","during","festive","first","forest","greater","gutenberg","has","id","intended","mr","once","season","showing","story","thought","tree","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between The First Christmas Tree: A Story of the Forest and Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season., which has the greater gutenberg id":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 16134)."}}},
{"id":"n-a6473b5c","guard":[["hasAny",["adventure","camp","carver","christmas","eden","fire","girls","gutenberg","house","id","larger","mystery","outside","solve"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House or Christmas Outside of Eden":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 15552)."}}},
{"id":"n-a8db10aa","guard":[["hasAny",["books","burns","christmas","gutenberg","has","id","larger","log","ma","mr","story","titmarsh","yule"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Christmas Books of Mr. M.A. Titmarsh or When the Yule Log Burns: A Christmas Story":"When the Yule Log Burns: A Christmas Story has the larger gutenberg id (17510 against 2731)."}}},
{"id":"n-ae86a33f","guard":[["hasAny",["between","christmas","donaldson","elsie","evenings","grandma","greater","guest","gutenberg","has","id","manor"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Evenings at Donaldson Manor; Or, The Christmas Guest and Christmas with Grandma Elsie, which has the greater gutenberg id":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 14534)."}}},
{"id":"n-b1aa2cb2","guard":[["hasAny",["ago","between","came","christmas","fantasy","greater","gutenberg","has","he","id","legend","long","lost","thus","word"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between The Lost Word: A Christmas Legend of Long Ago and And Thus He Came: A Christmas Fantasy, which has the greater gutenberg id":"And Thus He Came: A Christmas Fantasy has the larger gutenberg id (14606 against 4384)."}}},
{"id":"n-b2e2f7b2","guard":[["hasAny",["ago","between","christmas","greater","gutenberg","has","id","legend","long","lost","prodigal","tale","village","word"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between The Prodigal Village: A Christmas Tale and The Lost Word: A Christmas Legend of Long Ago, which has the greater gutenberg id":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 4384)."}}},
{"id":"n-b4ae9dcc","guard":[["hasAny",["between","chicken","christmas","claus","greater","gutenberg","has","id","kringle","kris","mr","santa","stocking","tale","thin","yard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking and Mr. Kris Kringle: A Christmas Tale, which has the greater gutenberg id":"Mr. Kris Kringle: A Christmas Tale has the larger gutenberg id (20180 against 17937)."}}},
{"id":"n-b6a745fe","guard":[["hasAny",["between","christmas","elsie","grandma","greater","gutenberg","has","id","inspiration","noahs","uncle"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Christmas with Grandma Elsie and Uncle Noah's Christmas Inspiration, which has the greater gutenberg id":"Uncle Noah's Christmas Inspiration has the larger gutenberg id (15826 against 14534)."}}},
{"id":"n-b97ad2a7","guard":[["hasAny",["child","christmas","day","evening","gutenberg","id","larger"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Christmas Child or On Christmas Day In The Evening":"The Christmas Child has the larger gutenberg id (20453 against 19384)."}}},
{"id":"n-c31b562c","guard":[["hasAny",["burns","came","christmas","fantasy","gutenberg","he","id","larger","log","story","thus","yule"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: When the Yule Log Burns: A Christmas Story or And Thus He Came: A Christmas Fantasy":"When the Yule Log Burns: A Christmas Story has the larger gutenberg id (17510 against 14606)."}}},
{"id":"n-c4191c27","guard":[["hasAny",["christmas","element","gutenberg","has","his","house","id","keep","larger","man","new","prodigal","story","tale","village","way"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, A Christmas Story Man in His Element: or, A New Way to Keep House or The Prodigal Village: A Christmas Tale":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 18770)."}}},
{"id":"n-c4e1f3b0","guard":[["hasAny",["came","christmas","donaldson","evenings","fantasy","guest","gutenberg","has","he","id","larger","manor","thus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, And Thus He Came: A Christmas Fantasy or Evenings at Donaldson Manor; Or, The Christmas Guest":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 14606)."}}},
{"id":"n-cd4fde7b","guard":[["hasAny",["all","christmas","gutenberg","has","id","larger","rosemary","story","tree","upas","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, Rosemary: A Christmas story or The Upas Tree: A Christmas Story for all the Year":"Rosemary: A Christmas story has the larger gutenberg id (17743 against 16454)."}}},
{"id":"n-cdc13624","guard":[["hasAny",["card","christmas","eden","gutenberg","has","id","larger","outside","romance"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, Christmas Outside of Eden or The Romance of a Christmas Card":"The Romance of a Christmas Card has the larger gutenberg id (17456 against 15552)."}}},
{"id":"n-d0b6b7ce","guard":[["hasAny",["christmas","colonel","cooperative","crocketts","day","evening","gutenberg","has","id","larger"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, On Christmas Day In The Evening or Colonel Crockett's Co-operative Christmas":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 19384)."}}},
{"id":"n-d76de7d2","guard":[["hasAny",["abbots","between","christmas","doctors","eve","ghost","greater","gutenberg","has","id","maurice","story","temptation","trehernes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story and The Doctor's Christmas Eve, which has the greater gutenberg id":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 8694)."}}},
{"id":"n-d8637f95","guard":[["hasAny",["bess","christmas","gift","gutenberg","has","id","kringle","kris","larger","mr","queen","shakespeares","tale"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, Mr. Kris Kringle: A Christmas Tale or Shakespeare's Christmas Gift to Queen Bess":"Shakespeare's Christmas Gift to Queen Bess has the larger gutenberg id (20210 against 20180)."}}},
{"id":"n-d97c91ca","guard":[["hasAny",["angel","brown","christmas","comes","during","festive","gutenberg","has","id","intended","larger","mr","once","season","showing","thought","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Christmas Angel or Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season.":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 15709)."}}},
{"id":"n-db0ad3be","guard":[["hasAny",["christmas","colonel","cooperative","crocketts","element","gutenberg","his","house","id","keep","larger","man","new","story","way"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: A Christmas Story Man in His Element: or, A New Way to Keep House or Colonel Crockett's Co-operative Christmas":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 18770)."}}},
{"id":"n-db62a45a","guard":[["hasAny",["carol","chicken","christmas","claus","ghost","gutenberg","id","larger","prose","santa","stocking","story","thin","yard"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: A Christmas Carol in Prose; Being a Ghost Story of Christmas or The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking":"The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking has the larger gutenberg id (17937 against 46)."}}},
{"id":"n-df79b25e","guard":[["hasAny",["ago","books","christmas","gutenberg","id","larger","legend","long","lost","ma","mr","titmarsh","word"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Christmas Books of Mr. M.A. Titmarsh or The Lost Word: A Christmas Legend of Long Ago":"The Lost Word: A Christmas Legend of Long Ago has the larger gutenberg id (4384 against 2731)."}}},
{"id":"n-e1456356","guard":[["hasAny",["between","burns","carol","christmas","greater","gutenberg","has","id","log","story","yule"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between A Christmas Carol and When the Yule Log Burns: A Christmas Story, which has the greater gutenberg id":"A Christmas Carol has the larger gutenberg id (19337 against 17510)."}}},
{"id":"n-e9602d33","guard":[["hasAny",["abbots","between","christmas","ghost","greater","gutenberg","has","id","kringle","kris","maurice","mr","story","tale","temptation","trehernes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between Mr. Kris Kringle: A Christmas Tale and The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story, which has the greater gutenberg id":"Mr. Kris Kringle: A Christmas Tale has the larger gutenberg id (20180 against 8694)."}}},
{"id":"n-ec325ffc","guard":[["hasAny",["angel","christmas","elsie","grandma","gutenberg","has","id","larger"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, Christmas with Grandma Elsie or The Christmas Angel":"The Christmas Angel has the larger gutenberg id (15709 against 14534)."}}},
{"id":"n-f207b0a7","guard":[["hasAny",["blizzard","burglar","christmas","eden","gutenberg","id","larger","outside","story"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Christmas Outside of Eden or The Burglar and the Blizzard: A Christmas Story":"Christmas Outside of Eden has the larger gutenberg id (15552 against 14835)."}}},
{"id":"n-f5ba6040","guard":[["hasAny",["card","child","christmas","gutenberg","id","larger","romance"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Romance of a Christmas Card or The Christmas Child":"The Christmas Child has the larger gutenberg id (20453 against 17456)."}}},
{"id":"n-ffab4ae3","guard":[["hasAny",["adventure","blizzard","burglar","camp","carver","christmas","fire","girls","gutenberg","has","house","id","larger","mystery","solve","story"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House or The Burglar and the Blizzard: A Christmas Story":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 14835)."}}},
{"id":"n-ffbc3900","guard":[["hasAny",["angel","christmas","eve","first","forest","gutenberg","has","id","larger","story","tree","unawares"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, Angel Unawares: A Story of Christmas Eve or The First Christmas Tree: A Story of the Forest":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 16134)."}}},
{"id":"n-0169b828","guard":[["hasAny",["carol","delete","remove","strip out"]],["has","greater"]],"pyramid":["render.str",["transform.remove",{"lit":"A Christmas Carol"},["sense.roman"]]],"mem":null},
{"id":"n-2f0518dd","guard":[["hasAny",["delete","prodigal","remove","strip out","without"]],["has","between"]],"pyramid":["render.str",["transform.remove",{"lit":"The Prodigal Village: A Christmas Tale"},["sense.unit"]]],"mem":null},
{"id":"n-46ac7ccc","guard":[["hasAny",["delete","eve","remove","strip out","without"]],["has","unawares"],["has","whose"]],"pyramid":["render.str",["transform.remove",{"lit":"Angel Unawares: A Story of Christmas Eve"},["sense.unit"]]],"mem":null},
{"id":"n-870f73c9","guard":[["hasAny",["delete","prodigal","remove","strip out"]],["has","larger"]],"pyramid":["render.str",["transform.remove",{"lit":"The Prodigal Village: A Christmas Tale"},["sense.roman"]]],"mem":null},
{"id":"n-9b95359b","guard":[["hasAny",["delete","first","remove","strip out","without"]],["has","greater"]],"pyramid":["render.str",["transform.remove",{"lit":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season."},["sense.unit"]]],"mem":null},
{"id":"n-9ff28302","guard":[["hasAny",["brown","delete","remove","strip out","without"]],["has","which"],["has","larger"]],"pyramid":["render.str",["transform.remove",{"lit":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season."},["sense.unitTo"]]],"mem":null},
{"id":"n-b548f0b9","guard":[["hasAny",["child","delete","remove","strip out","without"]],["has","on"],["has","whose"]],"pyramid":["render.str",["transform.remove",{"lit":"The Christmas Child"},["sense.unit"]]],"mem":null},
{"id":"n-b5568094","guard":[["hasAny",["colonel","delete","remove","strip out"]],["has","between"]],"pyramid":["render.str",["transform.remove",{"lit":"Colonel Crockett's Co-operative Christmas"},["sense.roman"]]],"mem":null},
{"id":"n-fb0b2bbd","guard":[["hasAny",["colonel","delete","remove","strip out","without"]],["words<=",17]],"pyramid":["render.str",["transform.remove",{"lit":"Colonel Crockett's Co-operative Christmas"},["sense.unit"]]],"mem":null},
{"id":"n-037f82e2","guard":[["hasAny",["kringle","kris","mr","tale"]],["has","greater"],["has","abbots"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Mr. Kris Kringle: A Christmas Tale and The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story, which has the greater gutenberg id":"Mr. Kris Kringle: A Christmas Tale has the larger gutenberg id (20180 against 8694)."}}},
{"id":"n-04a446ea","guard":[["has","rosemary"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Rosemary: A Christmas story or Mr. Kris Kringle: A Christmas Tale":"Mr. Kris Kringle: A Christmas Tale has the larger gutenberg id (20180 against 17743)."}}},
{"id":"n-09ee4702","guard":[["has","carol"],["not",["has","author"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, A Christmas Carol or And Thus He Came: A Christmas Fantasy":"A Christmas Carol has the larger gutenberg id (19337 against 14606)."}}},
{"id":"n-29188932","guard":[["has","carol"],["has","greater"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between The Christmas Books of Mr. M.A. Titmarsh and A Christmas Carol, which has the greater gutenberg id":"A Christmas Carol has the larger gutenberg id (19337 against 2731)."}}},
{"id":"n-2af7111f","guard":[["has","rosemary"],["has","between"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Rosemary: A Christmas story and The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking, which has the greater gutenberg id":"The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking has the larger gutenberg id (17937 against 17743)."}}},
{"id":"n-530345c1","guard":[["has","rosemary"],["has","between"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. and Rosemary: A Christmas story, which has the greater gutenberg id":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 17743)."}}},
{"id":"n-53b6a2b9","guard":[["has","angel"],["has","larger"],["has","with"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, Christmas with Grandma Elsie or The Christmas Angel":"The Christmas Angel has the larger gutenberg id (15709 against 14534)."}}},
{"id":"n-56adeed0","guard":[["hasAny",["inspiration","noahs","uncle"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Evenings at Donaldson Manor; Or, The Christmas Guest or Uncle Noah's Christmas Inspiration":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 15826)."}}},
{"id":"n-5fa6b546","guard":[["hasAny",["abbots","ghost","maurice","temptation","trehernes"]],["not",["has","author"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story or The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 8694)."}}},
{"id":"n-6bd9525d","guard":[["hasAny",["first","forest","tree"]],["words<=",37]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between The First Christmas Tree: A Story of the Forest and Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season., which has the greater gutenberg id":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 16134)."}}},
{"id":"n-71bae175","guard":[["hasAny",["bess","gift","queen","shakespeares"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Shakespeare's Christmas Gift to Queen Bess or The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 20210)."}}},
{"id":"n-7a9d1b5a","guard":[["has","carol"],["has","larger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Lost Word: A Christmas Legend of Long Ago or A Christmas Carol":"A Christmas Carol has the larger gutenberg id (19337 against 4384)."}}},
{"id":"n-7da7c8e2","guard":[["hasAny",["carol","ghost","prose"]],["has","larger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. or A Christmas Carol in Prose; Being a Ghost Story of Christmas":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 46)."}}},
{"id":"n-846f30a7","guard":[["hasAny",["books","ma","mr","titmarsh"]],["has","which"],["has","old"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Old Peabody Pew: A Christmas Romance of a Country Church or The Christmas Books of Mr. M.A. Titmarsh":"The Christmas Books of Mr. M.A. Titmarsh has the larger gutenberg id (2731 against 1902)."}}},
{"id":"n-879cc173","guard":[["hasAny",["abbots","maurice","temptation","trehernes"]],["has","thin"],["has","larger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking or The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story":"The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking has the larger gutenberg id (17937 against 8694)."}}},
{"id":"n-91c041d3","guard":[["hasAny",["colonel","cooperative","crocketts"]],["has","old"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between The Old Peabody Pew: A Christmas Romance of a Country Church and Colonel Crockett's Co-operative Christmas, which has the greater gutenberg id":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 1902)."}}},
{"id":"n-91e5e29a","guard":[["hasAny",["card","romance"]],["has","between"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House and The Romance of a Christmas Card, which has the greater gutenberg id":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 17456)."}}},
{"id":"n-a396b2cc","guard":[["hasAny",["prodigal","tale","village"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, A Christmas Story Man in His Element: or, A New Way to Keep House or The Prodigal Village: A Christmas Tale":"The Prodigal Village: A Christmas Tale has the larger gutenberg id (44796 against 18770)."}}},
{"id":"n-a44a607e","guard":[["hasAny",["kringle","kris","mr","tale"]],["has","between"],["has","thin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking and Mr. Kris Kringle: A Christmas Tale, which has the greater gutenberg id":"Mr. Kris Kringle: A Christmas Tale has the larger gutenberg id (20180 against 17937)."}}},
{"id":"n-ad5ec9fe","guard":[["has","carol"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: A Christmas Carol or Evenings at Donaldson Manor; Or, The Christmas Guest":"Evenings at Donaldson Manor; Or, The Christmas Guest has the larger gutenberg id (20018 against 19337)."}}},
{"id":"n-b27e574c","guard":[["hasAny",["eve","unawares"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Angel Unawares: A Story of Christmas Eve or Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season.":"Angel Unawares: A Story of Christmas Eve has the larger gutenberg id (42919 against 20251)."}}},
{"id":"n-b88c0b98","guard":[["has","carol"],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Colonel Crockett's Co-operative Christmas or A Christmas Carol":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 19337)."}}},
{"id":"n-bd32d85b","guard":[["hasAny",["doctors","eve"]],["has","between"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between The Doctor's Christmas Eve and The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House, which has the greater gutenberg id":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 38983)."}}},
{"id":"n-bfdb3ea8","guard":[["hasAny",["chicken","claus","santa","stocking","thin","yard"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. or The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking":"Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season. has the larger gutenberg id (20251 against 17937)."}}},
{"id":"n-ccec3446","guard":[["has","doctors"],["has","abbots"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story and The Doctor's Christmas Eve, which has the greater gutenberg id":"The Doctor's Christmas Eve has the larger gutenberg id (42923 against 8694)."}}},
{"id":"n-ce4649d6","guard":[["has","child"],["not",["has","author"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which has the larger gutenberg id, The Christmas Child or The Old Peabody Pew: A Christmas Romance of a Country Church":"The Christmas Child has the larger gutenberg id (20453 against 1902)."}}},
{"id":"n-e4cbb141","guard":[["hasAny",["elsie","grandma"]],["has","whose"],["has","larger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: Christmas with Grandma Elsie or A Christmas Mystery: The Story of Three Wise Men":"Christmas with Grandma Elsie has the larger gutenberg id (14534 against 10707)."}}},
{"id":"n-e88554a6","guard":[["hasAny",["day","evening"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: On Christmas Day In The Evening or The Old Peabody Pew: A Christmas Romance of a Country Church":"On Christmas Day In The Evening has the larger gutenberg id (19384 against 1902)."}}},
{"id":"n-f5c0e80f","guard":[["hasAny",["colonel","cooperative","crocketts"]],["has","books"],["has","between"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"between Colonel Crockett's Co-operative Christmas and The Christmas Books of Mr. M.A. Titmarsh, which has the greater gutenberg id":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 2731)."}}},
{"id":"n-fd229743","guard":[["hasAny",["bess","gift","queen","shakespeares"]],["has","whose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story or Shakespeare's Christmas Gift to Queen Bess":"Shakespeare's Christmas Gift to Queen Bess has the larger gutenberg id (20210 against 8694)."}}},
{"id":"n-fd5170d7","guard":[["hasAny",["colonel","cooperative","crocketts"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: A Christmas Story Man in His Element: or, A New Way to Keep House or Colonel Crockett's Co-operative Christmas":"Colonel Crockett's Co-operative Christmas has the larger gutenberg id (22696 against 18770)."}}},
{"id":"n-fe5fad2a","guard":[["hasAny",["eden","outside"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"whose gutenberg id is larger: The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House or Christmas Outside of Eden":"The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House has the larger gutenberg id (38983 against 15552)."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"between A Christmas Mystery: The Story of Three Wise Men and Angel Unawares: A Story of Christmas Eve, which has the greater gutenberg id","expect":{"contains":["Angel Unawares: A Story of Christmas Eve"],"notContains":["A Christmas Mystery: The Story of Three Wise Men"],"notRefusal":true}},{"q":"whose gutenberg id is larger: The Christmas Books of Mr. M.A. Titmarsh or The Lost Word: A Christmas Legend of Long Ago","expect":{"contains":["The Lost Word: A Christmas Legend of Long Ago"],"notContains":["The Christmas Books of Mr. M.A. Titmarsh"],"notRefusal":true}},{"q":"whose gutenberg id is larger: The Lost Word: A Christmas Legend of Long Ago or When the Yule Log Burns: A Christmas Story","expect":{"contains":["When the Yule Log Burns: A Christmas Story"],"notContains":["The Lost Word: A Christmas Legend of Long Ago"],"notRefusal":true}},{"q":"which has the larger gutenberg id, Evenings at Donaldson Manor; Or, The Christmas Guest or A Christmas Mystery: The Story of Three Wise Men","expect":{"contains":["Evenings at Donaldson Manor; Or, The Christmas Guest"],"notContains":["A Christmas Mystery: The Story of Three Wise Men"],"notRefusal":true}},{"q":"which has the larger gutenberg id, The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story or The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House","expect":{"contains":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House"],"notContains":["The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story"],"notRefusal":true}},{"q":"which has the larger gutenberg id, On Christmas Day In The Evening or A Christmas Story Man in His Element: or, A New Way to Keep House","expect":{"contains":["On Christmas Day In The Evening"],"notContains":["A Christmas Story Man in His Element: or, A New Way to Keep House"],"notRefusal":true}},{"q":"between The First Christmas Tree: A Story of the Forest and Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season., which has the greater gutenberg id","expect":{"contains":["Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season."],"notContains":["The First Christmas Tree: A Story of the Forest"],"notRefusal":true}},{"q":"between The Burglar and the Blizzard: A Christmas Story and On Christmas Day In The Evening, which has the greater gutenberg id","expect":{"contains":["On Christmas Day In The Evening"],"notContains":["The Burglar and the Blizzard: A Christmas Story"],"notRefusal":true}},{"q":"between When the Yule Log Burns: A Christmas Story and Evenings at Donaldson Manor; Or, The Christmas Guest, which has the greater gutenberg id","expect":{"contains":["Evenings at Donaldson Manor; Or, The Christmas Guest"],"notContains":["When the Yule Log Burns: A Christmas Story"],"notRefusal":true}},{"q":"whose gutenberg id is larger: A Christmas Mystery: The Story of Three Wise Men or The Christmas Angel","expect":{"contains":["The Christmas Angel"],"notContains":["A Christmas Mystery: The Story of Three Wise Men"],"notRefusal":true}},{"q":"between Shakespeare's Christmas Gift to Queen Bess and Christmas Outside of Eden, which has the greater gutenberg id","expect":{"contains":["Shakespeare's Christmas Gift to Queen Bess"],"notContains":["Christmas Outside of Eden"],"notRefusal":true}},{"q":"which has the larger gutenberg id, The Doctor's Christmas Eve or Christmas Outside of Eden","expect":{"contains":["The Doctor's Christmas Eve"],"notContains":["Christmas Outside of Eden"],"notRefusal":true}},{"q":"between The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House and The Romance of a Christmas Card, which has the greater gutenberg id","expect":{"contains":["The Camp Fire Girls Solve a Mystery; Or, The Christmas Adventure at Carver House"],"notContains":["The Romance of a Christmas Card"],"notRefusal":true}},{"q":"between Rosemary: A Christmas story and The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking, which has the greater gutenberg id","expect":{"contains":["The Thin Santa Claus: The Chicken Yard That Was a Christmas Stocking"],"notContains":["Rosemary: A Christmas story"],"notRefusal":true}},{"q":"which has the larger gutenberg id, The Old Peabody Pew: A Christmas Romance of a Country Church or The Christmas Books of Mr. M.A. Titmarsh","expect":{"contains":["The Christmas Books of Mr. M.A. Titmarsh"],"notContains":["The Old Peabody Pew: A Christmas Romance of a Country Church"],"notRefusal":true}},{"q":"between Mr. Kris Kringle: A Christmas Tale and The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story, which has the greater gutenberg id","expect":{"contains":["Mr. Kris Kringle: A Christmas Tale"],"notContains":["The Abbot's Ghost, or Maurice Treherne's Temptation: A Christmas Story"],"notRefusal":true}},{"q":"between The Christmas Child and A Christmas Story Man in His Element: or, A New Way to Keep House, which has the greater gutenberg id","expect":{"contains":["The Christmas Child"],"notContains":["A Christmas Story Man in His Element: or, A New Way to Keep House"],"notRefusal":true}},{"q":"which has the larger gutenberg id, Christmas with Grandma Elsie or The Christmas Angel","expect":{"contains":["The Christmas Angel"],"notContains":["Christmas with Grandma Elsie"],"notRefusal":true}},{"q":"which has the larger gutenberg id, Shakespeare's Christmas Gift to Queen Bess or The Doctor's Christmas Eve","expect":{"contains":["The Doctor's Christmas Eve"],"notContains":["Shakespeare's Christmas Gift to Queen Bess"],"notRefusal":true}},{"q":"whose gutenberg id is larger: Angel Unawares: A Story of Christmas Eve or Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season.","expect":{"contains":["Angel Unawares: A Story of Christmas Eve"],"notContains":["Christmas Comes but Once a Year Showing What Mr. Brown Did, Thought, and Intended to Do, During That Festive Season."],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
