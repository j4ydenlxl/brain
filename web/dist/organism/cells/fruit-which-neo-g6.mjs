// fruit-which-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"fruit-which-neo-g6","class":"fruit-which","generation":6,"lane":"neo","grownFrom":["among pomegranate, sweet potato or salt, which one is a fruit","among damson, leek or kale, which one is a fruit","among eggplant, mushroom or sweet potato, which one is a fruit","pick a fruit from nectarine, onion or butter","which of these is a fruit: brussels sprout, currant or cauliflower","pick a fruit from apple, salt or turnip","pick a fruit from chicken, potato or blueberry","pick a fruit from tangerine, lettuce or carrot","among radish, egg or bilberry, which one is a fruit","among strawberry, cabbage or artichoke, which one is a fruit","among salmon, grape or chicken, which one is a fruit","which of these is a fruit: cabbage, butter or cucumber","which of these is a fruit: spinach, raisin or onion","pick a fruit from sweet potato, durian or salmon","among mulberry, bread or spinach, which one is a fruit","which of these is a fruit: carrot, parsnip or cherry","among canary melon, leek or broccoli, which one is a fruit","which of these is a fruit: huckleberry, broccoli or sugar","which of these is a fruit: garlic, mushroom or avocado","which of these is a fruit: loquat, bread or ginger"],"version":1});

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
{"id":"n-5950a113","guard":[["has","fruit"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among pomegranate, sweet potato or salt, which one is a fruit":"pomegranate is a fruit.","among damson, leek or kale, which one is a fruit":"damson is a fruit.","among eggplant, mushroom or sweet potato, which one is a fruit":"eggplant is a fruit.","pick a fruit from nectarine, onion or butter":"nectarine is a fruit.","which of these is a fruit: brussels sprout, currant or cauliflower":"currant is a fruit.","pick a fruit from apple, salt or turnip":"apple is a fruit.","pick a fruit from chicken, potato or blueberry":"blueberry is a fruit.","pick a fruit from tangerine, lettuce or carrot":"tangerine is a fruit.","among radish, egg or bilberry, which one is a fruit":"bilberry is a fruit.","among strawberry, cabbage or artichoke, which one is a fruit":"strawberry is a fruit.","among salmon, grape or chicken, which one is a fruit":"grape is a fruit.","which of these is a fruit: cabbage, butter or cucumber":"cucumber is a fruit.","which of these is a fruit: spinach, raisin or onion":"raisin is a fruit.","pick a fruit from sweet potato, durian or salmon":"durian is a fruit.","among mulberry, bread or spinach, which one is a fruit":"mulberry is a fruit.","which of these is a fruit: carrot, parsnip or cherry":"cherry is a fruit.","among canary melon, leek or broccoli, which one is a fruit":"canary melon is a fruit.","which of these is a fruit: huckleberry, broccoli or sugar":"huckleberry is a fruit.","which of these is a fruit: garlic, mushroom or avocado":"avocado is a fruit.","which of these is a fruit: loquat, bread or ginger":"loquat is a fruit.","which of these is a fruit: mushroom, cantaloupe or butter":"cantaloupe is a fruit.","pick a fruit from lettuce, potato or breadfruit":"breadfruit is a fruit.","which of these is a fruit: jambul, onion or spinach":"jambul is a fruit.","among cabbage, clementine or cauliflower, which one is a fruit":"clementine is a fruit.","among butter, mandarine or sugar, which one is a fruit":"mandarine is a fruit.","pick a fruit from parsnip, artichoke or pineapple":"pineapple is a fruit.","among cheese, bread or peach, which one is a fruit":"peach is a fruit.","pick a fruit from salmon, grapefruit or kale":"grapefruit is a fruit.","among passionfruit, cheese or lettuce, which one is a fruit":"passionfruit is a fruit.","which of these is a fruit: cauliflower, elderberry or milk":"elderberry is a fruit.","pick a fruit from milk, onion or feijoa":"feijoa is a fruit.","among onion, gooseberry or egg, which one is a fruit":"gooseberry is a fruit.","which of these is a fruit: mushroom, olive or artichoke":"olive is a fruit.","which of these is a fruit: goji berry, leek or turnip":"goji berry is a fruit.","pick a fruit from cauliflower, milk or dragonfruit":"dragonfruit is a fruit.","among spinach, cloudberry or bread, which one is a fruit":"cloudberry is a fruit.","pick a fruit from purple mangosteen, milk or butter":"purple mangosteen is a fruit.","pick a fruit from mushroom, yogurt or pomelo":"pomelo is a fruit.","among cranberry, artichoke or bread, which one is a fruit":"cranberry is a fruit.","among chicken, salt or kumquat, which one is a fruit":"kumquat is a fruit.","pick a fruit from salt, butter or lychee":"lychee is a fruit.","which of these is a fruit: tofu, guava or parsnip":"guava is a fruit.","among beet, jujube or salmon, which one is a fruit":"jujube is a fruit.","pick a fruit from blackcurrant, brussels sprout or salt":"blackcurrant is a fruit.","which of these is a fruit: honey, redcurrant or leek":"redcurrant is a fruit.","which of these is a fruit: bread, turnip or blackberry":"blackberry is a fruit.","which of these is a fruit: chili pepper, beet or cabbage":"chili pepper is a fruit.","which of these is a fruit: spinach, mango or salt":"mango is a fruit.","which of these is a fruit: salt, persimmon or honey":"persimmon is a fruit.","pick a fruit from star fruit, sweet potato or spinach":"star fruit is a fruit.","among rock melon, salt or cauliflower, which one is a fruit":"rock melon is a fruit.","pick a fruit from salal berry, broccoli or cabbage":"salal berry is a fruit.","which of these is a fruit: plum, turnip or brussels sprout":"plum is a fruit.","pick a fruit from cauliflower, onion or kiwi fruit":"kiwi fruit is a fruit.","which of these is a fruit: kale, apricot or ginger":"apricot is a fruit.","which of these is a fruit: raspberry, ginger or cabbage":"raspberry is a fruit.","among tofu, cheese or nut, which one is a fruit":"nut is a fruit.","among salmon, blood orange or kale, which one is a fruit":"blood orange is a fruit.","pick a fruit from beet, banana or cabbage":"banana is a fruit.","pick a fruit from onion, bread or orange":"orange is a fruit.","pick a fruit from ugli fruit, salt or cheese":"ugli fruit is a fruit.","pick a fruit from salmon, sweet potato or rambutan":"rambutan is a fruit.","among cauliflower, watermelon or salt, which one is a fruit":"watermelon is a fruit.","which of these is a fruit: cherimoya, cabbage or honey":"cherimoya is a fruit."}}},
{"id":"n-b81ef360","guard":[["has","fruit"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"fruit"}]]],"mem":{"table":{"from nectarine, onion or butter":"nectarine is a fruit.","brussels sprout, currant or cauliflower":"currant is a fruit.","from apple, salt or turnip":"apple is a fruit.","from chicken, potato or blueberry":"blueberry is a fruit.","from tangerine, lettuce or carrot":"tangerine is a fruit.","cabbage, butter or cucumber":"cucumber is a fruit.","spinach, raisin or onion":"raisin is a fruit.","from sweet potato, durian or salmon":"durian is a fruit.","carrot, parsnip or cherry":"cherry is a fruit.","huckleberry, broccoli or sugar":"huckleberry is a fruit.","garlic, mushroom or avocado":"avocado is a fruit.","loquat, bread or ginger":"loquat is a fruit.","mushroom, cantaloupe or butter":"cantaloupe is a fruit.","from lettuce, potato or breadfruit":"breadfruit is a fruit.","jambul, onion or spinach":"jambul is a fruit.","from parsnip, artichoke or pineapple":"pineapple is a fruit.","from salmon, grapefruit or kale":"grapefruit is a fruit.","cauliflower, elderberry or milk":"elderberry is a fruit.","from milk, onion or feijoa":"feijoa is a fruit.","mushroom, olive or artichoke":"olive is a fruit.","goji berry, leek or turnip":"goji berry is a fruit.","from cauliflower, milk or dragonfruit":"dragonfruit is a fruit.","from purple mangosteen, milk or butter":"purple mangosteen is a fruit.","from mushroom, yogurt or pomelo":"pomelo is a fruit.","from salt, butter or lychee":"lychee is a fruit.","tofu, guava or parsnip":"guava is a fruit.","from blackcurrant, brussels sprout or salt":"blackcurrant is a fruit.","honey, redcurrant or leek":"redcurrant is a fruit.","bread, turnip or blackberry":"blackberry is a fruit.","chili pepper, beet or cabbage":"chili pepper is a fruit.","spinach, mango or salt":"mango is a fruit.","salt, persimmon or honey":"persimmon is a fruit.","from star fruit, sweet potato or spinach":"star fruit is a fruit.","from salal berry, broccoli or cabbage":"salal berry is a fruit.","plum, turnip or brussels sprout":"plum is a fruit.","from cauliflower, onion or kiwi fruit":"kiwi fruit is a fruit.","kale, apricot or ginger":"apricot is a fruit.","raspberry, ginger or cabbage":"raspberry is a fruit.","from beet, banana or cabbage":"banana is a fruit.","from onion, bread or orange":"orange is a fruit.","from ugli fruit, salt or cheese":"ugli fruit is a fruit.","from salmon, sweet potato or rambutan":"rambutan is a fruit.","cherimoya, cabbage or honey":"cherimoya is a fruit."}}},
{"id":"n-7c6150d0","guard":[["has","fruit"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"these is a fruit: brussels sprout, currant or cauliflower":"currant is a fruit.","these is a fruit: cabbage, butter or cucumber":"cucumber is a fruit.","these is a fruit: spinach, raisin or onion":"raisin is a fruit.","these is a fruit: carrot, parsnip or cherry":"cherry is a fruit.","these is a fruit: huckleberry, broccoli or sugar":"huckleberry is a fruit.","these is a fruit: garlic, mushroom or avocado":"avocado is a fruit.","these is a fruit: loquat, bread or ginger":"loquat is a fruit.","these is a fruit: mushroom, cantaloupe or butter":"cantaloupe is a fruit.","these is a fruit: jambul, onion or spinach":"jambul is a fruit.","these is a fruit: cauliflower, elderberry or milk":"elderberry is a fruit.","these is a fruit: mushroom, olive or artichoke":"olive is a fruit.","these is a fruit: goji berry, leek or turnip":"goji berry is a fruit.","these is a fruit: tofu, guava or parsnip":"guava is a fruit.","these is a fruit: honey, redcurrant or leek":"redcurrant is a fruit.","these is a fruit: bread, turnip or blackberry":"blackberry is a fruit.","these is a fruit: chili pepper, beet or cabbage":"chili pepper is a fruit.","these is a fruit: spinach, mango or salt":"mango is a fruit.","these is a fruit: salt, persimmon or honey":"persimmon is a fruit.","these is a fruit: plum, turnip or brussels sprout":"plum is a fruit.","these is a fruit: kale, apricot or ginger":"apricot is a fruit.","these is a fruit: raspberry, ginger or cabbage":"raspberry is a fruit.","these is a fruit: cherimoya, cabbage or honey":"cherimoya is a fruit."}}},
{"id":"n-242bcf47","guard":[["has","fruit"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"from"}]]],"mem":{"table":{"nectarine, onion or butter":"nectarine is a fruit.","apple, salt or turnip":"apple is a fruit.","chicken, potato or blueberry":"blueberry is a fruit.","tangerine, lettuce or carrot":"tangerine is a fruit.","sweet potato, durian or salmon":"durian is a fruit.","lettuce, potato or breadfruit":"breadfruit is a fruit.","parsnip, artichoke or pineapple":"pineapple is a fruit.","salmon, grapefruit or kale":"grapefruit is a fruit.","milk, onion or feijoa":"feijoa is a fruit.","cauliflower, milk or dragonfruit":"dragonfruit is a fruit.","purple mangosteen, milk or butter":"purple mangosteen is a fruit.","mushroom, yogurt or pomelo":"pomelo is a fruit.","salt, butter or lychee":"lychee is a fruit.","blackcurrant, brussels sprout or salt":"blackcurrant is a fruit.","star fruit, sweet potato or spinach":"star fruit is a fruit.","salal berry, broccoli or cabbage":"salal berry is a fruit.","cauliflower, onion or kiwi fruit":"kiwi fruit is a fruit.","beet, banana or cabbage":"banana is a fruit.","onion, bread or orange":"orange is a fruit.","ugli fruit, salt or cheese":"ugli fruit is a fruit.","salmon, sweet potato or rambutan":"rambutan is a fruit."}}},
{"id":"n-28f6e74a","guard":[["hasAny",["avocado","banana","bilberry","blackberry","blackcurrant","cherry","cucumber","divisor count","eggplant","grapefruit","how many factors","item number","kumquat","nth","number of divisors","nut","peach","plum","pomegranate","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-08f35ba0","guard":[["hasAny",["cherimoya","cranberry","damson","eggplant","huckleberry","item number","jambul","loquat","mulberry","nth","passionfruit","plum","pomegranate","position","raspberry","strawberry"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3637d3b7","guard":[["hasAny",["avocado","blackberry","blueberry","breadfruit","cherry","cucumber","dragonfruit","feijoa","from position","items from to","lychee","orange","pineapple","pomelo","rambutan","slice"]],["has","or"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":10}]],"mem":null},
{"id":"n-4cc4f3db","guard":[["hasAny",["cherimoya","cranberry","damson","digit count","eggplant","how many digits","huckleberry","item number","jambul","loquat","mulberry","nth","number of digits","passionfruit","plum","pomegranate","position","raspberry","strawberry"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-945a1c02","guard":[["hasAny",["cherimoya","cranberry","damson","eggplant","huckleberry","invert case","item number","jambul","loquat","mulberry","nth","passionfruit","plum","pomegranate","position","raspberry","strawberry","swap case","toggle case"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-b22da250","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cherimoya","cranberry","damson","eggplant","huckleberry","item number","jambul","loquat","mulberry","nth","passionfruit","plum","pomegranate","position","raspberry","strawberry","title case"]],["has","or"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-f360f34a","guard":[["hasAny",["cherimoya","cranberry","damson","eggplant","huckleberry","item number","jambul","loquat","mulberry","nth","passionfruit","plum","pomegranate","position","raspberry","strawberry"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a fruit."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cfef2b69","guard":[["hasAny",["avocado","bilberry","blackberry","blueberry","breadfruit","cherry","cucumber","dragonfruit","feijoa","from position","grapefruit","items from to","kumquat","longest","longest one","longest word","peach","rambutan","slice"]],["has","a"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-6927a9c2","guard":[["hasAny",["avocado","blackberry","blueberry","breadfruit","cherry","cucumber","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","split into words"]],["has","or"]],"pyramid":["render.list",["transform.words",["sense.lastWord"]]],"mem":null},
{"id":"n-7112fccb","guard":[["hasAny",["avocado","blackberry","blueberry","breadfruit","capitalise","capitalize","capitalize each word","cherry","cucumber","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","title case"]],["has","or"]],"pyramid":["render.str",["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-76a7c72e","guard":[["hasAny",["bread","broccoli","butter","cabbage","ginger","honey","leek","longest","longest one","longest word"]]],"pyramid":["render.str",["aggregate.longest",["sense.list"]]],"mem":null},
{"id":"n-a4dc514f","guard":[["hasAny",["avocado","blackberry","blueberry","breadfruit","cherry","cucumber","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a fruit."]},["sense.lastWord"]],"mem":null},
{"id":"n-a851a962","guard":[["hasAny",["avocado","blackberry","blueberry","breadfruit","cherry","cucumber","dragonfruit","feijoa","invert case","lychee","pineapple","pomelo","rambutan","swap case","toggle case"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-13346a73","guard":[["hasAny",["bread","broccoli","butter","cabbage","capitalise","capitalize","capitalize each word","ginger","honey","leek","longest","longest one","longest word","title case"]]],"pyramid":["render.str",["transform.title",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-24e275cc","guard":[["hasAny",["bread","broccoli","butter","cabbage","ginger","honey","invert case","leek","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-37c4d168","guard":[["hasAny",["avocado","blackberry","blueberry","breadfruit","capitalise","capitalize","capitalize each word","cherry","cucumber","dragonfruit","feijoa","invert case","lychee","pineapple","pomelo","rambutan","swap case","title case","toggle case"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-c6c9d2e7","guard":[["hasAny",["avocado","blackberry","blueberry","breadfruit","cherry","cucumber","delete","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","remove","strip out","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"orange"}]],"mem":null},
{"id":"n-0e52f738","guard":[["hasAny",["beet","broccoli","cantaloupe","first n","ginger","guava","honey","jambul","leek","longest","longest one","longest word","take","top"]]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-17cab331","guard":[["hasAny",["avocado","blackberry","blueberry","breadfruit","cherry","cucumber","delete","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","remove","shortest","shortest one","shortest word","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-20056c04","guard":[["hasAny",["clementine","cloudberry","cranberry","damson","eggplant","first n","gooseberry","jujube","longest","longest one","longest word","mandarine","mulberry","passionfruit","pomegranate","strawberry","take"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":3}]]],"mem":null},
{"id":"n-26360685","guard":[["hasAny",["a to z","alphabetical","alphabetize","bilberry","cantaloupe","cherimoya","cherry","damson","dragonfruit","eggplant","elderberry","grapefruit","guava","item number","jambul","mango","nth","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-4688d50b","guard":[["hasAny",["cloudberry","cranberry","damson","each word","egg","jujube","lettuce","longest","longest one","longest word","mandarine","mulberry","potato","split into words","strawberry","words"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-4d97c9ff","guard":[["hasAny",["cloudberry","cranberry","damson","egg","eggplant","jujube","longest","longest one","longest word","mandarine","mulberry","passionfruit","pomegranate","strawberry"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["sense.subject"]],"mem":null},
{"id":"n-86d166a5","guard":[["hasAny",["avocado","blackberry","blueberry","breadfruit","change to","cherry","cucumber","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],{"lit":"orange"},["sense.text"]]],"mem":null},
{"id":"n-d1d532d8","guard":[["hasAny",["avocado","blackberry","blueberry","breadfruit","cherry","cucumber","distinct","dragonfruit","feijoa","item number","lychee","nth","pineapple","pomelo","position","rambutan","remove duplicates","unique","without repeats"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.uniqueStrs",["sense.words"]],["sense.wordCount"]]],"mem":null},
{"id":"n-de5218ab","guard":[["hasAny",["cherimoya","cranberry","damson","eggplant","first n","huckleberry","jambul","longest","longest one","longest word","loquat","mulberry","passionfruit","pomegranate","raspberry","strawberry","take"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-e4fc97ca","guard":[["hasAny",["cloudberry","cranberry","damson","egg","eggplant","jujube","longest","longest one","longest word","mandarine","mulberry","passionfruit","pomegranate","strawberry"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["sense.lastWord"]],"mem":null},
{"id":"n-f9a0eff3","guard":[["hasAny",["cloudberry","cranberry","damson","each word","egg","eggplant","jujube","longest","longest one","longest word","mandarine","mulberry","passionfruit","pomegranate","split into words","strawberry","words"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.before",{"lit":"fruit"}]]]],"mem":null},
{"id":"n-1963d6fc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cloudberry","cranberry","damson","egg","eggplant","jujube","longest","longest one","longest word","mandarine","mulberry","passionfruit","pomegranate","strawberry","title case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-19c72619","guard":[["hasAny",["cloudberry","cranberry","damson","egg","eggplant","invert case","jujube","longest","longest one","longest word","mandarine","mulberry","passionfruit","pomegranate","strawberry","swap case","toggle case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-444723cf","guard":[["hasAny",["cloudberry","cranberry","damson","egg","eggplant","invert case","jujube","longest","longest one","longest word","mandarine","mulberry","passionfruit","pomegranate","strawberry","swap case","toggle case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-61c24845","guard":[["hasAny",["clementine","cloudberry","cranberry","damson","eggplant","from position","gooseberry","items from to","jujube","longest","longest one","longest word","mandarine","mulberry","passionfruit","pomegranate","slice","strawberry"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":2},{"lit":3}]]],"mem":null},
{"id":"n-997f6681","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cloudberry","cranberry","damson","egg","eggplant","jujube","longest","longest one","longest word","mandarine","mulberry","passionfruit","pomegranate","strawberry","title case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-c27425ab","guard":[["hasAny",["cloudberry","cranberry","damson","egg","eggplant","jujube","longest","longest one","longest word","mandarine","mulberry","passionfruit","pomegranate","reverse the words","reverse word order","strawberry","words backwards"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-42fbd4f8","guard":[["hasAny",["cloudberry","cranberry","damson","each word","egg","eggplant","jujube","longest","longest one","longest word","mandarine","mulberry","passionfruit","pomegranate","split into words","strawberry"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f09a74d0","guard":[["hasAny",["bread","broccoli","butter","cabbage","element","ginger","honey","item number","leek","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-f89418c1","guard":[["hasAny",["cloudberry","cranberry","damson","each word","egg","eggplant","jujube","longest","longest one","longest word","mandarine","mulberry","passionfruit","pomegranate","split into words","strawberry"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2e60a135","guard":[["hasAny",["avocado","banana","bilberry","blackberry","cherry","cucumber","currant","grapefruit","item number","kumquat","nth","nut","peach","position"]],["has","a"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3503f61b","guard":[["hasAny",["avocado","blackberry","blueberry","cherry","cucumber","delete","feijoa","lychee","orange","pineapple","pomelo","rambutan","remove","strip out","without"]],["has","a"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"fruit"}]],"mem":null},
{"id":"n-75c3e600","guard":[["hasAny",["apricot","backwards","blackberry","broccoli","butter","cabbage","honey","leek","longest","longest one","longest word","reverse","reverse order","reversed"]]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-093b8a6a","guard":[["hasAny",["bread","broccoli","butter","cabbage","ginger","honey","longest","longest one","longest word","normalise","normalize","simplify the text"]]],"pyramid":["render.str",["transform.norm",["aggregate.longest",["sense.list"]],{"lit":3}]],"mem":null},
{"id":"n-145dfce7","guard":[["hasAny",["apricot","avocado","cranberry","damson","eggplant","guava","how many vowels","item number","mulberry","nth","number of vowels","passionfruit","pomegranate","position","redcurrant","strawberry","vowel count"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-306939e3","guard":[["hasAny",["avocado","banana","bilberry","blackberry","capitalise","capitalize","capitalize each word","cherry","cucumber","currant","grapefruit","item number","kumquat","nth","nut","peach","position","title case"]],["has","a"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-8324c573","guard":[["hasAny",["avocado","banana","bilberry","blackberry","cherry","cucumber","currant","grapefruit","invert case","item number","kumquat","nth","nut","peach","position","swap case","toggle case"]],["has","a"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-90e043db","guard":[["hasAny",["avocado","banana","bilberry","blackberry","cherry","cucumber","currant","distinct","grapefruit","item number","kumquat","nth","nut","peach","position","remove duplicates","unique","without repeats"]],["has","a"]],"pyramid":["render.str",["transform.nthStr",["transform.uniqueStrs",["sense.content"]],{"lit":4}]],"mem":null},
{"id":"n-c5c88ba9","guard":[["hasAny",["avocado","blackberry","blueberry","breadfruit","cherry","cucumber","delete","dragonfruit","feijoa","no vowels","pineapple","pomelo","rambutan","remove","remove vowels","strip out","without","without vowels"]],["has","or"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-e2ad28e3","guard":[["hasAny",["avocado","banana","bilberry","blackberry","cherry","cucumber","currant","grapefruit","item number","kumquat","nth","nut","peach","position"]],["has","a"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a fruit."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-de9d74d9","guard":[["hasAny",["avocado","blackberry","change to","cherry","cranberry","cucumber","damson","eggplant","mulberry","passionfruit","pomegranate","replace","strawberry","substitute","swap"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-66963991","guard":[["hasAny",["bread","broccoli","butter","each word","ginger","honey","longest","longest one","longest word","split into words"]]],"pyramid":["render.lines",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-6e4fe1b4","guard":[["hasAny",["bread","broccoli","butter","ginger","honey","longest","longest one","longest word","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.str",["transform.reverseWords",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-9b8c27ff","guard":[["hasAny",["avocado","breadfruit","cherry","cucumber","delete","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","remove","strip out","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],{"lit":"berry"}]],"mem":null},
{"id":"n-b2d4c448","guard":[["hasAny",["apricot","artichoke","cantaloupe","cauliflower","element","guava","item number","nth","position","raisin","redcurrant","salt"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-e04a2b46","guard":[["hasAny",["bread","broccoli","butter","each word","ginger","honey","longest","longest one","longest word","split into words"]]],"pyramid":["render.list",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-e3e60c4d","guard":[["hasAny",["bread","broccoli","butter","each word","ginger","honey","longest","longest one","longest word","split into words"]]],"pyramid":["render.and",["transform.words",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-1f237254","guard":[["hasAny",["avocado","blackberry","blueberry","cherry","cucumber","delete","feijoa","lychee","pineapple","pomelo","rambutan","remove","strip out","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-22abd063","guard":[["hasAny",["broccoli","butter","cabbage","delete","ginger","honey","leek","longest","longest one","longest word","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["aggregate.longest",["sense.list"]],["sense.lastWord"]]],"mem":null},
{"id":"n-2d9cdaec","guard":[["hasAny",["avocado","breadfruit","change to","cherry","cucumber","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],{"lit":"berry"},["sense.subject"]]],"mem":null},
{"id":"n-3cf143af","guard":[["hasAny",["avocado","blackberry","blueberry","change to","cherry","cucumber","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],{"lit":"fruit"},["sense.text"]]],"mem":null},
{"id":"n-599b11cd","guard":[["hasAny",["avocado","breadfruit","change to","cherry","cucumber","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],{"lit":"berry"},["sense.lastWord"]]],"mem":null},
{"id":"n-602e665c","guard":[["hasAny",["avocado","breadfruit","change to","cherry","cucumber","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],{"lit":"berry"},["sense.text"]]],"mem":null},
{"id":"n-670b83e8","guard":[["hasAny",["a to z","alphabetical","alphabetize","apple","apricot","avocado","banana","blackberry","blackcurrant","blueberry","breadfruit","durian","feijoa","item number","nth","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":1}]],"mem":null},
{"id":"n-77d73814","guard":[["hasAny",["bread","broccoli","butter","each word","ginger","honey","longest","longest one","longest word","split into words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["aggregate.longest",["sense.list"]]]]],"mem":null},
{"id":"n-7a432563","guard":[["hasAny",["bread","broccoli","butter","each word","ginger","honey","longest","longest one","longest word","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["aggregate.longest",["sense.list"]]]]],"mem":null},
{"id":"n-88f2d32a","guard":[["hasAny",["blackberry","cantaloupe","cucumber","each word","ginger","honey","huckleberry","longest","longest one","longest word","split into words","words"]],["has","which"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-9625b515","guard":[["hasAny",["apricot","artichoke","cantaloupe","capitalise","capitalize","capitalize each word","cauliflower","element","guava","item number","nth","position","raisin","redcurrant","salt","title case"]],["has","which"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-b4d1258a","guard":[["hasAny",["a to z","alphabetical","alphabetize","apple","apricot","avocado","banana","blackberry","blackcurrant","blueberry","breadfruit","durian","feijoa","item number","nth","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":2}]],"mem":null},
{"id":"n-b5f722e6","guard":[["hasAny",["add the digits","blueberry","breadfruit","digit sum","dragonfruit","eggplant","feijoa","item number","lychee","nth","pineapple","pomegranate","pomelo","position","rambutan","sum of the digits"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-b702599a","guard":[["hasAny",["broccoli","butter","cabbage","ginger","honey","leek","longest","longest one","longest word","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["aggregate.longest",["sense.list"]],["sense.lastWord"]]],"mem":null},
{"id":"n-f96c635b","guard":[["hasAny",["apricot","artichoke","cantaloupe","cauliflower","element","guava","invert case","item number","nth","position","raisin","redcurrant","salt","swap case","toggle case"]],["has","which"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-3dbcb3f4","guard":[["hasAny",["avocado","blackberry","blueberry","change to","cherry","cucumber","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.wordAt",{"lit":3}],["sense.lastWord"]]],"mem":null},
{"id":"n-e42d4b33","guard":[["hasAny",["avocado","blackberry","blueberry","change to","cherry","cucumber","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.wordAt",{"lit":3}],["sense.text"]]],"mem":null},
{"id":"n-b40cf38e","guard":[["hasAny",["blackberry","cantaloupe","cucumber","ginger","honey","huckleberry","item number","longest","longest one","longest word","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-2eecb96a","guard":[["hasAny",["blackberry","cantaloupe","cucumber","first n","ginger","honey","huckleberry","longest","longest one","longest word","take"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-74ed5da5","guard":[["hasAny",["blackberry","cantaloupe","cucumber","first n","ginger","honey","huckleberry","longest","longest one","longest word","take"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-ea19b9da","guard":[["hasAny",["apricot","artichoke","cantaloupe","cauliflower","element","guava","item number","nth","position","raisin","redcurrant","salt"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-216646de","guard":[["hasAny",["apricot","artichoke","cantaloupe","elderberry","element","guava","how many","how many items","item number","nth","number of items","position","raisin","redcurrant","salt"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.countStrs",["sense.list"]]]],"mem":null},
{"id":"n-37b6a63e","guard":[["hasAny",["blackcurrant","blueberry","bread","each word","feijoa","grapefruit","lettuce","longest","longest one","longest word","nectarine","rambutan","split into words","words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"from"}]]]],"mem":null},
{"id":"n-6da95653","guard":[["hasAny",["artichoke","blueberry","bread","breadfruit","delete","dragonfruit","feijoa","lychee","mushroom","rambutan","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"from"}]]],"mem":null},
{"id":"n-ac2bb8e9","guard":[["hasAny",["a to z","alphabetical","alphabetize","bilberry","cantaloupe","cherimoya","cherry","damson","dragonfruit","eggplant","elderberry","guava","item number","nth","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":3}]],"mem":null},
{"id":"n-049c1b27","guard":[["hasAny",["apricot","blackberry","butter","elderberry","from position","items from to","longest","longest one","longest word","raisin","redcurrant","salt","slice"]],["has","which"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]]],"mem":null},
{"id":"n-14609b40","guard":[["hasAny",["blueberry","breadfruit","change to","dragonfruit","feijoa","lychee","orange","pineapple","pomelo","rambutan","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.text"],["sense.after",{"lit":"fruit"}]]],"mem":null},
{"id":"n-a95b1282","guard":[["hasAny",["cranberry","eggplant","elderberry","from position","grape","items from to","mango","olive","plum","raisin","shortest","shortest one","shortest word","slice","watermelon"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":2},{"lit":3}]]],"mem":null},
{"id":"n-f7fffb2b","guard":[["hasAny",["blueberry","breadfruit","change to","dragonfruit","feijoa","lychee","orange","pineapple","pomelo","rambutan","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.after",{"lit":"fruit"}],["sense.text"]]],"mem":null},
{"id":"n-89c886e6","guard":[["hasAny",["apricot","cantaloupe","elderberry","guava","item number","mango","nth","olive","persimmon","position","raisin","redcurrant"]],["has","these"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-149eaf52","guard":[["hasAny",["apricot","cantaloupe","elderberry","first n","guava","item number","mango","nth","olive","persimmon","position","raisin","redcurrant","take"]],["has","these"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-cb4c6c1a","guard":[["hasAny",["apricot","cantaloupe","elderberry","first n","guava","item number","mango","nth","olive","persimmon","position","raisin","redcurrant","take"]],["has","these"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-05f227a7","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","reverse the words","reverse word order","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-084850b5","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-4590b390","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","invert case","lychee","pineapple","pomelo","rambutan","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-45d67d5d","guard":[["hasAny",["blueberry","breadfruit","capitalise","capitalize","capitalize each word","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","title case"]],["has","pick"]],"pyramid":["render.str",["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-c82e8636","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-cf5ee2a7","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-0fb4acb0","guard":[["hasAny",["a to z","alphabetical","alphabetize","blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-18701f35","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":1}]],"mem":null},
{"id":"n-1cdf26fb","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","invert case","lychee","pineapple","pomelo","rambutan","split into words","swap case","toggle case"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-2a35180d","guard":[["hasAny",["blueberry","breadfruit","capitalise","capitalize","capitalize each word","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","split into words","title case"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-4f3939f4","guard":[["hasAny",["blueberry","breadfruit","capitalise","capitalize","capitalize each word","dragonfruit","feijoa","invert case","lychee","pineapple","pomelo","rambutan","swap case","title case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-543b478d","guard":[["hasAny",["a to z","alphabetical","alphabetize","blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-5f6bd463","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","invert case","lychee","pineapple","pomelo","rambutan","reverse the words","reverse word order","swap case","toggle case","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-65c86a84","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","invert case","lychee","pineapple","pomelo","rambutan","split into words","swap case","toggle case"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-71098004","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","invert case","lychee","pineapple","pomelo","rambutan","split into words","swap case","toggle case"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-7cb9d87f","guard":[["hasAny",["a to z","alphabetical","alphabetize","blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-7f2338df","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":2}]],"mem":null},
{"id":"n-876da54a","guard":[["hasAny",["blueberry","breadfruit","delete","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","remove","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"orange"}]],"mem":null},
{"id":"n-8f174039","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],{"lit":1}]],"mem":null},
{"id":"n-9d24d516","guard":[["hasAny",["backwards","blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","reverse order","reversed","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-9d8a7506","guard":[["hasAny",["backwards","blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","reverse order","reversed","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-9ec9b52f","guard":[["hasAny",["blueberry","breadfruit","capitalise","capitalize","capitalize each word","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","reverse the words","reverse word order","title case","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-cab7b56e","guard":[["hasAny",["blueberry","breadfruit","capitalise","capitalize","capitalize each word","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","split into words","title case"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-d219a897","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":3}]],"mem":null},
{"id":"n-f535ffab","guard":[["hasAny",["blueberry","breadfruit","capitalise","capitalize","capitalize each word","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","split into words","title case"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-fd86aa71","guard":[["hasAny",["backwards","blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","reverse order","reversed","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-ff3ec475","guard":[["hasAny",["beet","berry","broccoli","cherimoya","element","item number","jambul","loquat","nth","plum","position","raspberry"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":1}]],"mem":null},
{"id":"n-fff23608","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","shortest","shortest one","shortest word","split into words"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-018250f8","guard":[["hasAny",["blueberry","breadfruit","digit count","dragonfruit","feijoa","how many digits","lychee","number of digits","pineapple","pomelo","rambutan"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-01e79703","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","joined with","lychee","pineapple","pomelo","rambutan","separated by","split into words"]],["has","pick"]],"pyramid":["render.str",["transform.join",["transform.words",["sense.subject"]],["sense.subject"]]],"mem":null},
{"id":"n-0c554f3c","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-0dc52f35","guard":[["hasAny",["blueberry","breadfruit","digit count","dragonfruit","feijoa","how many digits","lychee","number of digits","pineapple","pomelo","rambutan"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-12976cdd","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","first n","lychee","pineapple","pomelo","rambutan","split into words","take"]],["has","pick"]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":4}]],"mem":null},
{"id":"n-1694d040","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","invert case","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.norm",["sense.subject"],{"lit":1}]]],"mem":null},
{"id":"n-24825afc","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-2e24c378","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","how many words","lychee","normalise","normalize","number of words","parsnip","pomelo","rambutan","simplify the text","word count"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-347524aa","guard":[["hasAny",["blueberry","breadfruit","digit count","dragonfruit","feijoa","how many digits","lychee","number of digits","pineapple","pomelo","rambutan"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-368b1931","guard":[["hasAny",["a to z","alphabetical","alphabetize","broccoli","cantaloupe","carrot","cherimoya","elderberry","element","item number","nth","persimmon","plum","position","raisin"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.list"]],{"lit":2}]],"mem":null},
{"id":"n-3770895e","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","how many words","lychee","number of words","pineapple","pomelo","rambutan","word count"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-37e8cb64","guard":[["hasAny",["blueberry","breadfruit","digit count","dragonfruit","feijoa","how many digits","lychee","number of digits","pineapple","pomelo","rambutan"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-38456269","guard":[["hasAny",["beet","berry","broccoli","cherimoya","element","invert case","item number","jambul","loquat","nth","plum","position","raspberry","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.list"],{"lit":1}]]],"mem":null},
{"id":"n-38f167dc","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","separate by","shortest","shortest one","shortest word","split","split by"]]],"pyramid":["render.lines",["transform.split",["sense.subject"],["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-39e53117","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","invert case","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-3e80e25a","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","invert case","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-40f675da","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","how many words","lychee","number of words","pineapple","pomelo","rambutan","word count"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-424700ae","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","how many words","lychee","number of words","pineapple","pomelo","rambutan","word count"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-4388c69e","guard":[["hasAny",["beet","berry","broccoli","capitalise","capitalize","capitalize each word","cherimoya","element","item number","jambul","loquat","nth","plum","position","raspberry","title case"]]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.list"],{"lit":1}]]],"mem":null},
{"id":"n-4ded1800","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","first n","lychee","pineapple","pomelo","rambutan","split into words","take"]],["has","pick"]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":4}]],"mem":null},
{"id":"n-663e5642","guard":[["hasAny",["blueberry","breadfruit","change to","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],{"lit":"orange"},["sense.text"]]],"mem":null},
{"id":"n-68bed6ee","guard":[["hasAny",["blueberry","breadfruit","capitalise","capitalize","capitalize each word","dragonfruit","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text","title case"]],["has","pick"]],"pyramid":["render.str",["transform.title",["transform.norm",["sense.subject"],{"lit":1}]]],"mem":null},
{"id":"n-6faf6f9c","guard":[["hasAny",["blueberry","breadfruit","delete","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","remove","shortest","shortest one","shortest word","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.subject"],["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-7147b7f8","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","joined with","lychee","pineapple","pomelo","rambutan","separated by","split into words"]],["has","pick"]],"pyramid":["render.str",["transform.join",["transform.words",["sense.subject"]],["sense.lastWord"]]],"mem":null},
{"id":"n-7958305b","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","reverse the words","reverse word order","simplify the text","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["transform.reverseWords",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-7b7ddc9f","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","first n","lychee","pineapple","pomelo","rambutan","split into words","take"]],["has","pick"]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":3}]],"mem":null},
{"id":"n-7ea81f98","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","separate by","shortest","shortest one","shortest word","split","split by"]]],"pyramid":["render.list",["transform.split",["sense.subject"],["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-7f069920","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","reverse the words","reverse word order","simplify the text","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverseWords",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-826a0ba8","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","joined with","lychee","pineapple","pomelo","rambutan","separated by","split into words"]],["has","pick"]],"pyramid":["render.str",["transform.join",["transform.words",["sense.subject"]],["sense.text"]]],"mem":null},
{"id":"n-878889dc","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","first n","lychee","pineapple","pomelo","rambutan","split into words","take"]],["has","pick"]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":4}]],"mem":null},
{"id":"n-8952b939","guard":[["hasAny",["blueberry","breadfruit","change to","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-8acdec4f","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-91526195","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","separate by","shortest","shortest one","shortest word","split","split by"]]],"pyramid":["render.and",["transform.split",["sense.subject"],["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-930126a9","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","first n","lychee","pineapple","pomelo","rambutan","split into words","take"]],["has","pick"]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-96417faf","guard":[["hasAny",["blueberry","breadfruit","copies","dragonfruit","feijoa","how many words","lychee","number of words","pineapple","pomelo","rambutan","say it times","word count"]],["has","pick"]],"pyramid":["render.str",["transform.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-966a4715","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","reverse the words","reverse word order","simplify the text","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["transform.reverseWords",["sense.subject"]],{"lit":1}]],"mem":null},
{"id":"n-9807f7b1","guard":[["hasAny",["blueberry","breadfruit","capitalise","capitalize","capitalize each word","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","shortest","shortest one","shortest word","split into words","title case"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["transform.title",["sense.subject"]]]]],"mem":null},
{"id":"n-9d09d58c","guard":[["hasAny",["blueberry","breadfruit","digit count","dragonfruit","feijoa","how many digits","lychee","number of digits","pineapple","pomelo","rambutan"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-a40984c6","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","first n","lychee","pineapple","pomelo","rambutan","split into words","take"]],["has","pick"]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-a88d1b09","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","how many words","lychee","number of words","pineapple","pomelo","rambutan","word count"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-af846711","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-b0216139","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-b4e4ae44","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.lastWord"],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-b9de7c9d","guard":[["hasAny",["blueberry","breadfruit","capitalise","capitalize","capitalize each word","dragonfruit","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text","title case"]],["has","pick"]],"pyramid":["render.str",["transform.title",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-bf977a40","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","first n","lychee","pineapple","pomelo","rambutan","split into words","take"]],["has","pick"]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":3}]],"mem":null},
{"id":"n-c56d3456","guard":[["hasAny",["blueberry","breadfruit","capitalise","capitalize","capitalize each word","dragonfruit","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text","title case"]],["has","pick"]],"pyramid":["render.str",["transform.title",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-c629ab71","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","how many words","lychee","number of words","pineapple","pomelo","rambutan","word count"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-d06967c4","guard":[["hasAny",["blueberry","breadfruit","copies","digit count","dragonfruit","feijoa","how many digits","lychee","number of digits","pineapple","pomelo","rambutan","say it times"]],["has","pick"]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-d70f4bd8","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","invert case","lychee","pineapple","pomelo","rambutan","shortest","shortest one","shortest word","split into words","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["transform.swapCase",["sense.subject"]]]]],"mem":null},
{"id":"n-d7483f87","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","first n","lychee","pineapple","pomelo","rambutan","split into words","take"]],["has","pick"]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-d8edbce3","guard":[["hasAny",["blueberry","breadfruit","digit count","dragonfruit","feijoa","how many digits","lychee","number of digits","pineapple","pomelo","rambutan"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-f0776c54","guard":[["hasAny",["blueberry","breadfruit","copies","dragonfruit","feijoa","how many words","lychee","number of words","pineapple","pomelo","rambutan","say it times","word count"]],["has","pick"]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-f2bd0249","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","how many words","lychee","number of words","pineapple","pomelo","rambutan","word count"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-f87dc9f1","guard":[["hasAny",["blueberry","breadfruit","copies","digit count","dragonfruit","feijoa","how many digits","lychee","number of digits","pineapple","pomelo","rambutan","say it times"]],["has","pick"]],"pyramid":["render.str",["transform.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-f9764be3","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","normalise","normalize","pineapple","pomelo","rambutan","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-fd1ec300","guard":[["hasAny",["blueberry","breadfruit","digits backwards","digits reversed","dragonfruit","feijoa","item number","lychee","nth","pineapple","pomelo","position","rambutan","reverse the digits"]],["has","pick"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-fdc9a5f5","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","first n","lychee","pineapple","pomelo","rambutan","split into words","take"]],["has","pick"]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":3}]],"mem":null},
{"id":"n-19cb66bd","guard":[["hasAny",["avocado","cherry","clementine","from position","grape","items from to","jujube","olive","shortest","shortest one","shortest word","slice","tofu"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]]],"mem":null},
{"id":"n-2cdd6bf6","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","item number","lychee","nth","pineapple","pomelo","position","rambutan"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-41fbb780","guard":[["hasAny",["blackcurrant","blueberry","breadfruit","feijoa","grapefruit","longest","longest one","longest word","nectarine","rambutan","tangerine"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-51f2c5d5","guard":[["hasAny",["blueberry","breadfruit","capitalise","capitalize","capitalize each word","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","title case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.lastWord"],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-79a11e01","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","invert case","lychee","pineapple","pomelo","rambutan","swap case","toggle case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.lastWord"],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ad9e66c4","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","item number","lychee","nth","pineapple","pomelo","position","rambutan"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.subject"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-15944dfe","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","item number","lychee","nth","pineapple","pomelo","position","rambutan","reverse the words","reverse word order","words backwards"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.reverseWords",["sense.subject"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2896997a","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","invert case","item number","lychee","nth","pineapple","pomelo","position","rambutan","swap case","toggle case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-526e9649","guard":[["hasAny",["blueberry","breadfruit","capitalise","capitalize","capitalize each word","dragonfruit","feijoa","item number","lychee","nth","pineapple","pomelo","position","rambutan","title case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-701d0ece","guard":[["hasAny",["blueberry","breadfruit","capitalise","capitalize","capitalize each word","dragonfruit","feijoa","item number","lychee","nth","pineapple","pomelo","position","rambutan","title case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.title",["sense.subject"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-71894f40","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-738d82c8","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","lychee","pineapple","pomelo","rambutan","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-a0cde5e8","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","invert case","item number","lychee","nth","pineapple","pomelo","position","rambutan","swap case","toggle case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.swapCase",["sense.subject"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a591e65c","guard":[["hasAny",["blackcurrant","blueberry","breadfruit","feijoa","grapefruit","item number","longest","longest one","longest word","nectarine","nth","position","rambutan","tangerine"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b67dcbb0","guard":[["hasAny",["blackcurrant","blueberry","breadfruit","capitalise","capitalize","capitalize each word","feijoa","grapefruit","longest","longest one","longest word","nectarine","rambutan","tangerine","title case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-c836e508","guard":[["hasAny",["blackcurrant","blueberry","breadfruit","feijoa","grapefruit","invert case","longest","longest one","longest word","nectarine","rambutan","swap case","tangerine","toggle case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-de324150","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","durian","feijoa","item number","lychee","nth","parsnip","pomelo","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-05e9a0e3","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","item number","lychee","nth","pineapple","pomelo","position","rambutan","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-41eaa984","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","each word","feijoa","item number","lychee","nth","pineapple","pomelo","position","rambutan","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-471e16bc","guard":[["hasAny",["beet","berry","broccoli","cherimoya","element","item number","jambul","loquat","nth","plum","position","raspberry"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-60725eab","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","durian","feijoa","item number","lychee","nth","parsnip","pomelo","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a458a32f","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","durian","feijoa","invert case","item number","lychee","nth","parsnip","pomelo","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-c36df54a","guard":[["hasAny",["blueberry","breadfruit","capitalise","capitalize","capitalize each word","dragonfruit","durian","feijoa","item number","lychee","nth","parsnip","pomelo","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d711778f","guard":[["hasAny",["blackcurrant","blueberry","breadfruit","each word","feijoa","grapefruit","longest","longest one","longest word","nectarine","rambutan","split into words","tangerine"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-e0a0f10a","guard":[["hasAny",["blackcurrant","blueberry","breadfruit","each word","feijoa","grapefruit","longest","longest one","longest word","nectarine","rambutan","split into words","tangerine"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-21b6897f","guard":[["hasAny",["beet","berry","broccoli","cherimoya","element","first n","item number","jambul","loquat","nth","plum","position","raspberry","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-3b86888f","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","durian","each word","feijoa","item number","lychee","nth","parsnip","pomelo","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-4af9ceb7","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","durian","each word","feijoa","item number","lychee","nth","parsnip","pomelo","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-4bf24623","guard":[["hasAny",["beet","berry","broccoli","cherimoya","element","first n","item number","jambul","loquat","nth","plum","position","raspberry","take","top"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-120bdf4e","guard":[["hasAny",["breadfruit","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","separate by","split","split by"]],["has","pick"]],"pyramid":["render.list",["transform.split",["sense.subject"],{"lit":"berry"}]],"mem":null},
{"id":"n-1ae87a89","guard":[["hasAny",["blueberry","delete","feijoa","lychee","orange","pineapple","pomelo","rambutan","remove","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"fruit"}]],"mem":null},
{"id":"n-1ceecdf0","guard":[["hasAny",["clementine","cloudberry","gooseberry","grape","invert case","jujube","mandarine","swap case","toggle case","watermelon"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-211abdde","guard":[["hasAny",["breadfruit","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","separate by","split","split by"]],["has","pick"]],"pyramid":["render.lines",["transform.split",["sense.subject"],{"lit":"berry"}]],"mem":null},
{"id":"n-27c2cb85","guard":[["hasAny",["breadfruit","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","separate by","split","split by"]],["has","pick"]],"pyramid":["render.and",["transform.split",["sense.subject"],{"lit":"berry"}]],"mem":null},
{"id":"n-32726d57","guard":[["hasAny",["clementine","cloudberry","gooseberry","grape","jujube","mandarine","watermelon"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a fruit."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-545b1e1a","guard":[["hasAny",["cranberry","damson","each word","eggplant","mulberry","passionfruit","pomegranate","split into words","strawberry"]],["has","among"]],"pyramid":["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-55f5c374","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cranberry","damson","eggplant","mulberry","passionfruit","pomegranate","strawberry","title case"]],["has","among"]],"pyramid":["render.str",["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-66b7d251","guard":[["hasAny",["clementine","cloudberry","each word","gooseberry","grape","jujube","mandarine","split into words","watermelon"]],["has","among"]],"pyramid":["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-6f35ddce","guard":[["hasAny",["breadfruit","delete","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","remove","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],{"lit":"berry"}]],"mem":null},
{"id":"n-ab9264c6","guard":[["hasAny",["cranberry","damson","eggplant","invert case","mulberry","passionfruit","pomegranate","strawberry","swap case","toggle case"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-ff96dea5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clementine","cloudberry","gooseberry","grape","jujube","mandarine","title case","watermelon"]],["has","among"]],"pyramid":["render.str",["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-04f78dd4","guard":[["hasAny",["cranberry","damson","eggplant","first n","longest","longest one","longest word","mulberry","passionfruit","pomegranate","strawberry","take"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":2}]]],"mem":null},
{"id":"n-12419d03","guard":[["hasAny",["cranberry","damson","eggplant","mulberry","passionfruit","pomegranate","strawberry"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["sense.lastWord"]],"mem":null},
{"id":"n-303394a5","guard":[["hasAny",["bilberry","blackberry","character count","how many characters","item number","jambul","kumquat","length","nth","number of characters","nut","peach","position","raspberry"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-47d7942d","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","from position","items from to","lychee","parsnip","pomelo","slice"]]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-5a03947e","guard":[["hasAny",["cranberry","damson","eggplant","how many vowels","item number","mulberry","nth","number of vowels","passionfruit","pomegranate","position","strawberry","vowel count"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-66f9ab77","guard":[["hasAny",["avocado","blackberry","blueberry","cherry","cucumber","lychee","pomelo","separate by","split","split by"]],["has","or"]],"pyramid":["render.list",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-7c3527f6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cranberry","damson","eggplant","invert case","mulberry","passionfruit","pomegranate","strawberry","swap case","title case","toggle case"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-800051d7","guard":[["hasAny",["clementine","cloudberry","gooseberry","grape","jujube","mandarine","watermelon"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-825b5bdd","guard":[["hasAny",["artichoke","damson","lettuce","mulberry","normalise","normalize","potato","simplify the text"]],["has","among"]],"pyramid":["render.str",["transform.norm",["sense.wordAt",{"lit":2}],{"lit":2}]],"mem":null},
{"id":"n-88b362a2","guard":[["hasAny",["cranberry","damson","digit count","eggplant","how many digits","item number","mulberry","nth","number of digits","passionfruit","pomegranate","position","strawberry"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-8d0042eb","guard":[["hasAny",["blackberry","blueberry","cherry","cucumber","how many vowels","lychee","normalise","normalize","number of vowels","pomelo","rambutan","simplify the text","vowel count"]],["has","or"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-8ee410cf","guard":[["hasAny",["cranberry","damson","eggplant","how many vowels","item number","mulberry","nth","number of vowels","passionfruit","pomegranate","position","strawberry","vowel count"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-970abb80","guard":[["hasAny",["a to z","alphabetical","alphabetize","artichoke","beet","cucumber","currant","element","item number","loquat","nth","position","raspberry","redcurrant"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.list"]],{"lit":3}]],"mem":null},
{"id":"n-9e6d854b","guard":[["hasAny",["clementine","cloudberry","gooseberry","grape","jujube","mandarine","normalise","normalize","simplify the text","watermelon"]],["has","among"]],"pyramid":["render.str",["transform.norm",["sense.wordAt",{"lit":3}],{"lit":2}]],"mem":null},
{"id":"n-aa0df0db","guard":[["hasAny",["clementine","cloudberry","consonant count","gooseberry","grape","how many consonants","item number","jujube","mandarine","nth","number of consonants","position","watermelon"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-c0f20c53","guard":[["hasAny",["breadfruit","dragonfruit","feijoa","longest","longest one","longest word","lychee","pineapple","pomelo","rambutan","separate by","split","split by"]],["has","pick"]],"pyramid":["render.str",["aggregate.longest",["transform.split",["sense.subject"],{"lit":"berry"}]]],"mem":null},
{"id":"n-c226d1de","guard":[["hasAny",["clementine","cloudberry","gooseberry","grape","jujube","mandarine","watermelon"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["sense.subject"]],"mem":null},
{"id":"n-c23482d2","guard":[["hasAny",["blueberry","breadfruit","delete","dragonfruit","feijoa","no vowels","pineapple","pomelo","rambutan","remove","remove vowels","strip out","without","without vowels"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-c725e730","guard":[["hasAny",["breadfruit","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","separate by","shortest","shortest one","shortest word","split","split by"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.split",["sense.subject"],{"lit":"berry"}]]],"mem":null},
{"id":"n-c8a067c9","guard":[["hasAny",["avocado","blackberry","blueberry","cherry","cucumber","delete","lychee","pomelo","remove","strip out","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-c8c631a1","guard":[["hasAny",["breadfruit","change to","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],{"lit":"berry"},["sense.text"]]],"mem":null},
{"id":"n-d1fefc0e","guard":[["hasAny",["breadfruit","change to","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],{"lit":"berry"},["sense.subject"]]],"mem":null},
{"id":"n-d4257ef0","guard":[["hasAny",["clementine","cloudberry","delete","gooseberry","grape","jujube","mandarine","remove","strip out","watermelon","without"]],["has","among"]],"pyramid":["render.str",["transform.remove",["sense.wordAt",{"lit":3}],["sense.lastWord"]]],"mem":null},
{"id":"n-d46a1eef","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clementine","cloudberry","gooseberry","grape","invert case","jujube","mandarine","swap case","title case","toggle case","watermelon"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-dfc446ff","guard":[["hasAny",["avocado","blackberry","blueberry","cherry","cucumber","lychee","pomelo","separate by","split","split by"]],["has","or"]],"pyramid":["render.lines",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-e033bbad","guard":[["hasAny",["breadfruit","change to","dragonfruit","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],{"lit":"berry"},["sense.lastWord"]]],"mem":null},
{"id":"n-e3186ae7","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","from position","items from to","lychee","parsnip","pomelo","slice"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-e7e93a4b","guard":[["hasAny",["blueberry","breadfruit","dragonfruit","feijoa","from position","items from to","lychee","parsnip","pomelo","slice"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-ec31c97b","guard":[["hasAny",["clementine","cloudberry","consonant count","gooseberry","grape","how many consonants","item number","jujube","mandarine","nth","number of consonants","position","watermelon"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.consonants",["sense.subject"]]]],"mem":null},
{"id":"n-eddeb3b7","guard":[["hasAny",["avocado","blackberry","blueberry","cherry","cucumber","lychee","pomelo","separate by","split","split by"]],["has","or"]],"pyramid":["render.and",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-f79a5018","guard":[["hasAny",["a to z","alphabetical","alphabetize","apricot","avocado","berry","blackberry","element","guava","item number","jambul","mango","nth","position"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.list"]],{"lit":1}]],"mem":null},
{"id":"n-0100d7c0","guard":[["hasAny",["change to","clementine","cloudberry","gooseberry","grape","jujube","mandarine","replace","substitute","swap","watermelon"]],["has","among"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-087fbe70","guard":[["hasAny",["avocado","blackberry","blueberry","cherry","cucumber","lychee","pomelo","separate by","shortest","shortest one","shortest word","split","split by"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-27830fab","guard":[["hasAny",["avocado","banana","blackberry","cherry","cucumber","currant","from position","items from to","nut","shortest","shortest one","shortest word","slice"]],["has","a"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-3140cb35","guard":[["hasAny",["cranberry","damson","delete","lettuce","mulberry","potato","remove","strawberry","strip out","without"]],["has","among"]],"pyramid":["render.str",["transform.remove",["sense.wordAt",{"lit":2}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-32d0a0b4","guard":[["hasAny",["clementine","cloudberry","from position","gooseberry","grape","items from to","jujube","longest","longest one","longest word","mandarine","slice","watermelon"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":3},{"lit":4}]]],"mem":null},
{"id":"n-349e21c2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clementine","cloudberry","gooseberry","grape","jujube","mandarine","title case","watermelon"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.lastWord"]],"mem":null},
{"id":"n-36c38ee0","guard":[["hasAny",["clementine","cloudberry","delete","gooseberry","grape","jujube","mandarine","remove","strip out","watermelon","without"]],["has","among"]],"pyramid":["render.str",["transform.remove",["sense.wordAt",{"lit":3}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-42e91ef8","guard":[["hasAny",["cranberry","damson","eggplant","item number","mulberry","nth","passionfruit","pomegranate","position","strawberry"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.subject"]],"mem":null},
{"id":"n-43397720","guard":[["hasAny",["clementine","cloudberry","gooseberry","grape","item number","jujube","mandarine","nth","position","watermelon"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-49f43faf","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cranberry","damson","eggplant","mulberry","passionfruit","pomegranate","strawberry","title case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.title",["sense.wordAt",{"lit":2}]],["sense.lastWord"]],"mem":null},
{"id":"n-58301ff8","guard":[["hasAny",["clementine","cloudberry","gooseberry","grape","invert case","jujube","mandarine","swap case","toggle case","watermelon"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-6ef03326","guard":[["hasAny",["avocado","blackberry","blueberry","change to","cherry","cucumber","lychee","pomelo","replace","substitute","swap"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.wordAt",{"lit":2}],["sense.text"]]],"mem":null},
{"id":"n-7a5c9e5d","guard":[["hasAny",["cranberry","damson","eggplant","item number","mulberry","nth","passionfruit","pomegranate","position","strawberry"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.lastWord"]],"mem":null},
{"id":"n-817626d0","guard":[["hasAny",["clementine","cloudberry","gooseberry","grape","jujube","mandarine","reverse the words","reverse word order","watermelon","words backwards"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-887abd15","guard":[["hasAny",["clementine","cloudberry","gooseberry","grape","invert case","jujube","mandarine","swap case","toggle case","watermelon"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8c2e1f40","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clementine","cloudberry","gooseberry","grape","jujube","mandarine","title case","watermelon"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9f0c6009","guard":[["hasAny",["change to","cranberry","damson","eggplant","mulberry","passionfruit","pomegranate","replace","strawberry","substitute","swap"]],["has","among"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a31edef1","guard":[["hasAny",["change to","clementine","cloudberry","gooseberry","grape","jujube","mandarine","replace","substitute","swap","watermelon"]],["has","among"]],"pyramid":["render.str",["transform.replace",["sense.wordAt",{"lit":3}],["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-a9231b2b","guard":[["hasAny",["avocado","banana","blackberry","cherry","cucumber","currant","from position","items from to","nut","shortest","shortest one","shortest word","slice"]],["has","a"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]]],"mem":null},
{"id":"n-af55e3e9","guard":[["hasAny",["avocado","blackberry","blueberry","cherry","cucumber","longest","longest one","longest word","lychee","pomelo","separate by","split","split by"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-dedf5a31","guard":[["hasAny",["avocado","blackberry","blueberry","change to","cherry","cucumber","lychee","pomelo","replace","substitute","swap"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.wordAt",{"lit":2}],["sense.lastWord"]]],"mem":null},
{"id":"n-ede0d3c5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clementine","cloudberry","gooseberry","grape","jujube","mandarine","title case","watermelon"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-f05fc34d","guard":[["hasAny",["clementine","cloudberry","gooseberry","grape","invert case","jujube","mandarine","swap case","toggle case","watermelon"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.lastWord"]],"mem":null},
{"id":"n-f1e357fd","guard":[["hasAny",["cranberry","damson","eggplant","invert case","mulberry","passionfruit","pomegranate","strawberry","swap case","toggle case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["sense.lastWord"]],"mem":null},
{"id":"n-fb1160ba","guard":[["hasAny",["blackberry","cantaloupe","cherimoya","cucumber","huckleberry","longest","longest one","longest word","loquat","raspberry","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-05ac3aac","guard":[["hasAny",["cranberry","damson","eggplant","invert case","item number","mulberry","nth","passionfruit","pomegranate","position","strawberry","swap case","toggle case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1373f897","guard":[["hasAny",["cranberry","damson","eggplant","invert case","item number","mulberry","nth","passionfruit","pomegranate","position","strawberry","swap case","toggle case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-293b25dd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cranberry","damson","eggplant","item number","mulberry","nth","passionfruit","pomegranate","position","strawberry","title case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-53b5c425","guard":[["hasAny",["clementine","cloudberry","each word","gooseberry","grape","jujube","mandarine","split into words","watermelon"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5d248208","guard":[["hasAny",["clementine","cloudberry","each word","gooseberry","grape","jujube","mandarine","split into words","watermelon"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.lastWord"]],"mem":null},
{"id":"n-68d33cc8","guard":[["hasAny",["clementine","cloudberry","each word","gooseberry","grape","jujube","mandarine","split into words","watermelon"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-694ca030","guard":[["hasAny",["cranberry","damson","each word","eggplant","mulberry","passionfruit","pomegranate","split into words","strawberry"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["sense.lastWord"]],"mem":null},
{"id":"n-9525931c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cranberry","damson","eggplant","item number","mulberry","nth","passionfruit","pomegranate","position","strawberry","title case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-ca835a9a","guard":[["hasAny",["cranberry","damson","each word","eggplant","mulberry","passionfruit","pomegranate","split into words","strawberry"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["sense.lastWord"]],"mem":null},
{"id":"n-d5c3a956","guard":[["hasAny",["cranberry","damson","eggplant","item number","mulberry","nth","passionfruit","pomegranate","position","reverse the words","reverse word order","strawberry","words backwards"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-d67cd83a","guard":[["hasAny",["clementine","cloudberry","each word","gooseberry","grape","jujube","mandarine","split into words","watermelon"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.lastWord"]],"mem":null},
{"id":"n-964576f2","guard":[["hasAny",["cranberry","damson","each word","eggplant","item number","mulberry","nth","passionfruit","pomegranate","position","split into words","strawberry"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e257fc39","guard":[["hasAny",["cranberry","damson","each word","eggplant","item number","mulberry","nth","passionfruit","pomegranate","position","split into words","strawberry"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0dde5f07","guard":[["hasAny",["broccoli","cherimoya","each word","element","item number","jambul","loquat","nth","plum","position","raspberry","split into words"]]],"pyramid":["render.list",["transform.words",["transform.nthStr",["sense.list"],{"lit":1}]]],"mem":null},
{"id":"n-18a8d560","guard":[["hasAny",["artichoke","brussels","cauliflower","first n","mango","raisin","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-1a5d2465","guard":[["hasAny",["clementine","cloudberry","delete","gooseberry","grape","jujube","mandarine","remove","strip out","without"]],["has","among"]],"pyramid":["render.str",["transform.remove",["sense.wordAt",{"lit":3}],{"lit":"melon"}]],"mem":null},
{"id":"n-207cdae3","guard":[["hasAny",["blueberry","delete","feijoa","lychee","pineapple","pomelo","rambutan","remove","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-2c8493b2","guard":[["hasAny",["avocado","delete","dragonfruit","longest","longest one","longest word","lychee","parsnip","pomelo","remove","strip out","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-31211094","guard":[["hasAny",["broccoli","cherimoya","element","item number","jambul","loquat","nth","plum","position","raspberry","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.str",["transform.reverseWords",["transform.nthStr",["sense.list"],{"lit":1}]]],"mem":null},
{"id":"n-39a71c38","guard":[["hasAny",["apricot","butter","element","guava","how many vowels","item number","nth","number of vowels","persimmon","position","redcurrant","vowel count"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-3f45468e","guard":[["hasAny",["broccoli","cherimoya","each word","element","item number","jambul","loquat","nth","plum","position","raspberry","split into words"]]],"pyramid":["render.and",["transform.words",["transform.nthStr",["sense.list"],{"lit":1}]]],"mem":null},
{"id":"n-6cbc9aee","guard":[["hasAny",["broccoli","cherimoya","each word","element","item number","jambul","loquat","nth","plum","position","raspberry","split into words"]]],"pyramid":["render.lines",["transform.words",["transform.nthStr",["sense.list"],{"lit":1}]]],"mem":null},
{"id":"n-86933415","guard":[["hasAny",["add the digits","broccoli","cherimoya","currant","digit sum","element","item number","jambul","loquat","nth","position","raspberry","sum of the digits"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-9dac4603","guard":[["hasAny",["cranberry","damson","delete","eggplant","mulberry","pomegranate","remove","strawberry","strip out","without"]],["has","among"]],"pyramid":["render.str",["transform.remove",["sense.wordAt",{"lit":2}],["sense.lastWord"]]],"mem":null},
{"id":"n-bccc8fd8","guard":[["hasAny",["blueberry","change to","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],{"lit":"fruit"},["sense.text"]]],"mem":null},
{"id":"n-ae659870","guard":[["hasAny",["blueberry","change to","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.wordAt",{"lit":3}],["sense.text"]]],"mem":null},
{"id":"n-bbedeaec","guard":[["hasAny",["blueberry","change to","feijoa","lychee","pineapple","pomelo","rambutan","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.wordAt",{"lit":3}],["sense.lastWord"]]],"mem":null},
{"id":"n-fa06b0bc","guard":[["hasAny",["change to","cranberry","damson","eggplant","mulberry","pomegranate","replace","strawberry","substitute","swap"]],["has","among"]],"pyramid":["render.str",["transform.replace",["sense.wordAt",{"lit":2}],["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-bd32e0c0","guard":[["hasAny",["cherimoya","huckleberry","item number","jambul","loquat","nth","plum","position","raspberry"]],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-82350c73","guard":[["hasAny",["cherimoya","first n","huckleberry","item number","jambul","loquat","nth","plum","position","raspberry","take"]],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-ebbe12b9","guard":[["hasAny",["cherimoya","first n","huckleberry","item number","jambul","loquat","nth","plum","position","raspberry","take"]],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-05977b81","guard":[["hasAny",["blueberry","cherry","cucumber","delete","lychee","pomelo","remove","shortest","shortest one","shortest word","strip out","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-152b27f3","guard":[["hasAny",["add the digits","broccoli","cherimoya","digit sum","first n","jambul","loquat","raspberry","sum of the digits","take","top"]]],"pyramid":["render.list",["transform.takeStrs",["sense.list"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-2a6f4772","guard":[["hasAny",["broccoli","cherimoya","digits backwards","digits reversed","first n","jambul","loquat","raspberry","reverse the digits","take","top"]]],"pyramid":["render.lines",["transform.takeStrs",["sense.list"],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-3b70d881","guard":[["hasAny",["add the digits","broccoli","cherimoya","digit sum","first n","jambul","loquat","raspberry","sum of the digits","take","top"]]],"pyramid":["render.and",["transform.takeStrs",["sense.list"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-4840f5c4","guard":[["hasAny",["blueberry","cherry","cucumber","lychee","pomelo","separate by","shortest","shortest one","shortest word","split","split by"]],["has","or"]],"pyramid":["render.lines",["transform.split",["sense.lastWord"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-52712298","guard":[["hasAny",["blueberry","cherry","cucumber","lychee","pomelo","separate by","shortest","shortest one","shortest word","split","split by"]],["has","or"]],"pyramid":["render.list",["transform.split",["sense.lastWord"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-59dd2432","guard":[["hasAny",["clementine","delete","grape","jujube","mandarine","remove","strip out","watermelon","without"]],["has","among"]],"pyramid":["render.str",["transform.remove",["sense.wordAt",{"lit":3}],{"lit":"berry"}]],"mem":null},
{"id":"n-70f6ae89","guard":[["hasAny",["broccoli","cherimoya","digits backwards","digits reversed","element","item number","jambul","loquat","nth","position","raspberry","reverse the digits"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-886935d5","guard":[["hasAny",["blueberry","cherry","cucumber","lychee","pomelo","separate by","shortest","shortest one","shortest word","split","split by"]],["has","or"]],"pyramid":["render.and",["transform.split",["sense.lastWord"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-8c43835b","guard":[["hasAny",["broccoli","cherimoya","digits backwards","digits reversed","first n","jambul","loquat","raspberry","reverse the digits","take","top"]]],"pyramid":["render.list",["transform.takeStrs",["sense.list"],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-c5ddbdac","guard":[["hasAny",["broccoli","cherimoya","digits backwards","digits reversed","first n","jambul","loquat","raspberry","reverse the digits","take","top"]]],"pyramid":["render.and",["transform.takeStrs",["sense.list"],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-c824ab30","guard":[["hasAny",["add the digits","broccoli","cherimoya","digit sum","first n","jambul","loquat","raspberry","sum of the digits","take","top"]]],"pyramid":["render.lines",["transform.takeStrs",["sense.list"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-ef548c9b","guard":[["hasAny",["backwards","cranberry","damson","item number","mulberry","nth","passionfruit","position","reverse order","reversed","strawberry"]]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":5}]],"mem":null},
{"id":"n-078c6c3b","guard":[["hasAny",["artichoke","avocado","currant","from position","items from to","parsnip","shortest","shortest one","shortest word","slice"]]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]]],"mem":null},
{"id":"n-978292e7","guard":[["hasAny",["avocado","cherry","from position","items from to","olive","shortest","shortest one","shortest word","slice","tofu"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-f4d65942","guard":[["hasAny",["avocado","cherry","from position","items from to","olive","shortest","shortest one","shortest word","slice","tofu"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]]],"mem":null},
{"id":"n-135fdc96","guard":[["hasAny",["cherimoya","huckleberry","item number","jambul","loquat","nth","position","raspberry","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-17704d33","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","currant","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fcd51e55","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","currant","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-4fa804b6","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","currant","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-d45b1007","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","currant","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-8a73f78e","guard":[["hasAny",["avocado","blackberry","carrot","cucumber","element","item number","nth","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":3}]],"mem":null},
{"id":"n-bf7ca04a","guard":[["hasAny",["avocado","blackberry","carrot","cucumber","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-e65ad545","guard":[["hasAny",["artichoke","backwards","brussels","carrot","reverse","reverse order","reversed","shortest","shortest one","shortest word"]]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-085cd6e7","guard":[["hasAny",["avocado","blackberry","carrot","cucumber","each word","element","item number","nth","position","split into words"]]],"pyramid":["render.str",["transform.nthStr",["transform.words",["sense.subject"]],{"lit":4}]],"mem":null},
{"id":"n-09c39d90","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","digits backwards","digits reversed","reverse the digits"]]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-1675be9a","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","digits backwards","digits reversed","reverse the digits"]]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-196d8f5f","guard":[["hasAny",["dragonfruit","longest","longest one","longest word","lychee","pineapple","pomelo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.and",["transform.split",["sense.subject"],["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-1e077fe6","guard":[["hasAny",["blueberry","how many vowels","lychee","normalise","normalize","number of vowels","pomelo","rambutan","simplify the text","vowel count"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.subject"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-24f04a70","guard":[["hasAny",["damson","delete","eggplant","passionfruit","pomegranate","remove","strip out","without"]],["has","among"]],"pyramid":["render.str",["transform.remove",["sense.wordAt",{"lit":2}],{"lit":"berry"}]],"mem":null},
{"id":"n-28c73476","guard":[["hasAny",["avocado","blackberry","carrot","cucumber","element","item number","nth","position","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.str",["transform.reverseWords",["transform.nthStr",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-29191de2","guard":[["hasAny",["dragonfruit","longest","longest one","longest word","lychee","pineapple","pomelo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.lines",["transform.split",["sense.subject"],["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-2c6e3930","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","how many words","item number","nth","number of words","position","word count"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-2e12e6c2","guard":[["hasAny",["bilberry","character count","how many characters","item number","kumquat","length","nth","number of characters","nut","peach","position"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.chars",["sense.subject"]]]],"mem":null},
{"id":"n-31504403","guard":[["hasAny",["avocado","blackberry","change to","cherry","cucumber","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],{"lit":"fruit"}]],"mem":null},
{"id":"n-338e2a3a","guard":[["hasAny",["avocado","blackberry","capitalise","capitalize","capitalize each word","carrot","cucumber","delete","remove","strip out","title case","without"]]],"pyramid":["render.str",["transform.title",["transform.remove",["sense.lastWord"],["sense.subject"]]]],"mem":null},
{"id":"n-34d36056","guard":[["hasAny",["add the digits","avocado","blackberry","cherry","cucumber","digit sum","sum of the digits"]]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-3a376d55","guard":[["hasAny",["add the digits","avocado","blackberry","cherry","copies","cucumber","digit sum","say it times","sum of the digits"]]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-44f5ac5e","guard":[["hasAny",["avocado","blackberry","change to","cherry","cucumber","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],{"lit":"melon"}]],"mem":null},
{"id":"n-5b3457db","guard":[["hasAny",["avocado","blackberry","carrot","cucumber","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-620215bc","guard":[["hasAny",["add the digits","avocado","blackberry","cherry","cucumber","digit sum","sum of the digits"]]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-6a47e004","guard":[["hasAny",["avocado","blackberry","change to","cherry","cucumber","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],{"lit":"orange"}]],"mem":null},
{"id":"n-6ef431a9","guard":[["hasAny",["dragonfruit","longest","longest one","longest word","lychee","pineapple","pomelo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.list",["transform.split",["sense.subject"],["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-71c86d78","guard":[["hasAny",["avocado","blackberry","capitalise","capitalize","capitalize each word","carrot","cucumber","element","item number","nth","position","title case"]]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-79be6f66","guard":[["hasAny",["avocado","blackberry","cherry","copies","cucumber","digits backwards","digits reversed","reverse the digits","say it times"]]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-7de727c6","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","from position","items from to","slice"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-82e66c02","guard":[["hasAny",["avocado","blackberry","carrot","cucumber","digits backwards","digits reversed","normalise","normalize","reverse the digits","simplify the text"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-8d3d8b20","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","from position","items from to","slice"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-94a6f559","guard":[["hasAny",["add the digits","avocado","blackberry","carrot","cucumber","digit sum","normalise","normalize","simplify the text","sum of the digits"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-9e8debbd","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","from position","items from to","slice"]]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-a2e9803d","guard":[["hasAny",["avocado","blackberry","butter","carrot","delete","remove","shortest","shortest one","shortest word","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-a62f6a6c","guard":[["hasAny",["avocado","blackberry","carrot","cucumber","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.lines",["transform.words",["transform.nthStr",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-affc3d0c","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bff30aab","guard":[["hasAny",["avocado","blackberry","carrot","cucumber","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.and",["transform.words",["transform.nthStr",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-c09204b6","guard":[["hasAny",["delete","dragonfruit","longest","longest one","longest word","lychee","pineapple","pomelo","remove","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-c2d0ca1b","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","from position","items from to","slice"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-c424c8f9","guard":[["hasAny",["avocado","blackberry","change to","cherry","cucumber","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],{"lit":"berry"}]],"mem":null},
{"id":"n-d5566964","guard":[["hasAny",["add the digits","avocado","blackberry","cherry","cucumber","digit sum","sum of the digits"]]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-d7e6237e","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","digits backwards","digits reversed","reverse the digits"]]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-e114e0c6","guard":[["hasAny",["avocado","blackberry","carrot","cucumber","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.list",["transform.words",["transform.nthStr",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-e33da7e0","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","from position","items from to","slice"]]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-e5c85aae","guard":[["hasAny",["avocado","blackberry","change to","cherry","cucumber","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.text"]]],"mem":null},
{"id":"n-eaee4dbe","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","from position","items from to","slice"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-f2274b8e","guard":[["hasAny",["bilberry","half","half of","halve","item number","kumquat","nth","nut","peach","position"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["transform.half",["sense.wordCount"]]]],"mem":null},
{"id":"n-f85cd968","guard":[["hasAny",["blueberry","how many vowels","lychee","normalise","normalize","number of vowels","pomelo","rambutan","simplify the text","vowel count"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-fc2b3fc4","guard":[["hasAny",["avocado","blackberry","carrot","cucumber","delete","invert case","remove","strip out","swap case","toggle case","without"]]],"pyramid":["render.str",["transform.swapCase",["transform.remove",["sense.lastWord"],["sense.subject"]]]],"mem":null},
{"id":"n-04332f2d","guard":[["hasAny",["cranberry","eggplant","from position","grape","items from to","shortest","shortest one","shortest word","slice","watermelon"]],["has","among"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.words"],{"lit":2},{"lit":3}]]],"mem":null},
{"id":"n-170c34b7","guard":[["hasAny",["bilberry","item number","kumquat","nth","nut","peach","position"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-37a6ca91","guard":[["hasAny",["bilberry","item number","kumquat","nth","nut","peach","position"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.subject"]],"mem":null},
{"id":"n-b560e93f","guard":[["hasAny",["bilberry","item number","kumquat","nth","nut","peach","position"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-c0cd6fcc","guard":[["hasAny",["avocado","blackberry","change to","cherry","cucumber","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.after",{"lit":"fruit"}]]],"mem":null},
{"id":"n-c27bb01b","guard":[["hasAny",["avocado","blackberry","change to","cherry","cucumber","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.before",{"lit":"fruit"}]]],"mem":null},
{"id":"n-d9694eeb","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-fd883d81","guard":[["hasAny",["from position","grape","items from to","nut","olive","plum","shortest","shortest one","shortest word","slice"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":2},{"lit":4}]]],"mem":null},
{"id":"n-11d1111d","guard":[["hasAny",["bilberry","capitalise","capitalize","capitalize each word","item number","kumquat","nth","nut","peach","position","title case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-27ff0ff4","guard":[["hasAny",["bilberry","invert case","item number","kumquat","nth","nut","peach","position","swap case","toggle case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-4110ded6","guard":[["hasAny",["avocado","blackberry","capitalise","capitalize","capitalize each word","cherry","cucumber","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-4b5a148e","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-6c90a9eb","guard":[["hasAny",["bilberry","invert case","item number","kumquat","nth","nut","peach","position","swap case","toggle case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6d5fafe6","guard":[["hasAny",["bilberry","item number","kumquat","nth","nut","peach","position","reverse the words","reverse word order","words backwards"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-8096b123","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","first n","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-c8dafb48","guard":[["hasAny",["bilberry","capitalise","capitalize","capitalize each word","item number","kumquat","nth","nut","peach","position","title case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-d72621b5","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-eb60952b","guard":[["hasAny",["apple","blackcurrant","item number","nectarine","nth","position","tangerine"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-073c1a68","guard":[["hasAny",["apple","blackcurrant","capitalise","capitalize","capitalize each word","item number","nectarine","nth","position","tangerine","title case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-1bdc951b","guard":[["hasAny",["bilberry","each word","item number","kumquat","nth","nut","peach","position","split into words"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1e496ef7","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-263d951e","guard":[["hasAny",["avocado","blackberry","carrot","cucumber","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.list"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-51732507","guard":[["hasAny",["apple","blackcurrant","invert case","item number","nectarine","nth","position","swap case","tangerine","toggle case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-7d1e0258","guard":[["hasAny",["bilberry","each word","item number","kumquat","nth","nut","peach","position","split into words"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-905b6280","guard":[["hasAny",["apple","blackcurrant","item number","nectarine","nth","position","tangerine"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-98c42e17","guard":[["hasAny",["apple","blackcurrant","item number","nectarine","nth","position","tangerine"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a52007db","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-e1687cd8","guard":[["hasAny",["chili","goji","item number","melon","nth","position"]],["has","or"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a fruit."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e8ccac9b","guard":[["hasAny",["avocado","blackberry","cherry","cucumber","delete","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.remove",["sense.lastWord"],["sense.subject"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-5e2068c6","guard":[["hasAny",["apple","blackcurrant","each word","item number","nectarine","nth","position","split into words","tangerine"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-c2667d5e","guard":[["hasAny",["apple","blackcurrant","each word","item number","nectarine","nth","position","split into words","tangerine"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-c4bea827","guard":[["hasAny",["item number","mangosteen","nth","position","salal","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-176d5732","guard":[["hasAny",["invert case","item number","mangosteen","nth","position","salal","star","swap case","toggle case","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-81807e20","guard":[["hasAny",["item number","mangosteen","nth","position","salal","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-aa7d6438","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mangosteen","nth","position","salal","star","title case","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d927b1f6","guard":[["hasAny",["item number","mangosteen","nth","position","salal","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-de1bf820","guard":[["hasAny",["each word","item number","mangosteen","nth","position","salal","split into words","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-ebdda3d4","guard":[["hasAny",["each word","item number","mangosteen","nth","position","salal","split into words","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-7a384c60","guard":[["hasAny",["artichoke","brussels","shortest","shortest one","shortest word"]]],"pyramid":["render.str",["aggregate.shortest",["sense.list"]]],"mem":null},
{"id":"n-4f31629c","guard":[["hasAny",["artichoke","brussels","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-796b7efe","guard":[["hasAny",["artichoke","brussels","capitalise","capitalize","capitalize each word","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.str",["transform.title",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-1fd86a1f","guard":[["hasAny",["avocado","consonant count","feijoa","how many consonants","normalise","normalize","number of consonants","pomelo","simplify the text"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-6435d044","guard":[["hasAny",["blueberry","lychee","pomelo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.and",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-8168e201","guard":[["hasAny",["blueberry","lychee","pomelo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.list",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a471285c","guard":[["hasAny",["blueberry","delete","lychee","pomelo","remove","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-ada3907b","guard":[["hasAny",["add the digits","digit sum","eggplant","element","item number","nth","plum","pomegranate","position","sum of the digits"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-bc04cc12","guard":[["hasAny",["blueberry","lychee","pomelo","separate by","shortest","shortest one","shortest word","split","split by"]],["has","pick"]],"pyramid":["render.and",["transform.split",["sense.subject"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-c21cb541","guard":[["hasAny",["blueberry","delete","lychee","pomelo","remove","shortest","shortest one","shortest word","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-cc002557","guard":[["hasAny",["blueberry","lychee","pomelo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.lines",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-cd9a267d","guard":[["hasAny",["artichoke","brussels","delete","remove","shortest","shortest one","shortest word","strip out","without"]]],"pyramid":["render.str",["transform.remove",["aggregate.shortest",["sense.list"]],["sense.lastWord"]]],"mem":null},
{"id":"n-da62cc99","guard":[["hasAny",["apple","how many items","item number","nectarine","nth","number of items","position","tangerine"]],["has","pick"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-e1d0e992","guard":[["hasAny",["blueberry","lychee","pomelo","separate by","shortest","shortest one","shortest word","split","split by"]],["has","pick"]],"pyramid":["render.list",["transform.split",["sense.subject"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-e70a950a","guard":[["hasAny",["blueberry","lychee","pomelo","separate by","shortest","shortest one","shortest word","split","split by"]],["has","pick"]],"pyramid":["render.lines",["transform.split",["sense.subject"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-f3ff020f","guard":[["hasAny",["avocado","consonant count","element","how many consonants","item number","leek","nth","number of consonants","onion","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-0bd4f2e0","guard":[["hasAny",["blueberry","change to","lychee","pomelo","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.wordAt",{"lit":2}],["sense.text"]]],"mem":null},
{"id":"n-1ea17dd3","guard":[["hasAny",["blueberry","change to","lychee","pomelo","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.wordAt",{"lit":2}],["sense.subject"]]],"mem":null},
{"id":"n-40bc77e8","guard":[["hasAny",["blueberry","longest","longest one","longest word","lychee","pomelo","separate by","split","split by"]],["has","pick"]],"pyramid":["render.str",["aggregate.longest",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-48537a62","guard":[["hasAny",["blueberry","change to","lychee","pomelo","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.wordAt",{"lit":2}],["sense.lastWord"]]],"mem":null},
{"id":"n-609eb0f9","guard":[["hasAny",["blueberry","lychee","pomelo","separate by","shortest","shortest one","shortest word","split","split by"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-a53efc30","guard":[["hasAny",["from position","items from to","nut","olive","plum","shortest","shortest one","shortest word","slice"]],["has","a"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":2},["sense.wordCount"]]]],"mem":null},
{"id":"n-f41485f8","guard":[["hasAny",["from position","items from to","nut","olive","plum","shortest","shortest one","shortest word","slice"]],["has","a"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":2},{"lit":5}]]],"mem":null},
{"id":"n-38834acc","guard":[["hasAny",["artichoke","brussels","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.shortest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-de4ade01","guard":[["hasAny",["cantaloupe","item number","nth","olive","position","raisin","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e90c68e0","guard":[["hasAny",["nut","plum","shortest","shortest one","shortest word"]],["has","a"]],"pyramid":["render.str",["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-03681b0c","guard":[["hasAny",["backwards","olive","plum","reverse order","reversed","shortest","shortest one","shortest word"]],["has","these"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-4aa7b034","guard":[["hasAny",["nut","plum","shortest","shortest one","shortest word"]],["has","a"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a fruit."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4c8a71f0","guard":[["hasAny",["invert case","nut","plum","shortest","shortest one","shortest word","swap case","toggle case"]],["has","a"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-a3c9d54d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nut","plum","shortest","shortest one","shortest word","title case"]],["has","a"]],"pyramid":["render.str",["transform.title",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-d57f4154","guard":[["hasAny",["a to z","alphabetical","alphabetize","nut","plum","shortest","shortest one","shortest word"]],["has","a"]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.content"]]]],"mem":null},
{"id":"n-0779c99a","guard":[["hasAny",["avocado","carrot","delete","longest","longest one","longest word","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-38a30118","guard":[["hasAny",["a to z","alphabetical","alphabetize","backwards","olive","plum","reverse order","reversed","shortest","shortest one","shortest word"]],["has","these"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["transform.sortStrs",["sense.content"]]]]],"mem":null},
{"id":"n-38f22d34","guard":[["hasAny",["consonant count","feijoa","how many consonants","normalise","normalize","number of consonants","pomelo","simplify the text"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.consonants",["sense.subject"]]]],"mem":null},
{"id":"n-522242a4","guard":[["hasAny",["delete","nut","plum","remove","shortest","shortest one","shortest word","strip out","without"]],["has","a"]],"pyramid":["render.str",["transform.remove",["aggregate.shortest",["sense.content"]],["sense.lastWord"]]],"mem":null},
{"id":"n-6386eac4","guard":[["hasAny",["backwards","eggplant","element","item number","nth","pomegranate","position","reverse order","reversed"]]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":10}]],"mem":null},
{"id":"n-793eb88f","guard":[["hasAny",["a to z","alphabetical","alphabetize","item number","nth","pineapple","position","tangerine"]],["has","pick"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],["sense.wordCount"]]],"mem":null},
{"id":"n-7c2f5d3c","guard":[["hasAny",["consonant count","feijoa","how many consonants","normalise","normalize","number of consonants","pomelo","simplify the text"]]],"pyramid":["render.str",["transform.norm",["sense.subject"],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-8ef18201","guard":[["hasAny",["banana","grapefruit","half","half of","halve","item number","nth","position"]],["has","pick"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["transform.half",["sense.wordCount"]]]],"mem":null},
{"id":"n-c0b89dac","guard":[["hasAny",["a to z","alphabetical","alphabetize","carrot","item number","nth","parsnip","position"]],["has","pick"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":5}]],"mem":null},
{"id":"n-d4d67a11","guard":[["hasAny",["first n","nut","plum","shortest","shortest one","shortest word","take"]],["has","a"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-e11fda37","guard":[["hasAny",["backwards","blackcurrant","item number","nth","plum","position","reverse order","reversed"]],["has","a"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":5}]],"mem":null},
{"id":"n-e98a8876","guard":[["hasAny",["divisor count","eggplant","how many factors","item number","nth","number of divisors","pomegranate","position"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-ee971585","guard":[["hasAny",["first n","nut","plum","shortest","shortest one","shortest word","take"]],["has","a"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":5}]]],"mem":null},
{"id":"n-c7b20c42","guard":[["hasAny",["item number","melon","nth","position"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," melon is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.lastWord"]],"mem":null},
{"id":"n-52f8ce35","guard":[["hasAny",["banana","grapefruit","item number","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-58a4b966","guard":[["has","melon"],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["sense.wordAt",{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-61554387","guard":[["hasAny",["item number","nth","position","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," fruit is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-eca8c2c1","guard":[["hasAny",["item number","melon","nth","position"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a fruit."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-063ea98f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","melon","title case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.title",["sense.wordAt",{"lit":2}]],["sense.wordAt",{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-503e8e75","guard":[["hasAny",["item number","melon","nth","position"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}],["sense.subject"]],"mem":null},
{"id":"n-74b073de","guard":[["hasAny",["banana","capitalise","capitalize","capitalize each word","grapefruit","item number","nth","position","title case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-b3d27905","guard":[["hasAny",["banana","grapefruit","item number","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-baede0aa","guard":[["hasAny",["invert case","melon","swap case","toggle case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["sense.wordAt",{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-bd593940","guard":[["hasAny",["item number","nth","position","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a fruit."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c67b63e3","guard":[["hasAny",["item number","melon","nth","position"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-c69838bb","guard":[["hasAny",["banana","grapefruit","invert case","item number","nth","position","swap case","toggle case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-3daa1532","guard":[["hasAny",["banana","each word","grapefruit","item number","nth","position","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-53d98e66","guard":[["hasAny",["item number","nth","position","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.wordAt",{"lit":3}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-63d37339","guard":[["hasAny",["banana","each word","grapefruit","item number","nth","position","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-6e700ef8","guard":[["hasAny",["invert case","item number","melon","nth","position","swap case","toggle case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.lastWord"]],"mem":null},
{"id":"n-740a29cc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","melon","nth","position","title case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.title",["sense.wordAt",{"lit":3}]],["sense.lastWord"]],"mem":null},
{"id":"n-76831833","guard":[["hasAny",["each word","melon","split into words"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["sense.wordAt",{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-79e68e49","guard":[["hasAny",["each word","melon","split into words"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["sense.wordAt",{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-99e535b2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","melon","nth","position","title case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}],["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-9a4d979f","guard":[["hasAny",["item number","melon","nth","position","reverse the words","reverse word order","words backwards"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}],["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-9a7b61d0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","melon","nth","position","title case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b702de6c","guard":[["hasAny",["invert case","item number","melon","nth","position","swap case","toggle case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c88e2535","guard":[["hasAny",["invert case","item number","melon","nth","position","swap case","toggle case"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}],["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-e68684bd","guard":[["hasAny",["item number","melon","nth","position"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-0c51b479","guard":[["hasAny",["invert case","item number","nth","position","star","swap case","toggle case","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-129bcc5d","guard":[["hasAny",["each word","item number","melon","nth","position","split into words"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1b56a3ad","guard":[["hasAny",["item number","nth","position","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-1ee65445","guard":[["hasAny",["each word","item number","melon","nth","position","split into words"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.lastWord"]],"mem":null},
{"id":"n-8d9a7e0a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","star","title case","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.wordAt",{"lit":3}]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-8edd541e","guard":[["hasAny",["each word","item number","melon","nth","position","split into words"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b063aa86","guard":[["hasAny",["each word","item number","melon","nth","position","split into words"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.lastWord"]],"mem":null},
{"id":"n-e1e1f306","guard":[["hasAny",["item number","nth","position","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-1f59551e","guard":[["hasAny",["chili","goji","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-948c7905","guard":[["hasAny",["item number","nth","position","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9b4c8b85","guard":[["hasAny",["item number","nth","position","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b3227c60","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","star","title case","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ce1efdc0","guard":[["hasAny",["invert case","item number","nth","position","star","swap case","toggle case","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-da5be1cf","guard":[["hasAny",["each word","item number","nth","position","split into words","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-e7d8c431","guard":[["hasAny",["each word","item number","nth","position","split into words","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-180bfc0c","guard":[["hasAny",["each word","item number","nth","position","split into words","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-8724e316","guard":[["hasAny",["chili","first n","goji","item number","nth","position","take"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-c1d090e8","guard":[["hasAny",["each word","item number","nth","position","split into words","star","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-f3f1b238","guard":[["hasAny",["chili","first n","goji","item number","nth","position","take"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]]],"mem":null},
{"id":"n-018061f5","guard":[["hasAny",["blackcurrant","brussels","fruit","pick","salt","sprout"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from blackcurrant, brussels sprout or salt":"blackcurrant is a fruit."}}},
{"id":"n-03a3bf19","guard":[["hasAny",["among","egg","fruit","gooseberry","one","onion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among onion, gooseberry or egg, which one is a fruit":"gooseberry is a fruit."}}},
{"id":"n-03d5e3d9","guard":[["hasAny",["cheese","fruit","pick","salt","ugli"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from ugli fruit, salt or cheese":"ugli fruit is a fruit."}}},
{"id":"n-04511636","guard":[["hasAny",["cauliflower","elderberry","fruit","milk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: cauliflower, elderberry or milk":"elderberry is a fruit."}}},
{"id":"n-0525f4c0","guard":[["has","watermelon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among cauliflower, watermelon or salt, which one is a fruit":"watermelon is a fruit."}}},
{"id":"n-059a2ebc","guard":[["hasAny",["butter","fruit","lychee","pick","salt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from salt, butter or lychee":"lychee is a fruit."}}},
{"id":"n-060d1f52","guard":[["hasAny",["fruit","pick","potato","spinach","star","sweet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from star fruit, sweet potato or spinach":"star fruit is a fruit."}}},
{"id":"n-09d992f9","guard":[["hasAny",["fruit","grapefruit","kale","pick","salmon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from salmon, grapefruit or kale":"grapefruit is a fruit."}}},
{"id":"n-0b7e4a06","guard":[["has","durian"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from sweet potato, durian or salmon":"durian is a fruit."}}},
{"id":"n-0c57770d","guard":[["has","mulberry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among mulberry, bread or spinach, which one is a fruit":"mulberry is a fruit."}}},
{"id":"n-0d1a8a9e","guard":[["hasAny",["berry","broccoli","cabbage","fruit","pick","salal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from salal berry, broccoli or cabbage":"salal berry is a fruit."}}},
{"id":"n-0deb92c2","guard":[["hasAny",["apple","fruit","pick","salt","turnip"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from apple, salt or turnip":"apple is a fruit."}}},
{"id":"n-0e43fbbc","guard":[["hasAny",["among","broccoli","canary","fruit","leek","melon","one"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among canary melon, leek or broccoli, which one is a fruit":"canary melon is a fruit."}}},
{"id":"n-121ee930","guard":[["hasAny",["beet","cabbage","chili","fruit","pepper"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: chili pepper, beet or cabbage":"chili pepper is a fruit."}}},
{"id":"n-14b05ae4","guard":[["hasAny",["fruit","honey","persimmon","salt"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: salt, persimmon or honey":"persimmon is a fruit."}}},
{"id":"n-1620fd34","guard":[["hasAny",["brussels","cauliflower","currant","fruit","sprout"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: brussels sprout, currant or cauliflower":"currant is a fruit."}}},
{"id":"n-16aa7650","guard":[["has","passionfruit"],["has","among"]],"pyramid":["render.template",{"lit":["passionfruit is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-199df8f3","guard":[["hasAny",["fruit","grapefruit","kale","pick","salmon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from salmon, grapefruit or kale":"grapefruit is a fruit."}}},
{"id":"n-1bd282ca","guard":[["hasAny",["among","butter","fruit","mandarine","one","sugar"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among butter, mandarine or sugar, which one is a fruit":"mandarine is a fruit."}}},
{"id":"n-1bf1401b","guard":[["has","cloudberry"]],"pyramid":["render.template",{"lit":["cloudberry is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-1e0ad0a7","guard":[["has","raisin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: spinach, raisin or onion":"raisin is a fruit."}}},
{"id":"n-20408b68","guard":[["hasAny",["among","bread","cheese","fruit","one","peach"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among cheese, bread or peach, which one is a fruit":"peach is a fruit."}}},
{"id":"n-204ef174","guard":[["hasAny",["among","cabbage","cauliflower","clementine","fruit","one"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among cabbage, clementine or cauliflower, which one is a fruit":"clementine is a fruit."}}},
{"id":"n-224b4d08","guard":[["hasAny",["broccoli","fruit","huckleberry","sugar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: huckleberry, broccoli or sugar":"huckleberry is a fruit."}}},
{"id":"n-22df7123","guard":[["has","nut"]],"pyramid":["render.template",{"lit":["nut is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-23460ec9","guard":[["hasAny",["cabbage","fruit","ginger","raspberry"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: raspberry, ginger or cabbage":"raspberry is a fruit."}}},
{"id":"n-23952a0f","guard":[["hasAny",["berry","broccoli","cabbage","fruit","pick","salal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from salal berry, broccoli or cabbage":"salal berry is a fruit."}}},
{"id":"n-24cffe85","guard":[["hasAny",["beet","cabbage","chili","fruit","pepper"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: chili pepper, beet or cabbage":"chili pepper is a fruit."}}},
{"id":"n-250dd6b1","guard":[["hasAny",["among","damson","fruit","kale","leek","one"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among damson, leek or kale, which one is a fruit":"damson is a fruit."}}},
{"id":"n-2ce26848","guard":[["hasAny",["among","blood","fruit","kale","one","orange","salmon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among salmon, blood orange or kale, which one is a fruit":"blood orange is a fruit."}}},
{"id":"n-2ff90735","guard":[["has","bilberry"]],"pyramid":["render.template",{"lit":["bilberry is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-307645f3","guard":[["hasAny",["blueberry","chicken","fruit","pick","potato"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from chicken, potato or blueberry":"blueberry is a fruit."}}},
{"id":"n-30f60106","guard":[["hasAny",["among","beet","fruit","jujube","one","salmon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among beet, jujube or salmon, which one is a fruit":"jujube is a fruit."}}},
{"id":"n-353aafc3","guard":[["hasAny",["butter","fruit","nectarine","onion","pick"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from nectarine, onion or butter":"nectarine is a fruit."}}},
{"id":"n-35ebdc85","guard":[["hasAny",["spinach","star"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from star fruit, sweet potato or spinach":"star fruit is a fruit."}}},
{"id":"n-376cde74","guard":[["has","mandarine"]],"pyramid":["render.template",{"lit":["mandarine is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-37f94102","guard":[["has","cranberry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among cranberry, artichoke or bread, which one is a fruit":"cranberry is a fruit."}}},
{"id":"n-396ff4a0","guard":[["hasAny",["carrot","fruit","lettuce","pick","tangerine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from tangerine, lettuce or carrot":"tangerine is a fruit."}}},
{"id":"n-39a0f8c0","guard":[["hasAny",["among","blood","fruit","kale","one","orange","salmon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among salmon, blood orange or kale, which one is a fruit":"blood orange is a fruit."}}},
{"id":"n-3b83ad30","guard":[["hasAny",["fruit","mango","salt","spinach"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: spinach, mango or salt":"mango is a fruit."}}},
{"id":"n-3cfec9e7","guard":[["hasAny",["fruit","honey","leek","redcurrant"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: honey, redcurrant or leek":"redcurrant is a fruit."}}},
{"id":"n-3dfd2bce","guard":[["has","damson"],["has","among"]],"pyramid":["render.template",{"lit":["damson is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-3e928ea3","guard":[["hasAny",["fruit","guava","parsnip","tofu"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: tofu, guava or parsnip":"guava is a fruit."}}},
{"id":"n-3edd7b59","guard":[["hasAny",["banana","beet","cabbage","fruit","pick"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from beet, banana or cabbage":"banana is a fruit."}}},
{"id":"n-415ecd2c","guard":[["hasAny",["bread","fruit","onion","orange","pick"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from onion, bread or orange":"orange is a fruit."}}},
{"id":"n-4177e050","guard":[["hasAny",["cauliflower","dragonfruit","fruit","milk","pick"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from cauliflower, milk or dragonfruit":"dragonfruit is a fruit."}}},
{"id":"n-46388358","guard":[["has","clementine"],["has","among"]],"pyramid":["render.template",{"lit":["clementine is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-47716f89","guard":[["hasAny",["brussels","cauliflower","currant","fruit","sprout"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: brussels sprout, currant or cauliflower":"currant is a fruit."}}},
{"id":"n-47c51793","guard":[["hasAny",["fruit","guava","parsnip","tofu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: tofu, guava or parsnip":"guava is a fruit."}}},
{"id":"n-47e2930d","guard":[["hasAny",["fruit","mushroom","pick","pomelo","yogurt"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from mushroom, yogurt or pomelo":"pomelo is a fruit."}}},
{"id":"n-484a26f1","guard":[["has","strawberry"]],"pyramid":["render.template",{"lit":["strawberry is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-48d4f84a","guard":[["has","eggplant"],["has","among"]],"pyramid":["render.template",{"lit":["eggplant is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-4cf817ad","guard":[["has","strawberry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among strawberry, cabbage or artichoke, which one is a fruit":"strawberry is a fruit."}}},
{"id":"n-50a6a85c","guard":[["hasAny",["blueberry","chicken","fruit","pick","potato"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from chicken, potato or blueberry":"blueberry is a fruit."}}},
{"id":"n-52614059","guard":[["hasAny",["among","artichoke","cabbage","fruit","one","strawberry"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among strawberry, cabbage or artichoke, which one is a fruit":"strawberry is a fruit."}}},
{"id":"n-537ac163","guard":[["hasAny",["among","butter","fruit","mandarine","one","sugar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among butter, mandarine or sugar, which one is a fruit":"mandarine is a fruit."}}},
{"id":"n-566b111e","guard":[["hasAny",["breadfruit","fruit","lettuce","pick","potato"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from lettuce, potato or breadfruit":"breadfruit is a fruit."}}},
{"id":"n-596bfe28","guard":[["hasAny",["butter","cantaloupe","fruit","mushroom"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: mushroom, cantaloupe or butter":"cantaloupe is a fruit."}}},
{"id":"n-59c1d947","guard":[["hasAny",["pomegranate","salt"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among pomegranate, sweet potato or salt, which one is a fruit":"pomegranate is a fruit."}}},
{"id":"n-5de85d50","guard":[["hasAny",["carrot","fruit","lettuce","pick","tangerine"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from tangerine, lettuce or carrot":"tangerine is a fruit."}}},
{"id":"n-5fe65e18","guard":[["hasAny",["cabbage","cherimoya","fruit","honey"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: cherimoya, cabbage or honey":"cherimoya is a fruit."}}},
{"id":"n-60b42f20","guard":[["hasAny",["brussels","fruit","plum","sprout","turnip"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: plum, turnip or brussels sprout":"plum is a fruit."}}},
{"id":"n-628fecff","guard":[["has","cloudberry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among spinach, cloudberry or bread, which one is a fruit":"cloudberry is a fruit."}}},
{"id":"n-6332d0e8","guard":[["hasAny",["eggplant","mushroom"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among eggplant, mushroom or sweet potato, which one is a fruit":"eggplant is a fruit."}}},
{"id":"n-6405e632","guard":[["hasAny",["bilberry","radish"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among radish, egg or bilberry, which one is a fruit":"bilberry is a fruit."}}},
{"id":"n-640df043","guard":[["hasAny",["berry","fruit","goji","leek","turnip"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: goji berry, leek or turnip":"goji berry is a fruit."}}},
{"id":"n-658dd017","guard":[["hasAny",["carrot","cherry","fruit","parsnip"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: carrot, parsnip or cherry":"cherry is a fruit."}}},
{"id":"n-659d6db8","guard":[["hasAny",["feijoa","fruit","milk","onion","pick"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from milk, onion or feijoa":"feijoa is a fruit."}}},
{"id":"n-661af351","guard":[["hasAny",["among","cauliflower","fruit","melon","one","rock","salt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among rock melon, salt or cauliflower, which one is a fruit":"rock melon is a fruit."}}},
{"id":"n-717e6a81","guard":[["hasAny",["butter","fruit","lychee","pick","salt"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from salt, butter or lychee":"lychee is a fruit."}}},
{"id":"n-721e7cfa","guard":[["hasAny",["brussels","fruit","plum","sprout","turnip"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: plum, turnip or brussels sprout":"plum is a fruit."}}},
{"id":"n-72dbb9d4","guard":[["hasAny",["butter","cantaloupe","fruit","mushroom"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: mushroom, cantaloupe or butter":"cantaloupe is a fruit."}}},
{"id":"n-73553925","guard":[["hasAny",["bread","fruit","onion","orange","pick"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from onion, bread or orange":"orange is a fruit."}}},
{"id":"n-75d38da2","guard":[["hasAny",["cauliflower","fruit","kiwi","onion","pick"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from cauliflower, onion or kiwi fruit":"kiwi fruit is a fruit."}}},
{"id":"n-75ec56af","guard":[["hasAny",["fruit","mushroom","pick","pomelo","yogurt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from mushroom, yogurt or pomelo":"pomelo is a fruit."}}},
{"id":"n-7b630847","guard":[["hasAny",["blackberry","bread","fruit","turnip"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: bread, turnip or blackberry":"blackberry is a fruit."}}},
{"id":"n-7ba0e972","guard":[["hasAny",["durian","fruit","pick","potato","salmon","sweet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from sweet potato, durian or salmon":"durian is a fruit."}}},
{"id":"n-7d5722a9","guard":[["has","peach"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among cheese, bread or peach, which one is a fruit":"peach is a fruit."}}},
{"id":"n-849c2e31","guard":[["hasAny",["among","broccoli","canary","fruit","leek","melon","one"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among canary melon, leek or broccoli, which one is a fruit":"canary melon is a fruit."}}},
{"id":"n-86e32f86","guard":[["hasAny",["nut","tofu"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among tofu, cheese or nut, which one is a fruit":"nut is a fruit."}}},
{"id":"n-885c525c","guard":[["hasAny",["fruit","mango","salt","spinach"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: spinach, mango or salt":"mango is a fruit."}}},
{"id":"n-8c86d588","guard":[["hasAny",["cabbage","cherimoya","fruit","honey"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: cherimoya, cabbage or honey":"cherimoya is a fruit."}}},
{"id":"n-8e56cb8f","guard":[["hasAny",["gooseberry","onion"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among onion, gooseberry or egg, which one is a fruit":"gooseberry is a fruit."}}},
{"id":"n-8f11429e","guard":[["hasAny",["among","cheese","fruit","nut","one","tofu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among tofu, cheese or nut, which one is a fruit":"nut is a fruit."}}},
{"id":"n-90c00c53","guard":[["hasAny",["cauliflower","fruit","kiwi","onion","pick"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from cauliflower, onion or kiwi fruit":"kiwi fruit is a fruit."}}},
{"id":"n-94ee65b6","guard":[["has","mulberry"]],"pyramid":["render.template",{"lit":["mulberry is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-9ab269dc","guard":[["hasAny",["fruit","honey","leek","redcurrant"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: honey, redcurrant or leek":"redcurrant is a fruit."}}},
{"id":"n-9abf97ae","guard":[["has","gooseberry"],["has","among"]],"pyramid":["render.template",{"lit":["gooseberry is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-9b562915","guard":[["has","pomegranate"]],"pyramid":["render.template",{"lit":["pomegranate is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-9c2e1b90","guard":[["hasAny",["among","cheese","fruit","lettuce","one","passionfruit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among passionfruit, cheese or lettuce, which one is a fruit":"passionfruit is a fruit."}}},
{"id":"n-9cf23acd","guard":[["hasAny",["apricot","fruit","ginger","kale"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: kale, apricot or ginger":"apricot is a fruit."}}},
{"id":"n-9de25f87","guard":[["hasAny",["feijoa","fruit","milk","onion","pick"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from milk, onion or feijoa":"feijoa is a fruit."}}},
{"id":"n-9f1ce166","guard":[["hasAny",["apricot","fruit","ginger","kale"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: kale, apricot or ginger":"apricot is a fruit."}}},
{"id":"n-a153f351","guard":[["hasAny",["among","bilberry","egg","fruit","one","radish"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among radish, egg or bilberry, which one is a fruit":"bilberry is a fruit."}}},
{"id":"n-a351382e","guard":[["has","jambul"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: jambul, onion or spinach":"jambul is a fruit."}}},
{"id":"n-a78bf7e3","guard":[["hasAny",["among","cauliflower","fruit","one","salt","watermelon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among cauliflower, watermelon or salt, which one is a fruit":"watermelon is a fruit."}}},
{"id":"n-a824a5a5","guard":[["has","clementine"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among cabbage, clementine or cauliflower, which one is a fruit":"clementine is a fruit."}}},
{"id":"n-aa4fdd00","guard":[["hasAny",["butter","cabbage","cucumber","fruit"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: cabbage, butter or cucumber":"cucumber is a fruit."}}},
{"id":"n-ab2ce9cf","guard":[["hasAny",["avocado","fruit","garlic","mushroom"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: garlic, mushroom or avocado":"avocado is a fruit."}}},
{"id":"n-acbad2d8","guard":[["hasAny",["bread","fruit","ginger","loquat"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: loquat, bread or ginger":"loquat is a fruit."}}},
{"id":"n-aeb0b0ef","guard":[["has","peach"],["has","among"]],"pyramid":["render.template",{"lit":["peach is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-afd45b72","guard":[["hasAny",["broccoli","fruit","huckleberry","sugar"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: huckleberry, broccoli or sugar":"huckleberry is a fruit."}}},
{"id":"n-b05d7aa3","guard":[["hasAny",["artichoke","fruit","parsnip","pick","pineapple"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from parsnip, artichoke or pineapple":"pineapple is a fruit."}}},
{"id":"n-b6de4f0e","guard":[["hasAny",["melon","rock"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among rock melon, salt or cauliflower, which one is a fruit":"rock melon is a fruit."}}},
{"id":"n-bd192642","guard":[["hasAny",["avocado","fruit","garlic","mushroom"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: garlic, mushroom or avocado":"avocado is a fruit."}}},
{"id":"n-be3cd369","guard":[["hasAny",["fruit","pick","potato","rambutan","salmon","sweet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from salmon, sweet potato or rambutan":"rambutan is a fruit."}}},
{"id":"n-be621a17","guard":[["hasAny",["butter","fruit","mangosteen","milk","pick","purple"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from purple mangosteen, milk or butter":"purple mangosteen is a fruit."}}},
{"id":"n-c41ac9ee","guard":[["hasAny",["blackcurrant","brussels","fruit","pick","salt","sprout"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from blackcurrant, brussels sprout or salt":"blackcurrant is a fruit."}}},
{"id":"n-c5dab76b","guard":[["hasAny",["among","fruit","one","pomegranate","potato","salt","sweet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among pomegranate, sweet potato or salt, which one is a fruit":"pomegranate is a fruit."}}},
{"id":"n-c5f655f0","guard":[["has","cranberry"]],"pyramid":["render.template",{"lit":["cranberry is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-c61fd474","guard":[["hasAny",["blackberry","bread","fruit","turnip"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: bread, turnip or blackberry":"blackberry is a fruit."}}},
{"id":"n-c839697b","guard":[["hasAny",["fruit","honey","persimmon","salt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: salt, persimmon or honey":"persimmon is a fruit."}}},
{"id":"n-c842bd21","guard":[["has","jujube"],["has","among"]],"pyramid":["render.template",{"lit":["jujube is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-ca47e4d0","guard":[["hasAny",["among","bread","fruit","mulberry","one","spinach"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among mulberry, bread or spinach, which one is a fruit":"mulberry is a fruit."}}},
{"id":"n-ccf374dc","guard":[["hasAny",["among","artichoke","bread","cranberry","fruit","one"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among cranberry, artichoke or bread, which one is a fruit":"cranberry is a fruit."}}},
{"id":"n-ced8e440","guard":[["has","elderberry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: cauliflower, elderberry or milk":"elderberry is a fruit."}}},
{"id":"n-d2bc0535","guard":[["has","grape"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among salmon, grape or chicken, which one is a fruit":"grape is a fruit."}}},
{"id":"n-d3242033","guard":[["hasAny",["bread","fruit","ginger","loquat"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: loquat, bread or ginger":"loquat is a fruit."}}},
{"id":"n-d6567b1b","guard":[["hasAny",["fruit","jambul","onion","spinach"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: jambul, onion or spinach":"jambul is a fruit."}}},
{"id":"n-d9219e9d","guard":[["hasAny",["among","chicken","fruit","grape","one","salmon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among salmon, grape or chicken, which one is a fruit":"grape is a fruit."}}},
{"id":"n-da37b39d","guard":[["hasAny",["cheese","fruit","pick","salt","ugli"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from ugli fruit, salt or cheese":"ugli fruit is a fruit."}}},
{"id":"n-dae0901f","guard":[["hasAny",["apple","fruit","pick","salt","turnip"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from apple, salt or turnip":"apple is a fruit."}}},
{"id":"n-ddf73f3b","guard":[["has","watermelon"],["has","among"]],"pyramid":["render.template",{"lit":["watermelon is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-de4fed4c","guard":[["hasAny",["fruit","onion","raisin","spinach"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: spinach, raisin or onion":"raisin is a fruit."}}},
{"id":"n-e0016359","guard":[["hasAny",["butter","fruit","mangosteen","milk","pick","purple"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from purple mangosteen, milk or butter":"purple mangosteen is a fruit."}}},
{"id":"n-e113e995","guard":[["hasAny",["among","chicken","fruit","kumquat","one","salt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among chicken, salt or kumquat, which one is a fruit":"kumquat is a fruit."}}},
{"id":"n-e12845da","guard":[["hasAny",["carrot","cherry","fruit","parsnip"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: carrot, parsnip or cherry":"cherry is a fruit."}}},
{"id":"n-e234f61f","guard":[["hasAny",["berry","fruit","goji","leek","turnip"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: goji berry, leek or turnip":"goji berry is a fruit."}}},
{"id":"n-e4ffe2f0","guard":[["hasAny",["among","eggplant","fruit","mushroom","one","potato","sweet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among eggplant, mushroom or sweet potato, which one is a fruit":"eggplant is a fruit."}}},
{"id":"n-e551b40c","guard":[["hasAny",["artichoke","fruit","parsnip","pick","pineapple"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from parsnip, artichoke or pineapple":"pineapple is a fruit."}}},
{"id":"n-e6662399","guard":[["hasAny",["butter","fruit","nectarine","onion","pick"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from nectarine, onion or butter":"nectarine is a fruit."}}},
{"id":"n-e6a89c40","guard":[["hasAny",["artichoke","fruit","mushroom","olive"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a fruit: mushroom, olive or artichoke":"olive is a fruit."}}},
{"id":"n-e8db57e0","guard":[["hasAny",["lettuce","passionfruit"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among passionfruit, cheese or lettuce, which one is a fruit":"passionfruit is a fruit."}}},
{"id":"n-e960e0ba","guard":[["hasAny",["among","damson","fruit","kale","leek","one"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among damson, leek or kale, which one is a fruit":"damson is a fruit."}}},
{"id":"n-eade05ca","guard":[["has","rambutan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from salmon, sweet potato or rambutan":"rambutan is a fruit."}}},
{"id":"n-ee066361","guard":[["hasAny",["breadfruit","fruit","lettuce","pick","potato"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from lettuce, potato or breadfruit":"breadfruit is a fruit."}}},
{"id":"n-f0322261","guard":[["hasAny",["dragonfruit","pick"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a fruit from cauliflower, milk or dragonfruit":"dragonfruit is a fruit."}}},
{"id":"n-f76b2f4d","guard":[["hasAny",["among","bread","cloudberry","fruit","one","spinach"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among spinach, cloudberry or bread, which one is a fruit":"cloudberry is a fruit."}}},
{"id":"n-f968d327","guard":[["hasAny",["butter","cabbage","cucumber","fruit"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: cabbage, butter or cucumber":"cucumber is a fruit."}}},
{"id":"n-fa1cf4b7","guard":[["has","kumquat"]],"pyramid":["render.template",{"lit":["kumquat is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-fc581bc1","guard":[["hasAny",["cabbage","fruit","ginger","raspberry"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: raspberry, ginger or cabbage":"raspberry is a fruit."}}},
{"id":"n-fcef2c82","guard":[["hasAny",["banana","beet","cabbage","fruit","pick"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a fruit from beet, banana or cabbage":"banana is a fruit."}}},
{"id":"n-fd4ba8b7","guard":[["has","kumquat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among chicken, salt or kumquat, which one is a fruit":"kumquat is a fruit."}}},
{"id":"n-fd72a257","guard":[["hasAny",["artichoke","fruit","mushroom","olive"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a fruit: mushroom, olive or artichoke":"olive is a fruit."}}},
{"id":"n-fe0f42aa","guard":[["has","grape"]],"pyramid":["render.template",{"lit":["grape is a ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-00ce9c15","guard":[["hasAny",["guava","item number","nth","position"]]],"pyramid":["render.template",{"lit":["guava is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-093ef83b","guard":[["hasAny",["item number","lychee","nth","position"]]],"pyramid":["render.template",{"lit":["lychee is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-09a643cd","guard":[["hasAny",["cherry","copies","how many vowels","number of vowels","say it times","vowel count"]]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-0f12168c","guard":[["hasAny",["item number","nth","position","redcurrant"]],["has","which"]],"pyramid":["render.template",{"lit":["redcurrant is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-15e911e4","guard":[["hasAny",["delete","orange","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"orange"},["sense.after",{"lit":"fruit"}]]],"mem":null},
{"id":"n-18049db6","guard":[["hasAny",["dragonfruit","item number","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":["dragonfruit is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-18c5d82e","guard":[["hasAny",["feijoa","item number","nth","position"]]],"pyramid":["render.template",{"lit":["feijoa is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1916f6c0","guard":[["hasAny",["normalise","normalize","rambutan","root of","simplify the text","sqrt","square root"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["compute.sqrt",["sense.wordCount"]]]],"mem":null},
{"id":"n-1b937adf","guard":[["hasAny",["blueberry","item number","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":["blueberry is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2d294368","guard":[["hasAny",["item number","nth","olive","position"]],["has","which"]],"pyramid":["render.template",{"lit":["olive is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-2ebddf6d","guard":[["hasAny",["character count","grapefruit","how many characters","item number","length","nth","number of characters","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.chars",["sense.subject"]]]],"mem":null},
{"id":"n-340565c4","guard":[["hasAny",["nut","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"]],"mem":null},
{"id":"n-3697062a","guard":[["hasAny",["cherimoya","item number","nth","position"]]],"pyramid":["render.template",{"lit":["cherimoya is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-37c53d70","guard":[["hasAny",["cherry","how many vowels","number of vowels","vowel count"]]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-3df8c733","guard":[["has","canary"],["has","among"]],"pyramid":["render.template",{"lit":["canary ",{"slot":0}," is a ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-3e0781f2","guard":[["hasAny",["item number","nectarine","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":["nectarine is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-40c99465","guard":[["has","rock"],["has","among"]],"pyramid":["render.template",{"lit":["rock ",{"slot":0}," is a ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-4af27307","guard":[["hasAny",["grapefruit","item number","nth","position"]]],"pyramid":["render.template",{"lit":["grapefruit is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-515d9c8e","guard":[["hasAny",["currant","item number","nth","position"]]],"pyramid":["render.template",{"lit":["currant is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-5254bd28","guard":[["hasAny",["character count","grapefruit","how many characters","item number","length","nth","number of characters","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-53511dcc","guard":[["hasAny",["item number","nth","position","tangerine"]],["has","pick"]],"pyramid":["render.template",{"lit":["tangerine is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-553956fa","guard":[["hasAny",["item number","nth","pineapple","position"]]],"pyramid":["render.template",{"lit":["pineapple is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-583dcb59","guard":[["hasAny",["divisor count","how many divisors","how many factors","normalise","normalize","number of divisors","rambutan","simplify the text"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-5937eb2c","guard":[["hasAny",["item number","nth","position","raspberry"]],["has","which"]],"pyramid":["render.template",{"lit":["raspberry is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-5ec38be1","guard":[["hasAny",["item number","nth","persimmon","position"]]],"pyramid":["render.template",{"lit":["persimmon is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-60f4b578","guard":[["hasAny",["breadfruit","item number","nth","position"]]],"pyramid":["render.template",{"lit":["breadfruit is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-651deeeb","guard":[["hasAny",["first n","plum","shortest","shortest one","shortest word","take"]],["has","of"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-657de10e","guard":[["hasAny",["cherry","item number","nth","position"]]],"pyramid":["render.template",{"lit":["cherry is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-6879aac4","guard":[["hasAny",["apple","item number","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":["apple is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-81fd2d65","guard":[["hasAny",["cucumber","item number","nth","position"]]],"pyramid":["render.template",{"lit":["cucumber is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-839c154a","guard":[["hasAny",["item number","loquat","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["loquat is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-875fbeb6","guard":[["hasAny",["item number","nth","pomelo","position"]]],"pyramid":["render.template",{"lit":["pomelo is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-940cdf15","guard":[["hasAny",["cauliflower","divisor count","element","how many divisors","how many factors","item number","nth","number of divisors","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-99149d7d","guard":[["hasAny",["blackcurrant","item number","nth","position"]]],"pyramid":["render.template",{"lit":["blackcurrant is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9b23cbcd","guard":[["hasAny",["item number","nth","position","rambutan"]]],"pyramid":["render.template",{"lit":["rambutan is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a6e77234","guard":[["hasAny",["item number","mango","nth","position"]],["has","these"]],"pyramid":["render.template",{"lit":["mango is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-b35617be","guard":[["hasAny",["first n","plum","shortest","shortest one","shortest word","take"]],["has","of"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-b8b3a7aa","guard":[["hasAny",["cantaloupe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["cantaloupe is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-b9e62a55","guard":[["hasAny",["divisor count","how many divisors","how many factors","normalise","normalize","number of divisors","rambutan","simplify the text"]]],"pyramid":["render.str",["transform.norm",["sense.subject"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-bbdd877c","guard":[["hasAny",["currant","each word","element","item number","nth","position","split into words"]]],"pyramid":["render.str",["transform.nthStr",["transform.words",["sense.subject"]],{"lit":3}]],"mem":null},
{"id":"n-bd5eaf86","guard":[["hasAny",["apricot","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["apricot is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-bf1b9e84","guard":[["hasAny",["item number","nth","plum","position"]],["has","of"]],"pyramid":["render.template",{"lit":["plum is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-cef8d668","guard":[["hasAny",["nut","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["sense.subject"]],"mem":null},
{"id":"n-d16da1e6","guard":[["hasAny",["cherry","how many vowels","number of vowels","vowel count"]]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-d4ebfd46","guard":[["hasAny",["blackcurrant","item number","nth","position","root of","sqrt","square root"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["compute.sqrt",["sense.wordCount"]]]],"mem":null},
{"id":"n-d511a5ed","guard":[["hasAny",["bread","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"orange"},["sense.after",{"lit":"from"}]]],"mem":null},
{"id":"n-d527e0d4","guard":[["hasAny",["item number","nth","position","raisin"]]],"pyramid":["render.template",{"lit":["raisin is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-d56873d4","guard":[["hasAny",["blackberry","item number","nth","position"]]],"pyramid":["render.template",{"lit":["blackberry is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-d9b0fd99","guard":[["hasAny",["item number","jambul","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["jambul is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-e103c7d0","guard":[["hasAny",["banana","item number","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":["banana is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e6689b92","guard":[["hasAny",["elderberry","item number","nth","position"]]],"pyramid":["render.template",{"lit":["elderberry is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-e7101415","guard":[["hasAny",["cherry","how many vowels","number of vowels","vowel count"]]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-e92c5d2c","guard":[["hasAny",["huckleberry","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["huckleberry is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-ef967d46","guard":[["has","blood"],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," orange is a ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-f5248e10","guard":[["hasAny",["avocado","item number","nth","position"]]],"pyramid":["render.template",{"lit":["avocado is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-f54806b7","guard":[["hasAny",["durian","item number","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":["durian is a ",{"slot":0},"."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-0b491194","guard":[["hasAny",["invert case","nut","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-35a276eb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nut","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-413de62e","guard":[["hasAny",["item number","kiwi","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," fruit is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-520a0859","guard":[["hasAny",["blood","item number","nth","position"]]],"pyramid":["render.template",{"lit":["blood ",{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-6c4da58f","guard":[["hasAny",["item number","kiwi","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":["kiwi ",{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.lastWord"]],"mem":null},
{"id":"n-9a378a63","guard":[["hasAny",["invert case","nut","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-dc460857","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nut","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-f630151c","guard":[["hasAny",["nut","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-05a5c528","guard":[["hasAny",["item number","kiwi","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-2c2787a3","guard":[["hasAny",["item number","kiwi","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.subject"],["sense.lastWord"]],"mem":null},
{"id":"n-37ed4c84","guard":[["hasAny",["item number","longest","longest one","longest word","mangosteen","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a fruit."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-413fbe75","guard":[["hasAny",["item number","nth","position","ugli"]],["has","pick"]],"pyramid":["render.template",{"lit":["ugli ",{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-5f67248a","guard":[["hasAny",["each word","nut","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-69cf0983","guard":[["hasAny",["item number","nth","plum","position","shortest","shortest one","shortest word"]],["has","of"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-75bbf2ac","guard":[["hasAny",["item number","longest","longest one","longest word","mangosteen","nth","position"]]],"pyramid":["render.template",{"lit":["purple ",{"slot":0}," is a ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b47e8283","guard":[["hasAny",["item number","nth","position","star"]],["has","pick"]],"pyramid":["render.template",{"lit":["star ",{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-d2328f02","guard":[["hasAny",["blood","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a fruit."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e16a313e","guard":[["hasAny",["each word","nut","shortest","shortest one","shortest word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-01c640f3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","kiwi","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-25b51b42","guard":[["hasAny",["item number","kiwi","nth","position","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.reverseWords",["sense.subject"]],["sense.lastWord"]],"mem":null},
{"id":"n-275d5643","guard":[["hasAny",["goji","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["goji ",{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-2faed0c9","guard":[["hasAny",["item number","kiwi","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a fruit."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-509f5d13","guard":[["hasAny",["blood","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-550078d6","guard":[["hasAny",["item number","kiwi","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-6c09e412","guard":[["hasAny",["goji","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," berry is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-7706de6f","guard":[["hasAny",["chili","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," pepper is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-96444ad6","guard":[["hasAny",["item number","nth","position","salal"]]],"pyramid":["render.template",{"lit":[{"slot":0}," berry is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a8981d41","guard":[["hasAny",["item number","nth","position","salal"]]],"pyramid":["render.template",{"lit":["salal ",{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-c3c95cb9","guard":[["hasAny",["item number","mangosteen","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," mangosteen is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-de323e8c","guard":[["hasAny",["chili","item number","nth","position"]]],"pyramid":["render.template",{"lit":["chili ",{"slot":0}," is a ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-e54a2a72","guard":[["hasAny",["invert case","item number","kiwi","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]],["sense.lastWord"]],"mem":null},
{"id":"n-fef1147a","guard":[["hasAny",["blood","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.subject"]],"mem":null},
{"id":"n-3d7fce91","guard":[["hasAny",["each word","item number","kiwi","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-48c68ee1","guard":[["hasAny",["blood","item number","nth","position","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-49c8472c","guard":[["hasAny",["blood","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5270ce3e","guard":[["hasAny",["blood","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-61845c5f","guard":[["hasAny",["blood","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-63c37282","guard":[["hasAny",["item number","kiwi","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.subject"]],"mem":null},
{"id":"n-6a7cadd0","guard":[["hasAny",["each word","item number","kiwi","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.lastWord"]]],["sense.lastWord"]],"mem":null},
{"id":"n-7738a171","guard":[["hasAny",["blood","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-93c65978","guard":[["hasAny",["blood","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c99b71d2","guard":[["hasAny",["item number","kiwi","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.lastWord"]],"mem":null},
{"id":"n-d5de6d44","guard":[["hasAny",["blood","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-d8106c6a","guard":[["hasAny",["item number","longest","longest one","longest word","mangosteen","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-fd41423f","guard":[["hasAny",["blood","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.title",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-1b3d067c","guard":[["hasAny",["item number","kiwi","nth","position","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-20e03352","guard":[["hasAny",["invert case","item number","kiwi","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-297ca1bb","guard":[["hasAny",["item number","longest","longest one","longest word","mangosteen","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2f0c4de2","guard":[["hasAny",["blood","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-68ce350d","guard":[["hasAny",["invert case","item number","longest","longest one","longest word","mangosteen","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-743574fc","guard":[["hasAny",["item number","kiwi","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}],["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-7c436371","guard":[["hasAny",["item number","longest","longest one","longest word","mangosteen","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-94396c82","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","longest","longest one","longest word","mangosteen","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-9c272718","guard":[["hasAny",["blood","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-b0d384cb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","kiwi","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d398765f","guard":[["hasAny",["blood","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d665468b","guard":[["hasAny",["blood","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-d87b7594","guard":[["hasAny",["goji","item number","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-3251e821","guard":[["hasAny",["item number","kiwi","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8d471155","guard":[["hasAny",["each word","item number","kiwi","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9a0d49ce","guard":[["hasAny",["each word","item number","longest","longest one","longest word","mangosteen","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-a9fdcc17","guard":[["hasAny",["each word","item number","kiwi","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ea1a8b92","guard":[["hasAny",["each word","item number","longest","longest one","longest word","mangosteen","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is a ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"among pomegranate, sweet potato or salt, which one is a fruit","expect":{"contains":["pomegranate"],"notContains":["salt","sweet potato"],"notRefusal":true}},{"q":"among damson, leek or kale, which one is a fruit","expect":{"contains":["damson"],"notContains":["leek","kale"],"notRefusal":true}},{"q":"among eggplant, mushroom or sweet potato, which one is a fruit","expect":{"contains":["eggplant"],"notContains":["sweet potato","mushroom"],"notRefusal":true}},{"q":"pick a fruit from nectarine, onion or butter","expect":{"contains":["nectarine"],"notContains":["onion","butter"],"notRefusal":true}},{"q":"which of these is a fruit: brussels sprout, currant or cauliflower","expect":{"contains":["currant"],"notContains":["brussels sprout","cauliflower"],"notRefusal":true}},{"q":"pick a fruit from apple, salt or turnip","expect":{"contains":["apple"],"notContains":["turnip","salt"],"notRefusal":true}},{"q":"pick a fruit from chicken, potato or blueberry","expect":{"contains":["blueberry"],"notContains":["potato","chicken"],"notRefusal":true}},{"q":"pick a fruit from tangerine, lettuce or carrot","expect":{"contains":["tangerine"],"notContains":["lettuce","carrot"],"notRefusal":true}},{"q":"among radish, egg or bilberry, which one is a fruit","expect":{"contains":["bilberry"],"notContains":["radish","egg"],"notRefusal":true}},{"q":"among strawberry, cabbage or artichoke, which one is a fruit","expect":{"contains":["strawberry"],"notContains":["cabbage","artichoke"],"notRefusal":true}},{"q":"among salmon, grape or chicken, which one is a fruit","expect":{"contains":["grape"],"notContains":["salmon","chicken"],"notRefusal":true}},{"q":"which of these is a fruit: cabbage, butter or cucumber","expect":{"contains":["cucumber"],"notContains":["cabbage","butter"],"notRefusal":true}},{"q":"which of these is a fruit: spinach, raisin or onion","expect":{"contains":["raisin"],"notContains":["spinach","onion"],"notRefusal":true}},{"q":"pick a fruit from sweet potato, durian or salmon","expect":{"contains":["durian"],"notContains":["sweet potato","salmon"],"notRefusal":true}},{"q":"among mulberry, bread or spinach, which one is a fruit","expect":{"contains":["mulberry"],"notContains":["spinach","bread"],"notRefusal":true}},{"q":"which of these is a fruit: carrot, parsnip or cherry","expect":{"contains":["cherry"],"notContains":["parsnip","carrot"],"notRefusal":true}},{"q":"among canary melon, leek or broccoli, which one is a fruit","expect":{"contains":["canary melon"],"notContains":["leek","broccoli"],"notRefusal":true}},{"q":"which of these is a fruit: huckleberry, broccoli or sugar","expect":{"contains":["huckleberry"],"notContains":["broccoli","sugar"],"notRefusal":true}},{"q":"which of these is a fruit: garlic, mushroom or avocado","expect":{"contains":["avocado"],"notContains":["garlic","mushroom"],"notRefusal":true}},{"q":"which of these is a fruit: loquat, bread or ginger","expect":{"contains":["loquat"],"notContains":["bread","ginger"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
